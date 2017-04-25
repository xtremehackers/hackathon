app.controller("MainController", ['$scope', '$http', '$timeout', '$window', 'mainService', '$location', 'fileReader','cfpLoadingBar', '$rootScope','appService', 'mainService', function($scope, $http, $timeout, $window, mainService, $location, fileReader, cfpLoadingBar, $rootScope, appService, mainService){


	appService.fetchExcelData().success(function(response){

		for(var i=1; i< response[0].length; i++){
			atlantaData.push({'Destination':response[0][i]['Destination'],
				'Origin':response[0][i]['Origin'],
				'Rate':response[0][i]['Rate']
			});
		}

		/*console.log(atlantaData);*/
	});

	$scope.graphs = {};
	$scope.graphs.programsClicked = false;
	$scope.graphs.homeClicked = true;
	$scope.graphs.isFileLoaded = false;
	$scope.graphs.count = 0;

	$scope.graphs.items = [];

	$scope.isLoginPage = false;

	$scope.originCities = new Array();
	$scope.destinationCities = new Array();
	/*if(!sessionStorage.getItem('user')){
		$location.path("/login");
	}
	 */

	var url1 = '';
	var count = 0;
	$scope.getFile = function () {

		console.log(new Date(), " file start");
		cfpLoadingBar.start();
//		var url1 = window.location.href.split('#!')[0] + 'resources/Master_dashboard_V3.0.csv';
		fileReader.readAsDataUrl($scope.graphs.file, $scope) 
		.then(function(result) { 
			url1 = result;

			$http.get(url1).success(function(allText) {

				/*	var myNewArray = CSVtoArray(allText);
				console.log(myNewArray);*/

				var allTextLines = allText.split(/\r\n|\n/);
				var headers = allTextLines[0].split(',');
				var lines = [];

				var varName = '';
				for(j = 0; j < headers.length; j++){
					varName = headers[j];
					globalArray[varName] = [];
				}

				for ( var i = 0; i < allTextLines.length-1; i++) {
					var data = CSVtoArray(allTextLines[i]);
					if(data==null){
						continue;
					}
					if (data.length == headers.length) {
						var tarr = [];
						for ( var j = 0; j < headers.length; j++) {
							varName = headers[j];
							globalArray[varName].push(data[(j)]);
						}
					}else{
						count++;
//						console.log("this", i, data);
					}
				}
//				console.log(globalArray, count);

				for(var i=1; i< globalArray.OrderId.length; i++)
				{
					if(dataArray == undefined)
						dataArray = new Array();
					if(destinationCities == undefined)
						destinationCities = new Array();
					if(sourceCities == undefined)
						sourceCities = new Array();

					sourceCities.push({ id : i , cityName: globalArray.OriginCity[i]});
					destinationCities.push({ id : i , cityName:globalArray.DestinationCity[i]});
					dataArray.push({
						OrderId: globalArray.OrderId[i],
						BillingDistance: globalArray.BillingDistance[i],
						DataProviderCode: globalArray.DataProviderCode[i],
						DeliveredDate : globalArray.DeliveredDate[i],
						DestinationCity: globalArray.DestinationCity[i],
						DestinationCountryCode : globalArray.DestinationCountryCode[i],
						DestinationLatitude: globalArray.DestinationLatitude[i],
						DestinationLongitude:  globalArray.DestinationLongitude[i],
						DestinationPostalCode: globalArray.DestinationPostalCode[i],
						DestinationStateCode:  globalArray.DestinationStateCode[i],
						MarketAvgCost:  globalArray.MarketAvgCost[i],
						MarketAvgCostPerMile:  globalArray.MarketAvgCostPerMile[i],
						MarketAvgPrice:  globalArray.MarketAvgPrice[i],
						MarketAvgPricePerMile:  globalArray.MarketAvgPricePerMile[i],
						MarketMaxCost:  globalArray.MarketMaxCost[i],
						MarketMaxCostPerMile:  globalArray.MarketMaxCostPerMile[i],
						MarketMaxPrice:  globalArray.MarketMaxPrice[i],
						MarketMinCost:  globalArray.MarketMinCost[i],
						MarketMinCostPerMile:  globalArray.MarketMinCostPerMile[i],
						MarketMinPrice:  globalArray.MarketMinPrice[i],
						MarketMinPricePerMile:  globalArray.MarketMinPricePerMile[i],

						OriginCity: globalArray.OriginCity[i],
						OriginCountryCode: globalArray.OriginCountryCode[i],
						OriginLatitude: globalArray.OriginLatitude[i],
						OriginLongitude : globalArray.OriginLongitude[i],
						OriginPostalCode: globalArray.OriginPostalCode[i],
						OriginStateCode : globalArray.OriginStateCode[i],
						OurRatePerMile: globalArray.OurRatePerMile[i],
						OurTransportationCost:  globalArray.OurTransportationCost[i],
						PriceDate: globalArray.PriceDate[i]
					});
				}

				$scope.originCities = sourceCities.uniquecity();
				$scope.selectedOriginCity = $scope.originCities[0].id;
				$scope.destinationCities = destinationCities.uniquecity();
				$scope.homeClicked = true;
				//$scope.graphs.setDetails();
				$scope.graphs.isFileLoaded = true;
				$rootScope.$broadcast('fileLoaded');
				$scope.graphs.destination = mainService.unique(globalArray["DestinationCity"]);
				$scope.UpdateBarChart();
			});
			console.log(new Date(), " file end");
		});

		cfpLoadingBar.complete();
	};

	function CSVtoArray(text) {
		var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
		var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
		// Return NULL if input string is not well formed CSV string.
		if (!re_valid.test(text)) return null;
		var a = [];                     // Initialize array to receive values.
		text.replace(re_value, // "Walk" the string using replace with callback.
				function(m0, m1, m2, m3) {
			// Remove backslash from \' in single quoted values.
			if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
			// Remove backslash from \" in double quoted values.
			else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
			else if (m3 !== undefined) a.push(m3);
			return ''; // Return empty string.
		});
		// Handle special case of empty last value.
		if (/,\s*$/.test(text)) a.push('');
		return a;
	};


	$scope.isPath = function (route) {
		return route === $location.path();

	}   

	if($location.path() == '/'){
		if(!sessionStorage.getItem('user')){
			$location.path('/login');
		}
	}

	$scope.signOut = function(){
		if(sessionStorage.getItem('user')){
			sessionStorage.removeItem('user');
		}
		$location.path('/login');
	}


	$scope.modifyGraph = function(myVar){
		if(globalArray['Program'].indexOf(myVar.data) != -1){
			$scope.graphs.makeProgramsList(myVar);
		}else if(globalArray['Supplier'].indexOf(myVar.data) != -1){
			$scope.graphs.makeSuppliersList(myVar);
		}else if(globalArray['Process'].indexOf(myVar.data) != -1){
			$scope.graphs.makeProcessList(myVar);
		}
	}

	$scope.showHomepageGraph = function(){
		$scope.graphs.programsClicked = false; 
		$scope.graphs.homeClicked = true; 
		$scope.graphs.suppliersClicked = false;
		$scope.graphs.processClicked = false;
		$scope.graphs.materialsClicked = false;
		$scope.graphs.altSourceClicked = false;
		$scope.graphs.csEACClicked = false;
		$scope.graphs.vaveClicked = false;
		$scope.graphs.setDetails();
	}

	angular.element($window).on('resize', function(){ 
		//$scope.sizeChange();
		//resizeAll();
	})

	/*$scope.sizeChange = function() {
		console.log("size change");
		d3.select("g").attr("transform", "scale(" + $("#worldMap").width()/900 + ")");
	    $("svg").height($("#worldMap").width()*0.618);

		//$scope.$broadcast('resized');
	}*/

	function resizeAll() {
		d3.selectAll('svg').call(scaleSvg);
	}

	function scaleSvg(sel) {
		sel.each(function() {
			// split the viewbox into its component parts
			var vbArray = d3.select(this).attr('viewBox').split(' ');
			// find the ratio of height to width
			var heightWidthRatio = +vbArray[3] / +vbArray[2];
			// get the width of the body (or you could use some other container)
			var w = document.body.offsetWidth;
			// set the width and height of the element
			d3.select(this)
			.attr('width', w)
			.attr('height', w * heightWidthRatio);
		});
	}


	/*$scope.updateMap = function(obj){
		console.log(obj);
	}*/	
	


	$scope.UpdateBarChart = function (obj) {
		var value = parseInt($('select :selected').val());
		if(value == null || value == undefined || isNaN(value))
			value = $scope.selectedOriginCity;
		var tempArrayAvg = new Array();
		tempArrayAvg.push("Market average price");

		var tempArrayMarketMax = new Array();
		tempArrayMarketMax.push("Market max price");

		var tempArrayMarketMin = new Array();
		tempArrayMarketMin.push("Market min price");

		var tempCityArray = new Array();

		var tempDestinationArray = new Array();

		for (var i = 0; i < dataArray.length; i++) {
			if ($scope.originCities[value].cityName == dataArray[i].OriginCity) {
				tempArrayAvg.push(dataArray[i].MarketAvgPrice);
				tempArrayMarketMax.push(dataArray[i].MarketMaxPrice);
				tempArrayMarketMin.push(dataArray[i].MarketMinPrice);
				tempCityArray.push(dataArray[i].DestinationCity + "(" + dataArray[i].DestinationPostalCode + ")");

				tempDestinationArray.push(dataArray[i].DestinationCity);
			}
		}

		var chartColorArray = new Array();
		chartColorArray.push("#1dd09c");
		chartColorArray.push("#8c7cac");
		chartColorArray.push("#9c3773");

		var chart = c3.generate({
			bindto: d3.select("#modelBar"),
			padding: {
				bottom: 30
			},
			data: {
				columns: [
				          tempArrayMarketMin,
				          tempArrayMarketMax,
				          tempArrayAvg
				          ],
				          type: 'bar'
			},
			bar: {
				width: {
					ratio: 0.5
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: tempCityArray,
					tick: {
						rotate: -30,
						multiline: false,
						fit: true,
						centered: true,
						culling: {
							max: 1
						}
					},
					height: 30,
					extent: [0,20]
				}
			},
			zoom: {
				enabled: true
			},
			subchart:{ 
				show: true, 
				size: {
					height: 40 
				}, 
				onbrush: function (domain) {
					console.log(domain); 
				},
				axis: {
					x:{
						show:false
					}
				}
			},
			color: {
				pattern: chartColorArray
			}
		});
		$scope.GetOrder();
		$scope.UpdateCostBarChart();

		//var distinationCityCountArray = {};
		////for (var i = 1; i <= tempDestinationArray.length; i++) {
		////    distinationCityCountArray[i] = distinationCityCountArray[tempDestinationArray[i - 1]] == undefined ? 0 : tempDestinationArray[tempDateArray[i - 1]];
		////}

		//tempDestinationArray.forEach(function (i) {
		//    distinationCityCountArray[i] = (distinationCityCountArray[i] || 0) + 1;
		//});

		//$scope.maxFrequentCities = new Array();


		$scope.mostFrequentDestination = $scope.mostFrequent(tempDestinationArray);

		$scope.leastFrequentDestination = $scope.leastFrequent(tempDestinationArray);

		$scope.isNutralFrequency = false;

		if ($scope.mostFrequentDestination.length == $scope.leastFrequentDestination) {
			for (var i = 0; i < $scope.mostFrequentDestination.length; i++) {
				if ($scope.mostFrequentDestination[i].val != $scope.leastFrequentDestination[i].val || $scope.mostFrequentDestination[i].count != $scope.leastFrequentDestination[i].count)
					$scope.isNutralFrequency = true;
			}
		}


	}


	$scope.mostFrequent = function(arr) {
		var uniqs = {};
		var uniqueArray = new Array();
		for(var i = 0; i < arr.length; i++) {
			uniqs[arr[i]] = (uniqs[arr[i]] || 0) + 1;
		}

		var max = { val: arr[0], count: 1 };
		for (var u in uniqs) {
			if (max.count < uniqs[u]) {
				max = { val: u, count: uniqs[u] };
			}
		}

		for (var u in uniqs) {
			if (uniqs[u] == max.count && uniqueArray.length == 0)
				uniqueArray.push(max);
			else if (uniqs[u] == max.count && u != max.val)
				uniqueArray.push({ val: u, count: uniqs[u] });
		}

		return uniqueArray;
	}

	$scope.leastFrequent = function (arr) {
		var uniqs = {};
		var uniqueArray = new Array();
		for (var i = 0; i < arr.length; i++) {
			uniqs[arr[i]] = (uniqs[arr[i]] || 0) + 1;
		}

		var min = undefined;
		for (var u in uniqs) {
			if (min == undefined)
				min = { val: u, count: uniqs[u] };
			else if (min.count > uniqs[u]) {
				min = { val: u, count: uniqs[u] };
			}
		}

		for (var u in uniqs) {
			if (uniqs[u] == min.count && uniqueArray.length == 0)
				uniqueArray.push(min);
			else if(uniqs[u] == min.count && u != min.val)
				uniqueArray.push({ val: u, count: uniqs[u] });
		}

		return uniqueArray;
	}


	$scope.UpdateCostBarChart = function (obj) {
		var value = parseInt($('select :selected').val());
		if(value == null || value == undefined || isNaN(value))
			value = $scope.selectedOriginCity;
		var tempArrayXPOCost = new Array();
		tempArrayXPOCost.push("XPO transportation cost");

		var tempArrayMarketMin = new Array();
		tempArrayMarketMin.push("Market min transportation cost");

		var tempArrayMarketMax = new Array();
		tempArrayMarketMax.push("Market max transportation cost");

		var tempArrayMarketAvg = new Array();
		tempArrayMarketAvg.push("Market average transportation cost");

		var tempCityArray = new Array();

		for (var i = 0; i < dataArray.length; i++) {
			if ($scope.originCities[value].cityName == dataArray[i].OriginCity) {
				tempArrayMarketMin.push(dataArray[i].MarketMinCostPerMile * dataArray[i].BillingDistance);
				tempArrayMarketMax.push(dataArray[i].MarketMaxCostPerMile * dataArray[i].BillingDistance);
				tempArrayMarketAvg.push(dataArray[i].MarketAvgCostPerMile * dataArray[i].BillingDistance);
				tempArrayXPOCost.push(dataArray[i].OurTransportationCost)

				tempCityArray.push(dataArray[i].DestinationCity + "(" + dataArray[i].DestinationPostalCode + ")");
			}
		}

		var chartColorArray = new Array();
		chartColorArray.push("#1dd09c");
		chartColorArray.push("#8c7cac");
		chartColorArray.push("#9c3773");
		chartColorArray.push("#8080ff");

		var chart = c3.generate({
			bindto: d3.select("#modelCostBar"),
			padding: {
				bottom: 75
			},
			data: {
				columns: [
				          tempArrayXPOCost,
				          tempArrayMarketMin,
				          tempArrayMarketMax,
				          tempArrayMarketAvg
				          ],
				          type: 'bar'
			},
			bar: {
				width: {
					ratio: 0.5 
				}
			},
			axis: {
				x: {
					type: 'category',
					categories: tempCityArray,
					tick: {
						rotate: -30,
						multiline: false,
						fit: true,
						centered: true,
						culling: {
							max: 1
						}
					}
				}
			},
			zoom: {
				enabled: true
			},
			color: {
				pattern: chartColorArray
			}
		});
	}


	$scope.onChartTypeChange = function(chartType){
		var tempRateArray = new Array();
		tempRateArray.push("Rate chart for origin");
		var destinationArray = new Array();

		for(var i = 0; i<atlantaData.length; i++)
		{
			tempRateArray.push(atlantaData[i].Rate);
			destinationArray.push(atlantaData[i].Destination);
		}

		/*var chartColorArray = new Array();
	    chartColorArray.push("#1dd09c");
	    chartColorArray.push("#8c7cac");
	    chartColorArray.push("#9c3773");*/

		var chart = c3.generate({
			bindto: d3.select("#rateChartBar"),
			padding: {
				bottom: 70
			},
			data: {
				columns: [
				          tempRateArray,
				          ],
				          type: chartType.toLowerCase()
			},
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
			// or
			//width: 100 // this makes bar width 100px
			},
			axis: {
				x: {
					type: 'category',
					categories: destinationArray,
					tick: {
						rotate: -30,
						multiline: false,
						fit: true,
						centered: true

					}
				}
			},
			zoom: {
				enabled: true
			}
		});


	}


	var changeRateChart = function(){
		$scope.chartTypes = ['Line', 'Bar', 'Area'];
		$scope.selectedChartType = 'Bar';
		$scope.onChartTypeChange($scope.selectedChartType);
	}


	$scope.getAtalantaData = function(){
		changeRateChart();
	}

	$scope.GetOrder = function () {
		var value = parseInt($('select :selected').val());
		if(value == null || value == undefined || isNaN(value))
			value = $scope.selectedOriginCity;
		var tempDataArray = new Array();
		var tempDateArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var ColumnArray = new Array();

		var monthCountArray = new Array();

		$scope.destinationCityDelivery = new Array();


		for (var i = 0; i < dataArray.length; i++) {
			if ($scope.originCities[value].cityName == dataArray[i].OriginCity) {
				$scope.destinationCityDelivery.push({
					Destination: dataArray[i].DestinationCity,
					DeliveryDate: dataArray[i].DeliveredDate.split('-')[1],
					Orders: dataArray[i].OrderId
				});
			}
		}
		for (var i = 0; i < $scope.destinationCityDelivery.length; i++) {


			tempDataArray.push($scope.destinationCityDelivery[i].DeliveryDate);
		}

		for (var i = 0; i < tempDataArray.length; i++) {
			var num = tempDataArray[i];
			ColumnArray[num] = ColumnArray[num] ? ColumnArray[num] + 1 : 1;
		}

		monthCountArray.push("Monthly volume of freight movement");

		for (var i = 1; i <= tempDateArray.length; i++) {
			monthCountArray[i] = ColumnArray[tempDateArray[i-1]] == undefined ? 0 : ColumnArray[tempDateArray[i-1]];
		}

		var tempPieArray = [
		                    ["Jan", monthCountArray[1]],// == 0 ? 0 : (monthCountArray[1] * 100 / $scope.destinationCityDelivery.length)],
		                    ["Feb", monthCountArray[2]],// == 0 ? 0 : (monthCountArray[2] * 100 / $scope.destinationCityDelivery.length)],
		                    ["March", monthCountArray[3]],// == 0 ? 0 : (monthCountArray[3] * 100 / $scope.destinationCityDelivery.length)], ,
		                    ["April", monthCountArray[4]],// == 0 ? 0 : (monthCountArray[4] * 100 / $scope.destinationCityDelivery.length)],
		                    ["May", monthCountArray[5]],// == 0 ? 0 : (monthCountArray[5] * 100 / $scope.destinationCityDelivery.length)],
		                    ["June", monthCountArray[6]],// == 0 ? 0 : (monthCountArray[6] * 100 / $scope.destinationCityDelivery.length)],
		                    ["July", monthCountArray[7]],// == 0 ? 0 : (monthCountArray[7] * 100 / $scope.destinationCityDelivery.length)],
		                    ["August", monthCountArray[8]],// == 0 ? 0 : (monthCountArray[8] * 100 / $scope.destinationCityDelivery.length)],
		                    ["Sepetember", monthCountArray[9]],// == 0 ? 0 : (monthCountArray[9] * 100 / $scope.destinationCityDelivery.length)],
		                    ["October", monthCountArray[10]],// == 0 ? 0 : (monthCountArray[10] * 100 / $scope.destinationCityDelivery.length)],
		                    ["November", monthCountArray[11]],// == 0 ? 0 : (monthCountArray[11] * 100 / $scope.destinationCityDelivery.length)],
		                    ["December", monthCountArray[12]],// == 0 ? 0 : (monthCountArray[12] * 100 / $scope.destinationCityDelivery.length)]
		                    ]
		var chartColorArray = ["#003366", "#339966", "#003300", "#3399ff", "#990033", "#9933ff", "#333399", "#cc99ff", "#1dd09c", "#666699", "#33cccc", "#0000cc"];
		var chart = c3.generate({
			bindto: d3.select("#modelBarDate"),
			padding: {
				bottom: 60
			},
			data: {
				columns: tempPieArray,
				type: 'pie'
			},
			color: {
				pattern: chartColorArray
			}
			//,
			//bar: {
			//    width: {
			//        ratio: 0.5 // this makes bar width 50% of length between ticks
			//    }
			//    // or
			//    //width: 100 // this makes bar width 100px
			//},
			//axis: {
			//    x: {
			//        type: 'category',
			//        categories: tempDateArray,
			//        tick: {
			//            rotate: -15,
			//            multiline: false,
			//            fit: true,
			//            centered: true,
			//            culling: {
			//                max: 1
			//            }
			//        }
			//    }
			//},
			//zoom: {
			//    enabled: true
			//}
		});
	}


}]);