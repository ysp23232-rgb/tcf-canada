import fs from 'node:fs';
import path from 'node:path';

const work=path.resolve(new URL('..',import.meta.url).pathname);
const cleanText=s=>s.replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim();

function writingTask(file,number,label){
  const raw=fs.readFileSync(path.join(work,file),'utf8');
  const doc=(raw.match(/<browser__document__content>\n([\s\S]*?)\n<\/browser__document__content>/)||[])[1]||raw;
  const marker=`Tâche ${number} – Expression Écrite`;
  let body=doc.includes(marker)?doc.slice(doc.indexOf(marker)+marker.length):doc;
  body=body.split(/\nComplete\nLeave a Reply/)[0];
  const lines=body.split(/\r?\n/).map(cleanText).filter(x=>x&&x!=='.');
  const task={key:`writing-${number}`,label,objective:'',subjects:[]};let current=null,mode='prompt';
  for(const line of lines){
    if(line.startsWith('Objectif :')){task.objective=line;continue}
    const m=line.match(/^(?:🔹\s*)?Sujet\s+(\d+)\s*:?/i);
    if(m){current={number:+m[1],prompt:[],correction:[]};task.subjects.push(current);mode='prompt';const rest=line.slice(m[0].length).trim();if(rest)current.prompt.push(rest);continue}
    if(/^Correction$/i.test(line)){mode='correction';continue}
    if(current)current[mode].push(line);
  }
  return task;
}

function sanitize(html){return html
  .replace(/<!--[\s\S]*?-->/g,'')
  .replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi,'')
  .replace(/\s+on\w+=("[^"]*"|'[^']*')/gi,'')
  .replace(/\s+srcset=("[^"]*"|'[^']*')/gi,'')
  .replace(/javascript:/gi,'');}

const oralRaw=JSON.parse(fs.readFileSync(path.join(work,'oral-seven-lessons.json'),'utf8'));
const mapping=JSON.parse(fs.readFileSync(path.join(work,'oral-source-images/mapping.json'),'utf8'));
const imageHtml=key=>(mapping[key]||[]).map((item,i)=>`<figure class="source-sheet"><img loading="lazy" src="media/oral-source-images/${key}/${String(i+1).padStart(3,'0')}.jpg" alt="${key} - page ${i+1}"><figcaption>Page ${i+1}</figcaption></figure>`).join('');
const oral=oralRaw.map(item=>({key:`speaking-${item.key}`,label:item.label,heading:item.heading,html:['grille','tache1','tache2','tache3'].includes(item.key)?imageHtml(item.key):sanitize(item.html)}));

const resources={writing:[
  writingTask('ecrite-tache1-complete.txt',1,'Tâche 1'),
  writingTask('tache2-tab.txt',2,'Tâche 2'),
  writingTask('tache3-tab.txt',3,'Tâche 3')
],speaking:oral};

fs.writeFileSync(new URL('resources-data.js',import.meta.url),'window.TCF_RESOURCES='+JSON.stringify(resources)+';');
console.log(JSON.stringify({writing:resources.writing.map(x=>({task:x.label,subjects:x.subjects.length})),speaking:resources.speaking.map(x=>x.label)},null,2));
