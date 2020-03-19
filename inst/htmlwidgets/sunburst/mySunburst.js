class chartSB {
	
	constructor(opts) {
		console.log(opts);
  	    this.element = opts.element;
	    this.data = opts.data;
	    this.options = opts.options;
		this.grouper = opts.grouper;
		this.width = opts.width;
		this.height = opts.height;
	    this.draw();
    }
	
	draw() {
		var that = this;
		//this.width = this.element.offsetWidth;
		//this.height = this.element.offsetHeight;
		//this.margin = this.options.margin;
		
		var color = d3.scaleOrdinal()
			.domain(this.options.names)
			.range(this.options.color);
		
		var width = this.width;
		
		this.element.innerHTML = '';
		this.svg = d3.select(this.element).append('svg')
			.attr('id', 'chart-' + this.element.id)
			//.attr('class', this.grouper ? this.grouper : 'chart')
			.attr('class', 'mySIO-Chart')
		    .attr('width', this.width)
			.attr('height', this.height)
			.on('click', clickedOff);
		
		//this.addButtons();
		
		this.g = this.svg.append("g")
		    .attr('transform','translate('+this.width/2+','+this.height/2+')');
		
		/*
		this.sequence = d3.select(this.element).append('svg')
			.attr('id', 'sequence-' + this.element.id)
			.attr('height', this.height)
			.attr('class', 'mySIO-sequence');
		 */ 
		
		this.updateChart(this.data);
		
		function clickedOff(){
			
			var sequenceNull = null;
			if(HTMLWidgets.shinyMode) Shiny.onInputChange(that.element.id + "_sequence", sequenceNull);
				// Hide the breadcrumb trail
				d3.selectAll(".trail")
				  .style("visibility", "hidden");

				that.g.selectAll("path")
				  .transition()
				  .duration(200)
				  .style("opacity", 1)
				  .on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
				
				that.g.selectAll(".hover-circle")
					.style("opacity", 0)
					.on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
							
				that.g.selectAll("text")
				  .style("opacity", 0)
				  .on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
				that.g.selectAll('.parent-label').style("opacity", 0);
				
				that.g.selectAll(".parent-hover-circle")
					.style("opacity", 0)
					.on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
		}
		
	}
	
	updateChart(data){
		const that = this;
		
		this.totalSize = 0;
		
		var color = d3.scaleOrdinal()
			.domain(this.options.names)
			.range(this.options.color);
		
		const radius = Math.min(this.width, this.height) / this.options.radius;
		
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
		
		const arcs = this.g
			.selectAll(".arc")
			.data(root.descendants())
			.join("g")
			//.append("g")
			.attr("class", "arc")
			.on('mouseover', mouseover);
			
			arcs.append("path")
				.attr("fill", d => color(d.data.name))
				.attr("fill-opacity", d => arcVisible(d.current) ? 1 : 0)
				.attr('class', d =>  'path' + d.data.name)
			    .attr("d", arc);
				//.on("click", clicked)
				//.on('mouseover', mouseover);
			
			arcs.append("circle")
				.attr("transform", function (d) { 
					return "translate(" + arc.centroid(d) + ")"; 
				})
				.attr('class', 'hover-circle')
				.attr("dy", ".35em")
				.attr("r", 10)
				.style('opacity', 0)
				.style("fill", "white")
				.style('stroke', "lightgray")
				.style('stroke-width', 2);
			
			arcs.append("svg:text")
				.attr("transform", function (d) { 
					return "translate(" + arc.centroid(d) + ")"; 
				})
				.style('opacity', 0)
				.style('color', 'gray')
				.attr("dy", ".35em")
				.attr("dx", "-.25em")
				.text(function (d) { 
					return d.depth + 1;
				});
			
		/*
	    path.filter(d => d.children)
		    .style("cursor", "pointer");
		*/
		const parent = this.g.append("circle")
		  .datum(root)
		  .attr('class', 'parent-node')
		  .attr("r", radius)
		  .attr("fill", "transparent")
		  .attr("pointer-events", "all")
		  //.on("click", clicked)
		  .on('mouseover', mouseleave);
		  
		this.g.append("circle")
			.attr('class', 'parent-hover-circle')
			.attr("dy", ".35em")
			.attr("r", 10)
			.style('opacity', 0)
			.style("fill", "white")
			.style('stroke', "lightgray")
			.style('stroke-width', 2);
		
		this.g.append("svg:text")
			.attr('class', 'parent-label')
			.style('opacity', 0)
			.style('color', 'gray')
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			//.attr("dx", ".25em")
			.text("1")
		
		this.totalSize = arcs.node().__data__.value;
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
			
			var current_depth = d.depth;
			
			var sequenceArray = d.ancestors().reverse();
			sequenceArray.shift(); // remove root node from the array
			
			//sequence info and Shiny inputs
			var sequenceNames = sequenceArray.map(function(d){
				var pathName = d.data.name;
				
				return pathName;
			});
			
			if(HTMLWidgets.shinyMode) Shiny.onInputChange(that.element.id + "_sequence", sequenceNames);
			
			
			var sequenceLevels = sequenceArray.map(function(d){
				var columnName = d.data.colname;
				
				return columnName;
			});
			
			var sequencePosition = sequenceArray.map(function(d){
				var size = d.value;
				return size;
			});
			if(HTMLWidgets.shinyMode) Shiny.onInputChange(that.element.id + "_data", sequencePosition);
			
			// Fade all the segments.
			that.g.selectAll("path")
				.style("opacity", 0.3);
				
			that.g.selectAll("text")
				.style("opacity", 0);
				
			that.g.selectAll(".hover-circle")
				.style("opacity", 0);
			
			that.g.selectAll(".parent-hover-circle")
				.style("opacity", 0);

			// Then highlight only those that are an ancestor of the current segment.
			that.g.selectAll("path")
				.filter(function(node) {
						  return (sequenceNames.indexOf(node.data.name)>= 0 & 
						  sequenceLevels.indexOf(node.data.colname) >= 0 &
						  sequencePosition.indexOf(node.value) >= 0 &
						  node.depth <= current_depth);
						})
				.style("opacity", 1);
				
			that.g.selectAll(".hover-circle")
				.filter(function(node) {
						  return (sequenceNames.indexOf(node.data.name)>= 0 & 
						  sequenceLevels.indexOf(node.data.colname) >= 0 &
						  sequencePosition.indexOf(node.value) >= 0 &
						  node.depth <= current_depth);
						})
				.style("opacity", 1);
				
			that.g.selectAll('.arc').selectAll("text")
				.filter(function(node) {
						  return (sequenceNames.indexOf(node.data.name)>= 0 & 
						  sequenceLevels.indexOf(node.data.colname) >= 0 &
						  sequencePosition.indexOf(node.value) >= 0 &
						  node.depth <= current_depth);
						})
				.style("opacity", 1);
			
			that.g.selectAll('.parent-label').style("opacity", 1);
			
			that.g.selectAll(".parent-hover-circle")
				.style("opacity", 1);
			
			//updateBreadcrumbs(sequenceNames,current_depth);
			}
		function mouseleave(d) {
			
			var sequenceNull = null;
			if(HTMLWidgets.shinyMode) Shiny.onInputChange(that.element.id + "_sequence", sequenceNull);
				// Hide the breadcrumb trail
				d3.selectAll(".trail")
				  .style("visibility", "hidden");

				that.g.selectAll("path")
				  .transition()
				  .duration(200)
				  .style("opacity", 1)
				  .on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
						
				that.g.selectAll("circle")
				  .style("opacity", 0)
				  .on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
						
				that.g.selectAll("text")
				  .style("opacity", 0)
				  .on("end", function() {
						  d3.select(this).on("mouseover", mouseover);
						});
						
				that.g.selectAll('.parent-label').style("opacity", 0);
				}
			
		function updateBreadcrumbs(nodeArray,current_depth) {
	
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
						console.log(node);
						console.log(node.depth <= node.current.depth);
						  return (nodeArray.indexOf(node.data.name)>= 0 & node.depth <= current_depth);
						})
					.data()
				console.log(sequenceData);
				var g = d3.select("#sequence-" + ids)
				  .selectAll(".trail")
				  .data(sequenceData, function(d) { return d.name + d.depth; });

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
			
		function getBoundingBoxCenter (selection) {
		  // get the DOM element from a D3 selection
		  // you could also use "this" inside .each()
		  var element = selection.node();
		  // use the native SVG interface to get the bounding box
		  var bbox = element.getBBox();
		  // return the center of the bounding box
		  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
		}

		  
	}
	
	resize(width, height){
		this.width = width;
		this.height = height;
		this.draw()
	}
	
	addButtons(){
		var that = this;
				
		var buttonData = [
		{
			'name': 'image',
			'html': '<!-- Generated by IcoMoon.io --> <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -3 35 35"><title>PNG</title><path d="M34 4h-2v-2c0-1.1-0.9-2-2-2h-28c-1.1 0-2 0.9-2 2v24c0 1.1 0.9 2 2 2h2v2c0 1.1 0.9 2 2 2h28c1.1 0 2-0.9 2-2v-24c0-1.1-0.9-2-2-2zM4 6v20h-1.996c-0.001-0.001-0.003-0.002-0.004-0.004v-23.993c0.001-0.001 0.002-0.003 0.004-0.004h27.993c0.001 0.001 0.003 0.002 0.004 0.004v1.996h-24c-1.1 0-2 0.9-2 2v0zM34 29.996c-0.001 0.001-0.002 0.003-0.004 0.004h-27.993c-0.001-0.001-0.003-0.002-0.004-0.004v-23.993c0.001-0.001 0.002-0.003 0.004-0.004h27.993c0.001 0.001 0.003 0.002 0.004 0.004v23.993z"></path><path d="M30 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"></path><path d="M32 28h-24v-4l7-12 8 10h2l7-6z"></path></svg>'
		},
		{
			'name': 'chart',
			'html': '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 35 25"><title>Download Data</title><path d="M26 2h-20l-6 6v21c0 0.552 0.448 1 1 1h30c0.552 0 1-0.448 1-1v-21l-6-6zM16 26l-10-8h6v-6h8v6h6l-10 8zM4.828 6l2-2h18.343l2 2h-22.343z"></path></svg>'
		},
		{
			'name': 'wand',
			'html': '<!-- Generated by IcoMoon.io --><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 35 25"><title>% to #</title><path d="M8 6l-4-4h-2v2l4 4zM10 0h2v4h-2zM18 10h4v2h-4zM20 4v-2h-2l-4 4 2 2zM0 10h4v2h-4zM10 18h2v4h-2zM2 18v2h2l4-4-2-2zM31.563 27.563l-19.879-19.879c-0.583-0.583-1.538-0.583-2.121 0l-1.879 1.879c-0.583 0.583-0.583 1.538 0 2.121l19.879 19.879c0.583 0.583 1.538 0.583 2.121 0l1.879-1.879c0.583-0.583 0.583-1.538 0-2.121zM15 17l-6-6 2-2 6 6-2 2z"></path></svg>'
		}
	]
			
	 d3.select(this.element).select('.buttonDiv').remove();

	var buttonDiv = d3.select(this.element).append("div")
		.attr("class", "buttonDiv")  
		.style('opacity', 1)
		.style("left", ( that.width - (50) ) + 'px')
		.style("top", '0px');
		/*
		.on("mouseover", function() { 
					 
					d3.select(that.element).select(".buttonDiv")
						.style('opacity', 1);
				})
			.on("mouseout", function() { 
				
				d3.select(that.element).select(".buttonDiv")
					.style('opacity', 0);
				})
			.on("mousemove", function(){
				d3.select(that.element).select(".buttonDiv")
					.style('opacity', 1);
			});
		*/
	
	var data2Use =  buttonData.slice(0,1);
	
	var buttons = buttonDiv.selectAll('.button')
		.data(data2Use)
	  .enter()
		.append('svg')
		.attr('class', 'button')		
		//.attr("transform", function(d) { return "translate(" +  tempData.indexOf(d)* 20 + ", 0)"; })
		.html(function(d){ return d.html})
		.on('click', function(d){
			if(d.name == "image"){
				var svgString = getSVGString(that.svg.node());
				svgString2Image( svgString, 2*that.width, 2*that.height, 'png', save ); // passes Blob and filesize String to the callback

				function save( dataBlob, filesize ){
					saveAs( dataBlob, that.element.id + '.png' ); // FileSaver.js function
				}
			} else if(d.name == "chart"){
				var csvData =  [];
			
				that.plotLayers.forEach(function(d){
						csvData.push(d.data);
					});
					
				var finalCSVData = [].concat.apply([], csvData);
				
				exportToCsv(that.element.id + '_data.csv', finalCSVData)
			} 
				
			});
			
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

if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      var dataURL = this.toDataURL(type, quality).split(',')[1];
      setTimeout(function() {

        var binStr = atob( dataURL ),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i = 0; i < len; i++ ) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback( new Blob( [arr], {type: type || 'image/png'} ) );

      });
    }
  });
}

