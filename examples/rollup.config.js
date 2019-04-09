import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'js/main.js',
  plugins: [
    resolve(),
  ],
  output: {
    file: 'js/main.min.js',
    format: 'iife',
    name: 'sim2dTest'
  }
};
