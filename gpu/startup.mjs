// T19.1: finite, low-overhead startup reveal, specifications not benchmark scores.
const rows=[
 ['MEMORY BANDWIDTH',1008,1792,'GB/s',0],
 ['FP32 COMPUTE',82.6,104.8,'TFLOPS',1],
 ['VRAM CAPACITY',24,32,'GB',0],
 ['CUDA CORES',16384,21760,'cores',0],
 ['RT CORES',128,170,'cores',0],
 ['BOARD POWER',450,575,'W',0,true]
];
export function startupNumbers(av){
 const el=document.getElementById('startup-numbers'), grid=document.getElementById('startup-grid'), reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const fmt=(v,d)=>v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
 const delta=(a,b)=>Math.round((b/a-1)*100);
 grid.innerHTML=rows.map(([n,a,b,u,d,c],i)=>'<div class="startup-tile'+(c?' cost':'')+'"><small>'+n+'</small><div class="number-line"><b data-number="'+i+'">'+fmt(a,d)+'</b><span>'+u+'</span></div><div class="reference-line">'+fmt(a,d)+' → '+fmt(b,d)+' <strong data-gain="'+i+'">+0%</strong></div><div class="startup-track"><i data-bar="'+i+'"></i></div></div>').join('');
 const nodes=rows.map((_,i)=>({num:grid.querySelector('[data-number="'+i+'"]'),gain:grid.querySelector('[data-gain="'+i+'"]'),bar:grid.querySelector('[data-bar="'+i+'"]'),tile:grid.children[i]}));
 let timer=null,started=0,done=false,shown=false,ticks=0,landed=new Set();
 function stop(){clearInterval(timer);timer=null}
 function paint(t){ticks++;rows.forEach(([n,a,b,u,d,c],i)=>{const p=Math.max(0,Math.min(1,(t-i*125)/850)),e=1-(1-p)**3;const v=a+(b-a)*e;nodes[i].num.textContent=fmt(v,d);nodes[i].gain.textContent='+'+Math.round(delta(a,b)*e)+'%';nodes[i].bar.style.transform='scaleX('+e+')';nodes[i].tile.classList.toggle('landed',p===1);if(p===1&&!landed.has(i)){landed.add(i);if(!reduce.matches&&t<1700&&i%2===0)av.cue('align')}});if(t>=1475){done=true;stop();document.getElementById('startup-status').textContent='REFERENCE PROFILE ONLINE';}}
 function show(replay=false){el.hidden=false;shown=true;if(done&&!replay)return;stop();done=false;landed.clear();ticks=0;started=performance.now();document.getElementById('startup-status').textContent='INITIALIZING REFERENCE PROFILE';if(reduce.matches){paint(2000);return}paint(0);timer=setInterval(()=>paint(performance.now()-started),50);}
 function hide(reset=false){stop();el.hidden=true;shown=false;if(reset){done=false;landed.clear();ticks=0}else if(!done)paint(2000);}
 document.getElementById('startup-replay').onclick=()=>{show(true);av.cue('boot')};
 addEventListener('pagehide',stop);return {show,hide,state:()=>({shown,done,ticks,values:nodes.map(n=>n.num.textContent),gains:nodes.map(n=>n.gain.textContent),timer:timer!==null})};
}
