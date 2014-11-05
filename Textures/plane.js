//---Plane class---

var Plane = function(){
	console.log("Plane created");

//data	
	this.planeVertices = [
	-1.0, 0.0, -1.0,
	-1.0, 0.0, 1.0,
	1.0, 0.0, 1.0,
	1.0, 0.0, -1.0
	];

	this.planeIndices = [
	0,1,2,
	0,2,3
	];

this.planeNormals = [
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0
];

this.planeTexCoords = [
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
];
this.planeColors = [
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0
];

//buffers
this.planeVertBuf; this.planeNormalBuf; this.planeColBuf; this.planeIndexBuf;
this.texCoordBuf;

//shader attributes
this.vertAttrLoc;
this.colAttrLoc;
this.texAttrLoc;
this.normalAttrLoc;
};

//vertex attib locations needed
Plane.prototype.genBuffers = function(vert, col, normal)
{
	this.vertAttrLoc = vert;
	this.colAttrLoc = col;
	//this.texAttrLoc = tex;
	this.normalAttrLoc = normal;

	//indices
	this.planeIndexBuf = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.planeIndexBuf);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.planeIndices), gl.STATIC_DRAW);

	//vertex
	this.planeVertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeVertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.planeVertices),gl.STATIC_DRAW);

	gl.vertexAttribPointer(this.vertAttrLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.vertAttrLoc);
	
	//normals
	this.planeNormalBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeNormalBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.planeNormals),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.normalAttrLoc, 3, gl.FLOAT, false, 0, 0);	
	gl.enableVertexAttribArray(this.normalAttrLoc);
	
	//Colors
	this.planeColBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeColBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.planeColors),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.colAttrLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.colAttrLoc);

	//tex coords
	/*this.texCoordBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.planeTexCoords),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.vertAttrLoc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.texAttrLoc);*/

}

Plane.prototype.drawPlane = function()
{
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.planeIndexBuf);
	gl.drawElements(gl.TRIANGLES, /*num vertices*/ 6, gl.UNSIGNED_BYTE, 0 );

}
