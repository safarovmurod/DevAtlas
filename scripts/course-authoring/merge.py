"""Merge rewritten lessons into a course JSON, keeping ids, days, prerequisites and sources.

Usage: python3 -I merge.py <repo> <courseId> <module> [<module> ...]
Removes Telegram preview screenshots (files + their photo-* sources) that carried no lesson context.
"""
import importlib, json, os, sys

repo, course, *modules = sys.argv[1:]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(repo, 'src/content/courses', course + '.json')
with open(path, encoding='utf-8') as fh:
    data = json.load(fh)

lessons = {}
for name in modules:
    for lesson in importlib.import_module(name).LESSONS:
        lessons[lesson['id']] = lesson

seen = set()
for lesson in data['lessons']:
    new = lessons.get(lesson['id'])
    if not new:
        continue
    seen.add(lesson['id'])
    for key in ('title', 'summary', 'sections', 'questions', 'practice'):
        lesson[key] = new[key]
missing = set(lessons) - seen
if missing:
    sys.exit('Unknown lesson ids: ' + ', '.join(sorted(missing)))

# Drop context-free Telegram screenshots and the sources that only described them.
photo_sources = {s['id'] for s in data['sources'] if s['id'].startswith('photo-')}
removed_files = [f['url'].split('/')[-1] for f in data.get('files', []) if f['title'].startswith('Превью Telegram')]
data['files'] = [f for f in data.get('files', []) if not f['title'].startswith('Превью Telegram')]
used = {sid for f in data['files'] for sid in f['sourceIds']}
data['sources'] = [s for s in data['sources'] if s['id'] not in photo_sources or s['id'] in used]
valid = {s['id'] for s in data['sources']}
fallback = next(s['id'] for s in data['sources'] if not s['id'].startswith('photo-'))
for lesson in data['lessons']:
    ids = [sid for sid in lesson['sourceIds'] if sid in valid]
    lesson['sourceIds'] = ids or [fallback]

# Drop "About this material" notes that only describe a Telegram photo: they teach nothing.
dropped = 0
for lesson in data['lessons']:
    keep = []
    for index, section in enumerate(lesson['sections']):
        about_photo = section['title'].get('ru') == 'О материале' and 'фотограф' in section['body'].get('ru', '')
        referenced = any(q.get('relatedSection') == index for q in lesson['questions'])
        if about_photo and not referenced and len(lesson['sections']) > 1:
            dropped += 1
            continue
        keep.append((index, section))
    if len(keep) != len(lesson['sections']):
        remap = {old: new for new, (old, _) in enumerate(keep)}
        lesson['sections'] = [section for _, section in keep]
        for q in lesson['questions']:
            if 'relatedSection' in q:
                q['relatedSection'] = remap[q['relatedSection']]
print('dropped photo notes:', dropped)

with open(path, 'w', encoding='utf-8') as fh:
    json.dump(data, fh, ensure_ascii=False, indent=2)
    fh.write('\n')
print(f'{course}: updated {len(seen)} lessons, removed {len(removed_files)} screenshot files')
for name in removed_files:
    print('REMOVED_FILE', name)
