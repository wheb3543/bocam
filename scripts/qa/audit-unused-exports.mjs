import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sourceRoot = path.join(root, 'client', 'src');
const reportPath = path.join(root, 'docs', 'UNUSED_EXPORTS_AUDIT.md');
const jsonPath = path.join(root, 'docs', 'UNUSED_EXPORTS_AUDIT.json');
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const excludedDirectories = new Set(['node_modules', 'dist', 'coverage']);
const auditedDirectories = [path.join(sourceRoot, 'components'), path.join(sourceRoot, 'hooks')];

function walk(directory) {
  const files = [];
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(entryPath));
    else if (entry.isFile() && sourceExtensions.includes(path.extname(entry.name)))
      files.push(entryPath);
  }
  return files;
}

function isTestFile(filePath) {
  return /\.(test|spec)\.[^.]+$/.test(filePath);
}

function hasExportModifier(node) {
  return !!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function hasDefaultModifier(node) {
  return !!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function relativePath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function resolveModule(fromFile, moduleName) {
  let candidate;
  if (moduleName.startsWith('@/')) candidate = path.join(sourceRoot, moduleName.slice(2));
  else if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
    candidate = path.resolve(path.dirname(fromFile), moduleName);
  } else return null;

  const candidates = [];
  for (const extension of sourceExtensions) candidates.push(`${candidate}${extension}`);
  for (const extension of sourceExtensions)
    candidates.push(path.join(candidate, `index${extension}`));
  return candidates.find((filePath) => fs.existsSync(filePath)) ?? null;
}

function collectExports(filePath, sourceFile) {
  const exports = [];
  const add = (name, node, kind) =>
    exports.push({
      file: relativePath(filePath),
      absoluteFile: filePath,
      name,
      kind,
      line: lineOf(sourceFile, node),
      position: node.getStart(sourceFile),
    });

  sourceFile.forEachChild((node) => {
    if (ts.isExportAssignment(node)) {
      add('default', node, 'default');
      return;
    }
    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) add(declaration.name.text, declaration, 'variable');
      }
      return;
    }
    if (hasExportModifier(node)) {
      if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
        add(
          hasDefaultModifier(node) ? 'default' : (node.name?.text ?? 'default'),
          node,
          hasDefaultModifier(node)
            ? 'default'
            : ts.isFunctionDeclaration(node)
              ? 'function'
              : 'class'
        );
      } else if (
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node)
      ) {
        add(node.name.text, node, ts.SyntaxKind[node.kind]);
      }
    }
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) {
        add(element.name.text, element, 're-export');
      }
    }
  });

  return exports;
}

function collectSourceFiles() {
  return [...new Set(auditedDirectories.flatMap(walk))];
}

function addSignal(signals, key, signal) {
  if (!signals.has(key)) signals.set(key, []);
  signals.get(key).push(signal);
}

