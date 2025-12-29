import * as path from 'path';
import * as fs from 'fs-extra';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';

export async function buildPdf(rootDir: string, outFile = 'resume.pdf') {
  const mainTyp = path.join(rootDir, '.render-jpcv', 'template.typ');
  if (!(await fs.pathExists(mainTyp))) {
    throw new Error(`Template not found: ${mainTyp}. Run 'render-jpcv init' first.`);
  }

  // `NodeCompiler.create` is sync in this package version.
  const compiler = NodeCompiler.create({ workspace: rootDir });
  const compileArgs = { mainFilePath: mainTyp };

  const compileResult = compiler.compile(compileArgs);
  const diagnostics = compileResult.takeDiagnostics();
  const warnings = compileResult.takeWarnings();

  if (warnings) {
    console.warn('⚠️ Warnings:', warnings.shortDiagnostics);
  }

  if (diagnostics) {
    const status = diagnostics.compilationStatus;
    if (status === 'error' || status === 'internal_error') {
      throw new Error(`Typst compilation failed (${status}): ${JSON.stringify(diagnostics.shortDiagnostics)}`);
    }
  }

  const doc = compileResult.result;
  if (!doc) {
    throw new Error('Typst compilation returned no document (result is null).');
  }

  const pdf = compiler.pdf(doc);
  const outPath = path.isAbsolute(outFile) ? outFile : path.join(rootDir, outFile);
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, pdf);
}
