const path = require("path");
const utils = require('./utils');
const isProduction = false;
function resolve (dir) {
	return path.join(__dirname, '..', dir)
}

module.exports = {
	entry: {
		app: ["./app/main.ts"]
	},
	output: {
		path: __dirname,
		filename: "bundle.js"
	},
	module: {
		rules :[{
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				loaders: utils.cssLoaders({
					sourceMap: true,
					extract: isProduction
				}),
				cssSourceMap: !isProduction,
				cacheBusting: true,
				transformToRequire: {
					video: ['src', 'poster'],
					source: 'src',
					img: 'src',
					image: 'xlink:href'
				}
			}
		},{
			test: [/\.js$/],
			exclude: /node_modules/,
			loader: 'babel-loader'
		},{
			test: /\.(t|j)s$/,
			loader: 'ify-loader',
			enforce: 'post'
		},{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: ['ts-loader']
		},{
			// For all .css files except from node_modules
			test: /\.css$/,
			exclude: /node_modules/,
			use: [
				'style-loader',
				{ loader: 'css-loader', options: { modules: true } }
			]
		},{
			// For all .css files in node_modules
			test: /\.css$/,
			include: /node_modules/,
			use: ['style-loader', 'css-loader']
		}]
	},
	resolve: {
		extensions: ['.ts', '.js', '.es6']
	},
	node: {
	fs: 'empty'
	}
};
