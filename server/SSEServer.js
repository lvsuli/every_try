const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
var app = express();
app.set("trust proxy", 1);
app.use(session({
	secret: "keyboard cat", // 加密字符串
	name: "session_id", // 保存在本地cookie的一个名字 默认connect.sid  可以不设置
	cookie: {
		maxAge: 300000 // 过期时间5分钟
	},
	resave: false, // 不强制保存即未更改不必更新
	saveUninitialized: false,
	rolling: true // 刷新过期时间
}));
// post方法专用,req.body;
app.use(bodyParser.json()); // 添加json解析
app.use(bodyParser.urlencoded({
	extended: false
}));
// 中间件过滤所有请求，设置跨域,登陆验证等
app.all("*", function (req, res, next) {
	console.log("--------------------------------------------------------------------------------------");
	console.log("请求", req.method, req.url);
	// 设置允许跨域访问该服务.
	// res.header('Access-Control-Allow-Origin', '*');
	next();
});
app.listen(8888, function () {
	console.log("应用实例访问地址为 http://127.0.0.1:8888");
});
// 测试服务器端推送事件
app.get("/api/eventSource", function (req, res) {
	console.log("服务器收到请求");
	res.header("Content-Type", "text/event-stream");
	res.header("Cache-Control", "no-cache");
	res.header("Connection", "keep-alive");
	let id = 0;
	res.write("retry: 10000\n");
	res.write(`id:${++id}\n`);
	res.write("event: first\n");
	res.write("data: " + JSON.stringify({
		a: 1,
		b: 2,
		c: 3,
		d: 4
	}) + "\n\n");
	const interval = setInterval(function () {
		res.write(`id:${++id}\n`);
		res.write("event: continue\n");
		res.write("data: " + (new Date()) + "\n\n");
	}, 1000);
	req.connection.addListener("close", function () {
		clearInterval(interval);
		console.log("监测到客户端拒绝接收推送");
	}, false);
});
