import {generate,stl,threeMF,bomCSV,report,drawing} from './kernel.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const definition=await fetch('./definitions/EK-001.json').then(r=>{if(!r.ok)throw Error('Definition unavailable');return r.json()});
let current,viewer=null;
function download(name,content,type){const b=new Blob([content],{type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function render(){
 try{current=generate(definition,{diameterScale:+$('diameter').value,heightScale:+$('height').value,material:$('material').value,dimensionalToleranceMm:+$('tolerance').value,segments:+$('segments').value});}catch(e){$('status').textContent=e.message;current=null;return}
 const g=current,p=g.definition.parameters;$('dia-value').textContent=p.diameterScale.toFixed(2)+'×';$('height-value').textContent=p.heightScale.toFixed(2)+'×';$('title').textContent=g.definition.name;$('status').textContent=g.pass?'Geometry checks passed':'Geometry checks failed';$('diameter-stat').textContent=g.diameter+' mm';$('height-stat').textContent=g.height+' mm';$('mass-stat').textContent=g.solidMassG+' g';$('score-stat').textContent=g.score+'/100';$('dossier-tier').textContent=g.tier+' · '+g.score+'/100';$('description').textContent=g.definition.description+' '+g.definition.source;$('drawing').innerHTML=drawing(g);$('fallback').innerHTML=drawing(g);
 $('bom').innerHTML='<table><tr><th>Part</th><th>Qty</th><th>Material</th><th>Mass</th></tr>'+g.bom.map(b=>'<tr><td>'+esc(b.name)+'</td><td>'+b.quantity+'</td><td>'+esc(b.material)+'</td><td>'+b.solidMassG+' g</td></tr>').join('')+'</table><p style="font-size:11px;margin-top:7px">Solid geometric estimate; actual FDM mass depends on slicer settings.</p>';
 $('manufacturing').innerHTML='<p style="margin-top:8px">'+esc(g.definition.manufacturing.method)+' · ±'+p.dimensionalToleranceMm+' mm proposed tolerance.</p><ul>'+g.definition.manufacturing.notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>';
 $('checks').innerHTML=g.checks.map(c=>'<div class="check '+(c.pass?'':'fail')+'"><b>'+ (c.pass?'✓':'!')+'</b><div><strong>'+esc(c.name)+'</strong><span>'+esc(c.detail)+'</span></div></div>').join('');
 $('scorecard').innerHTML=g.scoring.map(x=>'<div class="score-line"><span>'+esc(x.name)+'</span><div class="track"><div class="bar" style="width:'+100*x.score/x.max+'%"></div></div><span>'+x.score+' / '+x.max+'</span></div>').join('');
 $('limitations').textContent=g.warnings.join(' · ');if(viewer)viewer.update(g);
}
function defaults(){for(const [id,key] of [['diameter','diameterScale'],['height','heightScale'],['material','material'],['tolerance','dimensionalToleranceMm'],['segments','segments']])$(id).value=definition.parameters[key];render()}
for(const id of ['diameter','height','material','tolerance','segments'])$(id).addEventListener('input',render);
$('reset').onclick=defaults;
document.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>{if(!current||!current.pass)return;const g=current,id=g.definition.id+'-'+g.definition.revision;switch(b.dataset.file){case'definition':download(id+'.json',JSON.stringify(g.definition,null,2),'application/json');break;case'drawing':download(id+'.svg',drawing(g),'image/svg+xml');break;case'bom':download(id+'-BOM.csv',bomCSV(g),'text/csv');break;case'qc':download(id+'-QC.json',JSON.stringify(report(g),null,2),'application/json');break;case'stl':download(id+'.stl',stl(g),'model/stl');break;case'3mf':download(id+'.3mf',threeMF(g),'model/3mf');break;}});
$('print').onclick=()=>window.print();
defaults();window.__engineering={get:()=>current,generate,definition,stl,threeMF,bomCSV,report,drawing};
if(!new URLSearchParams(location.search).has('dossier'))import('./preview.mjs').then(m=>{viewer=m.makePreview($('preview'),$('fallback'));viewer.update(current)}).catch(()=>{});
