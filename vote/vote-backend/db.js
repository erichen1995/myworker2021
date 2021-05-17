const { Sequelize, Model, DataTypes } = require('sequelize'); //直接require  因为import 会出现问题而这个db不用打包

const path = require('path')  //获取当前路径

var__dirname = __dirname??"."

var exports = exports??{}

const dbFile = path.join(__dirname,"db.sqlite3") //dirname == file得路径 + db.sqlite3

const sequelize = new Sequelize({
  dialect:"sqlite",
  storage:dbFile,
  logging:false,
  }); // 获得db为文件指向  

exports.sequelize=sequelize

class User extends Model {}                 //创建表格
User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salt:{
    type: DataTypes.STRING,
  },
  email:{
    type: DataTypes.STRING,
    allowNull:false,
    unique:true,
  },
  gender:{
    type: DataTypes.STRING,
    allowNull:false 
  },
  avatar:{
    type: DataTypes.STRING,
    unique:true,
  }
}, {
  sequelize, 
  modelName: 'User', 
  timestamps:false, 
});
exports.User =User


class Vote extends Model {}   
Vote.init({
  title:DataTypes.STRING,
  desc:DataTypes.STRING,
  deadline:DataTypes.DATE,
  multiSelect:DataTypes.BOOLEAN,       //单选 or 多选
  anonymous:DataTypes.BOOLEAN,
  restrictShare:DataTypes.BOOLEAN,
},{
  sequelize,
  modelName:'vote',
  timestamps:false, 
})




User.hasMany(Vote)
Vote.belongsTo(User)                        //表格关系


exports.Vote = Vote                        //bug 未导出会导致无法输入  


class VoteUser extends Model {}
VoteUser.init({
  count:DataTypes.INTEGER,
},{
  sequelize,
  modelName:'VoteUser',
  timestamps:false,
})


exports.VoteUser = VoteUser




class Option extends Model {} 
Option.init({
  content:DataTypes.STRING,
},{
  sequelize,
  modelName:'Option',
  timestamps:false, 
})

Vote.hasMany(Option)
Option.belongsTo(Vote)




User.belongsToMany(Option,{                 //bug 多对多的关系这样创建新表 如果用hasMany 里创建出userId
  through:"UserVoting"  ,      
  timestamps:false,                         //可以关闭创建时间              
})

Option.belongsToMany(User,{
  through:"UserVoting" ,                     //创建一张表 保存id optionId userId
  timestamps:false,            //可以关闭创建时间
})


Vote.belongsToMany(User,{
  through:"VoteUser",      
  timestamps:false,    
})
User.belongsToMany(Vote,{
  through:"VoteUser",      
  timestamps:false,    
})



exports.Option = Option
sequelize.sync()                           //更新表格
