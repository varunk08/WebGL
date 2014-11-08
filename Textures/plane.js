//---Plane class---

var Plane = function(){
	console.log("Plane created");

//data	
	this.planeVertices = [
	vec3(-1.0, 0.0, -1.0),
	vec3(-1.0, 0.0, 1.0),
	vec3(1.0, 0.0, 1.0),
	vec3(1.0, 0.0, -1.0),
	vec3(0.0, 0.0, 0.0)
	
	];

	this.planeIndices = [
	0,1,4,
	1,2,4,
	2,3,4,
	3,0,4
	];

this.planeNormals = [
	vec3(0.0, 1.0, 0.0),
	vec3(0.0, 1.0, 0.0),
	vec3(0.0, 1.0, 0.0),
	vec3(0.0, 1.0, 0.0),
	vec3(0.0, 1.0, 0.0)
];

this.planeTexCoords = [
	
	vec2(0.0, 1.0),
	vec2(0.0, 0.0),
	vec2(1.0, 0.0),
	vec2(1.0, 1.0),
	vec2(0.5,0.5),
];
this.planeColors = [
	1.0, 0.0, 0.0,
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

this.materialAmbient = vec4(0.2125, 0.1275, 0.054, 1.0);
this.materialDiffuse = vec4(0.714, 0.4284, 0.18144, 1.0);
this.materialSpecular = vec4(0.393548, 0.271906, 0.166721, 1.0);
this.shininess = 25.6;
var texSize = 256;
var numChecks = 16;
this.checkImage = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
            this.checkImage [4*i*texSize+4*j] = c;
            this.checkImage [4*i*texSize+4*j+1] = c;
            this.checkImage [4*i*texSize+4*j+2] = c;
            this.checkImage [4*i*texSize+4*j+3] = 255;
        }
    }

};
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
//vertex attrib locations needed
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
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.planeVertices),gl.STATIC_DRAW);

	gl.vertexAttribPointer(this.vertAttrLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.vertAttrLoc);
	
	//normals
	this.planeNormalBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.planeNormalBuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.planeNormals),gl.STATIC_DRAW);
	
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
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.planeTexCoords),gl.STATIC_DRAW);
	
	gl.vertexAttribPointer(this.texAttrLoc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.texAttrLoc);

	//lighting and material properties
	this.unif_ambientProduct = gl.getUniformLocation(shaderID, "ambientProduct");
	this.unif_diffuseProduct = gl.getUniformLocation(shaderID, "diffuseProduct");
	this.unif_specularProduct = gl.getUniformLocation(shaderID, "specularProduct");
	this.unif_shininess = gl.getUniformLocation(shaderID, "shininess");
    this.unif_lightPosition = gl.getUniformLocation(shaderID, "lightPosition");
	this.unif_spotLightDir = gl.getUniformLocation(shaderID, "spotLightDir");
    

}
Plane.prototype.updateLightParams = function(lightIntensities, lightPositions)
{
	this.lightIntensities = lightIntensities;
	this.lightPos = lightPositions.lightPos;
	
	this.spotLightPos = lightPositions.spotLightPos;
	//console.log(this.spotLightDir);
	this.ambProd = mult(this.lightIntensities.amb, this.materialAmbient);
	this.diffProd = mult(this.lightIntensities.diff, this.materialDiffuse);
	this.specProd = mult(this.lightIntensities.spec, this.materialSpecular);
	
	
}
Plane.prototype.genTextures = function(image)
{
var texSize = 256;
	gl.useProgram(this.shaderProgram);
	this.texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.checkImage );
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,  gl.RGBA, gl.UNSIGNED_BYTE, this.checkImage);
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
	
	gl.uniform4fv( this.unif_ambientProduct,flatten(this.ambProd) );
    gl.uniform4fv( this.unif_diffuseProduct,flatten(this.diffProd) );
    gl.uniform4fv( this.unif_specularProduct,flatten(this.specProd) );	
    gl.uniform1f( this.unif_shininess,this.shininess );

	
	gl.drawElements(gl.TRIANGLES, /*num vertices*/ 12, gl.UNSIGNED_BYTE, 0 );

}
