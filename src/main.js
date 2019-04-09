'use strict';

import * as yawgl from 'yawgl';
import { quadShaders as shaderSrc } from "./shaders/quadShaders.js";

export function initSim2d(gl) {
  // NOTE: ASSUMES canvas drawingbuffer has already been resized as needed
  const canvas = gl.canvas;

  // Initialize shader program
  const progInfo = yawgl.initShaderProgram(gl, shaderSrc.vert, shaderSrc.frag);

  // Load data into GPU for shaders: attribute buffers, indices, texture
  const buffers = yawgl.initQuadBuffers(gl);
  const texture = yawgl.initTexture(gl, canvas);

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

    // Set uniforms  TODO: too verbose?
    // Source origin/scale: which part of the image to read
    // Image coordinates are from 0 to 1, top left to bottom right
    uniforms.uSourceOrigin[0] = sx / image.width;
    uniforms.uSourceOrigin[1] = sy / image.height;
    uniforms.uSourceScale[0] = sWidth / image.width;
    uniforms.uSourceScale[1] = sHeight / image.height;

    // Destination origin/scale: where on the canvas to write
    // WebGL canvas coordinates are from -1 to +1, bottom left to top right
    // We can think of the "origin" as the shift of the CENTER of the quad
    // relative to the CENTER of the canvas
    var xscale = dWidth / canvas.width;
    var yscale = dHeight / canvas.height;
    uniforms.uDestOrigin[0] = -1.0 + 2.0 * dx / canvas.width + xscale;
    uniforms.uDestOrigin[1] =  1.0 - 2.0 * dy / canvas.height - yscale;
    uniforms.uDestScale[0] = xscale;
    uniforms.uDestScale[1] = yscale;

    // Clear the area we're about to draw 
    // (we are working in 2D with no z-info, so this is the only way to make
    //  sure we aren't drawing behind something else)
    // TODO: Just disable depth test?
    //clearRect(dx, dy, dWidth, dHeight);

    // Load image into texture
    texture.replace( image );  // TODO: this uses mipmaps--inefficient?

    // Draw the image
    yawgl.drawOver( gl, progInfo, buffers, uniforms );

    return;
  }

  function clearRect(x, y, width, height) {
    // Flip the y-axis to be consistent with WebGL coordinates
    var yflip = canvas.height - y - height;
    yawgl.clearRect(gl, x, yflip, width, height);

    return;
  }
}
