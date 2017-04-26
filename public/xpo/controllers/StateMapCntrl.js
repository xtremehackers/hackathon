app.controller("StateMapCntrl", ["$scope", "mainService", function($scope, mainService){
	var width = 1100,
	height = 600,
	boxmargin = 4,
    lineheight = 14,
    keyheight = 10,
    keywidth = 40,
    boxwidth = 3 * keywidth,
	centered;
	
	var title = ['State-wise XPO','Transportation Cost'],
    titleheight = title.length*lineheight + boxmargin;
	
	var margin = { "left": 150, "top": 80 };

	var destination = $scope.graphs.destination;
	var avgMarketPrice;
	var statesList = [];
	var stateCode = {};
	destination.shift();
	var count = 0;
	for(h = 1; h < destination.length; h++){
		avgMarketPrice = 0;
		count = 0;
		for(k=1; k < dataArray.length; k++){
			if(dataArray[k].DestinationCity == destination[h]){
				latitude = dataArray[k].DestinationLatitude;
				longitude = dataArray[k].DestinationLongitude;
				avgMarketPrice += parseFloat(dataArray[k].OurTransportationCost);
				destinationCode = dataArray[k].DestinationStateCode;
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
    .range(["#F80000", "#D80000", "#B80000", "#980000", "#980000", "#780000", "#580000", "#380000","#000000" ]);
	//console.log(color.domain());
	var states = {};
	
	var projection = d3.geo.albersUsa()
	.scale(1070)
	.translate([width / 2, height / 2]);

	var path = d3.geo.path()
	.projection(projection);
	
	var x = d3.scale.linear()
    .domain(priceList)
    .rangeRound([600, 860]);

	var graticule = d3.geo.graticule();

	var svg = d3.select("#stateMap").append("svg")
	.attr("width", width)
	.attr("height", height);
	
	var tooltip = d3.select("#stateMap").append("div").attr("class",
	"toolTip");

	var g = svg.append("g");
    /*.attr("class", "key")
    .attr("transform", "translate(0,40)");*/

	

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
		 
		 
		// make legend 
		 var legend = svg.append("g")
		     .attr("transform", "translate ("+(width - margin.left)+","+margin.top+")")
		     .attr("class", "legend");
		     
		 legend.selectAll("text")
		     .data(title)
		     .enter().append("text")
		     .attr("class", "legend-title")
		     .attr("y", function(d, i) { return (i+1)*lineheight-2; })
		     .text(function(d){ return d; })

		 var ranges = color.range().length;
		     
		 // make legend box 
		 var lb = legend.append("rect")
		     .attr("transform", "translate (0,"+titleheight+")")
		     .attr("class", "legend-box")
		     .attr("width", (boxwidth+5))
		     .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

		 // make quantized key legend items
		 var li = legend.append("g")
		     .attr("transform", "translate (8,"+(titleheight+boxmargin)+")")
		     .attr("class", "legend-items");

		 li.selectAll("rect")
		     .data(color.range().map(function(c) {
		       var d = color.invertExtent(c);
		       if (d[0] == null) d[0] = x.domain()[0];
		       if (d[1] == null) d[1] = x.domain()[1];
		       return d;
		     }))
		     .enter().append("rect")
		     .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
		     .attr("width", keywidth)
		     .attr("height", keyheight)
		     .style("fill", function(d) { return color(d[0]); });
		     
		 li.selectAll("text")
		     .data(priceList)
		     .enter().append("text")
		     .attr("x", 48)
		     .attr("y", function(d, i) { return (i+1)*lineheight-2; })
		     .text(function(d, i) {
		    	 if(i < priceList.length-1){
		    		 legendTxt = d + '-' + priceList[i+1];
		    		 return legendTxt;
		    	 }
		     });
		 
		 
		 //console.log(states);
		 
		 stateGroup.append("g")
		 .attr("id", "states")
		 .selectAll("path")
		 .data(states.features)
		 .enter().append("path")
		 .attr("d", path)
		 //.on("click", clicked)
		 .style("fill", function(d, i) { 
			 //console.log(color(floorAvgPrice(stateCode[d.properties.code])), floorAvgPrice(stateCode[d.properties.code]));
			 return color(floorAvgPrice(stateCode[d.properties.code])); 
		  }).on("mousemove", function(d){
	        	 tooltip
		         .html('XPO Transportation Cost : ' + stateCode[d.properties.code].toFixed(2))
		         .style("left", (d3.event.pageX - 34) + "px")
		         .style("top", (d3.event.pageY - 12) + "px")
	        	 .style("display", "inline-block");
	         })
	         .on("mouseout", function(d){
	        	 tooltip.style("display", "none");
	        });
		 
		 
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
	
	$scope.exportPNG = function(){
		var svgString = getSVGString(svg.node());
		svgString2Image( svgString, 2*width, 2*height, 'png', save ); // passes Blob and filesize String to the callback

		function save( dataBlob, filesize ){
			saveAs( dataBlob, 'State-wiseTransportationCost.png' ); // FileSaver.js function
		}
	};

	// Below are the functions that handle actual exporting:
	// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
	function getSVGString( svgNode ) {
		svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
		var cssStyleText = getCSSStyles( svgNode );
		appendCSS( cssStyleText, svgNode );

		var serializer = new XMLSerializer();
		var svgString = serializer.serializeToString(svgNode);
		svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
		svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

		return svgString;

		function getCSSStyles( parentElement ) {
			var selectorTextArr = [];

			// Add Parent element Id and Classes to the list
			selectorTextArr.push( '#'+parentElement.id );
			for (var c = 0; c < parentElement.classList.length; c++)
					if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
						selectorTextArr.push( '.'+parentElement.classList[c] );

			// Add Children element Ids and Classes to the list
			var nodes = parentElement.getElementsByTagName("*");
			for (var i = 0; i < nodes.length; i++) {
				var id = nodes[i].id;
				if ( !contains('#'+id, selectorTextArr) )
					selectorTextArr.push( '#'+id );

				var classes = nodes[i].classList;
				for (var c = 0; c < classes.length; c++)
					if ( !contains('.'+classes[c], selectorTextArr) )
						selectorTextArr.push( '.'+classes[c] );
			}

			// Extract CSS Rules
			var extractedCSSText = "";
			for (var i = 0; i < document.styleSheets.length; i++) {
				var s = document.styleSheets[i];
				
				try {
				    if(!s.cssRules) continue;
				} catch( e ) {
			    		if(e.name !== 'SecurityError') throw e; // for Firefox
			    		continue;
			    	}

				var cssRules = s.cssRules;
				for (var r = 0; r < cssRules.length; r++) {
					if ( contains( cssRules[r].selectorText, selectorTextArr ) )
						extractedCSSText += cssRules[r].cssText;
				}
			}
			

			return extractedCSSText;

			function contains(str,arr) {
				return arr.indexOf( str ) === -1 ? false : true;
			}

		}

		function appendCSS( cssText, element ) {
			var styleElement = document.createElement("style");
			styleElement.setAttribute("type","text/css"); 
			styleElement.innerHTML = cssText;
			var refNode = element.hasChildNodes() ? element.children[0] : null;
			element.insertBefore( styleElement, refNode );
		}
	}


	function svgString2Image( svgString, width, height, format, callback ) {
		var format = format ? format : 'png';

		var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");

		canvas.width = width;
		canvas.height = height;

		var image = new Image();
		image.onload = function() {
			context.clearRect ( 0, 0, width, height );
			context.drawImage(image, 0, 0, width, height);

			canvas.toBlob( function(blob) {
				var filesize = Math.round( blob.length/1024 ) + ' KB';
				if ( callback ) callback( blob, filesize );
			});

			
		};

		image.src = imgsrc;
	}
	
	
}]);