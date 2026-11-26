import * as T from '../t03/vendor/three.module.min.js';
import {RoomEnvironment} from '../t03/vendor/RoomEnvironment.js';
export function makePreview(host,fallback){
 const r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.15;host.append(r.domElement);fallback.style.display='none';
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,2000),root=new T.Group();scene.add(root);const pmrem=new T.PMREMGenerator(r),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xe3f0ff,0x57442a,1.4));const a=new T.DirectionalLight(0xffe5bf,3);a.position.set(80,100,70);scene.add(a);const b=new T.DirectionalLight(0xaccaff,2);b.position.set(-70,40,-40);scene.add(b);
 let yaw=.4,pitch=.65,dist=180,drag=null,mesh=null;
 const render=()=>{camera.position.set(dist*Math.cos(pitch)*Math.sin(yaw),dist*Math.sin(pitch),dist*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(0,0,0);r.render(scene,camera)};
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){r.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render()}}).observe(host);
 r.domElement.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];r.domElement.setPointerCapture(e.pointerId)});
 r.domElement.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.008;pitch=T.MathUtils.clamp(pitch+(e.clientY-drag[1])*.008,-.25,1.45);drag=[e.clientX,e.clientY];render()});for(const x of ['pointerup','pointercancel'])r.domElement.addEventListener(x,()=>drag=null);
 r.domElement.addEventListener('wheel',e=>{e.preventDefault();dist=T.MathUtils.clamp(dist*Math.exp(e.deltaY*.001),30,1000);render()},{passive:false});
 return {update(g){if(!g)return;if(mesh){root.remove(mesh);mesh.geometry.dispose();mesh.material.forEach(m=>m.dispose())}
 const pos=[],groups=[];const n=g.definition.parameters.segments,colors=[0xc29b58,0x25262c,0xc6a466,0x242a31,0xd4b16a,0x181d25,0x252b31];const mats=colors.map((c,i)=>new T.MeshPhysicalMaterial({color:c,metalness:i%2===0?.8:.22,roughness:i%2===0?.28:.38,clearcoat:.25}));for(let i=0;i<g.triangles.length;i++){const t=g.triangles[i];for(const j of t){const [x,y,z]=g.vertices[j];pos.push(x,z-g.height/2,-y)}const seg=Math.floor(i/(2*n));groups.push(Math.min(seg,colors.length-1));}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.computeVertexNormals();let start=0;for(let i=1;i<=groups.length;i++)if(i===groups.length||groups[i]!==groups[start]){geo.addGroup(start*3,(i-start)*3,groups[start]);start=i}mesh=new T.Mesh(geo,mats);root.add(mesh);dist=Math.max(g.diameter,g.height)*2.35;render();}}
}
