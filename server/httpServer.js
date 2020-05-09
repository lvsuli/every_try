const fs = require("fs");
const http = require("http");
const path = require("path");
const formidable = require("formidable");
const rimraf = require("rimraf");

var chunkInfos = {};
const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.url === "/api/upload" && req.method.toLowerCase() === "post") {
        const form = new formidable.IncomingForm();
        // 指定解析规则
        // form.encoding = "utf-8"; // 设置编码
        // form.uploadDir = "public/upload";
        form.keepExtensions = true; // 保留文件后缀
        form.maxFieldsSize = 2 * 1024 * 1024; // 指定上传文件大小 2M
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err);
                res.end(JSON.stringify({ success: false, err: err }));
            } else {
                if (files.resource.name) {
                    var avatarName = files.resource.name.replace(
                        /^(.+)(\..+)$/,
                        "$1_" + new Date().getTime() + "$2"
                    );
                    var readStream = fs.createReadStream(files.resource.path);
                    var newPath = path.resolve(__dirname, "upload", avatarName);
                    var writeStream = fs.createWriteStream(newPath);
                    readStream.pipe(writeStream);
                    readStream.on("end", function () {
                        fs.unlinkSync(files.resource.path);
                    });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.end(
                        JSON.stringify({ success: false, err: "please select file" })
                    );
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
        const form = new formidable.IncomingForm();
        // 指定解析规则
        // form.encoding = "utf-8"; // 设置编码
        // form.uploadDir = "public/upload";
        form.keepExtensions = true; // 保留文件后缀
        form.maxFieldsSize = 1024; // 指定上传文件大小 1M
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(1, err);
                res.end(JSON.stringify({ success: false, err: err }));
            } else {
                // 保存临时切片
                const uploadPath = path.resolve(__dirname, "upload");
                if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
                const chunksPath = path.resolve(uploadPath, fields.uuid);
                if (!fs.existsSync(chunksPath)) fs.mkdirSync(chunksPath);
                const chunkPath = path.resolve(chunksPath, fields.chunkIndex);
                const rStream = fs.createReadStream(files.chunk.path);
                const wStream = fs.createWriteStream(chunkPath);
                rStream.pipe(wStream);
                rStream.on("end", function () {
                // 更新切片相关信息
                    if (!(fields.fileName in chunkInfos)) {
                        chunkInfos[fields.fileName] = {};
                        chunkInfos[fields.fileName].chunkPaths = new Array(fields.chunkNum);
                        chunkInfos[fields.fileName].allIndexes = new Set();
                    }
                    chunkInfos[fields.fileName].chunkPaths[fields.chunkIndex] = chunkPath;
                    chunkInfos[fields.fileName].allIndexes.add(fields.chunkIndex);
                    const currentChunknum = chunkInfos[fields.fileName].allIndexes.size;
                    if (currentChunknum == fields.chunkNum) {
                        var bigFileName = fields.fileName.replace(
                            /^(.+)(\..+)$/,
                            "$1_" + new Date().getTime() + "$2"
                        );
                        const savePath = path.resolve(uploadPath, bigFileName);
                        const wStream = fs.createWriteStream(savePath);

                        // ???????????????????????此处异步造成很多问题
                        for (let i = 0; i < fields.chunkNum; i++) {
                            fs.appendFileSync(savePath, fs.readFileSync(chunkInfos[fields.fileName].chunkPaths[i]));
                            // const rStream = fs.createReadStream(chunkInfos[fields.fileName].chunkPaths[i]);
                            // rStream.pipe(wStream, { end: false });
                            // rStream.on("end", function () {
                            //     console.log("已合并切片", i);
                            //     rStream.destroy();
                            // });
                        }
                        // 删除文件夹
                        rimraf(chunksPath, function (err) { // 删除当前目录下的 test.txt
                            console.log(2, err);
                        });
                        // ???????????????????????此处异步造成很多问题

                        res.end(JSON.stringify({ success: true, type: "all", currentChunknum: currentChunknum, message: `文件上传成功,保存为:${bigFileName}` }));
                    } else {
                        res.end(JSON.stringify({ success: true, type: "piece", currentChunknum: currentChunknum, message: `切片${fields.chunkIndex}上传成功` }));
                    }
                });
            }
        });
    } else {
        res.end("404");
    }
});
server.listen(8888, () => {
    console.log("server is listening 8888");
});

// 删除临时文件夹   会报错
function removeFolder (dir) {
    // 目录不存在直接返回
    if (!fs.existsSync(dir)) return;
    // 递归删除目录中文件和空目录
    fs.readdirSync(dir).forEach((file) => {
        const curPath = path.resolve(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
            removeFolder(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    });
    // 删除空目录
    fs.rmdirSync(dir, { maxRetries: 100, recursive: true });
}
