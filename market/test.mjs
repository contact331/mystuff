import assert from 'node:assert/strict';
import {initial,change,totals,purchase,advance,engineURL,load,save,catalog,product,ownsInstalled} from './store.mjs';
const s=initial();change(s,'BS-001',1);change(s,'BS-002',1);
assert.equal(totals(s).gross,23329);assert.equal(totals(s).netCents+totals(s).taxCents,2332900);
const o=purchase(s,0);assert.equal(s.balance,76671);assert.equal(s.orders.length,1);assert.deepEqual(s.cart,{});
assert.throws(()=>purchase(s));assert.equal(s.balance,76671);assert.equal(engineURL(o,'BS-001'),null);
advance(o);advance(o);advance(o);advance(o);assert.equal(o.stage,3);assert.equal(engineURL(o,'BS-002'),'/v5/index.html?asset=BS-002');
assert.equal(engineURL(o,'BS-999'),null);change(s,'BS-001',9);assert.throws(()=>purchase(s));assert.equal(s.balance,76671);
const mock={value:null,setItem(k,v){this.value=v},getItem(){return this.value}};save(s,mock);assert.deepEqual(load(mock),s);
console.log('Wallet, VAT, duplicate payment, delivery gate, insufficient funds and persistence passed.');

// T32 replacement: old SKU cannot be bought; historic records remain distinct.
assert.equal(catalog.length,5);assert.equal(product('BS-005'),undefined);const w=product('BS-005-WHEEL');assert.equal(w.price,4900);const ws=initial();change(ws,'BS-005',1);assert.deepEqual(ws.cart,{});change(ws,w.id,1);assert.equal(totals(ws).gross,4949);const wo=purchase(ws,1);assert.equal(ws.balance,95051);assert.equal(engineURL(wo,w.id),null);for(let i=0;i<3;i++)advance(wo);assert.equal(engineURL(wo,w.id),'/bike/wheel-slice-t30.html');const old={stage:3,lines:[{id:'BS-005',name:'Heritage Sportbike',price:49000,n:1}]};assert.equal(engineURL(old,'BS-005'),'/bike/index.html');assert.equal(engineURL(old,w.id),null);ws.orders.push(old);ws.cart['BS-005']=1;save(ws,mock);const restored=load(mock);assert.equal(restored.cart['BS-005'],undefined);assert.deepEqual(restored.orders,ws.orders);assert.equal(restored.balance,ws.balance);assert.equal(ownsInstalled(w.id,{getItem:()=>JSON.stringify({'BS-005':{installed:true}})}),false);assert.equal(engineURL({stage:3,lines:[{id:'BS-999'}]},'BS-999'),null);console.log('T32 catalog replacement, pricing, delivery, archived orders and ownership isolation passed.');
