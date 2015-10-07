


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
			parserModuleInstitution(err,body).then(ok,function(err){
				console.log(err,err.stack);
			});
		});
	});
	return p;
}

// fs.readFile("01市議會-表格 1.csv",processCSV);
var from = "source/csv";

//process 總預算案
fs.readdir(from,function(err,files){
  var promises = [];
  files.forEach(function(f){
    if(f==".DS_Store"){
      return true;
    }
    promises.push(processFile(from+"/"+f));
    return false;
  });

  Promise.all(promises).then(function(outputs){

  });
  


  Promise.all(promises).then(function(outputs_ary){

    // year code  amount  name  topname depname depcat  cat ref
    var csv_file = fs.createWriteStream("output/歲出機關別預算表_g0v_current.csv");
        var csvStream = csv.format({headers: true});
        csvStream.pipe(csv_file);

    var csv_file2 = fs.createWriteStream("output/歲出機關別預算表_g0v_last.csv");
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


        outputs_ary.forEach(function(o){
          o = o[0];
          try{
            o.subjects.forEach(function(s,ind){
              try{
                sections[s.section_string] = s.name;
                

                if(s.section3 != null ){
                  var obj = {
                    year:o.year,
                    code:s.number,
                    amount:s.year_this,
                    name: s.name,
                    topname:sections[s.section0],
                    depname:sections[s.section0+"-"+s.section1],
                    depcat:sections[s.section0+"-"+s.section1+"-"+s.section2],
                    catgory:sections[s.section0+"-"+s.section1+"-"+s.section2],
                    //no more data , so ...
                    // cat:s.target_type.name,
                    ref:s.section_string.replace(/-/g,"."),
                    comment:s.comment
                  };
                  var obj2 = {
                    year:o.year -1 ,
                    code:s.number,
                    amount:s.year_last,
                    name: s.name,
                    topname:sections[s.section0],
                    depname:sections[s.section0+"-"+s.section1],
                    depcat:sections[s.section0+"-"+s.section1+"-"+s.section2],
                    catgory:sections[s.section0+"-"+s.section1+"-"+s.section2],
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
              }catch(ex){
                console.log(ex,ex.stack);
              }
            });
          }catch(ex){
            console.log(ex,ex.stack);
          }
        });
        csvStream.end();
        csvStream2.end();
        
      fs.writeFile("output/歲出機關別預算表_g0v.json",JSON.stringify(newobj),function(err){
        console.log(arguments);
      });

  });

})





// //process 總預算案

// fs.readFile("source/歲出政事別預算表.csv",function(err,body){

// 	parseModuleGOV(err,body).then(function(data){
// 		fs.writeFile("output/歲出政事別預算表.json",JSON.stringify(data),function(err){
// 			// console.log(arguments);
// 		});		
// 	});

// });


// fs.readFile("source/歲出機關別預算總表.csv",function(err,body){

// 	parserModuleInstitutionAll(err,body).then(function(data){
// 		fs.writeFile("output/歲出機關別預算總表.json",JSON.stringify(data),function(err){
// 			// console.log(arguments);
// 		});		
// 	});

// });




// fs.readFile("02市府主管-表格 1.csv",processCSV);
