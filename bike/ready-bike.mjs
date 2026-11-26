import * as T from '../t03/vendor/three.module.min.js';
export const SOURCE='https://tevy.dev/models/sport-motorcycle/v1/lod0.glb';
const cached=new WeakMap();
async function source(renderer){
 if(!cached.has(renderer))cached.set(renderer,(async()=>{const base='https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/';const [{GLTFLoader},{KTX2Loader},{MeshoptDecoder}]=await Promise.all([import(base+'loaders/GLTFLoader.js'),import(base+'loaders/KTX2Loader.js'),import(base+'libs/meshopt_decoder.module.js')]);const ktx=new KTX2Loader().setTranscoderPath(base+'libs/basis/').detectSupport(renderer);try{return (await new GLTFLoader().setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder).loadAsync(SOURCE)).scene}finally{ktx.dispose()}})().catch(e=>{cached.delete(renderer);throw e}));return cached.get(renderer)
}
// Paint only the imported composite panel regions. Preserve original maps, normal detail,
// metallic response and mechanical texture. This is an original tribute, not period-correct decals.
function racingPaint(model){
 model.updateMatrixWorld(true);
 const inverse=model.matrixWorld.clone().invert();
 model.traverse(o=>{
  if(!o.isMesh||o.name!=='body')return;
  o.geometry=o.geometry.clone();const p=o.geometry.attributes.position,arr=new Float32Array(p.count*3),v=new T.Vector3(),matrix=inverse.clone().multiply(o.matrixWorld);
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(matrix);arr[i*3]=v.x;arr[i*3+1]=v.y;arr[i*3+2]=v.z}
  o.geometry.setAttribute('paintPosition',new T.BufferAttribute(arr,3));
  const make=m=>{if(!m.map)return m;const n=m.clone();n.name=m.name+' / racing tribute';n.onBeforeCompile=shader=>{
   shader.vertexShader='attribute vec3 paintPosition;\nvarying vec3 vPaintPosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPaintPosition = paintPosition;');
   shader.fragmentShader='varying vec3 vPaintPosition;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n'+
   'vec3 q=vPaintPosition; float hi=max(max(diffuseColor.r,diffuseColor.g),diffuseColor.b); float lo=min(min(diffuseColor.r,diffuseColor.g),diffuseColor.b); float whiteMask=smoothstep(.23,.54,lo)*(1.0-smoothstep(.10,.28,hi-lo)); float front=smoothstep(.13,.30,q.z)*smoothstep(.37,.50,q.y); float tail=(1.0-smoothstep(-.48,-.32,q.z))*smoothstep(.64,.75,q.y); float panel=whiteMask*max(front,tail); float t=q.y+.13*q.z; vec3 navy=vec3(.010,.034,.079), orange=vec3(.93,.21,.012), red=vec3(.65,.025,.012), ivory=vec3(.91,.88,.81); vec3 paint=mix(navy,red,smoothstep(.565,.578,t)); paint=mix(paint,ivory,smoothstep(.60,.613,t)); paint=mix(paint,orange,smoothstep(.72,.733,t)); diffuseColor.rgb=mix(diffuseColor.rgb,paint*(.70+.30*hi),panel);');
  };n.customProgramCacheKey=()=> 'bs005-racing-panel-v1';return n};
  o.material=Array.isArray(o.material)?o.material.map(make):make(o.material);
 });
}
export function readyBike(renderer,{onStatus=()=>{},fallback=null}={}){
 const root=new T.Group();root.name='BS-005 imported sport motorcycle';let model,parts=[],fork,front,rear,stand,original={},mode='loading',last={};
 function pose(p={}){last={...p};if(mode==='fallback'){fallback?.pose(p);return}if(!model)return;const {ex=0,steer=0,wheel=0,service=0,inserted=false,riding=false}=p;for(const g of parts)g.node.position.copy(g.home).addScaledVector(g.delta,ex);if(fork){fork.quaternion.copy(original.fork).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),steer));}if(front)front.quaternion.copy(original.front).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-wheel));if(rear)rear.quaternion.copy(original.rear).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-wheel));if(stand)stand.visible=!riding;const body=parts.find(g=>g.node.name==='body');if(body){body.node.position.x+=service*.40;body.node.position.y+=service*.18}}
 function explode(e){pose({...last,ex:e})}
 const promise=source(renderer).then(src=>{model=src.clone(true);racingPaint(model);const pivot=new T.Group();pivot.rotation.y=Math.PI/2;pivot.add(model);pivot.updateMatrixWorld(true);const b=new T.Box3().setFromObject(pivot);const center=b.getCenter(new T.Vector3());pivot.position.set(-center.x,-b.min.y,-center.z);root.add(pivot);fork=model.getObjectByName('fork');front=model.getObjectByName('wheel_F');rear=model.getObjectByName('wheel_R');stand=model.getObjectByName('kickstand');for(const [n,v] of [['body',[.45,.22,0]],['fittings',[-.40,.34,0]],['fork',[0,.15,.42]],['wheel_R',[.10,.03,-.46]],['kickstand',[-.34,-.08,0]],['wheel_F',[0,-.22,.10]]]){let node=model.getObjectByName(n);if(node)parts.push({node,home:node.position.clone(),delta:new T.Vector3(...v)})}for(const [name,node] of [['fork',fork],['front',front],['rear',rear]])if(node)original[name]=node.quaternion.clone();mode='imported';pose(last);onStatus(mode);return true}).catch(e=>{mode='fallback';if(fallback)root.add(fallback.root);onStatus(mode,String(e));pose(last);return false});
 return {root,pose,explode,promise,state:()=>({mode,groups:parts.map(x=>x.node.name)})};
}