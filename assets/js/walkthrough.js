(function(){
'use strict';
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var tiles=document.getElementById('wkTiles');
if(!tiles)return;

/* ---------- current page in the strip ---------- */
var links={};
$$('a',tiles).forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
var current=null;
function setCurrent(id){
  if(id===current||!links[id])return;
  if(current&&links[current])links[current].removeAttribute('aria-current');
  current=id;links[id].setAttribute('aria-current','location');
  var a=links[id],box=tiles;
  var left=a.offsetLeft-box.clientWidth/2+a.offsetWidth/2;
  if(box.scrollWidth>box.clientWidth)box.scrollLeft=Math.max(0,left);
}
var pgs=$$('.wk-pg'),ticking=false;
function locate(){
  ticking=false;
  var line=Math.max(140,window.innerHeight*0.28),found=pgs[0];
  for(var i=0;i<pgs.length;i++){if(pgs[i].getBoundingClientRect().top<=line)found=pgs[i];else break}
  var last=pgs[pgs.length-1].getBoundingClientRect();
  if(last.bottom<0){if(current&&links[current])links[current].removeAttribute('aria-current');current=null;return}
  setCurrent(found.id);
}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(locate)}}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll);
locate();


/* re-align a deep link (e.g. walkthrough.html#p12) once fonts and math have settled the layout */
function realign(){
  var h=location.hash;if(h.length<2)return;
  var el=document.getElementById(decodeURIComponent(h.slice(1)));if(el)el.scrollIntoView({behavior:'instant',block:'start'});
}
window.addEventListener('load',function(){setTimeout(realign,1600)});

/* ---------- self-test ---------- */
var Q=[
 {q:'What is the main research question of the paper?',o:['Whether LLMs can generate scientific abstracts.','Whether AI agents can reconstruct the reasoning and methodology behind published scientific results.','Whether AI can replace astronomers.'],a:1,e:'Pages 1 and 2: the paper asks whether an agent can reconstruct the complete reasoning needed to obtain a published result from the information available to it.'},
 {q:'How many of the thirteen Nature papers contained at least one identified ambiguity?',o:['2 out of 13','5 out of 13','11 out of 13'],a:2,e:'Pages 9 and 10: eleven papers contained at least one ambiguity, and only two were sufficiently complete within the scope of the tasks.'},
 {q:'What were the three dimensions of the controlled sensitivity analysis?',o:['Redshift, luminosity and temperature.','Stellar-sample definition, sky mask and parallax zero-point treatment.','Galaxy mass, metallicity and velocity.'],a:1,e:'Page 6: the three degrees of freedom give a full factorial of 3 × 2 × 2 = 12 predefined paths.'},
 {q:'What was the range of the twelve recovered spatial scales?',o:['1.0 to 2.0 kpc','2.16 to 3.53 kpc','2.70 to 4.50 kpc'],a:1,e:'Pages 11 and 12: the twelve paths gave 2.16 to 3.53 kpc, and one of them recovered about 2.70 kpc.'},
 {q:'What was the key AI limitation shown in the Milky Way case?',o:['It could not execute Python code.','It could not retrieve Gaia data.','It failed to recognise the causal relevance of an already-mentioned parallax correction.'],a:2,e:'Page 12: the agents parsed +0.02 mas and ran the fit, but did not infer that the offset had to govern the analysis until the experiment made its effect visible.'},
 {q:'Does matching the published numerical result prove that the AI reconstructed the scientific reasoning?',o:['Yes, always.','No, numerical agreement alone is insufficient.','Only if the AI uses Python.'],a:1,e:'Pages 14 and 16: a numerical match is neither necessary evidence of correct reasoning nor a stable target to optimise toward.'}
];
var box=document.getElementById('wkQuiz');
if(box){
  var i=0,score=0,done=false;
  var show=function(){
    if(i>=Q.length){
      box.innerHTML='<div class="qmeta">Finished</div><p class="quizq">Score: '+score+' of '+Q.length+'.</p><button type="button" class="chip" id="wkAgain">Start again</button>';
      document.getElementById('wkAgain').addEventListener('click',function(){i=0;score=0;show()});return;
    }
    var q=Q[i];done=false;
    box.innerHTML='<div class="qmeta">Question '+(i+1)+' of '+Q.length+' · score '+score+'</div><p class="quizq">'+q.q+'</p>'+
      q.o.map(function(o,j){return '<button type="button" class="qopt" data-j="'+j+'">'+o+'</button>'}).join('')+'<div class="qfb" id="wkFb" hidden></div>';
    $$('.qopt',box).forEach(function(b){b.addEventListener('click',function(){
      if(done)return;done=true;var j=+b.getAttribute('data-j');
      $$('.qopt',box).forEach(function(x,k){if(k===q.a)x.classList.add('right');else if(k===j)x.classList.add('wrong')});
      if(j===q.a)score++;
      var fb=document.getElementById('wkFb');fb.hidden=false;
      fb.innerHTML='<b>'+(j===q.a?'Correct. ':'Not quite. ')+'</b>'+q.e+'<br><button type="button" class="chip" id="wkNext">'+(i===Q.length-1?'See score':'Next question')+'</button>';
      document.getElementById('wkNext').addEventListener('click',function(){i++;show()});
    })});
  };
  show();
}
})();
