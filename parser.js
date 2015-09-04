

var parse = require('csv-parse');
var Promise = require("promise");
var fs= require("fs");

var parseOut = require("./parser_module_gov");
var parserModuleInstitution = require("./parser_module_institution");


var processFile = function(file){
	var p = new Promise(function(ok,fail){
		fs.readFile(file,function(err,body){
			// console.log(file,err,body);
			parserModuleInstitution(err,body).then(ok,function(){
				console.log(arguments);
			});
		});
	});
	return p;
}

// fs.readFile("01市議會-表格 1.csv",processCSV);


//process 總預算案
fs.readdir("source/歲出機關別預算表/",function(err,files){
	var promises = [];
	files.forEach(function(file){
		if(file.indexOf(".csv") != -1){
			promises.push(processFile("source/歲出機關別預算表/"+file));
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
		fs.writeFile("output/歲出機關別預算表.json",JSON.stringify(out),function(err){
			console.log(arguments);
		});
	});
	
});


//process 總預算案

// fs.readFile("source/歲出政事別預算表.csv",function(err,body){

// 	parseOut(err,body).then(function(data){
// 		fs.writeFile("output/歲出政事別預算表.json",JSON.stringify(data),function(err){
// 			// console.log(arguments);
// 		});		
// 	});

// });


// fs.readFile("02市府主管-表格 1.csv",processCSV);
