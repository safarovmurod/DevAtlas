import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
vi.mock('@/components/account/account-provider',()=>({useAccount:()=>({user:null})}));
import {StudySession} from '@/components/learning/study-session';
import {QUIZ_QUESTIONS} from '@/content/course';
import {emptyProgress} from '@/lib/account/progress';
import {useLearningStore} from '@/stores/learning-store';
import {dateKey} from '@/lib/learning';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('keeps a review queue stable as successful answers move due dates into the future',async()=>{
 const questions=QUIZ_QUESTIONS.filter(question=>question.options.length).slice(0,2),p=emptyProgress(),today=dateKey();
 for(const question of questions){p.reviews[question.id]={questionId:question.id,topicId:question.topicId,repetitions:1,due:'2020-01-01'};}
 useLearningStore.setState({...p,ready:true,language:'en',contentLanguage:'en'});
 // Mock only the API transport here: the assertion concerns queue behavior,
 // not production grading or live account persistence.
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({correct:true})));
 render(<StudySession config={{mode:'revision',review:true}}/>);
 expect(screen.getByText('Question 1 / 2')).toBeInTheDocument();
 fireEvent.click(screen.getAllByRole('button').find(button=>button.classList.contains('answer-option'))!);fireEvent.click(screen.getByRole('button',{name:'Check'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Next'})).toBeEnabled());
 expect(useLearningStore.getState().reviews[questions[0].id].due>today).toBe(true);
 expect(screen.getByText('Question 1 / 2')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Next'}));
 expect(screen.getByText('Question 2 / 2')).toBeInTheDocument();
 fireEvent.click(screen.getAllByRole('button').find(button=>button.classList.contains('answer-option'))!);fireEvent.click(screen.getByRole('button',{name:'Check'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Finish'})).toBeEnabled());
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Finish'})));
 expect(screen.getByRole('heading',{name:'2 / 2 correct'})).toBeInTheDocument();
});
