import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import {ServerLandGenerator} from '../../voxeling/src/gameServer/generators/server-land';

function addLights() {
	var ambientLight = new THREE.AmbientLight(0x444444);
	ambientLight.intensity = 0.4;
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(900, 400, 0).normalize();
	scene.add(directionalLight);

	directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(900, -400, 0).normalize();
	scene.add(directionalLight);

	directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(-900, -400, 0).normalize();
	scene.add(directionalLight);
}


function setupCamera() {
	camera.position.z = 1000;
	camera.position.y = 240;
	camera.position.x = 0;
	camera.lookAt(new THREE.Vector3(0,0,0));
}

function addGround() {
	var numSegments = 4*32;

	var generator = new ServerLandGenerator(32,null);
	var material = new THREE.MeshLambertMaterial({
		color: 0xccccff,
		wireframe: false
	});

	var terrain = new Uint8Array(numSegments*numSegments)
	let nMax=-1;
	let stat={min:10000,max:-10000};
	eval('window.generator=generator');;
	var x:any,z:any,sx:any,sz:any;
	for(let bz=0;bz<4*32;bz++){
		for(let bx=0;bx<4*32;bx++){
			var p:any = generator.getRelativePos([bx,0,bz]);
			//[ x , z ] = [ Math.floor(bx/32)-2 , Math.floor(bz/32)-2 ];
			//[ sx , sz ] = [ Math.floor(bx%32) , Math.floor(bz%32) ];
			//let chunkID = [x,0,z].join('|')	;
			if(!generator.ndsummit[p.chunkID]){
				var a=generator.makeChunkStruct(p.chunkID);
				generator.fillChunkVoxels(a,null,32);
			}
			let cube = new THREE.Mesh( new THREE.CubeGeometry( 5, 5, 5 ), material );
			cube.position.x=5*bx;
			cube.position.z=5*bz;
			cube.position.y=5*(generator.ndsummit[p.chunkID].get(
				p.offsetZ,
				p.offsetX
			)%32);
			//console.log(cube.position.y);
			scene.add( cube );
		}
	}
	//console.log('stats',stat);

	//var terrain = getTerrainPixelData();

	// keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
	// there's 5 segments, there's 11 vertices, and so forth.
	// The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
	// "skewing the landscape" then..

}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var controls = new OrbitControls( camera, renderer.domElement );

setupCamera();
addLights();
addGround();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

render();
