var icoVertices = [];
var sphereVertices = [];
var sphereIndices = [];
var sphereColors = [];
var sphereNormals = [];
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
function CreateSphere(subdivision)
{
	CreateIcosahedron();
	refineIcoSphere(subdivision);
}
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
function sphTriangle(a,b,c)
{
    //right now sphere vertices dont have indices - indices to be generated later
    var col = vec3(Math.random(), Math.random(), Math.random());
    //vertices
	sphereVertices.push(a); 
    sphereVertices.push(b);
    sphereVertices.push(c);
	/*var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t1, t2));
sphereNormals.push(normal);
	sphereNormals.push(normal);
	sphereNormals.push(normal);*/
	//normals - unit sphere 
	sphereNormals.push(normalize(a));
	sphereNormals.push(normalize(b));
	sphereNormals.push(normalize(c));
	
	//colors
    sphereColors.push(col);
    sphereColors.push(col);
    sphereColors.push(col);
    
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
