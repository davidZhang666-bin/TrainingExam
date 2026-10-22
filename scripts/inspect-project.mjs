import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import ts from 'typescript';

// Inspect repository-owned code; dependencies, builds, lockfiles and screenshots are excluded.
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter(Boolean);
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.html']);
const codeFiles = [...new Set([...tracked, ...untracked])].filter(
  (file) =>
    extensions.has(extname(file)) &&
    !/(^|\/)(node_modules|dist|coverage|test-results|playwright-report)\//.test(file),
);
const errors = [];
const groups = new Map();
let nonemptyLines = 0;
for (const file of codeFiles) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/).filter((line) => line.trim()).length;
  const extension = extname(file);
  const group = groups.get(extension) ?? { files: 0, nonemptyLines: 0 };
  group.files++;
  group.nonemptyLines += lines;
  groups.set(extension, group);
  nonemptyLines += lines;
  if (extension !== '.css' && extension !== '.html') {
    const kind =
      extension === '.tsx'
        ? ts.ScriptKind.TSX
        : extension === '.ts'
          ? ts.ScriptKind.TS
          : ts.ScriptKind.JS;
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
    for (const diagnostic of parsed.parseDiagnostics) {
      const position = parsed.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      errors.push(
        `${file}:${position.line + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
      );
    }
  }
}
const todo = readFileSync('TODO.md', 'utf8');
const todoCount = (todo.match(/^- \[ \] \*\*TODO-\d{2}\b/gm) ?? []).length;
if (todoCount !== 5) errors.push(`Expected exactly five unfinished features, found ${todoCount}.`);
if (codeFiles.length < 100)
  errors.push(`Expected at least 100 repository-owned code files, found ${codeFiles.length}.`);
for (const file of ['README.md', 'TODO.md', 'docs/QA.md']) {
  if (!readFileSync(file, 'utf8').trim()) errors.push(`Missing content: ${file}`);
}
console.table(Object.fromEntries([...groups].sort(([a], [b]) => a.localeCompare(b))));
console.log(
  JSON.stringify(
    {
      codeFiles: codeFiles.length,
      srcFiles: codeFiles.filter((file) => file.startsWith('src/')).length,
      nonemptyLines,
      untrackedCodeFiles: codeFiles.filter((file) => untracked.includes(file)).length,
      unfinishedFeatures: todoCount,
    },
    null,
    2,
  ),
);
console.log(
  'Line counts include comments and styles. They are local statistics, not platform effective LOC or an admission result.',
);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    'Code syntax, project file count, required documentation and five unfinished features verified.',
  );
