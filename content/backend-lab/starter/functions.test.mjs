import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isValidQuantity,invoiceTotal,remainingCapacity,allowance,publicTasks,safeName} from './functions.mjs';
test('day 3: quantities accept only bounded integers',()=>{
 for(const [input,expected] of [[0,true],[100,true],[101,false],[-1,false],['3',false],[null,false],[3.5,false],[NaN,false],[Infinity,false]]) assert.equal(isValidQuantity(input),expected,`input=${String(input)}`);
});
test('days 4/8: invoice, including zero delivery and empty basket',()=>{
 for(const [args,expected] of [[[250,3,100],850],[[0,2,100],100],[[125,2,0],250],[[250,0,100],100],[[7,4,3],31]]) assert.equal(invoiceTotal(...args),expected);
});
test('day 5: capacity returns a result without shared state',()=>{
 for(const [args,expected] of [[[10,3],7],[[10,10],0],[[0,0],0],[[100,1],99]]) assert.equal(remainingCapacity(...args),expected);
 assert.equal(remainingCapacity(10,3),7);
});
test('day 6: allowance boundaries and both input types',()=>{
 for(const [args,expected] of [[[0,3],'allowed'],[[3,3],'blocked'],[[4,3],'blocked'],[['1',3],'invalid'],[[-1,3],'invalid'],[[1,0],'invalid'],[[1,2.5],'invalid'],[[2.5,3],'invalid']]) assert.equal(allowance(...args),expected);
});
test('day 7: owner filtering, permitted fields, ordering and unchanged input',()=>{
 const input=[{id:1,title:'Read',ownerId:7,secret:'private'},{id:2,title:'Write',ownerId:8},{id:3,title:'Test',ownerId:7}];const original=structuredClone(input);
 const result=publicTasks(input,7);assert.deepEqual(result,[{id:1,title:'Read'},{id:3,title:'Test'}]);assert.deepEqual(input,original);
 assert.notEqual(result[0],input[0]);assert.deepEqual(publicTasks(input,99),[]);assert.deepEqual(publicTasks([],7),[]);
});
test('day 9: await fulfillment, whitespace, wrong types and rejection',async()=>{
 assert.deepEqual(await safeName(async()=> ' Amina '),{ok:true,name:'Amina'});
 for(const load of [async()=> ' ',async()=> 12,async()=> {throw new Error('offline');}]) assert.deepEqual(await safeName(load),{ok:false,error:'unavailable'});
});
