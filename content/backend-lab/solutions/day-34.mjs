export async function solve(load){try{const items=await load();return Array.isArray(items)?{status:'ok',items}:{status:'invalid'};}catch{return {status:'unavailable'};}}
