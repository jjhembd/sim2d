attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

varying highp vec2 vTexCoord;

void main(void) {
  vTexCoord.x = aTexCoord.x;
  // Flip texture y-coordinate: 0 to 1 from bottom to top
  vTexCoord.y = 1.0 - aTexCoord.y;
  gl_Position = aVertexPosition;
}
