(function(){
'use strict';
var D=window.SEMINAR_DATA;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var mean=function(a){return a.reduce(function(x,y){return x+y},0)/a.length};
var PUB=2.70;
function tag(k){return k==='p'?'<span class="src p">Paper</span>':k==='b'?'<span class="src b">Background</span>':'<span class="src c">Critique</span>'}
function dots(n,max){var s='<span class="dots" aria-label="'+n+' of '+(max||5)+'">';for(var i=1;i<=(max||5);i++)s+='<span class="dot'+(i<=n?' on':'')+'"></span>';return s+'</span>'}
function kv(rows){return '<dl class="dl">'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('')+'</dl>'}
function ul(a){return '<ul>'+a.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'}
function pressGroup(btns,i){btns.forEach(function(b,j){b.setAttribute('aria-pressed',j===i?'true':'false')})}
function stepper(stepsEl,detailEl,items,renderDetail,initial){
  stepsEl.innerHTML=items.map(function(it,i){return '<button type="button" class="step" aria-pressed="false" data-i="'+i+'"><b>'+it.t+'</b><span>'+it.s+'</span></button>'}).join('');
  var btns=$$('.step',stepsEl);
  function sel(i){pressGroup(btns,i);detailEl.innerHTML=renderDetail(items[i],i)}
  btns.forEach(function(b,i){b.addEventListener('click',function(){sel(i)})});
  sel(initial||0);
}

/* theme */
(function(){
  var root=document.documentElement,btn=$('#themeBtn'),modes=['system','light','dark'],cur='system';
  try{var s=localStorage.getItem('wang26-theme');if(s&&modes.indexOf(s)>=0)cur=s}catch(e){}
  function apply(){if(cur==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',cur);btn.textContent='Theme: '+cur}
  btn.addEventListener('click',function(){cur=modes[(modes.indexOf(cur)+1)%3];try{localStorage.setItem('wang26-theme',cur)}catch(e){}apply()});
  apply();
})();

/* scroll spy */
(function(){
  var links=$$('#nav a'),nav=$('#nav');
  var secs=links.map(function(a){return $(a.getAttribute('href'))});
  if(!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){var on=l.getAttribute('href')==='#'+e.target.id;l.classList.toggle('on',on);if(on&&nav.scrollWidth>nav.clientWidth&&getComputedStyle(nav).flexDirection==='row'){nav.scrollLeft=Math.max(0,l.offsetLeft-40)}})}})},{rootMargin:'-15% 0px -75% 0px'});
  secs.forEach(function(s){if(s)io.observe(s)});
})();

/* ---------- DATA: path values (transcribed from Fig. 8 labels) ---------- */
var SAMPLES=D.SAMPLES;
var MASKS=D.MASKS;
var PATHS=D.PATHS;
function dev(v){return (v-PUB)/PUB*100}

function spreadSvg(c){
  var W=720,L=170,R=24,x0=2.0,x1=3.8,T=26,B=c.H-40;
  var px=function(v){return L+(v-x0)/(x1-x0)*(W-L-R)};
  var s='<svg viewBox="0 0 '+W+' '+c.H+'" class="plot" role="img" aria-label="'+c.label+'">';
  if(c.pub&&c.tol!=null){var lo=Math.max(x0,PUB*(1-c.tol/100)),hi=Math.min(x1,PUB*(1+c.tol/100));s+='<rect class="band" x="'+px(lo)+'" y="'+T+'" width="'+Math.max(1.6,px(hi)-px(lo))+'" height="'+(B-T)+'"/>'}
  for(var i=0;i<=9;i++){var v=2+0.2*i,x=px(v);s+='<line class="gl" x1="'+x+'" x2="'+x+'" y1="'+T+'" y2="'+B+'"/><text class="ax" x="'+x+'" y="'+(B+15)+'" text-anchor="middle">'+v.toFixed(1)+'</text>'}
  s+='<text class="ax" x="'+((L+W-R)/2)+'" y="'+(c.H-6)+'" text-anchor="middle">σ<tspan dy="3" font-size="8">RGC</tspan><tspan dy="-3"> (kpc)</tspan></text>';
  var keys=['MP','SN','AS'];
  keys.forEach(function(k,ix){
    var y=c.rows[k];
    if(ix>0)s+='<line class="sep" x1="8" x2="'+(W-R)+'" y1="'+(y-c.off-c.gap)+'" y2="'+(y-c.off-c.gap)+'"/>';
    s+='<text class="rl" x="8" y="'+(y-2)+'">'+SAMPLES[k].name+'</text><text class="rs" x="8" y="'+(y+12)+'">'+SAMPLES[k].sub+'</text>';
    s+='<text class="rs" x="'+(L+4)+'" y="'+(y-c.off+3.5)+'">all sky</text><text class="rs" x="'+(L+4)+'" y="'+(y+c.off+3.5)+'">|b| &gt; 5°</text>';
  });
  if(c.pub){var xp=px(PUB);s+='<line class="publine" x1="'+xp+'" x2="'+xp+'" y1="'+(T-4)+'" y2="'+B+'"/><text class="publab" x="'+xp+'" y="'+(T-9)+'" text-anchor="middle">published ≈ 2.70</text>'}
  PATHS.forEach(function(p){
    var cy=c.rows[p.sample]+(p.mask==='full'?-c.off:c.off),cx=px(p.v);
    var lab='Path '+p.id+': '+SAMPLES[p.sample].name+', '+(p.mask==='full'?'full sky':'|b| over 5 degrees')+', '+(p.zp?'+0.02 mas':'no correction')+', '+p.v.toFixed(4)+' kpc';
    if(c.interactive){
      if(c.sel===p.id)s+='<circle class="ring" cx="'+cx+'" cy="'+cy+'" r="10"/>';
      s+='<circle class="pt p'+p.zp+'" data-id="'+p.id+'" cx="'+cx+'" cy="'+cy+'" r="6" tabindex="0" role="button" aria-label="'+lab+'"/>';
    }else s+='<circle class="p'+p.zp+'" cx="'+cx+'" cy="'+cy+'" r="5.5"><title>'+lab+'</title></circle>';
  });
  return s+'</svg>';
}
$('#heroPlot').innerHTML=spreadSvg({H:232,rows:{MP:58,SN:114,AS:170},off:11,gap:14,pub:true,tol:null,label:'Twelve analysis paths for the same quantity range from 2.16 to 3.53 kpc. The published value is about 2.70 kpc.'});

