var path = require("path");
function resolve (dir) {
return path.join(__dirname, '..', dir)
}

module.exports = {
	entry: {
		app: ["./app/main.ts"]
	},
	output: {
		path: __dirname,
		publicPath: "/assets/",
		filename: "bundle.js"
	},
	module: {
		rules :[{
			test: [/\.js$/],
			exclude: /node_modules/,
			loader: 'babel-loader'
		},{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: ['ts-loader']
		}]
	},
	resolve: {
		extensions: ['.ts', '.js', '.es6']
	}
};
