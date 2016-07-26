# 基于koa2的代理工具

## 功能
* 代理http和https
* 转发本地请求到网络
* 本地服务器
* 本地模拟数据配置
* 解析smarty模板
* 随意修改请求和响应结果


## 安装
安装node之后执行
```
npm install koa2-proxy
```

## 使用
```
var proxy = require('koa2-proxy');

// 本地静态服务器
proxy.static(__dirname);

// 本地模拟文件
proxy.mockfile(__dirname + '/mockfile.txt');

// 解析smarty模板
proxy.smarty({ext: '.html', data: {data: 'smarty html'}});

//
proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal());
    // 请求开始时转发本地请求到网络
    ctx.request.host = 'www.koa2.com';
});
proxy.on('end', function (ctx) {
    // 请求结束时
    console.log('end: ', ctx.request.url);
});

// 监听端口
proxy.listen(3010);
```

## 增加属性
* proxy.app koa的实例:proxy.app = new koa();
* proxy.httpServer  http服务器， 只有当http服务器启动后才会赋值（http-server-start事件）
* proxy.httpsServer https服务器， 只有当http服务器启动后才会赋值（https-server-start事件）
* proxy.localip 本地ip地址,listen后生效
* proxy.localhost 本地ip地址+监听host, listen后生效
* ctx.proxy  proxy
* request.body 请求的form表单数据

## 增加函数
* proxy.static(root,opts) 静态文件服务器
* proxy.when(conditions,callback) 增加中断和处理内容
* proxy.mockfile(mockfile) 模拟文件路径
* proxy.smarty({ext:'',data:data}) 解析smarty模板，data可以是json数据或者func,func参数为文件路径
* proxy.listen(port|config) 启动监听端口,假如需同时启动https,可以proxy.listen({port:3000,https:true}),则会自动增加https监听
* ctx.hasSend() 判断是否发送过数据
* ctx.isLocal() 判断当前请求是否是请求本地文件
* ctx.isBinary(filename) 判断本地文件是否是二进制文件
* ctx.sendFile(filepath) 发送本地文件


## 事件(proxy.on(event,function(data){}))
* http-server-start http服务器启动完成后触发
* https-server-start  https服务器启动完成后触发
* start: 请求开始时触发
* end: 请求结束时触发


## 本地开发
执行**npm install** 安装依赖
执行**npm run build** 编译src到lib目录


## 注意问题
* ctx.request.host不能直接修改，需要通过ctx.request.header.host修改

## 待解决bug
* ctx.request.url返回的地址有时带有host
* parseError: 在远程加载gzip格式内容之后发送时出错
* 本机设置代理之后websocket失效问题

## Todo:
* 完善文档
* 使用命令行启动或修改服务

## 版本说明
* **1.0.5(2016.07.26)**
    - proxy.smarty({ext:,root:,data:}): 完善smarty函数
* **1.0.4(2016.07.22)**
    - proxy.when(conditions, callback):参数conditions增加local
    - proxy.static(root, opts): 参数opts增加path和index
* **1.0.3(2016.07.15)**
    - 增加request.body
    - 请求form发送
    - 增加proxy.localip和proxy.localhost
    - 默认取消监听https,只有显示指示https时才启动https
* **1.0.2** load模块bug修复
* **1.0.1** 增加proxy.when等函数，远程加载图片内容
* **1.0.0** 基本版本定型
