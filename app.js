const express = require ('express')
const hbs = require('hbs')
const session = require('express-session');

var app = express();

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'somethingwrong',
    cookie: {maxAge: 60000 }}));

app.set('view engine', 'hbs')

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://longcuonhut:longcuonhut123@cluster0.ramop.mongodb.net/test";

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'))

var listNotToDelete = ['polo', 'pants', 'kitchen', 'noodles'];

const dbHandler = require('./databaseHandler');

//search accurate 
app.post('/search' ,async (req,res)=>{
    const searchText = req.body.txtName;
    const results = await dbHandler.searchProduct(searchText,"Product");
    res.render('allProduct' ,{model:results})
})

app.post('/update',async(req,res)=>{
    const id= req.body.id;
    const nameInput = req.body.txtName;
    const priceInput = req.body.txtPrice;
    const newValues =  {$set:{name: nameInput, price: priceInput}};
    const ObjectID = require('mongodb').ObjectID;
    const condition = {"_id":ObjectID(id)};

    const client= await MongoClient.connect(url);
    const dbo = client.db("NguyenHaiLongDB");
    await dbo.collection("Product").updateOne(condition,newValues);
    res.redirect('/view');
})

app.get('/edit',async (req, res)=>{
    const id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    const condition = {"_id" : ObjectID(id)};

    const client = await MongoClient.connect(url);
    const dbo = client.db("NguyenHaiLongDB");
    const productToEdit = await dbo.collection("Product").findOne(condition);
    res.render('edit',{product:productToEdit})
})

app.get('/delete' ,async (req, res)=>{
    const id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    const condition = {"_id" : ObjectID(id)};

    const client = await MongoClient.connect(url);
    const dbo = client.db("NguyenHaiLongDB");
    const productToDelete = await dbo.collection("Product").findOne(condition);
    const index = listNotToDelete.findIndex((e)=>e==productToDelete.name);
    if(index !=-1)
    {
        res.end('cannot delete as special product: ' + listNotToDelete[index])
    }else{
        await dbo.collection("Product").deleteOne(condition);
        res.redirect('/view');
    }
})

app.get('/view',async (req,res)=>{
    const results = await dbHandler.searchProduct('',"Product");
    var userName ='Not logged In'
    if(req.session.username){
        userName = req.session.username;
    }
    res.render('allProduct',{model:results,username:userName})
})

app.post('/doInsert', async (req,res)=>{
    let error = [];
    let flag = true;
    const nameInput = req.body.txtName;
    const priceInput = req.body.txtPrice;
    var newProduct = {name:nameInput, price:priceInput, size : {dai:20, rong:40}}
    if(!dbHandler.checkName(nameInput))
    {
        error["name"] = 'Please Enter Name Again!'
        flag = false;
     //   res.render('insert',{nameError:'Please Enter Name Again!'})
    }if(dbHandler.checkPrice(priceInput)){
        error["price"] = 'Please Enter price Again!'
        flag = false;
        //res.render('insert',{priceError:'Please Enter Price Again!'})
    }if(flag == true){
        await dbHandler.insertOneIntoCollection(newProduct,"Product");
        res.render('logined')
    }
    else{  
        // await dbHandler.insertOneIntoCollection(newProduct,"Product");
        res.render('insert',{error:error})
    }
})

app.get('/insert',(req, res)=>{
    res.render('insert')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/doRegister', async(req,res)=>{
    let error = [];
    let flag = true;
    const nameInput = req.body.txtName;
    const passInput = req.body.txtPassword;
    const repassInput = req.body.txtRepeatpassword;
    const newUser = {username:nameInput,password:passInput,Repeatpassword:repassInput};
    if(nameInput.length < 6)
    {
        error["username"] = 'Username have to from 6 characters'
        flag = false
        //res.render('register',{nameError:'Username have to from 6 characters'})
    }
    if(passInput.length < 6)
    {
        error["password"] = 'Password have to from 6 characters'
        flag = false
       // res.render('register',{passError:'Password have to from 6 characters'})
    }
    if(repassInput !== passInput){
        error["repassword"] = 'Password does not look like'
        flag = false
      // res.render('register',{repassError:'Password do not look like'})
    }
    if(flag == false){
        res.render('register', {error:error})
    }
    else
    {  
        await dbHandler.insertOneIntoCollection(newUser,"Product");
        res.render('index')
    }
})

app.get('/logined',(req,res)=>{
    res.render('logined')
})

app.post('/login',async (req,res)=>{
    const nameInput = req.body.txtName;
    const passInput = req.body.txtPassword;
    const found = await dbHandler.checkUser(nameInput,passInput);
    if(found){
        req.session.username = nameInput;
        res.render('logined',{loginName:nameInput})
    }else{
        res.render('index',{errorMsg:"Login failed!"})
    }
})

app.get('/home' ,(req,res)=>{
    res.render('index')
})

app.get('/',(req, res)=>{
    var userName = 'Not logged in';
    if(req.session.userName)
    {
        userName = req.session.username;
    }
    res.render('index',{loginName:userName})
})

var PORT = process.env.PORT||5000;
app.listen(PORT);
console.log("Server is running at: " + PORT);