function audit() {
  const files = collectSourceFiles();
  const allClientFiles = walk(sourceRoot);
  const sourceFiles = new Map(
    allClientFiles.map((filePath) => [
      filePath,
      ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      ),
    ])
  );
  const candidates = files.flatMap((filePath) =>
    collectExports(filePath, sourceFiles.get(filePath))
  );
  const candidateMap = new Map(
    candidates.map((candidate) => [`${candidate.absoluteFile}::${candidate.name}`, candidate])
  );
  const directSignals = new Map();
  const reviewSignals = new Map();
  const textualReferences = new Map();

  for (const [filePath, sourceFile] of sourceFiles) {
    const source = sourceFile.getFullText();
    const isAuditedFile = candidateMap.has(`${filePath}::${source}`);
    void isAuditedFile;

    sourceFile.forEachChild((node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const importedFile = resolveModule(filePath, node.moduleSpecifier.text);
        if (!importedFile) return;
        const clause = node.importClause;
        if (!clause) return;
        if (clause.name)
          addSignal(
            directSignals,
            `${importedFile}::default`,
            `static default import from ${relativePath(filePath)}`
          );
        if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
          for (const candidate of candidates.filter((item) => item.absoluteFile === importedFile)) {
            addSignal(
              directSignals,
              `${importedFile}::${candidate.name}`,
              `static namespace import from ${relativePath(filePath)}`
            );
          }
        }
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) {
            const importedName = element.propertyName?.text ?? element.name.text;
            addSignal(
              directSignals,
              `${importedFile}::${importedName}`,
              `static named import from ${relativePath(filePath)}`
            );
          }
        }
      }

      if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const importedFile = resolveModule(filePath, node.moduleSpecifier.text);
        if (!importedFile) return;
        if (!node.exportClause) {
          for (const candidate of candidates.filter((item) => item.absoluteFile === importedFile)) {
            addSignal(
              reviewSignals,
              `${importedFile}::${candidate.name}`,
              `barrel export * from ${relativePath(filePath)}`
            );
          }
        } else if (ts.isNamedExports(node.exportClause)) {
          for (const element of node.exportClause.elements) {
            const importedName = element.propertyName?.text ?? element.name.text;
            addSignal(
              reviewSignals,
              `${importedFile}::${importedName}`,
              `barrel named export from ${relativePath(filePath)}`
            );
          }
        }
      }
    });

    for (const match of source.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const importedFile = resolveModule(filePath, match[1]);
      if (!importedFile) continue;
      for (const candidate of candidates.filter((item) => item.absoluteFile === importedFile)) {
        addSignal(
          reviewSignals,
          `${importedFile}::${candidate.name}`,
          `dynamic import from ${relativePath(filePath)}`
        );
      }
    }

    function visit(node) {
      if (ts.isIdentifier(node)) {
        const key = `${filePath}::${node.text}`;
        const candidate = candidateMap.get(key);
        if (!candidate) {
          for (const item of candidates) {
            if (item.name !== node.text || item.absoluteFile === filePath) continue;
            const referenceKey = `${item.absoluteFile}::${item.name}`;
            if (!textualReferences.has(referenceKey)) textualReferences.set(referenceKey, []);
            textualReferences
              .get(referenceKey)
              .push(`identifier reference in ${relativePath(filePath)}`);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  const results = candidates.map((candidate) => {
    const key = `${candidate.absoluteFile}::${candidate.name}`;
    const direct = directSignals.get(key) ?? [];
    const review = reviewSignals.get(key) ?? [];
    const textual = textualReferences.get(key) ?? [];
    const definingSourceFile = sourceFiles.get(candidate.absoluteFile);
    let sameFileReferences = 0;
    if (definingSourceFile) {
      function countReferences(node) {
        if (
          ts.isIdentifier(node) &&
          node.text === candidate.name &&
          node.getStart(definingSourceFile) !== candidate.position
        ) {
          sameFileReferences += 1;
        }
        ts.forEachChild(node, countReferences);
      }
      countReferences(definingSourceFile);
    }
    let classification = 'used';
    let reason = 'has a static import reference';
    if (direct.length === 0 && (review.length > 0 || textual.length > 0)) {
      classification = 'needs-review';
      reason = [...review, ...textual].join('; ');
    } else if (direct.length === 0 && candidate.kind === 're-export') {
      classification = 'needs-review';
      reason = 're-export may be consumed through a directory or package entry point';
    } else if (direct.length === 0) {
      classification = 'confirmed-unused';
      reason =
        'no static import, barrel export, dynamic import, or external identifier reference found';
    }
    let decision = 'retain: external usage is detected';
    if (classification === 'needs-review') {
      decision = 'retain: indirect or barrel usage requires owner review';
    } else if (classification === 'confirmed-unused' && sameFileReferences > 0) {
      decision = 'retain code: used inside its defining file; review whether export is redundant';
    } else if (classification === 'confirmed-unused') {
      decision = 'candidate for removal: no repository usage found; owner approval required';
    }
    return {
      file: candidate.file,
      export: candidate.name,
      kind: candidate.kind,
      line: candidate.line,
      classification,
      sameFileReferences,
      decision,
      reason,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    scope: 'client/src/components and client/src/hooks source exports',
    candidates: results,
    summary: {
      total: results.length,
      used: results.filter((item) => item.classification === 'used').length,
      needsReview: results.filter((item) => item.classification === 'needs-review').length,
      confirmedUnused: results.filter((item) => item.classification === 'confirmed-unused').length,
      internalOnly: results.filter(
        (item) => item.classification === 'confirmed-unused' && item.sameFileReferences > 0
      ).length,
      sourceFiles: files.length,
    },
  };
}

function renderReport(report) {
  const grouped = (classification) =>
    report.candidates.filter((item) => item.classification === classification);
  const renderRows = (items) =>
    items.length === 0
      ? '| لا توجد نتائج | - | - | - | - |\n'
      : items
          .map(
            (item) =>
              `| [${item.file}](../${item.file}#L${item.line}) | \`${item.export}\` | ${item.kind} | ${item.decision} | ${item.reason} |`
          )
          .join('\n');
  return `# تدقيق التصديرات غير المستخدمة

> تقرير مولد آليًا بواسطة \`pnpm exports:audit\`. لا يتم حذف أي كود تلقائيًا.

**آخر تحليل:** ${report.generatedAt}  
**النطاق:** ${report.scope}

## الملخص

| التصنيف | العدد |
|---|---:|
| مستخدم | ${report.summary.used} |
| يحتاج مراجعة | ${report.summary.needsReview} |
| غير مستخدم مؤكد | ${report.summary.confirmedUnused} |
| مستخدم داخل الملف فقط (export زائد محتمل) | ${report.summary.internalOnly} |
| إجمالي التصديرات المفحوصة | ${report.summary.total} |
| ملفات المصدر المفحوصة | ${report.summary.sourceFiles} |

## غير مستخدم مؤكد

هذه النتائج لم يظهر لها أي استيراد ثابت أو تصدير barrel أو import ديناميكي أو مرجع معرف خارجي في نطاق الفحص. لا تحذفها قبل مراجعة بشرية أخيرة.

| الملف | التصدير | النوع | القرار | الدليل |
|---|---|---|---|---|
${renderRows(grouped('confirmed-unused'))}

## يحتاج مراجعة

هذه النتائج لها إشارة غير مباشرة أو استخدام قد لا يلتقطه التحليل البسيط، مثل barrel exports أو dynamic imports أو مراجع اسمية. لا تعتبر غير مستخدمة.

| الملف | التصدير | النوع | القرار | الدليل |
|---|---|---|---|---|
${renderRows(grouped('needs-review'))}

## منهجية وحدود

- يستخدم التحليل TypeScript AST ويدعم imports النسبية وalias \`@/\`.
- يفحص named imports وdefault imports وnamespace imports وbarrel exports وdynamic imports.
- التصديرات التي لا تظهر لها أي إشارة تصنف “غير مستخدم مؤكد” داخل النطاق المحدد فقط.
- لا يفحص استخدامًا وقت التشغيل عبر نصوص خارجية أو تسجيلات ديناميكية أو إعدادات CMS.
- هذا التقرير أداة فرز ومراجعة، وليس تفويضًا آليًا لحذف الكود.
- التصدير المستخدم داخل ملفه فقط لا يصنف ككود ميت؛ يسجل كـ “export زائد” يحتاج قرارًا منفصلًا.
`;
}

const report = audit();
const mode = process.argv[2] ?? 'audit';
if (mode === 'check') {
  if (!fs.existsSync(jsonPath)) {
    console.error(`Missing ${relativePath(jsonPath)}. Run pnpm exports:audit first.`);
    process.exit(1);
  }
  const previous = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const currentConfirmed = report.candidates
    .filter((item) => item.classification === 'confirmed-unused')
    .map((item) => `${item.file}::${item.export}`)
    .sort();
  const previousConfirmed = previous.candidates
    .filter((item) => item.classification === 'confirmed-unused')
    .map((item) => `${item.file}::${item.export}`)
    .sort();
  if (JSON.stringify(currentConfirmed) !== JSON.stringify(previousConfirmed)) {
    console.error('Confirmed-unused export list changed. Review and regenerate the audit report.');
    process.exit(1);
  }
  console.log('Unused export audit is unchanged.');
} else {
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportPath, renderReport(report));
  console.log(`Generated ${relativePath(jsonPath)} and ${relativePath(reportPath)}`);
}
