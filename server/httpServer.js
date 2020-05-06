const fs = require("fs");
const http = require("http");
const path = require("path");
const formidable = require("formidable");

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.url === "/api/upload" && req.method.toLowerCase() === "post") {
        var form = new formidable.IncomingForm();
        // 指定解析规则
        // form.encoding = "utf-8"; // 设置编码
        // form.uploadDir = "public/upload";
        form.keepExtensions = true; // 保留文件后缀
        form.maxFieldsSize = 2 * 1024 * 1024; // 指定上传文件大小 2M
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err);
                res.end(err);
            } else {
                if (files.resource.name) {
                    var avatarName = files.resource.name.replace(/^(.+)(\..+)$/, "$1_" + (new Date()).getTime() + "$2");
                    var newPath = path.resolve(__dirname, "upload", avatarName);
                    var readStream = fs.createReadStream(files.resource.path);
                    var writeStream = fs.createWriteStream(newPath);
                    readStream.pipe(writeStream);
                    readStream.on("end", function () {
                        fs.unlinkSync(files.resource.path);
                    });
                    res.end("200");
                } else {
                    res.end("please select file");
                }
            }
        });
    } else if (req.url === "/api/text" && req.method.toLowerCase() === "post") {
        let text = "";
        req.on("data", (chunk) => {
            text += chunk; // 把接收到的一块数据拼接到str中
        });
        req.on("end", () => {
            console.log(text, JSON.parse(text));
            // 如果是json字符串  id=1&name=zs&age=43
            // 将接收到的数据，赋值给req.body
            // req.body属性本来不存在，是自定义的，你也可以用其他的名字
            // req.body = querystring.parse(text);
            // querystring.parse是将字符串转成对象{id:1,bane:zs,age:43}
            res.end(text);
        });
    } else if (req.url === "/api/blob" && req.method.toLowerCase() === "post") {
        let text = "";
        req.on("data", (chunk) => {
            text += chunk; // 把接收到的一块数据拼接到str中
        });
        req.on("end", () => {
            console.log(text, JSON.parse(text));
            res.end(text);
        });
    } else { res.end("404"); }
});
server.listen(8888, () => {
    console.log("server is listening 8888");
});
