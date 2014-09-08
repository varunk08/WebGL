var canvas;
var gl;
var program;
var points = [];
var colors = [];
var vertices = [];
var thetaSlider;
var subdivideSlider;
var polyDD;
var thetaLabel;
var subLabel;
var thetaUnif;
var swirlUnif;
var fTheta = 0.0;
var swirl = 0;
var currentPoly;
var currentSubLevel;

function ThetaChanged(value)
{
	fTheta = thetaSlider.value * Math.PI / 180;
	thetaLabel.innerHTML = thetaSlider.value;
	render();
}
function SubChanged(value)
{
	subLabel.innerHTML = subdivideSlider.value;
	currentSubLevel = Number(subdivideSlider.value);
 	UpdatePointsAndColors();
	
	UpdateBuffers();
	render();
}
function UpdateBuffers()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

}
function SwirlChanged(value)
{
	swirl = value;
	render();
}
function UpdatePointsAndColors()
{
	var value = currentSubLevel;
	points = [];
	colors = [];
	if(currentPoly === "triangle"){
		BisectTriangles(Number(value), vertices[0], vertices[1], vertices[2]);
	}
	else if(currentPoly === "square"){
		BisectTriangles(Number(value), vec2(0,0), vertices[0], vertices[1]);
		BisectTriangles(Number(value), vec2(0,0),  vertices[1], vertices[2]);
		BisectTriangles(Number(value), vec2(0,0), vertices[2], vertices[3]);
		BisectTriangles(Number(value), vec2(0,0), vertices[3], vertices[0]);
	}
}
function PolygonChanged(value)
{
	currentPoly = value;
	if(value === "square"){
		vertices = [];
		var a = vec2(0, 0.75);
		var b = vec2(0.75, 0);
		var c = vec2(0, -0.75);
		var d = vec2(-0.75, 0);
		vertices.push(a,b,c,d);
	}
	else if (value === "triangle")
	{
		vertices = [];
		OriginCenteredTriangle(120);
	}
	UpdatePointsAndColors();
	//calculate new vertices
	//update buffers
	UpdateBuffers();
	//render
	render();
}
function InitUIControls()
{
	thetaSlider = document.getElementById("thetaSlider");
	subdivideSlider = document.getElementById("depthSlider");
	thetaLabel = document.getElementById("thetaVal");
	subLabel = document.getElementById("subVal");
	thetaLabel.innerHTML = thetaSlider.value;
	subLabel.innerHTML = subdivideSlider.value;
	polyDD = document.getElementById("polyDropdown");
	fTheta = thetaSlider.value * Math.PI / 180;
	currentPoly = polyDD.value;
	currentSubLevel = Number(subdivideSlider.value);
}
var attrVPos;
var attrVCol;
function InitUniforms()
{
	attrVPos = gl.getAttribLocation(program, "aVertexPosition");
	attrVCol = gl.getAttribLocation(program, "aVertexColor");
	thetaUnif = gl.getUniformLocation(program, "theta");
	swirlUnif = gl.getUniformLocation(program, "swirl");
}

var posBuf;
var colBuf;
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
	InitUIControls();
	program = initShaders(gl, "vs", "fs");
	gl.useProgram(program);
	InitUniforms();
	
	
	BisectTriangles(subdivideSlider.value, vertices[0], vertices[1], vertices[2]);
	

	posBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	
	gl.vertexAttribPointer(attrVPos, 2, gl.FLOAT,false, 0,0);
	gl.enableVertexAttribArray(attrVPos);

	colBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

	gl.vertexAttribPointer(attrVCol, 3, gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(attrVCol);
	
	render();
}
function UpdateUniforms()
{
	gl.uniform1f(thetaUnif, fTheta);
	gl.uniform1i(swirlUnif, swirl);
}
function render()
{
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	UpdateUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, points.length);

}

function BisectTriangles(count, a, b, c)
{
	if(count === 0){
		triangle(a, b, c);
		
	}
else{

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
