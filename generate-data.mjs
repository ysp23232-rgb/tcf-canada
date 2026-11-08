import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync(new URL('../exam-library.json',import.meta.url),'utf8'));
const audio=JSON.parse(fs.readFileSync(new URL('../local-audio-map.json',import.meta.url),'utf8'));
const images=JSON.parse(fs.readFileSync(new URL('../image-map.json',import.meta.url),'utf8'));
const exams=source.map((e,i)=>({
  id:(i<30?'co-':'ce-')+(i<30?i+1:i-29),type:i<30?'listening':'reading',number:i<30?i+1:i-29,duration:i<30?50:60,
  audio:i<30?audio[i+1]:null,
  questions:e.questions.map(q=>({...q,images:(q.images||[]).map(x=>images[x]||x),iframes:undefined}))
}));
// Correct a verified source-site defect: CE 12, Q5 omitted "La date" and
// incorrectly marked "La matière" even though the notice states Biologie.
const corrected=exams.find(e=>e.id==='ce-12').questions[4];
corrected.options=[
  {label:'La matière.',correct:false},
  {label:'Le lieu.',correct:false},
  {label:"L'heure.",correct:false},
  {label:'La date.',correct:true}
];
corrected.explanation="Explication : Le texte indique la matière (biologie), l’heure (15 h 30) et le lieu (salle 454), mais il ne donne pas la date exacte. La bonne réponse est « La date ».";
fs.writeFileSync(new URL('data.js',import.meta.url),'window.TCF_EXAMS='+JSON.stringify(exams)+';');
console.log(`Built ${exams.length} exams / ${exams.reduce((n,e)=>n+e.questions.length,0)} questions`);
