"""Print the content gaps of every course against the DevAtlas lesson standard.

Usage (from the repo root): python3 -I scripts/course-authoring/audit.py [courseId ...]
Columns count lessons that break a rule; 0 everywhere means the course meets the standard.
"""
import collections
import glob
import json
import os
import sys

MARKERS = (
    'Как объяснить тему',
    'Достаточно скопировать код, не проверяя результат',
    'Сохраните вчерашний результат и внесите только новое изменение',
    'Задание выполнено и проверен ожидаемый результат',
)
LANGS = ('ru', 'tg', 'en')

only = set(sys.argv[1:])
header = ('course', 'lessons', 'days', 'template', 'sec<4', 'q<3', 'noHint', 'noEN', 'tg=ru',
          'badCrit', 'genericCrit', 'shortSol', 'autoGraded')
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
    row = (course, len(lessons), days, template, few_sections, few_questions, no_hint, no_en, tg_copy,
           bad_criteria, generic, short_solution, graded)
    print('\t'.join(str(value) for value in row))
