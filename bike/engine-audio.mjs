// Original generated ElevenLabs SFX, local permanent MP3; pitch follows the simulated RPM.
// The sample is AI-designed, not an archival Honda recording.
export const ENGINE_ASSET=new URL('./audio/nsr500-idle.mp3',import.meta.url).href;
const KEY='mystuff.bs005.engineAudio.v1';
export function loopBuffer(ctx,source){
 const rate=source.sampleRate,trim=Math.floor(rate*.09),end=source.length-trim,fade=Math.min(Math.floor(rate*.11),Math.floor((end-trim)/4)),start=trim+fade,length=end-start;
 if(length<rate*.2||fade<2)return source;
 const output=ctx.createBuffer(source.numberOfChannels,length,rate);
 for(let ch=0;ch<source.numberOfChannels;ch++){const s=source.getChannelData(ch),d=output.getChannelData(ch);for(let i=0;i<length;i++){let a=s[start+i];if(i>=length-fade){let k=i-(length-fade),v=k/(fade-1);a=a*(1-v)+s[trim+k]*v}d[i]=a}}return output;
}
export function createEngineSound(){
 let enabled=true;try{enabled=localStorage.getItem(KEY)!=='off'}catch{}
 let ctx=null,buffer=null,node=null,gain=null,filter=null,status='Not loaded',pending=null,requested=false,last=0,serial=0,stopping=false;
 function stop(){if(node){try{node.stop()}catch{}node.disconnect();node=null}}
 async function unlock(){
 if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){status='Audio unsupported';return}ctx=new AC();gain=ctx.createGain();gain.gain.value=0;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2800;filter.Q.value=.35;filter.connect(gain).connect(ctx.destination);}
 if(ctx.state==='suspended')await ctx.resume().catch(()=>{});
 if(!pending){status='Loading ElevenLabs';pending=fetch(ENGINE_ASSET).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b)).then(b=>{buffer=loopBuffer(ctx,b);status='ElevenLabs custom';if(requested&&enabled)start()}).catch(()=>{status='Synth fallback';if(requested&&enabled)start()})}return pending;
 }
 function start(){if(!ctx||node||!enabled)return;if(buffer){node=ctx.createBufferSource();node.buffer=buffer;node.loop=true;node.playbackRate.value=.85;node.connect(filter);node.start()}else if(status==='Synth fallback'){node=ctx.createOscillator();node.type='sawtooth';node.frequency.value=76;node.connect(filter);node.start()}}
 function setEnabled(v){enabled=!!v;try{localStorage.setItem(KEY,enabled?'on':'off')}catch{}if(!enabled){serial++;stopping=false;if(gain)gain.gain.setValueAtTime(0,ctx.currentTime);stop()}else if(requested){unlock();start()}return enabled}
 function update(active,rpm,volume,hidden=false,now=performance.now()){
 requested=!!active;if(!ctx)return;let should=requested&&enabled&&!hidden&&volume>0;
 if(!should){if(node&&!stopping){stopping=true;gain.gain.setTargetAtTime(0,ctx.currentTime,.03);let old=node,ticket=++serial;setTimeout(()=>{if(ticket===serial&&node===old){stop();stopping=false}},125)}return}
 if(stopping){serial++;stopping=false;}if(!node)start();if(!node||now-last<45)return;last=now;const t=ctx.currentTime,v=Math.max(0,Math.min(1,rpm));gain.gain.setTargetAtTime(volume*(buffer?.30+v*.34:.025+v*.04),t,.055);filter.frequency.setTargetAtTime(1100+v*4000,t,.07);if(buffer)node.playbackRate.setTargetAtTime(.84+v*1.30,t,.07);else node.frequency.setTargetAtTime(48+v*230,t,.07);
 }
 function close(){stop();ctx?.close().catch(()=>{})}
 return {unlock,update,setEnabled,close,context:()=>ctx,state:()=>({enabled,status,playing:!!node,custom:!!buffer,context:ctx?.state||'not-created'})};
}
