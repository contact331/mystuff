import * as T from '../t03/vendor/three.module.min.js';
import {readyBike as oldBike} from './ready-bike.mjs';
export const SOURCE='https://files.innerscene.com/library/race-replica-superbike-fully-faired-badbd83b/9ce443dc7d0c14f443e9/race-replica-superbike-fully-faired.glb';
const cache=new WeakMap();
async function load(renderer){if(!cache.has(renderer))cache.set(renderer,(async()=>{const {GLTFLoader}=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');return (await new GLTFLoader().loadAsync(SOURCE)).scene})().catch(e=>{cache.delete(renderer);throw e}));return cache.get(renderer)}
function group(parent,name,xyz=[0,0,0]){const g=new T.Group();g.name=name;g.position.set(...xyz);parent.add(g);return g}
const matName=o=>o.material?.name||o.name;
function paint(m){
 const n=m.clone(),name=n.name.toLowerCase();
 if(name.includes('fairing paint')||name.includes('wheel paint')){
  const color=name.includes('wheel')||name.includes('red')?0xf65b08:name.includes('black')?0x142a49:0xf5f0e3;
  n.color.setHex(color);n.roughness=name.includes('wheel')?.28:.23;n.metalness=name.includes('wheel')?.35:.08;
 }
 if(name.includes('frame spars')||name.includes('brushed steel')){n.metalness=.88;n.roughness=.29}
 if(name.includes('tyre rubber')){n.roughness=.80;n.metalness=0}
 return n;
}
function panelMark(mesh){
 const n=mesh.material;if(!n.name.toLowerCase().includes('fairing paint, white'))return;
 const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');ctx.clearRect(0,0,1024,512);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#142b4b';ctx.font='italic 900 180px Arial';ctx.fillText('REPSOL',512,250,980);ctx.font='bold 82px Arial';ctx.fillText('HONDA',512,400,680);const decal=new T.CanvasTexture(c);decal.colorSpace=T.SRGBColorSpace;
 n.onBeforeCompile=shader=>{shader.uniforms.raceDecal={value:decal};shader.vertexShader='varying vec3 vRaceP;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRaceP=position;');shader.fragmentShader='uniform sampler2D raceDecal;\nvarying vec3 vRaceP;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nvec3 p=vRaceP; float t=p.y+0.13*p.z; float side=smoothstep(.12,.20,abs(p.x)); float belt=(1.0-smoothstep(.545,.56,t))*smoothstep(.36,.375,t)*side; diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.018,.038,.085),belt); float redStripe=smoothstep(.54,.55,t)*(1.0-smoothstep(.575,.585,t))*side; diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.65,.025,.013),redStripe); vec2 uvR=vec2((p.z-.02)/.73+.5,(p.y-.55)/.30+.5); if(p.x>0.)uvR.x=1.-uvR.x; if(all(greaterThanEqual(uvR,vec2(0.)))&&all(lessThanEqual(uvR,vec2(1.)))){vec4 mark=texture2D(raceDecal,uvR);diffuseColor.rgb=mix(diffuseColor.rgb,mark.rgb,mark.a*side*(1.-belt));}');};n.customProgramCacheKey=()=> 'bs005-t28-livery';
}
// Shared index buffers preserve original exact mesh positions and normals; only triangle membership changes.
// For wheel-only material meshes, each wheel is a disconnected half of the source geometry.
function wheelHalf(o,front){const g=o.geometry.clone(),p=g.attributes.position,idx=g.index,arr=[];const count=idx?idx.count:p.count;for(let i=0;i<count;i+=3){let a=idx?idx.getX(i):i,b=idx?idx.getX(i+1):i+1,c=idx?idx.getX(i+2):i+2;const z=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;if((z>0)===front)arr.push(a,b,c)}g.setIndex(arr);return new T.Mesh(g,o.material)}
export function raceBike(renderer,{onStatus=()=>{},fallback=null}={}){
 const root=new T.Group();root.name='BS-005 full fairing race tribute';let model,parts=[],front,rear,mode='loading',backup,last={};
 function pose(p={}){last={...p};if(backup){backup.pose(p);return}if(!model)return;const {ex=0,steer=0,wheel=0,service=0}=p;for(const q of parts)q.g.position.copy(q.home).addScaledVector(q.delta,ex);const fair=parts.find(q=>q.g.name==='Fairing paint and screen');if(fair){fair.g.position.x+=service*.36;fair.g.position.y+=service*.18}front.rotation.y=steer;front.children[0].rotation.x=-wheel;rear.children[0].rotation.x=-wheel;}
 function explode(e){pose({...last,ex:e})}
 const promise=load(renderer).then(src=>{
  model=new T.Group();const pivot=new T.Group();pivot.rotation.y=Math.PI/2;pivot.add(model);
  function part(name,xyz,delta){const g=group(model,name,xyz);parts.push({g,home:g.position.clone(),delta:new T.Vector3(...delta)});return g}
  const frame=part('Chassis and fittings',[0,0,0],[-.18,.16,0]),fair=part('Fairing paint and screen',[0,0,0],[.48,.29,0]),engine=part('Engine castings and radiator',[0,0,0],[0,-.32,0]),drive=part('Transmission and chain',[0,0,0],[-.26,-.08,-.16]);
  front=part('Front wheel',[0,.30,.68],[0,.04,.42]);rear=part('Rear wheel',[0,.326,-.705],[0,.03,-.46]);const fspin=group(front,'Front rotation'),rspin=group(rear,'Rear rotation');src.updateMatrixWorld(true);
  src.traverse(o=>{if(!o.isMesh)return;const n=matName(o).toLowerCase(),m=paint(o.material);
   if(/tyre rubber|wheel paint|brake disc steel/.test(n)){for(const [isFront,parent] of [[true,fspin],[false,rspin]]){let mesh=wheelHalf(o,isFront);mesh.material=m;mesh.position.copy(parent.parent.position).multiplyScalar(-1);parent.add(mesh)}return}
   const dst=/fairing paint|windscreen|lamp lens|lamp reflector|number plate|indicator/.test(n)?fair:/engine castings|radiator|brushed steel/.test(n)?engine:/dark steel/.test(n)?drive:frame;
   let mesh=new T.Mesh(o.geometry,m);mesh.name=o.name;mesh.matrix.copy(o.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);dst.add(mesh);panelMark(mesh);
  });
  pivot.updateMatrixWorld(true);const box=new T.Box3().setFromObject(pivot,true),c=box.getCenter(new T.Vector3());pivot.position.set(-c.x,-box.min.y,-c.z);root.add(pivot);mode='race';pose(last);onStatus(mode);return true
 }).catch(async e=>{backup=oldBike(renderer,{fallback,onStatus:(m,err)=>{mode=m;onStatus(m,err||String(e))}});root.add(backup.root);backup.pose(last);return backup.promise});
 return {root,pose,explode,promise,state:()=>backup?backup.state():{mode,groups:parts.map(p=>p.g.name)}}
}
