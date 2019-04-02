attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform vec2 sourceOrigin; // sx, sy
uniform vec2 sourceScale;  // sWidth, sHeight
uniform vec2 destOrigin;   // dx, dy
uniform vec2 destScale;    // dWidth, dHeight

varying highp vec2 vTexCoord;

void main(void) {
  vTexCoord = aTexCoord * sourceScale + sourceOrigin;
  gl_Position = vec4(
      aVertexPosition.x * destScale.x + destOrigin.x,
      aVertexPosition.y * destScale.y + destOrigin.y,
      aVertexPosition.z,
      aVertexPosition.w
      );
}
