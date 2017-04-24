app.controller("MapCntrl", ["$scope", "mainService", function($scope, mainService){
	var width = 1000,
	height = 600,
	centered;
	$scope.isSourceSelected = false;

	var tooltipText = '<h4> City: %heading </h4><p> Market Avg Rate(Per Mile): %val1</p><p> XPO Rate(Per Mile): %val2</p>';

	//console.log(mainService.unique(globalArray["OriginStateCode"]));

	var destination = $scope.graphs.destination;
	var avgMarketPrice;
	var statesList = [];

	var arcdata = [];
	for(var i=1; i< globalArray.OrderId.length; i++) {
		arcdata.push({
			sourceLocation: [globalArray.OriginLongitude[i], globalArray.OriginLatitude[i]],
			targetLocation: [globalArray.DestinationLongitude[i], globalArray.DestinationLatitude[i]],
			sourceCity: globalArray.OriginCity[i]
		});
	}

	destination.shift();

	var count = 0;
	for(h = 1; h < destination.length; h++){
		avgMarketPrice = 0;
		xpoCost = 0;
		for(k=1; k < globalArray["DestinationCity"].length; k++){
			if((globalArray["DestinationCity"])[k] == destination[h]){
				latitude = globalArray["DestinationLatitude"][k];
				longitude = globalArray["DestinationLongitude"][k];
				avgMarketPrice += parseFloat(globalArray["MarketAvgPrice"][k]);
				xpoCost += parseFloat(globalArray["OurTransportationCost"][k]);
				count++;
			}
		}
		statesList.push({'city':destination[h], 'value':avgMarketPrice/count, 'lat':latitude, 'lon':longitude, 'orderCount':count, 'profit':(avgMarketPrice-xpoCost)});
	}

	//console.log(statesList);


	var color = d3.scale.category20();

	/*var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9]);*/

	$scope.count = 0;
	$scope.updateMap = function(){

//		console.log($scope.selectedOriginCity);
		var pathList = [];

		$scope.count = 0;
		$scope.totalTransportationCost = 0;
		for(var i=1; i< globalArray.OrderId.length; i++) {
			if($scope.selectedOriginCity == globalArray.OriginCity[i]){
				$scope.count++;
				$scope.totalTransportationCost += parseFloat(globalArray.OurTransportationCost[i]);
				pathList.push({
					sourceLocation: [globalArray.OriginLongitude[i], globalArray.OriginLatitude[i]],
					targetLocation: [globalArray.DestinationLongitude[i], globalArray.DestinationLatitude[i]],
					destinationCity: globalArray.DestinationCity[i],
					xpoRate: globalArray.OurRatePerMile[i],
					marketRate: globalArray.MarketAvgPricePerMile[i],
				});
			}
		}
		drawArcs(pathList);
		$scope.isSourceSelected = true;
	}

	var states = {};

	var projection = d3.geo.albersUsa()
	.scale(1070)
	.translate([width / 2, height / 2]);

	var path = d3.geo.path()
	.projection(projection);

	var graticule = d3.geo.graticule();


	var svg = d3.select("#maps").append("svg")
	.attr("width", width)
	.attr("height", height);

	var tooltip = d3.select("#maps").append("div").attr("class",
	"toolTip");

	var g = svg.append("g");

	var places = {
			GSFC: [-76.852587, 38.991621],
			KSC: [-80.650813, 28.524963]
	};

	var route = {
			type: "LineString",
			coordinates: [
				places.GSFC,
				places.KSC
				]
	};

//	Setup groups
//	--------------------------------------
//	Add groups for arcs and images. If arcs are added before images, they
//	will appear under the images.
//	order is important
	var stateGroup = g.append('g');
	var arcGroup = g.append('g');
	var pointGroup = g.append('g');

	queue()
	.defer(d3.json, "xpo/controllers/us.json")
	.defer(d3.json, "xpo/controllers/usStates.json")
	.await(ready);

	// draw states

	function ready(error, us, states){
		var countries = topojson.feature(us, us.objects.states).features,
		neighbors = topojson.neighbors(us.objects.states.geometries);

		for (var i = 0; i < statesList.length; i++) {
			//Grab state name
			var dataState = statesList[i].city;

			//Grab data value, and convert from string to float
			var dataValue = parseFloat(statesList[i].value);

			//Find the corresponding state inside the GeoJSON
			for (var j = 0; j < states.features.length; j++) {

				var jsonState = states.features[j].properties.name;

				if (dataState.toLowerCase() == jsonState.toLowerCase()) {

					//Copy the data value into the JSON
					states.features[j].properties.value = dataValue;

					//Stop looking through the JSON
					break;

				}else{
					states.features[j].properties.value = 0;
					break;
				}
			}
		}	

		//console.log(states);

		stateGroup.append("g")
		.attr("id", "states")
		.selectAll("path")
		.data(states.features)
		.enter().append("path")
		.attr("d", path)
		.style("fill", function(d, i) { return color(d.color = d3.max(states.features[i], function(n) { return states.features[n].properties.value; }) + 1 | 0); })

		stateGroup.append("g")
		.attr("class", "states-names")
		.selectAll("text")
		.data(states.features)
		.enter()
		.append("svg:text")
		.text(function(d){
			return d.properties.code;
		})
		.attr("x", function(d){
			if(path.centroid(d)[0])
				return path.centroid(d)[0];
		})
		.attr("y", function(d){
			if(path.centroid(d)[1])
				return  path.centroid(d)[1];
		})
		.attr("text-anchor","middle")
		.attr('fill', 'white');

		stateGroup.append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		.attr("id", "state-borders")
		.attr("d", path);

	};

	drawArcs = function(pathList){
		svg.selectAll("circle").remove();

		svg.selectAll("circle")
		.data(pathList)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {
			if(projection([d.sourceLocation[0], d.sourceLocation[1]]) && i == 0){
				return projection([d.sourceLocation[0], d.sourceLocation[1]])[0];
			}
		})
		.attr("cy", function(d, i) {
			if(projection([d.sourceLocation[0], d.sourceLocation[1]]) && i == 0){
				return projection([d.sourceLocation[0], d.sourceLocation[1]])[1];
			}
		})
		.attr("cx", function(d, i) {
			if(projection([d.targetLocation[0], d.targetLocation[1]])){
				return projection([d.targetLocation[0], d.targetLocation[1]])[0];
			}
		})
		.attr("cy", function(d, i) {
			if(projection([d.targetLocation[0], d.targetLocation[1]])){
				return projection([d.targetLocation[0], d.targetLocation[1]])[1];
			}
		})
		.attr("r", 5)
		.style("fill", "orange")
		.style("opacity", 1)
		.on("mousemove", function(d){
       	 tooltip
	         .html(prepareTooltip(d))
	         .style("left", (d3.event.pageX - 34) + "px")
	         .style("top", (d3.event.pageY - 12) + "px")
       	 .style("display", "inline-block");
        })
        .on("mouseout", function(d){
       	 tooltip.style("display", "none");
       });
		
		
		// --- Helper functions (for tweening the path)
		var lineTransition = function lineTransition(path) {
			path.transition()
			//NOTE: Change this number (in ms) to make lines draw faster or slower
			.duration(2500)
			.attrTween("stroke-dasharray", tweenDash)
			.each("end", function(d,i) { 

			});
		};
		var tweenDash = function tweenDash() {
			//This function is used to animate the dash-array property, which is a
			//  nice hack that gives us animation along some arbitrary path (in this
			//  case, makes it look like a line is being drawn from point A to B)
			var len = this.getTotalLength(),
			interpolate = d3.interpolateString("0," + len, len + "," + len);

			return function(t) { return interpolate(t); };
		};

		// --- Add paths
		// Format of object is an array of objects, each containing
		//  a type (LineString - the path will automatically draw a greatArc)
		//  and coordinates 
		var links = [
			{
				type: "LineString",
				coordinates: [
					[ pathList[0].sourceLocation[0], pathList[0].sourceLocation[1] ],
					[ pathList[0].targetLocation[0], pathList[0].targetLocation[1] ]
					]
			}
			];

		// you can build the links any way you want - e.g., if you have only
		//  certain items you want to draw paths between
		// Alterntively, it can be created automatically based on the data
		links = [];
		for(var i=0, len=pathList.length-1; i<len; i++){
			// (note: loop until length - 1 since we're getting the next
			//  item with i+1)
			links.push({
				type: "LineString",
				coordinates: [
					[ pathList[i].sourceLocation[0], pathList[i].sourceLocation[1] ],
					[ pathList[i].targetLocation[0], pathList[i].targetLocation[1] ]
					]
			});
		}

		// Standard enter / update 
		var pathArcs = arcGroup.selectAll(".arc")
		.data(links);

		//enter
		pathArcs.enter()
		.append("path").attr({
			'class': 'arc'
		}).style({ 
			fill: 'none',
		});

		//update
		pathArcs.attr({
			//d is the points attribute for this path, we'll draw
			//  an arc between the points using the arc function
			d: path
		})
		.style({
			stroke: 'red',
			'stroke-width': '2px'
		})
		// Uncomment this line to remove the transition
		.call(lineTransition); 

		//exit
		pathArcs.exit().remove();
		
		prepareTooltip = function(object){
//		 console.log(object);
		 var str = tooltipText;
			str = str.replace("%heading", object.destinationCity.toUpperCase());
			str = str.replace("%val1", object.marketRate);
			str = str.replace("%val2", object.xpoRate);
			return str;
		}
	}

}]);