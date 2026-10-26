/** Git's Windows CRLF checkout is not content drift. All other bytes matter.
 * @param {string|null} existing
 * @param {string} expected
 */
export function reportMatches(existing,expected){
 return existing!==null&&existing.replace(/\r\n/g,'\n')===expected.replace(/\r\n/g,'\n');
}
