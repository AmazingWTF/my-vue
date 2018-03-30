import rollupPluginBabel from 'rollup-plugin-babel'
import rollupPluginCommonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/vue.js',
  output: {
    file: 'dist/vue.js',
    format: 'cjs'
  },
  plugins: [
    rollupPluginCommonjs(),
    rollupPluginBabel()
  ]
}