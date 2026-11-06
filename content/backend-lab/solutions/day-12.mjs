export function solve(input) {
 const values=new URL(input,'http://localhost').searchParams.getAll('limit');
 if(!values.length)return {limit:10};
 if(values.length!==1||!/^\d+$/.test(values[0]))return {error:'limit'};
 const n=Number(values[0]);return n>=1&&n<=50?{limit:n}:{error:'limit'};
}
