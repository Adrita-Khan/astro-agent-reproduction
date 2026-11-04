(function(){
'use strict';
var D=window.SEMINAR_DATA;
/* Every page loads this file; a missing element yields a detached stand-in so each section can initialise safely. */
var $=function(s,r){return (r||document).querySelector(s)||document.createElement('div')};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var has=function(s){return !!document.querySelector(s)};
var mean=function(a){return a.reduce(function(x,y){return x+y},0)/a.length};
var PUB=2.70;
var PAGEMAP={overview:['index','Overview'],contributions:['contributions','Contributions'],background:['background','Background'],ai:['ai','AI components'],agents:['agents','Agent architecture'],workflows:['workflows','Workflows'],audit:['audit','The Nature audit'],case:['case','Case study: Rix et al.'],technical:['equations','Equations and tools'],assumptions:['assumptions','Assumptions'],critique:['critique','Critique'],kit:['kit','Seminar kit'],figures:['figures','Figure index']};

function fo(x,y,w,h,inner,cls,align){
  var left=align==='middle'?x-w/2:align==='end'?x-w:x;
  return '<foreignObject x="'+left.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w+'" height="'+h+'"><div class="fo '+cls+'" style="text-align:'+(align==='middle'?'center':align==='end'?'right':'left')+'">'+inner+'</div></foreignObject>';
}
function sg(v,n,plus){return (v<0?'-':(plus===false?'':'+'))+Math.abs(v).toFixed(n)}
function kpcT(v,n,plus){return '$'+sg(v,n,plus)+'\\kpc$'}
function pctT(v,n,plus){return '$'+sg(v,n,plus)+'\\%$'}
function tag(k){return k==='p'?'<span class="src p">Paper</span>':k==='b'?'<span class="src b">Background</span>':'<span class="src c">Critique</span>'}
function dots(n,max){var s='<span class="dots" role="img" aria-label="'+n+' out of '+(max||5)+'">';for(var i=1;i<=(max||5);i++)s+='<span class="dot'+(i<=n?' on':'')+'"></span>';return s+'</span>'}
function kv(rows){return '<dl class="dl">'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('')+'</dl>'}
function ul(a){return '<ul>'+a.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'}
function pressGroup(btns,i){btns.forEach(function(b,j){b.setAttribute('aria-pressed',j===i?'true':'false')})}
function stepper(stepsEl,detailEl,items,renderDetail,initial){
  stepsEl.innerHTML=items.map(function(it,i){return '<button type="button" class="step" aria-pressed="false" data-i="'+i+'"><b>'+it.t+'</b><span>'+it.s+'</span></button>'}).join('');
  stepsEl.style.setProperty('--n',items.length);
  var btns=$$('.step',stepsEl);
  function sel(i){pressGroup(btns,i);detailEl.innerHTML=renderDetail(items[i],i)}
  btns.forEach(function(b,i){b.addEventListener('click',function(){sel(i)})});
  sel(initial||0);
}

/* ---------- theme ---------- */
(function(){
  var root=document.documentElement,btns=$$('[data-theme-set]'),cur='system';
  try{var s=localStorage.getItem('wang26-theme');if(s==='light'||s==='dark')cur=s}catch(e){}
  function apply(){if(cur==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',cur);btns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-theme-set')===cur?'true':'false')})}
  btns.forEach(function(b){b.addEventListener('click',function(){cur=b.getAttribute('data-theme-set');try{if(cur==='system')localStorage.removeItem('wang26-theme');else localStorage.setItem('wang26-theme',cur)}catch(e){}apply()})});
  apply();
})();

/* ---------- mobile contents menu ---------- */
(function(){
  var btn=$('#menuBtn'),body=document.body;
  function set(open){body.classList.toggle('nav-open',open);btn.setAttribute('aria-expanded',open?'true':'false');btn.textContent=open?'Close':'Contents'}
  btn.addEventListener('click',function(){set(!body.classList.contains('nav-open'))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&body.classList.contains('nav-open')){set(false);btn.focus()}});
  window.addEventListener('resize',function(){if(window.innerWidth>900&&body.classList.contains('nav-open'))set(false)});
  $$('#side a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
})();

/* ---------- "on this page" ---------- */
(function(){
  var hs=$$('.page-body > .sub > h2');
  if(hs.length<3||document.body.getAttribute('data-page')==='index')return;
  var items=hs.map(function(h,i){
    var c=h.cloneNode(true);$$('.src',c).forEach(function(n){n.parentNode.removeChild(n)});
    var t=c.textContent.replace(/\s+/g,' ').trim();
    if(!h.id)h.id='s'+(i+1)+'-'+t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
    return '<a href="#'+h.id+'">'+t+'</a>';
  });
  var nav=document.createElement('nav');nav.className='toc';nav.setAttribute('aria-label','On this page');
  nav.innerHTML='<span class="tl">On this page</span>'+items.join('');
  $('.page-head').appendChild(nav);
})();

/* ---------- path data (transcribed from the labels of the paper's Fig. 8) ---------- */
var SAMPLES=D.SAMPLES,MASKS=D.MASKS,PATHS=D.PATHS;
function dev(v){return (v-PUB)/PUB*100}
function boxWidth(sel,fallback){var el=document.querySelector(sel);var w=el?el.clientWidth:0;return w>0?w:fallback}

