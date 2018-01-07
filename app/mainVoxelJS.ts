var voxel = require('voxel');
const ndarray = require('ndarray');
var fly = require('voxel-fly');
var voxelEngine = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var extend = require('extend')
var walk = require('voxel-walk')

import {ServerLandGenerator} from '../../voxeling/src/gameServer/generators/server-land';

var textures = "http://commondatastorage.googleapis.com/voxeltextures/";
var generator = new ServerLandGenerator(32,null);
var t = 0;
let chunkCache:any={};


function createGame() {
	var opts:any = {
		chunkDistance		: 2,
		materials			: ['#fff', '#000'],
		materialFlatColor	: true,
		worldOrigin			: [0, 0, 0],
		controls			: { discreteFire: true },
		texturePath			: textures,
		playerSkin			: textures + 'player.png',
		generate			: function(x:any,y:any,z:any){
			var x2:number,y2:number,z2:number;
			[x2,y2,z2]=[Math.floor(x/32),Math.floor(y/32),Math.floor(z/32)]
			var chunkID = [x2,y2,z2].join('|');
			if(!chunkCache[chunkID]){
				chunkCache[chunkID] = ndarray(new Uint8Array(generator.get(chunkID).voxels), [32 , 32 , 32 ])
				console.log(x,x2*32,'|',y,y2*32,'|',z,z2*32)
			}
			return chunkCache[chunkID].get(z-z2*32,y-y2*32,x-x2*32);
		}
	}
	var game = voxelEngine(opts)
	var container = opts.container || document.body
	//window.game = game // for debugging
	game.appendTo(container)
	if (game.notCapable()) return game

	var createPlayer = player(game)

	// create the player from a minecraft skin file and tell the
	// game to use it as the main player
	var avatar = createPlayer(opts.playerSkin || 'player.png')
	avatar.possess()
	avatar.yaw.position.set(2, 64, 4)

	var makeFly = fly(game)
	var target = game.controls.target()
	game.flyer = makeFly(target)

	// highlight blocks when you look at them, hold <Ctrl> for block placement
	var blockPosPlace:any, blockPosErase:any;
	var hl:any = game.highlighter = highlight(game, { color: 0xff0000 })

	hl.on('highlight', function (voxelPos:any) { blockPosErase = voxelPos })
	hl.on('remove', function (voxelPos:any) { blockPosErase = null })
	hl.on('highlight-adjacent', function (voxelPos:any) { blockPosPlace = voxelPos })
	hl.on('remove-adjacent', function (voxelPos:any) { blockPosPlace = null })

	// toggle between first and third person modes
	window.addEventListener('keydown', function (ev:any) {
		if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
	})

	// block interaction stuff, uses highlight data
	var currentMaterial = 1

	game.on('fire', function (target:any, state:any) {
		var position = blockPosPlace
		if (position) {
			game.createBlock(position, currentMaterial)
		}
		else {
			position = blockPosErase
			if (position) game.setBlock(position, 0)
		}
	})

	game.on('tick', function() {
		walk.render(target.playerSkin)
		var vx = Math.abs(target.velocity.x)
		var vz = Math.abs(target.velocity.z)
		if (vx > 0.001 || vz > 0.001) walk.stopWalking()
		else walk.startWalking()
	})
}

createGame();
