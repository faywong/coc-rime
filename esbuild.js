/* eslint-disable @typescript-eslint/no-var-requires */
async function start() {
  await require('esbuild').build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV === 'development',
    mainFields: ['module', 'main'],
    external: ['coc.nvim', 'node:os'],
    platform: 'node',
    target: 'node10.12',
    outfile: 'lib/index.js',
  });
}

start()
  .then((r) => {
    if (process.argv.length > 2 && process.argv[2] === '--watch') {
      r.watch();
    }
  })
  .catch((e) => {
    console.error(e);
  });
