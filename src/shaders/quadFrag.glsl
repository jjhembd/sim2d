precision highp float;
precision highp sampler2D;

varying vec2 vTexCoord;

uniform sampler2D uTextureSampler;

void main(void) {
  gl_FragColor = texture2D(uTextureSampler, vTexCoord);
}
