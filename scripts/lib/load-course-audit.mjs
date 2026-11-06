import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../../',import.meta.url));
let pending;
export function loadAuditData(){
  // Use the project's real TypeScript loaders, aliases and JSON imports. Bundling
  // trusted repository code in memory avoids Node-specific alias/JSON workarounds
  // and leaves no generated entrypoint or premium content on disk or in public/.
  pending??=build({absWorkingDir:root,entryPoints:[path.join(root,'scripts/lib/course-audit.ts')],bundle:true,platform:'node',format:'esm',target:'node22',write:false,logLevel:'silent'})
    .then(result=>import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64')))
    .then(module=>module.loadAuditData());
  return pending;
}
