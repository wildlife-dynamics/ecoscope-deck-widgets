module.exports = [
  {
    mode: 'development',
    entry: './src/index.ts',
    output: {
      filename: './bundle.js',
      library: 'NAWidget',        // This creates window.NAWidget
      libraryTarget: 'umd',       // Universal Module Definition
      globalObject: 'this',       // Ensures it works in different environments
      umdNamedDefine: true        // Helps with AMD loaders
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    target: 'web',
    externals: {
      "@deck.gl/core": "deck",
      "@deck.gl/widgets": "deck",
    },
    devServer: {
      contentBase: __dirname,
      writeToDisk: true,
      port: 8080
    },
    module:{
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    }
  }
];