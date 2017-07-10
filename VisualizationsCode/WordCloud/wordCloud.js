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
            // .fontSize(function(d) { if(d.size<150){return d.size}else{return 150}; })
            .fontSize(function(d) { return (Math.max(Math.min(d.size/100, 150), 20));})
            // .fontSize(function(d) { return 20;})
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
            
            // ### Previous color scale
            // var colorScale = d3.scale.linear()
                             // .domain([100,80])
                             // .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", 
                                     // "#555", "#444", "#333", "#222"]);
            // ### rff2 color scale
            var min_gray_intensity = 200;
            var max_gray_intensity = 255;
            var lowest_word_frequency  = Math.min.apply(Math,words.map(function(d){return d.size;}));
            var highest_word_frequency = Math.max.apply(Math,words.map(function(d){return d.size;}));
            var colorScale = d3.scale.linear()
                             .domain([lowest_word_frequency, highest_word_frequency])
                             .range([d3.rgb(min_gray_intensity, min_gray_intensity, min_gray_intensity), d3.rgb(255, 174, 0)]);
                             // .range([d3.rgb(min_gray_intensity, min_gray_intensity, min_gray_intensity), d3.rgb(max_gray_intensity, max_gray_intensity, max_gray_intensity)]);
            
            // ### rff2 size scale
            var min_font_size = 20;
            var max_font_size = 150;
            var sizeScale = d3.scale.linear()
                             .domain([lowest_word_frequency, highest_word_frequency])
                             .range([min_font_size, max_font_size]);
            
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
                .style("font-size", function(d) { return sizeScale(d.size) + "px"; })
                .transition().duration(750)
                .style("fill", function(d, i) { return colorScale(d.size); })
                //.transition().duration(750)
                //.onmouseover("mouseover", function(d) {d3.select(this).style("fill", "lightblue");})
                //.on("mouseout", function(d) {d3.select(this).style("fill", colorScale(d.size));})
                .text(function(d) { return d.text; })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                ;

    }
}