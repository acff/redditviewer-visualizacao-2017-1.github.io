class EdgeBundle {
	constructor(width, height, container, jsonFile){
		this.width = width;
		this.height = height;
		this.jsonFile = jsonFile;
		//this.container = container.append("svg")
		//	.attr("width", this.width)
		//	.attr("height", this.height);
		this.minThresh = 0;
		this.maxThresh = 100;
		
		// Edge bundle properties
		this.diameter = Math.min(width, height);
		this.radius = this.diameter / 2,
		this.innerRadius = this.radius - 120;

		this.cluster = d3.cluster()
			.size([360, this.innerRadius]);

		this.color = d3.scaleOrdinal(d3.schemeCategory20);
			
		this.line = d3.radialLine()
			.curve(d3.curveBundle.beta(0.85))
			.radius(function(d) { return d.y; })
			.angle(function(d) { return d.x / 180 * Math.PI; });
			
		this.svg = container.append("svg")
			.attr("width", this.diameter - 50)
			.attr("height", this.diameter)
			.append("g")
			.attr("transform", "translate(" + this.radius + "," + this.radius + ")");

		this.graph = null;
		//this.link = this.svg.append("g")
		//	.attr("class", "linkGroup")
		//	.selectAll(".link");
		//this.node = this.svg.append("g")
		//	.attr("class", "nodeGroup")
		//	.selectAll(".node");
	}

	buildEdgeBundle(minThreshold, maxThreshold){
		var that = this;

		if(that.graph == null) {
			d3.json(this.jsonFile, function(error, data) {
				if (error) throw error;
				that.graph = data;
				that.BotaPraTorar(minThreshold, maxThreshold);
			});

		}
		else {
			that.BotaPraTorar(minThreshold, maxThreshold);
		}

			
		//});		
	}
	
	BotaPraTorar(minThreshold, maxThreshold){
		//minThreshold+= 0.035;
		// debugger
		this.link = this.svg.append("g")
			.attr("class", "linkGroup")
			.selectAll(".link");
		this.node = this.svg.append("g")
			.attr("class", "nodeGroup")
			.selectAll(".node");
		var that = this;
		// debugger
		var toggle = 0;

		var linkedByIndex = {};

		var min_link_value = Math.min.apply(Math,that.graph.links.map(function(d){return d.value;}));
		var max_link_value = Math.max.apply(Math,that.graph.links.map(function(d){return d.value;}));

		var thresholded_links = that.graph.links.filter(function (d) {
			var normalized_value = (d.value - min_link_value) / max_link_value;
			return normalized_value > minThreshold && normalized_value <= maxThreshold;
		});
		
		var classes = [];
		
		that.graph.nodes.forEach(function (node) {
			var imports_value = [];
			var connected_links = thresholded_links.filter(function (link) {return link.source == node.id});
			connected_links.forEach(function (con_link) {
				var con_link_group_name = that.graph.nodes.filter(function (d) {return d.id == con_link.target})[0].group;
				imports_value.push(con_link_group_name+"."+con_link.target);
			})
		    classes.push({name: node.group+"."+node.id, size: 42, imports:imports_value, group: node.group});
		});
		
		// Begins the joy
		var root = that.packageHierarchy(classes)
		.sum(function(d) { return d.size; });
		that.cluster(root);

		that.link = that.link
		.data(that.packageImports(root.leaves()))
		.enter().append("path")
		  .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
		  .attr("class", "link")
		  .attr("d", that.line);

		that.node = that.node
		.data(root.leaves())
		.enter().append("text")
		  .attr("class", "node")
		  .attr("fill", function(d) {
				return that.color(d.data.group);
			})
		  .attr("dy", "0.31em")
		  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
		  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		  .text(function(d) { return d.data.key; })
		  .on("mouseover", function(d){
			  that.node
				  .each(function(n) { n.target = n.source = false; });

				that.link
				  .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
				  .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
				.filter(function(l) { return l.target === d || l.source === d; })
				  .raise();

				that.node
				  .classed("node--target", function(n) { return n.target; })
				  .classed("node--source", function(n) { return n.source; });
				  dispatchFunc(that, d.data.key);
		  })
		  .on("mouseout", function(d){
				that.link
				  .classed("link--target", false)
				  .classed("link--source", false);

				that.node
				  .classed("node--target", false)
				  .classed("node--source", false);
		  })
		  ;
		  
		function dispatchFunc(widge, subreddit){
				widge.dispatch.call("selectionChanged", {objects:subreddit});
			}
	}

	// mouseovered(d) {
		// this.node
		  // .each(function(n) { n.target = n.source = false; });

		// this.link
		  // .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
		  // .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
		// .filter(function(l) { return l.target === d || l.source === d; })
		  // .raise();

		// this.node
		  // .classed("node--target", function(n) { return n.target; })
		  // .classed("node--source", function(n) { return n.source; });
	// }

	// mouseouted(d) {
		// this.link
		  // .classed("link--target", false)
		  // .classed("link--source", false);

		// this.node
		  // .classed("node--target", false)
		  // .classed("node--source", false);
	// }

	// Lazily construct the package hierarchy from class names.
	packageHierarchy(classes) {
	  var map = {};

	  function find(name, data) {
		var node = map[name], i;
		if (!node) {
		  node = map[name] = data || {name: name, children: []};
		  if (name.length) {
			node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
			node.parent.children.push(node);
			node.key = name.substring(i + 1);
		  }
		}
		return node;
	  }

	  classes.forEach(function(d) {
		find(d.name, d);
	  });

	  return d3.hierarchy(map[""]);
	}

	// Return a list of imports for the given array of nodes.
	packageImports(nodes) {
		var map = {},
		  imports = [];

		// Compute a map from name to node.
		nodes.forEach(function(d) {
		map[d.data.name] = d;
		});

		// For each import, construct a link from the source to target node.
		nodes.forEach(function(d) {
			if (d.data.imports) d.data.imports.forEach(function(i) {
			  imports.push(map[d.data.name].path(map[i]));
			});
		});
		
		return imports;
	}
	
	//---Insert-------
  updateThreshold(min_threshold, max_threshold) {
    var that = this;
    that.minThresh = min_threshold;
    that.maxThresh = max_threshold;
    d3.selectAll(".nodeGroup").remove();
		d3.selectAll(".linkGroup").remove();
		that.buildEdgeBundle(that.minThresh/100.0, that.maxThresh/100.0);
  }
  
}