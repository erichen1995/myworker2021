const{sequelize,User,Vote,Option} = require('./db')

const express = require('express')

const accountRouter = express.Router()

module.exports = accountRouter                            //导出accountRouter//只导出路由  


//{name gender avatar salt email }
accountRouter.post('/register', async (req,res,next)=> {       //注册界面数据
  var body =req.body
  try{
    var user = await User.create({             
    ...body
    //展开了所有的db数据body
    })
    res.end()
  } catch(e){
    res.status(400).json(e)              //返回服务器400或者抛错
  }
})

//{name,password}  
accountRouter.post('/login',async (req,res,next)=>{         //登录数据
  try{
    var user = await User.findOne({
      attributes:["name","gender","avatar","id"],               //只需要获取这些数据
      where:{
        name:req.body.name,
        password:req.body.password
      }
    })
    res.cookie('user',req.body.name,{                       //签名cookie 加入user
      signed:true
    })
    
    res.json(user.toJSON())                                  //返回json格式
    
  }catch(e){
    res.status(400).end(e.toString()) 
  }
})




accountRouter.get('/userinfo', async(req,res,next)=>{       //获取用户基本信息
  if(req.user){              //当前cookie对应用户的已登录用户
    var user= await User.findOne({
      attributes:["name","gender","avatar","id"],
      where:{
        name:req.user.name
      }
    })
    res.json(user.toJSON())                 //一直被我end掉 所以登录不成功
  }else{
    res.status(400).json({
      code:-1,
      msg:"用户未登录",
    })
  }
})


// accountRouter.get('/userinfo', async (req, res, next) => {
//   if (req.user) {//当前cookie对应的已登陆用户
//     var user = await User.findOne({
//       attributes: ['name', 'gender', 'avatar', 'id'],
//       where: {
//         name: req.user.name,
//       }
//     })
//     res.json(user.toJSON())
//   } else {
//     res.status(401).json({
//       code: -1,
//       msg: '用户未登陆'
//     })
//   }
// })




accountRouter.get('/logout',async (req,res,next)=>{
  res.clearCookie('user')
  res.end()
})






// const { sequelize, User } = require('./db')

// const express = require('express')

// const accountRouter = express.Router()
// module.exports = accountRouter

// // {name, password, email, gender, avatar}
// accountRouter.post('/register', async (req, res, next) => {
//   var body = req.body
//   try {
//     var user = await User.create({
//       ...body
//     })
//     res.end()
//   } catch (e) {
//     res.status(400).json(e)
//   }
// })

// // {name, password}
// accountRouter.post('/login', async (req, res, next) => {
//   try {
//     console.log('body', req.body)

//     var user = await User.findOne({
//       attributes: ['name', 'gender', 'avatar', 'id'],
//       where: {
//         name: req.body.name,
//         password: req.body.password
//       }
//     })
//     res.cookie('user', req.body.name, {
//       signed: true
//     })
//     res.json(user.toJSON())
//   } catch (e) {
//     res.status(400).end(e.toString())
//   }
// })

// // 获取已登陆用户的信息
// accountRouter.get('/userinfo', async (req, res, next) => {
//   if (req.user) {//当前cookie对应的已登陆用户
//     var user = await User.findOne({
//       attributes: ['name', 'gender', 'avatar', 'id'],
//       where: {
//         name: req.user.name,
//       }
//     })
//     res.json(user.toJSON())
//   } else {
//     res.status(401).json({
//       code: -1,
//       msg: '用户未登陆'
//     })
//   }
// })

// accountRouter.get('/logout', async (req, res, next) => {
//   res.clearCookie('user')
//   res.end()
// })
