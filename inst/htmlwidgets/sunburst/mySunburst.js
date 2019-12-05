class chart {
	
	constructor(opts) {
		console.log(opts);
  	    this.element = opts.element;
	    this.data = opts.data;
	    this.options = opts.options;
		this.grouper = opts.grouper;
	    this.draw();
    }
	
	draw() {
		var that = this;
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		this.margin = this.options.margin;
		
		var color = d3.scaleOrdinal()
			.domain(this.options.names)
			.range(this.options.color);
		
		const width = this.width;
		
		console.log(this.grouper);
		
		this.element.innerHTML = '';
		this.svg = d3.select(this.element).append('svg')
			.attr('id', 'chart-' + this.element.id)
			.attr('class', this.grouper ? this.grouper : 'chart')
			.attr('class', 'mySIO-Chart')
		    .attr("viewBox", [0, 0, this.width, this.width])
			//.on('mouseover', mouseleave)
		    .style("font", "10px sans-serif");

		this.g = this.svg.append("g")
		    .attr("transform", `translate(${width / 2},${width / 2})`);
		
		this.sequence = d3.select(this.element).append('svg')
			.attr('id', 'sequence-' + this.element.id)
			.attr('height', this.height)
			.attr('class', 'mySIO-sequence');
		  
		this.updateChart(this.data);
		
	}
	
	updateChart(data){
		const that = this;
		
		this.totalSize = 0;
		
		var color = d3.scaleOrdinal()
			.domain(this.options.names)
			.range(this.options.color);
		
		const radius = this.width / 8;
		
		const arc = d3.arc()
			.startAngle(d => d.x0)
			.endAngle(d => d.x1)
			.padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
			.padRadius(radius * 1.5)
			.innerRadius(d => d.y0 * radius)
			.outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));
			
		var partition = data => {
		  const root = d3.hierarchy(data)
			  .sum(d => d.size)
			  .sort((a, b) => b.size - a.size);
		  return d3.partition()
			  .size([2 * Math.PI, root.height + 1])
			(root);
		}
		
		const root = partition(data);

		root.each(d => d.current = d);
		
		console.log(root.descendants());
		const path = this.g.append("g")
			.selectAll("path")
			.data(root.descendants())
			.join("path")
				.attr("fill", d => color(d.data.name))
				.attr("fill-opacity", d => arcVisible(d.current) ? 1 : 0)
				.attr('class', d =>  'path' + d.data.name)
			    .attr("d", arc)
				//.on("click", clicked)
				.on('mouseover', mouseover);

	    path.filter(d => d.children)
		    .style("cursor", "pointer");
		
		const parent = this.g.append("circle")
		  .datum(root)
		  .attr('class', 'parent-node')
		  .attr("r", radius)
		  .attr("fill", "none")
		  .attr("pointer-events", "all")
		  //.on("click", clicked)
		  .on('mouseover', mouseleave);
		 
		
		this.totalSize = path.node().__data__.value;
		this.parentSize = parent.node().__data__.value;
		
		function clicked(p) {
			parent.datum(p.parent || root);

			root.each(d => d.target = {
			  x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
			  x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
			  y0: Math.max(0, d.y0 - p.depth),
			  y1: Math.max(0, d.y1 - p.depth)
			});

			const t = that.g.transition().duration(750);

			// Transition the data on all arcs, even the ones that aren’t visible,
			// so that if this transition is interrupted, entering arcs will start
			// the next transition from the desired position.
			path.transition(t)
				.tween("data", d => {
				  const i = d3.interpolate(d.current, d.target);
				  return t => d.current = i(t);
				})
			  .filter(function(d) {
				return +this.getAttribute("fill-opacity") || arcVisible(d.target);
			  })
				.attrTween("d", d => () => arc(d.current));
			
		  }
		  
		function mouseover(d){

			var sequenceArray = d.ancestors().reverse();
			sequenceArray.shift(); // remove root node from the array
			//var sequenceNames = [];
			var sequenceNames = sequenceArray.map(function(d){
				var temp = d.data.name;
				return temp;
			});
			
			// Fade all the segments.
			d3.selectAll("path")
				.style("opacity", 0.4);

			// Then highlight only those that are an ancestor of the current segment.
			d3.selectAll("path")
				.filter(function(node) {
						  return (sequenceNames.indexOf(node.data.name)>= 0);
						})
				.style("opacity", 1);
				
			
			
			updateBreadcrumbs(sequenceNames);
			}
		function mouseleave(d) {
				// Hide the breadcrumb trail
				d3.selectAll(".trail")
				  .style("visibility", "hidden");

				d3.selectAll("path")
				  .transition()
				  .duration(200)
				  .style("opacity", 1)
				  .on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
				}
			
		function updateBreadcrumbs(nodeArray) {
	
			var b = {
				w: 125, h: 65, s: 3, t: 10
				};
			
			d3.selectAll('.trail').remove();
			  
			var percentFormat = d3.format(",.1%")
			  
			  d3.selectAll(".mySIO-Chart")._groups[0].forEach(function(d){
				  
				var ids = d.id.split("-")[1];
				console.log(ids);
				  
				var svg = d3.select('#' + d.id);
				  
				var parentData = svg.selectAll('.parent-node').node().__data__.value;
				console.log(parentData);
				 
				var sequenceData = svg.selectAll("path")
					.filter(function(node) {
						  return (nodeArray.indexOf(node.data.name)>= 0);
						})
					.data()
				
				var g = d3.select("#sequence-" + ids)
				  .selectAll(".trail")
				  .data(sequenceData);

			  // Add breadcrumb and label for entering nodes.
			  var entering = g.enter()
				.append("svg:g")
				.attr('class', 'trail');

				var textCat = entering.append("svg:text")
				  .attr("x", (b.w + b.t)/2 )
				  .attr("y", 15)
				  .attr("dy", "0.35em")
				  //.attr('font-weight', 'bold')
				  .attr("text-anchor", "start")
				  .text(function(d) { return d.data.name; })
				  .call(wrap, 100);
				
				var textCatBB =  textCat.node().getBBox();
				
				entering.append("svg:text")
					  .attr("x", b.t)
					  .attr("y", textCatBB.height + 25)
					  //.attr("dy", "0.35em")
					  .attr("text-anchor", "start")
					  .text(d=> 'Count: ' + d.value);
			
				entering.append("svg:text")
					  .attr("x", b.t)
					  .attr("y", textCatBB.height + 40)
					  //.attr("dy", "0.35em")
					  .attr("text-anchor", "start")
					  .text(function(d) { return 'Percent: ' + percentFormat(d.value / parentData); });
				
				var textBB =  entering.node().getBBox();
				
				entering.append("svg:rect")
					.attr('class', 'breadRect')
				  //.attr("points", breadcrumbPoints)
				  .attr('y',5)
				  .attr('width', 125)
				  .attr('height', textBB.height + 10)
				  //.attr('rx', 15)
				  //.attr('ry', 15)
				  .style('fill', 'none')
				  //.style('border-radius', 5)
				  .style('stroke-width', 4)
				  .style("stroke", d => color(d.data.name))
				  //.style('fill', d => color(d.data.name))
				  .style('fill-opacity', 0.4);
				
			  // Set position for entering and updating nodes.
			  entering.attr("transform", function(d, i) {
				return "translate(5, " + i * (textBB.height + b.s + 15 ) + ")";
			  });

			  // Remove exiting nodes.
			  g.exit().remove();


			  // Make the breadcrumb trail visible, if it's hidden.
			  d3.select(".sequence")
				  .style("visibility", "");
			  });
			  


			}

		  
	}
	
	resize(){
		this.draw()
	}
	
}
	
function arcVisible(d) {
    return d.y1 <= 5 && d.y0 >= 1 && d.x1 > d.x0;
  }

function labelVisible(d) {
	return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d) {
	const radius = this.width / 6
	const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
	const y = (d.y0 + d.y1) / 2 * radius;
	return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}

function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
} 
	
function breadcrumbPoints(d, i) {
  var b = {
	w: 125, h: 65, s: 3, t: 10
	};

  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  //points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
 
   // debugger;
  return points.join(" ");
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
		x = 15,
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
