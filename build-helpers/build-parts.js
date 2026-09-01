const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const esbuild = require('esbuild');
const sass = require('sass');
const buildConfig = require('../../2sxc-ui/packages/2sxc-load-build-config').BuildConfig;
const setExternalSourceMap = require('./external-source-maps-elements');

const root = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const partsArg = process.argv.find(arg => arg.startsWith('--parts='));
const production = args.has('--production');
const watch = args.has('--watch');
const copy = !args.has('--no-copy');
const selected = (partsArg?.slice('--parts='.length) ?? '').split(',');
const parts = selected.includes('all') ? ['wysiwyg', 'gps'] : selected;

if (!partsArg || parts.some(part => !['wysiwyg', 'gps'].includes(part))) {
  throw new Error('Specify --parts=all, --parts=wysiwyg, --parts=gps, or a comma-separated combination.');
}

const definitions = {
  gps: {
    project: 'field-custom-gps',
    entries: ['src/main/main.ts', 'src/preview/preview.ts'],
  },
  wysiwyg: {
    project: 'field-string-wysiwyg',
    entries: [
      'src/field-string-wysiwyg/field-string-wysiwyg.ts',
      'src/field-string-wysiwyg/field-string-wysiwyg-preview.ts',
      'src/field-string-wysiwyg/field-string-wysiwyg-editor.ts',
    ],
    copy: [
      ['src/i18n', 'i18n'],
      ['src/assets/2sxc-tinymce-skin', '.'],
    ],
  },
};

const sassTextPlugin = {
  name: 'sass-as-text',
  setup(build) {
    build.onLoad({ filter: /\.s[ac]ss$/ }, async ({ path: file }) => {
      const result = await sass.compileAsync(file, { loadPaths: [path.dirname(file)] });
      return { contents: result.css, loader: 'text', watchFiles: [...result.loadedUrls].map(fileURLToPath) };
    });
  },
};

function copyDirectory(source, target) {
  if (fs.existsSync(source)) fs.cpSync(source, target, { recursive: true, force: true });
}

function copyToTargets(output, project) {
  for (const target of [...buildConfig.Sources, ...buildConfig.JsTargets]) {
    copyDirectory(output, path.join(target, 'extensions', project));
  }
}

async function buildPart(name) {
  const definition = definitions[name];
  const projectRoot = path.join(root, 'projects', definition.project);
  const output = path.join(root, 'dist', 'extensions', definition.project);
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });

  const copyAssets = () => {
    for (const [source, target] of definition.copy ?? []) {
      copyDirectory(path.join(projectRoot, source), path.join(output, target));
    }
  };

  const afterBuildPlugin = {
    name: 'copy-build-output',
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length) 
          return;
        copyAssets();
        if (production) {
          const bundle = path.join(output, 'index.js');
          setExternalSourceMap(bundle, `/extensions/${definition.project}/`);
        }
        if (copy) copyToTargets(output, definition.project);
        console.log(`Built ${name} to ${path.relative(root, output)}`);
      });
    },
  };

  const context = await esbuild.context({
    absWorkingDir: projectRoot,
    stdin: {
      contents: definition.entries.map(entry => `import './${entry.replaceAll('\\', '/')}';`).join('\n'),
      resolveDir: projectRoot,
      sourcefile: `${name}-entries.ts`,
      loader: 'ts',
    },
    outfile: path.join(output, 'index.js'),
    bundle: true,
    define: { __PRODUCTION__: JSON.stringify(production) },
    loader: { '.html': 'text', '.css': 'text', '.svg': 'text', '.rawts': 'text' },
    minify: production,
    plugins: [sassTextPlugin, afterBuildPlugin],
    sourcemap: production ? 'external' : true,
    sourcesContent: true,
    target: 'es2022',
    tsconfig: path.join(projectRoot, 'tsconfig.json'),
  });

  if (watch) 
    await context.watch();
  else {
    await context.rebuild();
    await context.dispose();
  }
}

Promise.all(parts.map(buildPart)).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