/* ---------- OVERVIEW ---------- */
var STORY=D.STORY;
stepper($('#storySteps'),$('#storyDetail'),STORY,function(it){return '<h4>'+it.h+'</h4><p>'+it.b+'</p>'+ul(it.x)});

var THREE=D.THREE;
$('#threeWay').innerHTML=THREE.map(function(t){return '<div class="card"><h4>'+t.t+'</h4><p>'+t.b+'</p>'+kv([['Handled by',t.h],['Evidence',t.e]])+'</div>'}).join('');

/* ---------- CONTRIBUTIONS ---------- */
var CONTRIB=D.CONTRIB;
$('#contribGrid').innerHTML=CONTRIB.map(function(c){return '<div class="card"><h4>'+c.t+'</h4><p>'+c.p+'</p><p style="margin:0;font-size:13.5px;color:var(--muted)">'+dots(c.ev)+' &nbsp;'+c.n+'</p></div>'}).join('');

var CLAIMS=D.CLAIMS;
$('#claimsTbl').innerHTML='<thead><tr><th>Claim</th><th>Where</th><th>Checkable from the manuscript?</th><th>Confidence</th></tr></thead><tbody>'+CLAIMS.map(function(r){return '<tr><td>'+r[0]+'</td><td class="n">'+r[1]+'</td><td>'+r[2]+'</td><td>'+dots(r[3])+'</td></tr>'}).join('')+'</tbody>';

/* ---------- BACKGROUND ---------- */
var BG=D.BG;
$('#bgList').innerHTML=BG.map(function(b,i){return '<details class="acc"'+(i===4?' open':'')+'><summary>'+b.t+'<span class="meta">'+tag(b.k)+'</span></summary><div class="body"><p>'+b.b+'</p><p><b>Why it matters here.</b> '+b.w+'</p></div></details>'}).join('');

var READ=D.READ;
$('#readMap').innerHTML=READ.map(function(r){return '<div class="card"><h4>'+r.g+'</h4>'+ul(r.i)+'</div>'}).join('');

/* ---------- AI COMPONENTS ---------- */
var AIROWS=D.AIROWS;
$('#aiTbl').innerHTML='<thead><tr><th>Component</th><th>Reads</th><th>Produces</th><th>Why it is there</th><th>Failure signature</th></tr></thead><tbody>'+AIROWS.map(function(r){return '<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+r[4]+'</td></tr>'}).join('')+'</tbody>';

var TRACE=D.TRACE;
stepper($('#traceSteps'),$('#traceDetail'),TRACE,function(it,i){return '<div class="lab">Step '+(i+1)+' of '+TRACE.length+'</div><h4 style="margin-top:6px">'+it.t+': '+it.s+'</h4><p style="margin:0">'+it.x+'</p>'});

/* ---------- AGENTS ---------- */
var ROLES=D.ROLES;
function roleHtml(k){var r=ROLES[k];return '<div class="lab">'+tag(r.tg)+'</div><h3 style="margin-top:8px">'+r.n+'</h3><p>'+r.does+'</p>'+kv([['Reads',r.reads],['Writes',r.writes],['Decides',r.decides],['Can go wrong',ul(r.risks)],['Not specified',r.silent]])}
(function(){
  var nodes=$$('#agentSvg .node');
  function sel(k){nodes.forEach(function(n){n.classList.toggle('sel',n.getAttribute('data-role')===k)});$('#roleDetail').innerHTML=roleHtml(k)}
  nodes.forEach(function(n){var k=n.getAttribute('data-role');n.addEventListener('click',function(){sel(k)});n.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel(k)}})});
  sel('coder');
})();

