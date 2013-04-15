$(function () {
    var dateString = data.sprint_started.split("/"),
        dateInitial = new Date(dateString[2], (dateString[1]-1), dateString[0]),
        dateEnd = new Date(dateInitial),
        daysSprint = data.sprint_weeks*7;
        
    dateEnd.setDate(dateEnd.getDate() + daysSprint);
    
    // console.log(data.concluded_stories)

        function storiesConcluded(dateInitial) {
            var current_date = new Date(),
                stories_todo = parseInt(data.stories_len) - parseInt(data.concluded_stories),
                listDays = [],
                mil = 86400000; //24h

            // make array with all days
            for (var i=dateInitial.getTime(); i<=current_date.getTime();i=i+mil) {
              listDays.push(stories_todo)
            }

            return listDays
        }

        function listDays(dateInitial, dateEnd) {
            var listDays = [],
                mil = 86400000; //24h
            
            // make array with all days
            for (var i=dateInitial.getTime(); i<=dateEnd.getTime();i=i+mil) {
              listDays.push(new Date(i))
            }
            // apply to elements of array
            listDays.map(function(x, i, ar){
                ar[i] = x.format("UTC:dd/mm");
            });

            return listDays
        }

        var list_days = listDays(dateInitial, dateEnd);
        var concluded_stories = storiesConcluded(dateInitial);

        $('#container').highcharts({
            chart: {
                type: 'line',
                // marginRight: 130,
                // marginBottom: 45
            },
            title: {
                text: txt.burndow_chart,
                x: -20 //center
            },
            subtitle: {
                text: data.sprint_name+' - '+data.sprint_weeks+' '+txt.weeks,
                x: -20
            },
            xAxis: {
                categories: list_days,
                labels: {
                    style: {
                        color: '#000',
                        fontSize: '9px',
                        transform: 'rotate(270deg)',
                    }
                },
            },
            yAxis: {
                title: {
                    text: txt.stories
                },
                min: 0,
                max: parseInt(data.stories_len)
            },
            tooltip: {
                valueSuffix: txt.points
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: 0,
                y: 50,
                borderWidth: 0
            },
            // exporting: {
            //     enabled: false
            // },
            series: [{
                name: txt.estimated,
                // marker: {
                //     enabled: false
                // },
                dashStyle: 'shortdot',
                data: [[(list_days.length-1), 0], [0, parseInt(data.stories_len)]],
                // enableMouseTracking: false
            }, {
                name: txt.actual,
                data: concluded_stories
            }]
        });
    });
    
