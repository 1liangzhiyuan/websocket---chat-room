// 引入express
var express = require('express');
// 引入http
var http = require('http');
// 引入socket
var socket = require('socket.io');
// 引入fs
var fs = require('fs');


// 第一步 通过exprss创建应用程序
var app = express();
// 静态化
app.use(express.static('./web'))

// 第二步 将express应用转成http服务
var server = http.createServer(app);

// 第三步 通过socket处理http服务
var io = socket(server); 

// 存储所有的用户
var userArr = [];
// 监听socket创建完毕
io.on('connection', function(client) {
    // 读取face文件地址并返回
    fs.readdir('./web/face', function(err, data) {
        // console.log(err, data)
        // 如果有问题
        if (err) {
            return io.emit('err', err)
        }
        // 没有错误，返回数据
        client.emit('face', data)
    })
    // 订阅消息
    client.on('createUser', function(username) {
        // 存储用户名和客户端
        userArr.push([username || '匿名用户', client]);
        // 存储用户名
        // client._username = username;
        // console.log(userArr)
        // client代表当前客户端，只能给当前客户端返回数据，
        // io代表所有客户端，会广播消息，让所有客户端接收
        // 广播给每一个客户端
        io.emit('userEnter', userArr.map(item => item[0]))
    })
    // 监听客户端断开连接
    client.on('disconnect', function() {
        // console.log(client._username)
        // 从用户数组中删除用户名
        for (var i = userArr.length - 1; i >= 0; i--) {
            // 如果客户端匹配
            if (client === userArr[i][1]) {
                // 删除该成员
                userArr.splice(i, 1)
            }
        }
        // 通知用户更新用户列表
        io.emit('userEnter', userArr.map(item => item[0]))
    })
    // 监听用户提交消息
    client.on('msg', function(value, username) {
        // console.log(value, username);
        // value做处理，将[内部的图片名字换成标签]
        value = value.replace(/\[([a-z]+)\]/g, function(match, $1) {
            // 替换成图片
            return `<img src="${'./face/' + $1 + '.gif'}" alt="">`
        })
        // 广播给每一个用户
        io.emit('showMsg', value, username)
    })
})


//  通过http模块监听端口号
server.listen(3000, () => {
    console.log('111')
})
