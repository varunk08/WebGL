

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
			//rotMat = mat4();
			var rotMatX = rotate(dx, vec3(0,1,0));
			var rotMatY = rotate(dy, vec3(1,0,0));
			var compRotMat = mult(rotMatX, rotMatY);
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

	initBuffers();
	mvMatrix = mat4();
	pMatrix = mat4();
	
	program1 = initShaders(gl, "vs", "fs");
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
// var trans = translate ( 0.0, 0.0, -4.0);
	// mvMatrix = mult(trans, mvMatrix);
	render();
}
    var icoBuf;
var icoColors;
var icoColBuf;
var indexBuf;

var icoIndices = [
		  0, 11, 5,
		  0, 5, 1,
		  0,1,7,
		  0,7,10,
		  0,10,11,
		  
		  1,5,9,
		  5,11,4,
		  11,10,2,
		  10,7,6,
		  7,1,8,

		  3,9,4,
		  3,4,2,
		  3,2,6,
		  3,6,8,
		  3,8,9,

		  4,9,5,
		  2,4,11,
		  6,2,10,
		  8,6,7,
		  9,8,1

		  ];

var numIcoVertices = 60; // 3 * 20
var sphVertBuf;
var sphColBuf;

function initBuffers(){
	
	
	var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
	
	divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], 4);

	//icosahedron
	CreateIcosahedron();
	
	indexBuf = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(icoIndices), gl.STATIC_DRAW);

	icoBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, icoBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(icoVertices), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(icoBuf);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);

	icoColBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, icoColBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(icoColors), gl.STATIC_DRAW);
	gl.vertexAttribPointer(aVertexColor, 3, gl.FLOAT, false, 0,0);	


	vertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	colBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
	normBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normals),  gl.STATIC_DRAW);

	refineIcoSphere(5);
	sphVertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphVertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices),  gl.STATIC_DRAW);

	sphColBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphColBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereColors),  gl.STATIC_DRAW);
	
}
function render(){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.viewport(0,0,canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	pMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
	//mat4.identity(mvMatrix);
	
	theta += 1;
	gl.uniform1f(fTheta, theta);
	
	//set mvMatrix to identity
	mvMatrix = mat4();
	var x = [1.0,1.0,1.0];
	var scal = scale2(1,0.5,1);
	console.log(scal);
	mvMatrix = mult( mvMatrix, scal);	
	//translate to origin
	var trans = translate ( 0.0, 0.0, -6.0);
	mvMatrix = mult(trans, mvMatrix);
	
	//rotate
	var rot = rotate(theta, vec3(0.0, 1.0, 0.0));
	mvMatrix = mult (mvMatrix, rotMat);

	//translate back
	// var trans = translate ( 0.0, 0.0, -4.0);
	// mvMatrix = mult(trans, mvMatrix);
	
	//	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
	//	gl.bindBuffer(gl.ARRAY_BUFFER, icoBuf);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphVertBuf);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);
	
	//	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	//	gl.bindBuffer(gl.ARRAY_BUFFER,icoColBuf);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphColBuf);
	gl.vertexAttribPointer(aVertexColor, 3, gl.FLOAT, false, 0,0);
	
	//	gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
	//	gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0,0);
	
	gl.uniformMatrix4fv(pMatrixUnif, false, flatten(pMatrix));
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(mvMatrix));
	
	gl.enable(gl.DEPTH_TEST);
	//	gl.drawArrays(gl.TRIANGLES, 0, points.length);
	//	gl.drawArrays(gl.POINTS, 0, icoVertices.length);
	//	gl.drawElements(gl.TRIANGLES, icoIndices.length, gl.UNSIGNED_BYTE, 0);
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
	
	window.requestAnimFrame(render);
}

function divideTetra(a, b, c, d, count)
{
	if(count === 0){
		tetra(a,b,c,d);
	}
	else{
	var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );
		--count;
		
	divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
	}
}
function tetra(a, b, c, d)
{
	triangle(a, c, b, 0);
	triangle( a,c,d,1);
	triangle(a,b,d,2);
	triangle(b,c,d,3);
}

