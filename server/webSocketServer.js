//注意 火狐浏览器使用ws会报错，360则正常运行

// 导入WebSocket模块:
const WebSocket = require('ws');

// 引用Server类:
const WebSocketServer = WebSocket.Server;

// 实例化:
const wss = new WebSocketServer({
  port: 6666
}, function () {
  console.log('webSocket服务器已开启：ws://127.0.0.1:6666');
});
wss.on('connection', function (ws) {
  console.log(`[SERVER] connection()`);
  ws.on('message', function (message) {
    console.log(`[SERVER] Received: ${message}`);
  });
  let count = 0;
  setInterval(function () {
    ws.send(`加油！${++count}`);
  }, 2000);
});