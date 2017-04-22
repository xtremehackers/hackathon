app.controller("MainController", ['$scope', '$http', '$timeout', '$window', 'mainService', '$location', 'fileReader','cfpLoadingBar', '$rootScope', function($scope, $http, $timeout, $window, mainService, $location, fileReader, cfpLoadingBar, $rootScope){

	$scope.graphs = {};
	$scope.graphs.programsClicked = false;
	$scope.graphs.homeClicked = true;
	$scope.graphs.isFileLoaded = false;
	
	$scope.graphs.items = [];

	$scope.isLoginPage = false;

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
	
}]);