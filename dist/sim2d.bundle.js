// Very similar to greggman's module:
// https://github.com/greggman/webgl-fundamentals/blob/master/webgl/resources/webgl-utils.js
function createAttributeSetters(gl, program) {
  var attribSetters = {};
  var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttribs; i++) {
    var attribInfo = gl.getActiveAttrib(program, i);
    if (!attribInfo) break;
    var index = gl.getAttribLocation(program, attribInfo.name);
    attribSetters[attribInfo.name] = createAttribSetter(gl, index);
  }
  return attribSetters;
}

function createAttribSetter(gl, index) {
  return function(b) {
    // Enable this attribute (shader attributes are disabled by default)
    gl.enableVertexAttribArray(index);
    // Bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
    // Point the attribute in the program to this buffer,
    // and tell the program the byte layout in the buffer
    gl.vertexAttribPointer(
        index,                      // index of attribute in program
        b.numComponents || b.size,  // Number of elements to read per vertex
        b.type || gl.FLOAT,         // Type of each element
        b.normalize || false,       // Whether to normalize it
        b.stride || 0,              // Byte spacing between vertices
        b.offset || 0               // Byte # to start reading from
        );
  };
}

function setBuffersAndAttributes(gl, setters, buffers) {
  setAttributes(setters, buffers.attributes);
  if (buffers.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices.buffer);
  }
}

function setAttributes(setters, attribs) {
  Object.keys(attribs).forEach( function(name) {
    var setter = setters[name];
    if (setter) setter( attribs[name] );
  });
}

// Very similar to greggman's module:
// https://github.com/greggman/webgl-fundamentals/blob/master/webgl/resources/webgl-utils.js
function createUniformSetters(gl, program) {

  var uniformSetters = {};
  var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  // Track texture bindpoint index in case multiple textures are required
  var textureUnit = 0;

  for (let i = 0; i < numUniforms; i++) {
    var uniformInfo = gl.getActiveUniform(program, i);
    if (!uniformInfo) break;

    var name = uniformInfo.name;
    // remove the array suffix added by getActiveUniform
    if (name.substr(-3) === "[0]") {
      name = name.substr(0, name.length - 3);
    }
    var setter = createUniformSetter(program, uniformInfo);
    uniformSetters[name] = setter;
  }
  return uniformSetters;

  // This function must be nested to access the textureUnit index
  function createUniformSetter(program, uniformInfo) {
    var location = gl.getUniformLocation(program, uniformInfo.name);
    var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
    var type = uniformInfo.type;
    switch (type) {
      case gl.FLOAT :
        if (isArray) {
          return function(v) { gl.uniform1fv(location, v); };
        } else {
          return function(v) { gl.uniform1f(location, v); };
        }
      case gl.FLOAT_VEC2 :
        return function(v) { gl.uniform2fv(location, v); };
      case gl.FLOAT_VEC3 :
        return function(v) { gl.uniform3fv(location, v); };
      case gl.FLOAT_VEC4 :
        return function(v) { gl.uniform4fv(location, v); };
      case gl.INT :
        if (isArray) {
          return function(v) { gl.uniform1iv(location, v); };
        } else {
          return function(v) { gl.uniform1i(location, v); };
        }
      case gl.INT_VEC2 :
        return function(v) { gl.uniform2iv(location, v); };
      case gl.INT_VEC3 :
        return function(v) { gl.uniform3iv(location, v); };
      case gl.INT_VEC4 :
        return function(v) { gl.uniform4iv(location, v); };
      case gl.BOOL :
        return function(v) { gl.uniform1iv(location, v); };
      case gl.BOOL_VEC2 :
        return function(v) { gl.uniform2iv(location, v); };
      case gl.BOOL_VEC3 :
        return function(v) { gl.uniform3iv(location, v); };
      case gl.BOOL_VEC4 :
        return function(v) { gl.uniform4iv(location, v); };
      case gl.FLOAT_MAT2 :
        return function(v) { gl.uniformMatrix2fv(location, false, v); };
      case gl.FLOAT_MAT3 :
        return function(v) { gl.uniformMatrix3fv(location, false, v); };
      case gl.FLOAT_MAT4 :
        return function(v) { gl.uniformMatrix4fv(location, false, v); };
      case gl.SAMPLER_2D :
      case gl.SAMPLER_CUBE :
        if (isArray) {
          var units = [];
          for (let i = 0; i < uniformInfo.size; i++) { // greggman wrong here!
            units.push(textureUnit++);
          }
          return function(bindPoint, units) {
            return function(textures) {
              gl.uniform1iv(location, units);
              textures.forEach( function(texture, index) {
                gl.activeTexture(gl.TEXTURE0 + units[index]);
                gl.bindTexture(bindPoint, texture);
              });
            };
          }(getBindPointForSamplerType(gl, type), units);
        } else {
          return function(bindPoint, unit) {
            return function(texture) {
              //gl.uniform1i(location, units); // Typo? How did it even work?
              gl.uniform1i(location, unit);
              gl.activeTexture(gl.TEXTURE0 + unit);
              gl.bindTexture(bindPoint, texture);
            };
          }(getBindPointForSamplerType(gl, type), textureUnit++);
        }
     default:  // we should never get here
        throw("unknown type: 0x" + type.toString(16));
    }
  }
}

