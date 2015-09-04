

var parse = require('csv-parse');
var Promise = require("promise");

var $money = function(str){
	if(str =="-"){
		return 0; //convert - to 0
	}
	return parseInt(str.replace(/,/g,""),10);
};


var $moneyF = function(str){
	if(str =="-"){
		return 0; //convert - to 0
	}
	return parseFloat(str.replace(/,/g,""),10);
};


var processCSV = function(err,body){
	var p = new Promise(function(ok,fail){
		var outputs = [];
		var out = null;

		// {
		// 	case_name:null,
		// 	name:null,
		//	year:null,
		// 	items:[
		// 		// section1:null,
		// 		// section_string:null,
		// 		// name
		// 		// 金額
		// 		// 經常門
		// 		// 資本門
		// 		// 百分比
		// 	];		
		// };

		var case_name = null;
		parse(body.toString(), null, function(err, output){
			try{
				// console.log(err);
				// console.log(output);
				/*
				plan: 
				1.標題
				2.'款', '項', '目', '節'
				3.名稱及編號
				4.金額
				5.備註

				重要假設：
				* 有金額＝第四格一定是中文科目
				*/

				var last_sections = [null,null,null,null];
				var last_subject_number = null;
				var last_subject = null;
				var last_index = 1;

				output.forEach(function(o){
					for(var i = 0 ; i < o.length ; ++i){
						o[i]= o[i].trim(); //避免後面寫一堆 trim
					}

					if(o[0] && o[0].indexOf("預算案") != -1){ //大標
						case_name = o[0];
					}
					if(o[0] && o[0].indexOf("預算總表") != -1){ //大標
						if( out == null){	//第一次
							out = {
								case_name:case_name,
								name:o[0],
								year:null,
								subjects:[]
							};

						}else if(out.name != o[0]){ //非同一預算表底下
							outputs.push(out);
							out = {
								case_name:case_name,
								name:o[0],
								year:null,
								subjects:[
								]
							};
						}else{ //同一預算表，跳過

						}
					}

					if(o[1] =="總      計"){
						out.summary = {
							"金額":$money(o[4]),
							"經常門":$money(o[6]),
							"資本門":$money(o[7])
						};
						return true;
					}

					if(/中華民國[0-9]+年度/.test(o[0])){
						out.year_label = o[0];
						out.year = parseInt(o[0].match("[0-9]+")[0],10) + 1911;
					}

					if(/^[0-9]+$/.test(o[0])){ //有款
						last_sections[0] = parseInt(o[0],10);
						last_sections[1] = null;
						last_sections[2] = null;
						last_index = 1;
					}

					if(o[4] != "" && o[4] !="合　　計" && o[4] != "金　　額" ){ //有金額 // 假設有金額＝第四格一定是中文科目
						last_subject_number = o[3];
						last_subject = {
							section1:last_sections[0],
							section_string:last_sections[0]+"-"+last_index,
							name:o[1] || o[2],
							"金額": $money(o[4]),
							"百分比":$moneyF(o[5]),
							"經常門":$money(o[6]),
							"資本門":$money(o[7]),
							index:last_index
						};
						last_index++;
						out.subjects.push(last_subject);
					}

					// if(o[7] != "說明" && o[7] != ""){ //重要假設：除 header 外備註不會只有"說明" 兩字
					// 	console.log(last_subject==null,o);
					// 	last_subject.comment.push(o[7]);
					// }

					// console.log(last_sections);

				});
				if(out.year != null){ //not a empty out
					outputs.push(out);
				}
				// console.log(JSON.stringify(outputs));
				ok(outputs);
			}catch(ex){
				console.log(ex,ex.stack);
			}
			// console.log(output);
		});
	});
	return p
};


module.exports = processCSV;

// fs.readFile("02市府主管-表格 1.csv",processCSV);
