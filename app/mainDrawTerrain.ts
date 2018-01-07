import OpenSimplexNoise from 'open-simplex-noise';
const seedrandom = require('seedrandom');

const rng = seedrandom('hello');
const [width, height] = [32,32];
const openSimplex = new OpenSimplexNoise(rng)

function getTerrain(offsetX:number,offsetY:number){
	let value,m;
	var data:number[]=[];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			value=(
				//(openSimplex.noise2D(offsetX/16+x/16, offsetY/16+y/16) + 1) * 1
				 (openSimplex.noise2D(offsetX/16+x/16, offsetY/16+y/16) + 0.5) * 1
				+(openSimplex.noise2D(offsetX/8 +x/8, offsetY/8+y/8) + 0.5) * 0.5
			)/(1*2)
			if(value<0){
				m=Math.min(value,m);
			}
			data.push(value);
		}
	}
	console.log(m);
	return data;
}

function drawterrain(data:number[]){
	const canvas:HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const ocanvas:HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas')
	const ratio=4;
	ocanvas.width=width;
	ocanvas.height=height;
	canvas.width=width*ratio;
	canvas.height=height*ratio;
	const octx = ocanvas.getContext('2d');
	const imageData = octx.createImageData(width, height);

	var value,idx;
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			idx = (x + y * width) * 4;
			value = data[x + y * width];
			imageData.data[idx + 0] = value>0?value*255:0;
			imageData.data[idx + 1] = value>0?value*255:0;
			imageData.data[idx + 2] = value<0?255:value*255;
			imageData.data[idx + 3] = 255;
		}
	}
	octx.putImageData(imageData, 0, 0);

	ctx.imageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.drawImage(ocanvas,0,0,width,height,0,0,width*ratio,height*ratio);
	document.getElementById('final').appendChild(canvas);
}
const n=4;
(<HTMLDivElement>document.getElementById('final')).style.width=''+4*32*n+'px';
for (var y=0;y<n;y++){
	for (var x=0;x<n;x++){
		drawterrain(getTerrain( x*32,y*32));
	}
}