/* ---------- WORKFLOWS ---------- */
var PIPE=D.PIPE;
stepper($('#pipeSteps'),$('#pipeDetail'),PIPE,function(it,i){return '<div class="lab">Stage '+(i+1)+' of 5</div><h4 style="margin-top:6px">'+it.t+'</h4>'+kv([['Handled by',it.who],['Input',it.inp],['Output',it.out],['Checked by',it.chk],['Typical gap',it.gap]])});

var RIX=D.RIX;
stepper($('#rixSteps'),$('#rixDetail'),RIX,function(it,i){return '<div class="lab">Stage 0'+(i+1)+'</div><h4 style="margin-top:6px">'+it.t+'</h4><p>'+it.b+'</p><p style="margin:0;color:var(--muted)">'+it.x+'</p>'});

$('#attrTbl').innerHTML='<thead><tr><th>Family</th><th>Model</th><th>Workflow</th><th>Problem</th></tr></thead><tbody>'+
 [['A','varied','locked','locked'],['B','locked','varied','locked'],['C','locked','locked','varied']].map(function(r){return '<tr><td><b>'+r[0]+'</b></td>'+r.slice(1).map(function(c){return '<td><span class="pill'+(c==='varied'?' ex':'')+'">'+c+'</span></td>'}).join('')+'</tr>'}).join('')+'</tbody>';

/* ---------- AUDIT ---------- */
function wilson(k,n,z){z=z||1.96;var p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-h,c+h]}
var CATS=D.CATS;
var den=13,aSel='any';
function auditRender(){
  $('#auditBars').innerHTML=CATS.map(function(c){var share=c.k==='any'&&den===11?100:c.n/den*100;return '<button type="button" class="bar'+(c.k==='any'?' top':'')+(aSel===c.k?' on':'')+'" data-k="'+c.k+'"><span>'+c.t+'</span><span class="tr"><span class="fl" style="width:'+share.toFixed(1)+'%"></span></span><span class="v">'+c.n+'/13</span></button>'}).join('');
  $$('#auditBars .bar').forEach(function(b){b.addEventListener('click',function(){aSel=b.getAttribute('data-k');auditRender()})});
  var c=CATS.filter(function(x){return x.k===aSel})[0];
  $('#auditDetail').innerHTML='<h4>'+c.t+' <span class="mono" style="color:var(--muted)">'+c.n+' of 13 papers, '+(c.n/13*100).toFixed(0)+'%'+(c.k!=='any'?'; '+(c.n/11*100).toFixed(0)+'% of the 11 affected':'')+'</span></h4><p style="margin:0">'+c.d+'</p>';
  var w=wilson(11,13);
  $('#auditStat').innerHTML=tag('c')+' Categories overlap, so counts sum to '+CATS.slice(1).reduce(function(s,c){return s+c.n},0)+' across 11 papers, about '+(CATS.slice(1).reduce(function(s,c){return s+c.n},0)/11).toFixed(1)+' categories per affected paper. A 95% Wilson interval for 11 of 13 is roughly '+(w[0]*100).toFixed(0)+'% to '+(w[1]*100).toFixed(0)+'%. The paper reports no interval; this is my calculation.';
}
$$('#denChips .chip').forEach(function(b,i,all){b.addEventListener('click',function(){den=+b.getAttribute('data-den');pressGroup(all,i);auditRender()})});
auditRender();

var TYPES=D.TYPES;
var PAPERS=D.PAPERS;
var pT=[],pQ='';
$('#typeChips').innerHTML=Object.keys(TYPES).map(function(k){return '<button type="button" class="chip" data-v="'+k+'" aria-pressed="false">'+TYPES[k]+'</button>'}).join('');
function papersRender(){
  var q=pQ.toLowerCase();
  var rows=PAPERS.filter(function(p){
    if(pT.length&&!pT.some(function(t){return p.ty.indexOf(t)>=0}))return false;
    if(q&&(p.s+' '+p.tp+' '+p.g+' '+p.c.join(' ')).toLowerCase().indexOf(q)<0)return false;
    return true});
  $('#paperList').innerHTML=rows.length?rows.map(function(p){return '<details class="acc"><summary><span class="mono" style="color:var(--muted)">'+String(p.n).padStart(2,'0')+'</span><span>'+p.s+'</span><span class="meta"><span class="pill">'+p.v+'</span></span></summary><div class="body"><p><b>'+p.tp+'.</b> '+p.g+'</p>'+ul(p.c)+'<div class="chips" style="margin-top:8px">'+p.ty.map(function(t){return '<span class="pill im">'+TYPES[t]+'</span>'}).join('')+'</div></div></details>'}).join(''):'<p class="note">No paper matches.</p>';
}
$$('#typeChips .chip').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-v'),i=pT.indexOf(v);if(i>=0)pT.splice(i,1);else pT.push(v);b.setAttribute('aria-pressed',i>=0?'false':'true');papersRender()})});
$('#paperSearch').addEventListener('input',function(e){pQ=e.target.value;papersRender()});
papersRender();

