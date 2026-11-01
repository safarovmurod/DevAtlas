"""Print the content gaps of every course against the DevAtlas lesson standard.

Usage (from the repo root): python3 -I scripts/course-authoring/audit.py [courseId ...]
Count columns are lessons breaking a rule (target 0). Percent columns: answerSameIdx% and answerLongest%
show guessable quizzes (target ≤ 45%), solInLesson% means the practice answer is already printed in the
lesson, repeatTitles% means template section titles, copyTask% means practice is "retype the example".
"""
import collections
import glob
import json
import os
import re
import sys

MARKERS = (
    'Как объяснить тему',
    'Достаточно скопировать код, не проверяя результат',
    'Сохраните вчерашний результат и внесите только новое изменение',
    'Задание выполнено и проверен ожидаемый результат',
)
LANGS = ('ru', 'tg', 'en')

only = set(sys.argv[1:])
COPY_TASK = re.compile(r'(код из примера|кодом из примера|наберите программу|повторите пример|сохраните пример|скопируйте пример)', re.I)
header = ('course', 'lessons', 'days', 'template', 'sec<4', 'q<3', 'noHint', 'noEN', 'tg=ru',
          'badCrit', 'genericCrit', 'shortSol', 'autoGraded',
          'answerSameIdx%', 'answerLongest%', 'solInLesson%', 'repeatTitles%', 'copyTask%')
print('\t'.join(header))
for path in sorted(glob.glob('src/content/courses/*.json')):
    course = os.path.basename(path)[:-5]
    if course == 'telegram-index' or (only and course not in only):
        continue
    with open(path, encoding='utf-8') as fh:
        text = fh.read()
    data = json.loads(text)
    lessons = data.get('lessons', [])
    template = sum(1 for lesson in lessons if any(m in json.dumps(lesson, ensure_ascii=False) for m in MARKERS))
    few_sections = sum(1 for lesson in lessons if len(lesson.get('sections', [])) < 4)
    few_questions = sum(1 for lesson in lessons if len(lesson.get('questions', [])) < 3)
    no_hint = sum(1 for lesson in lessons if any(not q.get('hint') for q in lesson.get('questions', [])))
    no_en = sum(1 for lesson in lessons if any('en' not in s['body'] for s in lesson.get('sections', [])))
    tg_copy = sum(1 for lesson in lessons if any(s['body'].get('tg') == s['body'].get('ru') for s in lesson.get('sections', [])))
    criteria = collections.Counter(
        c.get('ru', '') for lesson in lessons for c in (lesson.get('practice') or {}).get('criteria', []))
    bad_criteria = sum(1 for lesson in lessons
                       if any(len(c.get('ru', '')) < 12 for c in (lesson.get('practice') or {}).get('criteria', [])))
    generic = sum(1 for lesson in lessons
                  if any(criteria[c.get('ru', '')] >= 5 for c in (lesson.get('practice') or {}).get('criteria', [])))
    short_solution = sum(1 for lesson in lessons if len((lesson.get('practice') or {}).get('solution', '')) < 150)
    graded = sum(1 for lesson in lessons if (lesson.get('practice') or {}).get('execution'))
    days = sum(1 for lesson in lessons if lesson.get('day'))
    questions = [q for lesson in lessons for q in lesson.get('questions', []) if q.get('options')]
    index_counts = collections.Counter(q.get('correctIndex') for q in questions)
    same_index = 100 * max(index_counts.values()) // len(questions) if questions else 0
    longest = 100 * sum(1 for q in questions
                        if max(range(len(q['options'])), key=lambda i: len(q['options'][i].get('ru', ''))) == q.get('correctIndex')
                        ) // len(questions) if questions else 0
    leaked = 0
    for lesson in lessons:
        lines = [x.strip() for x in (lesson.get('practice') or {}).get('solution', '').split('\n') if len(x.strip()) > 30]
        text = ' '.join((sec.get('code') or '') + ' ' + sec['body'].get('ru', '') for sec in lesson.get('sections', []))
        if lines and sum(1 for x in lines if x in text) / len(lines) > 0.6:
            leaked += 1
    titles = collections.Counter(sec['title'].get('ru') for lesson in lessons for sec in lesson.get('sections', []))
    all_sections = sum(titles.values()) or 1
    repeated = 100 * sum(v for t, v in titles.items() if v >= 5 and t not in ('Частые ошибки',)) // all_sections
    copy_task = 100 * sum(1 for lesson in lessons
                          if COPY_TASK.search((lesson.get('practice') or {}).get('task', {}).get('ru', ''))) // (len(lessons) or 1)
    row = (course, len(lessons), days, template, few_sections, few_questions, no_hint, no_en, tg_copy,
           bad_criteria, generic, short_solution, graded,
           same_index, longest, 100 * leaked // (len(lessons) or 1), repeated, copy_task)
    print('\t'.join(str(value) for value in row))
