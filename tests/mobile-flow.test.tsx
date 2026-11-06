import {it,expect} from 'vitest';
import {render,screen,within} from '@testing-library/react';
import {LessonFlowActivities} from '@/components/courses/lesson-flow';
import {learningFlowSchema} from '@/lib/courses/learning-flow';
import {useLearningStore} from '@/stores/learning-store';
import draft from '../content/mobile-lab/drafts/day-03.json';

it('labels mobile practice as self-reviewed without claiming Backend or a device execution',()=>{
 useLearningStore.setState({language:'en',contentLanguage:'en'});
 const flow=learningFlowSchema.parse(draft.learningFlow);
 const {container}=render(<LessonFlowActivities flow={flow} lessonId="mobile-day-03" practiceHref="/practice?course=mobile&day=3"/>);
 const master=container.querySelector<HTMLElement>('#mobile-day-03-flow-master')!;
 expect(within(master).getByText(/Self Reviewed does not grant verified Mastered/)).toBeTruthy();
 expect(master.textContent).not.toContain('Backend');
 expect(screen.getByText(/not execution of your code/)).toBeTruthy();
});
