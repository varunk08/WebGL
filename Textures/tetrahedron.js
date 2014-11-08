var Tetra = function()
{
	this.vertices = [
		vec3(0.0, 0.0, -1.0),
		vec3(0.0, 0.942809, 0.333333),
		vec3(-0.816497, -0.471405, 0.333333), 
		vec3(0.816497, -0.471405, 0.333333)
	];

	this.tetVertices = [];
	this.tetNormals = [];
	this.tetFaceIndices = [];
	this.tetColors = [];
	this.tetTexCoords = [];
	this.index = 0;
	this.tetrahedron(this.vertices[0],this.vertices[1],this.vertices[2],this.vertices[3]);

		
};

Tetra.prototype.tetrahedron = function(a, b, c, d)
{
	this.createTriangle(a, b, c, 0.0);
    	this.createTriangle(d, c, b, 1.0);
    	this.createTriangle(a, d, b, 2.0);
    	this.createTriangle(a, c, d, 3.0);
	
}

Tetra.prototype.createTriangle = function(a,b,c, index)
{
	//console.log("creating triangle for: " + index);
	//vertices
	this.tetVertices.push(a);
	this.tetVertices.push(b);
	this.tetVertices.push(c);

	//normals
	var t1 = subtract(b, a);
	var t2 = subtract(c, a);
     	var normal = normalize(cross(t1, t2));
	normal = vec3(normal);

	this.tetNormals.push(normal);
	this.tetNormals.push(normal);
	this.tetNormals.push(normal);
	
	//indices
	this.tetFaceIndices.push(parseFloat(index));
	this.tetFaceIndices.push(parseFloat(index));
	this.tetFaceIndices.push(parseFloat(index));

	//colors
	var col = vec3(Math.random(), Math.random, Math.random());
	this.tetColors.push(col);
	this.tetColors.push(col);	
	this.tetColors.push(col);

	//tex coords
	this.tetTexCoords.push(vec2(0.0,0.0));
	this.tetTexCoords.push(vec2(0.0,1.0));
	this.tetTexCoords.push(vec2(1.0,0.0));

	//this.index += 3;
}

Tetra.prototype.genBuffers = function(shaderID)
{

	this.shaderProgram = shaderID;

	gl.useProgram(shaderID);

	this.vertAttrLoc = gl.getAttribLocation(shaderID, "aVertexPosition");
	this.colAttrLoc = gl.getAttribLocation(shaderID, "aVertexColor");
	this.texAttrLoc = gl.getAttribLocation(shaderID, "aTexCoord");
	this.normalAttrLoc = gl.getAttribLocation(shaderID, "aVertexNormal");
	this.faceIndexAttrLoc = gl.getAttribLocation(shaderID, "aFaceIndex");

	console.log("Tetra: "+this.vertAttrLoc+" "+this.colAttrLoc+" "+this.texAttrLoc+" "+this.normalAttrLoc);

	//indices
	this.tetFaceIndexBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetFaceIndexBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tetFaceIndices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.faceIndexAttrLoc, 1, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.faceIndexAttrLoc);

	//vertex
	this.tetVertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetVertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tetVertices),gl.STATIC_DRAW);

	gl.vertexAttribPointer(this.vertAttrLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.vertAttrLoc);

	//Colors
	this.tetColBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetColBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tetColors),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.colAttrLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.colAttrLoc);

	//normals
	this.tetNormalBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetNormalBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tetNormals),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.normalAttrLoc, 3, gl.FLOAT, false, 0, 0);	
	gl.enableVertexAttribArray(this.normalAttrLoc);
	
	
	//tex coords
	this.tetTexCoordBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetTexCoordBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tetTexCoords),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.texAttrLoc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.texAttrLoc);

	
}
Tetra.prototype.genTextures = function(a, b, c, d)
{
	gl.useProgram(this.shaderProgram);

	this.texture1 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture1);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, a );
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	this.texture2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture2);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, b );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	this.texture3 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture3);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, c );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	this.texture4 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture4);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, d );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	this.texture1Loc = gl.getUniformLocation(this.shaderProgram, "texture1");
	this.texture2Loc = gl.getUniformLocation(this.shaderProgram, "texture2");
	this.texture3Loc = gl.getUniformLocation(this.shaderProgram, "texture3");
	this.texture4Loc = gl.getUniformLocation(this.shaderProgram, "texture4");
	//console.log("Tex units: " +this.texture1Loc+" "+this.texture2Loc+" "+this.texture3Loc+" "+this.texture4Loc);
		
}


Tetra.prototype.drawTet = function()
{
	gl.useProgram(this.shaderProgram);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetFaceIndexBuf);
	gl.vertexAttribPointer(this.faceIndexAttrLoc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetColBuf);
	gl.vertexAttribPointer(this.colAttrLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetNormalBuf);
	gl.vertexAttribPointer(this.normalAttrLoc, 3, gl.FLOAT, false, 0, 0);	

	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetTexCoordBuf);
	gl.vertexAttribPointer(this.texAttrLoc, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.tetVertBuf);
	gl.vertexAttribPointer(this.vertAttrLoc, 3, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture1);
	gl.uniform1i(this.texture1Loc, 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, this.texture2);
	gl.uniform1i(this.texture2Loc, 1);

	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, this.texture3);
	gl.uniform1i(this.texture3Loc, 2);

	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, this.texture4);
	gl.uniform1i(this.texture4Loc, 3);

	gl.drawArrays(gl.TRIANGLES, 0, 12);
}
