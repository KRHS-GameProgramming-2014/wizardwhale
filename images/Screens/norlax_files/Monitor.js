
Thingiverse.Monitor = function() {
  this.time_series = [];
  this.start = new Date();
  this.end = new Date();
  return this;
};

Thingiverse.Chart = function(dom_element, opts) {
  Thingiverse.Monitor.call(this);
  // set defaults
  this.title = "chart";
  this.xaxis = {
			type: 'datetime',
			title: {
				text: '',
				style: {fontSize: '14px',	fontFamily: 'Antenna, Verdana, sans-serif',	color: '#000000',	fontWeight: 'bold'}
			},
      minPadding: 0.05,
      maxPadding: 0.05
  };
  this.tooltip = {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderWidth: 0,
      borderRadius: 4,
      headerFormat: '<span class="key_title">{point.key}</span><table>',
      pointFormat: '<tr><td class="key_name" style="color:{series.color};">{series.name}: </td>' +
          '<td class="key_value">{point.y}</td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
  };

  // override options
  for ( attrib in opts ) {
    if ( opts.hasOwnProperty(attrib) ) {
      this[attrib] = opts[attrib];
    }
  }
  this.chart_element = dom_element;
}
Thingiverse.Chart.prototype = Object.create(Thingiverse.Monitor.prototype);

Thingiverse.Monitor.prototype.addTimeSeries = function(metric, options) {
  this.time_series.push( {metric: metric, options: options} );
}

Thingiverse.Monitor.parseDate = function(date_element) {
  var dateTok = date_element.value.split('-');
  if ( dateTok.length<3 )
  {
    // invalid date
    date_element.value = "";
    return;
  }
  return new Date(dateTok[0], dateTok[1]-1, dateTok[2] );
}


Thingiverse.Monitor.prototype.loadTimeSeries = function() {

  var self = this;

  var start_day = Math.floor((new Date() - this.start) / 1000 / 86400);
  var end_day = Math.floor((new Date() - this.end) / 1000 / 86400);

  var time_offset = end_day;
  var time_period = start_day - end_day;

  for ( var i=0; i<this.time_series.length; i++ ) {

    var metric = this.time_series[i].metric;
    var options = this.time_series[i].options;

    $.ajax({
      type: "GET",
      url: '/ajax/admin/getTimeSeries',
      data: {metric: metric, time_offset:time_offset, time_period:time_period},
      dataType: "json",
      success: function(response) {
        // handle the response
console.log(response);
        var time_series = self.lookupTimeSeries(response.metric);
        for (var i=0; i<response.data.length;i++) {
          var date = new Date(response.data[i].Timestamp);
          response.data[i].x = date;
          response.data[i].y = response.data[i].Average;
          if ( typeof(response.data[i].printer_id)!='undefined' )
          {
            switch ( response.data[i].printer_id )
            {
              case "2":
                response.data[i].marker = {symbol: 'url(/img/icon-rep2.png)'};
                break;
              case "3":
                response.data[i].marker = {symbol: 'url(/img/icon-rep2x.png)'};
                break;
              case "5":
                response.data[i].marker = {symbol: 'url(/img/icon-platy.png)'};
                break;
              case "6":
                response.data[i].marker = {symbol: 'url(/img/icon-tink.png)'};
                break;
              case "7":
                response.data[i].marker = {symbol: 'url(/img/icon-moose.png)'};
                break;
            }
          }
        }

        response.data.sort(function(a,b){
          return(a.x.getTime() - b.x.getTime());
        });

        time_series.data = response.data;
        time_series.name = response.metric;

        self.updateGraph();
      },
      error: function(error) {
        console.log(error);
      }
    });


  }


}

Thingiverse.Monitor.prototype.lookupTimeSeries = function(metric) {
  for ( var i=0; i<this.time_series.length; i++ )
    if ( this.time_series[i].metric==metric )
      return this.time_series[i];
  return undefined;
}

Thingiverse.Monitor.prototype.updateGraph = function() {
  // also see if we're linked to an export link
  if ( typeof(this.link_element)!='undefined' )
  {
    $(this.link_element).empty();

    var start_day = Math.floor((new Date() - this.start) / 1000 / 86400);
    var end_day = Math.floor((new Date() - this.end) / 1000 / 86400);
    var time_offset = end_day;
    var time_period = start_day - end_day;

    for ( var i=0; i<this.time_series.length; i++ ) {
      var metric = this.time_series[i].metric;
      var options = this.time_series[i].options;

      var link = document.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute('href', '/ajax/admin/getTimeSeries?metric='+metric+'&time_offset='+time_offset+'&time_period='+time_period);
      link.style.display = "block";
      link.innerHTML = "export "+metric;
      $(this.link_element).append(link);
    }
  }

  // update our chart
  $(this.chart_element).highcharts({
      chart: {
          events: {
              load: function() {
                  $('tspan').each( function() {
                      if ($(this).html() == 'Highcharts.com') {
                          $(this).hide();
                      }
                  } );
              }
          }
      },
      title: {
          text: 'Slice Render Time',
          style: {
              fontSize: '24px',
              fontFamily: 'Antenna, Verdana, sans-serif',
              color: '#000000',
              fontWeight: 'bold'
          }
      },
      xAxis: this.xaxis,
      yAxis: {
          min: 0,
          title: {
              text: 'Slice Time (seconds)',
              style: {
                  fontSize: '14px',
                  fontFamily: 'Antenna, Verdana, sans-serif',
                  color: '#000000',
                  fontWeight: 'bold'
              }
          }
      },
      tooltip: this.tooltip,
      legend: {
          enabled: false,
      },
      series: this.time_series
  } );

}
