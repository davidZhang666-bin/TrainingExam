import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const commits = git('log', '--format=%H%x09%s').split('\n');
const errors = [];
if (commits.length !== 30) errors.push(`Expected 30 commits, found ${commits.length}.`);
for (const commit of commits) {
  const [hash, subject] = commit.split('\t');
  if (
    !/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\([a-z0-9_-]+\))?!?: .+/.test(
      subject,
    )
  )
    errors.push(`Invalid commit message: ${subject}`);
  if (!git('diff-tree', '--root', '--no-commit-id', '--name-only', '-r', hash))
    errors.push(`Empty commit: ${hash}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log('Verified 30 non-empty commits with Conventional Commits messages.');
