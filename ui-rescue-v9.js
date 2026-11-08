(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

function topOffset(){const h=$('.topbar')?.getBoundingClientRect().height||64;document.documentElement.style.setProperty('--v9-nav-top',Math.ceil(h+8)+'px')}

function ensureFallbackDrawer(){
  let drawer=$('#ss-drawer'),backdrop=$('#ss-drawer-backdrop');
  if(!backdrop){backdrop=document.createElement('div');backdrop.id='ss-drawer-backdrop';backdrop.className='ss-drawer-backdrop';document.body.appendChild(backdrop)}
  if(!drawer){
    drawer=document.createElement('aside');drawer.id='ss-drawer';drawer.className='ss-drawer';drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML='<div class="ss-drawer-head"><div><h2>TCF Study Hub</h2><small>Study tools</small></div><button type="button" class="ss-close" id="ss-close">×</button></div><div class="ss-drawer-body"><section class="ss-pane active"><div class="ss-block"><b>Study Hub</b><p>The main Study Hub had a loading problem. This rescue layer keeps the menu usable.</p><button type="button" class="ss-primary" data-v9-retry-hub>Retry full Study Hub</button></div></section></div>';
    document.body.appendChild(drawer)
  }
  return {drawer,backdrop}
}

function forceOpenHub(){
  let err=null;
  try{window.TCF_STUDY_SUITE_UI?.openDrawer?.('today')}catch(e){err=e;console.error('[V9 Study Hub rescue]',e)}
  const {drawer,backdrop}=ensureFallbackDrawer();
  drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');backdrop.classList.add('open');
  const body=$('.ss-drawer-body',drawer);
  if(body&&!body.textContent.trim())body.innerHTML='<section class="ss-pane active"><div class="ss-block"><b>Study Hub opened</b><p>The saved Study Hub data could not be rendered, but the drawer itself is working.</p><button type="button" class="ss-primary" data-v9-retry-hub>Retry</button></div></section>';
  if(err&&body&&!$('[data-v9-error-note]',body)){const n=document.createElement('div');n.dataset.v9ErrorNote='';n.className='ss-block';n.innerHTML='<b>Recovered from a Study Hub error</b><p>Your TCF questions and attempts were not changed.</p>';body.prepend(n)}
}
function closeHub(){const d=$('#ss-drawer'),b=$('#ss-drawer-backdrop');d?.classList.remove('open');d?.setAttribute('aria-hidden','true');b?.classList.remove('open')}

let lastHubActivation=0;
function persistentClick(e){
  const t=e.target?.closest?.('#ss-fab,[data-ss-hub-top],[data-cc-hub]');
  if(t){e.preventDefault();e.stopPropagation();const now=Date.now();if(now-lastHubActivation>180){lastHubActivation=now;forceOpenHub()}return}
  if(e.target?.closest?.('#ss-close')){e.preventDefault();closeHub();return}
  const bd=e.target?.closest?.('#ss-drawer-backdrop');if(bd&&e.target===bd){e.preventDefault();closeHub();return}
  if(e.target?.closest?.('[data-v9-retry-hub]')){e.preventDefault();forceOpenHub();return}
}
document.addEventListener('click',persistentClick,true);
document.addEventListener('pointerup',e=>{if(e.target?.closest?.('#ss-fab,[data-ss-hub-top]'))persistentClick(e)},true);

const navConfigs=[
  {kind:'questions',host:'.layout',side:':scope > .side',hideKey:'tcf-v9-hide-questions',showId:'v9-show-questions',showText:'☰ Show questions',hideText:'◀ Hide questions'},
  {kind:'course',host:'.web-resource-layout',side:':scope > .document-side',hideKey:'tcf-v9-hide-course',showId:'v9-show-course',showText:'☰ Show course menu',hideText:'◀ Hide menu'}
];
function hidden(c){try{return localStorage.getItem(c.hideKey)==='1'}catch(e){return false}}
function saveHidden(c,v){try{localStorage.setItem(c.hideKey,v?'1':'0')}catch(e){}}
function ensureShowButton(c,host){let b=document.getElementById(c.showId);if(!b){b=document.createElement('button');b.id=c.showId;b.type='button';b.className='v9-nav-show';b.textContent=c.showText;document.body.appendChild(b)}b.onclick=()=>setNavHidden(c,host,false,true);return b}
function setNavHidden(c,host,v,remember){if(!host)return;const side=host.querySelector(c.side);if(!side)return;host.classList.toggle('v9-'+c.kind+'-hidden',v);side.style.display=v?'none':'';side.setAttribute('aria-hidden',v?'true':'false');const show=ensureShowButton(c,host);show.classList.toggle('visible',v);if(remember)saveHidden(c,v)}
function enhanceNav(c){const host=$(c.host),side=host?.querySelector(c.side),show=document.getElementById(c.showId);if(!host||!side){show?.classList.remove('visible');return}side.classList.add('v9-fixed-nav','v9-'+c.kind+'-nav');let hide=side.querySelector('[data-v9-hide="'+c.kind+'"]');if(!hide){hide=document.createElement('button');hide.type='button';hide.className='v9-nav-hide';hide.dataset.v9Hide=c.kind;hide.textContent=c.hideText;hide.onclick=()=>setNavHidden(c,host,true,true);side.insertBefore(hide,side.firstChild)}setNavHidden(c,host,hidden(c),false)}
function enhanceAll(){topOffset();navConfigs.forEach(enhanceNav)}
new MutationObserver(()=>requestAnimationFrame(enhanceAll)).observe($('#app')||document.body,{childList:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(enhanceAll),{passive:true});
window.addEventListener('scroll',topOffset,{passive:true});
setInterval(enhanceAll,1200);
enhanceAll();

window.TCF_V9_RESCUE={openStudyHub:forceOpenHub,closeStudyHub:closeHub,refreshNavigation:enhanceAll};
})();
