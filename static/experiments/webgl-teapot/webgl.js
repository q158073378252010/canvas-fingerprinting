

var gl;
var shaderProgram;

var objects;

function setupShaders() {
  shaderProgram = gl.createProgram();

  for(var i in vertex_shaders) {
    var shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, vertex_shaders[i]);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    gl.attachShader(shaderProgram, shader);
  }
  for(var shader in fragment_shaders) {
    var shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, fragment_shaders[i]);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    gl.attachShader(shaderProgram, shader);
  }
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS))
  {
    alert("Error during program validation:\n" + gl.getProgramInfoLog(shaderProgram));return;
  }

  shaderProgram.vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPosition);

  shaderProgram.textureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoord);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  //shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, "uUseTexture");

  gl.useProgram(shaderProgram);
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];

function pushMVMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function popMVMatrix() {
  mvMatrix = mvMatrixStack.pop();
}


function draw() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var pMatrix = mat4.create();
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight,
                   0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);


  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS))
  {
    alert("totally invalid: " + gl.getProgramInfoLog(shaderProgram));return;
  }


  for(var obj in objects) {
    objects[obj].draw(pMatrix);
  }

  var buf = new Uint8Array(250*250*4);
  gl.readPixels(0, 0, 250, 250, gl.RGBA, gl.UNSIGNED_BYTE, buf);

  fillForm(buf);
}


$(document).ready(function() {
  $("#scratch").width(250);
  $("#scratch").height(250);

  gl = document.getElementById("scratch").getContext("experimental-webgl",
          {preserveDrawingBuffer: true})

  if(!gl) {
    alert("No webgl");
    return;
  }

  //gl = WebGLDebugUtils.makeDebugContext(gl);

  gl.viewportWidth = 250;
  gl.viewportHeight = 250;

  setupShaders();

  objects = [new VisibleObject( [
    0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0],

    [0,1,2],

    //null,
    new Texture( "/images/ISO_12233-reschart-square-small.png",
      [0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0]),

    [0,0,-5],
    [Math.PI/4, Math.PI/4, Math.PI/4]
    )];

  draw();

  var renderer = gl.getParameter(gl.RENDERER);
  var vendor = gl.getParameter(gl.VENDOR);
  var version = gl.getParameter(gl.VERSION);

  var x = document.createElement("p");
  x.innerHTML = "Renderer:" + renderer + " vendor: " + vendor + " version: " + version;
  document.getElementById("info").appendChild(x);
});

