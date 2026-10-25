export type LearningStatus='Not Started'|'Studying'|'Practicing'|'Tested'|'Mastered'|'Needs Review';
export type ReviewMethod='Auto Verified'|'Self Reviewed'|'AI Feedback'|'Human Reviewed';
export interface LearningEvidence {
  lessonVersion:number;
  read:boolean;
  practice:{submitted:boolean;passed:boolean;method:ReviewMethod;subjectiveReviewRequired:boolean;humanReviewed:boolean};
  quiz:{total:number;correct:number;criticalTotal:number;criticalCorrect:number};
  needsReview:boolean;
}

/** Legacy completion/XP never serves as proof for the new assessment contract. */
export function learningStatus(evidence:LearningEvidence|undefined,currentVersion:number):LearningStatus {
  if(!evidence)return 'Not Started';
  if(evidence.lessonVersion!==currentVersion||evidence.needsReview)return 'Needs Review';
  const quiz=evidence.quiz,practice=evidence.practice;
  const valid=Number.isInteger(quiz.total)&&quiz.total>0&&Number.isInteger(quiz.correct)&&quiz.correct>=0&&quiz.correct<=quiz.total&&Number.isInteger(quiz.criticalTotal)&&quiz.criticalTotal>=0&&quiz.criticalTotal<=quiz.total&&Number.isInteger(quiz.criticalCorrect)&&quiz.criticalCorrect>=0&&quiz.criticalCorrect<=quiz.criticalTotal;
  const practiceVerified=practice.submitted&&practice.passed&&(practice.method==='Auto Verified'||practice.method==='Human Reviewed')&&(!practice.subjectiveReviewRequired||practice.humanReviewed);
  if(valid&&practiceVerified&&quiz.criticalTotal>0&&quiz.criticalCorrect<=quiz.correct&&quiz.correct/quiz.total>=0.8&&quiz.criticalCorrect===quiz.criticalTotal)return 'Mastered';
  if(valid)return 'Tested';
  if(practice.submitted)return 'Practicing';
  return evidence.read?'Studying':'Not Started';
}

export function stageReadiness({previousStageMastered,placementPassed}:{previousStageMastered:boolean;placementPassed:boolean}){
  return {ready:previousStageMastered||placementPassed,blocksPaidContent:false as const};
}