function getBindPointForSamplerType(gl, type) {
  if (type === gl.SAMPLER_2D)   return gl.TEXTURE_2D;
  if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
  return undefined;
}

function setUniforms(setters, values) {
  Object.keys(values).forEach( function(name) {
    var setter = setters[name];
    if (setter) setter(values[name]);
  });
}

// Initialize a shader program
function initShaderProgram(gl, vsSource, fsSource) {
  // NOTE: Load any WebGL extensions before calling this

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert( 'Unable to initialize the shader program: \n' +
        gl.getProgramInfoLog(shaderProgram) );
    // This is not very good error handling... should be returning the error
    return null;
  }

  return {
    program: shaderProgram,
    attributeSetters: createAttributeSetters(gl, shaderProgram),
    uniformSetters: createUniformSetters(gl,shaderProgram),
  };
}

// create shader of a given type, upload source, compile it
function loadShader(gl, type, source) {
  const shader = gl.createShader(type); // no error handling??

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // Now check for errors
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // this alert business is sloppy...
    alert( 'An error occurred compiling the shaders: \n' +
        gl.getShaderInfoLog(shader) );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function drawOver( gl, programInfo, buffers, uniforms ) {
  // Overwrite whatever is on the canvas, without clearing anything
  // BEWARE: make sure viewport is already set appropriately

  // Set up program, attributes, and uniforms
  gl.useProgram(programInfo.program);
  setBuffersAndAttributes( gl, programInfo.attributeSetters, buffers );
  setUniforms( programInfo.uniformSetters, uniforms );

  // Draw the scene
  gl.drawElements( gl.TRIANGLES, buffers.indices.vertexCount,
      buffers.indices.type, buffers.indices.offset );

  return;
}

function clearRect(gl, x, y, width, height) {
  // Set some parameters
  gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to transparent black
  gl.clearDepth(1.0);

  // Use scissor to constrain clearing. 
  // See https://stackoverflow.com/a/11545738/10082269
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(x, y, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.SCISSOR_TEST);

  return;
}

function initQuadBuffers(gl) {
  // 4 vertices at the corners of the quad
  const vertices = [ -1, -1,  0,    1, -1,  0,    1,  1,  0,   -1,  1,  0 ];
  // Store byte info and load into GPU
  const vertexPositions = {
    buffer: gl.createBuffer(),
    numComponents: 3,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0
  };
  // Bind to the gl context
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositions.buffer);
  // Pass the array into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Texture coordinates assume image has 0,0 at top left
  const texCoordData = [ 0, 1,   1, 1,   1, 0,   0, 0 ];
  const texCoords = {
    buffer: gl.createBuffer(),
    numComponents: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoords.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordData), gl.STATIC_DRAW);

  // Index into two triangles
  var indices = [ 0,  1,  2,    2,  3,  0 ];
  const vertexIndices = {
    buffer: gl.createBuffer(),
    vertexCount: indices.length,
    type: gl.UNSIGNED_SHORT,
    offset: 0
  };
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndices.buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    attributes: {
      aVertexPosition: vertexPositions,
      aTexCoord: texCoords,
    },
    indices: vertexIndices,
  };
}

