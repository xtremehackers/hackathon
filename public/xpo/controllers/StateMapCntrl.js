app.controller("StateMapCntrl", ["$scope", "mainService", function($scope, mainService){
	var width = 1000,
	height = 600,
	centered;

	var destination = mainService.unique(globalArray["DestinationCity"]);
	var avgMarketPrice;
	var statesList = [];
	var stateCode = {};
	destination.shift();
	var count = 0;
	for(h = 1; h < destination.length; h++){
		avgMarketPrice = 0;
		count = 0;
		for(k=1; k < globalArray["DestinationCity"].length; k++){
			if((globalArray["DestinationCity"])[k] == destination[h]){
				latitude = globalArray["DestinationLatitude"][k];
				longitude = globalArray["DestinationLongitude"][k];
				destinationCode = globalArray["DestinationStateCode"][k];
				avgMarketPrice += parseFloat(globalArray["MarketAvgPrice"][k]);
				count++;
			}
		}
		stateCode[destinationCode] = avgMarketPrice/count;
		statesList.push({'state':destination[h], 'code':destinationCode, 'value':avgMarketPrice/count, 'lat':latitude, 'lon':longitude});
	}
	
	//console.log(statesList);
	
	
	function floorAvgPrice(price){
		if(price){
			var price2 = parseInt(price);
			var priceLength = price2.toString().length;
			return (parseInt(price) - (parseInt(price) % Math.pow(10, (priceLength-1))));
		}else{
			return 0;
		}
			
	}
	
	//var color = d3.scale.category20();
	var increment = 500;
	var startPrice =  0;
	var endPrice =  floorAvgPrice(d3.max(statesList, function(d) { return d.value; })) + increment;
	var priceList = [];
	price = startPrice;
	while(price <= endPrice){
		priceList.push(price);
		price += increment;
	}
	
	console.log(priceList);
	
	var color = d3.scale.threshold()
    /*.domain([
             floorAvgPrice(d3.min(statesList, function(d) { return d.value; })),
             floorAvgPrice(d3.max(statesList, function(d) { return d.value; }))
     ])*/
	.domain(priceList)
    .range(["#000000", "#380000", "#580000", "#780000", "#980000", "#980000", "#B80000", "#D80000", "#F80000", "#FFFFFF"]);
	//console.log(color.domain());
	var states = {};
	
	var projection = d3.geo.albersUsa()
	.scale(1070)
	.translate([width / 2, height / 2]);

	var path = d3.geo.path()
	.projection(projection);

	/*var x = d3.scale.linear()
    .domain(color.domain())
    .rangeRound([600, 860]);*/
	
	var graticule = d3.geo.graticule();

	var svg = d3.select("#stateMap").append("svg")
	.attr("width", width)
	.attr("height", height);

	var g = svg.append("g");
	
	/*g.selectAll("rect")
	  .data(color.range().map(function(d) {
	      d = color.invertExtent(d);
	      if (d[0] == null) d[0] = x.domain()[0];
	      if (d[1] == null) d[1] = x.domain()[1];
	      return d;
	    }))
	  .enter().append("rect")
	    .attr("height", 8)
	    .attr("x", function(d) { return x(d[0]); })
	    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
	    .attr("fill", function(d) { return color(d[0]); });

	g.append("text")
	    .attr("class", "caption")
	    .attr("x", x.range()[0])
	    .attr("y", -6)
	    .attr("fill", "#000")
	    .attr("text-anchor", "start")
	    .attr("font-weight", "bold")
	    .text("Unemployment rate");

	g.call(d3.axisBottom(x)
	    .tickSize(13)
	    .tickFormat(function(x, i) { return i ? x : x + "%"; })
	    .tickValues(color.domain()))
	  .select(".domain")
	    .remove();

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
	};*/

//	Setup groups
//	--------------------------------------
//	Add groups for arcs and images. If arcs are added before images, they
//	will appear under the images.
//	order is important
	var stateGroup = g.append('g');
	var arcGroup = g.append('g');
	var imageGroup = g.append('g');
	var pointGroup = g.append('g');

//	Also, text needs to be added to the `g` group
	/*var point = pointGroup.append("g")
	.attr("class", "points")
	.selectAll("g")
	.data(d3.entries(places))
	.enter().append("g")
	.attr("transform", function(d) { return "translate(" + projection(d.value) + ")"; });

	point.append("text")
	.attr("y", 5)
	.attr("dx", "1em")
	.text(function(d) { return d.key; });*/

	queue()
    .defer(d3.json, "xpo/controllers/us.json")
    .defer(d3.json, "xpo/controllers/usStates.json")
    .await(ready);
	
	//d3.json("xpo/controllers/us-states.json", function(error, us) {
		// draw states
	
	function ready(error, us, states){
		 var countries = topojson.feature(us, us.objects.states).features,
         neighbors = topojson.neighbors(us.objects.states.geometries);

		 //console.log(states);
		 /*for (var i = 0; i < states.length; i++) {
	        states = topojson.feature(states[i], states[i].objects.stdin);
	      }
		 
		 console.log(states);*/

		 for (var i = 0; i < statesList.length; i++) {
			 //Grab state name
			 var dataState = statesList[i].state;

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
		 .on("click", clicked)
		 .style("fill", function(d, i) { 
			 //console.log(color(floorAvgPrice(stateCode[d.properties.code])), floorAvgPrice(stateCode[d.properties.code]));
			 return color(floorAvgPrice(stateCode[d.properties.code])); 
		  })
		 
		 
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
	          return path.centroid(d)[0];
	      })
	      .attr("y", function(d){
	          return  path.centroid(d)[1];
	      })
	      .attr("text-anchor","middle")
	      .attr('fill', 'white');

		 
		 stateGroup.append("path")
		 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		 .attr("id", "state-borders")
		 .attr("d", path);
		 

	/*	d3.csv("/public/xpo/controllers/nasacenters.csv", function(error, data) {
			// Draw images after drawing paths.
			imageGroup.selectAll("image").data([0])
			.data(data)
			.enter()
			.append("image")
			.attr("xlink:href", "nasalogo.png")
			.attr("width", "30")
			.attr("height", "30")
			.attr("x", function(d) {
				return projection([d.lon, d.lat])[0]-15;
			})
			.attr("y", function(d) {
				return projection([d.lon, d.lat])[1]-15;
			})

			// --- Helper functions (for tweening the path)
			var lineTransition = function lineTransition(path) {
				path.transition()
				//NOTE: Change this number (in ms) to make lines draw faster or slower
				.duration(5500)
				.attrTween("stroke-dasharray", tweenDash)
				.each("end", function(d,i) { 
					////Uncomment following line to re-transition
					//d3.select(this).call(transition); 

					//We might want to do stuff when the line reaches the target,
					//  like start the pulsating or add a new point or tell the
					//  NSA to listen to this guy's phone calls
					//doStuffWhenLineFinishes(d,i);
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
						[ data[0].lon, data[0].lat ],
						[ data[1].lon, data[1].lat ]
						]
				}
				];

			// you can build the links any way you want - e.g., if you have only
			//  certain items you want to draw paths between
			// Alterntively, it can be created automatically based on the data
			links = [];
			for(var i=0, len=data.length-1; i<len; i++){
				// (note: loop until length - 1 since we're getting the next
				//  item with i+1)
				links.push({
					type: "LineString",
					coordinates: [
						[ data[i].lon, data[i].lat ],
						[ data[i+1].lon, data[i+1].lat ]
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
				stroke: '#0000ff',
				'stroke-width': '2px'
			})
			// Uncomment this line to remove the transition
			.call(lineTransition); 

			//exit
			pathArcs.exit().remove();

		});*/

	};

	function clicked(d) {
		var x, y, k;

		if (d && centered !== d) {
			var centroid = path.centroid(d);
			x = centroid[0];
			y = centroid[1];
			k = 4;
			centered = d;
		} else {
			x = width / 2;
			y = height / 2;
			k = 1;
			centered = null;
		}

		g.selectAll("path")
		.classed("active", centered && function(d) { return d === centered; });

		g.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		.style("stroke-width", 1.5 / k + "px");
	}
}]);