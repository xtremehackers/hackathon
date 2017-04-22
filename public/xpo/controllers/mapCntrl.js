app.controller("MapCntrl", ["$scope", function($scope){
	var width = 1000,
	height = 600,
	centered;

	var projection = d3.geo.albersUsa()
	.scale(1070)
	.translate([width / 2, height / 2]);

	var path = d3.geo.path()
	.projection(projection);

	var graticule = d3.geo.graticule();

	var svg = d3.select("#maps").append("svg")
	.attr("width", width)
	.attr("height", height);

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
	var imageGroup = g.append('g');
	var pointGroup = g.append('g');

//	Also, text needs to be added to the `g` group
	var point = pointGroup.append("g")
	.attr("class", "points")
	.selectAll("g")
	.data(d3.entries(places))
	.enter().append("g")
	.attr("transform", function(d) { return "translate(" + projection(d.value) + ")"; });

	point.append("text")
	.attr("y", 5)
	.attr("dx", "1em")
	.text(function(d) { return d.key; });

	d3.json("xpo/controllers/us.json", function(error, us) {
		// draw states
		stateGroup.append("g")
		.attr("id", "states")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.states).features)
		.enter().append("path")
		.attr("d", path)
		.on("click", clicked);

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

	});

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