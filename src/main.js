'use strict';

import * as yawgl from 'yawgl';
import { quadShaders as shaderSrc } from "./shaders/quadShaders.js";

export function initSim2d(gl, testImage) {
  const canvas = gl.canvas;

  // Initialize shader program
  const progInfo = yawgl.initShaderProgram(gl, shaderSrc.vert, shaderSrc.frag);

  // Load data into GPU for shaders: attribute buffers, indices, texture
  const buffers = yawgl.initQuadBuffers(gl);
  const texture = yawgl.initTexture(gl, testImage);

  // Store links to uniforms
  const uniforms = {
    uSourceOrigin: new Float64Array(2),
    uSourceScale: new Float64Array(2),
    uDestOrigin: new Float64Array(2),
    uDestScale: new Float64Array(2),
    uTextureSampler: texture.sampler,
  };

  return {
    canvas,
    drawImage,
    clearRect,
  };

  function drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    // Fill in missing parameters. Possible parameter sets:
    // (image, dx, dy)
    // (image, dx, dy, dWidth, dHeight)
    // (image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    // The below logic follows
    // https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html
    if (dx === undefined) {
      dx = sx;
      sx = 0;
    }
    if (dy === undefined) {
      dy = sy;
      sy = 0;
    }
    if (sWidth === undefined) {
      sWidth = image.width;
    }
    if (sHeight === undefined) {
      sHeight = image.height;
    }
    if (dWidth === undefined) {
      dWidth = sWidth;
      sWidth = image.width;
    }
    if (dHeight === undefined) {
      dHeight = sHeight;
      sHeight = image.height;
    }

    // Set uniforms
    uSourceOrigin[0] = sx / image.width;
    uSourceOrigin[1] = sy / image.height;
    uSourceScale[0] = sWidth / image.width;
    uSourceScale[1] = sHeight / image.height;

    uDestOrigin[0] = dx / canvas.width;
    uDestOrigin[1] = dy / canvas.height;
    uDestScale[0] = image.width / canvas.width;
    uDestScale[1] = image.width / canvas.height;

    // Load image into texture
    texture.replace( image );  // TODO: this uses mipmaps--inefficient?

    // Clear the area we're about to draw 
    // (we are working in 2D with no z-info, so this is the only way to make
    //  sure we aren't drawing behind something else)
    clearRect(dx, dy, dWidth, dHeight);

    // Draw the image
    yawgl.drawOver( gl, progInfo, buffers, uniforms );

    return;
  }

  function clearRect(x, y, width, height) {
    // Use the scissor test flow from yawgl. Just need to add the context
    yawgl.clearRect(gl, x, y, width, height);

    return;
  }
}
