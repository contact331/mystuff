export const KEY='mystuff.market.v1', COLLECTION='mystuff.collection.v1';
export const catalog=[
 {id:'BS-001',category:'Processors',name:'Intel Core Ultra 9 285K',brand:'Intel',price:16790,spec:'24 cores · 5.7 GHz · LGA1851',desc:'A flagship desktop processor with a premium exhibition and motherboard installation sequence.',art:'cpu',dossier:'/v4/companions/bs-001-rev-b.pdf'},
 {id:'BS-002',category:'Memory',name:'Noble DDR5 64 GB',brand:'Noble',price:6490,spec:'2 × 32 GB · DDR5-6400 · UDIMM',desc:'Gold-finished concept memory kit with illuminated edges and sequential dual-channel installation.',art:'ram',dossier:'/v5/companions/bs-002.pdf'},
 {id:'BS-003',category:'Graphics cards',name:'GeForce RTX 5090',brand:'NVIDIA',price:59990,spec:'32 GB GDDR7 · Blackwell · Founders Edition',desc:'Open the workstation, align and seat the GPU, connect auxiliary power and run a live graphics workload.',art:'gpu',dossier:'/gpu/dossier.pdf',route:'/gpu/index.html'}
];
export const delivery={locker:{label:'MyStuff Box · Teplice',fee:49,description:'Virtual collection locker',eta:'Next day'},home:{label:'Home delivery',fee:99,description:'Virtual courier delivery',eta:'1–2 days'}};
export const initial=()=>({schema:1,balance:100000,cart:{},orders:[],delivery:'locker',serial:1});
export function load(storage=localStorage){try{const d=JSON.parse(storage.getItem(KEY));return d?.schema===1&&Number.isSafeInteger(d.balance)&&d.balance>=0&&Array.isArray(d.orders)&&d.cart&&typeof d.cart==='object'?d:initial()}catch{return initial()}}
export function save(state,storage=localStorage){storage.setItem(KEY,JSON.stringify(state));return state}
export const product=id=>catalog.find(p=>p.id===id);
export function lines(s){return Object.entries(s.cart).map(([id,n])=>({p:product(id),n})).filter(x=>x.p&&Number.isInteger(x.n)&&x.n>0&&x.n<=9)}
export function totals(s){const subtotal=lines(s).reduce((a,{p,n})=>a+p.price*n,0),shipping=subtotal?(delivery[s.delivery]?.fee||0):0,gross=subtotal+shipping,net=Math.round(gross*100/1.21);return {subtotal,shipping,gross,netCents:net,taxCents:gross*100-net}}
export function change(s,id,delta){if(!product(id))return s;const n=Math.max(0,Math.min(9,(s.cart[id]||0)+delta));if(n)s.cart[id]=n;else delete s.cart[id];return s}
export function purchase(s,now=Date.now()){const t=totals(s);if(!t.gross)throw Error('Your basket is empty.');if(!delivery[s.delivery])throw Error('Choose a delivery method.');if(s.balance<t.gross)throw Error('Insufficient virtual balance.');const o={id:'MS-'+String(s.serial++).padStart(6,'0'),createdAt:now,stage:0,delivery:s.delivery,lines:lines(s).map(({p,n})=>({id:p.id,name:p.name,price:p.price,n})),totals:t,remaining:s.balance-t.gross};s.balance-=t.gross;s.orders.unshift(o);s.cart={};return o}
export const statuses=['Order confirmed','Preparing shipment','In transit','Ready for acquisition'];
export function advance(o){o.stage=Math.min(statuses.length-1,o.stage+1);return o}
export function ownsInstalled(id,storage=localStorage){try{return !!JSON.parse(storage.getItem(COLLECTION)||'{}')[id]?.installed}catch{return false}}
export function engineURL(o,id){if(o.stage!==3||!o.lines.some(l=>l.id===id))return null;return product(id)?.route||'/v5/index.html?asset='+encodeURIComponent(id)}
export const czk=n=>Number(n).toLocaleString('cs-CZ')+' Kč';
export const cents=n=>(n/100).toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2})+' Kč';
