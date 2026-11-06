import type {Reporter,TestCase,TestResult,TestError} from '@playwright/test/reporter';
import {stripVTControlCharacters} from 'node:util';

/** Native output is not reliably captured by Start-Transcript on Windows PS7.
 * Emit bounded failure evidence directly as GitHub annotations, independently
 * of archive/log-download access. Never turn failed tests into successes. */
export default class GitHubFailureReporter implements Reporter {
 private emit(title:string,errors:TestError[]){
  const detail=stripVTControlCharacters([title,...errors.map(error=>error.message??error.stack??'Unknown Playwright error')].join('\n')).slice(0,6500);
  const escaped=detail.replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');
  console.log(`::error::${escaped}`);
 }
 onTestEnd(test:TestCase,result:TestResult){
  if(result.status==='skipped'||result.status===test.expectedStatus)return;
  this.emit(`${test.parent.project()?.name??'browser'}: ${test.title} (${result.status})`,result.errors);
 }
 onError(error:TestError){this.emit('Playwright runner error',[error]);}
}
