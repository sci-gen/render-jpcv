import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { buildPdf } from './compiler';

type RenderDate = { year: number; month: number; day: number };

const ARCHIVE_DIRNAME = 'archive';

function parseDateFromResumeFilename(filePath: string): RenderDate | null {
  const base = path.basename(filePath);
  const match = base.match(/^resume-(\d{4})(\d{2})(\d{2})(?:-\d+)?\.(ya?ml)$/i);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  return { year, month, day };
}

function parseDateFromIsoDateString(value: unknown): RenderDate | null {
  // js-yaml may parse YYYY-MM-DD as a Date
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
  }

  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  return { year, month, day };
}

async function readRenderDateFromYaml(filePath: string): Promise<RenderDate | null> {
  const raw = await fs.readFile(filePath, 'utf8');
  const doc = yaml.load(raw);
  if (!doc || typeof doc !== 'object') return null;

  const config = (doc as any).config;
  if (!config || typeof config !== 'object') return null;

  return parseDateFromIsoDateString((config as any).render_date);
}

async function resolveInputYaml(rootDir: string, yamlArg?: string): Promise<string> {
  if (yamlArg) {
    const resolved = path.isAbsolute(yamlArg) ? yamlArg : path.join(rootDir, yamlArg);
    if (!(await fs.pathExists(resolved))) {
      throw new Error(`YAML not found: ${resolved}`);
    }
    return resolved;
  }

  const defaultYaml = path.join(rootDir, 'resume.yaml');
  if (await fs.pathExists(defaultYaml)) return defaultYaml;

  throw new Error(
    'resume.yaml not found. Create it (run `render-jpcv init`) or pass an archive file to `render-jpcv build <yaml>` (e.g. archive/resume-20260101.yaml).'
  );
}

