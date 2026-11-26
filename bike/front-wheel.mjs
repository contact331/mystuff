import * as T from '../t03/vendor/three.module.min.js';
// Local, metre-scale component; Z is the axle axis; origin is the axle center.
// Batching is confined to assembly/material. No dependency on external model or CDN.
function batchPart(group){
 group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),buckets=new Map();
 group.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||o.material.transparent)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o)});
 for(const items of buckets.values()){
  if(items.length<2)continue;
  const geo=items.map(o=>{let g=o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));return g});
  let vc=0,ic=0;for(const g of geo){vc+=g.attributes.position.count;ic+=g.index?.count||g.attributes.position.count}
  const pos=new Float32Array(vc*3),norm=new Float32Array(vc*3),uv=new Float32Array(vc*2),idx=vc>65535?new Uint32Array(ic):new Uint16Array(ic);let v=0,i=0;
  for(const g of geo){const n=g.attributes.position.count;pos.set(g.attributes.position.array,v*3);if(g.attributes.normal)norm.set(g.attributes.normal.array,v*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,v*2);if(g.index){for(let j=0;j<g.index.count;j++)idx[i++]=v+g.index.getX(j)}else{for(let j=0;j<n;j++)idx[i++]=v+j}v+=n;g.dispose()}
  const merged=new T.BufferGeometry();merged.setAttribute('position',new T.BufferAttribute(pos,3));merged.setAttribute('normal',new T.BufferAttribute(norm,3));merged.setAttribute('uv',new T.BufferAttribute(uv,2));merged.setIndex(new T.BufferAttribute(idx,1));merged.computeBoundingSphere();
  const m=new T.Mesh(merged,items[0].material);m.name='Batched / '+items[0].material.uuid;for(const o of items){o.removeFromParent();o.geometry.dispose()}group.add(m);
 }
}
function stats(root){let meshes=0,triangles=0,geometryBytes=0,textureBytes=0;const gs=new Set(),ts=new Set();root.traverse(o=>{if(!o.isMesh)return;meshes++;let g=o.geometry;triangles+=(g.index?.count||g.attributes.position.count)/3;if(!gs.has(g)){gs.add(g);for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;geometryBytes+=g.index?.array.byteLength||0}for(const m of [].concat(o.material))for(const v of Object.values(m))if(v?.isTexture&&!ts.has(v)){ts.add(v);textureBytes+=(v.image?.width||0)*(v.image?.height||0)*4}});return {meshes,triangles,geometryBytes,textureBytes};}
export function createFrontWheel(h,{quality='detail',batch=true}={}){
 const detail=quality==='detail',seg=n=>Math.max(6,Math.round(n*(detail?1:.42)));
const {mesh,box,tex}=h;const mat=(c,m,rough,extra={})=>new T.MeshPhysicalMaterial({color:c,metalness:m,roughness:rough,...extra});
function grain(kind){let t=tex(256,256,(c,w,H)=>{let im=c.createImageData(w,H),seed=285;for(let y=0;y<H;y++)for(let x=0;x<w;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let n=seed>>>24,v=kind==='carbon'?105+n*.20+(Math.sin(x*.28+y*.13)+Math.sin(y*.34-x*.12))*12:kind==='brush'?110+n*.12+Math.sin(y*1.55)*27:114+n*.22;let k=(y*w+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=v;im.data[k+3]=255}c.putImageData(im,0,0)},false);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='brush'?2:5,kind==='brush'?8:5);return t}
const brush=grain('brush'),noise=grain('rubber'),carbonGrain=grain('carbon');
const orange=mat(0xf76508,.22,.23,{clearcoat:.75,clearcoatRoughness:.12}),al=mat(0xbfc5c8,.90,.29,{roughnessMap:brush}),steel=mat(0x939ba3,.93,.24,{roughnessMap:brush}),black=mat(0x232930,.66,.36),rubber=mat(0x1b1c1c,0,.77,{bumpMap:noise,bumpScale:.00020}),carbon=mat(0x25262a,.08,.65,{bumpMap:carbonGrain,bumpScale:.00025,roughnessMap:carbonGrain}),gold=mat(0xb9a47e,.77,.29,{roughnessMap:brush}),red=mat(0xa81917,.05,.45),seal=mat(0x27282a,0,.8),chrome=mat(0xd8dcdf,1,.15);
const root=new T.Group();root.name='BS005 front axle / metres';let parts=[],spinning=[];
function part(name,d,spin=false){const g=new T.Group();g.name=name;root.add(g);parts.push({g,home:g.position.clone(),d:new T.Vector3(...d)});if(spin)spinning.push(g);return g}
function lathe(g,profile,m,n=128){n=seg(n);const o=mesh(g,new T.LatheGeometry(profile.map(([radius,z])=>new T.Vector2(radius,z)),n),m);o.rotation.x=Math.PI/2;return o}
function cyl(g,r1,r2,d,m,x=0,y=0,z=0,n=64){const o=mesh(g,new T.CylinderGeometry(r1,r2,d,seg(n)),m,x,y,z);o.rotation.x=Math.PI/2;return o}
function rod(g,a,b,r,m,r2=r){const A=new T.Vector3(...a),B=new T.Vector3(...b),D=B.clone().sub(A),o=mesh(g,new T.CylinderGeometry(r2,r,D.length(),seg(32)),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),D.normalize());return o}
function shape(points){let sh=new T.Shape();points.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();return sh}
function disk(g,sh,d,z,m,bevel=.0012){return mesh(g,new T.ExtrudeGeometry(sh,{depth:d,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:detail?3:1,curveSegments:detail?16:8}),m,0,0,z-d/2)}
function ringShape(r1,r2){let sh=new T.Shape();sh.absarc(0,0,r2,0,Math.PI*2,false);let hole=new T.Path();hole.absarc(0,0,r1,0,Math.PI*2,true);sh.holes.push(hole);return sh}
function ring(g,inner,outer,d,z,m){const b=Math.min(.0006,d*.2,(outer-inner)*.22);return lathe(g,[[inner+b,z-d/2],[outer-b,z-d/2],[outer,z-d/2+b],[outer,z+d/2-b],[outer-b,z+d/2],[inner+b,z+d/2],[inner,z+d/2-b],[inner,z-d/2+b],[inner+b,z-d/2]],m,outer>.09?128:48)}
function hex(g,x,y,z,r,d,m){return cyl(g,r,r,d,m,x,y,z,6)}
// Measured nominal rim diameter 17 in = 431.8 mm. Estimated slick profile and cast dimensions.
const tire=part('01 · Racing slick',[0,.13,0],true);
const tireProfile=[[.214,-.044],[.228,-.052],[.248,-.058],[.265,-.055],[.279,-.044],[.291,-.027],[.298,-.012],[.300,0],[.298,.012],[.291,.027],[.279,.044],[.265,.055],[.248,.058],[.228,.052],[.214,.044],[.212,.025],[.212,-.025],[.214,-.044]];
lathe(tire,tireProfile,rubber,160);
// Surface-conforming annular sidewall texture; sidewall is curved, not a floating square decal.
const labels=tex(detail?2048:1024,detail?2048:1024,(c,w,H)=>{c.clearRect(0,0,w,H);c.scale(w/2048,H/2048);c.translate(1024,1024);c.textAlign='center';c.textBaseline='middle';function arc(txt,a,rad,size,fill){c.save();c.rotate(a);c.font='bold '+size+'px Arial';c.fillStyle=fill;let advance=size*.70/rad;for(let i=0;i<txt.length;i++){c.save();c.rotate((i-(txt.length-1)/2)*advance);c.translate(0,-rad);c.fillText(txt[i],0,0);c.restore()}c.restore()}arc('MICHELIN',0,895,79,'#c7c8c1');arc('120 / 60 - 17',Math.PI,890,45,'#777c7b');arc('TUBELESS',Math.PI*.37,890,34,'#747876');arc('FRONT',-Math.PI*.30,890,34,'#747876');arc('RACING',Math.PI*.65,891,35,'#777b79');arc('ROTATION  ›',-Math.PI*.58,891,32,'#888b86');for(let i=0;i<32;i++){let a=i*Math.PI/16;c.save();c.rotate(a);c.fillStyle='#595e5b';c.fillRect(-1,-853,2,13);c.restore()}});
function wallZ(rad){let ar=[[.235,.054],[.248,.058],[.265,.055],[.279,.044],[.287,.034]];for(let i=0;i<ar.length-1;i++)if(rad>=ar[i][0]&&rad<=ar[i+1][0])return T.MathUtils.lerp(ar[i][1],ar[i+1][1],(rad-ar[i][0])/(ar[i+1][0]-ar[i][0]));return .034}
const lm=new T.MeshStandardMaterial({map:labels,transparent:true,alphaTest:.12,depthWrite:false,roughness:.78,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});
for(const side of [-1,1]){let pos=[],uv=[],idx=[];for(let j=0;j<=6;j++){let R=.235+j/6*.052;for(let i=0,N=seg(160);i<=N;i++){let a=i/N*Math.PI*2,x=R*Math.cos(a),y=R*Math.sin(a);pos.push(x,y,side*(wallZ(R)+.0007));uv.push(.5+side*x/.60,.5+y/.60);if(i&&j){let k=j*(N+1)+i;idx.push(k,k-1,k-N-2,k,k-N-2,k-N-1)}}}let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(tire,geo,lm)}
// Actual sectioned rim barrel with bead flanges; not a filled orange disk.
const rim=part('02 · Cast magnesium rim and hub',[0,0,0],true);
lathe(rim,[[.199,-.039],[.210,-.047],[.218,-.047],[.220,-.043],[.218,-.036],[.215,-.033],[.208,-.030],[.202,-.023],[.202,.023],[.208,.030],[.215,.033],[.218,.036],[.220,.043],[.218,.047],[.210,.047],[.199,.039],[.196,.025],[.196,-.025],[.199,-.039]],orange);
lathe(rim,[[.022,-.057],[.044,-.057],[.052,-.050],[.055,-.035],[.041,-.023],[.037,0],[.041,.023],[.055,.035],[.052,.050],[.044,.057],[.022,.057],[.022,-.057]],orange);
// Curved, tapered 5-spoke cast wheel, individual filleted extrusions; spoke count is an estimate.
const spokeShape=new T.Shape();spokeShape.moveTo(.031,-.020);spokeShape.bezierCurveTo(.085,-.029,.146,-.023,.198,-.006);spokeShape.quadraticCurveTo(.207,.002,.204,.020);spokeShape.lineTo(.194,.036);spokeShape.bezierCurveTo(.140,.014,.085,.008,.034,.021);spokeShape.closePath();
for(let i=0;i<5;i++){let q=new T.Group();rim.add(q);q.rotation.z=i*Math.PI*2/5+.09;disk(q,spokeShape,.027,0,orange,.0042)}
// Additional cast spoke pockets and engraved-style inspection detail, at estimated positions.
if(detail){const gm=orange.clone();gm.roughness=.36;gm.color.multiplyScalar(.78);for(let i=0;i<5;i++){let a=i*Math.PI*2/5+.09;const g=new T.Group();rim.add(g);g.rotation.z=a;const groove=shape([[.067,-.012],[.111,-.014],[.163,-.005],[.170,.005],[.112,.001],[.068,.008]]);disk(g,groove,.00045,.0142,gm,0);disk(g,groove,.00045,-.0142,gm,0)}}
// Valve, bead and balance mass.
rod(rim,[.185,-.081,.020],[.200,-.087,.021],.0048,black);rod(rim,[.200,-.087,.021],[.208,-.090,.021],.0035,steel);box(rim,.018,.008,.009,.002,steel,-.187,.074,-.033);
const wear=mat(0x303135,.06,.68,{side:T.DoubleSide});
const badgeMap=tex(512,128,(c,w,H)=>{c.clearRect(0,0,w,H);c.fillStyle='#af1515';c.font='italic 900 94px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('brembo',w/2,H/2,w*.94)});const badgeMat=new T.MeshStandardMaterial({map:badgeMap,transparent:true,alphaTest:.10,depthWrite:false,roughness:.4,side:T.DoubleSide});
for(const side of [-1,1]){
 const bearing=part((side<0?'03':'04')+' · '+(side<0?'Left':'Right')+' bearing',[0,0,side*.070],true);
 ring(bearing,.0125,.027,.014,side*.046,steel);ring(bearing,.013,.018,.014,side*.046,chrome);ring(bearing,.0185,.025,.002,side*.054,seal);
 const carrier=part((side<0?'05':'06')+' · Floating disc carrier',[0,0,side*.115],true);
 // Six lobes, six bolt bores and six lightening windows, with actual through-holes.
 let sh=new T.Shape();for(let i=0;i<180;i++){let a=i/180*Math.PI*2,R=.098+.016*Math.pow(.5+.5*Math.cos(a*6),2),x=R*Math.cos(a),y=R*Math.sin(a);i?sh.lineTo(x,y):sh.moveTo(x,y)}sh.closePath();let central=new T.Path();central.absarc(0,0,.028,0,2*Math.PI,true);sh.holes.push(central);
 for(let i=0;i<6;i++){let a=i*Math.PI/3, hole=new T.Path();hole.absarc(.047*Math.cos(a),.047*Math.sin(a),.0046,0,2*Math.PI,true);sh.holes.push(hole);let vent=new T.Path();vent.absarc(.075*Math.cos(a+.5),.075*Math.sin(a+.5),.014,0,2*Math.PI,true);sh.holes.push(vent)}
 disk(carrier,sh,.006,side*.066,black,.001);
 for(let i=0;i<6;i++){let a=i*Math.PI/3,x=.047*Math.cos(a),y=.047*Math.sin(a);cyl(carrier,.008,.008,.002,steel,x,y,side*.071,24);hex(carrier,x,y,side*.073,.0047,.004,steel)}
 const rotor=part((side<0?'07':'08')+' · 320 mm carbon rotor',[0,0,side*.178],true);
 // Continuous carbon-carbon braking track, no modern drilled steel pattern.
 ring(rotor,.106,.160,.008,side*.079,carbon);
 for(let i=0;i<12;i++){let a=i*Math.PI/6,x=.109*Math.cos(a),y=.109*Math.sin(a);cyl(rotor,.0074,.0074,.013,steel,x,y,side*.079,24);cyl(rotor,.0045,.0045,.014,black,x,y,side*.079,20)}
 // Fine circumferential wear tracks, intentionally subtle.
 if(detail)for(let j=0;j<4;j++){const line=mesh(rotor,new T.RingGeometry(.119+j*.009,.11909+j*.009,96),wear,0,0,side*.08304);if(side<0)line.rotation.y=Math.PI}
 const spacer=part((side<0?'09':'10')+' · Axle spacer',[0,0,side*.228],true);
 ring(spacer,.0127,.023,.017,side*.061,al);
 const cal=part((side<0?'11':'12')+' · Four-piston caliper',[-.135,.07,side*.235]);
 // Sculpted two-lobe fixed caliper, split inner/outer jaws; rotor gap remains open.
 const cg=new T.Group();cal.add(cg);cg.position.set(-.137,.077,side*.079);cg.rotation.z=-.43;
 let outer=new T.Shape();outer.moveTo(-.033,-.052);outer.quadraticCurveTo(-.046,-.042,-.042,-.017);outer.lineTo(-.038,.029);outer.quadraticCurveTo(-.034,.055,-.015,.057);outer.lineTo(.013,.056);outer.quadraticCurveTo(.034,.052,.036,.029);outer.lineTo(.032,-.037);outer.quadraticCurveTo(.027,-.053,.009,-.055);outer.closePath();
 for(const zs of [-1,1]){disk(cg,outer,.019,zs*.016,gold,.003);for(const y of [-.024,.023]){cyl(cg,.020,.019,.006,gold,-.010,y,zs*.028,48);cyl(cg,.013,.013,.0017,steel,-.010,y,zs*.032,48);cyl(cg,.007,.007,.002,black,-.010,y,zs*.0335,32)}}
 for(const y of [-.047,.048]){box(cg,.050,.012,.047,.005,gold,.000,y,0);for(const zs of [-1,1])hex(cg,.013,y,zs*.027,.0045,.005,steel)}
 // Pad backing plates on either face of the disc; caliper fixed in the unspun group.
 for(const z of [-.0065,.0065]){box(cg,.033,.073,.004,.001,black,.010,0,z);box(cg,.025,.061,.002,.001,carbon,.013,0,z*.73)}
 let o=mesh(cg,new T.PlaneGeometry(.059,.015),badgeMat,.002,-.001,side*.035);if(side<0)o.rotation.y=Math.PI;
 if(detail){for(const zs of [-1,1]){for(const y of [-.024,.023]){let cap=mesh(cg,new T.RingGeometry(.0138,.016,32),gold,-.010,y,zs*.0336);if(zs<0)cap.rotation.y=Math.PI;}for(const y of [-.039,.038]){hex(cg,.021,y,zs*.029,.0035,.002,steel)}}}
 rod(cg,[-.025,.049,0],[-.037,.065,0],.0055,steel);hex(cg,-.036,.065,0,.007,.008,steel);
 // Short brake hose and banjo fitting, illustrative routing.
 let path=new T.CatmullRomCurve3([[-.037,.065,0],[-.061,.10,0],[-.04,.15,.012],[.005,.185,.024]].map(p=>new T.Vector3(...p)));mesh(cg,new T.TubeGeometry(path,24,.0032,10,false),seal);
 const fork=part((side<0?'13':'14')+' · Axle clamp / fork foot',[0,.165,side*.275]);const fz=side*.105;
 // Hollow bored axle clamp; bevelled lug and short fork lower tube.
 ring(fork,.014,.033,.040,fz,al);const lug=shape([[-.030,-.018],[.027,-.018],[.035,.030],[.020,.105],[-.030,.105],[-.043,.030]]);const bore=new T.Path();bore.absarc(0,0,.014,0,2*Math.PI,true);lug.holes.push(bore);disk(fork,lug,.033,fz,black,.005);const ear=shape([[-.027,.025],[-.055,.045],[-.117,.044],[-.150,.073],[-.138,.109],[-.103,.112],[-.066,.084],[-.024,.075]]);disk(fork,ear,.018,side*.105,black,.003);for(const [x,y] of [[-.121,.063],[-.121,.096]]){cyl(fork,.008,.008,.004,al,x,y,side*.117,24);hex(fork,x,y,side*.121,.005,.005,steel)}rod(fork,[-.012,.087,fz],[-.048,.247,fz],.023,chrome);rod(fork,[-.041,.217,fz],[-.061,.302,fz],.028,gold);box(fork,.014,.041,.039,.003,al,.030,.007,fz);hex(fork,.034,-.016,fz+side*.022,.006,.007,steel);hex(fork,.034,.009,fz+side*.022,.006,.007,steel);
}
const axle=part('15 · Hollow through-axle',[0,0,.36]);lathe(axle,[[.0075,-.147],[.012,-.147],[.012,-.124],[.0125,-.123],[.0125,.128],[.014,.128],[.014,.142],[.0075,.142],[.0075,-.147]],steel);ring(axle,.0075,.021,.008,.145,steel);hex(axle,0,0,.150,.018,.009,al);
if(detail){let thread=[];for(let i=0;i<=160;i++){let a=i/160*2*Math.PI*8;thread.push(new T.Vector3(.0127*Math.cos(a),.0127*Math.sin(a),-.146+i/160*.023))}mesh(axle,new T.TubeGeometry(new T.CatmullRomCurve3(thread),160,.00065,6,false),chrome)}
const nut=part('16 · Axle retaining nut',[0,0,-.36]);let ns=new T.Shape();for(let i=0;i<6;i++){let a=i*Math.PI/3,x=.020*Math.cos(a),y=.020*Math.sin(a);i?ns.lineTo(x,y):ns.moveTo(x,y)}ns.closePath();let nh=new T.Path();nh.absarc(0,0,.0124,0,2*Math.PI,true);ns.holes.push(nh);disk(nut,ns,.012,-.143,steel,.001);

 const before=stats(root);if(batch)for(const p of parts)batchPart(p.g);const after=stats(root);
 function pose(v=0,a=0){for(const p of parts)p.g.position.copy(p.home).addScaledVector(p.d,v);for(const g of spinning)g.rotation.z=a}
 function dispose(){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const m of [].concat(o.material)){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v)}});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}
 return {root,parts,pose,dispose,quality,before,after};
}
