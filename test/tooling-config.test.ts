import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  scripts?: Record<string, string>;
};

function readPackageJson(): PackageJson {
  const filePath = path.resolve(process.cwd(), 'package.json');
  const fileContent = readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent) as PackageJson;
}

describe('tooling configuration', () => {
  it('defines the required quality scripts', () => {
    const packageJson = readPackageJson();

    expect(packageJson.scripts?.lint).toBeDefined();
    expect(packageJson.scripts?.['format:check']).toBeDefined();
    expect(packageJson.scripts?.prepare).toBeDefined();
  });

  it('includes pre-commit and CI files', () => {
    const preCommitPath = path.resolve(process.cwd(), '.husky/pre-commit');
    const workflowPath = path.resolve(
      process.cwd(),
      '.github/workflows/ci.yml',
    );

    expect(existsSync(preCommitPath)).toBe(true);
    expect(existsSync(workflowPath)).toBe(true);
  });
});
