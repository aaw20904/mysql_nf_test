var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let dbl = require("./db");
let rndGen = require("./randomGenerator");
let dbLayer= new dbl.MyDb({database:"mydb",password:"65535258", user:"root", host:"localhost"});

 
var usersRouter = require('./routes/users');
const templates = require("./arrays");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 
app.use('/users', usersRouter);

app.get("/index",(req, res)=>{
  res.render("start.ejs",{date:new Date().toString()})
})

app.get("/genfiles", async(req, res)=>{
  let amount;
  if(!req.query.amount){
   amount = 10;
  }else {
    amount = Number(req.query.amount);
  }
  await dbLayer.initSecondNFTable(); 
  let start = Date.now();
  await rndGen.makeRandomFileWithInt32({fileName:'cities.rnd',max:12,amountOfRecords:amount});
  await rndGen.makeRandomFileWithInt32({fileName:'names.rnd',max:20,amountOfRecords:amount});
  await rndGen.makeRandomFileWithInt32({fileName:'surnames.rnd',max:20,amountOfRecords:amount});
  await rndGen.makeRandomFileWithInt32({fileName:'faculties.rnd',max:4,amountOfRecords:amount});
  await rndGen.makeRandomFileWithInt32({fileName:'groups.rnd',max:4,amountOfRecords:amount});
  let executed = Date.now() - start;
  res.json({info:"generated!",size:amount, time: executed/1000 });
})

app.get("/trunc2nf",async (req, res)=>{
  try{
     await dbLayer.truncSecondNFTable();
    }catch(e){
      if (e.errno == 1146) {
        res.json({msg:"Tables arn`t exists"})
      } else{
        res.end(e.message);
      }
      return;
    }
   
    res.json({status:"truncated!"});
})


app.get("/trunc3nf",async (Req,res)=>{
  try{
    await dbLayer.truncThridNFDatabase();
  }catch(e){
    if(e.errno == 1146){
      res.json({msg:"Tables arn`t exists"})
    } else{
      res.end(e.message);
    }
    return;
  }
   res.json({status:"droped!"});
})


app.get("/fill2table", async (req, res)=>{
  let start;
  try{
    await dbLayer.initSecondNFTable();
    start = Date.now()  
    await dbLayer.fillSecNFTable(templates,10,rndGen,4096);
    start = Date.now() - start;
  }catch(e){
    res.end(e.message);
    return;
  }  
  res.json({status:"Success!", executed:start/1000});

});

app.get("/fill3database", async (req, res)=>{
  let start;
  try{
    await dbLayer.initThridNFDatabase()
    await dbLayer.fillCitiesFacultiesAndGroupsByStdValues(templates);
    start = Date.now()  
    await dbLayer.fillThridNFDatabase(templates,10,rndGen,4096);
    start = Date.now() - start;
  }catch(e){
    res.end(e.message);
    return;
  }  
  res.json({status:"Success! Database has been filled", executed:start/1000});
})

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

   //await rndGen.makeRandomFileWithInt32(); ok
  await dbLayer.initSecondNFTable();   
  await rndGen.makeRandomFileWithInt32({fileName:'cities.rnd',max:12,amountOfRecords:20});
  await rndGen.makeRandomFileWithInt32({fileName:'names.rnd',max:20,amountOfRecords:20});
  await rndGen.makeRandomFileWithInt32({fileName:'surnames.rnd',max:20,amountOfRecords:20});
  await rndGen.makeRandomFileWithInt32({fileName:'faculties.rnd',max:4,amountOfRecords:20});
  await rndGen.makeRandomFileWithInt32({fileName:'groups.rnd',max:4,amountOfRecords:20});

  await dbLayer.fillSecNFTable(templates,20,rndGen,12);

   // await dbLayer.initThridNFDatabase();  
   // await dbLayer.fillFacultiesAndGroupsByStdValues(templates);
   // await dbLayer.inertIntoGroups2 ({gr_id:501, gr_name:"History of ecology"}); ok
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


 


 
app.listen(3000,()=>console.log("listen on port 3000"))
