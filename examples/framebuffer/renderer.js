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

  // Load data into GPU for shaders: attribute buffers, indices
  const buffers = yawgl.initQuadBuffers(gl);

  // Create simulated 2D canvas as wrapper on a WebGL framebuffer
  const ctx2d = sim2d.canvas2dWrappingFramebuffer(gl, 
      gl.canvas.width, gl.canvas.height);

  // Store links to uniforms
  const uniforms = {
    uTextureSampler: ctx2d.renderedTexture,
  };

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