function initTexture(gl, width, height) {
  // Initializes a 2D texture object, extending the default gl.createTexture()
  // The GL context and the binding target are implicitly saved in the closure.
  // Returns the sampler (as a property) along with update and replace methods.
  // Input data is an ImageData object

  const target = gl.TEXTURE_2D;
  const texture = gl.createTexture();
  gl.bindTexture(target, texture);

  // Initialize with default parameters
  const level = 0;  // Mipmap level
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const border = 0;

  gl.texImage2D(target, level, internalFormat, width, height, border,
      srcFormat, srcType, null);

  // Set up mipmapping and anisotropic filtering, if appropriate
  setupMipMaps(gl, target, width, height);
  setTextureAnisotropy(gl, target);

  return {
    sampler: texture,
    updatePartial,
    replace,
    update,
  }

  function updatePartial( image ) {
    // Updates a portion of the texture with the supplied image data.
    gl.bindTexture(target, texture);
    
    // Image will be written starting from the pixel (xoffset, yoffset).
    // If these values are not set on the input, use (0,0)
    var xoff = image.xoffset || 0;
    var yoff = image.yoffset || 0;
    gl.texSubImage2D(target, level, xoff, yoff, srcFormat, srcType, image);

    // TODO: don't we need to update the mipmaps??
    return;
  }

  function replace( image ) {
    // Replaces the texture with the supplied image data
    // WARNING: will change texture width/height to match the image
    gl.bindTexture(target, texture);
    gl.texImage2D(target, level, internalFormat, srcFormat, srcType, image);

    // Re-do mipmap setup, since width/height may have changed
    setupMipMaps(gl, target, image.width, image.height);
    return;
  }

  function update( image ) {
    // Re-fills the texture with the supplied image data,
    // ASSUMING the image and texture are the same size
    gl.bindTexture(target, texture);
    gl.texSubImage2D(target, level, 0, 0, srcFormat, srcType, image);

    setupMipMaps(gl, target, image.width, image.height);
    return;
  }
}

function setupMipMaps(gl, target, width, height) {
  // We are using WebGL1 (for compatibility with mobile browsers) which can't
  // handle mipmapping for non-power-of-2 images. Maybe we should provide
  // pre-computed mipmaps? see https://stackoverflow.com/a/21540856/10082269
  if (isPowerOf2(width) && isPowerOf2(height)) {
    gl.generateMipmap(target);
    // Clamp to avoid wrapping around poles
    // TODO: this may not work with circular coordinates?
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } else { // Turn off mipmapping 
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set wrapping to clamp to edge
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  return;
}

function setTextureAnisotropy(gl, target) {
  var ext = (
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || 
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
      );
  if (ext) {
    var maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    // BEWARE: this texParameterf call is slow on Intel integrated graphics.
    // Avoid this entire function if at all possible.
    gl.texParameterf(target, ext.TEXTURE_MAX_ANISOTROPY_EXT, 
        maxAnisotropy);
  }
  return;
}

function isPowerOf2(value) {
  // This trick uses bitwise operators.
  // See https://stackoverflow.com/a/30924333/10082269
  return value && !(value & (value - 1));
  // For a better explanation, with some errors in the solution, see
  // https://stackoverflow.com/a/30924360/10082269
}

var vertexSrc = "attribute vec4 aVertexPosition;\nattribute vec2 aTexCoord;\n\nuniform vec2 uSourceOrigin; // sx, sy\nuniform vec2 uSourceScale;  // sWidth, sHeight\nuniform vec2 uDestOrigin;   // dx, dy\nuniform vec2 uDestScale;    // dWidth, dHeight\n\nvarying highp vec2 vTexCoord;\n\nvoid main(void) {\n  vTexCoord = aTexCoord * uSourceScale + uSourceOrigin;\n  gl_Position = vec4(\n      aVertexPosition.x * uDestScale.x + uDestOrigin.x,\n      aVertexPosition.y * uDestScale.y + uDestOrigin.y,\n      aVertexPosition.z,\n      aVertexPosition.w\n      );\n}\n";

var fragmentSrc = "precision highp float;\nprecision highp sampler2D;\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D uTextureSampler;\n\nvoid main(void) {\n  gl_FragColor = texture2D(uTextureSampler, vTexCoord);\n}\n";

const quadShaders = {
  vert: vertexSrc,
  frag: fragmentSrc,
};

function initSim2d(gl, fb, fbWidth, fbHeight) {
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
  const progInfo = initShaderProgram(gl, quadShaders.vert, quadShaders.frag);

  // Load data into GPU for shaders: attribute buffers, indices
  const buffers = initQuadBuffers(gl);
  // Initialize texture for rendering images to framebuffer. Size is arbitrary?
  const texture = initTexture(gl, canvas.width, canvas.height);

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
    clearRect: clearRect$1,
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

    drawOver( gl, progInfo, buffers, uniforms );

    // Unbind framebuffer, so later calls will go to the canvas
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return;
  }

  function clearRect$1(x, y, width, height) {
    // Flip the y-axis to be consistent with WebGL coordinates
    var yflip = canvas.height - y - height;

    // Make sure we are working with the right framebuffer
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    clearRect(gl, x, yflip, width, height);
    if (haveFB) gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return;
  }
}

export { initSim2d };
