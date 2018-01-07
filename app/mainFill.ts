const ndarray2 = require('ndarray');

var img = <any>document.getElementById("landscape-image");
var canvas = <any>document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var width = img.width;
var height = img.height;
canvas.width = width;
canvas.height = height;
var blockSize=15;

var [mx,mz]=[img.width/blockSize,img.height/blockSize]
var materialsMap:any={
	water : 1
};
function drawVoxel(ndvoxels:any){
	for (var x=0; x<mx; x++) {
		for (var z=0; z<mz; z++) {
			ctx.fillStyle=['white','blue','green','yellow','red'][ndvoxels.get(x,0,z)];
			ctx.fillRect(x*blockSize ,z*blockSize, blockSize, blockSize);
		}
	}
}

var ndvoxels = new ndarray2(new Int8Array(width*1*height),[width,1,height]);
for (var x=0; x<mx; x++) {
	for (var z=0; z<mz; z++) {
		ndvoxels.set(x,0,z,0);
	}
}
function drawCircle(x:any,z:any,wx:any,wz:any){
	for(let i=0;i<=2*Math.PI;i+=Math.PI/360){
		ndvoxels.set(Math.floor(Math.cos(i)*wx+x),0,Math.floor(Math.sin(i)*wz+z),2);
	}
}
drawCircle(mx/3,mz/3,2,1);
drawCircle(mx/2,mz/2,23,18);
drawCircle(mx/3*2-2,mz/3*2-1,4,2);
drawCircle(mx/3,mz/3*2,1,1);
var added = addFlow(ndvoxels,mx,mz,Math.floor(mx/2),0,Math.floor(mz/2));
ndvoxels.set(0,0,0,4);
drawVoxel(ndvoxels);

ctx.fillStyle = "black";
ctx.textAlign = "center";
ctx.font = "7px Arial";
for(let t=0;t<added.length;t++){
	ctx.fillText(t,added[t].x*blockSize+blockSize/2,added[t].z*blockSize+blockSize);
}

function addFlow(ndvoxels:any,width:number,height:number,x:number,y:number,z:number,waterMaterial=materialsMap.water){
	let st:any[]=[];
	let added:any[]=[]
	//this.dumpVoxels(ndvoxels,width,height,y );
	if(ndvoxels.get(x,y,z) != waterMaterial){
		st.push({x:x, y:y, z:z});
		while (st.length>0 && added.length<5000){
			let n = st.pop();
			if(!ndvoxels.get(n.x, n.y, n.z) ){
				let west = {x:n.x, y:n.y, z:n.z};
				let east = {x:n.x, y:n.y, z:n.z};
				while (west.x>0 && !ndvoxels.get(west.x-1, west.y, west.z)){
					west.x--;
				}
				while (east.x<(width-1) && !ndvoxels.get(east.x+1, east.y, east.z)){
					east.x++;
				}
				for (let c=west.x; c<=east.x; c++){
					ndvoxels.set(c, n.y, n.z, waterMaterial);
					added.push({x:c, y:n.y, z:n.z});
					if(n.z>1 && !ndvoxels.get(c, n.y, n.z-1)){
						st.push({x:c, y:n.y, z:n.z-1});
					}
					if(n.z<(height-1) && !ndvoxels.get(c, n.y, n.z+1)){
						st.push({x:c, y:n.y, z:n.z+1});
					}
				}
			}
		}
	}
	//this.dumpVoxels(ndvoxels,width,height,y);
	return added;
}
