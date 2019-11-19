HTMLWidgets.widget({

  name: 'mySIO',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {
        // general chart with layers

				console.log(x);
				this.chart = new chart({
					element: document.getElementById(el.id),
					data: x.data,
					options: x.options
					});

      },

      resize: function(width, height) {
		//chart will use its own resize method
        if(this.chart) {
			this.chart.resize();
		}

      }

    };
  }
});
