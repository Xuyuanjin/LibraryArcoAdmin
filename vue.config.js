const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  //浏览器标题：覆盖 package.json 的 name 字段
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: '智能图书资源管理服务平台',
    },
  },

  devServer: {
    allowedHosts: [
      'localhost:8081',
      'api.lnpine.lol',
      '.lnpine.lol',
    ],
    //关掉 dev overlay 中的 errors 弹窗，避免 ResizeObserver 等良性警告刷红屏
    //真正的编译错误仍会在终端输出
    client: {
      overlay: {
        errors: false,
        warnings: false,
        runtimeErrors: false,
      },
    },
  },
})