/* ---------- CASE ---------- */
(function(){
  var rows=[{t:'Stated cut, unique stars in the Zenodo table',v:30589,k:''},{t:'Published analysis (≈ 18,000 to 20,000)',v:19000,k:'pub',l:'≈ 18k to 20k'},{t:'High-significance samples (Fig. 8)',v:17000,k:'',l:'≈ 17k'},{t:'Explicit ladder: with Zenodo kinematics',v:15063,k:''},{t:'After parallax &lt; 0.25 mas',v:13141,k:''}];
  $('#ladder').innerHTML=rows.map(function(r){var w=r.v/32000*100;return '<div class="lad-row"><span>'+r.t+'</span><span class="tr"><span class="fl '+r.k+'" style="width:'+w.toFixed(1)+'%">'+(r.l||r.v.toLocaleString('en-US'))+'</span></span></div>'}).join('');
})();

var ex={sample:'MP',mask:'full',zp:1,tol:1,pub:true};
function exSelect(id){var p=PATHS.filter(function(q){return q.id===id})[0];ex.sample=p.sample;ex.mask=p.mask;ex.zp=p.zp;exRender()}
function exRender(){
  var p=PATHS.filter(function(q){return q.sample===ex.sample&&q.mask===ex.mask&&q.zp===ex.zp})[0];
  var d=dev(p.v),ok=Math.abs(d)<=ex.tol;
  $$('.chips[data-f]').forEach(function(g){var f=g.getAttribute('data-f');$$('.chip',g).forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-v'))===String(ex[f])?'true':'false')})});
  $('#exTolV').textContent=ex.tol.toFixed(1);
  var n=PATHS.filter(function(q){return Math.abs(dev(q.v))<=ex.tol}).length;
  $('#exCount').textContent=n+' of 12';
  $('#exPub').setAttribute('aria-pressed',ex.pub?'true':'false');
  $('#exCard').innerHTML='<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:baseline"><div><div class="lab">Path '+p.id+'</div><div class="exnum">'+p.v.toFixed(4)+' <span style="font-size:15px;font-weight:500">kpc</span></div></div><div><div class="lab">Versus published 2.70</div><div class="exnum" style="font-size:22px">'+(d>=0?'+':'')+d.toFixed(2)+'%</div></div><div><div class="lab">Within ±'+ex.tol.toFixed(1)+'%</div><div class="exnum" style="font-size:22px" class="'+(ok?'good':'bad')+'"><span class="'+(ok?'good':'bad')+'">'+(ok?'Yes':'No')+'</span></div></div></div>'+kv([['Sample',SAMPLES[p.sample].name+', '+SAMPLES[p.sample].sub+'. N = '+SAMPLES[p.sample].N+'. '+SAMPLES[p.sample].def],['Sky mask',MASKS[p.mask]],['Zero-point',p.zp?'+0.02 mas added to the observed parallax':'No correction']]);
  $('#exPlot').innerHTML=spreadSvg({H:330,rows:{MP:92,SN:172,AS:252},off:15,gap:25,sel:p.id,tol:ex.tol,pub:ex.pub,interactive:true,label:'Twelve analysis paths for sigma RGC between 2.16 and 3.53 kpc. Select a point to inspect it.'});
  $('#exTbl').innerHTML='<thead><tr><th>Path</th><th>Sample</th><th>Mask</th><th>Zero-point</th><th>$\\sigma_{\\mathrm{RGC}}$ (kpc)</th><th>Offset</th><th>Within tolerance</th></tr></thead><tbody>'+PATHS.map(function(q){var dd=dev(q.v),o=Math.abs(dd)<=ex.tol;return '<tr data-id="'+q.id+'" style="cursor:pointer'+(q.id===p.id?';background:var(--accent-soft)':'')+'"><td class="n">'+q.id+'</td><td>'+SAMPLES[q.sample].name+'</td><td>'+MASKS[q.mask]+'</td><td>'+(q.zp?'+0.02 mas':'none')+'</td><td class="n">'+q.v.toFixed(4)+'</td><td class="n">'+(dd>=0?'+':'')+dd.toFixed(2)+'%</td><td>'+(o?'<span class="good">yes</span>':'<span style="color:var(--muted)">no</span>')+'</td></tr>'}).join('')+'</tbody>';
}
$$('.chips[data-f]').forEach(function(g){var f=g.getAttribute('data-f');$$('.chip',g).forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-v');ex[f]=f==='zp'?+v:v;exRender()})})});
$('#exTol').addEventListener('input',function(e){ex.tol=+e.target.value;exRender()});
$('#exPub').addEventListener('click',function(){ex.pub=!ex.pub;exRender()});
$('#exPlot').addEventListener('click',function(e){var t=e.target.closest?e.target.closest('.pt'):null;if(t)exSelect(t.getAttribute('data-id'))});
$('#exPlot').addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;var t=e.target;if(t&&t.getAttribute&&t.getAttribute('data-id')){e.preventDefault();exSelect(t.getAttribute('data-id'))}});
$('#exTbl').addEventListener('click',function(e){var tr=e.target.closest?e.target.closest('tr[data-id]'):null;if(tr)exSelect(tr.getAttribute('data-id'))});
exRender();

/* main effects */
var FX=(function(){
  var lvl=function(f,v){return mean(PATHS.filter(function(p){return p[f]===v}).map(function(p){return p.v}))};
  var s={MP:lvl('sample','MP'),SN:lvl('sample','SN'),AS:lvl('sample','AS')},m={full:lvl('mask','full'),b5:lvl('mask','b5')},z={n:lvl('zp',0),y:lvl('zp',1)};
  var zpBy=function(k){var a=PATHS.filter(function(p){return p.sample===k&&p.zp===0}),b=PATHS.filter(function(p){return p.sample===k&&p.zp===1});return mean(a.map(function(p){var o=PATHS.filter(function(q){return q.sample===p.sample&&q.mask===p.mask&&q.zp===1})[0];return o.v-p.v}))};
  var all=PATHS.map(function(p){return p.v});
  return {s:s,m:m,z:z,rs:Math.max(s.MP,s.SN,s.AS)-Math.min(s.MP,s.SN,s.AS),rm:Math.abs(m.full-m.b5),rz:Math.abs(z.n-z.y),zpBy:{MP:zpBy('MP'),SN:zpBy('SN'),AS:zpBy('AS')},min:Math.min.apply(null,all),max:Math.max.apply(null,all)};
})();
(function(){
  function card(t,range,items){return '<div class="card"><h4>'+t+'</h4><div class="exnum" style="margin:4px 0 10px">'+range.toFixed(2)+' <span style="font-size:14px;font-weight:500">kpc swing</span></div>'+items.map(function(i){return '<div style="display:grid;grid-template-columns:minmax(0,1fr) 62px;gap:8px;align-items:center;font-size:13.5px;margin-bottom:6px"><span>'+i[0]+'<span style="display:block;height:6px;border-radius:3px;background:var(--accent);width:'+(i[1]/3.6*100).toFixed(1)+'%;margin-top:3px"></span></span><span class="mono" style="text-align:right">'+i[1].toFixed(3)+'</span></div>'}).join('')+'</div>'}
  $('#fx').innerHTML=card('Sample definition',FX.rs,[['Metal-poor',FX.s.MP],['+ S/N ≥ 5',FX.s.SN],['+ RUWE &lt; 1.4',FX.s.AS]])+card('Parallax zero-point',FX.rz,[['None',FX.z.n],['+0.02 mas',FX.z.y]])+card('Sky mask',FX.rm,[['Full sky',FX.m.full],['|b| &gt; 5°',FX.m.b5]])+
  '<div class="card" style="grid-column:1/-1"><h4>Zero-point effect depends on the sample</h4>'+kv([['Metal-poor',(FX.zpBy.MP>=0?'+':'')+FX.zpBy.MP.toFixed(3)+' kpc on average'],['+ S/N ≥ 5',(FX.zpBy.SN>=0?'+':'')+FX.zpBy.SN.toFixed(3)+' kpc'],['+ RUWE &lt; 1.4',(FX.zpBy.AS>=0?'+':'')+FX.zpBy.AS.toFixed(3)+' kpc']])+'<p style="margin:10px 0 0;font-size:13.5px;color:var(--muted)">Averaged over the two sky masks. The sign reverses between the metal-poor sample and the S/N-selected ones.</p></div>';
})();

/* ---------- TECHNICAL ---------- */
var EQS=[
 {t:'Distance from parallax',k:'b',f:String.raw`d=\frac{1}{\varpi}`,x:String.raw`$d$ in kpc when $\varpi$ is in mas. Reliable at high S/N; at low S/N the inversion is biased and noisy, so the distance estimator is itself a hidden choice.`},
 {t:'Zero-point correction',k:'p',f:String.raw`\varpi_{\mathrm{corr}}=\varpi_{\mathrm{obs}}-Z,\qquad Z=-0.02\ \mathrm{mas}`,x:String.raw`The paper applies $+0.02$ mas to the observed parallax. Lindegren et al. (2021) give $Z$ as a function of magnitude, colour and ecliptic latitude, so a constant is a simplification.`},
 {t:'Fractional distance shift',k:'c',f:String.raw`\frac{\Delta d}{d}=-\frac{\delta}{\varpi+\delta}`,x:String.raw`From $d_c/d_u-1$ with $d=1/\varpi$ and $\delta=0.02$ mas. At $\varpi=0.125$ mas the shift is $-13.8\%$; at $\varpi=0.5$ mas, $-3.8\%$.`},
 {t:'Parallax significance cut',k:'p',f:String.raw`\frac{\varpi}{\sigma_{\varpi}}\ge k\;\Longrightarrow\; d_{\max}=\frac{1}{k\,\sigma_{\varpi}}`,x:String.raw`With $k=5$ and $\sigma_{\varpi}=0.03$ mas the farthest accepted star is $6.7$ kpc. The cut truncates the far side of the sample and shrinks its apparent scale.`},
 {t:'Size of the design',k:'p',f:String.raw`N_{\mathrm{paths}}=\prod_i k_i=3\times2\times2=12`,x:'Full factorial over sample definition, sky mask and zero-point treatment. Every other choice is fixed.'},
 {t:'Spread across paths',k:'c',f:String.raw`R=\sigma_{\max}-\sigma_{\min}=`+FX.max.toFixed(2)+'-'+FX.min.toFixed(2)+'='+(FX.max-FX.min).toFixed(2)+String.raw`\ \mathrm{kpc}`,x:'That is '+((FX.max-FX.min)/PUB*100).toFixed(0)+'% of the published 2.70 kpc, from choices the paper leaves open.'},
 {t:'Main effect of a factor',k:'c',f:String.raw`\mathrm{ME}(f)=\max_{\ell}m_{f,\ell}-\min_{\ell}m_{f,\ell},\quad m_{f,\ell}=\frac{1}{|\mathcal{P}_{f,\ell}|}\sum_{p\in\mathcal{P}_{f,\ell}}\sigma_p`,x:'Here: sample '+FX.rs.toFixed(2)+', zero-point '+FX.rz.toFixed(2)+', sky mask '+FX.rm.toFixed(2)+' kpc.'},
 {t:'Zero-point effect within a sample',k:'c',f:String.raw`\Delta_{\mathrm{ZP}}(s)=\frac12\sum_{m\in\{\mathrm{full},\,b5\}}\bigl[\sigma_{s,m,+0.02}-\sigma_{s,m,0}\bigr]`,x:'Metal-poor '+FX.zpBy.MP.toFixed(2)+' kpc; S/N-selected '+FX.zpBy.SN.toFixed(2)+' and '+FX.zpBy.AS.toFixed(2)+' kpc.'},
 {t:'Match criterion (absent from the paper)',k:'c',f:String.raw`\frac{|\sigma-2.70|}{2.70}\le\tau`,x:'Path P02 is at '+Math.abs(dev(2.7033)).toFixed(2)+'% and P04 at '+Math.abs(dev(2.6849)).toFixed(2)+'%. Which counts as the match depends entirely on $\\tau$.'},
 {t:'Wilson interval for a proportion',k:'c',f:String.raw`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`,x:'For 11 of 13 and $z=1.96$ the interval is about '+(wilson(11,13)[0]*100).toFixed(0)+'% to '+(wilson(11,13)[1]*100).toFixed(0)+'%.'},
 {t:'Agreement between auditors (suggested)',k:'c',f:String.raw`\kappa=\frac{p_o-p_e}{1-p_e}`,x:'Cohen’s kappa between the two model rounds, or between a model and the human reviewer, would quantify how interpretive the audit labels are.'}
];
$('#eqGrid').innerHTML=EQS.map(function(e){return '<div class="eq"><div class="t">'+e.t+tag(e.k)+'</div><div class="f">$$'+e.f+'$$</div><div class="x">'+e.x+'</div></div>'}).join('');

(function(){
  var plx=$('#cPlx'),dl=$('#cDelta'),sg=$('#cSig'),kk=$('#cK');
  function plot(p,dlt){
    var W=640,H=250,L=58,R=16,T=18,B=40,lo=Math.log10(0.04),hi=Math.log10(1);
    var ymax=Math.max(30,Math.ceil(dlt/(0.04+dlt)*100/5)*5);
    var px=function(v){return L+(Math.log10(v)-lo)/(hi-lo)*(W-L-R)},py=function(q){return T+q/ymax*(H-T-B)};
    var s='<svg viewBox="0 0 '+W+' '+H+'" class="plot" role="img" aria-label="Fractional distance change against observed parallax">';
    for(var q=0;q<=ymax;q+=10){s+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+py(q)+'" y2="'+py(q)+'"/><text class="ax" x="'+(L-8)+'" y="'+(py(q)+4)+'" text-anchor="end">'+(q===0?'0':'−'+q)+'%</text>'}
    [0.05,0.1,0.2,0.5,1].forEach(function(v){s+='<line class="gl" x1="'+px(v)+'" x2="'+px(v)+'" y1="'+T+'" y2="'+(H-B)+'"/><text class="ax" x="'+px(v)+'" y="'+(H-B+16)+'" text-anchor="middle">'+v+'</text>'});
    s+='<text class="ax" x="'+((L+W-R)/2)+'" y="'+(H-6)+'" text-anchor="middle">observed parallax (mas, log scale)</text>';
    var d='';for(var i=0;i<=80;i++){var v=Math.pow(10,lo+(hi-lo)*i/80),y=dlt/(v+dlt)*100;d+=(i?'L':'M')+px(v).toFixed(1)+' '+py(y).toFixed(1)}
    s+='<path d="'+d+'" fill="none" stroke="var(--accent)" stroke-width="2.4"/>';
    var yc=dlt/(p+dlt)*100;
    s+='<line x1="'+px(p)+'" x2="'+px(p)+'" y1="'+T+'" y2="'+(H-B)+'" stroke="var(--amber)" stroke-width="1.4" stroke-dasharray="5 4"/><circle cx="'+px(p)+'" cy="'+py(yc)+'" r="6" fill="var(--amber)"/>';
    return s+'</svg>';
  }
  function upd(){
    var p=+plx.value,dlt=+dl.value,du=1/p,dc=1/(p+dlt),ch=(dc-du)/du*100;
    $('#cPlxV').textContent=p.toFixed(3)+' mas';$('#cDeltaV').textContent=dlt.toFixed(3)+' mas';
    $('#cOut').innerHTML=[['Uncorrected distance',du.toFixed(2)+' kpc'],['Corrected distance',dc.toFixed(2)+' kpc'],['Change',(dc-du>=0?'+':'')+(dc-du).toFixed(2)+' kpc'],['Fractional change',ch.toFixed(1)+'%']].map(function(r){return '<div class="card flat"><div class="lab">'+r[0]+'</div><div class="exnum" style="margin-top:8px;font-size:22px">'+r[1]+'</div></div>'}).join('');
    $('#cPlot').innerHTML=plot(p,dlt);
    var sig=+sg.value,k=+kk.value;
    if(sig>0&&k>0){var dm=1/(k*sig);$('#cMax').textContent=dm.toFixed(1)+' kpc';$('#cNote').innerHTML='A star at the Galactic centre (≈ 8 kpc, $\\varpi$ ≈ 0.125 mas) passes a '+k+'σ cut only if $\\sigma_{\\varpi}$ ≤ '+(0.125/k).toFixed(3)+' mas. '+tag('c')+' Parallax S/N selection removes distant stars, which is a plausible reason the S/N-based samples give smaller $\\sigma_{\\mathrm{RGC}}$.'}
  }
  [plx,dl,sg,kk].forEach(function(el){el.addEventListener('input',upd)});
  upd();
})();

/* ---------- ASSUMPTIONS ---------- */
var ASSUMP=D.ASSUMP;
var asG='all',asK='all',asQ='';
var groups=['all'].concat(ASSUMP.map(function(a){return a.g}).filter(function(g,i,arr){return arr.indexOf(g)===i}));
$('#asGroup').innerHTML=groups.map(function(g,i){return '<button type="button" class="chip" data-v="'+g+'" aria-pressed="'+(i===0)+'">'+(g==='all'?'All groups':g)+'</button>'}).join('');
function asRender(){
  var q=asQ.toLowerCase();
  var rows=ASSUMP.filter(function(a){return (asG==='all'||a.g===asG)&&(asK==='all'||a.k===asK)&&(!q||(a.t+' '+a.x+' '+a.r).toLowerCase().indexOf(q)>=0)});
  $('#asCount').textContent=rows.length+' of '+ASSUMP.length+' assumptions shown';
  $('#asList').innerHTML=rows.map(function(a){return '<details class="acc"><summary><span>'+a.t+'</span><span class="meta"><span class="pill">'+a.g+'</span><span class="pill '+(a.k==='explicit'?'ex':'im')+'">'+a.k+'</span></span></summary><div class="body"><p><b>Where it shows up.</b> '+a.x+'</p><p><b>How it could fail.</b> '+a.r+'</p></div></details>'}).join('');
}
var gb=$$('#asGroup .chip');gb.forEach(function(b,i){b.addEventListener('click',function(){asG=b.getAttribute('data-v');pressGroup(gb,i);asRender()})});
var kb=$$('#asKind .chip');kb.forEach(function(b,i){b.addEventListener('click',function(){asK=b.getAttribute('data-v');pressGroup(kb,i);asRender()})});
$('#asSearch').addEventListener('input',function(e){asQ=e.target.value;asRender()});
asRender();

/* ---------- CRITIQUE ---------- */
var DIMS=D.DIMS;
var scoreNow=DIMS.map(function(d){return d[1]});
function scoreRender(){
  $('#score').innerHTML=DIMS.map(function(d,i){var s='<div class="scrow"><span style="font-weight:600;font-size:14px">'+d[0]+'</span><span class="dots" role="group" aria-label="'+d[0]+' rating">';for(var j=1;j<=5;j++)s+='<button type="button" class="dot'+(j<=scoreNow[i]?' on':'')+'" data-i="'+i+'" data-j="'+j+'" aria-label="'+j+' of 5" style="width:16px;height:16px"></button>';return s+'</span><span style="font-size:13.5px;color:var(--muted)">'+d[2]+'</span></div>'}).join('');
  $$('#score .dot').forEach(function(b){b.addEventListener('click',function(){scoreNow[+b.getAttribute('data-i')]=+b.getAttribute('data-j');scoreRender()})});
}
$('#scoreReset').addEventListener('click',function(){scoreNow=DIMS.map(function(d){return d[1]});scoreRender()});
scoreRender();

var STRENGTHS=D.STRENGTHS;
$('#strengths').innerHTML=STRENGTHS.map(function(s){return '<details class="acc"><summary>'+s[0]+'</summary><div class="body"><p>'+s[1]+'</p></div></details>'}).join('');

var WEAK=D.WEAK;
var wSev='all';
function weakRender(){
  $('#weak').innerHTML=WEAK.filter(function(w){return wSev==='all'||w.sv===wSev}).map(function(w){return '<details class="acc"><summary><span>'+w.t+'</span><span class="meta"><span class="sev '+w.sv+'">'+(w.sv==='med'?'medium':w.sv)+'</span></span></summary><div class="body"><p>'+w.x+'</p><p><b>Possible fix.</b> '+w.f+'</p></div></details>'}).join('');
}
var sb=$$('#sevChips .chip');sb.forEach(function(b,i){b.addEventListener('click',function(){wSev=b.getAttribute('data-v');pressGroup(sb,i);weakRender()})});
weakRender();

var IMPROVE=D.IMPROVE;
$('#improve').innerHTML=IMPROVE.map(function(r){return '<details class="acc"><summary><span>'+r[1]+'</span><span class="meta"><span class="pill">'+r[0]+'</span></span></summary><div class="body"><p>'+r[2]+'</p></div></details>'}).join('');

/* ---------- KIT ---------- */
var TALK=D.TALK;
var total=TALK.reduce(function(s,r){return s+r[0]},0);
$('#talkNote').textContent='About '+total+' minutes. For a 30-minute slot, trim the background and the second critique slide.';
$('#talkTbl').innerHTML='<thead><tr><th>#</th><th>Slide</th><th>Minutes</th><th>Section of this page</th></tr></thead><tbody>'+TALK.map(function(r,i){return '<tr><td class="n">'+(i+1)+'</td><td>'+r[1]+'</td><td class="n">'+r[0]+'</td><td><a href="#'+r[2]+'">'+r[2]+'</a></td></tr>'}).join('')+'</tbody>';

var QA=D.QA;
$('#qa').innerHTML=QA.map(function(q){return '<details class="acc"><summary>'+q[0]+'</summary><div class="body"><p>'+q[1]+'</p></div></details>'}).join('');

var QUIZ=D.QUIZ;
(function(){
  var box=$('#quiz'),i=0,score=0,done=false;
  function show(){
    if(i>=QUIZ.length){box.innerHTML='<div class="qmeta">Finished</div><h4>You scored '+score+' of '+QUIZ.length+'</h4><button type="button" class="chip" id="qReset" style="margin-top:8px">Restart</button>';$('#qReset').addEventListener('click',function(){i=0;score=0;show()});return}
    var q=QUIZ[i];done=false;
    box.innerHTML='<div class="qmeta">Question '+(i+1)+' of '+QUIZ.length+' &nbsp;·&nbsp; score '+score+'</div><h4 style="margin-bottom:12px">'+q.q+'</h4>'+q.o.map(function(o,j){return '<button type="button" class="qopt" data-j="'+j+'">'+o+'</button>'}).join('')+'<div class="qfb" id="qfb" hidden></div>';
    $$('.qopt',box).forEach(function(b){b.addEventListener('click',function(){
      if(done)return;done=true;var j=+b.getAttribute('data-j');
      $$('.qopt',box).forEach(function(x,k){if(k===q.a)x.classList.add('right');else if(k===j)x.classList.add('wrong')});
      if(j===q.a)score++;
      var fb=$('#qfb');fb.hidden=false;fb.innerHTML='<b>'+(j===q.a?'Correct. ':'Not quite. ')+'</b>'+q.e+'<div style="margin-top:10px"><button type="button" class="chip" id="qNext">'+(i===QUIZ.length-1?'See score':'Next question')+'</button></div>';
      $('#qNext').addEventListener('click',function(){i++;show()});
    })});
  }
  show();
})();

var GLOSS=D.GLOSS;
function glRender(q){q=(q||'').toLowerCase();$('#glList').innerHTML=GLOSS.filter(function(g){return !q||(g[0]+' '+g[2]).toLowerCase().indexOf(q)>=0}).map(function(g){return '<div class="card"><h4>'+g[0]+' '+tag(g[1])+'</h4><p style="margin:0;font-size:14px">'+g[2]+'</p></div>'}).join('')||'<p class="note">No term matches.</p>'}
$('#glSearch').addEventListener('input',function(e){glRender(e.target.value)});
glRender('');

/* ---------- FIGURES ---------- */
function figHtml(f,n){
  return '<figure class="fig"><a class="plate" href="assets/img/'+f.id+'.svg" target="_blank" rel="noopener" style="display:block"><img src="assets/img/'+f.id+'.svg" alt="'+f.alt+'" loading="lazy" decoding="async"></a>'+
    '<figcaption><b>Figure '+n+'. '+f.title+'.</b> '+f.cap.replace(/~/g,' ')+' <a href="assets/img/'+f.id+'.svg" target="_blank" rel="noopener">Open SVG</a></figcaption></figure>';
}
(function(){
  var F=D.FIGS;
  $('#figGrid').innerHTML=F.map(function(f,i){return figHtml(f,i+1)}).join('');
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
  var url='https://github.com/'+m[1]+'/'+repo;
  $$('[data-repo]').forEach(function(a){a.href=url;a.hidden=false});
})();

/* ---------- math (KaTeX, bundled in assets/vendor) ---------- */
(function(){
  var main=$('#main'),busy=false,timer=null;
  function render(){
    if(typeof window.renderMathInElement!=='function')return;
    busy=true;
    try{window.renderMathInElement(main,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false,ignoredTags:['script','noscript','style','textarea','pre','code']})}catch(e){}
    busy=false;
  }
  new MutationObserver(function(){if(busy)return;clearTimeout(timer);timer=setTimeout(render,25)}).observe(main,{childList:true,subtree:true});
  render();
})();

})();
