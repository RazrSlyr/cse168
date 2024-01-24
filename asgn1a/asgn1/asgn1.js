// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute float a_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = a_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

const SHAPE_POINT = 0;
const SHAPE_TRIANGLE = 1;
const SHAPE_CIRCLE = 2;
const SHAPE_STAR = 3;
const SHAPE_SQUIRTLE = 4;

let gl;
let canvas;
let a_Position;
let u_FragColor;
let a_Size;
let g_shapesList = [];
let g_selectedColor = [1, 1, 1, 1]; // Current drawing color
let g_size = 10;
let g_selectedShape = SHAPE_POINT;
let g_numSegments = 10;
let captured = true;

// Copy versions for the second canvas
let canvas2;
let gl2;
let a_Position2;
let u_FragColor2;
let a_Size2;

const inactiveButton = `p-2 m-2 border rounded-lg border-pink-600 
transition-all duration-300 hover:text-white hover:bg-pink-600 w-32`;

const activeButton = `p-2 m-2 border rounded-lg text-white bg-green-400 border-green-400 
transition-all duration-300 hover:text-green-400 hover:bg-white w-32`;

const textInput = `p-1 border rounded-lg border-stone-400`;


function setClasses() {
  // Set the CSS Classes of all the buttons
  document.getElementById("square").className = activeButton;
  document.getElementById("circle").className = inactiveButton;
  document.getElementById("triangle").className = inactiveButton;
  document.getElementById("star").className = inactiveButton;
  document.getElementById("clear").className = inactiveButton;
  document.getElementById("squirtle").className = inactiveButton;
  

  // Set the CSS Classes of all the Text Inputs
  document.getElementById("red_text").className = textInput;
  document.getElementById("green_text").className = textInput;
  document.getElementById("blue_text").className = textInput;
  document.getElementById("size_text").className = textInput;
  document.getElementById("segments_text").className = textInput;
  document.getElementById("red_text").className = textInput;

}

function deactivateButtons() {
  document.getElementById("star").className = inactiveButton;
  document.getElementById("square").className = inactiveButton;
  document.getElementById("circle").className = inactiveButton;
  document.getElementById("triangle").className = inactiveButton;
  document.getElementById("squirtle").className = inactiveButton;

}

function updateColorBox() {
  let colorBox = document.getElementById("color_box");
  colorBox.style.backgroundColor = "rgb(" +
    document.getElementById("red_text").value +
    ", " + document.getElementById("green_text").value +
    ", " + document.getElementById("blue_text").value + ")";
}

