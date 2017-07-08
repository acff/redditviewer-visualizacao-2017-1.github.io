class Histogram {
	constructor(container, xInfo, file, subreddit, id) {
		this.margin =  {top: 20, right: 40, bottom: 20, left: 40};
        this.width = 600 - this.margin.left - this.margin.right;
        this.height = 300 - this.margin.top - this.margin.bottom ;

        this.xscale = d3.scaleBand()
                .domain(xInfo) //['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                .rangeRound([0, this.width]);
        this.yscale = d3.scaleLinear();

        this.xAxis  = d3.axisBottom().scale(this.xscale);
        this.yAxis  = d3.axisLeft().scale(this.yscale);

        this.svg = container.append("svg")//d3.select("#diagram").append("svg")
                    .attr("width", this.width + this.margin.left + this.margin.right)
                    .attr("height", this.height + this.margin.top + this.margin.bottom );

        this.diagram = this.svg.append("g")
                    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.csv = file;
        this.subreddit = subreddit;
        this.data = [];
        this.idd = id;
	}

	buildHistogram(){
		var that = this;
		d3.csv(this.csv, function (data) {

			var result = that.getData(that.subreddit, data);

			that.data = data;

			that.yscale.domain([0, d3.max(result, function (d) { return d.value; })])
                .range([that.height, 0]);

	        that.diagram.append("g")
                .attr("class", "xAxis"+that.idd)
                .attr("transform", "translate(0, " + that.height + ")")
                .call(that.xAxis);

	        that.diagram.append("g")
	                .attr("class", "yAxis"+that.idd)
	                .call(that.yAxis);

	        var bars = that.diagram.append("g").attr('class', that.idd);

	        bars.selectAll("rect")
	            .data(result, function (d) {return d.label; })
	            .enter().append("rect")
	            .attr("class", "bar")
	            .attr("x", function (d) { return that.xscale(d.label); })
	            .attr("y", function (d) { return that.yscale(d.value); })
	            .attr("width", that.xscale.bandwidth())
	            .attr("height", function (d) { return that.height - that.yscale(d.value); });    
		});
	}

	updateHistogram(subreddit) {
		var that = this;
		var idReal ='.'+this.idd;
		var result = this.getData(subreddit, this.data);
	    var bars = d3.select(idReal).selectAll('rect').data(result);
	    /*
	    console.log(this.idd + "  --------------------------------------------------------");
		result.forEach(function(d){
			console.log(d);
		});*/

		//Update scale
		this.yscale.domain([0, d3.max(result, function (d) { return d.value; })])
                .range([this.height, 0]);
	    d3.select(".yAxis" + this.idd).call(d3.axisLeft(this.yscale));

	    //Update bars
	    bars.remove();
        d3.select(idReal).selectAll("rect")
            .data(result, function (d) {return d.label; })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return that.xscale(d.label); })
            .attr("y", function (d) { return that.yscale(d.value); })
            .attr("width", that.xscale.bandwidth())
            .transition().duration(750)
            .attr("height", function (d) { return that.height - that.yscale(d.value); });   
	}

	getData(subreddit, data){
		var result = [];
		data.forEach( function (d) {
		    if(d.sub ===subreddit){
		        d.value = parseInt(d.value);
		        result.push(d);
		    }
		});
		
		return result;
	}

}