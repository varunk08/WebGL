

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

window.onload = function init(){

	canvas = document.getElementById("mycanvas");
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
	fTheta = gl.getUniformLocation(program1, "theta");
	pMatrixUnif = gl.getUniformLocation(program1, "uPMatrix");
	mvMatrixUnif = gl.getUniformLocation(program1, "uMVMatrix");
var trans = translate ( 0.0, 0.0, -4.0);
	mvMatrix = mult(trans, mvMatrix);
	render();
}

function initBuffers(){
	
	var vertices = [
			vec3(0.0,  1.0,  -3.0),
            vec3(0.5, -1.0,  -2.0),
             vec3(-0.5, -1.0,  -2.0),
			 vec3(0.0, -1.0, -4.0)
			 ];
	 vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
	
	divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], 4);
	
	vertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	colBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
}
function render(){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.viewport(0,0,canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	pMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
	//mat4.identity(mvMatrix);
	
	theta += 0.1;
	gl.uniform1f(fTheta, theta);
	
	//translate to origin
	var trans = translate ( 0.0, 0.0, 4.0);
	mvMatrix = mult(trans, mvMatrix);
	
	//rotate
	var rot = rotate(2, vec3(0.0, 1.0, 0.0));
	mvMatrix = mult (rot, mvMatrix);
	
	//translate back
	var trans = translate ( 0.0, 0.0, -4.0);
	mvMatrix = mult(trans, mvMatrix);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	gl.vertexAttribPointer(aVertexColor, 3, gl.FLOAT, false, 0,0);
	
	gl.uniformMatrix4fv(pMatrixUnif, false, flatten(pMatrix));
	gl.uniformMatrix4fv(mvMatrixUnif, false, flatten(mvMatrix));
	gl.enable(gl.DEPTH_TEST);
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
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
        vec3(0.0, 0.0, 0.0)
    ];
		colors.push(baseColors[color]);
		points.push(a);
		colors.push(baseColors[color]);
		points.push(b);
		colors.push(baseColors[color]);
		points.push(c);
}