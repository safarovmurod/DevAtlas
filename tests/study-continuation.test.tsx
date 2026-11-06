import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({session:vi.fn()}));
vi.mock('@/lib/supabase/client',()=>({getSupabaseBrowserClient:()=>({auth:{getSession:mocks.session}})}));
import {CourseWorkspace} from '@/components/courses/course-workspace';
import {useLearningStore} from '@/stores/learning-store';
import {emptyCourseProgress} from '@/lib/account/progress';
import {courseContentSchema} from '@/lib/courses/schema';
import html from '@/content/courses/html.json';
const content=courseContentSchema.parse(html);
const originalScope=useLearningStore.persist.getOptions().name;
beforeEach(()=>{
 useLearningStore.persist.setOptions({name:originalScope});
 useLearningStore.setState({language:'ru',contentLanguage:'ru',selectedCourse:'html',courseChosen:true,courses:{html:{...emptyCourseProgress(),completedTopics:['html-day-01'],completedPractice:['html-day-01']}}});
 mocks.session.mockResolvedValue({data:{session:{access_token:'valid'}},error:null});
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({error:'unavailable'},{status:503})));
});
afterEach(()=>{cleanup();useLearningStore.persist.setOptions({name:originalScope});vi.unstubAllGlobals();});
it('permits study continuation without pretending failed persistence is verified',async()=>{
 render(<CourseWorkspace courseId="html" section="home" initialContent={content} day={1}/>);
 fireEvent.click(screen.getByRole('button',{name:'Подтвердить завершение дня'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('подтверждённое освоение не начислено');
 await waitFor(()=>expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']));
 expect(useLearningStore.getState().courses.html!.masteredQuestions).toEqual([]);
});
it('never confirms a late request into a switched account',async()=>{
 let finish!:(response:Response)=>void;
 vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;})));
 render(<CourseWorkspace courseId="html" section="home" initialContent={content} day={1}/>);
 fireEvent.click(screen.getByRole('button',{name:'Подтвердить завершение дня'}));
 await waitFor(()=>expect(finish).toBeTypeOf('function'));
 await act(async()=>{
  useLearningStore.persist.setOptions({name:originalScope+'-account-b'});
  finish(Response.json({confirmed:true}));
 });
 expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual([]);
});
