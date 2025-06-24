const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server.js', // Your backend entry file
  target: 'node', // Ensure this is targeting Node.js
  externals: [nodeExternals()], // Exclude node modules from the bundle
  output: {
    path: path.resolve(__dirname, '../build/backend'), // Output to root/build/backend
    filename: 'server.bundle.js', // Backend bundle file
  },
  mode: 'production', // Change to 'development' for debugging
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Compile ES6+ to ES5
          },
        },
      },
    ],
  },
};
