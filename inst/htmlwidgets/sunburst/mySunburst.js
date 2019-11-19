class chart {
	
	constructor(opts) {
		console.log(opts);
  	    this.element = opts.element;
	    this.data = opts.data;
	    this.options = opts.options;
	    this.draw();
    }
	
	draw() {
	  
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		this.margin = this.options.margin;
		
		const width = this.width;
	 
		this.element.innerHTML = '';
		this.svg = d3.select(this.element).append('svg')
			.attr('id', this.element.id)
		    .attr("viewBox", [0, 0, this.width, this.width])
		    .style("font", "10px sans-serif");

		this.g = this.svg.append("g")
		    .attr("transform", `translate(${width / 2},${width / 2})`);
		  
		this.updateChart(this.data);
		this.updateLegend();
	
	}
	
	updateChart(data){
		const that = this;
		
		const color = d3.scaleOrdinal()
			.domain(this.options.names)
			.range(this.options.color);
		
		const radius = this.width / 6;
		
		const arc = d3.arc()
			.startAngle(d => d.x0)
			.endAngle(d => d.x1)
			.padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
			.padRadius(radius * 1.5)
			.innerRadius(d => d.y0 * radius)
			.outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));
		
		const root = partition(data);

		root.each(d => d.current = d);
		
		const path = this.g.append("g")
			.selectAll("path")
			.data(root.descendants().slice(1))
			.join("path")
				.attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
				.attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
				.attr('class', d =>  'path' + d.data.name)
			  .attr("d", d => arc(d.current));

	    path.filter(d => d.children)
		    .style("cursor", "pointer")
		    .on("click", clicked);
		
		const parent = this.g.append("circle")
		  .datum(root)
		  .attr("r", radius)
		  .attr("fill", "none")
		  .attr("pointer-events", "all")
		  .on("click", clicked);
		  
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
	}
	
	updateLegend(){
		
	}
	
}

partition = data => {
  const root = d3.hierarchy(data)
      .sum(d => d.size)
      .sort((a, b) => b.size - a.size);
  return d3.partition()
      .size([2 * Math.PI, root.height + 1])
    (root);
}
	
function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
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
	
