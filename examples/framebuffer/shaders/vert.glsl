attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

varying highp vec2 vTexCoord;

void main(void) {
  vTexCoord = aTexCoord;
  gl_Position = aVertexPosition;
}
