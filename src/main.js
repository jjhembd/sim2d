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

export function canvas2dWrappingFramebuffer(gl, fbWidth, fbHeight) {
  // Initialize a texture
  const texture = yawgl.initTexture(gl, fbWidth, fbHeight);

  // Create a framebuffer, and attach the texture to it
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, texture.sampler, level);

  // Store width and height of framebuffer in an updateable canvas property
  const fbSize = {
    width: fbWidth,
    height: fbHeight,
  };

  // Initialize renderer (returns methods drawImage, clearRect)
  const renderer = initRenderer(gl, fbSize);

  return {
    canvas: fbSize,
    drawImage,
    clearRect,
    renderedTexture: texture.sampler,
  };

  // Wrap render functions with framebuffer bindings
  function drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // TODO: duplicated parameter list is messy
    renderer.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return;
  }

  function clearRect(x, y, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // TODO: duplicated parameter list is messy
    renderer.clearRect(x, y, width, height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return;
  }
}
