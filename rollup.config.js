import rollupPluginBabel from 'rollup-plugin-babel'
import rollupPluginCommonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/core/observer/watcher.js',
  output: {
    file: 'dist/watcher.js',
    format: 'cjs'
  },
  plugins: [
    rollupPluginCommonjs(),
    rollupPluginBabel()
  ]
}