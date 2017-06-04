class ForceDirectedGraph {
	constructor(width, height, container, jsonFile){
		this.width = width;
		this.height = height;
		this.jsonFile = jsonFile;
		this.container = container.append("svg")
			.attr("width", this.width)
			.attr("height", this.height);

		this.color = d3.scaleOrdinal(d3.schemeCategory20);

		this.simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(90))
		    .force("charge", d3.forceManyBody())
		    .force("center", d3.forceCenter(this.width / 2, this.height / 2));
	}

	buildFDG(){
		var that = this;

		d3.json(this.jsonFile, function(error, graph) {
			if (error) throw error;

			var link = that.container.append("g")
			  .attr("class", "links")
			  .selectAll("line")
			  .data(graph.links)
			  .enter().append("line")
			  .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

			var node = that.container.append("g")
			  .attr("class", "nodes")
			  .selectAll(".nodes")
			  .data(graph.nodes)
			  .enter().append("g")
			  .call(d3.drag()
			      .on("start", function(d){
			      		if (!d3.event.active) that.simulation.alphaTarget(0.3).restart();
						  d.fx = d.x;
						  d.fy = d.y;
			      })
			      .on("drag", function(d){
			      	 	d.fx = d3.event.x;
	  					d.fy = d3.event.y;
			      })
			      .on("end", function(d){
						if (!d3.event.active) that.simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
			      }));

			node.append("circle")
			 .attr("r", 8)
			 .attr("fill", function(d) { return that.color(d.group); });

			node.append("title")
			  .text(function(d) { return d.id; });

			node.append("text")
			    .text(function(d) { return d.id; });

			that.simulation
			  .nodes(graph.nodes)
			  .on("tick", ticked);

			that.simulation.force("link")
			  .links(graph.links);

			function ticked() {
				link
				    .attr("x1", function(d) { return d.source.x; })
				    .attr("y1", function(d) { return d.source.y; })
				    .attr("x2", function(d) { return d.target.x; })
				    .attr("y2", function(d) { return d.target.y; });

				node.selectAll("circle")
				    .attr("cx", function(d) { return d.x; })
				    .attr("cy", function(d) { return d.y; });

				d3.selectAll("text")
					.attr("x", function(d) { return d.x + 10; })
				    .attr("y", function(d) { return d.y; });
			}
		});	
	}	
}