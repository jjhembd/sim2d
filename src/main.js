'use strict';

import * as yawgl from 'yawgl';
import { initRenderer } from "./renderer.js";

export function initSim2d(gl, fb, fbWidth, fbHeight) {
  // Store link to the framebuffer
  var haveFB = (fb instanceof WebGLFramebuffer);
  if (!haveFB) console.log("initSim2d WARNING: no framebuffer supplied!");
  const framebuffer = (haveFB)
    ? fb
    : null;  // Default to the canvas framebuffer of the supplied context

  // Store width and height of framebuffer in an updateable canvas property
  var canvas;
  if (!haveFB) {
    // No framebuffer. Use existing context canvas property
    canvas = gl.canvas;
  } else if (fbWidth && fbHeight) {
    // Use supplied values
    canvas = {
      width: fbWidth,
      height: fbHeight,
    };
  } else {
    // Use size of context canvas for now
    canvas = {
      width: gl.canvas.width,
      height: gl.canvas.height,
    };
  }

  // Initialize renderer (returns methods drawImage, clearRect)
  const render = initRenderer(gl, canvas);

  return {
    canvas,
    drawImage,
    clearRect,
  };

  function drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    // If we are rendering to a framebuffer, bind it first
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Pass on the call.  TODO: this is messy
    render.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    // Rebind the default canvas buffer
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return;
  }

  function clearRect(x, y, width, height) {
    // If we are rendering to a framebuffer, bind it first
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Pass on the call to the renderer. TODO: this is messy
    render.clearRect(x, y, width, height);

    // Rebind the default canvas buffer
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return;
  }
}
