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
		    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(350))
		    .force("charge", d3.forceManyBody())
		    .force("center", d3.forceCenter(this.width / 2, this.height / 2));
	}

	buildFDG(){
		var that = this;

		d3.json(this.jsonFile, function(error, graph) {
			if (error) throw error;

			var toggle = 0;

			var linkedByIndex = {};

			for (var i = 0; i < graph.nodes.length; i++) {
				var id = graph.nodes[i].id;
			    linkedByIndex[ id+ "," + id] = 1;
			};
			graph.links.forEach(function (d) {
			    linkedByIndex[d.source + "," + d.target] = d.value;
			});

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
			  .enter().append("g").attr("class", "node")
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
			      }))
			  .on("dblclick", connectedNodes); 

			node.append("circle")
			 .attr("r", 8)
			 .attr("fill", function(d) { return that.color(d.group); });

			node.append("title")
			  .text(function(d) { return d.group; });

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

			function neighboring(a, b) {
			    return linkedByIndex[a.id + "," + b.id];
			}

			function connectedNodes() {
			    if (toggle == 0) {
			        //Reduce the opacity of all but the neighbouring nodes
			        var d = d3.select(this).node().__data__;
			        node.style("fill-opacity", function (o) {
			            return neighboring(d, o)>0| neighboring(o, d)>0 ? 1 : 0.1;
			        });
			        link.style("opacity", function (o) {
			            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
			        });
			        //Reduce the op
			        toggle = 1;
			    } else {
			        //Put them back to opacity=1
			        node.style("fill-opacity", 1);
			        link.style("opacity", 1);
			        toggle = 0;
			    }
			}
		});	
	}	
}