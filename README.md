# every_try
学习一点一滴
rStream.pipe(wStream, { end: false })   异步写入文件，如果重复对一个文件操作，处理不当可能出现文字顺序混乱，因此需要理清逻辑编码。
fs.appendFileSync  同步的将文件追加到末尾
