var canvas;
var gl;
var program;
var points = [];
var colors = [];
var vertices = [];
window.onload = function init()
{
	canvas = document.getElementById("mycanvas");
	if(!canvas){
		alert("No canvas");
		return -1;
	}

	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){
		alert("No gl context");
		return -1;
	}

	OriginCenteredTriangle(120);
	BisectTriangles(4, vertices[0], vertices[1], vertices[2]);
	program = initShaders(gl, "vs", "fs");
	gl.useProgram(program);

	var posBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	var attrVPos = gl.getAttribLocation(program, "aVertexPosition");
	gl.vertexAttribPointer(attrVPos, 2, gl.FLOAT,false, 0,0);
	gl.enableVertexAttribArray(attrVPos);

	var colBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

	var attrVCol = gl.getAttribLocation(program, "aVertexColor");
	gl.vertexAttribPointer(attrVCol, 3, gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(attrVCol);

	render();
}

function render()
{
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLES, 0, points.length);

}

function BisectTriangles(count, a, b, c)
{
	if(count === 0){
		triangle(a, b, c);
		return;
	}


//divide - create vertices then triangles 
var ab = mix(a,b,0.5);
var bc = mix(b,c,0.5);
var ca = mix(c,a,0.5);
//decrement count
--count;
//call bisect on 4 children
BisectTriangles(count, a, ab, ca);
BisectTriangles(count, ab, b, bc);
BisectTriangles(count, ca, bc, c);
BisectTriangles(count, ab, ca, bc);

}

function triangle(a, b, c)
{
	var color = vec3(Math.random(), Math.random(), Math.random());

	points.push(a);
	colors.push(color);
	points.push(b);
	colors.push(color);
	points.push(c);
	colors.push(color);
}

function OriginCenteredTriangle(angle)
{
	var firstPt = vec2(0, 0.75);
	var cos = Math.cos(Math.PI * angle / 180);
	var sin = Math.sin(Math.PI * angle / 180);
	var secondPt = vec2(
						firstPt[0] * cos - firstPt[1] * sin,
						firstPt[1] * cos + firstPt[0] * sin
					);
	var thirdPt = vec2( secondPt[0] * cos - secondPt[1] * sin,
						secondPt[1] * cos + secondPt[0] * sin
						);

	vertices.push(firstPt, secondPt,thirdPt);

}