// @vitest-environment node
import {it,expect} from 'vitest';
import {reportMatches} from '../scripts/lib/report-text.mjs';
it('accepts Git CRLF checkout without accepting stale numbers or missing artifacts',()=>{
 const report='# Coverage\n43 courses; 894 days\n';
 expect(reportMatches(report.replaceAll('\n','\r\n'),report)).toBe(true);
 expect(reportMatches(report,report)).toBe(true);
 expect(reportMatches(report.replace('894','895'),report)).toBe(false);
 expect(reportMatches(report.trim(),report)).toBe(false);
 expect(reportMatches(null,report)).toBe(false);
});
