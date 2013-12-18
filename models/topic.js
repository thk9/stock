/*
评论两个数据库
话题和评论
*/
var mongodb = require('./db');
var connect=require('./connect');

var topic={};

module.exports = topic;
//话题数据库
topic.addTopic=function(obj,callback){
	global.db.collection('topic',function(err,collection){
		//增加一个自增uid
		collection.find().sort({_id: -1}).limit(1).toArray(function(err,items){
			if(items.length>0){
				obj.uid=items[0].uid+1;
				collection.insert(obj,{safe: true},function(err,topicItem){
					if(err){
						callback({isOk:false});
					}else{
						callback({isOk:true,data:topicItem});
					}
				});
			}else{
				obj.uid=0;
				collection.insert(obj,{safe: true},function(err,topicItem){
					if(err){
						callback({isOk:false});
					}else{
						callback({isOk:true,data:topicItem});
					}
				});
			}	
		});
    });
}

topic.myTopic=function(name,size,num,callback){
	global.db.collection('topic',function(err,collection){
		collection.find({name:name,hide:false}).sort({_id: -1}).skip(num).limit(size).toArray(function(err,items){
			if(err){
				callback({isOk:false});
			}else{
				callback({isOk:true,data:items});
			}
		});
	});
}

topic.aboutTopic=function(name,size,num,callback){
	//先查找这个用户关注对象
	global.db.collection('user',function(err,collection){
		collection.findOne({name:name},function(err,obj){
			if(!err){
				if(obj.watch.length>0){
					//存在关注用户
					var arr=[];
					obj.watch.forEach(function(k){
						arr.push({name:k});
					});
					//在topic中查找他关注用户的话题
					global.db.collection('topic',function(err,collection){
						collection.find({$or:arr}).sort({_id: -1}).skip(num).limit(size).toArray(function(err,items){
							if(err){
								callback({isOk:false});
							}else{
								callback({isOk:true,data:items});
							}
						});
					});
				}else{
					callback({isOk:true,data:[]});
				}
			}
		})
	});
}

topic.stockTopic=function(uid,stockName,size,num,callback){
	global.db.collection('topic',function(err,collection){
		collection.find({$or:[{aboutStockcode:uid},{aboutStockName:stockName}]}).sort({_id: -1}).skip(num).limit(size).toArray(function(err,items){
			if(err){
				callback({isOk:false});
			}else{
				callback({isOk:true,data:items});
			}
		});
	});
}


//评论数据库
topic.addComment=function(isForward,obj,callback){
	global.db.collection('comment',function(err,collection){
		collection.insert(obj,{safe: true},function(err,topicItem){
			if(!err){
				callback({isOk:true,data:topicItem});

				if(isForward){
					//topic 评论量+1,转发+1操作
					global.db.collection('topic',function(err,collection){
						var pid=Number(obj.pid);
						collection.update({uid:pid},{$inc:{comment:1,forward:1}},function(err,items){});
					});
				}else{
					//topic 评论量+1操作
					global.db.collection('topic',function(err,collection){
						var pid=Number(obj.pid);
						collection.update({uid:pid},{$inc:{comment:1}},function(err,items){});
					});
				}
				
			}
		});
    });
}

topic.getComment=function(uid,size,num,callback){
	global.db.collection('comment',function(err,collection){
		collection.find({pid:uid,hide:false}).sort({_id: -1}).skip(num).limit(size).toArray(function(err,items){
			if(err){
				callback({isOk:false});
			}else{
				callback({isOk:true,data:items});
			}
		});
	});
}