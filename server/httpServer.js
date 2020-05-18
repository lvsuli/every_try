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
    } else if (req.url === "/api/blob" && req.method.toLowerCase() === "post") {
        const form = new formidable.IncomingForm();
        form.keepExtensions = true; // 保留文件后缀
        form.maxFieldsSize = 1024 * 1024; // 指定上传文件大小 1M
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
                    if (!(fields.uuid in chunkInfos)) {
                        chunkInfos[fields.uuid] = {};
                        chunkInfos[fields.uuid].chunkPaths = new Array(fields.chunkNum);
                        chunkInfos[fields.uuid].allIndexes = new Set();
                    }
                    chunkInfos[fields.uuid].chunkPaths[fields.chunkIndex] = chunkPath;
                    chunkInfos[fields.uuid].allIndexes.add(fields.chunkIndex);
                    const currentChunknum = chunkInfos[fields.uuid].allIndexes.size;
                    if (currentChunknum == fields.chunkNum) {
                        var bigFileName = fields.fileName.replace(
                            /^(.+)(\..+)$/,
                            "$1_" + new Date().getTime() + "$2"
                        );
                        const savePath = path.resolve(uploadPath, bigFileName);

                        // 此处异步造成很多问题???????????????????????
                        for (let i = 0; i < fields.chunkNum; i++) {
                            const currentChunkPath = chunkInfos[fields.uuid].chunkPaths[i];
                            fs.appendFileSync(savePath, fs.readFileSync(currentChunkPath));
                        }
                        // 删除文件夹
                        rimraf(chunksPath, function (err, data) { // 删除当前目录下的 test.txt
                            console.log(data, err);
                        });
                        // 此处异步造成很多问题???????????????????????

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

// 删除临时文件夹   会报错?????/
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

function merge (target, sourceArray) {

}
