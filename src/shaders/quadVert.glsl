attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform vec2 uSourceOrigin; // sx, sy
uniform vec2 uSourceScale;  // sWidth, sHeight
uniform vec2 uDestOrigin;   // dx, dy
uniform vec2 uDestScale;    // dWidth, dHeight

varying highp vec2 vTexCoord;

void main(void) {
  vTexCoord = aTexCoord * uSourceScale + uSourceOrigin;
  gl_Position = vec4(
      aVertexPosition.x * uDestScale.x + uDestOrigin.x,
      aVertexPosition.y * uDestScale.y + uDestOrigin.y,
      aVertexPosition.z,
      aVertexPosition.w
      );
}
