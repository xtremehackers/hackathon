app.service("mainService", ['$http', '$timeout', '$window', function($http, $timeout, $window){

	var s = this;
	
	s.getMillionConversionFactor = function(){
		return 1000000;
	}
	
	s.unique = function(array) {
		console.log(new Date(), " unique start");
//		return arr;
		/*var u = {}, a = [];
//		arr = removeEmpty(myArr);
		for(var i = 0, l = arr.length; i < l; ++i){
			if(arr[i] == undefined){
				continue;
			}
			arr[i] = arr[i].toLowerCase();
			if(arr[i].trim() != "" || arr[i] != null || arr[i] != undefined){
				if(!u.hasOwnProperty(arr[i])) {
					a.push(arr[i]);
					u[arr[i]] = 1;
				}
			}else{
				console.log(arr[i]);
			}
		}
		return a;*/
		
		var result = [];
		  for(var x = 0; x < array.length; x++){
		  if(result.indexOf(array[x]) == -1)
		        result.push(array[x]);
		  }
		  console.log(new Date(), " unique end");
		  return result;
	}
	
	removeEmpty = function(arr){
		/*for(i = 0; i < arr.length; i++){
			if(arr[i] == '' || arr[i] == null || arr[i] == undefined){
				arr.splice(arr.indexOf(arr[i]), 1);
			}
		}
		return arr;*/
	}
	
	s.drawLegend = function(svg, colors, main_width, extraWidth, legendStartPosition){

		var legendStartX = 40;
		
		var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", 100)
		.attr("width", 100)
		.attr('transform', 'translate('+(legendStartPosition?legendStartPosition:legendStartX)+', -370)');

		var legendRect = legend.selectAll('line').data(colors);

		legendRect.enter()
		.append("rect")
		.attr("y", main_width - 65)
		.attr("width", 10)
		.attr("height", 10);

		legendRect
		.attr("x", function(d, i) {
			return ((i) + (extraWidth*i / 1.5));
		})
		.style("fill", function(d) {
			return d[1];
		});

		var legendText = legend.selectAll('text').data(colors);

		legendText.enter()
		.append("text")
		.style("font-size", "small")
		.attr("y", main_width - 55);

		legendText
		.attr("x", function(d, i) {
			return ((i) + 15 + (i*extraWidth / 1.5));
		})
		.text(function(d) {
			return d[0];
		});

	}
	
	s.drawLegendHorizontal = function(svg, colors, main_width, extraWidth, extraHeight){

		if(extraHeight == undefined){
			extraHeight = 0;
		}
		var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", 100)
		.attr("width", 100)
		.attr('transform', 'translate(-130, 50)');

		var legendRect = legend.selectAll('line').data(colors);

		legendRect.enter()
		.append("rect")
		.attr("x", 400)
		.attr("width", 10)
		.attr("height", 10);

		legendRect
		.attr("y", function(d, i) {
			return i * 20;
		})
		.style("fill", function(d) {
			return d[1];
		});

		var legendText = legend.selectAll('text').data(colors);

		legendText.enter()
		.append("text")
		.style("font-size", "small")
		.attr("x", 420);

		legendText
		.attr("y", function(d, i) {
			return i * 20 + 9;
		})
		.text(function(d) {
			return d[0];
		});
	
	}
	
	s.getColorList = function(){
		/*var colorArray = ["#E9967A", "#B22222", "#808000", "#8A2BE2", "#CD853F", "#D2B48C", "#FF0000", "#0000FF", "#B8860B", "#008080", "#800000", "#FFFF00",
		                  "#B0C4DE", "#FF8C00", "#D2691E", "#00FF7F", "#ADFF2F", "#6A5ACD", "#7CFC00", "#DDA0DD", "#7FFF00", "#00CED1", "#A52A2A", "#006400",
		                  "#DC143C", "#D8BFD8", "#FF4500", "#E0FFFF", "#DAA520"];*/

		
//		var colorArray = ['aqua', 'blue', 'brown', 'darkgreen', 'darkmagenta', 'gold', 'hotpink', 'mediumpurple', 'orangered', 'darkorange', 'red'];
		var colorArray = ['#1f77b4', '#F7A35C', '#95CEFF', '#A9FF96', '#ff7f0e', '#aec7e8', '#8085E9'];
		
		return colorArray;
	}
	
	s.decimalLimit = 2;
	
	s.decimalConversion = function(value){
		if(value!=null){
			return Number(Math.round(value+'e'+s.decimalLimit)+'e-'+s.decimalLimit);
		}else{
			return 0;
		}
	}
	
	s.sort_by = function(field, reverse, primer){

		   var key = primer ? 
		       function(x) {return primer(x[field])} : 
		       function(x) {return x[field]};

		   reverse = !reverse ? 1 : -1;

		   return function (a, b) {
		       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
		     } 
		}
	
	s.unpack = function(rows, key) {
        return rows.map(function(row) { return row[key]; });
	}
	
}]);