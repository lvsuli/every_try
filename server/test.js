const fs = require("fs");
const path = require("path");

// 删除临时文件夹
function removeFolder (dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((file) => {
        const curPath = path.resolve(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
            removeFolder(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    });
    fs.rmdirSync(dir);
}

removeFolder(path.resolve(__dirname, "upload"));
console.log(1111111111111111);
