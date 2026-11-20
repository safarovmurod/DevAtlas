import { beforeEach, describe, expect, it } from 'vitest';
import { accountStorageKey, emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';

beforeEach(()=>{localStorage.clear();switchLearningAccount(null);});
describe('Private account progress',()=>{
  it('isolates accounts and restores guest data without importing it',()=>{
    useLearningStore.getState().saveNote({id:'guest-note',title:'Guest',content:'Guest content'});
    switchLearningAccount('account-a');expect(useLearningStore.getState().notes).toEqual([]);
    useLearningStore.getState().saveNote({id:'a-note',title:'A',content:'Private A'});
    useLearningStore.getState().setPreferences({language:'en'});
    switchLearningAccount('account-b');expect(useLearningStore.getState().notes).toEqual([]);expect(useLearningStore.getState().language).toBe('ru');
    useLearningStore.getState().saveDraft('practice','Private B code');
    switchLearningAccount('account-a');expect(useLearningStore.getState().notes[0].content).toBe('Private A');expect(useLearningStore.getState().drafts).toEqual({});expect(useLearningStore.getState().language).toBe('en');
    switchLearningAccount(null);expect(useLearningStore.getState().notes[0].id).toBe('guest-note');
    expect(JSON.parse(localStorage.getItem(accountStorageKey('account-b'))!).state.drafts.practice).toBe('Private B code');
  });
  it('moves a saved Ukrainian, Japanese or Korean language to a supported one instead of failing',()=>{
    for(const old of ['uk','ja','ko']){
      localStorage.setItem(accountStorageKey('legacy-'+old),JSON.stringify({state:{language:old,contentLanguage:'en'}}));
      switchLearningAccount('legacy-'+old);
      expect(useLearningStore.getState().storageError).toBe('');
      expect(useLearningStore.getState().language).toBe('en');
    }
    expect(progressSnapshot({language:'es'}).language).toBe('es');
    expect(progressSnapshot({}).language).toBe('ru');
    expect(()=>progressSnapshot({language:'xx'})).toThrow();
  });
  it('preserves a corrupt cache instead of overwriting it',()=>{
    localStorage.setItem(accountStorageKey('broken'),'{broken');switchLearningAccount('broken');
    expect(useLearningStore.getState().storageError).toBeTruthy();expect(localStorage.getItem(accountStorageKey('broken'))).toBe('{broken');
  });
  it('deduplicates achievements across devices and preserves both sets of work',()=>{
    const a=progressSnapshot({...emptyProgress(),awards:{'test:q':10},studied:['q'],completedTopics:['a']});
    const b=progressSnapshot({...emptyProgress(),awards:{'test:q':10,'lesson:b':5},studied:['q','r'],completedTopics:['b']});
    const result=mergeProgress(a,b);expect(result.awards).toEqual({'test:q':10,'lesson:b':5});expect(result.studied).toEqual(['q','r']);expect(result.completedTopics).toEqual(['a','b']);
    expect(mergeProgress(result,result)).toEqual(result);
  });
  it('keeps deleted notes deleted when an offline device later reconnects',()=>{
    const remote=progressSnapshot({notes:[],deletedNotes:{note:200}});
    const stale=progressSnapshot({notes:[{id:'note',title:'Old',content:'Old'}],noteClock:{note:100}});
    expect(mergeProgress(remote,stale).notes).toEqual([]);
    const edited=progressSnapshot({...stale,noteClock:{note:300}});expect(mergeProgress(remote,edited).notes).toEqual(edited.notes);
  });
  it('resolves preferences, code edits and review outcomes by edit timestamp',()=>{
    const remote=progressSnapshot({language:'en',preferenceClock:{language:200},drafts:{p:'new'},draftClock:{p:200},reviews:{q:{questionId:'q',topicId:'t',due:'2026-10-05',repetitions:0}},reviewClock:{q:200}});
    const stale=progressSnapshot({language:'ru',preferenceClock:{language:100},drafts:{p:'old'},draftClock:{p:100},reviews:{q:{questionId:'q',topicId:'t',due:'2026-11-05',repetitions:5}},reviewClock:{q:100}});
    const result=mergeProgress(remote,stale);expect(result.language).toBe('en');expect(result.drafts.p).toBe('new');expect(result.reviews.q.repetitions).toBe(0);
  });
});

describe('Original day submission merge', () => {
  function attempt(date: string, correct: boolean, recordedDay: string) {
    const quiz = { id: 'quiz', mode: 'test' as const, answer: correct ? '1' : '0', correct };
    const written = { id: 'written', mode: 'interview' as const, answer: correct ? '' : 'Later response', correct: false };
    return {
      daySubmissions: { lesson: { day: 6, date, score: correct ? 50 : 0, answers: [quiz, written] } },
      answers: Object.fromEntries([quiz, written].map(answer => [
        `day:lesson:${answer.mode}:${answer.id}`,
        { questionId: answer.id, topicId: 'original-topic', mode: answer.mode, answer: answer.answer, correct: answer.correct, date: recordedDay },
      ])),
      confirmedDays: ['6'],
    };
  }

  it.each(['local', 'remote'] as const)('keeps the earliest %s submission and its corresponding exam records together', winner => {
    // Stored answer dates are local calendar days, not necessarily the ISO timestamp's UTC day.
    const original = attempt('2026-11-17T23:55:00.000Z', true, '2026-11-18');
    const later = attempt('2026-11-18T04:00:00.000Z', false, '2026-11-19');
    const reviewKey = '2026-11-20:revision:quiz';
    const reviewAnswer = { questionId: 'quiz', topicId: 'original-topic', mode: 'revision', correct: true, answer: 'Recovered in review', date: '2026-11-20' };
    const recentReview = { questionId: 'quiz', topicId: 'original-topic', due: '2026-11-23', repetitions: 2 };
    const local = progressSnapshot({ courses: { html: {
      ...(winner === 'local' ? original : later),
      answers: { ...(winner === 'local' ? original.answers : later.answers), [reviewKey]: reviewAnswer },
      reviews: { quiz: recentReview }, reviewClock: { quiz: 300 },
    } } });
    const remote = progressSnapshot({ courses: { html: winner === 'remote' ? original : later } });
    const result = mergeProgress(remote, local);
    expect(result.courses.html!.daySubmissions.lesson).toEqual(original.daySubmissions.lesson);
    for (const [key, record] of Object.entries(original.answers)) {
      expect(result.courses.html!.answers[key]).toEqual(record);
    }
    expect(result.courses.html!.answers[reviewKey]).toEqual(reviewAnswer);
    expect(result.courses.html!.reviews.quiz).toEqual(recentReview);
    expect(result.courses.html!.reviewClock.quiz).toBe(300);
    expect(mergeProgress(result, result)).toEqual(result);
    expect((winner === 'local' ? local : remote).courses.html!.daySubmissions.lesson).toEqual(original.daySubmissions.lesson);
    expect((winner === 'local' ? remote : local).courses.html!.daySubmissions.lesson).toEqual(later.daySubmissions.lesson);
  });

  it('reconciles React root submissions without changing unrelated daily answers', () => {
    const original = attempt('2026-11-17T10:00:00.000Z', true, '2026-11-17');
    const later = attempt('2026-11-17T11:00:00.000Z', false, '2026-11-17');
    const normalKey = '2026-11-18:test:quiz';
    const normal = { questionId: 'quiz', topicId: 'original-topic', mode: 'test', answer: '0', correct: false, date: '2026-11-18' };
    const result = mergeProgress(progressSnapshot(later), progressSnapshot({ ...original, answers: { ...original.answers, [normalKey]: normal } }));
    expect(result.daySubmissions.lesson).toEqual(original.daySubmissions.lesson);
    expect(result.answers['day:lesson:test:quiz']).toEqual(original.answers['day:lesson:test:quiz']);
    expect(result.answers[normalKey]).toEqual(normal);
  });

  it('keeps the existing remote tie-break and all of that original result', () => {
    const original = attempt('2026-11-17T10:00:00.000Z', false, '2026-11-17');
    const competing = attempt('2026-11-17T10:00:00.000Z', true, '2026-11-18');
    const result = mergeProgress(progressSnapshot(original), progressSnapshot(competing));
    expect(result.daySubmissions.lesson).toEqual(original.daySubmissions.lesson);
    expect(result.answers).toEqual(original.answers);
  });
});
