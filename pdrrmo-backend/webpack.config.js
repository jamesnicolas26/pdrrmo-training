const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server.js', // Your backend entry file
  target: 'node', // Ensure this is targeting Node.js
  externals: [nodeExternals()], // Exclude node modules from the bundle
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory
    filename: 'server.bundle.js', // Output bundled file
  },
  mode: 'production', // Set to 'development' for debugging
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Use Babel to compile ES6+ to ES5
          },
        },
      },
    ],
  },
};
