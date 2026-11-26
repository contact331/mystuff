import * as T from '../t03/vendor/three.module.min.js';
import {RoomEnvironment} from '../t03/vendor/RoomEnvironment.js';
import {helpers} from '../gallery/models.mjs';
import {makeBoard,SOCKET} from '../v4/motherboard.js';
import {makeCPU,makeRAM} from '../v5/models.js';
import {acquired,saveInstalled} from '../v5/registry.js';
import {ease} from '../v4/layout.js';
import {createGPU} from './fe-model.mjs';
import {sensory} from './sensory.mjs';
import {startupNumbers} from './startup.mjs';
const av=sensory(),numbers=startupNumbers(av);
const $=id=>document.getElementById(id);
const scene=new T.Scene();scene.background=new T.Color(0x0c141e);scene.fog=new T.Fog(0x0c141e,65,110);
let renderer;try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){$('hint').textContent='WebGL unavailable on this device.';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;$('stage').append(renderer.domElement);
const env=new RoomEnvironment(),pm=new T.PMREMGenerator(renderer),environment=pm.fromScene(env,.06).texture;scene.environment=environment;env.dispose();pm.dispose();
const h=helpers(renderer),{box,mesh}=h;
const mat=(c,metalness=.45,roughness=.4)=>new T.MeshStandardMaterial({color:c,metalness,roughness});
const frameM=mat(0x27323b,.75),panelM=mat(0x10151c,.5),trim=mat(0x78939d,.8),floorM=mat(0x18222c,.3),powerM=new T.MeshStandardMaterial({color:0x4b8541,emissive:0x96ff59,emissiveIntensity:0}),rubber=mat(0x22272a,.04,.7);
const key=new T.DirectionalLight(0xffead3,3.4);key.position.set(3,19,14);scene.add(key);const rim=new T.DirectionalLight(0xb6d8ff,2.4);rim.position.set(-12,12,-10);scene.add(rim);scene.add(new T.HemisphereLight(0xd7e7f8,0x28313c,1.5));
box(scene,85,.2,85,.02,floorM,0,-.55,0);
const chassis=new T.Group();scene.add(chassis);
box(chassis,18,.36,17,.12,panelM,.5,-.18,0);
for(const x of [-8.35,9.35]){box(chassis,.25,7.8,17,.05,frameM,x,3.9,0)}
for(const z of [-8.35,8.35]){box(chassis,17.65,.24,.25,.04,frameM,.5,7.65,z);box(chassis,17.65,.24,.25,.04,frameM,.5,.12,z)}
// Rear fan grille and PSU bay, visible through open face.
for(let i=0;i<13;i++)box(chassis,.08,5.5,.14,.01,trim,-8.19,3.2,-7+i*.31);
box(chassis,3.3,2.7,4.5,.12,panelM,7.5,1.55,-5.4);for(let j=0;j<14;j++)box(chassis,.11,.04,3.9,.01,trim,6.15+j*.2,2.92,-5.4);
box(chassis,16.6,.055,.085,.015,powerM,.4,7.79,-8.15);
const board=makeBoard(chassis);board.group.visible=true;board.set(0,1,0);
const peers=[];if(acquired('BS-001')){const g=new T.Group();board.group.add(g);makeCPU({...h,chip:g});g.position.set(SOCKET.x,SOCKET.seatY,SOCKET.z);peers.push('BS-001')}
if(acquired('BS-002')){const g=new T.Group();board.group.add(g);const m=makeRAM({...h,chip:g});g.position.set(2.19,1,-3.55);m.install(10,ease);m.modules.forEach(x=>x.position.y=0);peers.push('BS-002')}
const glass=new T.Group();scene.add(glass);glass.position.set(.5,8,0);
const gm=new T.MeshPhysicalMaterial({color:0x648da6,transparent:true,opacity:.17,metalness:.2,roughness:.15,depthWrite:false,side:T.DoubleSide});
box(glass,17.45,.11,16.7,.04,gm);for(const x of [-8.65,8.65])box(glass,.19,.16,16.7,.035,trim,x,0,0);for(const z of [-8.26,8.26])box(glass,17.3,.16,.19,.035,trim,0,0,z);
for(const x of [-7.7,7.7])for(const z of [-7.5,7.5]){mesh(glass,new T.CylinderGeometry(.15,.15,.12,24),trim,x,.13,z)}
const tray=new T.Group();scene.add(tray);box(tray,15.8,.22,7.5,.13,rubber,.5,.03,13);box(tray,15.2,.10,6.9,.15,panelM,.5,.19,13);
const gpu=createGPU(h);scene.add(gpu);const start=new T.Vector3(.5,1.25,13),aligned=new T.Vector3(.4,7.75,1.1),seated=new T.Vector3(.4,3.95,1.1);
const plug=new T.Group();scene.add(plug);box(plug,1.27,.50,.72,.05,rubber);box(plug,1.18,.13,.64,.03,trim,0,-.31,0);
const screw=mesh(chassis,new T.CylinderGeometry(.18,.18,.28,16),trim,-7.0,7.20,1.10);screw.visible=false;
let cable=null;function cableAt(pos){if(cable){scene.remove(cable);cable.geometry.dispose();}const curve=new T.CatmullRomCurve3([new T.Vector3(7.6,3,-5.3),new T.Vector3(7.4,7.0,-3),new T.Vector3(4.0,8.8,0),new T.Vector3(pos.x,pos.y+.48,pos.z)]);cable=mesh(scene,new T.TubeGeometry(curve,32,.15,8,false),rubber);}
const camera=new T.PerspectiveCamera(39,1,.1,180);let yaw=.13,pitch=.65,dist=44,target=new T.Vector3(.4,2.8,3.6),gyaw=yaw,gpitch=pitch,gdist=dist,goal=target.clone(),drag=null;
let step=0,alignment=0,connected=0,glassOpen=0,seat=0,fasten=0,powered=false,labMode=false,progressTime=performance.now(),sound=false,ctx=null,timer,frameCount=0,stamp=performance.now(),fps=0;
const stages=['Access','Alignment','Seat','Secure','Power cable','Boot','Performance unlock','Render lab'];
const copy=[
 ['Open the workstation','Remove the glass panel to expose the PCIe slot.'],
 ['Align the graphics card','Move the card from its anti-static tray to the highlighted PCIe slot.'],
 ['Seat the card','Lower the aligned edge connector into the slot.'],
 ['Secure the bracket','Turn the retention screw to secure the card to the chassis.'],
 ['Connect auxiliary power','Slide the connector into its virtual socket.'],
 ['First boot','Power up the workstation and watch the fans spin.'],
 ['Performance unlocked','Watch the RTX 5090 reference specifications count up from the RTX 4090 baseline.'],
 ['Run graphics workloads','Change geometry density, material and lighting in a live rendered scene.']
];
const guideMat=new T.MeshBasicMaterial({color:0x8bff70,transparent:true,opacity:.60,depthWrite:false});const guide=box(chassis,6.3,.025,.34,.005,guideMat,-.8,.56,1.1);guide.visible=false;
function flash(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('show'),1600)}
function cam(i){goal.set(.5,i===0?2.5:3.9,i===0?4:1.5);gdist=i===0?43:i===1?36:i===6?32:31;gyaw=i===4?.22:.12;gpitch=i===1?.75:i===4?.52:.53;}
function ui(){ $('heading').textContent=copy[step][0];$('hint').textContent=copy[step][1];$('steps').innerHTML=stages.map((s,i)=>'<div class="'+(i===step?'active':i<step?'done':'')+'">'+(i<step?'✓ ':String(i+1).padStart(2,'0')+' · ')+s+'</div>').join('');
 const controls=[
 '<button data-do="open">Release glass panel</button>',
 '<label>Alignment <output id="alignText">'+Math.round(alignment*100)+'%</output><input id="align" type="range" min="0" max="100" value="'+Math.round(alignment*100)+'"></label><button data-do="aligned" '+(alignment<.99?'disabled':'')+'>Lock alignment</button>',
 '<button data-do="seat">Press card into slot</button>',
 '<label>Retention screw <output id="fastenText">'+Math.round(fasten*100)+'%</output><input id="fasten" type="range" min="0" max="100" value="'+Math.round(fasten*100)+'"></label><button data-do="secure" '+(fasten<.99?'disabled':'')+'>Secure bracket</button>',
 '<label>Power connector <output id="plugText">'+Math.round(connected*100)+'%</output><input id="plug" type="range" min="0" max="100" value="'+Math.round(connected*100)+'"></label><button data-do="connect" '+(connected<.99?'disabled':'')+'>Confirm connection</button>',
 '<button data-do="boot">Power on workstation</button>',
 '<button data-do="lab">Enter render chamber</button><a href="/market/index.html" style="display:block;margin-top:12px;text-align:center">Return to Market ↗</a>'
 ];$('control').innerHTML=controls[step];guide.visible=step===1||step===2;screw.visible=step>=3;
}
function next(msg){step++;cam(step);ui();av.event(['click','open','align','seat','screw','connect','boot'][step]);if(step===6){av.fan(true);numbers.show(true);}flash(msg)}
document.addEventListener('input',e=>{const n=+e.target.value/100;if(e.target.id==='align'){alignment=n;$('alignText').textContent=Math.round(n*100)+'%';document.querySelector('[data-do=aligned]').disabled=n<.99}if(e.target.id==='fasten'){fasten=n;$('fastenText').textContent=Math.round(n*100)+'%';document.querySelector('[data-do=secure]').disabled=n<.99}if(e.target.id==='plug'){connected=n;$('plugText').textContent=Math.round(n*100)+'%';document.querySelector('[data-do=connect]').disabled=n<.99}});
document.addEventListener('click',e=>{const a=e.target.closest('[data-do]')?.dataset.do;if(a==='open'&&step===0){next('Chassis unlocked')}else if(a==='aligned'&&step===1&&alignment>=.99){alignment=1;next('PCIe alignment locked')}else if(a==='seat'&&step===2){next('PCIe card seated')}else if(a==='secure'&&step===3&&fasten>=.99){fasten=1;next('Bracket secured')}else if(a==='connect'&&step===4&&connected>=.99){connected=1;next('Power connected')}else if(a==='boot'&&step===5){powered=true;saveInstalled('BS-003');next('System online · 32 GB GDDR7')}else if(a==='lab'&&step===6){enterLab()}});
$('reset').onclick=()=>{labMode=false;$('lab').hidden=true;document.querySelector('.panel').hidden=false;step=0;alignment=connected=fasten=seat=0;powered=false;numbers.hide(true);av.fan(false);cam(0);ui();flash('Installation restarted')};

