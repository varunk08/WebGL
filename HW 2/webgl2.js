
var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];
var positions = [];
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];



// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

var modelViewMatrixLoc;

var vBuffer, cBuffer;
var icBuffer;
var vColor;
//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
     colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[b]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]);
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[d]); 
}
var interpPoints = [];
var interpColors = [];
function interpQuad(a, b, c, d){
// We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        interpPoints.push( vertices[indices[i]] );
        interpColors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        //colors.push(vertexColors[a]);
        
    }
}
function interpCube(){
interpQuad( 1, 0, 3, 2 );
interpQuad( 2, 3, 7, 6 );
interpQuad( 3, 0, 4, 7 );
interpQuad( 6, 5, 1, 2 );
    interpQuad( 4, 5, 6, 7 );
 interpQuad( 5, 4, 0, 1 );
}
function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------
var stack = [];
var cube = 0;
var innerwheel = 1;
var outerwheel = 2;
var theta = [1, 1, 0];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );
    gl.enable( gl.DEPTH_TEST ); 
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    gl.useProgram( program );
    OriginCenteredTriangle(120);
    //    alert(positions);
    colorCube();
    interpCube();
    // Load shaders and use the resulting shader program
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );    
    gl.useProgram( program );

    // Create and initialize  buffer objects
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

     vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // Interpolated cube buffers


    icBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, icBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(interpColors), gl.STATIC_DRAW );

    modelViewMatrix = mat4();
	
	//initial cube axis aligned view


	cubeModelMatrix = mat4();
	var rot1 = rotate(45, vec3(-1.0, 0.0, 0.0));
	var rot2 = rotate(45, vec3(0.0, 1.0, 0.0));
	cubeModelMatrix = mult(rot1, rot2);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
    
    render();
}
var node;
var cubeModelMatrix;

//----------------------------------------------------------------------------


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    theta[cube] += 10;
    theta[innerwheel] += 3;
    theta[outerwheel] += 0;
	modelViewMatrix = mat4();
    var coff1 = 2.0;
    var coffouter = 5.0;
    var tempMat = mat4();
    var innerwheelmat = rotate(theta[innerwheel], vec3(0.0,0.0,1.0));
    var outerwheelmat =mat4();
    //initial setup of cube
    tempMat = mult (rotate(theta[cube], vec3(0.0, 1.0, 0.0)), cubeModelMatrix);
    
    //first cube
    outerwheelmat = mult( rotate(theta[outerwheel], vec3(0.0,0.0,-1.0)), translate(positions[0][0],positions[0][1],0.0));
var tempMat1  = mult(translate(coff1, 0.0, 0.0), tempMat);
    modelViewMatrix = mult(innerwheelmat, tempMat1);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //modelViewMatrix = mult( modelViewMatrix, outerwheelmat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.bindBuffer(gl.ARRAY_BUFFER, icBuffer);
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //second cube
var tempMat2  = mult(translate(-coff1, 0.0, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat2);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //    modelViewMatrix = mult( modelViewMatrix, outerwheelmat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.bindBuffer(gl.ARRAY_BUFFER, icBuffer);
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //third cube
var    tempMat3  = mult(translate(0.0, coff1, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat3);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //    modelViewMatrix = mult( modelViewMatrix, outerwheelmat);

    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //fourth cube
var    tempMat4  = mult(translate(0.0, -coff1, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat4);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


 //first cube
    outerwheelmat = mult( rotate(theta[outerwheel], vec3(0.0,0.0,-1.0)), translate(positions[1][0],positions[1][1],0.0));
var tempMat1  = mult(translate(coff1, 0.0, 0.0), tempMat);
    modelViewMatrix = mult(innerwheelmat, tempMat1);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //modelViewMatrix = mult( modelViewMatrix, outerwheelmat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //second cube
var tempMat2  = mult(translate(-coff1, 0.0, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat2);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //    modelViewMatrix = mult( modelViewMatrix, outerwheelmat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //third cube
var    tempMat3  = mult(translate(0.0, coff1, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat3);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //    modelViewMatrix = mult( modelViewMatrix, outerwheelmat);

    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //fourth cube
var    tempMat4  = mult(translate(0.0, -coff1, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat4);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

 //first cube
    outerwheelmat = mult( rotate(theta[outerwheel], vec3(0.0,0.0,-1.0)), translate(positions[2][0],positions[2][1],0.0));
var tempMat1  = mult(translate(coff1, 0.0, 0.0), tempMat);
    modelViewMatrix = mult(innerwheelmat, tempMat1);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //modelViewMatrix = mult( modelViewMatrix, outerwheelmat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //second cube
var tempMat2  = mult(translate(-coff1, 0.0, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat2);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //    modelViewMatrix = mult( modelViewMatrix, outerwheelmat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //third cube
var    tempMat3  = mult(translate(0.0, coff1, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat3);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);
    //    modelViewMatrix = mult( modelViewMatrix, outerwheelmat);

    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //fourth cube
var    tempMat4  = mult(translate(0.0, -coff1, 0.0), tempMat);

    modelViewMatrix = mult(innerwheelmat, tempMat4);
    modelViewMatrix = mult( outerwheelmat, modelViewMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame(render);
}


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}
function createInnerWheel(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}
function OriginCenteredTriangle(angle)
{
	var firstPt = vec2(0, 4);
	var cos = Math.cos(Math.PI * angle / 180);
	var sin = Math.sin(Math.PI * angle / 180);
	var secondPt = vec2(
						firstPt[0] * cos - firstPt[1] * sin,
						firstPt[1] * cos + firstPt[0] * sin
					);
	var thirdPt = vec2( secondPt[0] * cos - secondPt[1] * sin,
						secondPt[1] * cos + secondPt[0] * sin
						);

	positions.push(firstPt, secondPt,thirdPt);

}
