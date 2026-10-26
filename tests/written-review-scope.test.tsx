import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {webcrypto} from 'node:crypto';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const actor=vi.hoisted(()=>({id:'a'}));
vi.mock('@/components/account/account-provider',()=>({useAccount:()=>({user:{id:actor.id}})}));
import {WrittenRubricReview} from '@/components/courses/written-rubric-review';
import {useLearningStore} from '@/stores/learning-store';
import {emptyCourseProgress} from '@/lib/account/progress';
import {courseContentSchema} from '@/lib/courses/schema';
import communication from '@/content/courses/communication.json';
const lesson=courseContentSchema.parse(communication).lessons[0],rubric=lesson.practice!.rubric!;
const answer='Please send the timetable with days and times by Friday at 15:00. Let me know what needs clarification.';
const props={courseId:'communication' as const,lessonId:lesson.id,answer,rubric,criteria:lesson.practice!.criteria};
const key='written-review-v1:'+lesson.id,originalScope=useLearningStore.persist.getOptions().name;
function scope(id:string,raw?:string){actor.id=id;useLearningStore.persist.setOptions({name:'rubric-test-'+id});useLearningStore.setState({language:'ru',contentLanguage:'ru',courses:{communication:{...emptyCourseProgress(),drafts:{[lesson.id]:answer,...(raw?{[key]:raw}:{})}}}});}
function rate(){for(const group of screen.getAllByRole('group'))fireEvent.click(group.querySelectorAll('input')[2]);fireEvent.change(screen.getByRole('textbox'),{target:{value:'The requested table, deadline and neutral clarification route are all explicit in my answer.'}});}
beforeEach(()=>{localStorage.clear();vi.stubGlobal('crypto',webcrypto);scope('a');});
afterEach(()=>{cleanup();useLearningStore.persist.setOptions({name:originalScope});vi.restoreAllMocks();vi.unstubAllGlobals();});
it('does not credit a different account when a digest finishes late, even with identical drafts',async()=>{
 const ui=render(<WrittenRubricReview {...props}/>);rate();
 let finish!:(value:ArrayBuffer)=>void;
 vi.spyOn(crypto.subtle,'digest').mockImplementationOnce(()=>new Promise<ArrayBuffer>(resolve=>{finish=resolve;}));
 fireEvent.click(screen.getByRole('button',{name:'Сохранить Self Reviewed и продолжить'}));
 await waitFor(()=>expect(finish).toBeTypeOf('function'));
 await act(async()=>{scope('b');ui.rerender(<WrittenRubricReview {...props}/>);finish(new ArrayBuffer(32));});
 expect(useLearningStore.getState().courses.communication!.completedPractice).toEqual([]);
 expect(useLearningStore.getState().courses.communication!.drafts[key]).toBeUndefined();
 expect(screen.getByRole('textbox')).toHaveValue('');expect(document.querySelectorAll('input:checked')).toHaveLength(0);
});
it('preserves incompatible original records and saves only an honest self review',async()=>{
 const original='{"method":"Auto Verified","verified":true}';scope('a',original);
 render(<WrittenRubricReview {...props}/>);expect(screen.getByRole('alert')).toHaveTextContent('резервной копии');rate();
 fireEvent.click(screen.getByRole('button',{name:'Сохранить Self Reviewed и продолжить'}));
 await waitFor(()=>expect(useLearningStore.getState().courses.communication!.completedPractice).toContain(lesson.id));
 const progress=useLearningStore.getState().courses.communication!;
 expect(Object.entries(progress.drafts).find(([id])=>id.startsWith(key+':recovery:'))?.[1]).toBe(original);
 expect(JSON.parse(progress.drafts[key])).toMatchObject({method:'Self Reviewed'});
 expect(JSON.parse(progress.drafts[key]).verified).toBeUndefined();expect(progress.awards['practice:'+lesson.id]).toBe(4);
});
