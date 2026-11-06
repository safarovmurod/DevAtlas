export function solve(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>key!=='title')||typeof value.title!=='string')return {error:'title'};
 const title=value.title.trim();return title.length>=1&&title.length<=120?{title}:{error:'title'};
}
