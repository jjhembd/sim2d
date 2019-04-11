'use strict';

import * as yawgl from 'yawgl';
import { initRenderer } from "./renderer.js";

export function canvas2dFromWebgl(gl) {
  // Input gl is a WebGLRenderingContext
  const renderer = initRenderer(gl, gl.canvas);

  // Return methods emulating some of the behavior of CanvasRenderingContext2D
  return {
    canvas: gl.canvas,
    drawImage: renderer.drawImage,
    clearRect: renderer.clearRect,
  };
}

export function canvas2dWrappingFramebuffer(gl, framebuffer, fbWidth, fbHeight) {
  // Make sure we have a valid framebuffer
  if ( !(framebuffer instanceof WebGLFramebuffer) ) {
    console.log("sim2d ERROR: no valid framebuffer supplied!");
    return false;
  }

  // Store width and height of framebuffer in an updateable canvas property
  const fbSize = {
    width: fbWidth || gl.canvas.width,
    height: fbHeight || gl.canvas.height,
  };

  // Initialize renderer (returns methods drawImage, clearRect)
  const render = initRenderer(gl, fbSize);

  return {
    canvas: fbSize,
    drawImage,
    clearRect,
  };

  // Wrap render functions with framebuffer bindings
  function drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // TODO: duplicated parameter list is messy
    render.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return;
  }

  function clearRect(x, y, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // TODO: duplicated parameter list is messy
    render.clearRect(x, y, width, height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return;
  }
}
