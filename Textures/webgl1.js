
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
var program_texonly;
var program_tetra;
var aVertexPosition;
var aVertexColor;
var aVertexNormal;
var aTexCoord;

var vertBuf;
var colBuf;
var fTheta;
var pMatrixUnif;
var mvMatrixUnif;
var nMatrixUnif;
var mvMatrix; 
var viewMatrixUnif;
var pMatrix;
var useLightingUnif;
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
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var  unif_ambientProduct, unif_diffuseProduct, unif_specularProduct; //lighting
var  unif_lightPosition;
var unif_shininess;
var radius = 10;
var theta  = 2.0;
var phi    = 2.0;
var dr = 2.0 * Math.PI/180.0;

var plane;
var tetra;

//INIT function -------------------------------------------------------
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

	document.addEventListener("keydown", function(event){
		var charCode = (event.which) ? event.which : event.keyCode;

		switch(charCode){
			case 73: 		
				lightPosition[1] += 0.2;
				break;
			case 74: 
				lightPosition[0] -= 0.2;
				break;
			case 75: 
				lightPosition[1] -= 0.2;
				break;
			case 76: 
				lightPosition[0] += 0.2;
				break;
		}

		//console.log(lightPosition);
		event.preventDefault();
	});
	document.addEventListener("mousewheel", function(event){
		radius +=  event.wheelDelta / 10.0;
		event.preventDefault();
	});
	document.addEventListener("mousemove",function(event){
		if(mouseClicked){
			var dx = event.clientX - lastMouseX;
			var dy = event.clientY - lastMouseY;
	
			theta += dx * dr;
			phi -= dy* dr;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
			dispText.innerHTML =  theta + " " + phi;
		}
	});
	
	document.addEventListener("mouseup", function(event){
		mouseClicked = false;
	});
	gl = WebGLUtils.setupWebGL(canvas);
	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.enable(gl.DEPTH_TEST);
	program1 = initShaders(gl, "vs", "fs");
	program_texonly = initShaders(gl, "vs_tex", "fs_tex");
	program_tetra = initShaders(gl, "vs_tet", "fs_tet");
	
	/*
	//Test inverse function
	var test = mat4(4,	2,	13,	10,	 
3	,9	,7,	5,
6	,8	,12,	14,
11	,15,	16,	17);
	console.log(flatten(transpose(inverse(test))));
	console.log(flatten((normalFromMat4(test))));

	*/
	/*
0.0496	-0.2557	-0.3473	0.3321	 
-0.0789	0.1501	0.0522	-0.0407
0.1628	0.1094	-0.1399	-0.0127
-0.1158	-0.07	0.3104	-0.1081
	*/

	gl.useProgram(program1);
	aVertexPosition = gl.getAttribLocation(program1, "aVertexPosition");
	gl.enableVertexAttribArray(aVertexPosition);
	
	aVertexColor = gl.getAttribLocation(program1, "aVertexColor");
	gl.enableVertexAttribArray(aVertexColor);
	
	aVertexNormal = gl.getAttribLocation(program1, "aVertexNormal");
	gl.enableVertexAttribArray(aVertexNormal);
	
	fTheta = gl.getUniformLocation(program1, "theta");
	pMatrixUnif = gl.getUniformLocation(program1, "uPMatrix");
	mvMatrixUnif = gl.getUniformLocation(program1, "uMVMatrix");
	nMatrixUnif = gl.getUniformLocation(program1, "uNMatrix");
	unif_ambientProduct = gl.getUniformLocation(program1, "ambientProduct");
	unif_diffuseProduct = gl.getUniformLocation(program1, "diffuseProduct");
	unif_specularProduct = gl.getUniformLocation(program1, "specularProduct");
    unif_lightPosition = gl.getUniformLocation(program1, "lightPosition");;
    unif_shininess = gl.getUniformLocation(program1, "shininess");
    viewMatrixUnif = gl.getUniformLocation(program1, "viewMatrix");
	useLightingUnif = gl.getUniformLocation(program1, "useLighting");
	
	//need light.js
	initLighting();
	//init material params
	gl.uniform4fv( unif_ambientProduct,flatten(ambientProduct) );
    gl.uniform4fv( unif_diffuseProduct,flatten(diffuseProduct) );
    gl.uniform4fv( unif_specularProduct,flatten(specularProduct) );	
    gl.uniform1f( unif_shininess,materialShininess );
    initSphBuffers();
	mvMatrix = mat4();
	pMatrix = mat4();
	//Perspective matrix
	pMatrix = perspective(80.0, canvas.width / canvas.height, 0.1, 100.0);
	gl.uniformMatrix4fv(pMatrixUnif, false, flatten(pMatrix));

	
	plane = new Plane();
	//init plane buffers
    	plane.genBuffers(program_texonly);
    	plane.genTextures(document.getElementById("texImage"));
	console.log("Max texture units supported: " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
	tetra = new Tetra();
	tetra.genBuffers(program_tetra);
	tetra.genTextures(document.getElementById("tetImage1"),document.getElementById("tetImage2"),document.getElementById("tetImage3"),document.getElementById("tetImage4"));
	render();
}

