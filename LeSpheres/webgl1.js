
/*Shader loading ***********************************************/
function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    var vertShdr;
    var fragShdr;

    var vertElem = document.getElementById( vertexShaderId );
    if ( !vertElem ) { 
        alert( "Unable to load vertex shader " + vertexShaderId );
        return -1;
    }
    else {
        vertShdr = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertShdr, vertElem.text );
        gl.compileShader( vertShdr );
        if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
            var msg = "Vertex shader failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) { 
        alert( "Unable to load vertex shader " + fragmentShaderId );
        return -1;
    }
    else {
        fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragShdr, fragElem.text );
        gl.compileShader( fragShdr );
        if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
            var msg = "Fragment shader failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
}
/**********************************************************************/


var gl;
var canvas;
var program1;
var aVertexPosition;
var aVertexColor;
var aVertexNormal;
var vertBuf;
var colBuf;
var theta = 0.0;
var fTheta;
var pMatrixUnif;
var mvMatrixUnif;
var mvMatrix; 
var pMatrix;
var points = [];
var colors = [];
var lastMouseX, lastMouseY;
var mouseClicked = false;
var rotMat = mat4();
var normals = [];
var normBuf;
var mStack = [];
var dx; 
var dy;
var eye = vec3(0.0, 0.0, -1.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
window.onload = function init(){
	 
	//UI
	var mybutton = document.getElementById("button1");
	mybutton.addEventListener("click", function(){

	});
	canvas = document.getElementById("mycanvas");
	if(!canvas){ 
		alert("No canvas tag");
		return -1;
	}
	var dispText = document.getElementById("txtArea");
	canvas.addEventListener("mousedown",function(event){
		dispText.innerHTML = "x:" + event.clientX + " Y:" + event.clientY;
		mouseClicked = true;
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;
	});
	document.addEventListener("mousemove",function(event){
		if(mouseClicked){
			var dx = event.clientX - lastMouseX;
			var dy = event.clientY - lastMouseY;
			dispText.innerHTML = dx + " " + dy;
			var rotMatX = rotate(dx, vec3(0,1,0));
			var rotMatY = rotate(dy, vec3(1,0,0));
			var compRotMat = mult(rotMatY, rotMatX);
			rotMat = mult(compRotMat, rotMat);
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}
	});
	
	document.addEventListener("mouseup", function(event){
		mouseClicked = false;
	});
	gl = WebGLUtils.setupWebGL(canvas);
	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.enable(gl.DEPTH_TEST);
	program1 = initShaders(gl, "vs", "fs");
	gl.useProgram(program1);
	
	initBuffers();
	mvMatrix = mat4();
	pMatrix = mat4();
	
	
	
	aVertexPosition = gl.getAttribLocation(program1, "aVertexPosition");
	gl.enableVertexAttribArray(aVertexPosition);
	
	aVertexColor = gl.getAttribLocation(program1, "aVertexColor");
	gl.enableVertexAttribArray(aVertexColor);
	
	aVertexNormal = gl.getAttribLocation(program1, "aVertexNormal");
	gl.enableVertexAttribArray(aVertexNormal);
	console.log(aVertexPosition + " " + aVertexNormal);
	fTheta = gl.getUniformLocation(program1, "theta");
	pMatrixUnif = gl.getUniformLocation(program1, "uPMatrix");
	mvMatrixUnif = gl.getUniformLocation(program1, "uMVMatrix");
	render();
}
var cube;
function initBuffers(){
	//cube = new Cube();
	//cube
	//cube.initBuffers();


	//sphere creation through icosahedron
	CreateSphere(4);
	//sphere
	sphVertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphVertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices),  gl.STATIC_DRAW);

	sphColBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphColBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereColors),  gl.STATIC_DRAW);
	
}
function render(){
	gl.clearColor(0.8,0.8,0.8, 1.0);
	gl.viewport(0,0,canvas.width, canvas.height);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var viewMatrix = lookAt(eye, at, up);
	pMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 100.0);
	
	gl.uniformMatrix4fv(pMatrixUnif, false, flatten(pMatrix));
	
	theta += 1;
	gl.uniform1f(fTheta, theta);
	
	
	//set mvMatrix to identity
	mvMatrix = mat4();
	// test cube
	/*gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufID);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufID);
	gl.vertexAttribPointer(aVertexColor, 3, gl.FLOAT, false, 0,0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeElemBufID);
	var trans = translate ( 0.0, 0.0, -2.0);
	mvMatrix = mult(mvMatrix, trans );
	mvMatrix = mult (mvMatrix, rotMat);
	mvMatrix = mult(mvMatrix, viewMatrix);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(mvMatrix));
	
	gl.drawElements( gl.TRIANGLES, 12 * 3, gl.UNSIGNED_BYTE, 0 );*/
	mStack = [];
	
	
	//drawing spheres
	gl.bindBuffer(gl.ARRAY_BUFFER, sphVertBuf);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sphColBuf);
	gl.vertexAttribPointer(aVertexColor, 3, gl.FLOAT, false, 0,0);
	
	//sphere 1 - TORSO
	mStack.push(mvMatrix); //Save default mv matrix
	//translate to origin
	var trans = translate ( 0.0, 0.0, -10.0);
	mvMatrix = mult(mvMatrix, trans );
	
	//rotate - mouse interaction
	mvMatrix = mult (mvMatrix, rotMat);
	
	//scale
	var itrans1 = translate(1.0, 0.0, 0.0);
	var insmvMatrix = mult(mvMatrix, itrans1);
	var scal = scale2(2,1,1);
	insmvMatrix = mult( insmvMatrix, scal);	
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//sphere 2 - child of sphere 1 - upper hind leg right
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(0.0, -0.0, 0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var insmvMatrix2 = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	insmvMatrix2 = mult( insmvMatrix2, scal2);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix2));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//sphere 3 - child of sphere 2 - lower hind leg right
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.5,0.25,0.25);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	//sphere 2 - child of sphere 1 - upper hind leg left
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(0.0, -0.0, -0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var insmvMatrix2 = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	insmvMatrix2 = mult( insmvMatrix2, scal2);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix2));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//sphere 3 - child of sphere 2 - lower hind leg left
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.5,0.25,0.25);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	
	//FRONT LEGS - child of sphere 1 - upper front leg right
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(2.0, -0.0, 0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var insmvMatrix2 = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	insmvMatrix2 = mult( insmvMatrix2, scal2);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix2));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//sphere 3 - child of sphere 2 - lower front leg right
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.5,0.25,0.25);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	
	//FRONT LEGS - child of sphere 1 - upper front leg left
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(2.0, -0.0, -0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var insmvMatrix2 = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	insmvMatrix2 = mult( insmvMatrix2, scal2);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix2));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//sphere 3 - child of sphere 2 - lower front leg left
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.5,0.25,0.25);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	
	//TAIL
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(-0.5, 0.0, 0.0));
	var rot90 = rotate(120, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.75,0.25,0.25);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	mvMatrix = mStack.pop();
	//HEAD
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(1.75, 0.5, 0.0));
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.75,0.75,0.75);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//HEAD_SNOUT_
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(0.5, 0.0, 0.0));
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.7,0.5,0.5);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//HEAD_SNOUT_NOSE
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(0.65, 0.35, 0.0));
	//scale
	var itrans2 = translate (1,0,0);
	var insmvMatrix3 = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.2,0.2,0.2);
	insmvMatrix3 = mult( insmvMatrix3, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(insmvMatrix3));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	mvMatrix = mStack.pop(); //nose
	mvMatrix = mStack.pop(); // snout
	mvMatrix = mStack.pop(); // head
	
	
	mvMatrix = mStack.pop(); // torso
	
	

	
	window.requestAnimFrame(render);
}