function spreadSvg(c){
  var W=Math.max(300,Math.round(c.W)),narrow=W<700;
  var R=16,L=narrow?6:Math.round(Math.min(210,W*.27)),x0=narrow?1.95:1.75,x1=3.8;
  var px=function(v){return L+(v-x0)/(x1-x0)*(W-L-R)};
  var off=c.off,pad=c.pad,head=narrow?28:0,gh=head+2*off+2*pad,T=32,B=T+3*gh,H=B+48;
  var keys=['MP','SN','AS'],mid={},y0={};
  keys.forEach(function(k,i){y0[k]=T+i*gh;mid[k]=y0[k]+head+(gh-head)/2});
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" class="plot" role="img" aria-label="'+c.label+'">';
  if(c.pub&&c.tol!=null){var lo=Math.max(x0,PUB*(1-c.tol/100)),hi=Math.min(x1,PUB*(1+c.tol/100));s+='<rect class="band" x="'+px(lo)+'" y="'+T+'" width="'+Math.max(1.6,px(hi)-px(lo))+'" height="'+(B-T)+'"/>'}
  var step=W<460?0.4:0.2;
  for(var v=2.0;v<=3.8001;v+=step){var x=px(v);s+='<line class="gl" x1="'+x+'" x2="'+x+'" y1="'+T+'" y2="'+B+'"/><text class="ax" x="'+x+'" y="'+(B+17)+'" text-anchor="middle">'+v.toFixed(1)+'</text>'}
  s+=fo((L+W-R)/2,H-28,220,22,'$\\sigma_{\\mathrm{RGC}}\\ (\\mathrm{kpc})$','ax','middle');
  keys.forEach(function(k,i){
    if(i>0)s+='<line class="sep" x1="0" x2="'+(W-R)+'" y1="'+y0[k]+'" y2="'+y0[k]+'"/>';
    if(narrow)s+=fo(L,y0[k]+1,W-L-R,40,'<span class="rln">'+SAMPLES[k].name+'</span> <span class="rls">'+SAMPLES[k].sub+'</span>','grp1');
    else s+=fo(2,mid[k]-20,L-8,42,'<span class="rln">'+SAMPLES[k].name+'</span><span class="rls">'+SAMPLES[k].sub+'</span>','grp');
    if(!narrow)s+=fo(px(x0)+6,mid[k]-off-9,90,18,'all sky','rls')+fo(px(x0)+6,mid[k]+off-9,90,18,'$|b|\\gt 5^\\circ$','rls');
  });
  if(c.pub){var xp=px(PUB);s+='<line class="publine" x1="'+xp+'" x2="'+xp+'" y1="'+(T-8)+'" y2="'+B+'"/>'+fo(xp,T-32,190,20,'published $\\approx 2.70\\kpc$','pubfo','middle')}
  PATHS.forEach(function(p){
    var cy=mid[p.sample]+(p.mask==='full'?-off:off),cx=px(p.v);
    var lab='Path '+p.id+': '+SAMPLES[p.sample].name+', '+(p.mask==='full'?'full sky':'|b| over 5 degrees')+', '+(p.zp?'+0.02 mas':'no correction')+', '+p.v.toFixed(4)+' kpc';
    if(c.interactive){
      if(c.sel===p.id)s+='<circle class="ring" cx="'+cx+'" cy="'+cy+'" r="11"/>';
      s+='<circle class="pt p'+p.zp+'" data-id="'+p.id+'" cx="'+cx+'" cy="'+cy+'" r="6.5" tabindex="0" role="button" aria-label="'+lab+'"/>';
    }else s+='<circle class="p'+p.zp+'" cx="'+cx+'" cy="'+cy+'" r="6"><title>'+lab+'</title></circle>';
  });
  return s+'</svg>';
}
function drawHero(){$('#heroPlot').innerHTML=spreadSvg({W:boxWidth('#heroPlot',720),off:13,pad:16,pub:true,tol:null,label:'Twelve analysis paths for the same quantity range from 2.16 to 3.53 kpc. The published value is about 2.70 kpc.'})}

/* ---------- overview ---------- */
stepper($('#storySteps'),$('#storyDetail'),D.STORY,function(it){return '<h3>'+it.h+'</h3><p>'+it.b+'</p>'+ul(it.x)});
$('#threeWay').innerHTML=D.THREE.map(function(t){return '<div class="card"><h3>'+t.t+'</h3><p>'+t.b+'</p>'+kv([['Handled by',t.h],['Evidence',t.e]])+'</div>'}).join('');

/* ---------- contributions ---------- */
$('#contribGrid').innerHTML=D.CONTRIB.map(function(c){return '<div class="card"><h3>'+c.t+'</h3><p>'+c.p+'</p><p class="rate">'+dots(c.ev)+c.n+'</p></div>'}).join('');
$('#claimsTbl').innerHTML='<thead><tr><th>Claim</th><th>Where</th><th>Checkable from the manuscript?</th><th>Confidence</th></tr></thead><tbody>'+D.CLAIMS.map(function(r){return '<tr><td>'+r[0]+'</td><td class="n">'+r[1]+'</td><td>'+r[2]+'</td><td>'+dots(r[3])+'</td></tr>'}).join('')+'</tbody>';

/* ---------- background ---------- */
$('#bgList').innerHTML=D.BG.map(function(b,i){return '<details class="acc"'+(i===4?' open':'')+'><summary><span>'+b.t+'</span><span class="meta">'+tag(b.k)+'</span></summary><div class="body"><p>'+b.b+'</p><p><b>Why it matters here.</b> '+b.w+'</p></div></details>'}).join('');
$('#readMap').innerHTML=D.READ.map(function(r){return '<div class="card"><h3>'+r.g+'</h3>'+ul(r.i)+'</div>'}).join('');