function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];
			
			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}
		
		console.log(extractedCSSText);
		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css"); 
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, callback ) {
	var format = format ? format : 'png';

	var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			var filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});

		
	};

	image.src = imgsrc;
}

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var t=e.document,n=function(){return e.URL||e.webkitURL||e},o=t.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in o,i=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},a=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),c=e.webkitRequestFileSystem,d=e.requestFileSystem||c||e.mozRequestFileSystem,u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",f=0,l=4e4,v=function(e){var t=function(){"string"==typeof e?n().revokeObjectURL(e):e.remove()};setTimeout(t,l)},p=function(e,t,n){t=[].concat(t);for(var o=t.length;o--;){var r=e["on"+t[o]];if("function"==typeof r)try{r.call(e,n||e)}catch(i){u(i)}}},w=function(e){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\uFEFF",e],{type:e.type}):e},y=function(t,u,l){l||(t=w(t));var y,m,S,h=this,R=t.type,O=!1,g=function(){p(h,"writestart progress write writeend".split(" "))},b=function(){if(m&&a&&"undefined"!=typeof FileReader){var o=new FileReader;return o.onloadend=function(){var e=o.result;m.location.href="data:attachment/file"+e.slice(e.search(/[,;]/)),h.readyState=h.DONE,g()},o.readAsDataURL(t),void(h.readyState=h.INIT)}if((O||!y)&&(y=n().createObjectURL(t)),m)m.location.href=y;else{var r=e.open(y,"_blank");void 0===r&&a&&(e.location.href=y)}h.readyState=h.DONE,g(),v(y)},E=function(e){return function(){return h.readyState!==h.DONE?e.apply(this,arguments):void 0}},N={create:!0,exclusive:!1};return h.readyState=h.INIT,u||(u="download"),r?(y=n().createObjectURL(t),void setTimeout(function(){o.href=y,o.download=u,i(o),g(),v(y),h.readyState=h.DONE})):(e.chrome&&R&&R!==s&&(S=t.slice||t.webkitSlice,t=S.call(t,0,t.size,s),O=!0),c&&"download"!==u&&(u+=".download"),(R===s||c)&&(m=e),d?(f+=t.size,void d(e.TEMPORARY,f,E(function(e){e.root.getDirectory("saved",N,E(function(e){var n=function(){e.getFile(u,N,E(function(e){e.createWriter(E(function(n){n.onwriteend=function(t){m.location.href=e.toURL(),h.readyState=h.DONE,p(h,"writeend",t),v(e)},n.onerror=function(){var e=n.error;e.code!==e.ABORT_ERR&&b()},"writestart progress write abort".split(" ").forEach(function(e){n["on"+e]=h["on"+e]}),n.write(t),h.abort=function(){n.abort(),h.readyState=h.DONE},h.readyState=h.WRITING}),b)}),b)};e.getFile(u,{create:!1},E(function(e){e.remove(),n()}),E(function(e){e.code===e.NOT_FOUND_ERR?n():b()}))}),b)}),b)):void b())},m=y.prototype,S=function(e,t,n){return new y(e,t,n)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(e,t,n){return n||(e=w(e)),navigator.msSaveOrOpenBlob(e,t||"download")}:(m.abort=function(){var e=this;e.readyState=e.DONE,p(e,"abort")},m.readyState=m.INIT=0,m.WRITING=1,m.DONE=2,m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null,S)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!=typeof define&&null!==define&&null!==define.amd&&define([],function(){return saveAs});
