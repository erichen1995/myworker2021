const{sequelize,User,Vote,Option,VoteUser} = require('./db')

const express = require('express')

const {io} = require ('./servers')  //socket.io的server对象

const voteRouter = express.Router()

module.exports = voteRouter

io.on('connection',socket=>{         //socket.io连接对象
  console.log("some comes")
  socket.on("select root",id=>{
    var room = "vote" + id
    socket.join(room)
    console.log("join",room)
  })
})
//GET/vote/myVotes?startIndex=5&stopIndex=20
voteRouter.get('/myVotes', async (req,res,next)=>{
  
  var result = await Vote.findAndCountAll({
    limit:  (req.query.stopIndex - req.query.startIndex)  ,   //选出的数量
    offset: req.query.startIndex,                        //从第几个开始 
    where:{
      UserId:req.user.id
    }
  })

  res.json(
    result
  )
})


voteRouter.get("/voteUser",async(req,res,next)=>{
  var  counts = await VoteUser.findAll({attributes:["voteId","UserId"]})
  if(counts){
    res.json(counts)
  }
  res.end()
})


//get/vote/
voteRouter.get('/get/:id',async(req,res,next)=>{
  var ID = await Vote.findAll({
    attributes:["id","title"]
  })
  if(req.params.id > ID.length){
    req.params.id = 1
  }
  if(Number(req.params.id)!=Number(req.params.id)){
    req.params.id = 1
  }
  
  var vote = await Vote.findByPk(req.params.id,{include:Option})
  if(vote){
    res.json({
      vote:vote.toJSON(),
      options :await Option.findAll({
        where:{voteId:req.params.id},                         //bug 数据库内是voteId 不是VoteId
        include: [{
          model: User,
          attributes: ['name', 'gender', 'avatar', 'id'],
        }]
      })
      // options: await Option.findAll({where:{voteId:vote.id},include:[User]})
    })   //传递到viewVote 
    } else {
      res.status(401).json({
        code:-1,
        msg:"不存在",
      })
    }                                                        //解决bug  在地址栏输入不对应的地址会反复socket 
})


voteRouter.use( async(req,res,next)=>{
  if(req.user){
    next()
  }else{
    res.status(401).json({
      code:-1,
      msg:"未登录"
    })
  }
})



//RESTful
//post/vote/create
voteRouter.post('/create',async(req,res,next)=>{
    var {options,...body} =req.body
    
      try{
        var vote =await Vote.create(body)   //创建投票问题 build不能创建出id
        vote.setUser(req.user)   //当前的登陆用户  bug 为setuser 不是adduser 因为并不增加用户
        var ary = await  Promise.all(options.map(str=>{
          return Option.create({
            content:str,
          }) 
        }))
        vote.addOptions(ary)    
        res.json(vote.toJSON())      //toJSON 没有它得选项
      }catch(e){
        res.status(400).json(e.toString())
      }
    
    
  })





voteRouter.post('/voteup/:optionId',async(req,res,next)=>{
  
  var option = await Option.findByPk(req.params.optionId,{include:Vote})
  var vote = await Vote.findByPk(option.vote.id,{include:Option,User})
  

  if(option){
    if(option.vote.deadline.getTime() > Date.now()){
      if(option.vote.multiSelect){             //多选
        await option.addUser(req.user)
        await vote.addUser(req.user)
      }else{  //单选
        var thisVoteOptions = await Option.findAll({
          where:{
            voteId:option.vote.id
          }
        })
        
        await req.user.removeOption(thisVoteOptions)   //删除原有选项
        await req.user.addOption(option)            //增加新选项 bug 需要异步等待
        await vote.addUser(req.user)             //单选增加user

      }
      
    }else{
      res.status(401).json({
        code:-1,
        msg:"选项不存在"
      })
    }

  }
  res.end()
  
  //还要给所有的房间连接广播这个投票的最新状态
  io.to('vote'+ option.voteId).emit(
    "voting info",
    //每个选项为它投票的人员
    await Option.findAll({
      where:{voteId:option.voteId},                         //bug 数据库内是voteId 不是VoteId
      include: [{
        model: User,
        attributes: ['name', 'gender', 'avatar', 'id'],
      }],
      // exclude:"UserVoting"
    })
  )
  
})//必须匹配到选项id
//如果要投票得addUser




//put/vote/
//delete/vote/
voteRouter.post('/cancel/:optionId',async(req,res,next)=>{
  var option = await Option.findByPk(req.params.optionId,{include:Vote})
  var vote = await Vote.findByPk(option.vote.id,{include:Option,User})
  if(option){
    if(option.vote.deadline.getTime() > Date.now()){
      await option.removeUser(req.user)
      await vote.removeUser(req.user)
    }
    io.to('vote'+ option.voteId).emit(//还要给所有的房间连接广播这个投票的最新状态
      "voting info",
      //每个选项为它投票的人员
      await Option.findAll({
        where:{voteId:option.voteId},                         //bug 数据库内是voteId 不是VoteId
        include: [{
          model: User,
          attributes: ['name', 'gender', 'avatar', 'id'],
        }]
      })
    )
    res.end()
  }else{
    res.status(401).json({
      code:-1,
      msg:"选项不存在"
    })
  }
})