/* ---------- AI components ---------- */
$('#aiTbl').innerHTML='<thead><tr><th>Component</th><th>Reads</th><th>Produces</th><th>Why it is there</th><th>Failure signature</th></tr></thead><tbody>'+D.AIROWS.map(function(r){return '<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+r[4]+'</td></tr>'}).join('')+'</tbody>';
stepper($('#traceSteps'),$('#traceDetail'),D.TRACE,function(it,i){return '<div class="lab">Step '+(i+1)+' of '+D.TRACE.length+'</div><h3>'+it.t+': '+it.s+'</h3><p>'+it.x+'</p>'});

/* ---------- agents ---------- */
var ROLES=D.ROLES;
function roleHtml(k){var r=ROLES[k];return '<div class="lab">'+tag(r.tg)+'</div><h3>'+r.n+'</h3><p>'+r.does+'</p>'+kv([['Reads',r.reads],['Writes',r.writes],['Decides',r.decides],['Can go wrong',ul(r.risks)],['Not specified',r.silent]])}
(function(){
  var nodes=$$('#agentSvg .node');
  var order=['reader','planner','coder','verifier','adjudicator','input','human','models','fs','tools'].filter(function(k){return ROLES[k]});
  $('#roleChips').innerHTML=order.map(function(k){return '<button type="button" class="chip" aria-pressed="false" data-role="'+k+'">'+ROLES[k].n+'</button>'}).join('');
  var chips=$$('#roleChips .chip');
  function sel(k){
    nodes.forEach(function(n){n.classList.toggle('sel',n.getAttribute('data-role')===k)});
    chips.forEach(function(c){c.setAttribute('aria-pressed',c.getAttribute('data-role')===k?'true':'false')});
    $('#roleDetail').innerHTML=roleHtml(k);
  }
  nodes.forEach(function(n){var k=n.getAttribute('data-role');n.addEventListener('click',function(){sel(k)});n.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel(k)}})});
  chips.forEach(function(c){c.addEventListener('click',function(){sel(c.getAttribute('data-role'))})});
  sel('coder');
})();

/* ---------- workflows ---------- */
stepper($('#pipeSteps'),$('#pipeDetail'),D.PIPE,function(it,i){return '<div class="lab">Stage '+(i+1)+' of 5</div><h3>'+it.t+'</h3>'+kv([['Handled by',it.who],['Input',it.inp],['Output',it.out],['Checked by',it.chk],['Typical gap',it.gap]])});
stepper($('#rixSteps'),$('#rixDetail'),D.RIX,function(it,i){return '<div class="lab">Stage 0'+(i+1)+'</div><h3>'+it.t+'</h3><p>'+it.b+'</p><p class="dim">'+it.x+'</p>'});
$('#attrTbl').innerHTML='<thead><tr><th>Family</th><th>Model</th><th>Workflow</th><th>Problem</th></tr></thead><tbody>'+
 [['A','varied','locked','locked'],['B','locked','varied','locked'],['C','locked','locked','varied']].map(function(r){return '<tr><td><b>'+r[0]+'</b></td>'+r.slice(1).map(function(c){return '<td><span class="pillcell'+(c==='varied'?' ex':'')+'">'+c+'</span></td>'}).join('')+'</tr>'}).join('')+'</tbody>';

/* ---------- audit ---------- */
function wilson(k,n,z){z=z||1.96;var p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-h,c+h]}
var CATS=D.CATS,den=13,aSel='any';
function auditRender(){
  $('#auditBars').innerHTML=CATS.map(function(c){var share=c.k==='any'&&den===11?100:c.n/den*100;return '<button type="button" class="bar'+(c.k==='any'?' top':'')+(aSel===c.k?' on':'')+'" data-k="'+c.k+'"><span>'+c.t+'</span><span class="tr"><span class="fl" style="width:'+share.toFixed(1)+'%"></span></span><span class="v">'+c.n+'/13</span></button>'}).join('');
  $$('#auditBars .bar').forEach(function(b){b.addEventListener('click',function(){aSel=b.getAttribute('data-k');auditRender()})});
  var c=CATS.filter(function(x){return x.k===aSel})[0];
  $('#auditDetail').innerHTML='<h3>'+c.t+' <span class="dim" style="font:500 14px var(--sans)">'+c.n+' of 13 papers, $'+(c.n/13*100).toFixed(0)+'\\%$'+(c.k!=='any'?'; $'+(c.n/11*100).toFixed(0)+'\\%$ of the 11 affected':'')+'</span></h3><p>'+c.d+'</p>';
  var w=wilson(11,13),sum=CATS.slice(1).reduce(function(s,x){return s+x.n},0);
  $('#auditStat').innerHTML=tag('c')+'Categories overlap, so the counts sum to '+sum+' across 11 papers, about '+(sum/11).toFixed(1)+' categories per affected paper. A $95\\%$ Wilson interval for 11 of 13 is roughly $'+(w[0]*100).toFixed(0)+'\\%$ to $'+(w[1]*100).toFixed(0)+'\\%$. The paper reports no interval; this is my calculation.';
}
$$('#denChips .chip').forEach(function(b,i,all){b.addEventListener('click',function(){den=+b.getAttribute('data-den');pressGroup(all,i);auditRender()})});
auditRender();

