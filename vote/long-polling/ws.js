const http = require('http')
const ws = require('ws')

const server = http.createServer()
const wss = new WebSocket.server({server})   //wss代理

wss.on('connection',conn=>{                  //ws连接
  console.log("some one connect in websocket")
})


// server.on('upgrade',()=>{

// })

server.on("request",async(req,res)=>{
  if(req.url =="/"){
    res.writeHead(200,{
      "Content-type":"text/html",

    })
    res.end(
      `
      <body>ws</body>
      `
    )
  }
}) 

server.listen(5006,()=>{
  console.log('listen on 5006')
})
