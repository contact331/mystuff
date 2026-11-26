import * as T from './vendor/three.module.min.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
const el=id=>document.getElementById(id), stage=el('stage'), error=el('error');
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){error.style.display='grid';error.textContent='WebGL unavailable: '+e.message;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;stage.prepend(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x1b1d21);scene.fog=new T.Fog(0x1b1d21,15,32);
const camera=new T.PerspectiveCamera(36,1,.05,100);
const room=new RoomEnvironment(), pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(room,.035).texture;room.dispose();pmrem.dispose();
const lights=new T.HemisphereLight(0xe8eeff,0x51453b,.75);scene.add(lights);
function spot(color,power,pos,size){const l=new T.DirectionalLight(color,power);l.position.set(...pos);l.castShadow=true;l.shadow.mapSize.set(size,size);l.shadow.camera.left=-5;l.shadow.camera.right=5;l.shadow.camera.top=5;l.shadow.camera.bottom=-5;l.shadow.camera.near=.1;l.shadow.camera.far=20;l.shadow.normalBias=.035;l.shadow.bias=-.0001;l.shadow.radius=4;scene.add(l);return l;}
spot(0xffe8cc,3.1,[4,7,5],2048);const rim=new T.DirectionalLight(0xc7deff,2.3);rim.position.set(-5,4,-3);scene.add(rim);const fill=new T.DirectionalLight(0xffffff,.8);fill.position.set(-4,2,5);scene.add(fill);
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
cylinder(stageRoot,1.48,1.60,.34,gemstone,.52,72);
cylinder(stageRoot,1.53,1.48,.07,gold,.72);
cylinder(stageRoot,1.56,1.53,.085,dark,.795);
ring(stageRoot,1.51,.018,gold,.844);ring(stageRoot,1.58,.017,gold,.30);ring(stageRoot,1.68,.013,gold,.255);
const facet=new T.CylinderGeometry(1.477,1.598,.30,48,1,true);mesh(stageRoot,facet,gemRim,0,.52,0);
const studs=new T.InstancedMesh(new T.SphereGeometry(.019,8,6),gold,120);const dummy=new T.Object3D();for(let i=0;i<120;i++){const a=i/120*Math.PI*2;dummy.position.set(Math.sin(a)*1.635,.278,Math.cos(a)*1.635);dummy.updateMatrix();studs.setMatrixAt(i,dummy.matrix);}stageRoot.add(studs);
const plaqueTex=tex(1024,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#baa064');g.addColorStop(.43,'#e3cc92');g.addColorStop(1,'#99733d');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#6d542d';c.lineWidth=4;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#47361e';c.textAlign='center';c.font='30px Georgia';c.fillText('M Y S T U F F   /   N O B L E   C O L L E C T I O N',w/2,60);c.font='bold 76px Georgia';c.fillText('CORE ULTRA 9 285K',w/2,147);c.font='28px Georgia';c.fillText('BS-001     •     ARROW LAKE',w/2,204);});
const plaque=box(stageRoot,1.92,.28,.052,.025,gold,0,.48,1.49);plaque.rotation.x=-.08;
const pFace=mesh(stageRoot,new T.PlaneGeometry(1.83,.23),new T.MeshStandardMaterial({map:plaqueTex,metalness:.6,roughness:.38}),0,.48,1.522);pFace.rotation.x=-.08;
const cpuRoot=new T.Group(), chip=new T.Group();cpuRoot.add(chip);scene.add(cpuRoot);
const pcbTex=tex(1024,1024,(c,w,h)=>{c.fillStyle='#17443e';c.fillRect(0,0,w,h);for(let i=0;i<210;i++){const x=rnd()*w,y=rnd()*h,dx=(rnd()-.5)*200,dy=(rnd()-.5)*180;c.strokeStyle=i%2?'#28574c':'#15332e';c.lineWidth=1+rnd()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*.5,y);c.lineTo(x+dx,y+dy*.5);c.lineTo(x+dx,y+dy);c.stroke();}});
const pcb=new T.MeshPhysicalMaterial({map:pcbTex,roughness:.4,metalness:.1,clearcoat:.45});
const steel=new T.MeshPhysicalMaterial({map:brushed,roughnessMap:metalRough,roughness:.62,metalness:1,envMapIntensity:1.35,clearcoat:.16,clearcoatRoughness:.22});
const steelEdge=new T.MeshStandardMaterial({color:0xb8b9b6,metalness:1,roughness:.22});
const contact=new T.MeshStandardMaterial({color:0xc9a65c,metalness:1,roughness:.32});
const solder=new T.MeshStandardMaterial({color:0x9a9b99,metalness:.8,roughness:.31});
const ceramic=new T.MeshStandardMaterial({color:0x95816a,roughness:.68,metalness:.05});
box(chip,1.78,.055,2.11,.025,pcb,0,0,0);
box(chip,1.67,.025,1.98,.022,steelEdge,0,.038,0);
// IHS outline: rounded central body with edge reliefs, not a measured CAD model.
const outline=new T.Shape();const points=[[-.76,-.94],[.76,-.94],[.81,-.89],[.81,-.46],[.75,-.41],[.75,-.29],[.81,-.24],[.81,.24],[.75,.29],[.75,.41],[.81,.46],[.81,.89],[.76,.94],[-.76,.94],[-.81,.89],[-.81,.46],[-.75,.41],[-.75,.29],[-.81,.24],[-.81,-.24],[-.75,-.29],[-.75,-.41],[-.81,-.46],[-.81,-.89]];
points.forEach((p,i)=>i?outline.lineTo(...p):outline.moveTo(...p));outline.closePath();
const ihs=new T.ExtrudeGeometry(outline,{depth:.075,bevelEnabled:true,bevelSize:.028,bevelThickness:.023,bevelSegments:4,steps:1});ihs.rotateX(-Math.PI/2);ihs.translate(0,.057,0);mesh(chip,ihs,[steel,steelEdge]);
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
const themes={gold:[0xc9a05a,0x111218,0x202229,0xe7c68d],sapphire:[0xc4c9d0,0x103577,0x2249a0,0x699fff],ruby:[0xd6a28c,0x6e101f,0xa1213c,0xff8794],emerald:[0xc9a05a,0x064a37,0x158b61,0x85e9c1]};
function theme(name){const a=themes[name];gold.color.setHex(a[0]);gemstone.color.setHex(a[1]);gemRim.color.setHex(a[2]);haloMat.color.setHex(a[3]);dust.material.color.setHex(a[3]);document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===name)));}
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>theme(b.dataset.theme));
let yaw=.23,tilt=.77,camYaw=.2,camPitch=.34,dist=7.3,spin=true,orbit=false,macro=false,flip=false,drag=false,pointers=new Map(),pinch=0;
const pressed=(id,x)=>el(id).setAttribute('aria-pressed',String(x));
el('spin').onclick=()=>{spin=!spin;pressed('spin',spin)};el('orbit').onclick=()=>{orbit=!orbit;pressed('orbit',orbit)};
el('flip').onclick=()=>{flip=!flip;tilt=flip?-.95:.77;};
el('macro').onclick=()=>{macro=!macro;dist=macro?3.15:7.3;pressed('macro',macro);};
el('reset').onclick=()=>{yaw=.23;tilt=.77;camYaw=.2;camPitch=.34;dist=7.3;spin=true;orbit=macro=flip=false;pressed('spin',true);pressed('orbit',false);pressed('macro',false);theme('gold');};
const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);drag=true;});
canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch)dist=T.MathUtils.clamp(dist*pinch/d,2.6,12);pinch=d;return;}if(orbit){camYaw-=dx*.008;camPitch=T.MathUtils.clamp(camPitch+dy*.008,-.05,1.3);}else{yaw+=dx*.009;tilt+=dy*.009;}});
function up(e){pointers.delete(e.pointerId);drag=pointers.size>0;pinch=0;}canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',e=>{e.preventDefault();dist=T.MathUtils.clamp(dist*Math.exp(e.deltaY*.001),2.6,12);},{passive:false});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();
let last=performance.now(),count=0,stamp=last,smoothedTilt=tilt;
function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;if(spin&&!drag)yaw+=dt*.30;smoothedTilt+=(tilt-smoothedTilt)*(1-Math.exp(-dt*10));cpuRoot.position.y=2.16+Math.sin(t*.0015)*.055;chip.rotation.set(smoothedTilt,yaw,0,'YXZ');dust.rotation.y=t*.00009;halo.scale.setScalar(1+.035*Math.sin(t*.002));const target=new T.Vector3(0,macro?2.12:1.38,0),d=dist*(camera.aspect<.8?1.18:1);camera.position.set(target.x+d*Math.cos(camPitch)*Math.sin(camYaw),target.y+d*Math.sin(camPitch),target.z+d*Math.cos(camPitch)*Math.cos(camYaw));camera.lookAt(target);renderer.render(scene,camera);count++;if(t-stamp>1000){el('status').textContent='PBR / '+Math.round(count*1000/(t-stamp))+' FPS';stamp=t;count=0;}requestAnimationFrame(frame);}
requestAnimationFrame(frame);window.__mystuff={scene,renderer,camera,chip,stageRoot,cpuRoot,theme};
