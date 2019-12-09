HTMLWidgets.widget({

  name: 'mySIO',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {
        // general chart with layers

				console.log(x);
				this.chartSB = new chartSB({
					element: document.getElementById(el.id),
					data: x.data,
					options: x.options,
					grouper: x.grouper,
					width: width,
					height: height
					});

      },

      resize: function(width, height) {
		//chart will use its own resize method
        if(this.chartSB) {
			this.chartSB.resize(width, height);
		}

      }

    };
  }
});
