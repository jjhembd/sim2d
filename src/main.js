'use strict';

import * as yawgl from 'yawgl';
import { quadShaders as shaderSrc } from "./shaders/quadShaders.js";

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

  // Initialize shader program
  const progInfo = yawgl.initShaderProgram(gl, shaderSrc.vert, shaderSrc.frag);

  // Load data into GPU for shaders: attribute buffers, indices
  const buffers = yawgl.initQuadBuffers(gl);
  // Initialize texture for rendering images to framebuffer. Size is arbitrary?
  const texture = yawgl.initTexture(gl, canvas.width, canvas.height);

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

    // Set source origin/scale: which part of the image to read
    // Image coordinates are from 0 to 1, top left to bottom right
    uniforms.uSourceOrigin[0] = sx / image.width;
    uniforms.uSourceOrigin[1] = sy / image.height;
    uniforms.uSourceScale[0] = sWidth / image.width;
    uniforms.uSourceScale[1] = sHeight / image.height;

    // Set destination origin/scale: where on the canvas to write
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
    // TODO: Not necessary with no depth test? What about transparency?
    //clearRect(dx, dy, dWidth, dHeight);

    draw(image);

    return;
  }

  function draw(image) {
    // Load image into texture
    texture.replace( image );  // TODO: this uses mipmaps--inefficient?

    // Make sure we are going to the correct framebuffer
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Set viewport. NOTE: no scissor test!
    gl.viewport(0, 0, canvas.width, canvas.height);

    yawgl.drawOver( gl, progInfo, buffers, uniforms );

    // Unbind framebuffer, so later calls will go to the canvas
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return;
  }

  function clearRect(x, y, width, height) {
    // Flip the y-axis to be consistent with WebGL coordinates
    var yflip = canvas.height - y - height;

    // Make sure we are working with the right framebuffer
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    yawgl.clearRect(gl, x, yflip, width, height);
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return;
  }
}
