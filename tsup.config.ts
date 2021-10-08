import { Options } from 'tsup'

const config: Options = {
  entryPoints: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  clean: true,
}

export default config
