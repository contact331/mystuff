import * as T from '../t03/vendor/three.module.min.js';
export function makeCPU({chip,tex,rnd,brushed,metalRough,box,mesh,dummy}){
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
const tileGroup=new T.Group();chip.add(tileGroup);
const tileColors=[0x4381a5,0x8c73b6,0x3d9a83,0xb88a56];
[[-.34,0,.78,1.45],[.36,-.44,.52,.58],[.36,.15,.52,.48],[.36,.61,.52,.36]].forEach((a,i)=>{const m=new T.MeshPhysicalMaterial({color:tileColors[i],metalness:.65,roughness:.25,clearcoat:.65});box(tileGroup,a[2],.045,a[3],.015,m,a[0],.062,a[1]);});
tileGroup.visible=false;

return {explode(ex){ihsBase.position.y=.038+ex*.79;ihsMesh.position.y=ex*.79;mark.position.y=.158+ex*.79;tileGroup.position.y=ex*.29;tileGroup.visible=ex>.025;},reset(){this.explode(0)}};
}
export function makeRAM({chip,box,mesh,tex,brushed}){
const pcb=new T.MeshStandardMaterial({color:0x0e2c23,roughness:.5,metalness:.1}), metal=new T.MeshPhysicalMaterial({map:brushed,color:0xd4b166,metalness:1,roughness:.28,clearcoat:.4}),dark=new T.MeshStandardMaterial({color:0x171c25,roughness:.35,metalness:.5}),gold=new T.MeshStandardMaterial({color:0xd1a758,metalness:1,roughness:.25}),led=new T.MeshPhysicalMaterial({color:0xd5ebf8,emissive:0x83bff8,emissiveIntensity:.38,roughness:.15,clearcoat:1}),silicon=new T.MeshStandardMaterial({color:0x191b20,roughness:.6});
const modules=[],shells=[];
const logo=tex(1024,180,(c,w,h)=>{c.fillStyle='#b18e4b';c.fillRect(0,0,w,h);c.fillStyle='#1b222a';c.font='bold 72px Georgia';c.textAlign='center';c.fillText('N O B L E   D D R 5',w/2,80);c.font='34px Arial';c.fillText('32 GB  •  6400 MT/s',w/2,140);});
for(let k=0;k<2;k++){const m=new T.Group();chip.add(m);modules.push(m);m.position.z=(k-.5)*1.65;
box(m,5.10,.065,1.18,.025,pcb,0,0,.12);
const pass=[];for(let i=0;i<8;i++){box(m,.43,.045,.57,.015,silicon,(i-3.5)*.55,.06,.03);box(m,.43,.045,.57,.015,silicon,(i-3.5)*.55,-.06,.03);}
for(const y of [-.042,.042]){const count=138;const pads=new T.InstancedMesh(new T.BoxGeometry(.022,.009,.18),gold,count);const d=new T.Object3D();for(let i=0;i<count;i++){let x=-2.47+i*(4.94/(count-1));if(x>.10&&x<.20)x+=.10;d.position.set(x,y,.63);d.updateMatrix();pads.setMatrixAt(i,d.matrix);}m.add(pads);}
const top=new T.Group(),bottom=new T.Group();m.add(top,bottom);shells.push([top,bottom]);
for(const [side,sg] of [[1,top],[-1,bottom]]){box(sg,5.15,.12,1.10,.075,metal,0,side*.13,-.075);box(sg,4.94,.025,.67,.035,dark,0,side*.207,-.05);const mark=mesh(sg,new T.PlaneGeometry(4.45,.62),new T.MeshStandardMaterial({map:logo,metalness:.55,roughness:.38}),0,side*.225,-.05);mark.rotation.x=side*-Math.PI/2;mark.castShadow=false;for(let i=0;i<8;i++){const b=box(sg,.09,.045,.62,.012,metal,-2.24+i*.64,side*.21,-.065);b.rotation.y=.36;}}
box(m,5.03,.18,.20,.065,led,0,0,-.65);for(const x of [-2.56,2.56])box(m,.12,.30,1.04,.04,metal,x,0,-.05);
}
function pair(){modules.forEach((m,i)=>{m.position.set(0,0,(i-.5)*1.65);m.rotation.set(0,0,0);});}
function explode(ex){shells.forEach(([a,b])=>{a.position.y=.42*ex;b.position.y=-.42*ex});}
return {modules,pair,explode,reset(){pair();explode(0)},install(p,ease){const t=ease(p-6),align=ease(p-7),first=ease(p-8),second=ease(p-9);for(let i=0;i<2;i++){const m=modules[i];m.position.set((i-.5)*1.14*t, -((i===0?first:second))*1.0,((i-.5)*1.65)*(1-t));m.rotation.set(Math.PI/2*t,Math.PI/2*t,0,'YXZ');}return {t,align,first,second};}};
}
