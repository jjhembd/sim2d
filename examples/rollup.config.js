import resolve from 'rollup-plugin-node-resolve';
import { glsl } from "../build/glsl-plugin.js";

export default [{
  input: 'basic/main.js',
  plugins: [
    resolve(),
  ],
  output: {
    file: 'basic/main.min.js',
    format: 'iife',
    name: 'sim2dTest'
  },
}, {
  input: 'framebuffer/main.js',
  plugins: [
    resolve(),
    glsl(),
  ],
  output: {
    file: 'framebuffer/main.min.js',
    format: 'iife',
    name: 'sim2dTest',
  },
}];
