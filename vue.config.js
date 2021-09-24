/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  pages: {
    index: {
      entry: './src/pages/index/main', // 配置入口js文件
      template: './public/index.html', // 主页面
      filename: 'index.html', // 打包后的html文件名称
    },
  },
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上，例如 https://www.my-app.com/。
  // 如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/。
  publicPath:
    process.env.NODE_ENV === 'development'
      ? '/ink/'
      : `https://cdn.xxx.com/youpin-fe--staging/static/`,

  // 多进程打包
  parallel: require('os').cpus().length > 1,
  // eslint-loader 是否在保存的时候检查
  lintOnSave: true,
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  // css相关配置
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
  },
  configureWebpack: {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
    // 开发生产共同配置
    resolve: {
      extensions: ['.js', '.vue', '.json', '.ts', '.tsx', '.ce.vue'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      fallback: {
        crypto: require.resolve('crypto-js'),
      },
    },
    output: {
      filename: 'js/[name].[fullhash:8].js',
      chunkFilename: 'js/[name].[fullhash:8].js',
    },
    optimization: {
      splitChunks: {
        //..
      },
      minimizer: [
        new TerserPlugin({
          parallel: 4, //开启并行压缩
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end()

    config.plugin('define').tap(args => {
      args[0]['process.env'].APP_VERSION = + new Date()
      return args
    })
  },
  // 第三方插件配置
  pluginOptions: {
    // ...
  },
  // 所有 webpack-dev-server 的选项都支持，注意
  // 1. 有些值像 host、port 和 https 可能会被命令行参数覆写。
  // 2. 有些值像 publicPath 和 historyApiFallback 不应该被修改，因为它们需要和开发服务器的 publicPath 同步以保障正常的工作。
  devServer: {
    open: true, // 启动后打开浏览器
    // 要使用的 host，默认是 localhost。如果你希望服务器外部可访问，指定如下 host: '0.0.0.0'，设置之后之后可以访问ip地址
    host: '0.0.0.0',
    port: 1218, // 端口号
    https: false,
    //hot配置是否启用模块的热替换功能，devServer的默认行为是在发现源代码被变更后，通过自动刷新整个页面来做到事实预览，开启hot后，将在不刷新整个页面的情况下通过新模块替换老模块来做到实时预览。
    hot: true, //  默认是 true
    // hot 和 hotOnly 的区别是在某些模块不支持热更新的情况下，前者会自动刷新页面，后者不会刷新页面，而是在控制台输出热更新失败
    hotOnly: false,

    //  http-proxy-middleware
    // 这里写的是开发时需要用的api代理，根目录下可能会有nginx->staging->default.conf 这些文件写的是不同分支环境下的代理
    // 本地也要写代理（花瓶、nginx），主要代理的是域名，比如 http://test.con:80 代理到 http://localhost:1218
    proxy: {
      '/api/': {
        target: 'https://xxx.com', //目标接口域名
        pathRewrite: { '^/api/': '/' }, // 重写接口，将 /api/xxx --> /xxx （去掉/api）
        changeOrigin: true, //是否跨域
      },
    },
  },

}
