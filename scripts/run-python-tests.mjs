import {spawnSync} from 'node:child_process';
import {findPython} from './lib/python-runtime.mjs';
const python=findPython();
if(!python){console.error('Python 3.10+ is required for importer tests. Install it or expose python/python3/py -3 on PATH.');process.exit(1);}
const result=spawnSync(python.command,[...python.prefixArgs,'-m','unittest','discover','-s','tests','-p','*_test.py','-v'],{stdio:'inherit',env:{...process.env,PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'}});
if(result.error)console.error(result.error.message);
if(result.signal)console.error('Python tests terminated by '+result.signal);
process.exit(result.status??1);
