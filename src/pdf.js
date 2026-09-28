import PDFDocument from 'pdfkit';
export function renderResume(data){const doc=new PDFDocument({size:'A4',margin:42,info:{Title:`Resume - ${data.name}`,Author:data.name}});const chunks=[];doc.on('data',c=>chunks.push(c));const done=new Promise((resolve,reject)=>{doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});
 const line=(t,size=10)=>{doc.fontSize(size).font('Helvetica').text(String(t||''),{lineGap:2});doc.moveDown(.25)};
 const section=t=>{doc.moveDown(.5).font('Helvetica-Bold').fontSize(11).text(t.toUpperCase());doc.moveTo(doc.x,doc.y).lineTo(553,doc.y).strokeColor('#64748b').stroke();doc.moveDown(.4)};
 doc.font('Helvetica-Bold').fontSize(20).text(data.name);const c=data.contact;line([c.location,c.email,c.phone,...c.links].filter(Boolean).join(' | '),9);if(data.headline)line(data.headline,11);
 if(data.summary){section('Profile');line(data.summary)}if(data.skills.length){section('Skills');line(data.skills.join(' | '))}
 if(data.experience.length){section('Experience');for(const e of data.experience){doc.font('Helvetica-Bold').fontSize(10).text([e.title,e.organization].filter(Boolean).join(' - '));line([e.start,e.end,e.location].filter(Boolean).join(' | '),9);for(const b of e.bullets)line(`• ${b}`)}}
 if(data.projects.length){section('Projects');for(const p of data.projects){doc.font('Helvetica-Bold').fontSize(10).text(p.name);if(p.url)line(p.url,9);for(const b of p.bullets)line(`• ${b}`)}}
 if(data.education.length){section('Education');for(const e of data.education){doc.font('Helvetica-Bold').fontSize(10).text(`${e.degree} - ${e.institution}`);line([e.dates,e.details].filter(Boolean).join(' | '),9)}}
 if(data.certifications.length){section('Certifications');for(const c of data.certifications)line(c)}doc.end();return done}
