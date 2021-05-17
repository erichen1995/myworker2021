const http = require('http')
const SocketIO = require('socket.io')

const server = http.createServer()

const io = SocketIO()  //一定程度接管server的功能

//引入socketIO 会让程序发生代理http 而express 也接管了 就会 发生出错



exports.server = server
exports.io = io 
