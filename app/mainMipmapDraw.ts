require ('./main.css');
var createTileMap = require("gl-tile-map")
var ndarray = require("ndarray")
var texturePack = require("isabella-texture-pack")
var glm = require("gl-matrix")
var createVoxelMesh1 = require("./lib/createMesh")
var createAOShader = require("./lib/ao-shader")
var mat4 = glm.mat4
var fill = require("ndarray-fill")
var mouseChange = require("mouse-change")

class voxelIcon {
	private tileCount: number = 16
	private tileSize: number;
	private texture: any;
	private shader: any;
	private mesh: any;
	private models:any[]=[];
	private initialized=false;
	private camera:any;
	private shell:any;
	private currentModel=null;
	private changed=true;
	private angle: number=0;
	private lastMouse:number[]=[0,0];

	constructor(shell:any,camera:any){
		var self = this;
		this.shell=shell;
		if(!this.shell.gl){
			this.shell.on("gl-init", function(){
				self.glInit.call(self);
			});
		}else{
			self.glInit();
		}

		this.shell.on("gl-error",function(){
			self.glError.call(self);
		});

		this.shell.on("gl-render",function(t:any){
			self.glRender.call(self,t);
		});

		this.camera=camera;

		this.models['box'] = this.makeFill([8,8,8], function(i,j,k) {
			i=i-4;j=j-4;k=k-4;
			if(i <=-1 || i>=2 || j <= -1 || j >= 2 || k <= -1 || k >= 2) {
				return 0
			}
			return (1<<15) + 0x91;
		});

		this.models['sphere'] = this.makeFill([32,32,32], function(i,j,k) {
			var x = i - 16
			var y = j - 16
			var z = k - 16
			return (x*x + y*y + z*z) < 30 ? (1<<15) + 0x18 : 0
		});
		this.changeMesh('box');
	}

	private makeFill(size, func) {
		var result = ndarray(new Int32Array(size[0]*size[1]*size[2]), size)
		fill(result, func);
		return result;
	}

	glInit() {
		var self = this;
		this.initialized=true;
		this.shader = createAOShader(this.shell.gl)

		mouseChange(this.shell.element,function(b,x,y){
			self.angle+=(self.lastMouse[0]>x)?1:-1;
			self.lastMouse=[x,y];
		})
	}

	glError() {
		//(<HTMLDivElement>document.querySelector(".selectModel")).style.display = "none"
		//(<HTMLDivElement>document.querySelector(".noWebGL")).style.display = "none"
	}

	glRender(t:any) {
		var self = this;
		if(!this.initialized){
			return;
		}
		if(this.changed){
			this.tileSize = Math.floor(texturePack.shape[0] / this.tileCount)|0

			var tiles = ndarray(
				texturePack.data,
				[16,16,texturePack.shape[0]>>4,texturePack.shape[1]>>4,4],
				[texturePack.stride[0]*16, texturePack.stride[1]*16, texturePack.stride[0], texturePack.stride[1], texturePack.stride[2]],
				 0
			);
			self.texture = createTileMap(this.shell.gl, tiles, 2)
			self.texture.magFilter = this.shell.gl.LINEAR
			self.texture.minFilter = this.shell.gl.LINEAR_MIPMAP_LINEAR
			self.texture.mipSamples = 1;

			this.mesh = createVoxelMesh1(this.shell.gl, this.currentModel, this.models[this.currentModel]);
			var c = this.mesh.center;
			this.camera.lookAt([c[0]+this.mesh.radius*2, c[1], c[2]], c, [0,1,0]);
			this.changed=false;
		}

		//Calculation projection matrix
		var projection = mat4.perspective(new Float32Array(16), Math.PI/4.0, this.shell.width/this.shell.height, 1.0, 1000.0)
		var model = mat4.identity(new Float32Array(16))
		var view = this.camera.view()

		this.shell.gl.enable(this.shell.gl.CULL_FACE)
		this.shell.gl.enable(this.shell.gl.DEPTH_TEST)

		this.shader.bind()
		this.shader.attributes.attrib0.location = 0;
		this.shader.attributes.attrib1.location = 1;
		this.shader.uniforms.projection = projection;
		this.shader.uniforms.view = view;
		this.shader.uniforms.model = model;
		this.shader.uniforms.tileSize = this.tileSize;
		this.shader.uniforms.tileCount = this.tileCount;
		this.shader.uniforms.angle = self.angle/10;
		this.shader.uniforms.centerX = this.mesh.center[0];
		this.shader.uniforms.centerY = this.mesh.center[1];
		this.shader.uniforms.centerZ = this.mesh.center[2];
		this.shader.uniforms.tileMap = this.texture.bind();

		this.mesh.triangleVAO.bind();
		this.shell.gl.drawArrays(this.shell.gl.TRIANGLES, 0, this.mesh.triangleVertexCount)
		this.mesh.triangleVAO.unbind()
	}

	public changeMesh(name){
		this.currentModel = name;
		this.changed = true;
	}
}
/*
var shell1 = require("gl-now")({
	element :document.querySelector('#renderer'),
	clearColor : [0,0,0,0]
});
var camera1 = require("game-shell-orbit-camera")(shell1);
var vxlIcon = new voxelIcon(shell1,camera1);

var selectModel = document.querySelector("#selectModel");

selectModel.addEventListener("change",function(){
	vxlIcon.changeMesh((<any>selectModel).value);
})
*/

var shell2 = require("gl-now")({
	element :document.querySelector('#renderer2'),
	clearColor : [0,0,0,0]
});
var camera2 = require("game-shell-orbit-camera")(shell2);
var vxlIcon2 = new voxelIcon(shell2,camera2);
