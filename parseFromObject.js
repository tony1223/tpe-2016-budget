


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
var promises = [
  new Promise(function(ok,fail){

    var stream = fs.createReadStream("source/data.json");

    var result = {
      subjects:[],
      year:2016
    };
    csv
     .fromStream(stream, {headers : true})
     .on("data", function(data){
         console.log(data);
         result.subjects.push({
            section0:data["款"],
            text0:data["款名"],
            section1:data["項"],
            text1:data["項名"],
            section2:data["目"],
            text2:data["目名"],
            section3:data["節"],
            text3:data["節名"],
            section_string:data["款"]+"-"+data["項"]+"-"+data["目"]+"-"+data["節"],
            number:data["科目代碼"],
            name:data["節名"],
            year_this:parseInt(data["當年度金額"],10)*1000,
            year_last:parseInt(data["上年度金額"],10)*1000,
            year_compare_last:parseInt(data["當年度金額"],10)*1000 - parseInt(data["上年度金額"],10)*1000 ,
            comment:data["備註"]
          });
     })
     .on("end", function(){
         ok(result);
     });

  })
];


Promise.all(promises).then(function(outputs_ary){
  // year code  amount  name  topname depname depcat  cat ref
  var csv_file = fs.createWriteStream("output/歲出機關別預算表_g0v_current.csv");
      var csvStream = csv.format({headers: true});
      csvStream.pipe(csv_file);

  var csv_file2 = fs.createWriteStream("output/歲出機關別預算表_g0v_last.csv");
      var csvStream2 = csv.format({headers: true});
      csvStream2.pipe(csv_file2);

  var csv_file3 = fs.createWriteStream("output/歲出機關別預算表_full.csv");
      var csvStream3 = csv.format({headers: true});
      csvStream3.pipe(csv_file3);

      var sections = {};
      var newobj = [];

      //summary start
      var summaryEntriesMap = {},
        summaryEntries = [],
        summaryEntriesCount = 0,
        allAmount = 0;
      //summary end

      var obj_rd = [];
      outputs_ary.forEach(function(o){
        try{
          o.subjects.forEach(function(s,ind){
            try{

              if(s.section3 != null ){
                var topname = s.text0;
                console.log(s);
                topname = topname =="臺中市政府主管"? topname:topname.replace("臺中市政府","") ;
                var obj = {
                  year:o.year,
                  code:s.number,
                  amount:s.year_this,
                  last_amount:s.year_last,
                  name: s.name,
                  topname:topname,
                  depname:s.text1,
                  depcat:s.text2,
                  category:s.text2,
                  //no more data , so ...
                  cat:s.text0,
                  ref:s.section_string.replace(/-/g,"."),
                  comment:s.comment
                };
                var obj2 = {
                  year:o.year -1 ,
                  code:s.number,
                  amount:s.year_last,
                  name: s.name,
                  topname:topname,
                  depname:sections[s.section0+"-"+s.section1],
                  depcat:sections[s.section0+"-"+s.section1+"-"+s.section2],
                  category:sections[s.section0+"-"+s.section1+"-"+s.section2],
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

                if(obj.depname == "臺中市政府研究發展考核委員會"){
                  obj_rd.push(obj);
                }
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
      csvStream3.end();
      
    fs.writeFile("output/歲出機關別預算表_g0v.json",JSON.stringify(newobj),function(err){
      console.log(arguments);
    });

    fs.writeFile("output/歲出機關別預算表_研考會_g0v.json",JSON.stringify(obj_rd),function(err){
      console.log(arguments);
    });
    

});





// //process 總預算案

// fs.readFile("source/歲出政事別預算表.csv",function(err,body){

//  parseModuleGOV(err,body).then(function(data){
//    fs.writeFile("output/歲出政事別預算表.json",JSON.stringify(data),function(err){
//      // console.log(arguments);
//    });   
//  });

// });


// fs.readFile("source/歲出機關別預算總表.csv",function(err,body){

//  parserModuleInstitutionAll(err,body).then(function(data){
//    fs.writeFile("output/歲出機關別預算總表.json",JSON.stringify(data),function(err){
//      // console.log(arguments);
//    });   
//  });

// });




// fs.readFile("02市府主管-表格 1.csv",processCSV);
