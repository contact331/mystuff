import * as T from '../t03/vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../t03/vendor/RoundedBoxGeometry.js';
import {makeCPU,makeRAM} from '../v5/models.js';
export const exhibits=[
 {id:'BS-001',name:'Core Ultra 9 285K',era:'Contemporary',caption:'24-core processor · Arrow Lake',pdf:'/v4/companions/bs-001-rev-b.pdf',kind:'cpu'},
 {id:'BS-002',name:'Noble DDR5 64 GB',era:'Contemporary',caption:'Dual-channel memory · 6400 MT/s',pdf:'/v5/companions/bs-002.pdf',kind:'ram'},
 {id:'HX-001',name:'Celestial orrery',era:'Heritage',caption:'Mechanical planetary display · original interpretation',kind:'orrery',preview:true},
 {id:'FX-001',name:'Molecular atelier',era:'Frontier',caption:'Speculative fabrication chamber · concept',kind:'atelier',preview:true}
];
export const finishes={gold:{name:'Gold / onyx',metal:0xc8a45e,body:0x15171d,light:0xffd590},sapphire:{name:'Platinum / sapphire',metal:0xc5d1dd,body:0x12376d,light:0x7fbfff},ruby:{name:'Rose gold / ruby',metal:0xd7a38a,body:0x64172c,light:0xff7396},emerald:{name:'Gold / emerald',metal:0xc8a45e,body:0x0d503c,light:0x70f6c1}};
export function helpers(renderer){
 let seed=285;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const tex=(w,h,fn,srgb=true)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t};
 const mesh=(p,g,m,x=0,y=0,z=0)=>{const a=new T.Mesh(g,m);a.position.set(x,y,z);p.add(a);return a};
 const box=(p,w,h,d,r,m,x=0,y=0,z=0)=>mesh(p,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/2,h/2,d/2)),m,x,y,z);
 const brushed=tex(512,512,(c,w,h)=>{c.fillStyle='#c5c8c6';c.fillRect(0,0,w,h);for(let i=0;i<3500;i++){c.strokeStyle=i%2?'#ffffff16':'#00000013';const y=rnd()*h;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}});
 const metalRough=tex(128,128,(c,w,h)=>{c.fillStyle='#898989';c.fillRect(0,0,w,h)},false);
 return {T,tex,mesh,box,rnd,brushed,metalRough,dummy:new T.Object3D()};
}
const metal=c=>new T.MeshPhysicalMaterial({color:c,metalness:.85,roughness:.28,clearcoat:.2});
const stone=c=>new T.MeshPhysicalMaterial({color:c,roughness:.29,metalness:.2,clearcoat:.5});
const glow=c=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.8,roughness:.3});
function ring(h,p,r,t,y,m){const a=h.mesh(p,new T.TorusGeometry(r,t,8,80),m,0,y,0);a.rotation.x=-Math.PI/2;return a}
function cyl(h,p,rt,rb,height,y,m){return h.mesh(p,new T.CylinderGeometry(rt,rb,height,64),m,0,y,0)}
export function pedestal(h,parent){
 const g=new T.Group();parent.add(g);const trim=metal(0xc8a45e),body=stone(0x15171d),led=glow(0xffd590);
 cyl(h,g,1.57,1.68,.13,.065,trim);cyl(h,g,1.58,1.58,.56,.41,body);cyl(h,g,1.5,1.58,.11,.745,trim);cyl(h,g,1.5,1.5,.09,.845,body);ring(h,g,1.49,.012,.9,led);ring(h,g,1.56,.016,.19,trim);ring(h,g,1.54,.012,.67,trim);
 return {g,setFinish(k){const f=finishes[k]||finishes.gold;trim.color.setHex(f.metal);body.color.setHex(f.body);led.color.setHex(f.light);led.emissive.setHex(f.light)}};
}
export function buildExhibit(h,item,parent){
 const root=new T.Group();parent.add(root);const chip=new T.Group();root.add(chip);let model,animate=()=>{};
 if(item.kind==='cpu'){model=makeCPU({...h,chip});chip.rotation.set(.68,.28,0);root.scale.setScalar(.92);}
 if(item.kind==='ram'){model=makeRAM({...h,chip});chip.rotation.set(.72,.24,0);root.scale.setScalar(.48);}
 if(item.kind==='orrery'){
  const brass=metal(0xc79c4a),dark=stone(0x25343d),sun=glow(0xffb742),blue=stone(0x348ac3),ivory=stone(0xbac5b5),copper=metal(0xc66c43);
  cyl(h,chip,1.04,1.14,.18,-.53,dark);cyl(h,chip,1.06,1.06,.045,-.42,brass);cyl(h,chip,.09,.14,.68,-.07,brass);h.mesh(chip,new T.SphereGeometry(.25,32,20),sun,0,.37,0);
  const pivots=[];[.48,.76,1.04].forEach((r,i)=>{ring(h,chip,r,.013,.13+i*.065,brass);const p=new T.Group();chip.add(p);p.rotation.y=i*2.1;h.box(p,r,.027,.035,.008,brass,r/2,.13+i*.065,0);h.mesh(p,new T.SphereGeometry([.075,.12,.085][i],24,16),[copper,blue,ivory][i],r,.20+i*.065,0);pivots.push(p);});
  const gear=new T.Group();chip.add(gear);cyl(h,gear,.52,.52,.06,-.34,brass);for(let i=0;i<36;i++){const q=i*Math.PI/18;const tooth=h.box(gear,.11,.065,.075,.005,brass,Math.cos(q)*.54,-.34,Math.sin(q)*.54);tooth.rotation.y=-q;}
  animate=t=>{pivots.forEach((p,i)=>p.rotation.y=i*2.1+t*[.9,.55,.32][i]);gear.rotation.y=-t*.6};
 }
 if(item.kind==='atelier'){
  const titanium=metal(0x9cb3c8),black=stone(0x101f32),cyan=glow(0x62d9ff),violet=glow(0xa58eff);
  h.box(chip,2.10,.24,1.68,.10,black,0,-.68,0);h.box(chip,1.92,.08,1.50,.07,titanium,0,-.51,0);
  for(const x of [-.91,.91]){h.box(chip,.17,1.52,1.48,.07,black,x,.24,0);h.box(chip,.035,1.20,.055,.01,cyan,x*.93,.25,.72);}
  h.box(chip,2.1,.20,1.68,.10,titanium,0,1.03,0);h.box(chip,1.55,.06,1.22,.03,black,0,.91,0);
  const glass=new T.MeshPhysicalMaterial({color:0x7fc8ee,transparent:true,opacity:.14,roughness:.12,metalness:.1,depthWrite:false,side:T.DoubleSide});h.box(chip,1.65,1.32,.025,.01,glass,0,.23,-.72);
  ring(h,chip,.57,.032,-.39,cyan);ring(h,chip,.43,.018,-.35,violet);
  const head=new T.Group();chip.add(head);h.box(head,.36,.32,.30,.05,titanium,0,.66,0);h.mesh(head,new T.CylinderGeometry(.045,.08,.15,20),cyan,0,.42,0);
  const atoms=new T.Group();chip.add(atoms);const atomM=[cyan,violet,titanium];for(let x=-2;x<=2;x++)for(let y=0;y<4;y++)for(let z=-2;z<=2;z++){if((x*x+z*z+y*y)>9)continue;h.mesh(atoms,new T.SphereGeometry(.047,12,8),atomM[(x+y+z+9)%3],x*.17,-.29+y*.16,z*.17);}
  const beam=h.mesh(chip,new T.CylinderGeometry(.012,.045,.67,12),new T.MeshBasicMaterial({color:0x6bdeff,transparent:true,opacity:.32,depthWrite:false}),0,.05,0);
  animate=t=>{head.position.x=.30*Math.sin(t*1.3);head.position.z=.24*Math.cos(t*.9);beam.position.x=head.position.x;beam.position.z=head.position.z;atoms.rotation.y=t*.35;atoms.scale.setScalar(.86+.14*Math.sin(t*.7));};
 }
 root.position.y=item.kind==='atelier'?1.70:1.62;
 return {root,chip,model,animate};
}
