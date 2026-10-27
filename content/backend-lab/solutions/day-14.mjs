export function solve({type,body}) {
 if(type.split(';')[0].trim().toLowerCase()!=='application/json')return {status:415};
 if(new TextEncoder().encode(body).byteLength>4096)return {status:413};
 try{return {status:200,value:JSON.parse(body)};}catch{return {status:400};}
}
