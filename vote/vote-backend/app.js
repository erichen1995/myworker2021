const{sequelize,User,Vote,Option,VoteUser} = require('./db')  //获取数据表

const express = require("express")            //获取express

const cookieParser =require('cookie-parser')  //下发cookie

const accountRouter = require('./account')     //创建中间件

const voteRouter = require('./vote')

const app = express()

const PORT = 3005

const cors = require("cors")

const  formidable  = require('formidable')

const path =  require("path")


app.use((req,res,next)=>{
  console.log(req.method,req.url)
  next()
})
app.use(cors({                  //跨域
  origin:"*",
  maxAge:99999999,
  credentials:true,
}))

app.use(express.json())            //解析json
app.use(cookieParser("secret"))     //下发cookie

//通过cookie从数据库里查询当前的账户
app.use("/",express.static(path.join(__dirname,"./build")))
app.use(async (req,res,next)=>{
  if(req.signedCookies.user){
    req.user = await User.findOne({
      where:{
        name:req.signedCookies.user
      }
    })
  }else{
    req.user = null
  }
  next()                              //中间件
}) 




app.use('/account',accountRouter)   //获取account bug 应放最后 否则查询无法完成
app.use('/vote',voteRouter)        //获取vote


app.use("/icons",express.static(path.resolve(__dirname,"icons")))  

//multer   
app.use("/uploads",express.static(path.resolve(__dirname,"uploads")))        //上传uploads 文件夹 



app.post("/upload",async(req,res)=>{                                        //上传服务器 
  const form = formidable({
    multiples:false,                   //一次一个文件
    keepExtensions:true,               //保留文件扩展名                             
    uploadDir:path.join(__dirname,"uploads")  //上传路径                       //bug 必须创建一个新的form 
  })

  form.parse(req,async(err,info,files)=>{
    if(err){
      next(err)
    }else{
      
      res.json({
        url:"/uploads/"+ path.basename(files.file.path)             //bug path 得看好
      })
    }
  })
})


const { server, io } =require ('./servers')   //获取httpServer



server.on('request',app)          //将app 传给sever  

io.attach(server,{serverClient:false})   //bug 让服务器处理正常的请求,而socket 连接会放到后面

server.listen(PORT,()=>{
  console.log('listening on port', PORT)
})
