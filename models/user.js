var crypto = require('crypto');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/nblog');

var userSchema = new mongoose.Schema({
  name:String,
  password:String,
  email:String,
  head:String
},{
  collection:'users'
});

var userModel = mongoose.model('User',userSchema);

function User(user){
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};

//存储用户信息
User.prototype.save = function(callback){
  var md5 = crypto.createHash('md5'),
      email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'), //需要把email转为小写再编码
      head = "http://www.gravatar.com/avatar/" + email_MD5 + "?S=48";
  //要存入数据库的用户文档
  var user = {
    name:this.name,
    password:this.password,
    email:this.email,
    head:head
  };

  var newUser = new userModel(user);

  //执行保存
  newUser.save(function(err,user){
    if(err){
      return callback(err);
    }
    callback(null,user);
  });
};

//读取用户信息
User.get = function(name,callback){
  userModel.findOne({
    name:name
  },function(err,user){
    if(err){
      return callback(err);
    }
    callback(null,user);
  });
};

module.exports = User;