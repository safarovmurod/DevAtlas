"""Run trusted authored Go solutions and lesson examples; compare exact output.

Usage: python3 -I scripts/course-authoring/verify_go.py [--from-day 1] [--to-day 30]
Requires the real Go toolchain on PATH. This is not a learner-submission runner.
Solutions declare their expected stdout in a final // Output: comment block.
Each program runs in its own temporary directory with a bounded timeout.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--from-day', type=int, default=1)
parser.add_argument('--to-day', type=int, default=30)
args = parser.parse_args()
if not 1 <= args.from_day <= args.to_day <= 30:
    parser.error('expected 1 <= from-day <= to-day <= 30')
root = Path(__file__).resolve().parents[2]
course = json.loads((root / 'src/content/courses/go.json').read_text(encoding='utf-8'))
version = subprocess.run(['go', 'version'], capture_output=True, encoding='utf-8', check=True, timeout=15)
if not version.stdout.startswith('go version go'):
    raise SystemExit('PATH does not contain the Go language toolchain')
print(version.stdout.strip(), flush=True)
checked_solutions = checked_examples = 0


def verify(code, expected, label):
    with tempfile.TemporaryDirectory(prefix='devatlas-go-') as directory:
        files = re.split(r'^// File: ([a-zA-Z0-9_./-]+)\n', code, flags=re.M)
        bundled = len(files) > 1
        names = []
        if bundled:
            if files[0].strip():
                raise SystemExit(label + ': content before first file marker')
            for name, contents in zip(files[1::2], files[2::2]):
                relative = Path(name)
                if relative.is_absolute() or '..' in relative.parts or name in names:
                    raise SystemExit(label + ': invalid or duplicate file path')
                names.append(name)
                destination = Path(directory) / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text(contents, encoding='utf-8')
        else:
            (Path(directory) / 'main.go').write_text(code, encoding='utf-8')
        result = subprocess.run(
            ['go', 'run', '.' if bundled else 'main.go'], cwd=directory, capture_output=True,
            encoding='utf-8', timeout=90, env={**os.environ, 'GOTOOLCHAIN': 'local'},
        )
        actual = result.stdout.replace('\r\n', '\n').rstrip('\n')
        if result.returncode or result.stderr or actual != expected:
            raise SystemExit(f'{label}: exit={result.returncode}\n'
                             f'expected={expected!r}\nactual={actual!r}\n{result.stderr}')
        if any(name.endswith('_test.go') for name in names):
            tests = subprocess.run(['go', 'test', '-count=1', '-v', './...'],
                                   cwd=directory, capture_output=True, encoding='utf-8', timeout=90,
                                   env={**os.environ, 'GOTOOLCHAIN': 'local'})
            if tests.returncode or tests.stderr or '--- PASS: Test' not in tests.stdout:
                raise SystemExit(label + ': Go tests did not pass\n' + tests.stdout + tests.stderr)
            print(label + ': real Go tests passed', flush=True)


for lesson in course['lessons']:
    if not args.from_day <= lesson.get('day', 0) <= args.to_day:
        continue
    code = lesson['practice']['solution']
    marker = re.search(r'^// Output:\n((?://(?: [^\n]*)?\n?)+)\Z', code, re.M)
    if not marker:
        raise SystemExit(lesson['id'] + ': missing final // Output: block')
    expected = '\n'.join(line[3:] if line.startswith('// ') else ''
                         for line in marker[1].splitlines())
    verify(code, expected, lesson['id'] + ' solution')
    checked_solutions += 1
    for index, section in enumerate(lesson['sections']):
        if section.get('language') != 'go' or not section.get('code'):
            continue
        outputs = section.get('output', {})
        if 'en' not in outputs or len(set(outputs.values())) != 1:
            raise SystemExit(f"{lesson['id']} section {index}: missing or inconsistent output")
        verify(section['code'], outputs['en'], f"{lesson['id']} section {index}")
        checked_examples += 1
    print(lesson['id'] + ': solution and examples passed', flush=True)
if checked_solutions != args.to_day - args.from_day + 1:
    raise SystemExit('Some requested days were not executed')
print(f'checked {checked_solutions} solutions, {checked_examples} examples, 0 problems')
