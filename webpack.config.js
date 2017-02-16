const webpack = require('webpack')
const PROD = process.env.NODE_ENV === 'production'

const outputFilename = PROD ? '[name].min.js' : '[name].js'

module.exports = {
     entry: {
         server: './src/server.js',
         client: './src/client.js',
     },
     output: {
         path: './dist',
         filename: outputFilename,
         libraryTarget: 'umd',
     },
     module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader',
         }]
     },
     externals: {
         'peranta/server': 'peranta/server',
         'peranta/router': 'peranta/router',
         'peranta/client': 'peranta/client',
     },
     plugins: !PROD ? [] : [
         new webpack.optimize.UglifyJsPlugin({
             compress: {
                 warnings: false,
             },
            //  output: {
            //      comments: false,
            //  },
         }),
     ],
 }
