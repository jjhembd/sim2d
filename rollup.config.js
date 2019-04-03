import resolve from 'rollup-plugin-node-resolve';

// Plugin for .glsl files, roughly following the rollup.config.js in three.js
// with some guidance from github.com/vwochnik/rollup-plugin-glsl
// and rollupjs.org/guide/en#plugins-overview
function glsl() {
  return {
    transform( source, id ) { // Too much indentation? Follows three.js...
      // Confirm filename extension is .glsl -- follows three.js
      if ( /\.glsl$/.test( id ) === false ) return;

      // This line follows vwochnik's generateCode()
      const code = `export default ${JSON.stringify(source)};`;
      //const code = `${source}`;

      return {
        code: code,
        map: { mappings: '' }, // No map -- follows three.js
      };
    }
  };
}

export default {
  input: 'src/main.js',
  plugins: [
    glsl(),
    resolve(),
  ],
  output: {
    file: 'build/sim2d.bundle.js',
    //sourcemap: 'inline',
    format: 'esm',
    name: 'sim2d'
  }
};
