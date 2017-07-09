class ForceDirectedGraph {
	constructor(width, height, container, jsonFile){
		this.width = width;
		this.height = height;
		this.jsonFile = jsonFile;
		this.container = container.append("svg")
			.attr("class", "FDL_SVG")
			.attr("width", this.width)
			.attr("height", this.height);

		this.color = d3.scaleOrdinal(d3.schemeCategory20);
		this.color_edges = d3.scaleLinear();

     	// .gravity(0.05)
		// .distance(100)
		// .charge(-100)
		// .size([width, height]);
		
		this.simulation = d3.forceSimulation()
		    .force("link", d3.forceLink()
					.id(function(d) { return d.id; })
					//.strength(d3.forceManyBody())
					//.strength(0.1)
					
								
					.distance(100)
				   )
			//.force("gravity", 0.05)
		    .force("charge", d3.forceManyBody()
								.strength(-1000)
								//.distanceMin(100)
								//.distanceMax(1000)
								)
		    .force("center", d3.forceCenter(this.width / 2, this.height / 2))
			.force("x", d3.forceX())
			.force("y", d3.forceY())
			.alpha(0.5)
			.velocityDecay(0.5);
		
		this.minThresh = 0;
		this.maxThresh = 100;
	
	}

	buildFDG(minThreshold, maxThreshold){
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
			
			var min_link_value = Math.min.apply(Math,graph.links.map(function(d){return d.value;}));
			var max_link_value = Math.max.apply(Math,graph.links.map(function(d){return d.value;}));

			var thresholded_links = graph.links.filter(function (d) {
				var normalized_value = (d.value - min_link_value) / max_link_value;
				return normalized_value >= minThreshold && normalized_value <= maxThreshold;
			});
			
			//debugger;			
			var link = that.container.append("g")
			  .attr("class", "links")
			  .selectAll(".line")
			  //.data(graph.links)
			  .data(thresholded_links)
			  .enter().append("line")
			  .attr('stroke', function(d) {
								var normalized_value = (d.value - min_link_value) / max_link_value; 
								var color_intensity = 210 - normalized_value*255;
								return d3.rgb(color_intensity, color_intensity, color_intensity); 
							  })
			  .attr("stroke-width", function(d) {
										var normalized_value = (d.value - min_link_value) / max_link_value; 
										var maximum_width = 6;
										var size = 1+ normalized_value*maximum_width;
										return size; 
										})
			  .attr("stroke-opacity", function(d) { return ((d.value - min_link_value) / max_link_value);});
			
			var node = that.container.append("g")
				  .attr("class", "nodes")
				  .selectAll(".node")
				  .data(graph.nodes)
				  .enter().append("g").attr("class", "node")
				  .call(d3.drag()
					  .on("start", function(d){
							if (!d3.event.active) that.simulation.alphaTarget(0.3).restart();
							  d.fx = d.x;
							  d.fy = d.y;
							  
							// #CHANGE EXIBITION# Reduce the opacity of all but the neighbouring nodes
							var d = d3.select(this).node().__data__;
							node.style("fill-opacity", function (o) {
								return neighboring(d, o)>0| neighboring(o, d)>0 ? 1 : 0.1;
							});
							link.style("opacity", function (o) {
								return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
							});
					  })
					  .on("drag", function(d){
							d.fx = d3.event.x;
							d.fy = d3.event.y;
					  })
					  .on("end", function(d){
							if (!d3.event.active) that.simulation.alphaTarget(0);
							d.fx = null;
							d.fy = null;
							
							// #CHANGE EXIBITION# Put them back to opacity=1
							node.style("fill-opacity", 1);
							link.style("opacity", 1);
							
							dispatchFunc(that, d);
					  }))
				  .on("mouseover", function(d){
					  // debugger
						//tooltip.transition()
						//.duration(500)
						//.style("opacity", 0);
						//d3.select(this).style("stroke", "#000");
						//d3.select(this).style("stroke-width", '1.5px');
						d3.select(this).select("circle").attr("r", 12);
						d3.select(this).select("text").style("font", "18px Georgia");
						d3.select(this).select("text").attr("fill", "black");
						d3.select(this).select("text").style("stroke", "white");
						d3.select(this).select("text").style("stroke-width", 0.3);
						d3.select(this).select("text").style("font-weight", 800);
					  })
				  .on("mouseout", function(d){
						//d3.select(this).style("stroke", "#000");
						//d3.select(this).style("stroke-width", '1.5px');
						d3.select(this).select("circle").attr("r", 8);
						d3.select(this).select("text").style("font", "13px Georgia");
						d3.select(this).select("text").attr("fill", "black");
						d3.select(this).select("text").style("stroke", "white");
						d3.select(this).select("text").style("stroke-width", 0.3);
						d3.select(this).select("text").style("font-weight", 800);
					  }) 
				  // .on("mouseover", function(d){
						// dispatchFunc(that, d);
					  // })
				  //.on("mouseout", upConnectedNodes); 
				  // .on("dblclick", connectedNodes)
				  ; 

				node.append("circle")
				 .attr("r", 8)
				 .attr("fill", function(d) { return that.color(d.group); });

				node.append("title")
				  .text(function(d) { return d.group; });

				node.append("text")
					.style("font", "13px Georgia")
					.text(function(d) { return d.id; });

				that.nodes = node;	
			
			that.simulation
			  .nodes(graph.nodes)
			  .on("tick", ticked);

			that.simulation.force("link")
			  .links(graph.links);
			  
		    that.simulation
			  .alpha(0.5)
			  .velocityDecay(0.5)
			  .restart();
				
			// that.simulation.force("link", d3.forceLink()
					// .id(function(d) { return d.id; })
					// .strength(function(d) { 
							// var normalized_value = (d.value - min_link_value) / max_link_value; 
							// var value = normalized_value*1000;
							// return -value;
						// }))
			  
			function dragstarted(d) {
			  if (!d3.event.active) that.simulation.alphaTarget(0.3).restart();
			  d.fx = d.x;
			  d.fy = d.y;
			}

			function dragged(d) {
			  d.fx = d3.event.x;
			  d.fy = d3.event.y;
			}
			  
			function ticked() {
				link
				    .attr("x1", function(d) { return d.source.x; })
				    .attr("y1", function(d) { return d.source.y; })
				    .attr("x2", function(d) { return d.target.x; })
				    .attr("y2", function(d) { return d.target.y; });

				node.selectAll("circle")
				    .attr("cx", function(d) { return d.x; })
				    .attr("cy", function(d) { return d.y; });

				d3.select(".FDL_SVG").selectAll("text")
					.attr("fill", "black")
					.style("stroke", "white")
					.style("stroke-width", 0.3)
					.style("font-weight", 800)
					.attr("x", function(d) { return d.x + 10; })
				    .attr("y", function(d) { return d.y; });
			}

			function neighboring(a, b) {
			    return linkedByIndex[a.id + "," + b.id];
			}
			
			function downConnectedNodes() {
				//Reduce the opacity of all but the neighbouring nodes
				var d = d3.select(this).node().__data__;
				node.style("fill-opacity", function (o) {
					return neighboring(d, o)>0| neighboring(o, d)>0 ? 1 : 0.1;
				});
				link.style("opacity", function (o) {
					return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
				});
			}
			
			function upConnectedNodes() {
				//Put them back to opacity=1
				node.style("fill-opacity", 1);
				link.style("opacity", 1);
			}

			// function connectedNodes() {
			    // if (toggle == 0) {
			        // // Reduce the opacity of all but the neighbouring nodes
			        // var d = d3.select(this).node().__data__;
			        // node.style("fill-opacity", function (o) {
			            // return neighboring(d, o)>0| neighboring(o, d)>0 ? 1 : 0.1;
			        // });
			        // link.style("opacity", function (o) {
			            // return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
			        // });
			        // // Reduce the op
			        // toggle = 1;
			    // } else {
			        // // Put them back to opacity=1
			        // node.style("fill-opacity", 1);
			        // link.style("opacity", 1);
			        // toggle = 0;
			    // }
			// }
			
			function dispatchFunc(widge, node){
				widge.dispatch.call("selectionChanged", {objects:node.id});
			}
		});	
	}
	
	//---Insert-------

	//adjust threshold
	minThreshold(thresh) {
		//debugger
		var that = this;
		that.minThresh = thresh;
		//debugger
		d3.selectAll(".nodes").remove();
		d3.selectAll(".links").remove();
		that.buildFDG(that.minThresh/100.0, that.maxThresh/100.0);
		//that.simulation.stop();
		that.simulation
		.alpha(0.5)
		.velocityDecay(0.5)
		.restart();
		//that.simulation.on();
		// that.simulation.tick();
	}
	
	maxThreshold(thresh) {
		var that = this;
		that.maxThresh = thresh;
		//debugger
		d3.selectAll(".nodes").remove();
		d3.selectAll(".links").remove();
		that.buildFDG(that.minThresh/100.0, that.maxThresh/100.0);
		that.simulation
		.alpha(0.5)
		.velocityDecay(0.5)
		.restart();
		//that.simulation.on();		
	}

}