class WordCloud{
	constructor(width, height, frequency_list, container){
		this.height = height;
		this.width = width;
		this.frequency_list = frequency_list;
		this.wordCloudGroup = container;
		this.colorScale = d3.scale.linear()
			            .domain([0,1,2,3,4,5,6,10,15,20,100])
			            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", 
			            	"#555", "#444", "#333", "#222"]);
        var that = this;
		d3.layout.cloud()
    		.size([this.width*0.90, this.height*0.90])
            .words(frequency_list)
            .rotate(0)
            .fontSize(function(d) { if(d.size<150){return d.size}else{return 150}; })
            .on("end", this.draw)
            .start();
	}	
    
    draw(words) {
       /* debugger
		d3.select("svg").append("g").attr("transform", "translate( "+0 +","+300 +")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("fill", function(d, i) { return "black"; })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });*/
            var colorScale = d3.scale.linear()
                             .domain([100,80])
                             .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", 
                                     "#555", "#444", "#333", "#222"]);

            d3.select(".JUJUBAS").select("g")
                //.attr("width", 850)
                //.attr("height", 350)
                //.attr("class", "wordcloud")
                // .append("g")
                // // without the transform, words words would get cutoff to the left and top, they would
                // // appear outside of the SVG area
                // .attr("transform", "translate(550,460)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .transition().duration(750)
                .style("fill", function(d, i) { return colorScale(d.size); })
                //.transition().duration(750)
                .text(function(d) { return d.text; })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                ;

    }
}