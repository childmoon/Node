var MongoClient=require('mongodb').MongoClient;
var DbUrl = 'mongodb://localhost:27017/productmanage';

var ObjectID=require('mongodb').ObjectID;

function  __connectDb(callback){


    MongoClient.connect(DbUrl,function(err,client){

        if(err){
            console.log('数据库连接失败');
            return;
        }
        //增加 修改 删除
        var db=client.db('productmanage');
        callback(db);


    })

}
exports.ObjectID=ObjectID;
//数据库查找
/*
 Db.find('user',{},function(err,data){
    data数据
})

 */


function runAsync1(){
    	return new Promise(function(resolve, reject){
        //做一些异步操作
        	MongoClient.connect(DbUrl,function(err,client){
                	if(err){
                   	 console.log('数据库连接失败');
                    	return;
                }
               	 //增加 修改 删除
                	var db=client.db('productmanage');
                	resolve(db);
		});
    		        
	});  
};

function runAsync2(db,collectionname,json){
    	return new Promise(function(resolve, reject){
        //做一些异步操作
		var result=db.collection(collectionname).find(json);

        	result.toArray(function(error,data){
            	//db.close();/*关闭数据库连接*/
            	resolve(data);
        	})	
	});
};


exports.find=function(collectionname,json,callback){
	runAsync1()
	.then(function(db) {
 	   return runAsync2(db,collectionname,json);
	}).then(function(data){
		console.log(data);
		console.log(data.length);
		callback(data);
	}).catch(function(err) {
		console.log(err); //error捕获在这里
	});
	
}


/* exports.find=function(collectionname,json,callback){

    __connectDb(function(db){


        var result=db.collection(collectionname).find(json);

        result.toArray(function(error,data){

            //db.close();
            callback(error,data);
        })

    })

} */







function runAsync3(db,collectionname,json){
    	return new Promise(function(resolve, reject){
        //做一些异步操作
		db.collection(collectionname).insertOne(json,function(error,data){
			resolve(data);
		})
	});
};

exports.insert=function(collectionname,json,callback){
	
    runAsync1()
    .then(function(db) {
    return runAsync3(db,collectionname,json);
    }).then(function(data){
    	console.log(data);
    	console.log(data.length);
    	callback(data);
    }).catch(function(err) {
    	console.log(err); //error捕获在这里
    });

}



//增加数据
/* exports.insert=function(collectionname,json,callback){

    __connectDb(function(db){


        db.collection(collectionname).insertOne(json,function(error,data){

            callback(error,data);
        })
    })

} */








 function runAsync4(db,collectionname,json1,json2){
    return new Promise(function(resolve, reject){
        //做一些异步操作
		db.collection(collectionname).updateOne(json1,{$set:json2},function(data){
		  resolve(data);
		});
		
	});
};

exports.update=function(collectionname,json1,json2,callback){

		runAsync1()
    .then(function(db) {
    return runAsync4(db,collectionname,json1,json2);
    }).then(function(data){
    	callback(data);
    }).catch(function(err) {
    	console.log(err); //error捕获在这里
    });

}


   /* __connectDb(function(db){
        db.collection(collectionname).updateOne(json1,{$set:json2},function(error,data){

            callback(error,data);
        })
    }) */




//更新数据
/* exports.update=function(collectionname,json1,json2,callback){

    __connectDb(function(db){
        db.collection(collectionname).updateOne(json1,{$set:json2},function(error,data){

            callback(error,data);
        })
    })

} */






 function runAsync5(db,collectionname,json){
    return new Promise(function(resolve, reject){
        //做一些异步操作
		db.collection(collectionname).deleteOne(json,function(data){
				resolve(data);
		});
		
	});
};

exports.deleteOne=function(collectionname,json,callback){

   runAsync1()
   .then(function(db) {
   return runAsync5(db,collectionname,json);
   }).then(function(data){
   	callback(data);
   }).catch(function(err) {
   	console.log(err); //error捕获在这里
   });

}

//删除数据
/* exports.deleteOne=function(collectionname,json,callback){
    __connectDb(function(db){
        db.collection(collectionname).deleteOne(json,function(error,data){
            callback(error,data);
        })
    })

} */
