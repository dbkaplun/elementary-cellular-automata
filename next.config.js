module.exports = {
  exportPathMap () {
    return {
      '/': {page: '/'}
    }
  },
  webpack (config, {dev}) {
    config.module.rules.push({
      test: /\.(css|less)$/,
      loader: 'emit-file-loader',
      options: {
        name: 'dist/[path][name].[ext]'
      }
    }, {
      test: /\.css$/,
      use: ['babel-loader', 'raw-loader', 'postcss-loader']
    }, {
      test: /\.less$/,
      use: ['babel-loader', 'raw-loader', 'postcss-loader', 'less-loader']
    });
    return config;
  }
};

if (process.env.NODE_ENV === 'production') {
  module.exports.assetPrefix = '.';
}
