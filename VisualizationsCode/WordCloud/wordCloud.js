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

		d3.layout.cloud()
    		.size([this.width-50, this.height-50])
            .words(frequency_list)
            .rotate(0)
            .fontSize(function(d) { return d.size; })
            .on("end", this.draw)
            .start();
	}	
    
    draw(words) {
    	var that = this;
		d3.select("svg").append("g").attr("transform", "translate(50, 50)")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("fill", function(d, i) { return "black"; })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
}