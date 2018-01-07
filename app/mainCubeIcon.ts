var mouseChange = require('mouse-change');
//var _template = require ('lodash.template');
var _ = require ('lodash');
var shortid = require('shortid');

class CubeIcon {
	private angle: number=0;
	private lastMouse: number[]=[0,0];
	element: any;
	uuid: string='';
	styleElement:any=null;
	selected:boolean=false;
	text:string='';

	// http://www.eleqtriq.com/2010/11/natural-object-rotation-with-css3-3d/
	// https://davidwalsh.name/demo/css-cube.php
	cssTpl: any = `
		<style>
			#<%= uuid %> .cube-wrap {
				-webkit-perspective: calc(<%= width %>px * 8);
				-webkit-perspective-origin: 50% <%= width %>px;

				-moz-perspective: calc(<%= width %>px * 8);
				-moz-perspective-origin: 50% <%= width %>px;

				-ms-perspective: calc(<%= width %>px * 8);
				-ms-perspective-origin: 50% <%= width %>px;

				perspective: calc(<%= width %>px * 8);
				perspective-origin: 50% <%= width %>px;
				width: calc(<%= width %>px * 2.2);
				height: calc(<%= width %>px * 2.2);
				opacity: .8;
				cursor: pointer;
			}
			#<%= uuid %> .cube-wrap:hover {
				opacity:1;
			}

			#<%= uuid %> .cube-wrap.selected {
				opacity:1;
			}
			#<%= uuid %> .cube {
				--angle-x: -10deg;
				--angle-y: -20deg;
				position: relative;
				width: calc(<%= width %>px * 2);
				margin: 0 auto;

				-webkit-transform-style: preserve-3d;
				/*-webkit-animation: cube-spin 5s infinite linear;*/
				-webkit-transform: rotateX( var(--angle-x, 0)) rotateY( var(--angle-y, 0)) rotateZ( var(--angle-z, 0));

				-moz-transform-style: preserve-3d;
				/*-moz-animation: cube-spin 5s infinite linear;*/
				-moz-transform: rotateX( var(--angle-x, 0)) rotateY( var(--angle-y, 0)) rotateZ( var(--angle-z, 0));

				-ms-transform-style: preserve-3d;
				-ms-animation: cube-spin 5s infinite linear;
				-ms-transform: rotateX( var(--angle-x, 0)) rotateY( var(--angle-y, 0)) rotateZ( var(--angle-z, 0));

				transform-style: preserve-3d;
				/*animation: cube-spin 5s infinite linear;*/
				transform: rotateX( var(--angle-x, 0)) rotateY( var(--angle-y, 0)) rotateZ( var(--angle-z, 0));
			}

			#<%= uuid %> .cube div {
				position: absolute;
				width: calc(<%= width %>px * 2);
				height: calc(<%= width %>px * 2);
				background: rgba(255,255,255,0.1);
				box-shadow: inset 0 0 30px rgba(125,125,125,0.8);
				font-size: 11px;
				text-align: center;
				line-height: calc(<%= width %>px * 2);
				color: rgba(0,0,0,0.5);
				font-family: sans-serif;
				text-transform: uppercase;
			}

			#<%= uuid %> .depth div.back-pane {
				-webkit-transform: translateZ(-<%= width %>px) rotateY(180deg);
				-moz-transform: translateZ(-<%= width %>px) rotateY(180deg);
				-ms-transform: translateZ(-<%= width %>px) rotateY(180deg);

				transform: translateZ(-<%= width %>px) rotateY(180deg);
			}

			#<%= uuid %> .depth div.right-pane {
				-webkit-transform:rotateY(-270deg) translateX(<%= width %>px);
				-webkit-transform-origin: top right;

				-moz-transform:rotateY(-270deg) translateX(px);
				-moz-transform-origin: top right;

				-ms-transform:rotateY(-270deg) translateX(<%= width %>px);
				-ms-transform-origin: top right;

				transform:rotateY(-270deg) translateX(<%= width %>px);
				transform-origin: top right;
			}

			#<%= uuid %> .depth div.left-pane {
				-webkit-transform:rotateY(270deg) translateX(-<%= width %>px);
				-webkit-transform-origin: center left;

				-moz-transform:rotateY(270deg) translateX(-<%= width %>px);
				-moz-transform-origin: center left;

				-ms-transform:rotateY(270deg) translateX(-<%= width %>px);
				-ms-transform-origin: center left;

				transform:rotateY(270deg) translateX(-<%= width %>px);
				transform-origin: center left;
			}

			#<%= uuid %> .depth div.top-pane {
				-webkit-transform:rotateX(-90deg) translateY(-<%= width %>px);
				-webkit-transform-origin: top center;

				-moz-transform:rotateX(-90deg) translateY(-<%= width %>px);
				-moz-transform-origin: top center;

				-ms-transform:rotateX(-90deg) translateY(-<%= width %>px);
				-ms-transform-origin: top center;

				transform:rotateX(-90deg) translateY(-<%= width %>px);
				transform-origin: top center;
			}

			#<%= uuid %> .depth div.bottom-pane {
				-webkit-transform:rotateX(90deg) translateY(<%= width %>px);
				-webkit-transform-origin: bottom center;

				-moz-transform:rotateX(90deg) translateY(<%= width %>px);
				-moz-transform-origin: bottom center;

				-ms-transform:rotateX(90deg) translateY(<%= width %>px);
				-ms-transform-origin: bottom center;

				transform:rotateX(90deg) translateY(<%= width %>px);
				transform-origin: bottom center;
			}

			#<%= uuid %> .depth div.front-pane {
				-webkit-transform: translateZ(<%= width %>px);
				-moz-transform: translateZ(<%= width %>px);
				-ms-transform: translateZ(<%= width %>px);

				transform: translateZ(<%= width %>px);
			}

			#<%= uuid %> .depth div.cube-pan {
				font-size: 14px;
				color: #F7F7F7;
			}

			#<%= uuid %> .depth div.cube-pane {
			}

			#<%= uuid %> .selected .depth div.cube-pane{
				box-sizing: border-box;
				-moz-box-sizing: border-box;
				-webkit-box-sizing: border-box;
				border:1px solid #555;
			}
			#<%= uuid %> .depth:hover div.cube-pane{
				box-sizing: border-box;
				-moz-box-sizing: border-box;
				-webkit-box-sizing: border-box;
				border:1px solid #AAA;
			}
		</style>
	`;

