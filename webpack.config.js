const webpack = require('webpack');

module.exports = {
    mode: 'none',
    entry: './main.js',
    output: {
        path: process.cwd(),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    target: 'node',
    externals: ['webpack', 'webpack-cli']
};
