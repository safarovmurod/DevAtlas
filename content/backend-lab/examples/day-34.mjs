async function read(load){try{const items=await load();return Array.isArray(items)?{status:'ok',items}:{status:'invalid'};}catch{return {status:'unavailable'};}}
console.log(JSON.stringify(await read(async()=>[])));