	addCssTpl: any = ``;

	htmlTpl:any=`
		<div id="<%= uuid %>">
			<div class="cube-wrap">
				<div class="cube depth">
					<div class="cube-pane front-pane"  data-side="F"></div>
					<div class="cube-pane back-pane"   data-side="K"></div>
					<div class="cube-pane top-pane"    data-side="T"></div>
					<div class="cube-pane bottom-pane" data-side="B"></div>
					<div class="cube-pane left-pane"   data-side="L"></div>
					<div class="cube-pane right-pane"  data-side="R"></div>
				</div>
			</div>
		</div>
	`;

	constructor(element:any,opts:any){
		var self = this;
		self.element = element;
		opts.width = opts.width || 20;
		self.uuid = shortid.generate().replace(/-/g,'');
		self.htmlTpl = _.template(self.htmlTpl);
		self.cssTpl = _.template(self.cssTpl);
		self.addCssTpl = _.template(self.addCssTpl);

		mouseChange(this.element,function(b,x,y){
			self.angle += (self.lastMouse[0]>x)?-3:+3;
			self.lastMouse = [x,y];
			if (!self.styleElement){
				self.styleElement = document.querySelector('#'+self.uuid+' .cube');
			}
			self.styleElement.style.setProperty( '--angle-y', (self.angle)+'deg' );
			//self.styleElement.style.setProperty( '--angle-x', (self.angle)+'deg' );
			//self.styleElement.style.setProperty( '--angle-z', (self.angle)+'deg' );
		});
		self.element.innerHTML = this.cssTpl( { uuid:self.uuid, width:opts.width }) +this.addCssTpl( { uuid:self.uuid, width:opts.width }) + this.htmlTpl({ uuid:self.uuid, width:opts.width } );
		if(opts.fn){
			opts.fn(this);
		}
	}

	public setSelected(v:boolean){
		this.selected=v;
		if(this.selected){
			document.querySelector('#'+this.uuid+' .cube-wrap').classList.add('selected');
		}else{
			document.querySelector('#'+this.uuid+' .cube-wrap').classList.remove('selected');
		}
	}

	public setText(text:string,faces:string='FKLR'){
		this.getPanes(faces).forEach(function(v:HTMLDivElement){
			v.innerHTML=text;
		})
	}

	public setImages(url:string,width:number=30,faces:string='FKTBLR'){
		this.getPanes(faces).forEach(function(v:HTMLDivElement){
			v.style.background = url ? (" url('"+url+"') no-repeat left top"):'';
			v.style.backgroundSize = url ? (''+width+'px '+width+'px'):'';
		});
	}

	public reset(){
		this.setSelected(false);
		this.setImages(null);
		this.setText('');
	}

	private getPanes(faces='FKTBLR'):HTMLDivElement[]{
		return _.filter(<HTMLDivElement[]>(this.element.querySelectorAll('.cube-pane')),function(v){
			return faces.indexOf(v.dataset['side'])!==-1;
		});
	}
}

var ic1:CubeIcon,ic2:CubeIcon,ic3:CubeIcon;
const createArtPacks = require('artpacks');
const packs = createArtPacks(['./ProgrammerArt-ResourcePack.zip']);
packs.on('loadedURL', function(url){
	ic1 = new CubeIcon(document.querySelector('#renderer' ),{
		width : 12,
		fn : function(cubeIcon:CubeIcon){
			cubeIcon.setImages(packs.getTexture('dirt'),30);
		}
	});
	ic2 = new CubeIcon(document.querySelector('#renderer2'),{
		width : 12,
		fn : function(cubeIcon:CubeIcon){
			cubeIcon.setImages(packs.getTexture('stone'),30);
		}
	});
	ic2.setSelected(true);
	ic2.setText("12");
	ic3 = new CubeIcon(document.querySelector('#renderer3'),{
		width : 12,
		fn : function(cubeIcon:CubeIcon){
			cubeIcon.setImages(packs.getTexture('stone'),30);
		}
	});
	ic3.setSelected(true);
	ic3.setText("12");
	ic3.reset();
});
(<any>window).e={
	packs
};


(<any>document.querySelector('#action')).onclick=function(){
	ic2.setSelected(!ic2.selected);
}