var TYPES=D.TYPES,PAPERS=D.PAPERS,pT=[],pQ='';
$('#typeChips').innerHTML=Object.keys(TYPES).map(function(k){return '<button type="button" class="chip" data-v="'+k+'" aria-pressed="false">'+TYPES[k]+'</button>'}).join('');
function papersRender(){
  var q=pQ.toLowerCase();
  var rows=PAPERS.filter(function(p){
    if(pT.length&&!pT.some(function(t){return p.ty.indexOf(t)>=0}))return false;
    if(q&&(p.s+' '+p.tp+' '+p.g+' '+p.c.join(' ')).toLowerCase().indexOf(q)<0)return false;
    return true});
  $('#paperList').innerHTML=rows.length?rows.map(function(p){return '<details class="acc"><summary><span class="num">'+String(p.n).padStart(2,'0')+'</span><span>'+p.s+'</span><span class="meta"><span class="pill">'+p.v+'</span></span></summary><div class="body"><p><b>'+p.tp+'.</b> '+p.g+'</p>'+ul(p.c)+'<div class="chips">'+p.ty.map(function(t){return '<span class="pill im">'+TYPES[t]+'</span>'}).join('')+'</div></div></details>'}).join(''):'<p class="note">No paper matches.</p>';
}
$$('#typeChips .chip').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-v'),i=pT.indexOf(v);if(i>=0)pT.splice(i,1);else pT.push(v);b.setAttribute('aria-pressed',i>=0?'false':'true');papersRender()})});
$('#paperSearch').addEventListener('input',function(e){pQ=e.target.value;papersRender()});
papersRender();

/* ---------- case study ---------- */
(function(){
  var rows=[{t:'Stated cut, unique stars in the Zenodo table',v:30589},{t:'Published analysis (about 18,000 to 20,000)',v:19000,k:'pub',l:'$\\approx 19{,}000$'},{t:'High-significance samples (Fig. 8)',v:17000,l:'$\\approx 17{,}000$'},{t:'Explicit ladder: with Zenodo kinematics',v:15063},{t:'After the cut $\\varpi<0.25\\mas$',v:13141}];
  $('#ladder').innerHTML=rows.map(function(r){var w=r.v/32000*100;return '<div class="lad-row"><span class="lt">'+r.t+'</span><span class="tr"><span class="fl'+(r.k?' '+r.k:'')+'" style="width:'+w.toFixed(1)+'%"></span></span><span class="lv">'+(r.l||r.v.toLocaleString('en-US'))+'</span></div>'}).join('');
})();

