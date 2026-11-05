/** Idempotently restores legacy consultation reasons and patient history rows. */
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
const sourceHistory=[...new Map([...rows('diag_hist')].filter(x=>clean(x.historia)&&clean(x.descrip)).map(x=>{const k=[x.historia,x.codigo,x.descrip,x.fecha,x.notas,x.medico].map(clean).join('|');return [k,x];})).values()];
const reasonRows=[...new Map([...rows('motivoconsultas')].filter(x=>clean(x.codigo)&&clean(x.nombre)).map(x=>[clean(x.codigo),x])).values()];
const svc=JSON.parse(readFileSync(resolve(process.cwd(),process.env.FIREBASE_SERVICE_ACCOUNT||'servicekey.json'),'utf8'));
const connector=new Connector({auth:new GoogleAuth({credentials:svc,scopes:['https://www.googleapis.com/auth/cloud-platform']})});
const options=await connector.getOptions({instanceConnectionName:`${svc.project_id}:us-east4:${process.env.CLOUD_SQL_INSTANCE||'studio-9955473018-e374d-service-fdc'}`,authType:'IAM',ipType:'PUBLIC'});
const pool=new pg.Pool({...options,user:svc.client_email.replace(/\.gserviceaccount\.com$/,''),database:process.env.CLOUD_SQL_DATABASE||'fdcdb',max:1,connectionTimeoutMillis:60000});
try{
 const clinic=(await pool.query("select id from public.clinics where code='LEGACY'")).rows[0];if(!clinic)throw new Error('No existe la clínica LEGACY.');const cl=clinic.id;
 const patients=new Map((await pool.query('select id,record_number from public.patients where clinic_id=$1',[cl])).rows.map(r=>[r.record_number,r.id]));
 const user=(await pool.query('select id from public.users where clinic_id=$1 and firebase_uid is not null order by created_at limit 1',[cl])).rows[0];
 let histories=0,reasons=0,unmatched=0;
 await pool.query('begin');try{
  for(const x of reasonRows){const code=clean(x.codigo),name=clean(x.nombre);await pool.query(`insert into public.consultation_reasons(id,clinic_id,code,name,is_active,created_at,updated_at) values($1,$2,$3,$4,true,now(),now()) on conflict(id) do update set code=excluded.code,name=excluded.name,is_active=true,updated_at=now()`,[uuid('consultation-reason:'+code),cl,code,name]);reasons++;}
  for(const x of sourceHistory){const patient=patients.get(clean(x.historia));if(!patient){unmatched++;continue;}const rawCode=clean(x.codigo),text=clean(x.descrip),legacyId='history:'+createHash('sha256').update([x.historia,x.codigo,x.descrip,x.fecha,x.notas,x.medico].map(clean).join('|')).digest('hex');
   await pool.query(`insert into public.patient_history(id,patient_id,category,description,details,is_active,recorded_at,recorded_by_id,created_at,updated_at) values($1,$2,'otro',$3,$4::jsonb,true,coalesce($5::date,now()),$6,now(),now()) on conflict(id) do update set description=excluded.description,details=excluded.details,recorded_at=excluded.recorded_at,recorded_by_id=excluded.recorded_by_id,updated_at=now()`,[uuid(legacyId),patient,text,JSON.stringify({legacyId,legacyCode:rawCode,notes:clean(x.notas),professionalCode:clean(x.medico),sourceTable:'diag_hist'}),date(x.fecha),user?.id||null]);histories++;
  }
  await pool.query('commit');
 }catch(e){await pool.query('rollback');throw e;}
 const counts=(await pool.query(`select (select count(*)::int from public.consultation_reasons where clinic_id=$1) as consultation_reasons,(select count(*)::int from public.patient_history h join public.patients p on p.id=h.patient_id where p.clinic_id=$1) as patient_history,(select count(*)::int from public.consultation_diagnoses where clinic_id=$1) as consultation_diagnoses`,[cl])).rows[0];
 console.log(JSON.stringify({sourceReasonCodes:reasonRows.length,sourceHistoryRows:[...rows('diag_hist')].length,uniqueHistoryRows:sourceHistory.length,consultationReasonsUpserted:reasons,patientHistoryUpserted:histories,unmatchedHistoryRows:unmatched,finalCounts:counts},null,2));
}finally{await pool.end();connector.close();}
