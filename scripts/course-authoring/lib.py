"""Helpers to author structured lessons compactly: every text is (ru, tg, en)."""
def T(ru, tg, en):
    return {"ru": ru, "tg": tg, "en": en}

def S(title, body, code=None, language=None):
    s = {"title": T(*title), "body": T(*body)}
    if code:
        s["code"] = code
        if language:
            s["language"] = language
    return s

def Q(qid, question, options, correct, hint, section, answer=None):
    opts = [T(*o) for o in options]
    return {
        "id": qid,
        "question": T(*question),
        "answer": T(*answer) if answer else opts[correct],
        "hint": T(*hint),
        "relatedSection": section,
        "options": opts,
        "correctIndex": correct,
    }

def steps(*items):
    """items: four (ru, tg, en) steps -> numbered task text in every language."""
    words = {"ru": "Шаг", "tg": "Қадами", "en": "Step"}
    out = {}
    for lang in ("ru", "tg", "en"):
        idx = {"ru": 0, "tg": 1, "en": 2}[lang]
        out[lang] = "\n".join(f"{words[lang]} {n}. {item[idx]}" for n, item in enumerate(items, 1))
    return out

def P(task_steps, hints, solution, criteria):
    hs = [T(*h) for h in hints]
    return {
        "kind": "code",
        "task": steps(*task_steps),
        "hint": hs[0],
        "hints": hs,
        "solution": solution,
        "criteria": [T(*c) for c in criteria],
    }

def L(lesson_id, title, summary, sections, questions, practice):
    return {"id": lesson_id, "title": T(*title), "summary": T(*summary),
            "sections": sections, "questions": questions, "practice": practice}

def E(function_name, starter, cases):
    """Auto-graded JavaScript function practice: cases are (args_list, expected)."""
    return {"kind": "javascript-function", "functionName": function_name, "starter": starter,
            "tests": [{"args": list(args), "expected": expected} for args, expected in cases]}

def PX(task_steps, hints, solution, criteria, execution):
    p = P(task_steps, hints, solution, criteria)
    p["execution"] = execution
    return p
