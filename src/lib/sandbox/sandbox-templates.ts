import JSZip from 'jszip';
import type { SandboxLanguage } from '@/app/api/code-runner/route';

export type SandboxTemplate = {
  id: SandboxLanguage;
  label: string;
  filename: string;
  starter: string;
  browserNative?: boolean;
};

export const SANDBOX_TEMPLATES: SandboxTemplate[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    filename: 'index.js',
    browserNative: true,
    starter: `// DevAtlas JavaScript Playground (runs directly in browser)
const courses = ['React', 'Next.js', 'TypeScript', 'AI Agents'];
const summary = courses.map((name, i) => \`\${i + 1}. \${name}\`).join('\\n');
console.log('My DevAtlas Roadmap:\\n' + summary);
`,
  },
  {
    id: 'python',
    label: 'Python 3',
    filename: 'main.py',
    starter: `# DevAtlas Python Playground
def greet(name: str) -> str:
    return f"Салом, {name}! Welcome to DevAtlas Python."

for student in ["Аҳмад", "Мадина", "Фарҳод"]:
    print(greet(student))
`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    filename: 'main.ts',
    starter: `type Learner = { name: string; streak: number };

const team: Learner[] = [
  { name: 'Rustam', streak: 14 },
  { name: 'Nigina', streak: 21 },
];

console.log(team.map((l) => \`\${l.name}: \${l.streak} days\`).join('\\n'));
`,
  },
  {
    id: 'cpp',
    label: 'C++',
    filename: 'main.cpp',
    starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {85, 92, 98};
    int sum = 0;
    for (int s : scores) sum += s;
    std::cout << "Average score: " << (sum / scores.size()) << std::endl;
    return 0;
}
`,
  },
  {
    id: 'java',
    label: 'Java',
    filename: 'Main.java',
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from DevAtlas Java!");
    }
}
`,
  },
  {
    id: 'go',
    label: 'Go',
    filename: 'main.go',
    starter: `package main

import "fmt"

func main() {
    fmt.Println("Hello from DevAtlas Go!")
}
`,
  },
  {
    id: 'rust',
    label: 'Rust',
    filename: 'main.rs',
    starter: `fn main() {
    let skills = ["Ownership", "Borrowing", "Async"];
    for s in skills {
        println!("Learning Rust: {}", s);
    }
}
`,
  },
  {
    id: 'csharp',
    label: 'C#',
    filename: 'Program.cs',
    starter: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from DevAtlas C#!");
    }
}
`,
  },
  {
    id: 'php',
    label: 'PHP',
    filename: 'index.php',
    starter: `<?php
$stack = ['PHP 8.4', 'SQL', 'REST API'];
echo "DevAtlas Backend: " . implode(', ', $stack) . PHP_EOL;
`,
  },
  {
    id: 'ruby',
    label: 'Ruby',
    filename: 'main.rb',
    starter: `skills = %w[Ruby APIs Testing]
skills.each_with_index { |s, i| puts "#{i + 1}. #{s}" }
`,
  },
  {
    id: 'bash',
    label: 'Bash',
    filename: 'script.sh',
    starter: `#!/usr/bin/env bash
echo "DevAtlas Bash Runner"
for day in 1 2 3; do
  echo "Day $day complete!"
done
`,
  },
];

export async function createGitHubStarterZip(params: {
  projectName: string;
  language: SandboxLanguage;
  filename: string;
  code: string;
}): Promise<Blob> {
  const safeName =
    params.projectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'devatlas-project';

  const zip = new JSZip();
  zip.file(params.filename, params.code);
  zip.file(
    'README.md',
    `# ${safeName}\n\nBuilt in **DevAtlas Code Sandbox** (${params.language}).\n\n## Quick Start\n\n1. Create a new repository on GitHub.\n2. Upload or push these files:\n\`\`\`bash\ngit init\ngit add .\ngit commit -m "Initial DevAtlas project"\n\`\`\`\n`,
  );
  zip.file('.gitignore', 'node_modules/\n.env\n.env.local\n__pycache__/\n*.class\n*.exe\n');
  return zip.generateAsync({ type: 'blob' });
}

export function runJavaScriptLocally(code: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = (event) => {
        const logs = [];
        const fmt = (v) => {
          if (typeof v === 'string') return v;
          try { return JSON.stringify(v); } catch { return String(v); }
        };
        const console = {
          log: (...args) => logs.push(args.map(fmt).join(' ')),
          warn: (...args) => logs.push(args.map(fmt).join(' ')),
          error: (...args) => logs.push(args.map(fmt).join(' ')),
        };
        try {
          const fn = new Function('console', event.data);
          const result = fn(console);
          if (result !== undefined) logs.push(fmt(result));
          self.postMessage({ stdout: logs.join('\\n'), stderr: '' });
        } catch (err) {
          self.postMessage({ stdout: logs.join('\\n'), stderr: String(err && err.message ? err.message : err) });
        }
      };
    `;
    const blob = new Blob([workerSource], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: '', stderr: 'Execution timed out (3s limit).' });
    }, 3000);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data as { stdout: string; stderr: string });
    };
    worker.onerror = (event) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: '', stderr: event.message || 'Runtime error' });
    };
    worker.postMessage(code);
  });
}
