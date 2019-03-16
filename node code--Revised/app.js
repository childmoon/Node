/*
var express =require('express')

var app=new express();

app.get('/',function (req,res) {
    res.send('你好');
})

//动态路由传值http://10.113.29.224:3000/news/123
app.get('/news/:aid',function (req,res) {
    var aid=req.params.aid;
    console.log(aid);
    res.send('sadad'+aid);
})
//get传值http://10.113.29.224:3000/home?aid=123&cid=222
app.get('/home',function (req,res) {
    console.log(req.query);
    res.send(req.query);
})

app.listen(3000,'10.113.29.224');
*/


var express =require('express');

var app=new express();

var md5=require('md5-node');//引入md5加密模块

var bodyParser=require('body-parser');

//设置body-parser中间件获取post
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//var MongoClient=require('mongodb').MongoClient;
//var DbUrl = 'mongodb://localhost:27017/productmanage';//连接数据库

var multiparty=require('multiparty')

var fs=require('fs')

var DB=require('./modules/db.js');

//保存用户信息
var session=require("express-session");
//配置中间件固定格式,文档里找
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //secure: true
        maxAge:1000*60*30
    },
    rolling:true
}))

app.set('view engine','ejs');

app.use(express.static('public'));

app.use('/upload',express.static('upload'));



app.get('/',function (req,res) {
    res.send('index');
})

//登陆
app.get('/login',function (req,res) {
    res.render('login');
})

//获取登陆提交的数据
app.post('/doLogin',function (req,res) {
    var username=req.body.username;
    var password=md5(req.body.password);
/*
    MongoClient.connect(DbUrl,function (err,client) {
        if(err){
            //console.log(err);
            return;
        }
        var db=client.db("productmanage");
        var result=db.collection('user').find({
            username,
            password
        });
        result.toArray(function (err,data) {
            console.log(data);
            if(data.length>0){
                console.log("success");

                //保存用户信息
                req.session.userinfo=data[0];

                res.redirect('/product');
            }else{
                console.log("default");
                res.send("<script>alert('密码错误或用户名不存在！');location.href='/login'</script>");
            }
        })

    })
*/
    DB.find('user',{
        username:username,
        password:password
    },function(data){
        if(data.length>0){
            console.log('登录成功');
            //保存用户信息
            req.session.userinfo=data[0];

            res.redirect('/product');  /*登录成功跳转到商品列表*/

        }else{
            //console.log('登录失败');
            res.send("<script>alert('登录失败');location.href='/login'</script>");
        }
    })
})


//自定义中间件,判断登陆状态
app.use(function (req,res,next) {
    if(req.url=='/login' || req.url=='/doLogin'){
        console.log(req.session.userinfo);
        next();//判断是不是这两个页面进来的是的话就继续执行
    }else{
        //若是其他页面进来的则进行判断
        if(req.session.userinfo&&req.session.userinfo.username!=""){
            //配置全局变量可以在任意模板使用
            app.locals['userinfo']=req.session.userinfo;
            next();
        }else{
            res.redirect('/login');
        }
    }
})

//product列表
app.get('/product',function (req,res) {

/*
    MongoClient.connect(DbUrl,function (err,client) {
        if(err){
            console.log(err);
            console.log('数据库连接失败!');
            return;
        }else{
            var db=client.db('productmanage');
            var result=db.collection('product').find();
            result.toArray(function (error,data) {
                if(error){
                    console.log(error);
                    return ;
                }else{
                    //console.log(data);
                    res.render('product',{
                        list:data
                    })
                }
            })

        }
    })
*/
    DB.find('product',{},function(data){

        res.render('product',{

            list:data
        });
    })

})

//增加商品
app.get('/productadd',function (req,res) {
    res.render('productadd');
})

//获取表单提交的数据以及post过来的图片
app.post('/doProductAdd',function (req,res) {
    var form = new multiparty.Form();
    form.uploadDir='upload';
    form.parse(req, function(err, fields, files) {
        //获取提交的数据以及图片上传成功返回的信息
        //console.log(fields);//获取表单数据
        //console.log(files);//图片上传成功返回的地址信息
        var title=fields.title[0];
        var price=fields.price[0];
        var fee=fields.fee[0];
        var description=fields.description[0];

        var pic=files.pic[0].path;

        DB.insert('product',{
            title,
            price,
            fee,
            description,
            pic
        },function (data) {
            if(data){
                res.redirect('/product')
            }
        })

    });

})

//编辑商品
app.get('/productedit',function (req,res) {
    var id=req.query.id;
    //获取get传值id
    DB.find('product',{"_id":new DB.ObjectID(id)},function (data) {
        console.log(data);
        res.render('productedit',{
            list:data[0]
        });
    })


})

//执行修改的路由
app.post('/doProductEdit',function (req,res) {
    var form = new multiparty.Form();
    form.uploadDir='upload';
    form.parse(req, function(err, fields, files) {
        var _id=fields._id[0];
        var title=fields.title[0];
        var price=fields.price[0];
        var fee=fields.fee[0];
        var description=fields.description[0];
        //var pic=files.pic[0].path;

        var originalFilename=files.pic[0].originalFilename;
        var pic=files.pic[0].path;

        if(originalFilename){/*修改图片*/
            var setData={
                title,
                price,
                fee,
                description,
                pic
            };
        }else{
            var setData={/*没修改图片*/
                title,
                price,
                fee,
                description
            };
            //删除生成的无效的临时图片文件
            fs.unlink(pic)
        }

        console.log(files);

        DB.update('product',{"_id":new DB.ObjectID(_id)},setData,function(data) {
        /* if(data){
            res.redirect('/product');
        } */
		res.redirect('/product');
    })



    })
})



//删除商品
app.get('/productdelete',function (req,res) {
    var id=req.query.id;
    DB.deleteOne('product',{"_id":new DB.ObjectID(id)},function (err) {
        if(!err){
            res.redirect('/product');
        }
    });
    //res.render('productdelete');
})

app.get('/loginOut',function (req,res) {
    req.session.destroy(function (err) {
        if(err){
            console.log(err);
        }else{
            res.redirect('/login');
        }
    })
})


//删除数据
app.get('/delete',function(req,res){

    DB.deleteOne('product',{"title":"iphoneX"},function(data){
        /* if(!error){

            res.send('删除数据成功');
        } */
		res.send('删除数据成功');
		console.log('删除数据成功');
    })
})




app.listen(3000,'192.168.1.108');
//app.listen(3000,'10.113.29.224');
//app.listen(3000,'10.151.8.150');





