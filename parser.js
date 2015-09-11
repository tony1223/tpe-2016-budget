


var Promise = require("promise");
var fs = require("fs");

var csv = require("fast-csv");


var parseModuleGOV = require("./parser_module_gov");
var parserModuleInstitution = require("./parser_module_institution");
var parserModuleInstitutionAll = require("./parser_module_institution_all");


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

		// year	code	amount	name	topname	depname	depcat	cat	ref
		var csv_file = fs.createWriteStream("output/歲出機關別預算表_g0v_2016.csv");
        var csvStream = csv.format({headers: true});
        csvStream.pipe(csv_file);

		var csv_file2 = fs.createWriteStream("output/歲出機關別預算表_g0v_2015.csv");
        var csvStream2 = csv.format({headers: true});
        csvStream2.pipe(csv_file2);

        var sections = {};
        var newobj = [];

        //summary start
        var summaryEntriesMap = {},
        	summaryEntries = [],
        	summaryEntriesCount = 0,
        	allAmount = 0;
        //summary end

        out.forEach(function(o){
        	o.subjects.forEach(function(s){

        		sections[s.section_string] = s.name;
        		if(s.section3 != null){
        			var obj = {
	        			year:o.year,
	        			code:s.section_string.replace(/-/g,".")+"-"+s.number,
	        			amount:s.year_this,
	        			name:s.name,
	        			topname:sections[s.section0],
	        			depname:sections[s.section0+"-"+s.section1],
	        			depcat:sections[s.section0+"-"+s.section1],
	        			category:sections[s.section0+"-"+s.section1+"-"+s.section2],
	        			//no more data , so ...
	        			cat:sections[s.section0],
	        			ref:s.section_string.replace(/-/g,"."),
	        			comment:s.comment
	        		};
	        		var obj2 = {
	        			year:o.year -1 ,
	        			code:s.section_string.replace(/-/g,".")+"-"+s.number,
	        			amount:s.year_last,
	        			name:s.name,
	        			topname:sections[s.section0],
	        			depname:sections[s.section0+"-"+s.section1],
	        			category:sections[s.section0+"-"+s.section1+"-"+s.section2],
	        			depcat:sections[s.section0+"-"+s.section1],
	        			//no more data , so ...
	        			cat:sections[s.section0],
	        			ref:s.section_string.replace(/-/g,".")
	        		};
	        		//summary start
	        		if(!summaryEntriesMap[obj.depname+obj.cat]){
	        			var summary = {
        					"depname": obj.depname,
					    	"amount": 0,
					    	"num_entries": 0,
					    	"cat": obj.cat
	        			};
	        			summaryEntries.push(summary);
	        			summaryEntriesMap[obj.depname+obj.cat] = summary;
	        		}
	        		var summary = summaryEntriesMap[obj.depname+obj.cat];
	        		summary.num_entries++;
	        		summaryEntriesCount++;
	        		summary.amount += obj.amount;
	        		allAmount+= obj.amount;
	        		//summary end

	        		csvStream.write(obj);
	        		csvStream2.write(obj2);
	        		newobj.push(obj);
	        	}
        	});
        });
        csvStream.end();
        csvStream2.end();
		
		fs.writeFile("output/歲出機關別預算表_g0v.json",JSON.stringify(newobj),function(err){
			console.log(arguments);
		});

		//summary start
		fs.writeFile("output/歲出機關別預算表_g0v_drilldown.json",JSON.stringify({
			"drilldown":summaryEntries,
			"summary": {
			    "num_drilldowns": summaryEntries.lnegth,
			    "pagesize": 1000000,
			    "cached": true,
			    "num_entries": summaryEntriesCount,
			    "page": 1,
			    "currency": {
			      "amount": "TWD"
			    },
			    "amount": allAmount,
			    "cache_key": "8311c0ab057432fb04ac54847f5fc214e24c69cd",
			    "pages": 1
			}
		}),function(err){
			console.log(arguments);
		});
		//summary end

		// console.log(JSON.stringify(out));
		fs.writeFile("output/歲出機關別預算表.json",JSON.stringify(out),function(err){
			console.log(arguments);
		});
	});
	
});


//process 總預算案

fs.readFile("source/歲出政事別預算表.csv",function(err,body){

	parseModuleGOV(err,body).then(function(data){
		fs.writeFile("output/歲出政事別預算表.json",JSON.stringify(data),function(err){
			// console.log(arguments);
		});		
	});

});


fs.readFile("source/歲出機關別預算總表.csv",function(err,body){

	parserModuleInstitutionAll(err,body).then(function(data){
		fs.writeFile("output/歲出機關別預算總表.json",JSON.stringify(data),function(err){
			// console.log(arguments);
		});		
	});

});




// fs.readFile("02市府主管-表格 1.csv",processCSV);