function triangle(a,b,c,color)
{
	var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.5, 0.0, 0.5)
    ];
		var ab = vec3(a,b);
		var bc = vec3(b,c);
		var ca = vec3(c,a);
		var n1 = cross(ab,ca);
		normals.push(n1);
		var n2 = cross(ab,bc);
		var n3 = cross(bc,ca);
		normals.push(n2);
		normals.push(n3);
		colors.push(baseColors[color]);
		points.push(a);
		colors.push(baseColors[color]);
		points.push(b);
		colors.push(baseColors[color]);
		points.push(c);
}
var icoVertices = [];
var sphereVertices = [];
var sphereIndices = [];
var sphereColors = [];
function refineIcoSphere(count)
{
    sphereVertices = [];
    sphereColors = [];
    
    //take triangles of icosahedron
    for(var i = 0; i < icoIndices.length; i+= 3)
	{
	    divideTriangle(icoVertices[icoIndices[i]], icoVertices[icoIndices[i+1]], icoVertices[icoIndices[i+2]], count);
	}

    //sub-divide each triangle recursively
    console.log("Sphere vertices: " + sphereVertices.length + " " + sphereColors.length);
    
}
function sphTriangle(a,b,c)
{
    //right now sphere vertices dont have indices - indices to be generated later
    var col = vec3(Math.random(), Math.random(), Math.random());
    sphereVertices.push(a);
    sphereVertices.push(b);
    sphereVertices.push(c);

    sphereColors.push(col);    sphereColors.push(col);    sphereColors.push(col);
    
}
function divideTriangle(a, b, c, count)
{
    if(count > 0){
	var ab = normalize(mix(a, b, 0.5), false);
	var ac = normalize(mix(a, c, 0.5), false);
	var bc = normalize(mix(b, c, 0.5), false);

	divideTriangle(a, ab, ac, count -1);
	divideTriangle(ab, b, bc, count -1);
	divideTriangle(bc, c, ac, count -1);
	divideTriangle(ab, bc, ac, count-1);
    }
    else{
	sphTriangle(a,b,c);
    }

}
function CreateIcosahedron()
{
    icoColors = [];
    var t = (1.0 + Math.sqrt(3.0))/ 2.0;
    icoVertices.push(vec3(-1, t, 0));
    icoVertices.push(vec3(1, t, 0));
     icoVertices.push(vec3(-1,-t, 0));
 icoVertices.push(vec3(1, -t, 0));

 icoVertices.push(vec3(0,-1, t));
  icoVertices.push(vec3(0, 1, t));
   icoVertices.push(vec3(0, -1, -t));
    icoVertices.push(vec3(0, 1, -t));
    

    icoVertices.push(vec3(t,0,-1));
    icoVertices.push(vec3(t,0,1));
    icoVertices.push(vec3(-t,0,-1));
    icoVertices.push(vec3(-t,0,1));

    icoColors.push(vec3(1.0, 0.0, 0.0));
    icoColors.push(vec3(0.0, 1.0, 0.0));
    icoColors.push(vec3(0.0, 0.0, 1.0));
    icoColors.push(vec3(0.8, 0.0, 0.0));
    icoColors.push(vec3(0.0, 0.8, 0.8));
    icoColors.push(vec3(1.0, 1.0, 1.0));
    icoColors.push(vec3(0.0, 0.0, 0.0));
    icoColors.push(vec3(0.8, 0.8, 0.0));
    icoColors.push(vec3(0.8, 0.0, 0.8));
    icoColors.push(vec3(0.2, 0.8, 0.0));
    icoColors.push(vec3(0.0, 0.2, 0.8));
    icoColors.push(vec3(0.0, 0.8, 0.2));

    for(var i = 0; i < icoVertices.length; i++)
	{
	    icoVertices[i] = normalize(icoVertices[i]);
	}

}