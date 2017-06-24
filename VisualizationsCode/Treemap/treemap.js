class Treemap {
	constructor() {
		this.defaults = {
		    margin: {top: 24, right: 0, bottom: 0, left: 0},
		    rootname: "TOP",
		    format: ",d",
		    title: "",
		    width: 1500,
		    height: 720
		};

		// this.margin = 200;
		// debugger;
		// this.svgWordCloud = d3.select("#svgMainID").select(".depth").select("g").append("svg")
		// 		    		.attr("transform", "translate("+this.margin+","+this.margin+")")
		// 		            .attr("width",  this.defaults.width   - 2*this.margin)
		// 		            .attr("height", this.defaults.height  - 2*this.margin)
		// 		            .attr("class", "wordcloud");

		this.createTreemap();		
	}

	createTreemap(){
		var that = this;
		d3.json("treemappreprocessado.json", function(err, res) {
	        if (!err) {
	            console.log(res);
	            var data = d3.nest().key(function(d) {
	                return d.region;
	            }).key(function(d) {
	                return d.subregion;
	            }).entries(res);
	            that.main({
	                title: "Reddit Population"
	            }, {
	                key: "Comments",
	                values: data
	            });
	        }
	    });
	}

	main(o, data) {
		var _this = this;
	    var root,
	        opts = $.extend(true, {}, this.defaults, o),
	        formatNumber = d3.format(opts.format),
	        rname = opts.rootname,
	        margin = opts.margin,
	        theight = 36 + 16;
	    var chart = d3.select('body').append('div').attr("id", "chart");

	    $('#chart').width(opts.width).height(opts.height);
	    var width = opts.width - margin.left - margin.right,
	        height = opts.height - margin.top - margin.bottom - theight,
	        transitioning;

	    var color = d3.scale.category20c();

	    var x = d3.scale.linear()
	        .domain([0, width])
	        .range([0, width]);

	    var y = d3.scale.linear()
	        .domain([0, height])
	        .range([0, height]);

	    var treemap = d3.layout.treemap()
	        .children(function(d, depth) {
	            return depth ? null : d._children;
	        })
	        .sort(function(a, b) {
	            return a.value - b.value;
	        })
	        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
	        .round(false);

	    var svg = d3.select("#chart").append("svg")
	    	.attr("id", "svgMainID")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.bottom + margin.top)
	        .style("margin-left", -margin.left + "px")
	        .style("margin.right", -margin.right + "px")
	        .append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	        .style("shape-rendering", "crispEdges");

	    var grandparent = svg.append("g")
	        .attr("class", "grandparent");

	    grandparent.append("rect")
	        .attr("y", -margin.top)
	        .attr("width", width)
	        .attr("height", margin.top);

	    grandparent.append("text")
	        .attr("x", 6)
	        .attr("y", 6 - margin.top)
	        .attr("dy", ".75em");

	    if (opts.title) {
	        $("#chart").prepend("<p class='title'>" + opts.title + "</p>");
	    }
	    if (data instanceof Array) {
	        root = {
	            key: rname,
	            values: data
	        };
	    } else {
	        root = data;
	    }

	    initialize(root);
	    accumulate(root);
	    layout(root);
	    console.log(root);
	    display(root);

	    if (window.parent !== window) {
	        var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
	        window.parent.postMessage({
	            height: myheight
	        }, '*');
	    }

	    function initialize(root) {
	        root.x = root.y = 0;
	        root.dx = width;
	        root.dy = height;
	        root.depth = 0;
	    }

	    // Aggregate the values for internal nodes. This is normally done by the
	    // treemap layout, but not here because of our custom implementation.
	    // We also take a snapshot of the original children (_children) to avoid
	    // the children being overwritten when when layout is computed.
	    function accumulate(d) {
	        return (d._children = d.values) ?
	            d.value = d.values.reduce(function(p, v) {
	                return p + accumulate(v);
	            }, 0) :
	            d.value;
	    }

	    // Compute the treemap layout recursively such that each group of siblings
	    // uses the same size (1×1) rather than the dimensions of the parent cell.
	    // This optimizes the layout for the current zoom state. Note that a wrapper
	    // object is created for the parent node for each group of siblings so that
	    // the parent’s dimensions are not discarded as we recurse. Since each group
	    // of sibling was laid out in 1×1, we must rescale to fit using absolute
	    // coordinates. This lets us use a viewport to zoom.
	    function layout(d) {
	        if (d._children) {
	            treemap.nodes({
	                _children: d._children
	            });
	            d._children.forEach(function(c) {
	                c.x = d.x + c.x * d.dx;
	                c.y = d.y + c.y * d.dy;
	                c.dx *= d.dx;
	                c.dy *= d.dy;
	                c.parent = d;
	                layout(c);
	            });
	        }
	    }

	    function display(d) {
	        grandparent
	            .datum(d.parent)
	            .on("click", transition)
	            .select("text")
	            .text(name(d));

	        var g1 = svg.insert("g", ".grandparent")
	            .datum(d)
	            .attr("class", "depth");

	        var g = g1.selectAll("g")
	            .data(d._children)
	            .enter().append("g");

	        g.filter(function(d) {
	                return d._children;
	            })
	            .classed("children", true)
	            .on("click", transition);

	        var children = g.selectAll(".child")
	            .data(function(d) {
	                return d._children || [d];
	            })
	            .enter().append("g");

	        children.append("rect")
	            .attr("class", "child")
	            .call(rect)
	            .append("title")
	            .text(function(d) {
	                return d.key + " (" + formatNumber(d.value) + ")";
	            });
	        children.append("text")
	            .attr("class", "ctext")
	            .text(function(d) {
	                return d.key;
	            })
	            .call(text2);

	        g.append("rect")
	            .attr("class", "parent")
	            .call(rect);

	        var t = g.append("text")
	            .attr("class", "ptext")
	            .attr("dy", ".75em")

	        t.append("tspan")
	            .text(function(d) {
	                return d.key;
	            });
	        t.append("tspan")
	            .attr("dy", "1.0em")
	            .text(function(d) {
	                return formatNumber(d.value);
	            });
	        t.call(text);

	        g.selectAll("rect")
	            .style("fill", function(d) {
	                return d3.rgb(color(d.key));//.brighter(0.4);
	            });

	        function transition(d) {

	        	if(d && d.values.length == 1){
					var margin_x = 40;
					var margin_y = 150;

					var pad_x = 550;
					var pad_y = 340;
					
					var wordCloud_w = _this.defaults.width   - margin_x;
					var wordCloud_h = _this.defaults.height  - margin_y;
					//d3.selectAll(".child").style("fill", "white");

					// uma coisa de cada vez
					var frequency_list = [{"text":"study","size":40},{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"relation","size":5},{"text":"things","size":10},{"text":"asd","size":60},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"relation","size":5},{"text":"things","size":10},{"text":"asd","size":60},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"relation","size":5},{"text":"things","size":10},{"text":"asd","size":60},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"relation","size":5},{"text":"things","size":10},{"text":"asd","size":60},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":150},{"text":"relation","size":5},{"text":"things","size":190},{"text":"asd","size":530},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"relation","size":5},{"text":"things","size":10},{"text":"asd","size":640},{"text":"ggg","size":90},{"text":"jujubas","size":440},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":10},{"text":"Jenipapo","size":480},{"text":"things","size":10},{"text":"4323","size":60},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":140},{"text":"relation","size":5},{"text":"things","size":140},{"text":"asd","size":130},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}
					,{"text":"motion","size":15},{"text":"forces","size":10},{"text":"electricity","size":15},{"text":"movement","size":120},{"text":"relation","size":5},{"text":"things","size":170},{"text":"asd","size":640},{"text":"ggg","size":50},{"text":"jujubas","size":70},{"text":"Galinaceo","size":90}];
				    var svgWordCloud = d3.select("svg").append("svg")
				    		.attr("class", "JUJUBAS")
						    .append("g")
			                // without the transform, words words would get cutoff to the left and top, they would
			                // appear outside of the SVG area
			                .attr("transform", "translate("+pad_x+","+pad_y+")")
				    		//.attr("transform", "translate("+ (0) +","+margin+")")
				            .attr("width",  wordCloud_w)
				            .attr("height", wordCloud_h);
				            
				    var myWordCloud = new WordCloud(wordCloud_w, wordCloud_h, frequency_list, null);
				} else {
					d3.select(".JUJUBAS").remove();
				}

	            if (transitioning || !d) return;
	            transitioning = true;

	            var g2 = display(d),
	                t1 = g1.transition().duration(750),
	                t2 = g2.transition().duration(750);

	            // Update the domain only after entering new elements.
	            x.domain([d.x, d.x + d.dx]);
	            y.domain([d.y, d.y + d.dy]);

	            // Enable anti-aliasing during the transition.
	            svg.style("shape-rendering", null);

	            // Draw child nodes on top of parent nodes.
	            svg.selectAll(".depth").sort(function(a, b) {
	                return a.depth - b.depth;
	            });

	            // Fade-in entering text.
	            g2.selectAll("text").style("fill-opacity", 0);

	            // Transition to the new view.
	            t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
	            t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
	            t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
	            t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
	            t1.selectAll("rect").call(rect);
	            t2.selectAll("rect").call(rect);

	            // Remove the old node when the transition is finished.
	            t1.remove().each("end", function() {
	                svg.style("shape-rendering", "crispEdges");
	                transitioning = false;
	            });
	        }

	        return g;
	    }

	    function text(text) {
	        text.selectAll("tspan")
	            .attr("x", function(d) {
	                return x(d.x) + 6;
	            })
	        text.attr("x", function(d) {
	                return x(d.x) + 6;
	            })
	            .attr("y", function(d) {
	                return y(d.y) + 6;
	            })
	            .style("opacity", function(d) {
	                return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
	            });
	    }

	    function text2(text) {
	        text.attr("x", function(d) {
	                return x(d.x + d.dx) - this.getComputedTextLength() - 6;
	            })
	            .attr("y", function(d) {
	                return y(d.y + d.dy) - 6;
	            })
	            .style("opacity", function(d) {
	                return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
	            });
	    }

	    function rect(rect) {
	        rect.attr("x", function(d) {
	                return x(d.x);
	            })
	            .attr("y", function(d) {
	                return y(d.y);
	            })
	            .attr("width", function(d) {
	                return x(d.x + d.dx) - x(d.x);
	            })
	            .attr("height", function(d) {
	                return y(d.y + d.dy) - y(d.y);
	            });
	    }

	    function name(d) {
	        return d.parent ?
	            name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")" :
	            d.key + " (" + formatNumber(d.value) + ")";
	    }
	}

}