function setHTMLActions() {
  // Color Sliders
  document.getElementById("red").onchange = (e) => {
    document.getElementById("red_text").value = e.target.value;
    g_selectedColor[0] = Number(e.target.value) / 255;
    updateColorBox();
  };

  document.getElementById("green").onchange = (e) => {
    document.getElementById("green_text").value = e.target.value;
    g_selectedColor[1] = Number(e.target.value) / 255;
    updateColorBox();
  };

  document.getElementById("blue").onchange = (e) => {
    document.getElementById("blue_text").value = e.target.value;
    g_selectedColor[2] = Number(e.target.value) / 255;
    updateColorBox();
  };

  // Color Text Input
  document.getElementById("red_text").onchange = (e) => {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 255) e.target.value = 255;
    document.getElementById("red").value = Number(e.target.value);
    g_selectedColor[0] = Number(e.target.value) / 255;
    updateColorBox();
  };

  document.getElementById("green_text").onchange = (e) => {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 255) e.target.value = 255;
    document.getElementById("green").value = Number(e.target.value);
    g_selectedColor[1] = Number(e.target.value) / 255;
    updateColorBox();
  };

  document.getElementById("blue_text").onchange = (e) => {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 255) e.target.value = 255;
    document.getElementById("blue").value = Number(e.target.value);
    g_selectedColor[2] = Number(e.target.value) / 255;
    updateColorBox();
  };

  // Size Slider
  document.getElementById("size").onchange = (e) => {
    document.getElementById("size_text").value = Number(e.target.value);
    g_size = Number(e.target.value)
  };

  // Size Text Input
  document.getElementById("size_text").onchange = (e) => {
    if (e.target.value < 1) e.target.value = 1;
    if (e.target.value > 50) e.target.value = 50;
    document.getElementById("size").value = Number(e.target.value);
    g_size = Number(e.target.value);
  };

  // Segments Slider
  document.getElementById("segments").onchange = (e) => {
    document.getElementById("segments_text").value = e.target.value;
    g_numSegments = Number(e.target.value)
  };

  // Segments Text Input
  document.getElementById("segments_text").onchange = (e) => {
    if (e.target.value < 5) e.target.value = 5;
    if (e.target.value > 30) e.target.value = 30;
    document.getElementById("segments").value = Number(e.target.value);
    g_numSegments = Number(e.target.value);
  };

  // Clear Button
  document.getElementById("clear").onclick = () => {
    g_shapesList = [];
    renderAllShapes();
  };
  // Shape Buttons
  document.getElementById("square").onclick = () => {
    g_selectedShape = SHAPE_POINT;
    deactivateButtons();
    document.getElementById("square").className = activeButton;
  };
  document.getElementById("triangle").onclick = () => {
    g_selectedShape = SHAPE_TRIANGLE;
    deactivateButtons();
    document.getElementById("triangle").className = activeButton;
  };
  document.getElementById("circle").onclick = () => {
    g_selectedShape = SHAPE_CIRCLE;
    deactivateButtons();
    document.getElementById("circle").className = activeButton;
  };
  document.getElementById("star").onclick = () => {
    g_selectedShape = SHAPE_STAR;
    deactivateButtons();
    document.getElementById("star").className = activeButton;
  };
  document.getElementById("squirtle").onclick = () => {
    g_selectedShape = SHAPE_SQUIRTLE;
    deactivateButtons();
    document.getElementById("squirtle").className = activeButton;
  };
}

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // This helps alleviate lag
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  a_Size = gl.getAttribLocation(gl.program, "a_Size");
  if (a_Size < 0) {
    console.log('Failed to get the storage location of a_Size');
    return;
  }
}



function clearCanvas(r, g, b, a) {
  // Specify the color for clearing <canvas>
  if (!(r == undefined ||
    g == undefined ||
    b == undefined ||
    a == undefined))
    gl.clearColor(r, g, b, a);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function canvasCoordsToGL(x, y, rect) {
  let newX = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  let newY = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  return [newX, newY];
}


function asgn1_main() {
  // Set up website and main canvas
  setClasses();
  setHTMLActions();
  setUpWebGL();
  connectVariablesToGLSL();


  // Register function (event handler) to be called on a mouse press
  let clicked = false;
  canvas.onmousedown = function (ev) {
    clicked = true;
    click(ev);
  };
  canvas.onmousemove = (ev) => {
    if (clicked) {
      click(ev);
    }
  }
  canvas.onmouseup = function (ev) { clicked = false };

  clearCanvas(0, 0, 0, 1);

}

function renderAllShapes() {
  clearCanvas();
  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    let shape = g_shapesList[i];
    shape.render();
  }
}

function click(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  [x, y] = canvasCoordsToGL(x, y, rect);


  let p;
  if (g_selectedShape == SHAPE_POINT) {
    p = new Point([x, y], [...g_selectedColor], g_size);
  } else if (g_selectedShape == SHAPE_TRIANGLE) {
    p = new Triangle([x, y], [...g_selectedColor], g_size);
  } else if (g_selectedShape == SHAPE_CIRCLE) {
    p = new Circle([x, y], [...g_selectedColor], g_size, g_numSegments);
  } else if (g_selectedShape == SHAPE_STAR) {
    p = new Star([x, y], [...g_selectedColor], g_size);
  } else if (g_selectedShape = SHAPE_SQUIRTLE) {
    p = new Squirtle([x, y], g_size, gl);
  }

  // Store the point to g_points array
  g_shapesList.push(p);

  // Clear <canvas>
  clearCanvas();

  renderAllShapes();

}


asgn1_main();