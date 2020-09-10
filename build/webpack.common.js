const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'index.js'
    },
    devtool: "cheap-module-eval-source-map",
    module: {
        rules: [{
                test: /\.(png|jpe?g|gif)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        outputPath: 'img/'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html'
        }),
    ],
    devServer: {
        contentBase: "./dist",
        open: true,
        port: 8089
    }
}
