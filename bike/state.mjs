export const stages=[
['Showroom arrival','Enter the private heritage showroom and survey the display machines.','Approach champion','reveal'],
['The champion','Inspect the ready-made sportbike, inspired by the 1995 racing theme.','Approach counter','align'],
['Cash acquisition','Fictional display notes only; no real payment.','Pay virtual cash','paper'],
['Handover','Accept the tribute key and simulated receipt.','Mount bike','seat'],
['Mount','The stylized rider takes the clip-ons.','Insert key','connect'],
['Ignition','Key-start is a fictional tribute feature, not the factory GP configuration.','Start engine','boot'],
['Engine alive','Custom ElevenLabs two-stroke impression and analogue tachometer; independent engine audio switch.','Roll outside','boot'],
['Forecourt','Slow controlled motion across private ground.','Dismount','align'],
['Walkaround','Inspect fairings, wheels, swingarm and cockpit.','Engine detail','click'],
['Engine and exhaust','Inspect the imported engine exterior and exhaust. Assembly separation is schematic.','Check tyres','align'],
['Tyres and controls','Front-wheel steering preview and simulated lever test; inspect the tyres.','Rev and horn','click'],
['Functional test','Try throttle and fictional horn. Engine readings are simulated.','Explode','reveal'],
['Exploded inspection','Engine off. Available imported assemblies separate reversibly.','Reassemble','lab'],
['Recomposition','Observe the restored machine.','Inspect equipment case','seat'],
['Helmet equipment','Open the foam-lined metal case, lift the helmet, operate its visor.','Exhibit','lid'],
['Private trophy','Rotate the exhibit, review official sources and save the virtual specimen.','Save trophy','reveal']];
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const initial=()=>({stage:0,paid:false,engine:false,throttle:0,steer:0,brake:0,ex:0,open:0,lift:0,visor:0,spin:true,saved:false});
export function enter(s,n){s.stage=clamp(n,0,15);s.paid=s.stage>=3;s.engine=s.stage>=6&&s.stage<=11;s.throttle=s.steer=s.brake=0;s.ex=s.stage===12?1:0;s.open=0;s.lift=s.visor=0;return s}