$('overview').onclick=()=>{if(labMode){goal.set(0,1.8,0);gdist=19;gyaw=.25;gpitch=.25}else cam(step)};
const labScene=new T.Scene();labScene.background=new T.Color(0x080f1b);labScene.environment=environment;labScene.fog=new T.Fog(0x080f1b,25,60);
const lk=new T.DirectionalLight(0x8dcfff,1.5);lk.position.set(-5,9,8);labScene.add(lk);const lr=new T.DirectionalLight(0xffad66,2.0);lr.position.set(8,3,-6);labScene.add(lr);labScene.add(new T.HemisphereLight(0xb8d8ff,0x252c46,1.0));
const labRoot=new T.Group();labScene.add(labRoot);const geo=new T.IcosahedronGeometry(.42,1),metal=new T.MeshPhysicalMaterial({color:0xa3cbdb,metalness:.83,roughness:.2,clearcoat:.6}),crystal=new T.MeshPhysicalMaterial({color:0x8ad2f5,metalness:.15,roughness:.12,transparent:true,opacity:.47,depthWrite:false}),wire=new T.MeshBasicMaterial({color:0x78d9fa,wireframe:true});const inst=new T.InstancedMesh(geo,metal,512);labRoot.add(inst);inst.count=128;
const obj=new T.Object3D();function layoutLab(){const n=inst.count;for(let i=0;i<n;i++){const theta=i*2.39996323,r=2.4+Math.sqrt(i/n)*4.1;obj.position.set(Math.cos(theta)*r,Math.sin(i*.68)*1.1+(i%9)*.43-.9,Math.sin(theta)*r);obj.rotation.set(i*.37,i*.79,i*.16);obj.scale.setScalar(.55+(i%7)*.065);obj.updateMatrix();inst.setMatrixAt(i,obj.matrix);inst.setColorAt(i,new T.Color().setHSL(.47+(i%29)/100,.56,.57));}inst.instanceMatrix.needsUpdate=true;if(inst.instanceColor)inst.instanceColor.needsUpdate=true;inst.computeBoundingSphere();}
layoutLab();const base=mesh(labScene,new T.CylinderGeometry(7.6,7.6,.18,96),mat(0x121f2e,.7,.28),0,-1.45,0);const ring=mesh(labScene,new T.TorusGeometry(7.0,.028,8,100),new T.MeshBasicMaterial({color:0x66aaff}),0,-1.34,0);ring.rotation.x=Math.PI/2;
function enterLab(){numbers.hide();step=7;labMode=true;$('lab').hidden=false;document.querySelector('.panel').hidden=true;goal.set(0,1.8,0);gdist=19;gyaw=.25;gpitch=.25;flash('Live graphics workload');av.event('lab');av.fan(false)}
$('return').onclick=()=>{step=6;ui();numbers.show();labMode=false;$('lab').hidden=true;document.querySelector('.panel').hidden=false;cam(step);av.fan(powered)};
$('density').oninput=()=>{inst.count=+$('density').value;layoutLab();$('densityText').textContent=inst.count+' objects';$('instances').textContent=inst.count};
$('surface').onchange=()=>inst.material=({metal,glass:crystal,wire})[$('surface').value];
$('lighting').oninput=()=>lk.intensity=+$('lighting').value;
const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;gyaw+=(e.clientX-drag[0])*.006;gpitch=T.MathUtils.clamp(gpitch+(e.clientY-drag[1])*.005,.08,1.35);drag=[e.clientX,e.clientY]});for(const ev of ['pointerup','pointercancel'])canvas.addEventListener(ev,()=>drag=null);canvas.addEventListener('wheel',e=>{e.preventDefault();gdist=T.MathUtils.clamp(gdist*Math.exp(e.deltaY*.001),9,75)},{passive:false});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
let prevPlug=new T.Vector3(999,0,0),last=performance.now();const plugTarget=new T.Vector3(1.12,7.60,1.1),plugStart=new T.Vector3(2.3,9.5,3.1);
function frame(t){const dt=Math.min(.12,(t-last)/1000);last=t;const a=1-Math.exp(-dt*6);glassOpen+=((step>0?1:0)-glassOpen)*a;glass.position.z=-glassOpen*19;glass.position.y=8+glassOpen*1.1;glass.visible=glassOpen<.98;
 seat+=((step>=3?1:0)-seat)*a;const p=start.clone().lerp(aligned,alignment);if(step>=2)p.copy(aligned).lerp(seated,seat);gpu.position.lerp(p,a);gpu.rotation.x+=((-Math.PI/2*(1-alignment))-gpu.rotation.x)*a;
 screw.rotation.y=fasten*6*Math.PI;screw.position.y=7.40-.20*fasten;
 plug.visible=step>=4;const cp=plugStart.clone().lerp(plugTarget,connected);plug.position.lerp(cp,a);if(plug.visible&&prevPlug.distanceTo(plug.position)>.035){cableAt(plug.position);prevPlug.copy(plug.position)}if(cable)cable.visible=plug.visible;
 const on=powered?1:0;gpu.userData.light.emissiveIntensity=on*1.8;powerM.emissiveIntensity=on*1.6;board.set(0,1,on);for(const f of gpu.userData.fans)f.rotation.z-=dt*(powered?8:0);
 target.lerp(goal,a);yaw+=(gyaw-yaw)*a;pitch+=(gpitch-pitch)*a;dist+=(gdist-dist)*a;const d=dist*(camera.aspect<.75?1.5:1);camera.position.set(target.x+d*Math.cos(pitch)*Math.sin(yaw),target.y+d*Math.sin(pitch),target.z+d*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(target);
 if(labMode){labRoot.rotation.y+=dt*.19;renderer.render(labScene,camera)}else renderer.render(scene,camera);frameCount++;if(t-stamp>=1200){fps=Math.round(frameCount*1000/(t-stamp));$('fps').textContent=fps;frameCount=0;stamp=t}requestAnimationFrame(frame)}
gpu.position.copy(start);gpu.rotation.x=-Math.PI/2;plug.position.copy(plugStart);cam(0);ui();window.__gpu={state:()=>({step,alignment,connected,fasten,powered,labMode,peers,position:gpu.position.toArray(),instances:inst.count,surface:$('surface').value,fps,startup:numbers.state()}),scene,gpu,board,audio:av.state};requestAnimationFrame(frame);
