app.controller("MainController", ['$scope', '$http', '$timeout', '$window', 'mainService', '$location', 'fileReader','cfpLoadingBar', '$rootScope', function($scope, $http, $timeout, $window, mainService, $location, fileReader, cfpLoadingBar, $rootScope){

	$scope.graphs = {};
	$scope.graphs.programsClicked = false;
	$scope.graphs.homeClicked = true;
	$scope.graphs.isFileLoaded = false;

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
						console.log("this", i, data);
					}
				}
				console.log(globalArray, count);

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
				$scope.selectedOriginCity = $scope.originCities[0];
				$scope.destinationCities = destinationCities.uniquecity();
				$scope.homeClicked = true;
				//$scope.graphs.setDetails();
				$scope.graphs.isFileLoaded = true;
				$rootScope.$broadcast('fileLoaded');
			});
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

	$scope.UpdateBarChart = function (obj) {
		var value = parseInt($('select :selected').val());
	    var tempArrayAvg = new Array();
	    tempArrayAvg.push("Market average price");

	    var tempArrayMarketMax = new Array();
	    tempArrayMarketMax.push("Market max price");

	    var tempArrayMarketMin = new Array();
	    tempArrayMarketMin.push("Market min price");

	    var tempCityArray = new Array();

	    for (var i = 0; i < dataArray.length; i++) {
	        if ($scope.originCities[value].cityName == dataArray[i].OriginCity) {
	            tempArrayAvg.push(dataArray[i].MarketAvgPrice);
	            tempArrayMarketMax.push(dataArray[i].MarketMaxPrice);
	            tempArrayMarketMin.push(dataArray[i].MarketMinPrice);
	            tempCityArray.push(dataArray[i].DestinationCity);
	        }
	        //MarketMinPrice
	        //MarketAvgPrice
	        //MarketMaxPrice
	    }

	    var chart = c3.generate({
	        bindto: d3.select("#modelBar"),
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
	                ratio: 0.5 // this makes bar width 50% of length between ticks
	            }
	            // or
	            //width: 100 // this makes bar width 100px
	        },
	        axis: {
	            x: {
	                type: 'category',
	                categories: tempCityArray,
	                tick: {
	                    rotate: -15,
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
	        }
	    });
	}

}]);