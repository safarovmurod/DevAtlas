function config(env){const raw=env.PORT??'3001',port=Number(raw);return /^\d+$/.test(raw)&&Number.isInteger(port)&&port>=1024&&port<=65535?{port}:{error:'PORT'};}
console.log(JSON.stringify([config({}),config({PORT:'3e3'})]));