var cube;
var sphNormalBuf;
function initSphBuffers(){
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
	
	sphNormalBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphNormalBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereNormals),  gl.STATIC_DRAW);


}
function render(){
	gl.clearColor(0.8,0.8,0.8, 1.0);
	gl.viewport(0,0,canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.useProgram(program1);
	gl.uniform4fv( unif_lightPosition,flatten(lightPosition) );
	//View matrix
	//eye = vec3(radius*Math.sin(theta)*Math.cos(phi), radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
	var t = radius * Math.cos(phi);
	var y = radius * Math.sin(phi);
	var x = t * Math.cos(theta);
	var z = t * Math.sin(theta);
	eye = vec3(x,y,z);
	var viewMatrix = lookAt(eye, at, up);
	gl.uniformMatrix4fv(viewMatrixUnif, false, flatten(viewMatrix));
	 
	
	gl.uniform1i(useLightingUnif, true);
	
	
	//set mvMatrix to identity
	mvMatrix = mat4();
	var normMat = mat4();
	mStack = [];
	//------------------------ test cube -------------------------------------
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
	//------------------------------------------------------------------------
	
	
	//---------------//DRAWE PLANE-----------------------------------------------
	gl.useProgram(program_texonly);
	gl.uniformMatrix4fv(gl.getUniformLocation(program_texonly,"viewMatrix"), false, flatten(viewMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(program_texonly,"uPMatrix"), false, flatten(pMatrix));
	mStack.push(mvMatrix);
	mvMatrix = mult(mvMatrix, scale2(20,20,20));
	gl.uniformMatrix4fv(gl.getUniformLocation(program_texonly, "uMVMatrix"), false, flatten(mvMatrix));
	normMat = transpose((inverse(mvMatrix)));
	gl.uniformMatrix4fv(gl.getUniformLocation(program_texonly,"uNMatrix"), false, flatten(normMat));
	plane.drawPlane();	
	mvMatrix = mStack.pop();
	
	//------------------------------------------------------------------------
	//---------------//DRAWE TETRA-----------------------------------------------
	gl.useProgram(program_tetra);
	gl.uniformMatrix4fv(gl.getUniformLocation(program_tetra,"viewMatrix"), false, flatten(viewMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(program_tetra,"uPMatrix"), false, flatten(pMatrix));
	mStack.push(mvMatrix);
	mvMatrix = mult(mvMatrix, translate(0,1.6,0));
	mvMatrix = mult(mvMatrix, rotate(-20, 1,0,0));
	mvMatrix = mult(mvMatrix, scale2(5,5,5));
	gl.uniformMatrix4fv(gl.getUniformLocation(program_tetra, "uMVMatrix"), false, flatten(mvMatrix));
	normMat = transpose((inverse(mvMatrix)));
	gl.uniformMatrix4fv(gl.getUniformLocation(program_tetra,"uNMatrix"), false, flatten(normMat));
	tetra.drawTet();	
	mvMatrix = mStack.pop();
	
	//------------------------------------------------------------------------
	// Sphere buffers
	gl.useProgram(program1);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphVertBuf);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sphColBuf);
	gl.vertexAttribPointer(aVertexColor, 3, gl.FLOAT, false, 0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sphNormalBuf);
	gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0,0);
	//-------------------------- LIGHT ----------------------------------------
	mStack.push(mvMatrix);
	var ltrans = translate(vec3(lightPosition[0],lightPosition[1],lightPosition[2]));
	mvMatrix = mult(mvMatrix, ltrans);
	mvMatrix = mult(mvMatrix, scale2(0.25,0.25,0.25));
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(mvMatrix));
	normMat = transpose((inverse(mvMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	mvMatrix = mStack.pop();




	//-------------------------- TORSO ----------------------------------------
	mStack.push(mvMatrix); //Save default mv matrix
	//translate to origin
	mvMatrix = mult(mvMatrix, translate ( 5.0, 2.7, 0.0) );
	
	
	//scale
	var itrans1 = translate(1.0, 0.0, 0.0);
	var instanceMatrix = mult(mvMatrix, itrans1);
	var scal = scale2(2,0.75,0.5);
	instanceMatrix = mult( instanceMatrix, scal);	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//-------------------------- LEG hind-right-upper -------------------------------------
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	mvMatrix = mult(mvMatrix, translate(0.0, 0.0, 0.5));
	mvMatrix = mult (mvMatrix, rotate(-90, vec3(0,0,1)));
	
	//scale
	var instanceMatrix = mult(mvMatrix, translate (1,0,0));
	instanceMatrix = mult( instanceMatrix, scale2(1,0.25,0.25));
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));
	
	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//-------------------------- LEG hind-right-lower -------------------------------------
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(1.0,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal3);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	//-------------------------- LEG hind-upper hind leg left -------------------------------------
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(0.0, 0.0, -0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal2);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));
	
	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	//-------------------------- LEG hind-lower hind leg left -------------------------------------
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(1,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal3);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop(); //lower
	mvMatrix = mStack.pop(); //upper
	
	//-------------------------- //FRONT LEGS - upper front leg right-------------------------------------
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(2.0, 0.0, 0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal2);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	//-------------------------- //FRONT LEGS - lower front leg right-------------------------------------
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(1,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal3);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	//-------------------------- //FRONT LEGS - upper front leg left-------------------------------------
	mStack.push(mvMatrix);
	//rotate by 90
	//translate
	var trans = translate(2.0, -0.0, -0.5);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(-90, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans);
	var scal2 = scale2(1,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal2);
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	//-------------------------- //FRONT LEGS - lower front leg left-------------------------------------
	mStack.push(mvMatrix);
	//translate
	var trans = translate(1.0, 0.0, 0.0);
	mvMatrix = mult(mvMatrix, trans);
	var rot90 = rotate(0, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(1,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));

	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	mvMatrix = mStack.pop();
	mvMatrix = mStack.pop();
	//-------------------------- //TAIL-------------------------------------
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(-0.5, 0.0, 0.0));
	var rot90 = rotate(120, vec3(0,0,1));
	mvMatrix = mult (mvMatrix, rot90);
	
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.75,0.25,0.25);
	instanceMatrix = mult( instanceMatrix, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));
	
	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	mvMatrix = mStack.pop();
	//-------------------------- HEAD-------------------------------------
	
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(1.75, 0.5, 0.0));
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.75,0.75,0.75);
	instanceMatrix = mult( instanceMatrix, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));
	
	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	//-------------------------- //HEAD_SNOUT_-------------------------------------
	
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(0.5, 0.0, 0.0));
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.7,0.5,0.5);
	instanceMatrix = mult( instanceMatrix, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));
	
	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	//-------------------------- //HEAD_SNOUT_NOSE -------------------------------------
	
	mStack.push(mvMatrix);
	//translate
	mvMatrix = mult(mvMatrix, translate(0.65, 0.35, 0.0));
	//scale
	var itrans2 = translate (1,0,0);
	var instanceMatrix = mult(mvMatrix, itrans2);
	var scal3 = scale2(0.2,0.2,0.2);
	instanceMatrix = mult( instanceMatrix, scal3);
	
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(instanceMatrix));
	normMat = transpose(inverse(mult(viewMatrix,instanceMatrix)));
	gl.uniformMatrix4fv(nMatrixUnif, false, flatten(normMat));
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);

	mvMatrix = mStack.pop(); //nose
	mvMatrix = mStack.pop(); // snout
	mvMatrix = mStack.pop(); // head
	mvMatrix = mStack.pop(); // torso
	
	

	
	window.requestAnimFrame(render);
}
