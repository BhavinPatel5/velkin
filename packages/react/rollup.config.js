import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: path.join(__dirname, 'src', 'index.ts'),
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    // ensures dist/index.js (not dist/index/index.js)
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js'
  },
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js'],
      dedupe: ['react', 'react-dom', '@velkin/ui']
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react-jsx',
      declaration: true,
      declarationMap: false,
      rootDir: 'src',
      outDir: 'dist',
      emitDeclarationOnly: false,
      compilerOptions: {
        noEmitOnError: false,
      },
    }),
    terser()
  ],
  external: id => !id.startsWith('.') && !path.isAbsolute(id)
};
