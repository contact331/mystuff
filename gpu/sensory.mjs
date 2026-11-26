// Original synthesized score and procedural sound design; no external audio assets.
export function sensory(){
 const key='mystuff.gpu.sensory.v1';let prefs={music:true,sfx:true,volume:.40};try{const p=JSON.parse(localStorage.getItem(key));if(p&&typeof p==='object')prefs={music:p.music!==false,sfx:p.sfx!==false,volume:Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):.4}}catch{}
 let ac,master,mb,sb,noiseBuffer,clock,beat=0,next=0,fanSource=null,fanGain=null,fanFilter=null,wantFan=false,active=false,lastCue='',cueCount=0;
 const $=id=>document.getElementById(id),save=()=>{try{localStorage.setItem(key,JSON.stringify(prefs))}catch{}};
 const bar=document.createElement('div');bar.id='sensory-controls';bar.innerHTML='<button id="music-toggle">♫ Music</button><button id="effects-toggle">SFX</button><label>Volume <input id="sensory-volume" type="range" min="0" max="100" aria-label="Audio volume"></label><span id="audio-state">Audio starts on first interaction</span>';document.body.append(bar);
 // Bounded compositor-only splash: no canvas, per-frame drawing, animated shadows or full-screen blend.
 const overlay=document.createElement('div');overlay.id='sensory-fx';overlay.setAttribute('aria-hidden','true');overlay.hidden=true;
 overlay.innerHTML='<i class="fx-glow"></i><i class="fx-ring"></i><i class="fx-scan"></i><svg class="fx-sparks" viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M20 28l4 3M43 14l3 5M77 8l1 4M115 7l-1 4M151 16l-3 5M179 31l-4 3M192 58l-5 0M177 88l-4-3M150 105l-3-5M111 113l-1-5M72 108l2-5M40 94l4-4M10 62l5-1" stroke-width="1.2"/></svg>';
 document.body.append(overlay);const reduced=matchMedia('(prefers-reduced-motion: reduce)');let events=0,visualRuns=0,skips=0,lastVisual=-Infinity,cleanup=0,animations=[];
 let vfx=true;try{vfx=localStorage.getItem('mystuff.gpu.vfx.v2')!=='off'}catch{}
 const vfxButton=document.createElement('button');vfxButton.id='vfx-toggle';vfxButton.textContent='VFX '+(vfx?'on':'off');vfxButton.setAttribute('aria-pressed',String(vfx));bar.insertBefore(vfxButton,$('audio-state'));
 function stopFX(){clearTimeout(cleanup);for(const a of animations)a.cancel();animations=[];overlay.hidden=true}
 vfxButton.onclick=()=>{vfx=!vfx;vfxButton.textContent='VFX '+(vfx?'on':'off');vfxButton.setAttribute('aria-pressed',String(vfx));try{localStorage.setItem('mystuff.gpu.vfx.v2',vfx?'on':'off')}catch{}if(!vfx)stopFX()};
 reduced.addEventListener?.('change',()=>{if(reduced.matches)stopFX()});
 function labels(){$('music-toggle').textContent='♫ Music '+(prefs.music?'on':'off');$('effects-toggle').textContent='SFX '+(prefs.sfx?'on':'off');$('music-toggle').setAttribute('aria-pressed',String(prefs.music));$('effects-toggle').setAttribute('aria-pressed',String(prefs.sfx));$('sensory-volume').value=Math.round(prefs.volume*100);$('audio-state').textContent=ac?.state==='running'?'Audio active':prefs.music||prefs.sfx?'Audio starts on first interaction':'Audio muted';}
 function init(){if(!ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ac=new AC();master=ac.createGain();master.gain.value=prefs.volume;mb=ac.createGain();sb=ac.createGain();mb.gain.value=prefs.music?.23:0;sb.gain.value=prefs.sfx?.55:0;mb.connect(master);sb.connect(master);const comp=ac.createDynamicsCompressor();master.connect(comp);comp.connect(ac.destination);noiseBuffer=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;ac.onstatechange=labels;next=ac.currentTime+.05;clock=setInterval(schedule,90)}if(ac.state==='suspended')ac.resume().then(()=>{labels();if(wantFan)fan(true)}).catch(()=>{});active=true;labels();return true}
 const hz=n=>440*2**((n-69)/12);
 function tone(t,n,d,a,bus,type='sine',end=n,attack=.018){if(!ac)return;const o=ac.createOscillator(),v=ac.createGain();o.type=type;o.frequency.setValueAtTime(hz(n),t);o.frequency.exponentialRampToValueAtTime(hz(end),t+d);v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(Math.max(.0002,a),t+Math.min(attack,d*.4));v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v).connect(bus);o.start(t);o.stop(t+d+.02)}
 function noise(t,d,a,freq=1800,type='bandpass',end=freq){const s=ac.createBufferSource(),f=ac.createBiquadFilter(),v=ac.createGain();s.buffer=noiseBuffer;f.type=type;f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(end,t+d);f.Q.value=.65;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(a,t+Math.min(.022,d*.25));v.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f).connect(v).connect(sb);s.start(t,Math.random()*.7,d);s.stop(t+d+.01)}
 const chords=[[45,57,60,64,71],[41,53,57,60,67],[48,55,60,64,69],[43,55,59,62,69]],melody=[72,76,79,76,74,72,69,67,72,76,81,79,74,71,67,69];
 function schedule(){if(!ac||ac.state!=='running')return;if(next<ac.currentTime-.1)next=ac.currentTime+.025;while(next<ac.currentTime+.23){const t=next,b=beat%8,ch=chords[Math.floor(beat/8)%4];if(prefs.music){if(b===0){tone(t,ch[0],2.4,.18,mb,'sine',ch[0],.12);ch.slice(1).forEach((n,i)=>{tone(t+i*.017,n,3.3,.035,mb,'sine',n,.65);tone(t+i*.017,n+12,2.9,.012,mb,'triangle',n+12,.58)})}if(b===0||b===4)tone(t,ch[0]+12,.47,.052,mb,'sine',ch[0]+12,.02);if(b%2===1){const n=melody[Math.floor(beat/2)%16];tone(t,n,.8,.035,mb,'sine',n,.025);tone(t+.02,n+12,.32,.011,mb,'sine')}if(b===2||b===6)tone(t,36,.14,.09,mb,'sine',28)}beat++;next+=.385}}
 function levels(){if(ac){master.gain.setTargetAtTime(prefs.volume,ac.currentTime,.035);mb.gain.setTargetAtTime(prefs.music?.23:0,ac.currentTime,.12);sb.gain.setTargetAtTime(prefs.sfx?.55:0,ac.currentTime,.05)}save();labels()}
 $('music-toggle').onclick=()=>{prefs.music=!prefs.music;init();levels()};$('effects-toggle').onclick=()=>{prefs.sfx=!prefs.sfx;init();levels()};$('sensory-volume').oninput=e=>{prefs.volume=+e.target.value/100;levels()};
 function cue(kind){lastCue=kind;cueCount++;if(!prefs.sfx||!init())return;const t=ac.currentTime+.015;const tn=(n,d,a,end=n,type='sine',delay=0)=>tone(t+delay,n,d,a,sb,type,end);const ns=(d,a,f,end=f,delay=0,type='bandpass')=>noise(t+delay,d,a,f,type,end);
 switch(kind){case'hover':tn(83,.045,.014,80);break;case'click':tn(72,.075,.037,63);ns(.045,.035,2400);break;
 case'seal':for(let i=0;i<5;i++)ns(.09,.10,2900,5100,i*.047);tn(53,.18,.055,35,'triangle',.15);break;
 case'lid':ns(.38,.12,430,1400);tn(47,.27,.12,36,'sine');break;
 case'foam':ns(.52,.13,1100,360);tn(43,.31,.06,33);break;
 case'paper':for(let i=0;i<3;i++)ns(.16,.09,2300,950,i*.07);break;
 case'adapter':ns(.14,.12,1300,2800);tn(51,.12,.12,34,'triangle');tn(83,.12,.045,71,'sine',.07);break;
 case'lift':ns(.26,.07,700,1500);tn(49,.35,.10,43);break;
 case'esd':for(let i=0;i<8;i++)ns(.085,.11,3500,7000,i*.035);tn(76,.25,.06,88,'sine',.24);break;
 case'open':ns(.25,.11,550,1300);tn(48,.27,.14,33);break;
 case'align':tn(65,.18,.08,77,'sine');tn(84,.13,.06,84,'sine',.12);break;
 case'seat':ns(.075,.22,1400,500);tn(43,.15,.20,28,'triangle');tn(77,.13,.08,71,'sine',.065);break;
 case'screw':for(let i=0;i<5;i++){ns(.045,.09,3700,900,i*.045);tn(58,.055,.04,49,'triangle',i*.045)}break;
 case'connect':ns(.10,.18,1200,350);tn(43,.18,.15,31,'triangle');tn(79,.24,.055,88,'sine',.07);break;
 case'boot':ns(.95,.11,230,2200);[43,55,67,72,79,84].forEach((n,i)=>tn(n,.9,.10,n,'sine',i*.095));break;
 case'reveal':case'lab':[60,67,72,76,79,84].forEach((n,i)=>tn(n,.75,.065,n,'sine',i*.065));ns(.65,.07,450,3500);break;
 default:tn(76,.13,.045,83);}
 }
 function fan(on){wantFan=on;if(!on){if(fanSource){const source=fanSource;fanGain.gain.setTargetAtTime(0,ac.currentTime,.15);try{source.stop(ac.currentTime+.55)}catch{}fanSource=null;}return}if(!prefs.sfx||!ac||ac.state!=='running'||fanSource)return;fanSource=ac.createBufferSource();fanSource.buffer=noiseBuffer;fanSource.loop=true;fanFilter=ac.createBiquadFilter();fanFilter.type='lowpass';fanFilter.frequency.value=580;fanGain=ac.createGain();fanGain.gain.value=.0001;fanGain.gain.setTargetAtTime(.04,ac.currentTime,.4);fanSource.connect(fanFilter).connect(fanGain).connect(sb);fanSource.start();}
 function fx(kind='step'){
 events++;if(!vfx||reduced.matches||document.hidden){skips++;return}
 const major=['boot','reveal','lab'].includes(kind),now=performance.now();
 // Coalesce rapid events; major reveal replaces an ordinary effect, not an additional layer.
 if(!major&&now-lastVisual<180){skips++;return}
 stopFX();lastVisual=now;visualRuns++;overlay.dataset.major=String(major);overlay.hidden=false;
 const dur=major?640:340;
 const anim=(sel,keys,t)=>{const el=overlay.querySelector(sel);animations.push(el.animate(keys,{duration:t,easing:'cubic-bezier(.18,.6,.22,1)',fill:'forwards'}))};
 anim('.fx-glow',[{opacity:0,transform:'scale(.72)'},{opacity:major?.78:.43,transform:'scale(.95)',offset:.21},{opacity:0,transform:'scale(1.12)'}],dur);
 anim('.fx-ring',[{opacity:major?.6:.34,transform:'scale(.60)'},{opacity:0,transform:'scale(1.38)'}],dur);
 anim('.fx-scan',[{opacity:0,transform:'translateY(-70px)'},{opacity:.75,offset:.20},{opacity:0,transform:'translateY(70px)'}],dur);
 if(major)anim('.fx-sparks',[{opacity:.68,transform:'scale(.65)'},{opacity:0,transform:'scale(1.30)'}],dur);else overlay.querySelector('.fx-sparks').style.opacity='0';
 cleanup=setTimeout(stopFX,dur+40);
 }
 function event(kind){cue(kind);fx(kind)}
 // Kept as a compatibility no-op; neither renderer needs a per-frame VFX pass.
 function draw(){}
 let hoverAt=0;document.addEventListener('pointerover',e=>{const b=e.target.closest?.('button,a');if(b&&!b.disabled&&(!e.relatedTarget||!b.contains(e.relatedTarget))&&performance.now()-hoverAt>90){hoverAt=performance.now();if(active)cue('hover')}});
 document.addEventListener('pointerdown',()=>{if(prefs.music||prefs.sfx)init()},{capture:true,passive:true});document.addEventListener('keydown',()=>{if(prefs.music||prefs.sfx)init()},{capture:true});document.addEventListener('click',e=>{if(e.target.closest?.('button,a')&&prefs.sfx)cue('click')},true);
 addEventListener('pagehide',()=>{stopFX();clearInterval(clock);if(ac)ac.close().catch(()=>{})});labels();
 return {event,cue,fx,draw,fan,state:()=>({music:prefs.music,sfx:prefs.sfx,volume:prefs.volume,context:ac?.state||'not-created',lastCue,cueCount,events,visualRuns,skips,vfx,fxActive:!overlay.hidden,fan:!!fanSource})};
}
