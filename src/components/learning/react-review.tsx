'use client';
import Link from 'next/link';
import {LEARNING_TOPICS,QUIZ_QUESTIONS,topicTitle} from '@/content/course';
import {useLearningStore} from '@/stores/learning-store';
import {ReviewBoard,REVIEW_COPY} from './review-board';
import {PageHeading} from './page-heading';
import {COPY} from '@/lib/i18n';
export function ReactReview({mode}:{mode:'weak'|'revision'}){
 const state=useLearningStore();
 const lessons=LEARNING_TOPICS.filter(topic=>topic.month<=2).map(topic=>({
  id:topic.id,title:topicTitle(topic,state.language),questionIds:QUIZ_QUESTIONS.filter(question=>question.topicId===topic.id).map(question=>question.id),
  lessonHref:`/lesson/${topic.id}`,quizHref:`/revision?start=1&topic=${topic.id}`,
 }));
 return <><PageHeading title={REVIEW_COPY[mode][state.language]} subtitle="React"/><nav className="button-row"><Link className="button subtle" href="/weak-topics">{COPY[state.language].weak}</Link><Link className="button subtle" href="/revision">{COPY[state.language].revision}</Link></nav><ReviewBoard lessons={lessons} progress={state} mode={mode}/></>;
}
