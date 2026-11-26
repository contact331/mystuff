import * as T from '../t03/vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../t03/vendor/RoundedBoxGeometry.js';
import {RoomEnvironment} from '../t03/vendor/RoomEnvironment.js';
import {bindAudio} from './audio.js';
import {makeBoard,metrics,SOCKET} from './motherboard.js';
import {layoutAt,stages,CAMERA_STAGES,ease,clamp} from './layout.js';
const el=id=>document.getElementById(id), stage=el('scene'), error=el('err');
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){error.style.display='block';error.textContent='WebGL unavailable: '+e.message;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;stage.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x1b1d21);scene.fog=new T.Fog(0x1b1d21,15,32);
const camera=new T.PerspectiveCamera(36,1,.05,100);
const room=new RoomEnvironment(), pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(room,.035).texture;room.dispose();pmrem.dispose();
const lights=new T.HemisphereLight(0xe8eeff,0x51453b,.75);scene.add(lights);
function spot(color,power,pos,size){const l=new T.DirectionalLight(color,power);l.position.set(...pos);l.castShadow=true;l.shadow.mapSize.set(size,size);l.shadow.camera.left=-5;l.shadow.camera.right=5;l.shadow.camera.top=5;l.shadow.camera.bottom=-5;l.shadow.camera.near=.1;l.shadow.camera.far=20;l.shadow.normalBias=.035;l.shadow.bias=-.0001;l.shadow.radius=4;scene.add(l);return l;}
spot(0xffe8cc,3.1,[4,7,5],1024);const rim=new T.DirectionalLight(0xc7deff,2.3);rim.position.set(-5,4,-3);scene.add(rim);const fill=new T.DirectionalLight(0xffffff,.8);fill.position.set(-4,2,5);scene.add(fill);
let seed=285;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function tex(w,h,fn,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);const a=new T.CanvasTexture(c);if(srgb)a.colorSpace=T.SRGBColorSpace;a.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return a;}
const brushed=tex(1024,1024,(c,w,h)=>{c.fillStyle='#c5c8c6';c.fillRect(0,0,w,h);for(let i=0;i<16000;i++){const v=130+Math.floor(rnd()*105);c.strokeStyle='rgba('+v+','+v+','+v+','+(.05+rnd()*.16)+')';c.lineWidth=.35+rnd()*.8;const y=rnd()*h;c.beginPath();c.moveTo(-50,y);c.lineTo(w+50,y+rnd()*1.2-.6);c.stroke();} });
const metalRough=tex(512,512,(c,w,h)=>{c.fillStyle='#808080';c.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const v=65+Math.floor(rnd()*95);c.strokeStyle='rgba('+v+','+v+','+v+',0.35)';const y=rnd()*h;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}},false);
const stone=tex(1024,1024,(c,w,h)=>{const im=c.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=(y*w+x)*4;const veins=Math.pow(Math.max(0,Math.sin(x*.023+y*.013+2*Math.sin(y*.009)+Math.sin(x*.011))),18);const n=20+rnd()*12+veins*16;im.data[a]=n;im.data[a+1]=n+1;im.data[a+2]=n+3;im.data[a+3]=255;}c.putImageData(im,0,0);});stone.wrapS=stone.wrapT=T.RepeatWrapping;stone.repeat.set(5,5);
const surface=new T.MeshStandardMaterial({map:stone,color:0x9c9c9c,roughness:.46,metalness:.12});
function mesh(parent,geo,mat,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,r,mat,x=0,y=0,z=0){return mesh(parent,new RoundedBoxGeometry(w,h,d,4,r),mat,x,y,z);}
function cylinder(parent,rt,rb,h,mat,y,segments=128){return mesh(parent,new T.CylinderGeometry(rt,rb,h,segments),mat,0,y,0);}
function ring(parent,r,t,mat,y){const m=mesh(parent,new T.TorusGeometry(r,t,12,128),mat,0,y,0);m.rotation.x=Math.PI/2;return m;}
const floor=mesh(scene,new T.PlaneGeometry(80,80),surface,0,-.025,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
const gold=new T.MeshPhysicalMaterial({color:0xc9a05a,metalness:1,roughness:.23,clearcoat:.25,clearcoatRoughness:.17,envMapIntensity:1.35});
const dark=new T.MeshPhysicalMaterial({color:0x151618,metalness:.35,roughness:.18,clearcoat:.85,clearcoatRoughness:.13,envMapIntensity:1.2});
const gemstone=new T.MeshPhysicalMaterial({color:0x111218,metalness:.12,roughness:.14,clearcoat:1,clearcoatRoughness:.07,envMapIntensity:1.8});
const gemRim=new T.MeshPhysicalMaterial({color:0x202229,roughness:.12,metalness:.12,clearcoat:1,envMapIntensity:1.65});
const stageRoot=new T.Group();scene.add(stageRoot);
cylinder(stageRoot,1.71,1.82,.12,gold,.06);cylinder(stageRoot,1.72,1.72,.16,dark,.19);
cylinder(stageRoot,1.60,1.72,.08,gold,.31);
cylinder(stageRoot,1.48,1.60,.34,gemstone,.52,64);
cylinder(stageRoot,1.53,1.48,.07,gold,.72);
cylinder(stageRoot,1.56,1.53,.085,dark,.795);
ring(stageRoot,1.51,.018,gold,.844);ring(stageRoot,1.58,.017,gold,.30);ring(stageRoot,1.68,.013,gold,.255);
// Single non-intersecting pedestal body; no coincident faceted shell.
const studs=new T.InstancedMesh(new T.SphereGeometry(.019,8,6),gold,120);const dummy=new T.Object3D();for(let i=0;i<120;i++){const a=i/120*Math.PI*2;dummy.position.set(Math.sin(a)*1.635,.278,Math.cos(a)*1.635);dummy.updateMatrix();studs.setMatrixAt(i,dummy.matrix);}stageRoot.add(studs);
const plaqueTex=tex(1024,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#baa064');g.addColorStop(.43,'#e3cc92');g.addColorStop(1,'#99733d');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#6d542d';c.lineWidth=4;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#47361e';c.textAlign='center';c.font='30px Georgia';c.fillText('M Y S T U F F   /   N O B L E   C O L L E C T I O N',w/2,60);c.font='bold 76px Georgia';c.fillText('CORE ULTRA 9 285K',w/2,147);c.font='28px Georgia';c.fillText('BS-001     •     ARROW LAKE',w/2,204);});
const plaque=box(stageRoot,1.92,.28,.052,.025,gold,0,.48,1.665);plaque.rotation.x=-.08;
const pFace=mesh(stageRoot,new T.PlaneGeometry(1.83,.23),new T.MeshStandardMaterial({map:plaqueTex,metalness:.6,roughness:.38}),0,.48,1.697);pFace.rotation.x=-.08;
const cpuRoot=new T.Group(), chip=new T.Group();cpuRoot.add(chip);scene.add(cpuRoot);
const pcbTex=tex(1024,1024,(c,w,h)=>{c.fillStyle='#17443e';c.fillRect(0,0,w,h);for(let i=0;i<210;i++){const x=rnd()*w,y=rnd()*h,dx=(rnd()-.5)*200,dy=(rnd()-.5)*180;c.strokeStyle=i%2?'#28574c':'#15332e';c.lineWidth=1+rnd()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*.5,y);c.lineTo(x+dx,y+dy*.5);c.lineTo(x+dx,y+dy);c.stroke();}});
const pcb=new T.MeshPhysicalMaterial({map:pcbTex,roughness:.4,metalness:.1,clearcoat:.45});
const steel=new T.MeshPhysicalMaterial({map:brushed,roughnessMap:metalRough,roughness:.62,metalness:1,envMapIntensity:1.35,clearcoat:.16,clearcoatRoughness:.22});
const steelEdge=new T.MeshStandardMaterial({color:0xb8b9b6,metalness:1,roughness:.22});
const contact=new T.MeshStandardMaterial({color:0xc9a65c,metalness:1,roughness:.32});
const solder=new T.MeshStandardMaterial({color:0x9a9b99,metalness:.8,roughness:.31});
const ceramic=new T.MeshStandardMaterial({color:0x95816a,roughness:.68,metalness:.05});
box(chip,1.78,.055,2.11,.025,pcb,0,0,0);
const ihsBase=box(chip,1.67,.025,1.98,.022,steelEdge,0,.038,0);
// IHS outline: rounded central body with edge reliefs, not a measured CAD model.
const outline=new T.Shape();const points=[[-.76,-.94],[.76,-.94],[.81,-.89],[.81,-.46],[.75,-.41],[.75,-.29],[.81,-.24],[.81,.24],[.75,.29],[.75,.41],[.81,.46],[.81,.89],[.76,.94],[-.76,.94],[-.81,.89],[-.81,.46],[-.75,.41],[-.75,.29],[-.81,.24],[-.81,-.24],[-.75,-.29],[-.75,-.41],[-.81,-.46],[-.81,-.89]];
points.forEach((p,i)=>i?outline.lineTo(...p):outline.moveTo(...p));outline.closePath();
const ihs=new T.ExtrudeGeometry(outline,{depth:.075,bevelEnabled:true,bevelSize:.028,bevelThickness:.023,bevelSegments:4,steps:1});ihs.rotateX(-Math.PI/2);ihs.translate(0,.057,0);const ihsMesh=mesh(chip,ihs,[steel,steelEdge]);
const etch=tex(1024,1216,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(36,40,40,.68)';c.textAlign='left';c.font='bold 85px Arial';c.fillText('intel',175,363);c.font='60px Arial';c.fillText('CORE™ ULTRA 9',175,455);c.font='bold 76px Arial';c.fillText('285K',175,545);c.font='36px monospace';c.fillText('SRQD5   X0000000',175,610);c.fillText('INTEL © 2024',175,655);const q=9,s=8;for(let y=0;y<q;y++)for(let x=0;x<q;x++)if((x*y+x+3*y)%5<2)c.fillRect(175+x*s,702+y*s,s,s);c.beginPath();c.moveTo(90,1040);c.lineTo(125,1040);c.lineTo(90,1005);c.closePath();c.fill();});
const mark=mesh(chip,new T.PlaneGeometry(1.49,1.76),new T.MeshStandardMaterial({map:etch,transparent:true,depthWrite:false,roughness:.65,metalness:.35,polygonOffset:true,polygonOffsetFactor:-1}),0,.158,0);mark.rotation.x=-Math.PI/2;mark.castShadow=false;mark.renderOrder=2;
// Illustrative land grid; not the exact LGA1851 contact layout.
const pads=[];for(let iz=0;iz<45;iz++)for(let ix=0;ix<37;ix++){const x=(ix-18)*.043,z=(iz-22)*.043;if(Math.abs(x)<.22&&Math.abs(z)<.34)continue;if(Math.abs(x)>.67&&Math.abs(z)>.85)continue;pads.push([x,z]);}
const land=new T.InstancedMesh(new T.BoxGeometry(.027,.006,.032),contact,pads.length);pads.forEach(([x,z],i)=>{dummy.position.set(x,-.032,z);dummy.rotation.set(0,0,0);dummy.updateMatrix();land.setMatrixAt(i,dummy.matrix);});chip.add(land);
for(let i=0;i<28;i++){const x=(i%7-3)*.057,z=(Math.floor(i/7)-1.5)*.078;box(chip,.035,.024,.053,.004,ceramic,x,-.044,z);box(chip,.036,.012,.011,.003,solder,x,-.057,z-.022);box(chip,.036,.012,.011,.003,solder,x,-.057,z+.022);}
for(const x of [-.85,.85])for(let j=0;j<18;j++)box(chip,.027,.018,.04,.003,j%3===0?solder:ceramic,x,.04,(j-8.5)*.095);
// Subtle halo and dust in the levitation gap.
const haloMat=new T.MeshBasicMaterial({color:0xd1b77c,transparent:true,opacity:.18,depthWrite:false,blending:T.AdditiveBlending});const halo=ring(stageRoot,.94,.012,haloMat,.855);halo.castShadow=false;
const dustPos=new Float32Array(90*3);for(let i=0;i<90;i++){const a=rnd()*Math.PI*2,r=.45+rnd()*1.0;dustPos[i*3]=Math.cos(a)*r;dustPos[i*3+1]=.9+rnd()*.65;dustPos[i*3+2]=Math.sin(a)*r;}const dustGeo=new T.BufferGeometry();dustGeo.setAttribute('position',new T.BufferAttribute(dustPos,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:0xe4c58b,size:.015,transparent:true,opacity:.48,depthWrite:false}));scene.add(dust);

// Packaging is intentionally independent of the accepted CPU and pedestal geometry.
const paperMat=new T.MeshStandardMaterial({color:0x171c28,roughness:.65,metalness:.06});
const innerMat=new T.MeshStandardMaterial({color:0x0c111a,roughness:.88});
const foil=new T.MeshPhysicalMaterial({color:0xb99858,metalness:1,roughness:.3,clearcoat:.2});
const satin=new T.MeshPhysicalMaterial({color:0x174ba1,metalness:.26,roughness:.38,sheen:1,sheenColor:0x497ac3,sheenRoughness:.4,clearcoat:.15});
const retailMat=new T.MeshStandardMaterial({color:0x101c38,roughness:.52,metalness:.12});
const trayMat=new T.MeshPhysicalMaterial({color:0x687684,metalness:.12,roughness:.22,clearcoat:1,clearcoatRoughness:.13});
const foam=new T.MeshStandardMaterial({color:0x141922,roughness:.94});
function label(parent,texture,w,d,y,x=0,z=0){const p=mesh(parent,new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:texture,roughness:.68,metalness:.08}),x,y,z);p.rotation.x=-Math.PI/2;p.castShadow=false;return p}
const giftTexture=tex(1024,860,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#252c3d');g.addColorStop(1,'#0c1220');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<9000;i++){c.fillStyle=i%2?'#ffffff06':'#0000000c';c.fillRect(rnd()*w,rnd()*h,2,2)}c.strokeStyle='#a6894d66';c.lineWidth=2;for(let y=-100;y<h+100;y+=100)for(let x=-100;x<w+100;x+=100){c.beginPath();c.moveTo(x,y-50);c.lineTo(x+50,y);c.lineTo(x,y+50);c.lineTo(x-50,y);c.closePath();c.stroke()}c.strokeStyle='#d6b570';c.lineWidth=3;c.strokeRect(18,18,w-36,h-36);});
const cartonTexture=tex(900,1040,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#121c3a');g.addColorStop(.55,'#10234f');g.addColorStop(1,'#123c90');c.fillStyle=g;c.fillRect(0,0,w,h);for(let y=0;y<h;y+=18)for(let x=0;x<w;x+=18){const a=(Math.sin(x*.017+y*.009)+1)/2;c.fillStyle='rgba(48,132,255,'+(.08+a*.35)+')';c.beginPath();c.arc(x,y,1+a*3,0,Math.PI*2);c.fill()}c.fillStyle='#f3f7ff';c.textAlign='left';c.font='bold 90px Arial';c.fillText('intel',72,140);c.font='400 119px Arial';c.fillText('CORE',68,315);c.font='bold 78px Arial';c.fillText('ULTRA',72,415);c.font='bold 150px Arial';c.fillText('9',690,230);c.font='bold 120px Arial';c.fillText('285K',70,795);c.font='28px Arial';c.fillText('DESKTOP PROCESSOR',74,856);c.font='22px Arial';c.fillText('CORE ULTRA SERIES 2',74,930);c.strokeStyle='#e7e9ff';c.lineWidth=3;c.strokeRect(60,343,280,95)});
const sideTexture=tex(1024,256,(c,w,h)=>{c.fillStyle='#102145';c.fillRect(0,0,w,h);c.fillStyle='#dce9fb';c.font='bold 58px Arial';c.fillText('intel  CORE ULTRA 9',40,100);c.font='44px Arial';c.fillText('285K  /  LGA1851',40,183);});
const frontMat=new T.MeshStandardMaterial({map:sideTexture,roughness:.55,metalness:.1});
const receiptTex=tex(512,720,(c,w,h)=>{c.fillStyle='#f4f0e4';c.fillRect(0,0,w,h);c.fillStyle='#20406a';c.font='bold 70px Arial';c.fillText('alza.cz',32,93);c.fillStyle='#a12d35';c.font='bold 22px monospace';c.fillText('SIMULATION ONLY',32,140);c.fillStyle='#292929';c.font='22px monospace';['Intel Core Ultra 9','285K / 1 ks','Illustrative price','--------------------','Subtotal  13 876,03','DPH 21 %   2 913,97','--------------------','TOTAL     16 790 Kč','','No purchase occurred.'].forEach((s,i)=>c.fillText(s,32,210+i*40));});
const packaging=new T.Group();scene.add(packaging);
const gift=new T.Group();packaging.add(gift);
function openBox(parent,w,d,h,t,baseY,mat,inside){box(parent,w,t,d,.035,inside,0,baseY+t/2,0);const y=baseY+t+(h-t)/2;for(const z of [-d/2+t/2,d/2-t/2])box(parent,w,h-t,t,.035,mat,0,y,z);for(const x of [-w/2+t/2,w/2-t/2])box(parent,t,h-t,d-2*t,.035,mat,x,y,0);}
openBox(gift,4.6,3.8,1.01,.13,0,paperMat,innerMat);
for(const z of [-1.82,1.82])box(gift,4.52,.035,.035,.008,foil,0,.997,z);
for(const x of [-2.22,2.22])box(gift,.035,.035,3.65,.008,foil,x,.997,0);
const giftLid=new T.Group();packaging.add(giftLid);box(giftLid,4.72,.16,3.92,.065,paperMat);label(giftLid,giftTexture,4.58,3.78,.082);
const ribbonGroup=new T.Group();giftLid.add(ribbonGroup);
box(ribbonGroup,.43,.025,3.94,.008,satin,0,.104,0);box(ribbonGroup,4.74,.029,.43,.008,satin,0,.119,0);
for(const x of [-.37,.37]){const loop=mesh(ribbonGroup,new T.TorusGeometry(.32,.072,10,48),satin,x,.27,0);loop.scale.set(1.25,.75,1);loop.rotation.z=x>0?-.45:.45;}
box(ribbonGroup,.28,.22,.31,.075,satin,0,.26,0);
for(const side of [-1,1]){const tail=box(ribbonGroup,.28,.028,.73,.012,satin,side*.19,.14,.46);tail.rotation.y=side*.36;}
const retail=new T.Group();packaging.add(retail);
openBox(retail,2.56,2.96,.66,.10,.13,retailMat,foam);
const front=mesh(retail,new T.PlaneGeometry(2.46,.43),frontMat,0,.46,1.484);front.castShadow=false;
const retailLid=new T.Group();packaging.add(retailLid);box(retailLid,2.62,.14,3.02,.035,retailMat);label(retailLid,cartonTexture,2.56,2.95,.072);
const tray=new T.Group();packaging.add(tray);
box(tray,2.26,.10,2.62,.075,trayMat);
for(const x of [-1.065,1.065])box(tray,.12,.19,2.58,.045,trayMat,x,.065,0);
for(const z of [-1.245,1.245])box(tray,2.06,.19,.12,.04,trayMat,0,.065,z);
for(const x of [-.96,.96])for(const z of [-1.09,1.09])box(tray,.17,.12,.17,.025,foam,x,.092,z);
const receiptGroup=new T.Group();packaging.add(receiptGroup);
box(receiptGroup,1.05,.013,1.48,.012,new T.MeshStandardMaterial({color:0xe5dfd0,roughness:.9}));label(receiptGroup,receiptTex,1.03,1.46,.008);receiptGroup.rotation.y=-.23;
// Schematic internal tiles appear only in exploded inspection.
const tileGroup=new T.Group();chip.add(tileGroup);
const tileColors=[0x4381a5,0x8c73b6,0x3d9a83,0xb88a56];
[[-.34,0,.78,1.45],[.36,-.44,.52,.58],[.36,.15,.52,.48],[.36,.61,.52,.36]].forEach((a,i)=>{const m=new T.MeshPhysicalMaterial({color:tileColors[i],metalness:.65,roughness:.25,clearcoat:.65});box(tileGroup,a[2],.045,a[3],.015,m,a[0],.062,a[1]);});
tileGroup.visible=false;
const themes={gold:[0xc9a05a,0x111218,0x202229,0xe7c68d],sapphire:[0xc4c9d0,0x103577,0x2249a0,0x699fff],ruby:[0xd6a28c,0x6e101f,0xa1213c,0xff8794],emerald:[0xc9a05a,0x064a37,0x158b61,0x85e9c1]};
function theme(name){const a=themes[name];if(!a)return;gold.color.setHex(a[0]);gemstone.color.setHex(a[1]);gemRim.color.setHex(a[2]);gemstone.roughness=name==='gold'?.18:.11;gemstone.metalness=name==='gold'?.25:.12;haloMat.color.setHex(a[3]);dust.material.color.setHex(a[3]);}
const board=makeBoard(scene);
const boardKey=new T.DirectionalLight(0xfff1dc,2.25),boardFill=new T.DirectionalLight(0xb9ddff,1.1);boardKey.position.set(2,13,6);boardFill.position.set(-6,8,-5);scene.add(boardKey,boardFill);boardKey.visible=boardFill.visible=false;
const audio=bindAudio(el);let lastArrival=-1,metricsOn=false,metricStart=0;let current=0,progress=0,cpuYaw=0,cpuTilt=0,flipTarget=0,flip=0,exTarget=0,ex=0,autoSpin=true,orbitMode=false,macro=false,zoomFactor=1,camYawOffset=0,camPitchOffset=0,materialChoice='gold',burstTime=-10000,burstKind=0;
const pointers=new Map();let drag=false,moved=false,pinch=0,toastTimer=0;
const pressed=(id,value)=>el(id).setAttribute('aria-pressed',String(value));
function syncSpin(){el('spin').textContent=autoSpin?'Auto-spin on':'Auto-spin off';pressed('spin',autoSpin);}
function update(){el('stage').textContent=stages[current][0];el('hint').textContent=stages[current][1];el('next').textContent=stages[current][2];el('next').disabled=current===10;el('back').disabled=current===0;el('flip').disabled=current<5||current>6;el('explode').disabled=current<5||current>6;for(const id of ['material','spin','macro'])el(id).classList.toggle('visible',id==='macro'?current>=5:current===6);el('steps').innerHTML=stages.map((_,i)=>'<div class="step '+(i<=current?'done':'')+'"></div>').join('');document.body.classList.toggle('install-mode',current>=7);if(current!==10)hideMetrics();if(current<5||current>6){flipTarget=exTarget=0;cpuYaw=cpuTilt=0;el('explode').textContent='Explode';macro=false;pressed('macro',false);}}
function flash(message,kind){burstTime=performance.now();burstKind=kind;el('toast').textContent=message;el('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el('toast').classList.remove('show'),1800);}
function go(n){const next=Math.max(0,Math.min(10,n));if(next===current)return;current=next;zoomFactor=1;camYawOffset=camPitchOffset=0;macro=false;pressed('macro',false);if(current>=7){cpuYaw=cpuTilt=flipTarget=exTarget=0;autoSpin=false;syncSpin();orbitMode=true;pressed('orbit',true);el('orbit').textContent='Orbit camera';}if(current===6){orbitMode=false;pressed('orbit',false);el('orbit').textContent='Orbit camera';cpuYaw=cpuTilt=flipTarget=exTarget=0;el('explode').textContent='Explode';autoSpin=true;syncSpin();}update();audio.sound(current);flash(['Gift reset','Ribbon released','Gift unveiled','Intel carton opened','Protective tray removed','Processor acquired','Exhibition unlocked','Socket exposed','Alignment acquired','Processor seating','Retention lock'][current],current);}
el('next').onclick=()=>{if(current===0)audio.firstGesture();go(current+1)};el('back').onclick=()=>go(current-1);
el('reset').onclick=()=>{go(0);cpuYaw=cpuTilt=flipTarget=exTarget=0;zoomFactor=1;camYawOffset=camPitchOffset=0;autoSpin=true;syncSpin();orbitMode=false;pressed('orbit',false);el('orbit').textContent='Orbit camera';materialChoice='gold';el('material').value='gold';theme('gold');update();};
el('spin').onclick=()=>{autoSpin=!autoSpin;syncSpin();audio.sound(7)};
el('material').onchange=()=>{materialChoice=el('material').value;theme(materialChoice);flash(materialChoice+' exhibition',6);audio.sound(6)};
el('orbit').onclick=()=>{orbitMode=!orbitMode;pressed('orbit',orbitMode);el('orbit').textContent=orbitMode?'Rotate CPU':'Orbit camera'};
el('macro').onclick=()=>{macro=!macro;pressed('macro',macro);zoomFactor=macro?.51:1;audio.sound(7)};
el('flip').onclick=()=>{flipTarget=flipTarget===0?Math.PI:0;audio.sound(7)};
el('explode').onclick=()=>{exTarget=1-exTarget;el('explode').textContent=exTarget?'Assemble':'Explode';audio.sound(4)};
el('receipt').onclick=()=>{el('modal').style.display='flex';audio.sound(7)};el('close').onclick=()=>el('modal').style.display='none';el('modal').onclick=e=>{if(e.target===el('modal'))el('modal').style.display='none'};
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);drag=true;moved=false;if(pointers.size>1)moved=true;});
canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];if(Math.abs(dx)+Math.abs(dy)>2)moved=true;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch)zoomFactor=T.MathUtils.clamp(zoomFactor*pinch/Math.max(1,d),.40,2.0);pinch=d;moved=true;return;}if(current>=5&&current<=6&&!orbitMode&&!e.shiftKey){cpuYaw+=dx*.009;cpuTilt+=dy*.009;}else{camYawOffset-=dx*.009;camPitchOffset=T.MathUtils.clamp(camPitchOffset+dy*.008,-.5,.65);}});
function up(e){pointers.delete(e.pointerId);drag=pointers.size>0;pinch=0;if(!drag&&!moved&&e.type==='pointerup'&&(current<5||current===8||current===9)){if(current===0)audio.firstGesture();go(current+1);}}canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoomFactor=T.MathUtils.clamp(zoomFactor*Math.exp(e.deltaY*.001),.40,2.0);},{passive:false});
window.addEventListener('keydown',e=>{if(e.target.matches('input,select,button')||el('ms-companion-dialog')?.open)return;if(e.key==='ArrowRight'){if(current===0)audio.firstGesture();go(current+1)}if(e.key==='ArrowLeft')go(current-1);if(e.key==='Escape')el('modal').style.display='none';if(e.key==='+'||e.key==='=')zoomFactor=Math.max(.4,zoomFactor-.08);if(e.key==='-')zoomFactor=Math.min(2,zoomFactor+.08);});
const fx=el('fx'),ctx=fx.getContext('2d');function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();fx.width=w;fx.height=h;}new ResizeObserver(resize).observe(stage);resize();
const temp=new T.Vector3();
function project(v){temp.copy(v).project(camera);return [(temp.x*.5+.5)*fx.width,(.5-temp.y*.5)*fx.height,temp.z];}
function effects(t){ctx.clearRect(0,0,fx.width,fx.height);let age=(t-burstTime)/1000;if(age<0||age>1.65)return;let [x,y,z]=project(cpuRoot.position);if(z>1||z< -1)return;const a=1-age/1.65,scale=Math.min(fx.width,fx.height),glow='#'+themes[materialChoice][3].toString(16).padStart(6,'0');ctx.globalCompositeOperation='screen';for(let i=0;i<58;i++){const phi=i*2.39996,rr=age*scale*(.10+(i%11)*.018);ctx.globalAlpha=a*(.35+(i%6)*.1);ctx.fillStyle=burstKind===6?glow:i%3?'#eed69d':'#88beff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(x+Math.cos(phi)*rr,y+Math.sin(phi)*rr-age*age*scale*.022,1.1+(i%4)*.6,0,7);ctx.fill();}ctx.globalAlpha=a*.45;ctx.strokeStyle=glow;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,10+age*scale*.22,4+age*scale*.11,0,0,7);ctx.stroke();ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';}
const lerp=T.MathUtils.lerp;

const gains=metrics.map((m,i)=>{const e=document.createElement('div');e.className='gain';e.innerHTML='<small>'+m.name+'</small><div class="num">+0%</div><em>'+m.sub+'</em>';el(i<3?'uplift-left':'uplift-right').append(e);return {el:e,m,value:Math.round((m.b/m.a-1)*100),num:e.querySelector('.num')};});
function hideMetrics(){metricsOn=false;el('uplift').classList.remove('active');gains.forEach(g=>{g.el.classList.remove('show');g.num.textContent='+0%'});}
function showMetrics(t){if(metricsOn)return;metricsOn=true;metricStart=t;el('uplift').classList.add('active');}
function animateMetrics(t){if(!metricsOn)return;gains.forEach((g,i)=>{const f=clamp((t-metricStart-i*155)/850);g.el.classList.toggle('show',f>0);g.num.textContent='+'+Math.round(g.value*(1-Math.pow(1-f,3)))+'%';});}
const installCameras=[
 {target:[0,.6,-.6],dist:24.5,pitch:1.08,yaw:.12},
 {target:[SOCKET.x,.8,SOCKET.z],dist:8.1,pitch:1.12,yaw:.15},
 {target:[SOCKET.x,.55,SOCKET.z],dist:7.0,pitch:1.13,yaw:.12},
 {target:[0,.4,1.35],dist:36.5,pitch:1.18,yaw:.10}
];
function installLayout(t){
 const p=progress,appear=ease((p-6.38)/.62),travel=ease(p-6),lower=ease(p-8),align=ease(p-7),lock=ease(p-9),retention=ease((lock)*1.7),lever=ease((lock-.52)/.48);
 scene.fog.near=45;scene.fog.far=85;board.group.visible=p>6.38;boardKey.visible=boardFill.visible=board.group.visible;packaging.visible=p<6.7;board.group.position.y=-(1-appear)*1.4;board.set(1-retention,lever,p>=9.98?1:0);
 stageRoot.visible=p<6.36;stageRoot.position.y=-ease((p-6)/.36)*1.65;dust.visible=false;
 const hoverY=lerp(3.15,1.48,align);
 cpuRoot.position.set(lerp(0,SOCKET.x,travel),p<7?lerp(2.16,3.15,travel):lerp(hoverY,SOCKET.seatY,lower),lerp(0,SOCKET.z,travel));
 chip.rotation.set(.77*(1-travel),.23*(1-travel),0,'YXZ');
 ihsBase.position.y=.038;ihsMesh.position.y=0;mark.position.y=.158;tileGroup.position.y=0;tileGroup.visible=false;
 const idx=Math.min(3,Math.max(0,Math.floor(p)-7)),before=p<7?CAMERA_STAGES[6]:installCameras[idx],after=p<7?installCameras[0]:installCameras[Math.min(3,idx+1)],f=ease(p-Math.floor(p)),target=new T.Vector3(...before.target).lerp(new T.Vector3(...after.target),f);
 if(macro)target.set(SOCKET.x,.58,SOCKET.z);const d=(macro?7.2:lerp(before.dist,after.dist,f)*zoomFactor)*(camera.aspect<.8?1.22:1),cy=lerp(before.yaw,after.yaw,f)+camYawOffset,cp=T.MathUtils.clamp(lerp(before.pitch,after.pitch,f)+camPitchOffset,.12,1.48);
 camera.position.set(target.x+d*Math.cos(cp)*Math.sin(cy),target.y+d*Math.sin(cp),target.z+d*Math.cos(cp)*Math.cos(cy));camera.lookAt(target);
 if(p>=9.98&&current===10)showMetrics(t);else if(metricsOn)hideMetrics();
 scene.updateMatrixWorld(true);
}

function applyLayout(t){const l=layoutAt(Math.min(progress,6));packaging.position.x=-l.park;giftLid.position.set(...l.giftLid);retailLid.position.set(...l.retailLid);tray.position.set(...l.trayPos);ribbonGroup.position.set(l.ribbon*5,l.ribbon*.5,0);ribbonGroup.visible=l.ribbon<.99;receiptGroup.position.set(-3.18,.015,1.65);
 // CPU follows the tray until lifted, then is independent of the parked package.
 cpuRoot.position.set(...l.cpu);const look=ease(progress-4);const exhibition=l.pedestal;
 stageRoot.visible=exhibition>.001;stageRoot.position.y=-(1-exhibition)*1.25;dust.visible=stageRoot.visible;dust.rotation.y=t*.00009;halo.scale.setScalar(1+.035*Math.sin(t*.002));
 chip.rotation.set(look*(.77+cpuTilt+flip),look*(.23+cpuYaw),0,'YXZ');
 ihsBase.position.y=.038+ex*.79;ihsMesh.position.y=ex*.79;mark.position.y=.158+ex*.79;tileGroup.position.y=ex*.29;tileGroup.visible=ex>.025;
 if(stageRoot.visible){cpuRoot.position.y+=Math.sin(t*.0015)*.055;cpuRoot.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(chip);const top=stageRoot.position.y+.87;cpuRoot.position.y+=Math.max(0,top+.20-bounds.min.y);}
 if(progress>6){installLayout(t);return l;}scene.fog.near=15;scene.fog.far=32;board.group.visible=false;boardKey.visible=boardFill.visible=false;packaging.visible=true;const k=Math.min(5,Math.floor(progress)),f=ease(progress-k),a=CAMERA_STAGES[k],b=CAMERA_STAGES[k+1];const target=new T.Vector3(...a.target).lerp(new T.Vector3(...b.target),f);if(macro&&current>=5)target.y=cpuRoot.position.y+ex*.2;else if(current>=5)target.y+=ex*.26;
 const d=lerp(a.dist,b.dist,f)*zoomFactor*(camera.aspect<.8?1.22:1),cy=lerp(a.yaw,b.yaw,f)+camYawOffset,cp=T.MathUtils.clamp(lerp(a.pitch,b.pitch,f)+camPitchOffset,-.05,1.30);
 camera.position.set(target.x+d*Math.cos(cp)*Math.sin(cy),target.y+d*Math.sin(cp),target.z+d*Math.cos(cp)*Math.cos(cy));camera.lookAt(target);
 scene.updateMatrixWorld(true);
 return l;
}
let last=performance.now(),stamp=last,count=0;
function frame(t){const dt=Math.min((t-last)/1000,.4);last=t;const delta=current-progress;progress+=Math.sign(delta)*Math.min(Math.abs(delta),dt*1.75);flip+=(flipTarget-flip)*(1-Math.exp(-dt*9));ex+=(exTarget-ex)*(1-Math.exp(-dt*8));if(current===6&&progress>5.95&&autoSpin&&!drag)cpuYaw+=dt*.30;applyLayout(t);renderer.render(scene,camera);effects(t);animateMetrics(t);if(Math.abs(current-progress)<.001&&lastArrival!==current){lastArrival=current;if(current===9){audio.snap(false);flash('Processor seated',6);}if(current===10){audio.snap(true);flash('Platform unlocked',6);}}count++;if(t-stamp>1500){el('quality').textContent='F2 / PBR · '+Math.round(count*1000/(t-stamp))+' FPS';stamp=t;count=0;}requestAnimationFrame(frame);}
update();theme('gold');applyLayout(last);requestAnimationFrame(frame);
window.__mystuffV4={board,metrics,scene,renderer,camera,chip,cpuRoot,packaging,stageRoot,layoutAt,state:()=>({current,progress,flip,ex,autoSpin,orbitMode,macro,materialChoice,metricsOn,boardVisible:board.group.visible,cpuPosition:cpuRoot.position.toArray(),audio:audio.state()}),collisionAudit:()=>{let saved=progress,fail=[],min=Infinity;for(let n=0;n<=120;n++){progress=n/20;const l=applyLayout(0);if(l.pedestal>.001){const a=new T.Box3().setFromObject(packaging),b=new T.Box3().setFromObject(stageRoot);min=Math.min(min,b.min.x-a.max.x);if(a.intersectsBox(b))fail.push(progress);}}progress=saved;applyLayout(performance.now());return {samples:121,fail,minClearance:min};}};