var ex={sample:'MP',mask:'full',zp:1,tol:1,pub:true};
function exSelect(id){var p=PATHS.filter(function(q){return q.id===id})[0];ex.sample=p.sample;ex.mask=p.mask;ex.zp=p.zp;exRender()}
function exRender(){
  var p=PATHS.filter(function(q){return q.sample===ex.sample&&q.mask===ex.mask&&q.zp===ex.zp})[0];
  var d=dev(p.v),ok=Math.abs(d)<=ex.tol;
  $$('.chips[data-f]').forEach(function(g){var f=g.getAttribute('data-f');$$('.chip',g).forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-v'))===String(ex[f])?'true':'false')})});
  $('#exTolV').innerHTML='$\\tau=\\pm'+ex.tol.toFixed(1)+'\\,\\%$';
  $('#exCount').textContent=PATHS.filter(function(q){return Math.abs(dev(q.v))<=ex.tol}).length+' of 12';
  $('#exPub').setAttribute('aria-pressed',ex.pub?'true':'false');
  $('#exCard').innerHTML='<div class="stats"><div><div class="lab">Path '+p.id+'</div><div class="exnum">'+kpcT(p.v,4,false)+'</div></div><div><div class="lab">Against the published value</div><div class="exnum sm">'+pctT(d,2)+'</div></div><div><div class="lab">Within $\\pm'+ex.tol.toFixed(1)+'\\,\\%$</div><div class="exnum sm"><span class="'+(ok?'good':'bad')+'">'+(ok?'Yes':'No')+'</span></div></div></div>'+kv([['Sample',SAMPLES[p.sample].name+', '+SAMPLES[p.sample].sub+'. Sample size $N$: '+SAMPLES[p.sample].N+'. '+SAMPLES[p.sample].def],['Sky mask',MASKS[p.mask]],['Zero-point',p.zp?'$+0.02\\mas$ added to the observed parallax':'No correction']]);
  $('#exPlot').innerHTML=spreadSvg({W:boxWidth('#exPlot',720),off:17,pad:20,sel:p.id,tol:ex.tol,pub:ex.pub,interactive:true,label:'Twelve analysis paths for sigma RGC between 2.16 and 3.53 kpc. Select a point to inspect it.'});
  $('#exTbl').innerHTML='<thead><tr><th>Path</th><th>Sample</th><th>Sky mask</th><th>Zero-point</th><th class="n">$\\sigma_{\\mathrm{RGC}}\\ (\\mathrm{kpc})$</th><th class="n">Offset</th><th>Within tolerance</th></tr></thead><tbody>'+PATHS.map(function(q){var dd=dev(q.v),o=Math.abs(dd)<=ex.tol;return '<tr data-id="'+q.id+'"'+(q.id===p.id?' class="sel"':'')+'><td class="n">'+q.id+'</td><td>'+SAMPLES[q.sample].name+'</td><td>'+MASKS[q.mask]+'</td><td>'+(q.zp?'$+0.02\\mas$':'none')+'</td><td class="n">'+q.v.toFixed(4)+'</td><td class="n">'+pctT(dd,2)+'</td><td>'+(o?'<span class="good">yes</span>':'<span class="dim">no</span>')+'</td></tr>'}).join('')+'</tbody>';
}
$$('.chips[data-f]').forEach(function(g){var f=g.getAttribute('data-f');$$('.chip',g).forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-v');ex[f]=f==='zp'?+v:v;exRender()})})});
$('#exTol').addEventListener('input',function(e){ex.tol=+e.target.value;exRender()});
$('#exPub').addEventListener('click',function(){ex.pub=!ex.pub;exRender()});
$('#exPlot').addEventListener('click',function(e){var t=e.target.closest?e.target.closest('.pt'):null;if(t)exSelect(t.getAttribute('data-id'))});
$('#exPlot').addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;var t=e.target;if(t&&t.getAttribute&&t.getAttribute('data-id')){e.preventDefault();exSelect(t.getAttribute('data-id'))}});
$('#exTbl').addEventListener('click',function(e){var tr=e.target.closest?e.target.closest('tr[data-id]'):null;if(tr)exSelect(tr.getAttribute('data-id'))});

/* main effects */
var FX=(function(){
  var lvl=function(f,v){return mean(PATHS.filter(function(p){return p[f]===v}).map(function(p){return p.v}))};
  var s={MP:lvl('sample','MP'),SN:lvl('sample','SN'),AS:lvl('sample','AS')},m={full:lvl('mask','full'),b5:lvl('mask','b5')},z={n:lvl('zp',0),y:lvl('zp',1)};
  var zpBy=function(k){var a=PATHS.filter(function(p){return p.sample===k&&p.zp===0});return mean(a.map(function(p){var o=PATHS.filter(function(q){return q.sample===p.sample&&q.mask===p.mask&&q.zp===1})[0];return o.v-p.v}))};
  var all=PATHS.map(function(p){return p.v});
  return {s:s,m:m,z:z,rs:Math.max(s.MP,s.SN,s.AS)-Math.min(s.MP,s.SN,s.AS),rm:Math.abs(m.full-m.b5),rz:Math.abs(z.n-z.y),zpBy:{MP:zpBy('MP'),SN:zpBy('SN'),AS:zpBy('AS')},min:Math.min.apply(null,all),max:Math.max.apply(null,all)};
})();
(function(){
  function card(t,range,items){return '<div class="card fxc"><h3>'+t+'</h3><div class="exnum">$'+range.toFixed(2)+'\\kpc$ <small>swing</small></div>'+items.map(function(i){return '<div class="fxr"><span>'+i[0]+'<i style="width:'+(i[1]/3.6*100).toFixed(1)+'%"></i></span><b>'+i[1].toFixed(3)+'</b></div>'}).join('')+'</div>'}
  var sg=function(v){return (v>=0?'+':'-')+Math.abs(v).toFixed(3)};
  $('#fx').innerHTML=card('Sample definition',FX.rs,[['Metal-poor',FX.s.MP],['$+\\ \\SN\\ge5$',FX.s.SN],['$+\\ \\RUWE\\lt1.4$',FX.s.AS]])+card('Parallax zero-point',FX.rz,[['None',FX.z.n],['$+0.02\\mas$',FX.z.y]])+card('Sky mask',FX.rm,[['Full sky',FX.m.full],['$|b|\\gt5^\\circ$',FX.m.b5]])+
  '<div class="card span"><h3>The zero-point effect depends on the sample</h3>'+kv([['Metal-poor','$'+sg(FX.zpBy.MP)+'\\kpc$ on average'],['$+\\ \\SN\\ge5$','$'+sg(FX.zpBy.SN)+'\\kpc$'],['$+\\ \\RUWE\\lt1.4$','$'+sg(FX.zpBy.AS)+'\\kpc$']])+'<p class="fine">Averaged over the two sky masks. The sign reverses between the metal-poor sample and the $\\SN$-selected ones.</p></div>';
})();

/* ---------- equations ---------- */
var EQS=[
 {t:'Distance from parallax',k:'b',f:String.raw`d=\frac{1}{\varpi}`,x:String.raw`$d$ in $\mathrm{kpc}$ when $\varpi$ is in $\mathrm{mas}$. Reliable at high $\SN$; at low $\SN$ the inversion is biased and noisy, so the distance estimator is itself a hidden choice.`},
 {t:'Zero-point correction',k:'p',f:String.raw`\varpi_{\mathrm{corr}}=\varpi_{\mathrm{obs}}-Z,\qquad Z=-0.02\ \mathrm{mas}`,x:String.raw`The paper applies $+0.02\mas$ to the observed parallax. Lindegren et al. (2021) give $Z$ as a function of magnitude, colour and ecliptic latitude, so a constant is a simplification.`},
 {t:'Fractional distance shift',k:'c',f:String.raw`\frac{\Delta d}{d}=-\frac{\delta}{\varpi+\delta}`,x:String.raw`From $d_c/d_u-1$ with $d=1/\varpi$ and $\delta=0.02\mas$. At $\varpi=0.125\mas$ the shift is $-13.8\%$; at $\varpi=0.5\mas$, $-3.8\%$.`},
 {t:'Parallax significance cut',k:'p',f:String.raw`\frac{\varpi}{\sigma_{\varpi}}\ge k\;\Longrightarrow\; d_{\max}=\frac{1}{k\,\sigma_{\varpi}}`,x:String.raw`With $k=5$ and $\sigma_{\varpi}=0.03\mas$ the farthest accepted star is $6.7\kpc$. The cut truncates the far side of the sample and shrinks its apparent scale.`},
 {t:'Size of the design',k:'p',f:String.raw`N_{\mathrm{paths}}=\prod_i k_i=3\times2\times2=12`,x:'Full factorial over sample definition, sky mask and zero-point treatment. Every other choice is fixed.'},
 {t:'Spread across paths',k:'c',f:String.raw`R=\sigma_{\max}-\sigma_{\min}=`+FX.max.toFixed(2)+'-'+FX.min.toFixed(2)+'='+(FX.max-FX.min).toFixed(2)+String.raw`\ \mathrm{kpc}`,x:'That is $'+((FX.max-FX.min)/PUB*100).toFixed(0)+'\\%$ of the published $2.70\\kpc$, from choices the paper leaves open.'},
 {t:'Main effect of a factor',k:'c',f:String.raw`\begin{gathered}\mathrm{ME}(f)=\max_{\ell}m_{f,\ell}-\min_{\ell}m_{f,\ell},\\[4pt] m_{f,\ell}=\frac{1}{|\mathcal{P}_{f,\ell}|}\sum_{p\in\mathcal{P}_{f,\ell}}\sigma_p\end{gathered}`,x:'Here: sample $'+FX.rs.toFixed(2)+'\\kpc$, zero-point $'+FX.rz.toFixed(2)+'\\kpc$, sky mask $'+FX.rm.toFixed(2)+'\\kpc$.'},
 {t:'Zero-point effect within a sample',k:'c',f:String.raw`\Delta_{\mathrm{ZP}}(s)=\frac12\sum_{m\in\{\mathrm{full},\,b5\}}\bigl[\sigma_{s,m,+0.02}-\sigma_{s,m,0}\bigr]`,x:'Metal-poor $'+FX.zpBy.MP.toFixed(2)+'\\kpc$; $\\SN$-selected $'+FX.zpBy.SN.toFixed(2)+'\\kpc$ and $'+FX.zpBy.AS.toFixed(2)+'\\kpc$.'},
 {t:'Match criterion (absent from the paper)',k:'c',f:String.raw`\frac{|\sigma-2.70|}{2.70}\le\tau`,x:'Path P02 is at $'+Math.abs(dev(2.7033)).toFixed(2)+'\\%$ and P04 at $'+Math.abs(dev(2.6849)).toFixed(2)+'\\%$. Which counts as the match depends entirely on $\\tau$.'},
 {t:'Wilson interval for a proportion',k:'c',f:String.raw`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`,x:'For 11 of 13 and $z=1.96$ the interval is about $'+(wilson(11,13)[0]*100).toFixed(0)+'\\%$ to $'+(wilson(11,13)[1]*100).toFixed(0)+'\\%$.'},
 {t:'Agreement between auditors (suggested)',k:'c',f:String.raw`\kappa=\frac{p_o-p_e}{1-p_e}`,x:'Cohen’s kappa between the two model rounds, or between a model and the human reviewer, would quantify how interpretive the audit labels are.'}
];
$('#eqGrid').innerHTML=EQS.map(function(e){return '<div class="eq"><div class="t">'+e.t+tag(e.k)+'</div><div class="f">$$'+e.f+'$$</div><div class="x">'+e.x+'</div></div>'}).join('');

/* ---------- parallax calculator ---------- */
function cDraw(){
  var p=+$('#cPlx').value,dlt=+$('#cDelta').value;
  var W=Math.max(300,Math.round(boxWidth('#cPlot',720))),H=Math.round(Math.max(230,Math.min(310,W*.4))),L=50,R=14,T=14,B=42,lo=Math.log10(0.04),hi=Math.log10(1);
  var ymax=Math.max(30,Math.ceil(dlt/(0.04+dlt)*100/5)*5);
  var px=function(v){return L+(Math.log10(v)-lo)/(hi-lo)*(W-L-R)},py=function(q){return T+q/ymax*(H-T-B)};
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" class="plot" role="img" aria-label="Fractional distance change against observed parallax">';
  for(var q=0;q<=ymax;q+=10){s+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+py(q)+'" y2="'+py(q)+'"/>'+fo(L-8,py(q)-9,48,18,'$'+(q===0?'0':'-'+q)+'\\%$','ax','end')}
  [0.05,0.1,0.2,0.5,1].forEach(function(v){s+='<line class="gl" x1="'+px(v)+'" x2="'+px(v)+'" y1="'+T+'" y2="'+(H-B)+'"/><text class="ax" x="'+px(v)+'" y="'+(H-B+17)+'" text-anchor="middle">'+v+'</text>'});
  s+=fo((L+W-R)/2,H-21,300,20,'observed parallax $\\varpi$ ($\\mathrm{mas}$, log scale)','ax','middle');
  var d='';for(var i=0;i<=80;i++){var v=Math.pow(10,lo+(hi-lo)*i/80),y=dlt/(v+dlt)*100;d+=(i?'L':'M')+px(v).toFixed(1)+' '+py(y).toFixed(1)}
  var yc=dlt/(p+dlt)*100;
  s+='<path class="curve" d="'+d+'"/><line class="mkline" x1="'+px(p)+'" x2="'+px(p)+'" y1="'+T+'" y2="'+(H-B)+'"/><circle class="mk" cx="'+px(p)+'" cy="'+py(yc)+'" r="6"/>';
  $('#cPlot').innerHTML=s+'</svg>';
}
function cUpdate(){
  var plx=$('#cPlx'),dl=$('#cDelta'),p=+plx.value,dlt=+dl.value,du=1/p,dc=1/(p+dlt),ch=(dc-du)/du*100;
  $('#cPlxV').innerHTML='$'+p.toFixed(3)+'\\mas$';$('#cDeltaV').innerHTML='$'+dlt.toFixed(3)+'\\mas$';
  $('#cOut').innerHTML=[['Uncorrected distance',kpcT(du,2,false)],['Corrected distance',kpcT(dc,2,false)],['Change',kpcT(dc-du,2)],['Fractional change',pctT(ch,1)]].map(function(r){return '<div class="card flat"><div class="lab">'+r[0]+'</div><div class="exnum sm">'+r[1]+'</div></div>'}).join('');
  cDraw();
  var sig=+$('#cSig').value,k=+$('#cK').value;
  if(sig>0&&k>0){$('#cMax').innerHTML='$'+(1/(k*sig)).toFixed(1)+'\\kpc$';$('#cNote').innerHTML='A star at the Galactic centre (about $8\\kpc$, $\\varpi\\approx0.125\\mas$) passes a $'+k+'\\sigma$ cut only if $\\sigma_{\\varpi}\\le'+(0.125/k).toFixed(3)+'\\mas$. '+tag('c')+'Parallax $\\SN$ selection removes distant stars, which is a plausible reason the $\\SN$-based samples give smaller $\\sigma_{\\mathrm{RGC}}$.'}
}
['#cPlx','#cDelta','#cSig','#cK'].forEach(function(s){$(s).addEventListener('input',cUpdate)});

/* ---------- assumptions ---------- */
var ASSUMP=D.ASSUMP,asG='all',asK='all',asQ='';
var groups=['all'].concat(ASSUMP.map(function(a){return a.g}).filter(function(g,i,arr){return arr.indexOf(g)===i}));
$('#asGroup').innerHTML=groups.map(function(g,i){return '<button type="button" class="chip" data-v="'+g+'" aria-pressed="'+(i===0)+'">'+(g==='all'?'All groups':g)+'</button>'}).join('');
function asRender(){
  var q=asQ.toLowerCase();
  var rows=ASSUMP.filter(function(a){return (asG==='all'||a.g===asG)&&(asK==='all'||a.k===asK)&&(!q||(a.t+' '+a.x+' '+a.r).toLowerCase().indexOf(q)>=0)});
  $('#asCount').textContent=rows.length+' of '+ASSUMP.length+' assumptions shown';
  $('#asList').innerHTML=rows.map(function(a){return '<details class="acc"><summary><span>'+a.t+'</span><span class="meta"><span class="pill">'+a.g+'</span><span class="pill '+(a.k==='explicit'?'ex':'imp')+'">'+a.k+'</span></span></summary><div class="body"><p><b>Where it shows up.</b> '+a.x+'</p><p><b>How it could fail.</b> '+a.r+'</p></div></details>'}).join('')||'<p class="note">Nothing matches.</p>';
}
var gb=$$('#asGroup .chip');gb.forEach(function(b,i){b.addEventListener('click',function(){asG=b.getAttribute('data-v');pressGroup(gb,i);asRender()})});
var kb=$$('#asKind .chip');kb.forEach(function(b,i){b.addEventListener('click',function(){asK=b.getAttribute('data-v');pressGroup(kb,i);asRender()})});
$('#asSearch').addEventListener('input',function(e){asQ=e.target.value;asRender()});
asRender();

/* ---------- critique ---------- */
var DIMS=D.DIMS,scoreNow=DIMS.map(function(d){return d[1]});
function scoreRender(){
  $('#score').innerHTML=DIMS.map(function(d,i){var s='<div class="scrow"><span class="sname">'+d[0]+'</span><span class="dots" role="group" aria-label="'+d[0]+' rating">';for(var j=1;j<=5;j++)s+='<button type="button" class="dot'+(j<=scoreNow[i]?' on':'')+'" data-i="'+i+'" data-j="'+j+'" aria-label="'+j+' of 5"></button>';return s+'</span><span class="snote">'+d[2]+'</span></div>'}).join('');
  $$('#score .dot').forEach(function(b){b.addEventListener('click',function(){scoreNow[+b.getAttribute('data-i')]=+b.getAttribute('data-j');scoreRender()})});
}
$('#scoreReset').addEventListener('click',function(){scoreNow=DIMS.map(function(d){return d[1]});scoreRender()});
scoreRender();
$('#strengths').innerHTML=D.STRENGTHS.map(function(s){return '<details class="acc"><summary><span>'+s[0]+'</span></summary><div class="body"><p>'+s[1]+'</p></div></details>'}).join('');
var WEAK=D.WEAK,wSev='all';
function weakRender(){
  $('#weak').innerHTML=WEAK.filter(function(w){return wSev==='all'||w.sv===wSev}).map(function(w){return '<details class="acc"><summary><span>'+w.t+'</span><span class="meta"><span class="sev '+w.sv+'">'+(w.sv==='med'?'Medium':w.sv.charAt(0).toUpperCase()+w.sv.slice(1))+'</span></span></summary><div class="body"><p>'+w.x+'</p><p><b>Possible fix.</b> '+w.f+'</p></div></details>'}).join('');
}
var sb=$$('#sevChips .chip');sb.forEach(function(b,i){b.addEventListener('click',function(){wSev=b.getAttribute('data-v');pressGroup(sb,i);weakRender()})});
weakRender();
$('#improve').innerHTML=D.IMPROVE.map(function(r){return '<details class="acc"><summary><span>'+r[1]+'</span><span class="meta"><span class="pill">'+r[0]+'</span></span></summary><div class="body"><p>'+r[2]+'</p></div></details>'}).join('');

/* ---------- seminar kit ---------- */
var TALK=D.TALK,total=TALK.reduce(function(s,r){return s+r[0]},0);
$('#talkNote').textContent='About '+total+' minutes. For a 30-minute slot, trim the background and the second critique slide.';
$('#talkTbl').innerHTML='<thead><tr><th class="n">#</th><th>Slide</th><th class="n">Minutes</th><th>Chapter</th></tr></thead><tbody>'+TALK.map(function(r,i){var pm=PAGEMAP[r[2]]||['index',r[2]];return '<tr><td class="n">'+(i+1)+'</td><td>'+r[1]+'</td><td class="n">'+r[0]+'</td><td><a href="'+pm[0]+'.html">'+pm[1]+'</a></td></tr>'}).join('')+'</tbody>';
$('#qa').innerHTML=D.QA.map(function(q){return '<details class="acc"><summary><span>'+q[0]+'</span></summary><div class="body"><p>'+q[1]+'</p></div></details>'}).join('');
(function(){
  var QUIZ=D.QUIZ,box=$('#quiz'),i=0,score=0,done=false;
  function show(){
    if(i>=QUIZ.length){box.innerHTML='<div class="qmeta">Finished</div><p class="quizq">You scored '+score+' of '+QUIZ.length+'.</p><button type="button" class="chip" id="qReset">Start again</button>';$('#qReset').addEventListener('click',function(){i=0;score=0;show()});return}
    var q=QUIZ[i];done=false;
    box.innerHTML='<div class="qmeta">Question '+(i+1)+' of '+QUIZ.length+' · score '+score+'</div><p class="quizq">'+q.q+'</p>'+q.o.map(function(o,j){return '<button type="button" class="qopt" data-j="'+j+'">'+o+'</button>'}).join('')+'<div class="qfb" id="qfb" hidden></div>';
    $$('.qopt',box).forEach(function(b){b.addEventListener('click',function(){
      if(done)return;done=true;var j=+b.getAttribute('data-j');
      $$('.qopt',box).forEach(function(x,k){if(k===q.a)x.classList.add('right');else if(k===j)x.classList.add('wrong')});
      if(j===q.a)score++;
      var fb=$('#qfb');fb.hidden=false;fb.innerHTML='<b>'+(j===q.a?'Correct. ':'Not quite. ')+'</b>'+q.e+'<br><button type="button" class="chip" id="qNext">'+(i===QUIZ.length-1?'See score':'Next question')+'</button>';
      $('#qNext').addEventListener('click',function(){i++;show()});
    })});
  }
  show();
})();
var GLOSS=D.GLOSS;
function glRender(q){q=(q||'').toLowerCase();$('#glList').innerHTML=GLOSS.filter(function(g){return !q||(g[0]+' '+g[2]).toLowerCase().indexOf(q)>=0}).map(function(g){return '<div class="card"><h3>'+g[0]+tag(g[1])+'</h3><p>'+g[2]+'</p></div>'}).join('')||'<p class="note">No term matches.</p>'}
$('#glSearch').addEventListener('input',function(e){glRender(e.target.value)});
glRender('');

/* ---------- figures ---------- */
function figHtml(f,n){
  return '<figure class="fig" id="figure-'+n+'"><a class="plate" href="assets/img/'+f.id+'.svg" target="_blank" rel="noopener" aria-label="Open figure '+n+' full size"><img src="assets/img/'+f.id+'.svg" alt="'+f.alt+'" loading="lazy" decoding="async"></a>'+
    '<figcaption><b>Figure '+n+'. '+f.title+'.</b> '+f.cap.replace(/~/g,' ')+'<span class="swipe"> Swipe the figure sideways to see all of it.</span> <a href="assets/img/'+f.id+'.svg" target="_blank" rel="noopener">Open full size</a></figcaption></figure>';
}
(function(){
  var F=D.FIGS;
  $('#figGrid').innerHTML=F.map(function(f,i){return figHtml(f,i+1)}).join('');
  $('#figIndex').innerHTML=F.map(function(f,i){return '<li><a href="#figure-'+(i+1)+'"><span class="n">'+(i+1)+'</span>'+f.title+'</a></li>'}).join('');
  $$('[data-fig]').forEach(function(el){
    var id=el.getAttribute('data-fig');
    for(var i=0;i<F.length;i++){if(F[i].id===id){el.innerHTML=figHtml(F[i],i+1);break}}
  });
})();

/* ---------- repository link (only on github.io) ---------- */
(function(){
  var m=location.hostname.match(/^([^.]+)\.github\.io$/);
  if(!m)return;
  var repo=location.pathname.split('/')[1]||location.hostname;
  $$('[data-repo]').forEach(function(a){a.href='https://github.com/'+m[1]+'/'+repo;a.hidden=false});
})();

/* ---------- mathematics (KaTeX, bundled in assets/vendor) ---------- */
(function(){
  var main=$('#main'),busy=false,timer=null;
  function render(){
    if(typeof window.renderMathInElement!=='function')return;
    busy=true;
    try{window.renderMathInElement(main,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false,macros:{'\\kpc':'\\,\\mathrm{kpc}','\\mas':'\\,\\mathrm{mas}','\\SN':'\\mathrm{S/N}','\\MH':'[\\mathrm{M/H}]','\\RUWE':'\\mathrm{RUWE}'},ignoredTags:['script','noscript','style','textarea','pre','code']})}catch(e){}
    busy=false;
  }
  new MutationObserver(function(){if(busy)return;clearTimeout(timer);timer=setTimeout(render,25)}).observe(main,{childList:true,subtree:true});
  render();
})();

/* ---------- plots follow the width of their container ---------- */
if(has('#heroPlot'))drawHero();if(has('#exPlot'))exRender();if(has('#cPlx'))cUpdate();
(function(){
  var last=window.innerWidth,t=null;
  window.addEventListener('resize',function(){
    clearTimeout(t);t=setTimeout(function(){
      if(Math.abs(window.innerWidth-last)<8)return;last=window.innerWidth;
      if(has('#heroPlot'))drawHero();if(has('#exPlot'))exRender();if(has('#cPlot'))cDraw();
    },140);
  });
})();
})();
