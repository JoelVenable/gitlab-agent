import * as esbuild from 'esbuild'
import pkg from '../package.json'

const commonConfig: esbuild.BuildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  platform: 'node',
  external: Object.keys(pkg.dependencies),
}

esbuild.build({
  ...commonConfig,
  outfile: 'dist/index.mjs',
  format: 'esm',
})

esbuild.build({
  ...commonConfig,
  outfile: 'dist/index.cjs',
  format: 'cjs',
})

esbuild.build({
  ...commonConfig,
  outfile: 'dist/bin.cjs',
  format: 'cjs',
  entryPoints: ['src/bin.ts'],
})