async function findLatestDatedResumeYaml(rootDir: string): Promise<string | null> {
  const dirs = [rootDir, path.join(rootDir, ARCHIVE_DIRNAME)];
  const candidates: string[] = [];

  for (const dir of dirs) {
    if (!(await fs.pathExists(dir))) continue;
    const entries = await fs.readdir(dir);
    for (const name of entries) {
      if (/^resume-\d{8}(?:-\d+)?\.ya?ml$/i.test(name)) {
        candidates.push(path.join(dir, name));
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  return candidates[candidates.length - 1];
}

function buildInfoTyp(date: RenderDate): string {
  return (
    '// build-info.typ\n' +
    '// This file is overwritten by render-jpcv at build time.\n' +
    `#let render_date = (year: ${date.year}, month: ${date.month}, day: ${date.day},)\n`
  );
}

function toYyyyMmDd(date: RenderDate): string {
  const mm = String(date.month).padStart(2, '0');
  const dd = String(date.day).padStart(2, '0');
  return `${date.year}-${mm}-${dd}`;
}

function toYyyyMmDdCompact(date: RenderDate): string {
  return toYyyyMmDd(date).replace(/-/g, '');
}

async function nextArchiveYamlPath(archiveDir: string, compactDate: string): Promise<string> {
  const baseName = `resume-${compactDate}`;
  const primary = path.join(archiveDir, `${baseName}.yaml`);
  if (!(await fs.pathExists(primary))) return primary;

  for (let i = 2; i < 10_000; i++) {
    const candidate = path.join(archiveDir, `${baseName}-${i}.yaml`);
    if (!(await fs.pathExists(candidate))) return candidate;
  }

  throw new Error('Could not find an available archive filename (too many existing files).');
}

async function copyAssetsToHiddenDir(rootDir: string): Promise<void> {
  const hiddenDir = path.join(rootDir, '.render-jpcv');
  await fs.ensureDir(hiddenDir);

  const templateSrc = path.join(__dirname, '..', 'assets', 'template.typ');
  const buildInfoSrc = path.join(__dirname, '..', 'assets', 'build-info.typ');
  const eraSrc = path.join(__dirname, '..', 'assets', 'era.typ');

  await fs.copy(templateSrc, path.join(hiddenDir, 'template.typ'));
  await fs.copy(buildInfoSrc, path.join(hiddenDir, 'build-info.typ'));
  await fs.copy(eraSrc, path.join(hiddenDir, 'era.typ'));
}

export async function main(argv = process.argv) {
  const program = new Command();
  program.name('render-jpcv').description('RenderJPCV CLI');

  program
    .command('init')
    .description('Generate resume.yaml and copy template into .render-jpcv')
    .action(async () => {
      const rootDir = process.cwd();
      await copyAssetsToHiddenDir(rootDir);

      const yamlPath = path.join(rootDir, 'resume.yaml');
      if (!(await fs.pathExists(yamlPath))) {
        const latestDated = await findLatestDatedResumeYaml(rootDir);
        if (latestDated) {
          await fs.copy(latestDated, yamlPath);
          console.log(`✅ Created: resume.yaml (copied from ${path.basename(latestDated)})`);
        } else {
          const now = new Date();
          const today: RenderDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
          const initialData =
            `config:\n  font_size: 11pt\n  year_style: seireki\n  render_date: ${toYyyyMmDd(today)}\n` +
            `profile:\n  name: 氏名を入力\n  name_kana: ふりがな\n  birthday: 2000-01-01\n  address: 東京都\n`;
          await fs.outputFile(yamlPath, initialData, 'utf8');
          console.log('✅ Created: resume.yaml');
        }
      } else {
        console.log('resume.yaml already exists — skipping creation');
      }

      // テンプレから参照しやすいように、.render-jpcv/resume.yaml に同期
      await fs.copy(yamlPath, path.join(rootDir, '.render-jpcv', 'resume.yaml'));

      console.log('✨ Setup complete! Edit resume.yaml and run "render-jpcv build"');
    });

  program
    .command('archive [yamlFile]')
    .description('Create an archive copy under archive/: resume-YYYYMMDD(-N).yaml (date comes from config.render_date)')
    .action(async (yamlFile?: string) => {
      const rootDir = process.cwd();
      const inputYaml = await resolveInputYaml(rootDir, yamlFile);

      const renderDate = await readRenderDateFromYaml(inputYaml);
      if (!renderDate) {
        throw new Error('config.render_date is missing or invalid. Set it to "YYYY-MM-DD" in your YAML (e.g. 2026-01-01).');
      }

      const archiveDir = path.join(rootDir, ARCHIVE_DIRNAME);
      await fs.ensureDir(archiveDir);

      const compact = toYyyyMmDdCompact(renderDate);
      const archivePath = await nextArchiveYamlPath(archiveDir, compact);

      await fs.copy(inputYaml, archivePath);

      const rel = path.relative(rootDir, archivePath);
      console.log(`✅ Archived: ${rel}`);
      console.log(`Next: render-jpcv build ${rel}`);
    });

  program
    .command('build [yamlFile]')
    .description('Build a PDF from YAML and template')
    .action(async (yamlFile?: string) => {
      const rootDir = process.cwd();

      // テンプレが無ければエラーにする（UX的に明示）
      const mainTyp = path.join(rootDir, '.render-jpcv', 'template.typ');
      if (!(await fs.pathExists(mainTyp))) {
        throw new Error(`Template not found: ${mainTyp}. Run 'render-jpcv init' first.`);
      }

      const inputYaml = await resolveInputYaml(rootDir, yamlFile);
      await fs.copy(inputYaml, path.join(rootDir, '.render-jpcv', 'resume.yaml'));

      const fromYaml = await readRenderDateFromYaml(inputYaml);
      const fromFilename = parseDateFromResumeFilename(inputYaml);
      const now = new Date();
      const fromNow: RenderDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
      const renderDate: RenderDate = fromYaml ?? fromFilename ?? fromNow;
      await fs.outputFile(path.join(rootDir, '.render-jpcv', 'build-info.typ'), buildInfoTyp(renderDate), 'utf8');

      const base = path.basename(inputYaml).replace(/\.(ya?ml)$/i, '');
      const outPdfName = base === 'resume' ? 'resume.pdf' : `${base}.pdf`;
      const outPdfPath = base === 'resume' ? path.join(rootDir, outPdfName) : path.join(path.dirname(inputYaml), outPdfName);

      await buildPdf(rootDir, outPdfPath);
      console.log(`🎉 Generated: ${path.relative(rootDir, outPdfPath)}`);
    });

  await program.parseAsync(argv);
}

// Execute when invoked as a CLI
main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
