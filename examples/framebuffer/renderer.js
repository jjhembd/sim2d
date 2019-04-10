import { shaderSrc } from "./shaders/shaders.js";
import * as yawgl from 'yawgl';
import * as sim2d from "../../dist/sim2d.bundle.js";

export function initRenderer(canvas) {
  var gl = canvas.getContext("webgl");

  // Make sure drawingbuffer matches CSS displayed size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Initialize shader program
  const progInfo = yawgl.initShaderProgram(gl, shaderSrc.vert, shaderSrc.frag);

  // Load data into GPU for shaders: attribute buffers, indices, texture
  const buffers = yawgl.initQuadBuffers(gl);
  const texture = yawgl.initTexture(gl, gl.canvas.width, gl.canvas.height);

  // Store links to uniforms
  const uniforms = {
    uTextureSampler: texture.sampler,
  };

  // Create simulated 2D canvas as wrapper on a WebGL framebuffer
  const fb = gl.createFramebuffer();
  // Attach the texture
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, texture.sampler, level);

  const ctx2d = sim2d.initSim2d(gl, fb);

  // Return simulated 2D context for use as a render target
  // Also return draw method to render the texture to the canvas
  return {
    ctx2d,
    draw,
  };

  function draw() {
    yawgl.drawScene(gl, progInfo, buffers, uniforms);
    return;
  }
}
