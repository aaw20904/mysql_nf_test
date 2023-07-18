var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let dbl = require("./db");
let dbLayer= new dbl.MyDb({database:"mydb",password:"65535258", user:"root", host:"localhost"});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function test(){
  try{
    await dbLayer.initSecondNFTable();  
    //await dbLayer.initThridNFDatabase(); OK
   //await dbLayer.insertRowIntoStudents1({st_id:1, name:"Bob", surname:"Nixon", city:"Detroyt",faculty:"Economy",group:2}); OK
   // await dbLayer.insertIntoStudents2({st_id:1, name:"Vera", surname:"Gray"}); OK
   //await dbLayer.insertIntoCities2({city_id:10,city:"Chikago"}); OK
   //await dbLayer.insertIntoStudentCity2({st_id:1,city_id:10}); OK
  /// await dbLayer.insertIntoFaculties2({fac_id:5,faculty:"Ecology"}); OK
  ///await dbLayer.insertIntoGroups2({fac_id:5, gr_id:501}); OK
  // await dbLayer.insertIntoStudentGroup2({st_id:1,gr_id:501}); OK
  } catch(e) {
    console.log(e);
  }
  await dbLayer.closeConnectionPool();

}

test();

//app.listen(3000, ()=>console.log("listen on 3000..."))
