module.exports = {
    entry: "./app",
    output: {
      path: __dirname,
      filename: "bundle.js"
    },
    module: {
        loaders: [
            {  
                test: /\.js$/,
                exclude: 'node_modules',
                loader: 'babel',
                query: {presets: ['es2015']},
            }
        ]
    },
    resolve: {
        fallback: {
            fs: require.resolve("browserify-fs"),
            path: require.resolve("path-browserify"),
        },
    },
    target: 'node'
  };