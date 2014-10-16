var cubeVertexBufID;
var cubeColorBufID;
var cubeElemBufID;
function Cube()
{
	
}
var cubeVertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

var cubeVertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
        vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
    ];

// indices of the 12 triangles that comprise the cube

var cubeIndices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];
Cube.prototype.initBuffers = function(){

 cubeElemBufID = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeElemBufID);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cubeIndices), gl.STATIC_DRAW);
//color buffers
cubeColorBufID = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufID);
gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertexColors),gl.STATIC_DRAW);
//vertex buffers
cubeVertexBufID = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufID);
gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices),gl.STATIC_DRAW);


//attributes

}

Cube.prototype.drawCube = function()
{
}