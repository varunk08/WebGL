

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



function initBuffers(){
	objBuff1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objBuff1);
	var vertices = [0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}
var gl;
var canvas;
var program1;
var aVertexPosition;
var objBuff1;
var theta = 0.0;
var fTheta;
var pMatrixUnif;
var mvMatrixUnif;
var mvMatrix; 
var pMatrix;

window.onload = function init(){

	canvas = document.getElementById("mycanvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if ( !gl ) { alert( "WebGL isn't available" ); }

	initBuffers();
	mvMatrix = mat4.create();
	pMatrix = mat4.create();
	program1 = initShaders(gl, "vs", "fs");
	gl.useProgram(program1);
	
	aVertexPosition = gl.getAttribLocation(program1, "aVertexPosition");
	gl.enableVertexAttribArray(aVertexPosition);
	pMatrixUnif = gl.getUniformLocation(program1, "uPMatrix");
	mvMatrixUnif = gl.getUniformLocation(program1, "uMVMatrix");

	render();
}

function render(){
	gl.clearColor(1.0, 0.0, 0.0, 1.0);
	gl.viewport(0,0,canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);
	

	gl.bindBuffer(gl.ARRAY_BUFFER, objBuff1);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0,0);
	gl.uniformMatrix4fv(pMatrixUnif, false, pMatrix);
	gl.uniformMatrix4fv(mvMatrixUnif, false, mvMatrix);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	//window.requestAnimFrame(render);
}

