import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import app from '../src/server.js';
import {pool} from '../src/db.js';
import {mapJob} from '../src/jobs.js';

const fixture={name:'Test Candidate',email:'test@example.invalid',skills:['Python','Flask'],experience:[],projects:[],education:[]};
const feedJob={guid:'https://himalayas.app/companies/example/jobs/python-engineer',title:'Python Engineer',companyName:'Example',description:'<p>Python Flask backend API work, testing, reviews, deployment and documentation for a distributed engineering team.</p>',applicationLink:'https://himalayas.app/companies/example/jobs/python-engineer',pubDate:1788985864,locationRestrictions:['India'],seniority:['Entry-level']};
const job=mapJob(feedJob);

test('maps the current Himalayas search shape, location and seniority',()=>{
 assert.equal(job.location_restrictions[0],'India');assert.equal(job.seniority,'Entry-level');assert.equal(job.url,feedJob.applicationLink);
 assert.equal(job.description.includes('<p>'),false);
 assert.equal(mapJob({...feedJob,applicationLink:'javascript:alert(1)'}),null);
 assert.equal(mapJob({...feedJob,pubDate:Infinity}).posted_at,null);
});

test('synthetic owner flow: job feed, one-tap PDF, manual tracker',async()=>{
 const originalQuery=pool.query,originalFetch=globalThis.fetch;let server;
 const tracker=new Map();let cache=null;
 pool.query=async(sql,args=[])=>{
  if(sql.includes('SELECT 1 FROM jobtrail_sessions'))return {rows:[{ok:1}]};
  if(sql.includes('SELECT profile FROM jobtrail_owner'))return {rows:[{profile:fixture}]};
  if(sql.includes('SELECT profile_revision FROM jobtrail_owner'))return {rows:[{profile_revision:1}]};
  if(sql.includes('SELECT payload,fetched_at FROM jobtrail_feed_cache'))return {rows:cache?[cache]:[]};
  if(sql.includes('INSERT INTO jobtrail_feed_cache')){cache={payload:JSON.parse(args[1]),fetched_at:new Date()};return {rows:[]}};
  if(sql.includes('INSERT INTO jobtrail_applications')){tracker.set(args[0],{id:args[0],title:args[1],company:args[2],application_url:args[3],source:args[4],status:args[5],job_description:args[6],profile_revision:args[7]});return {rows:[]}};
  if(sql.includes('SELECT id,title,company,application_url,source,status'))return {rows:[...tracker.values()]};
  throw Error('Unexpected query '+sql);
 };
 try{
  server=app.listen(0);await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;process.env.PUBLIC_ORIGIN=base;
  globalThis.fetch=(url,opts)=>String(url).startsWith('https://himalayas.app/jobs/api/search')?Promise.resolve(new Response(JSON.stringify({jobs:[feedJob]}),{headers:{'Content-Type':'application/json'}})):originalFetch(url,opts);
  const headers={Cookie:'jobtrail_session=synthetic-token'};
  const found=await originalFetch(base+'/api/jobs?q=python',{headers});assert.equal(found.status,200);const body=await found.json();assert.equal(body.jobs.length,1);assert.equal(body.jobs[0].location_restrictions[0],'India');assert.equal(body.source_url,'https://himalayas.app');
  const pdf=await originalFetch(base+'/api/resume',{method:'POST',headers:{...headers,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({job:{title:job.title,company:job.company,description:job.description}})});assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0,5).toString(),'%PDF-');
  const update=await originalFetch(base+'/api/tracker/'+encodeURIComponent(job.id),{method:'PUT',headers:{...headers,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({title:job.title,company:job.company,url:job.url,source:job.source,description:job.description,status:'saved'})});assert.equal(update.status,200);assert.equal((await update.json()).saved,true);
  const tracked=await originalFetch(base+'/api/tracker',{headers});const trackedBody=await tracked.json();assert.equal(trackedBody.applications[0].status,'saved');assert.equal(trackedBody.applications[0].job_description,job.description);
  const noOrigin=await originalFetch(base+'/api/tracker/'+encodeURIComponent(job.id),{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({title:job.title,company:job.company,url:job.url,source:job.source,description:job.description,status:'applied'})});assert.equal(noOrigin.status,403);
  const stored=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');assert.match(stored,/Download resume/);assert.match(stored,/Open apply page/);assert.match(stored,/Application status for/);
 }finally{if(server)await new Promise(r=>server.close(r));pool.query=originalQuery;globalThis.fetch=originalFetch;delete process.env.PUBLIC_ORIGIN}
});
