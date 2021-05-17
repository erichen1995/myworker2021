
const http = require("http")

const server = http.createServer()

const SocketIO = require('socket.io')
const io = SocketIO(server)    

io.on('connection',Socket=>{
  
})

server.on('request',async(req,res)=>{
  if(req.url=="/"){
    res.end(
      `
      <script src="/socket.io/socket.io.js"></script>
      <script>
        var socket = io();
      </script>
      `
    )
  }
})

server.listen(5006,()=>{
  console.log('listen on 5006')
})
