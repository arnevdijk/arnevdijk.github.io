module.exports = {
  mode: 'development',
  entry: {
    main: './src/assets/script.js'
  },
    module: {
    rules: [
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  stats: {
    errorDetails: true,
    children: true
  }
};