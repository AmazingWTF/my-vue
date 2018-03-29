import rollupPluginBabel from 'rollup-plugin-babel'

export default {
  input: 'src/vue.js',
  output: {
    file: 'dist/vue.js',
    format: 'cjs'
  },
  plugins: [
    rollupPluginBabel()
  ]
}