

var parse = require('csv-parse');
var Promise = require("promise");
var fs= require("fs");

var parseOut = require("./parser_module_out");
var parseIn = require("./parser_module_in");


var processFile = function(file){
	var p = new Promise(function(ok,fail){
		fs.readFile(file,function(err,body){
			// console.log(file,err,body);
			parseIn(err,body).then(ok);
		});
	});
	return p;
}

// fs.readFile("01市議會-表格 1.csv",processCSV);


//process 總預算案
fs.readdir("source/臺北市地方總預算案/",function(err,files){
	var promises = [];
	files.forEach(function(file){
		if(file.indexOf(".csv") != -1){
			promises.push(processFile("source/臺北市地方總預算案/"+file));
			processFile(file)
		}
	});

	Promise.all(promises).then(function(outputs_ary){
		var out = [];
		outputs_ary.forEach(function(ary){
			ary.forEach(function(item){
				out.push(item);
			});
		});
		console.log(JSON.stringify(out));
		fs.writeFile("output/臺北市地方總預算案.json",JSON.stringify(out),function(err){
			// console.log(arguments);
		});
	});
	
});


//process 總預算案
fs.readFile("source/歲出政事別預算表.csv",function(err,body){

	parseOut(err,body).then(function(data){
		fs.writeFile("output/歲出政事別預算表.json",JSON.stringify(data),function(err){
			// console.log(arguments);
		});		
	});

});


// fs.readFile("02市府主管-表格 1.csv",processCSV);
