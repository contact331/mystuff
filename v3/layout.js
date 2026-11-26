// Pure layout model. Progress 0..6; each movement is reversible.
// Local units: geometry is illustrative, not a manufacturing CAD model.
export const stages=[['01 / The present','Drag to orbit · scroll to zoom. Click the gift to begin.','Untie ribbon'],['02 / Ribbon removed','The presentation box is ready to open.','Lift gift lid'],['03 / Intel retail carton','The boxed processor is inside.','Open Intel box'],['04 / Protective tray','Lift the processor and its protective tray out.','Remove tray'],['05 / Processor revealed','The processor is still seated in the tray.','Pick up CPU'],['06 / In your hands','Drag the CPU itself to turn it in any direction · scroll to zoom.','Place on exhibition foot'],['07 / Private exhibition','Drag to turn the levitating CPU · choose your precious material · toggle auto-spin.','On display']];
export const clamp=(x)=>Math.max(0,Math.min(1,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
export function layoutAt(p){
 const ribbon=ease(p), gift=ease(p-1), retail=ease(p-2), tray=ease(p-3), pick=ease(p-4), exhibit=ease(p-5);
 // Lift every lid/tray clear first, then translate. Park all packaging before pedestal rise.
 const gl=ease((gift)*2), gs=ease((gift-.42)/.58);
 const rl=ease(retail*2), rs=ease((retail-.42)/.58);
 const tl=ease(tray*2), ts=ease((tray-.42)/.58);
 const pl=ease(pick*2), ps=ease((pick-.42)/.58);
 const park=12.5*ps;
 const trayX=3.85*ts, trayY=.41+1.45*tl-.98*ts, trayZ=.25*ts;
 const chipX=mix(trayX,0,ps),chipY=mix(trayY+.13+1.35*pl,2.16,ps),chipZ=mix(trayZ,0,ps);
 return {ribbon, gift,retail,tray,pick,exhibit,park, giftLid:[-3.5*gs,1.09+1.9*gl-2.84*gs,-3.8*gs], retailLid:[3.8*rs,.86+1.8*rl-2.53*rs,-2.4*rs], trayPos:[trayX,trayY,trayZ],cpu:[p<4?trayX:chipX,p<4?trayY+.13:chipY,p<4?trayZ:chipZ],pedestal:ease((exhibit-.15)/.85)};
}
export const CAMERA_STAGES=[
 {target:[0,.65,0],dist:9.3,pitch:.58,yaw:.25},
 {target:[0,.65,0],dist:9.3,pitch:.58,yaw:.25},
 {target:[0,.55,0],dist:9.7,pitch:.67,yaw:.24},
 {target:[0,.55,0],dist:10.5,pitch:.67,yaw:.20},
 {target:[2.1,.6,.1],dist:10.0,pitch:.68,yaw:.18},
 {target:[0,2.16,0],dist:4.7,pitch:.35,yaw:.20},
 {target:[0,1.18,0],dist:9.6,pitch:.34,yaw:.20}
];
