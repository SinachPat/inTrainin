import { defineConfig } from 'tsup'

export default defineConfig({
  entry:      ['src/index.ts'],
  format:     ['esm'],
  outDir:     'dist',
  splitting:  false,
  // Bundle workspace packages — they are TypeScript source, not published npm packages,
  // so they will not exist in node_modules at runtime on Render.
  noExternal: ['@intrainin/shared', '@intrainin/db', '@intrainin/emails'],
})
