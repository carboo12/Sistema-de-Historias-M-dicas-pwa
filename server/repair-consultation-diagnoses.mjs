/** Idempotently fills ConsultationDiagnosis from legacy diag_hist and consultation.concdiag. */
import './env.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';
import { GoogleAuth } from 'google-auth-library';

const dump=readFileSync(resolve(process.cwd(),process.env.LEGACY_SQL_FILE||'DATARESPALDO 20261102 1219.sql'),'utf8');
const clean=v=>v==null?null:(String(v).trim()||null);
const date=v=>{const s=clean(v);return !s||s.startsWith('0000-00-00')?null:s.slice(0,10);};
const uuid=v=>{const h=createHash('md5').update(v).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20,32)}`;};
function* rows(table){
  const re=new RegExp('INSERT INTO `'+table+'` \\(([^)]*)\\) VALUES\\s*([\\s\\S]*?);','g');let m;
  while((m=re.exec(dump))){const cols=[...m[1].matchAll(/`([^`]+)`/g)].map(x=>x[1]),s=m[2];let i=0;
    while(i<s.length){while(i<s.length&&!s.startsWith('(',i))i++;if(i>=s.length)break;i++;let vals=[],token='',quoted=false,done=false;
      while(i<s.length){const c=s[i++];if(quoted){if(c==='\\'&&i<s.length){const n=s[i++];token+=({n:'\n',r:'\r',t:'\t',b:'\b',0:'\0'}[n]??n);}else if(c==="'"){if(s[i]==="'"){token+="'";i++;}else quoted=false;}else token+=c;}else if(c==="'")quoted=true;else if(c===','||c===')'){const x=token.trim();vals.push(x.toUpperCase()==='NULL'?null:x);token='';if(c===')'){done=true;break;}}else token+=c;}
      if(done)yield Object.fromEntries(cols.map((c,j)=>[c,vals[j]??null]));
    }
  }
}
const diagnoses=[...rows('diag_hist')];
const appointmentNames=new Map();
for(const x of rows('citas'))if(clean(x.historia)&&clean(x.paciente)&&!appointmentNames.has(clean(x.historia)))appointmentNames.set(clean(x.historia),clean(x.paciente));
const consultRows=[...rows('consulta'),...rows('consultamv')];
const svc=JSON.parse(readFileSync(resolve(process.cwd(),process.env.FIREBASE_SERVICE_ACCOUNT||'servicekey.json'),'utf8'));
const connector=new Connector({auth:new GoogleAuth({credentials:svc,scopes:['https://www.googleapis.com/auth/cloud-platform']})});
const options=await connector.getOptions({instanceConnectionName:`${svc.project_id}:us-east4:${process.env.CLOUD_SQL_INSTANCE||'studio-9955473018-e374d-service-fdc'}`,authType:'IAM',ipType:'PUBLIC'});
const pool=new pg.Pool({...options,user:svc.client_email.replace(/\.gserviceaccount\.com$/,''),database:process.env.CLOUD_SQL_DATABASE||'fdcdb',max:1,connectionTimeoutMillis:60000});
try{
 const clinic=(await pool.query("select id from public.clinics where code='LEGACY'")).rows[0];
 if(!clinic)throw new Error('No existe la clínica LEGACY; verifica la instancia y la migración previa.');
 const cl=clinic.id;
 const patientMap=new Map((await pool.query('select id,record_number from public.patients where clinic_id=$1',[cl])).rows.map(r=>[r.record_number,r.id]));
 const consultationMap=new Map((await pool.query('select id,legacy_id,patient_id,consulted_at from public.consultations where clinic_id=$1',[cl])).rows.map(r=>[r.legacy_id,r]));
 const user=(await pool.query('select id from public.users where clinic_id=$1 and firebase_uid is not null order by created_at limit 1',[cl])).rows[0];
 const prof=(await pool.query('select id from public.professionals where clinic_id=$1 and employee_code=$2',[cl,'LEGACY-ADMIN'])).rows[0];
 if(!prof)throw new Error('No existe el profesional asociado para auditar los diagnósticos.');
 let explicitInserted=0,consultInserted=0,unmatched=0,placeholderPatients=0;
 await pool.query('begin');
 try{
  for(const x of diagnoses){const record=clean(x.historia);if(!record||patientMap.has(record))continue;const name=appointmentNames.get(record);if(!name){unmatched++;continue;}const patientId=uuid('patient:'+record);await pool.query(`insert into public.patients(id,clinic_id,record_number,document_type,document_verified,full_name,first_name,last_name,birth_date_estimated,deceased,sex,marital_status,is_private,is_suspended,created_by_id,metadata,created_at,updated_at) values($1,$2,$3,'sin_documento',false,$4,$5,$6,false,false,'U','desconocido',true,false,$7,$8::jsonb,now(),now()) on conflict(id) do nothing`,[patientId,cl,record,name,name,null,user?.id||null,JSON.stringify({legacyPlaceholder:true,source:'diag_hist + citas',note:'Perfil mínimo creado para conservar una relación diagnóstica heredada; completar datos personales.'})]);patientMap.set(record,patientId);placeholderPatients++;}
  for(let i=0;i<diagnoses.length;i++){
   const x=diagnoses[i],p=patientMap.get(clean(x.historia)),text=clean(x.descrip);if(!p||!text){unmatched++;continue;}
   const d=date(x.fecha),raw=clean(x.codigo),cie=raw?.replace(/\s+/g,'');
   let c=null;if(d){const found=[...consultationMap.values()].find(z=>z.patient_id===p&&new Date(z.consulted_at).toISOString().slice(0,10)===d);if(found)c=found.id;}
   const legacyId=`diag_hist-${i}`;
   await pool.query(`insert into public.consultation_diagnoses(id,clinic_id,patient_id,consultation_id,professional_id,code_system,cie10_code,diagnosis_text,diagnosis_type,notes,diagnosed_at,legacy_id,created_by_id,created_at,updated_at) values($1,$2,$3,$4,$5,'LEGACY',case when exists(select 1 from public.cie10_codes where code=$6) then $6 else null end,$7,'principal',$8,coalesce($9::date,now()),$10,$11,now(),now()) on conflict(id) do update set consultation_id=excluded.consultation_id,cie10_code=excluded.cie10_code,diagnosis_text=excluded.diagnosis_text,notes=excluded.notes,diagnosed_at=excluded.diagnosed_at,updated_at=now()`,[uuid(legacyId),cl,p,c,prof.id,cie,text,clean(x.notas),d,legacyId,user?.id||null]);explicitInserted++;
  }
  for(let i=0;i<consultRows.length;i++){
   const x=consultRows[i],legacyConsult=`consulta-${i}`,c=consultationMap.get(legacyConsult),text=clean(x.concdiag);if(!text)continue;
   if(!c){unmatched++;continue;}
   const legacyId=`diagnosis-${legacyConsult}`;
   await pool.query(`insert into public.consultation_diagnoses(id,clinic_id,patient_id,consultation_id,professional_id,code_system,diagnosis_text,diagnosis_type,diagnosed_at,legacy_id,created_by_id,created_at,updated_at) values($1,$2,$3,$4,$5,'LEGACY',$6,'principal',$7,$8,$9,now(),now()) on conflict(id) do update set diagnosis_text=excluded.diagnosis_text,diagnosed_at=excluded.diagnosed_at,updated_at=now()`,[uuid(legacyId),cl,c.patient_id,c.id,prof.id,text,c.consulted_at,legacyId,user?.id||null]);consultInserted++;
  }
  await pool.query('commit');
 }catch(e){await pool.query('rollback');throw e;}
 const final=(await pool.query('select count(*)::int as total, count(*) filter(where consultation_id is not null)::int as linked_consultations from public.consultation_diagnoses where clinic_id=$1',[cl])).rows[0];
 console.log(JSON.stringify({sourceDiagHist:diagnoses.length,sourceConsultations:consultRows.length,placeholderPatientsCreated:placeholderPatients,explicitDiagnosesProcessed:explicitInserted,consultationDiagnosesProcessed:consultInserted,unmatchedRows:unmatched,finalDiagnosisRows:final.total,linkedToConsultation:final.linked_consultations},null,2));
}finally{await pool.end();connector.close();}
