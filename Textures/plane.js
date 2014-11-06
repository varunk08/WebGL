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
this.vertAttrLoc = -1;
this.colAttrLoc = -1;
this.texAttrLoc = -1;
this.normalAttrLoc = -1;
};

//vertex attib locations needed
Plane.prototype.genBuffers = function(shaderID)
{
	this.shaderProgram = shaderID;

	gl.useProgram(shaderID);

	this.vertAttrLoc = gl.getAttribLocation(shaderID, "aVertexPosition");
	this.colAttrLoc = gl.getAttribLocation(shaderID, "aVertexColor");
	this.texAttrLoc = gl.getAttribLocation(shaderID, "aTexCoord");
	this.normalAttrLoc = gl.getAttribLocation(shaderID, "aVertexNormal");

	console.log("Plane: " + this.vertAttrLoc+" "+this.colAttrLoc+" "+this.texAttrLoc+" "+this.normalAttrLoc);
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
	this.texCoordBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.planeTexCoords),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.texAttrLoc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.texAttrLoc);



}

Plane.prototype.genTextures = function(image)
{
	gl.useProgram(this.shaderProgram);
	this.texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );

    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
   this.textureLoc = gl.getUniformLocation(this.shaderProgram, "texture");
}

Plane.prototype.drawPlane = function()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeVertBuf);
	gl.vertexAttribPointer(this.vertAttrLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeNormalBuf);
	gl.vertexAttribPointer(this.normalAttrLoc, 3, gl.FLOAT, false, 0, 0);	

	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeColBuf);	
	gl.vertexAttribPointer(this.colAttrLoc, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuf);
	gl.vertexAttribPointer(this.texAttrLoc, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.planeIndexBuf);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.uniform1i(this.textureLoc, 0);
	gl.drawElements(gl.TRIANGLES, /*num vertices*/ 6, gl.UNSIGNED_BYTE, 0 );

}
