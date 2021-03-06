var crypto = require('crypto'),
    mongodb = require('./db');

function User(user){
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};

module.exports = User;

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

  //打开数据库
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }

    //读取users集合
    db.collection('users',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //读取用户数据插入users集合
      collection.insert(user,{
        safe:true
      },function(err,user){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null,user[0]);
      });
    });
  });
};

//读取用户信息
User.get = function(name,callback){
  //打开数据库
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }

    //读取users集合
    db.collection('users',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //查找用户名(name键)值为name一个文档
      collection.findOne({
        name:name
      },function(err,user){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null,user);
      });
    });
  });
};

