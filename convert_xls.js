

var alasql = require("alasql");
var fs = require("fs");

var from = "source/xls";
var to = "source/csv";

fs.readdir(from,function(err,files){
  files.forEach(function(file){
    if(file ==".DS_Store"){
      return true;
    }
    console.log("handling ",from+"/"+file);
    alasql.promise("SELECT * INTO CSV('"+to+"/"+file.replace("xls","csv")+"', {headers:false}) "+
    " FROM XLS('"+from+"/"+file+"', {headers:false}); ")
        .then(function(res){
             console.log(res); // output depends on mydata.xls 
        }).catch(function(err){
             console.log('Does the file exists? there was an error:', err);
        });

  });
  console.log(files);
})


//> node alacon "SELECT * INTO CSV('mydata.csv', {headers:true}) FROM XLS('mydata.xls', {headers:true})"

