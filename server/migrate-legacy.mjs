/**
 * Importa el respaldo MySQL al PostgreSQL que sirve Firebase Data Connect.
 * Requiere DATABASE_URL, ADMIN_EMAIL y ADMIN_PASSWORD (solo para crear Auth).
 * No importa hashes ni credenciales antiguas. Modo de revisión: --dry-run.
 */
import './env.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';
import { Connector } from '@google-cloud/cloud-sql-connector';
import { GoogleAuth } from 'google-auth-library';

const dumpPath = resolve(process.cwd(), process.env.LEGACY_SQL_FILE || 'DATARESPALDO 20261102 1219.sql');
const dryRun = process.argv.includes('--dry-run');
const dump = readFileSync(dumpPath, 'utf8');

// Lee exclusivamente INSERTs del dump con parser de literales SQL, nunca ejecuta el dump.
function readInserts(table) {
  const out = [];
  const re = new RegExp('INSERT INTO `' + table + '` \\(([^)]*)\\) VALUES\\s*([\\s\\S]*?);', 'g');
  let m;
  while ((m = re.exec(dump))) {
    const columns = [...m[1].matchAll(/`([^`]+)`/g)].map(x => x[1]);
    const s = m[2]; let i = 0;
    while (i < s.length) {
      while (i < s.length && !s.startsWith('(', i)) i++;
      if (i >= s.length) break;
      i++; const values = []; let token = '', quoted = false, ended = false;
      while (i < s.length) {
        const c = s[i++];
        if (quoted) {
          if (c === '\\' && i < s.length) { const n=s[i++]; token += ({n:'\n',r:'\r',t:'\t',b:'\b',0:'\0'}[n] ?? n); }
          else if (c === "'") { if (s[i] === "'") { token += "'"; i++; } else quoted = false; }
          else token += c;
        } else if (c === "'") quoted = true;
        else if (c === ',' || c === ')') {
          const raw=token.trim(); values.push(raw.toUpperCase()==='NULL' ? null : raw);
          token=''; if (c === ')') { ended=true; break; }
        } else token += c;
      }
      if (!ended) break;
      const row=Object.fromEntries(columns.map((c,j)=>[c,values[j] ?? null]));
      out.push(row);
    }
  }
  return out;
}
function* iterateInsertValues(table, statementIndex=0) {
  const re=new RegExp('INSERT INTO `' + table + '` \\(([^)]*)\\) VALUES\\s*([\\s\\S]*?);','g');
  let match,index=0;
  while((match=re.exec(dump))){
    if(index++<statementIndex) continue;
    const columns=[...match[1].matchAll(/`([^`]+)`/g)].map(x=>x[1]),s=match[2];let i=0;
    while(i<s.length){while(i<s.length&&!s.startsWith('(',i))i++;if(i>=s.length)break;i++;const values=[];let token='',quoted=false,ended=false;
      while(i<s.length){const c=s[i++];if(quoted){if(c==='\\'&&i<s.length){const n=s[i++];token+=({n:'\n',r:'\r',t:'\t',b:'\b',0:'\0'}[n]??n);}else if(c==="'"){if(s[i]==="'"){token+="'";i++;}else quoted=false;}else token+=c;}else if(c==="'")quoted=true;else if(c===','||c===')'){const raw=token.trim();values.push(raw.toUpperCase()==='NULL'?null:raw);token='';if(c===')'){ended=true;break;}}else token+=c;}
      if(!ended)break;yield Object.fromEntries(columns.map((c,j)=>[c,values[j]??null]));
    }
  }
}
function* iterateInsertRows(table) {
  const re=new RegExp('INSERT INTO `' + table + '` \\(([^)]*)\\) VALUES\\s*([\\s\\S]*?);','g');let match;
  while((match=re.exec(dump))){const columns=[...match[1].matchAll(/`([^`]+)`/g)].map(x=>x[1]),s=match[2];let i=0;
    while(i<s.length){while(i<s.length&&!s.startsWith('(',i))i++;if(i>=s.length)break;i++;const values=[];let token='',quoted=false,ended=false;
      while(i<s.length){const c=s[i++];if(quoted){if(c==='\\'&&i<s.length){const n=s[i++];token+=({n:'\n',r:'\r',t:'\t',b:'\b',0:'\0'}[n]??n);}else if(c==="'"){if(s[i]==="'"){token+="'";i++;}else quoted=false;}else token+=c;}else if(c==="'")quoted=true;else if(c===','||c===')'){const raw=token.trim();values.push(raw.toUpperCase()==='NULL'?null:raw);token='';if(c===')'){ended=true;break;}}else token+=c;}
      if(!ended)break;yield Object.fromEntries(columns.map((c,j)=>[c,values[j]??null]));
    }
  }
}
const clean = v => { if (v == null) return null; const x=String(v).trim(); return x || null; };
const date = v => { const x=clean(v); return !x || x.startsWith('0000-00-00') ? null : x.slice(0,10); };
const truth = v => ['1','true','si','sí'].includes(String(v ?? '').trim().toLowerCase());
const json = v => JSON.stringify(v ?? {});
const stableUuid = value => { const h=createHash('md5').update(value).digest('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20,32)}`; };
const id = stableUuid;
const copyCsv = async (client, table, columns, rows) => {
  const stream=client.query(copyFrom(`COPY public.${table} (${columns.join(',')}) FROM STDIN WITH (FORMAT csv, NULL '\\N')`));
  async function* csvRows(){ for(const row of rows){yield Buffer.from(row.map(value=>{if(value===null||value===undefined)return '\\N';if(typeof value==='object')value=JSON.stringify(value);return '"'+String(value).replaceAll('"','""')+'"';}).join(',')+'\n');}}
  await pipeline(csvRows(),stream);
};
const splitName = v => { const p=(clean(v)||'').split(/\s+/); return [p.shift()||null,p.join(' ')||null]; };
const byBatches = async (rows, batchSize, callback) => {
  for(let start=0;start<rows.length;start+=batchSize) await callback(rows.slice(start,start+batchSize),start);
};
function timestamp(d, value) {
  const match=String(value||'').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  let hour=match?Number(match[1]):9, minute=match?Number(match[2]):0;
  if(match?.[3]) { const meridiem=match[3].toUpperCase(); hour=hour%12+(meridiem==='PM'?12:0); }
  if(hour>23||minute>59) {hour=9;minute=0;}
  const [year,month,day]=d.split('-').map(Number);
  // Managua permanece UTC-6; el dump no contiene zona horaria.
  return new Date(Date.UTC(year,month-1,day,hour+6,minute)).toISOString();
}
const patientRows=readInserts('pacientes'), appointmentRows=readInserts('citas');
const consultationRows=[...readInserts('consulta'),...readInserts('consultamv')];
const answerRows=[], diagRows=readInserts('diag_hist');
const answerStatementCount=[...dump.matchAll(/INSERT INTO `pac_cuest`/g)].length;
const answerCount=Number((dump.match(/INSERT INTO `pac_cuest`/g)||[]).length); // statement counts shown separately; dry-run count is computed by --count-anamnesis
const mobileDiagRows=readInserts('diag_histpmv'), cieRows=readInserts('diagoms'), recipeRows=readInserts('recipes'),
  specialtyRows=readInserts('especial'), officeRows=readInserts('consultorios'), anamnesisCatalog=readInserts('anamex');
const uniquePatientRows=[...new Map(patientRows.filter(x=>clean(x.historia)).map(x=>[clean(x.historia),x])).values()];
const counts={dump:{patientRows:patientRows.length,uniquePatients:uniquePatientRows.length,appointments:appointmentRows.length,consultations:consultationRows.length,anamnesisAnswers:answerCount,diagnosisRows:diagRows.length+mobileDiagRows.length,recipes:recipeRows.length,cie10:cieRows.length}};
console.log(`Respaldo: ${counts.dump.uniquePatients} historias de paciente únicas (${patientRows.length} filas), ${appointmentRows.length} citas, ${consultationRows.length} consultas, ${counts.dump.anamnesisAnswers} respuestas de anamnesis, ${counts.dump.diagnosisRows} diagnósticos y ${recipeRows.length} recetas.`);
if (dryRun) process.exit(0);
for (const name of ['ADMIN_EMAIL','ADMIN_PASSWORD']) if (!process.env[name]) throw new Error(`Configura ${name} para vincular el usuario de Firebase Authentication.`);
const { initializeApp, cert, getApps } = await import('firebase-admin/app');
const { getAuth } = await import('firebase-admin/auth');
let connector;
let pool;
if(process.env.DATABASE_URL) pool=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.PGSSLMODE==='require'?{rejectUnauthorized:false}:undefined,max:4});
else {
  const svc=JSON.parse(readFileSync(resolve(process.cwd(),process.env.FIREBASE_SERVICE_ACCOUNT||'servicekey.json'),'utf8'));
  const auth=new GoogleAuth({credentials:svc,scopes:['https://www.googleapis.com/auth/cloud-platform']});
  connector=new Connector({auth});
  const options=await connector.getOptions({instanceConnectionName:`${svc.project_id}:us-east4:${process.env.CLOUD_SQL_INSTANCE||'studio-9955473018-e374d-service-fdc'}`,authType:'IAM',ipType:'PUBLIC'});
  const dbUser=`${svc.client_email.replace(/\.gserviceaccount\.com$/,'')}`;
  pool=new pg.Pool({...options,user:dbUser,database:process.env.CLOUD_SQL_DATABASE||'fdcdb',max:1,connectionTimeoutMillis:60000,statement_timeout:0,idleTimeoutMillis:0});
}
let authUser;
try {
  const dbcheck=await pool.query("select current_database() db, current_schema() schema");
  console.log(`Conectado a PostgreSQL ${dbcheck.rows[0].db}/${dbcheck.rows[0].schema}.`);
  const svc=JSON.parse(readFileSync(resolve(process.cwd(),process.env.FIREBASE_SERVICE_ACCOUNT||'servicekey.json'),'utf8'));
  if (!getApps().length) initializeApp({credential:cert(svc)});
  const auth=getAuth();
  try { authUser=await auth.getUserByEmail(process.env.ADMIN_EMAIL); }
  catch(e) { if (e.code!=='auth/user-not-found') throw e; }
  if (!authUser) authUser=await auth.createUser({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD,displayName:process.env.ADMIN_NAME||'Administrador Médico',emailVerified:false,disabled:false});

  const client=await pool.connect();
  await client.query('begin');
  try {
    await client.query(`create table if not exists public.patient_anamnesis_answers (id uuid primary key default gen_random_uuid(),clinic_id uuid not null references public.clinics(id) on delete restrict,patient_id uuid not null references public.patients(id) on delete restrict,consultation_id uuid references public.consultations(id) on delete set null,specialty_code text,item_code text,prompt_snapshot text,answer text,details text,recorded_at timestamptz not null default now(),source text not null default 'web',legacy_id text,created_at timestamptz not null default now(),updated_at timestamptz not null default now())`);
    // Add natural-key indexes expected by the local SQL schema; the deployed
    // GraphQL schema creates primary keys but not these business-key indexes.
    console.log('Iniciando carga con IDs deterministas.');
    const clinic=(await client.query(`insert into public.clinics(id,code,name,timezone,currency,settings,is_active,created_at,updated_at) values($1,'LEGACY','Clínica','America/Managua','NIO','{}'::jsonb,true,now(),now()) on conflict(id) do update set code=excluded.code,name=excluded.name,updated_at=now() returning id`,[stableUuid('legacy-clinic')])).rows[0];
    const cl=clinic.id;
    const email=process.env.ADMIN_EMAIL, full=process.env.ADMIN_NAME||'Administrador Médico';
    const user=(await client.query(`insert into public.users(id,clinic_id,username,email,firebase_uid,full_name,role,permissions,is_active,must_change_password,created_at,updated_at) values($1,$2,$3,$4,$5,$6,'admin','{}'::jsonb,true,false,now(),now()) on conflict(id) do update set email=excluded.email,firebase_uid=excluded.firebase_uid,full_name=excluded.full_name,role='admin',is_active=true,must_change_password=false,updated_at=now() returning id`,[stableUuid('legacy-user:'+email.toLowerCase()),cl,email.toLowerCase(),email,authUser.uid,full])).rows[0];
    const cols=await client.query(`select column_name from information_schema.columns where table_schema='public' and table_name='users' and column_name='firebase_uid'`);
    if(!cols.rowCount) throw new Error('La base de Data Connect no tiene users.firebase_uid. Aplica primero db/007_firebase_auth.sql en el esquema PostgreSQL.');
    const professional=(await client.query(`insert into public.professionals(id,clinic_id,user_id,employee_code,full_name,email,is_active,metadata,created_at,updated_at) values($1,$2,$3,'LEGACY-ADMIN',$4,$5,true,'{}'::jsonb,now(),now()) on conflict(id) do update set user_id=excluded.user_id,full_name=excluded.full_name,email=excluded.email,updated_at=now() returning id`,[stableUuid('legacy-professional:'+cl),cl,user.id,full,email])).rows[0];
    console.log('Perfil administrador y profesional vinculados.');

    for (const x of specialtyRows) await client.query(`insert into public.specialties(id,clinic_id,code,name,is_active,created_at,updated_at) values($1,$2,$3,$4,true,now(),now()) on conflict(id) do update set name=excluded.name,updated_at=now()`,[stableUuid('specialty:'+clean(x.codigo)),cl,clean(x.codigo)||'OT',clean(x.nombre)||'Otra']);
    for (const x of officeRows) await client.query(`insert into public.offices(id,clinic_id,code,name,is_active,created_at,updated_at) values($1,$2,$3,$4,true,now(),now()) on conflict(id) do update set name=excluded.name,updated_at=now()`,[stableUuid('office:'+clean(x.codigo)),cl,clean(x.codigo)||'OT',clean(x.nombre)||'Otro']);
    // IDs de pacientes deterministas: repetición de la migración actualiza, no duplica.
    const patientCopyRows=[];
    for (const x of uniquePatientRows) {
      const record=clean(x.historia); if(!record) continue;
      const [first,last]=splitName(x.nombre);
      const sex=({'1':'M','2':'F','3':'X'})[clean(x.sexo)]||'U';
      const marital=({'0':'desconocido','1':'soltero','2':'casado','3':'union_libre','4':'divorciado','5':'viudo'})[clean(x.edocivil)]||'desconocido';
      patientCopyRows.push([stableUuid('patient:'+record),cl,record,clean(x.cedula)?'cedula':'sin_documento',clean(x.cedula),clean(x.nombre)||record,first,last,date(x.fec_nac),truth(x.fallecido),sex,marital,clean(x.sangre),clean(x.lugarnac),clean(x.estado),clean(x.pais),clean(x.dirhab),clean(x.telfhab),clean(x.email),clean(x.profesion),truth(x.particular),clean(x.rutafoto),clean(x.alergicoa),clean(x.diag),clean(x.represen),clean(x.cedrepresentante),clean(x.dirrepresentante),clean(x.telfrepresentante),clean(x.emailrepresentante),clean(x.religion),truth(x.suspendido),clean(x.motivosuspend),clean(x.nota),user.id,json({legacyReference:x.referencia,ageAtImport:x.edad,skinColor:x.color,race:x.raza,referral:x.refiere,habits:x.habitos,vaccines:x.vacunas,legacyInsurance:x.seguro}),new Date().toISOString(),new Date().toISOString()]);
    }
    await copyCsv(client,'patients',['id','clinic_id','record_number','document_type','document_number','full_name','first_name','last_name','birth_date','deceased','sex','marital_status','blood_type','birth_place','state','country','address','phone','email','occupation','is_private','photo_url','allergies_notes','current_diagnosis_summary','guardian_name','guardian_document','guardian_address','guardian_phone','guardian_email','religion','is_suspended','suspension_reason','notes','created_by_id','metadata','created_at','updated_at'],patientCopyRows);
    const patientProbe=await client.query(`select id,record_number from public.patients where id=$1 or record_number='002' limit 3`,[stableUuid('patient:002')]);console.log('DEBUG dbPatients='+JSON.stringify(patientProbe.rows));
    console.log(`Pacientes cargados: ${uniquePatientRows.length}.`);
    const patientIds=new Map(uniquePatientRows.filter(x=>clean(x.historia)).map(x=>[clean(x.historia),stableUuid('patient:'+clean(x.historia))]));
    const patientId=async rec=>patientIds.get(rec);
    const patientUuid=record=>stableUuid('patient:'+record);
    const specialtyIds=new Map(specialtyRows.map(x=>[clean(x.codigo),stableUuid('specialty:'+clean(x.codigo))]));
    const officeIds=new Map(officeRows.map(x=>[clean(x.codigo),stableUuid('office:'+clean(x.codigo))]));
    const appointmentCopyRows=[];
    await byBatches(appointmentRows, 250, async (batch,baseIndex) => { for (let localIndex=0;localIndex<batch.length;localIndex++) { const x=batch[localIndex];
      const p=patientIds.get(clean(x.historia)); if(!p) continue;
      const d=date(x.fechacita)||date(x.proxcita); if(!d) continue;
      const stamp=timestamp(d,clean(x.horacita)||clean(x.proxhora)||'09:00 AM');
      const end=new Date(new Date(stamp).getTime()+30*60000).toISOString();
      const aStatuses={0:'programada',1:'atendida',2:'confirmada',3:'no_asistio',4:'cancelada',5:'cancelada'};
      const legacyId=`cita-${baseIndex+localIndex}`;
      appointmentCopyRows.push([stableUuid(`appointment:${legacyId}`),cl,p,professional.id,specialtyIds.get(clean(x.especial))||null,officeIds.get(clean(x.consultori))||null,stamp,end,30,clean(x.motivo)||'Consulta',aStatuses[String(Number(x.statuscons))]||'programada',clean(x.comentario),'legacy',legacyId,clean(x.statuscons),user.id,json({legacyIdFromDump:clean(x.idcita),legacyProfessional:x.medico,legacyClinic:x.empresa}),new Date().toISOString(),new Date().toISOString()]);
    }});
    console.log('DEBUG patient 002 expected='+patientIds.get('002')+' copy='+patientCopyRows.find(r=>r[2]==='002')?.[0]+' appointment='+appointmentCopyRows.find(r=>r[2]===patientIds.get('002'))?.[2]);
    await copyCsv(client,'appointments',['id','clinic_id','patient_id','professional_id','specialty_id','office_id','duration_minutes','starts_at','ends_at','legacy_id','legacy_status','metadata','notes','reason','source','status','created_by_id','created_at','updated_at'],appointmentCopyRows.map(r=>[r[0],r[1],r[2],r[3],r[4],r[5],r[8],r[6],r[7],r[13],r[14],r[16],r[11],r[9],'legacy',r[10],r[15],r[17],r[18]]));
    console.log('Citas importadas.');
    // Consulta principal y móvil se conservan ambas; pid/fecha forman clave heredada.
    let ci=0; const consultationCopyRows=[];
    await byBatches(consultationRows, 250, async (batch,baseIndex) => { for (let localIndex=0;localIndex<batch.length;localIndex++) { const x=batch[localIndex];
      const p=patientIds.get(clean(x.historia)); const d=date(x.fecha); if(!p||!d) {ci++;continue;}
      const stamp=timestamp(d,clean(x.hora)||'09:00 AM');
      const legacyId=`consulta-${ci++}`;
      const current=x.enfermac||x.enfermedad||''; const physical=x.exfisico||x.examfisico||''; const studies=x.estudios||''; const diagnosis=x.concdiag||''; const treatment=x.tratamient||'';
      const type='consulta';
      const cstatus='borrador'; // El volcado no contiene firma electrónica ni autoriza afirmar las notas.
      consultationCopyRows.push([stableUuid(`consultation:${cl}:${legacyId}`),cl,p,professional.id,specialtyIds.get(clean(x.especial))||null,type,stamp,date(x.proxcita),clean(x.motivo),clean(current),clean(physical),clean(studies),clean(diagnosis),clean(treatment),clean(x.motevoluc),clean(treatment),cstatus,'legacy',legacyId,user.id,json({legacyPid:x.pid,legacyDoctor:x.medico,legacyUser:x.usuario,legacyType:x.tipohis})]);
    }});
    await copyCsv(client,'consultations',['id','clinic_id','patient_id','professional_id','consultation_type','consulted_at','next_visit_at','reason','current_illness','physical_exam','studies','diagnosis_notes','treatment_plan','evolution','plan','status','source','legacy_id','metadata','created_by_id','created_at','updated_at'],consultationCopyRows.map(r=>[r[0],r[1],r[2],r[3],r[5],r[6],r[7],r[8],r[9],r[10],r[11],r[12],r[13],r[14],r[15],r[16],r[17],r[18],r[20],r[19],new Date().toISOString(),new Date().toISOString()]));
    console.log('Consultas importadas.');
    // Antecedentes textuales completos en detalles; CIE-10 oficiales van separados.
    const cieEntries=[...new Map(cieRows.map(x=>[clean(x.codigo)?.replace(/\s+/g,''),clean(x.descriptor)]).filter(([code,description])=>code&&description))];
    await byBatches(cieEntries, 1000, async batch=>{const args=[];const values=batch.map(([code,description],i)=>{const n=i*4;args.push(code,description,new Date().toISOString(),new Date().toISOString());return `($${n+1},$${n+2},true,$${n+3},$${n+4})`;});await client.query(`insert into public.cie10_codes(code,description,is_billable,created_at,updated_at) values ${values.join(',')} on conflict(code) do update set description=excluded.description,updated_at=now()`,args);});
    for(let di=0;di<diagRows.length+mobileDiagRows.length;di++){const x=[...diagRows,...mobileDiagRows][di],p=patientIds.get(clean(x.historia)); if(!p||!clean(x.descrip||x.nomprocoms)) continue; const rawCode=clean(x.codigo), code=rawCode?.replace(/\s+/g,''); const cie=code&&(await client.query('select code from public.cie10_codes where code=$1',[code])).rows[0]?.code; const text=clean(x.descrip||x.nomprocoms); await client.query(`insert into public.patient_history(id,patient_id,category,description,details,is_active,recorded_at,recorded_by_id,created_at,updated_at) values($1,$2,'otro',$3,$4::jsonb,true,coalesce($5::date,now()),$6,now(),now()) on conflict(id) do update set details=excluded.details,recorded_at=excluded.recorded_at,recorded_by_id=excluded.recorded_by_id,updated_at=now()`,[id(`history-${di}`),p,text,json({legacyCode:rawCode,notes:x.notas,professionalCode:x.medico,cie10Code:cie}),date(x.fecha),user.id]);}
    const consultationMap=new Map();
    for(let i=0;i<consultationRows.length;i++){const x=consultationRows[i],p=patientIds.get(clean(x.historia)),d=date(x.fecha);if(p&&d)consultationMap.set(`${p}|${d}`,id(`consultation:${cl}:consulta-${i}`));}
    let ai=0; const answerColumns=['id','clinic_id','patient_id','consultation_id','item_code','prompt_snapshot','answer','details','recorded_at','source','legacy_id','created_at','updated_at'];
    const copyAnswerRows=async function*(source){for(const x of source){const i=ai++,p=patientIds.get(clean(x.historia));if(!p)continue;const legacyId=`anamnesis-${i}`,consultationId=consultationMap.get(`${p}|${date(x.fecha)}`)||null;yield [stableUuid(legacyId),cl,p,consultationId,clean(x.idline),clean(x.descrip),clean(x.respuesta),clean(x.detalles),date(x.fecha),'legacy',legacyId,new Date().toISOString(),new Date().toISOString()];}};
    const answerStream=client.query(copyFrom(`COPY public.patient_anamnesis_answers (${answerColumns.join(',')}) FROM STDIN WITH (FORMAT csv, NULL '\\N')`));
    async function* answerCsv(){for await(const row of copyAnswerRows(iterateInsertRows('pac_cuest')))yield Buffer.from(row.map(value=>{if(value===null||value===undefined)return '\\N';return '"'+String(value).replaceAll('"','""')+'"';}).join(',')+'\n');}
    await pipeline(answerCsv(),answerStream);
    console.log('Anamnesis importada.');
    const consultationIds=new Map();
    for(let i=0;i<consultationRows.length;i++){const x=consultationRows[i],p=patientIds.get(clean(x.historia)),d=date(x.fecha);if(p&&d)consultationIds.set(`${p}|${d}`,id(`consultation:${cl}:consulta-${i}`));}
    let ri=0;
    for(const x of recipeRows){const idx=ri++,p=patientIds.get(clean(x.historia)); if(!p||!date(x.fecha)||!clean(x.nombre)) continue; const legacyId=`recipe-${idx}`, when=date(x.fecha); const con=consultationIds.get(`${p}|${when}`)||null; const num=clean(x.nrorecipe)||legacyId; const rxId=stableUuid(legacyId); await client.query(`insert into public.prescriptions(id,clinic_id,patient_id,consultation_id,professional_id,prescription_number,issued_at,status,notes,legacy_id,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,'emitida',$8,$9,now(),now()) on conflict(id) do update set consultation_id=excluded.consultation_id,issued_at=excluded.issued_at,notes=excluded.notes,updated_at=now()`,[rxId,cl,p,con,professional.id,num,when,clean(x.coddoc),legacyId]); const itemLegacy=`recipe-item-${idx}`; await client.query(`insert into public.prescription_items(id,prescription_id,medication_name,presentation,dose,frequency,quantity,instructions,sort_order,legacy_id,created_at,updated_at) values($1,$2,$3,$4,null,nullif($5,''),$6,$7,0,$8,now(),now()) on conflict(id) do update set medication_name=excluded.medication_name,presentation=excluded.presentation,frequency=excluded.frequency,quantity=excluded.quantity,instructions=excluded.instructions,updated_at=now()`,[stableUuid(itemLegacy),rxId,clean(x.nombre),clean(x.present),clean(x.indicacion)||'',Number(x.cantidad)||null,clean(x.indicacion),itemLegacy]);}
    const tables=['patients','appointments','consultations','patient_history','patient_anamnesis_answers','cie10_codes','consultation_diagnoses','prescriptions','prescription_items'];
    for(const t of tables) {const exists=await client.query('select to_regclass($1) as relation',[`public.${t}`]);counts[t]=exists.rows[0].relation?Number((await client.query(`select count(*)::int n from public.${t}${t==='cie10_codes'?'':' where '+(t==='patient_history'?'patient_id in (select id from public.patients where clinic_id=$1)':t==='prescription_items'?'prescription_id in (select id from public.prescriptions where clinic_id=$1)':'clinic_id=$1')}`,t==='cie10_codes'?[]:[cl])).rows[0].n):'tabla no creada en Data Connect';}
    await client.query('commit');
  } catch(e) {
    console.error(`Error en migración (${e.code||'sin código'}): ${e.message}`);
    try { await client.query('rollback'); } catch(rollbackError) { console.error(`Rollback: ${rollbackError.code||''} ${rollbackError.message}`); }
    throw e;
  } finally { client.release(); }
  console.log(`Usuario Auth vinculado: ${authUser.email} (${authUser.uid}).`);
  console.log('Conteo final en PostgreSQL/Data Connect:'); for(const [t,n] of Object.entries(counts)) console.log(`${t}: ${n}`);
} finally { await pool.end(); connector?.close(); }
