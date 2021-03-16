const fs = require('fs');
const path = require('path');
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');

module.exports = {
  input: './src/index.ts',
  output: {
    dir: './lib',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    babel({
      exclude: '**/node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      babelHelpers: 'runtime'
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ],
  external: [
    /@babel\/runtime/
  ]
}