import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import {ServerLandGenerator} from '../../voxeling/src/gameServer/generators/server-land';
const ndarray = require('ndarray');

function addLights() {
	var ambientLight = new THREE.AmbientLight(0x444444);
	ambientLight.intensity = 0.8;
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(900, 400, 0).normalize();
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

function addGround1() {
	var numSegments = (2+2)*32;

	var generator = new ServerLandGenerator(32,null);
	var geometry = new THREE.PlaneGeometry(numSegments*10,numSegments*10, numSegments, numSegments);
	var material = new THREE.MeshLambertMaterial({
		color: 0xccccff,
		wireframe: false
	});

	let stat={min:10000,max:-10000};

	var heights = new ndarray( new Uint8Array(numSegments*numSegments),[numSegments,numSegments]);

	for(let bz=0;bz<numSegments;bz++){
		for(let bx=0;bx<numSegments;bx++){
			heights.set(bx,bz, (Math.sin(bx/10)*Math.sin(bz/10))*64/10 ) ;
		}
	}

	for (var i = 0; i < geometry.vertices.length; i++){
		geometry.vertices[i].z = heights.get(
			Math.floor(geometry.vertices[i].x/10)+numSegments/2,
			Math.floor(geometry.vertices[i].y/10)+numSegments/2
		)||-10
	}

	console.log("vertices length: " + geometry.vertices.length);
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var plane = new THREE.Mesh(geometry, material);
	var q = new THREE.Quaternion();
	q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
	plane.quaternion.multiplyQuaternions( q, plane.quaternion );

	scene.add(plane)
}

function addGround() {
	var numSegments = (2+2)*32;
	const multiplier = 10;

	var generator = new ServerLandGenerator(32,null);
	var geometry = new THREE.PlaneGeometry(numSegments*multiplier,numSegments*multiplier, numSegments, numSegments);
	var material = new THREE.MeshLambertMaterial({
		color: 0xccccff,
		wireframe: false
	});

	let stat={min:10000,max:-10000};
	var x:number,z:number;

	for (var i = 0; i < geometry.vertices.length; i++){
		x = Math.round(geometry.vertices[i].x)+numSegments*multiplier/2;
		z = Math.round(geometry.vertices[i].y)+numSegments*multiplier/2;
		var p:any = generator.getRelativePos([x,0,z]);
		if (!generator.ndsummit[p.chunkID]){
			var chunk=generator.makeChunkStruct(p.chunkID);
			generator.fillChunkVoxels(chunk,null,32);
		}
	}

	for (var i = 0; i < geometry.vertices.length; i++){
		x = Math.round(geometry.vertices[i].x)+numSegments*multiplier/2;
		z = Math.round(geometry.vertices[i].y)+numSegments*multiplier/2;

		var p:any = generator.getRelativePos([x,0,z]);

		geometry.vertices[i].z = 3 * (generator.ndsummit[p.chunkID].get(
			Math.floor(p.offsetZ/30)*30,
			Math.floor(p.offsetX/30)*30
		)||1);
	}

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var plane = new THREE.Mesh(geometry, material);
	var q = new THREE.Quaternion();
	q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
	plane.quaternion.multiplyQuaternions( q, plane.quaternion );

	scene.add(plane)
}
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
var renderer = new THREE.WebGLRenderer();
var controls = new OrbitControls( camera, renderer.domElement );

setupCamera();
addLights();
addGround();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

render();
