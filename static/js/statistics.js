$(function() {
    var dateString = data.sprint_started.split("/"),
        initialDate = new Date(dateString[2], (dateString[1] - 1), dateString[0]),
        dateEnd = new Date(initialDate),
        daysSprint = data.sprint_weeks * 7;

    dateEnd.setDate(dateEnd.getDate() + daysSprint);

    function valuesBetween() {
        var storyPoints = [],
            daysDiff = "",
            stories_len = Object.keys(stories).length - 1;

        for (var i = 0; i < stories_len; i++) {
            daysDiff = datesBetween(parseDate(stories[i]["date"]), parseDate(stories[i+1]["date"]), stories[i]["points"]);
            for (d in daysDiff) {
                if (parseDate(stories[i]["date"]) < daysDiff[d]["date"]) {
                    storyPoints.push(parseInt(daysDiff[d]["points"], 10))
                }
            }
        }
        return storyPoints
    }

    function datesBetween(initialDate, lastDate, points, daysLefBeforeAfter) {
        var daysLeft = {},
            count = 0,
            mil = 86400000; //24h
        if(daysLefBeforeAfter !== undefined) {
            initialDate.setDate(initialDate.getDate() + 1);
            lastDate.setDate(lastDate.getDate() - 1);
        }

        for (var i = initialDate.getTime(); i <= lastDate.getTime(); i = i + mil) {
              date_ = new Date(i);
              if (date_.getDay() != 6 && date_.getDay() != 0) {
                daysLeft[count] = {
                  "date": new Date(i),
                  "points": points
                };
                count += 1

              }
        }

        return daysLeft
    }

    function parseDate(date) {
        var dateString = date.split("/"),
            dateParsed = new Date(dateString[2], (dateString[1] - 1), dateString[0])

            return dateParsed
    }

    function listDays(initialDate, dateEnd) {
        var listDays = [],
            mil = 86400000; //24h

        // make array with all days
        for (var i = initialDate.getTime(); i <= dateEnd.getTime(); i = i + mil) {
            listDays.push(new Date(i))
        }
        // apply to elements of array
        listDays.map(function(x, i, ar) {
            ar[i] = x.format("UTC:dd/mm");
        });

        return listDays
    }

    var list_days = listDays(initialDate, dateEnd),
        story_points = [];

    // if no task was not finished yet
    if (Object.keys(stories).length === 0) {
        var today = new Date(),
            dates = datesBetween(initialDate, today, 0),
            points = 0;
        for (i in dates) {
            points = data.stories_len - dates[i]["points"]
            story_points.push(parseInt(points, 10))
        }

    } else if (Object.keys(stories).length === 1) {
        // if one task is finished
        // date values previous to the values ​​stored
        var datesBefore = datesBetween(initialDate, parseDate(stories[0]["date"]), stories[0]["points"], true);
        for (var i = 0, date = Object.keys(datesBefore).length; date >= i; i++) {
            story_points.push(parseInt(data.stories_len, 10))
        }
        // story points from the current sprint
        story_points.push(parseInt(stories[0]["points"], 10))

        // last value stored to the current date
        var today = new Date(),
            datesAfter = datesBetween(parseDate(stories[0]["date"]), today, stories[0]["points"], true);
        for (var i = 0, date = Object.keys(datesAfter).length; date >= i; i++) {
            story_points.push(parseInt(stories[0]["points"], 10))
        }


    } else if (Object.keys(stories).length >= 2) {

        // date values previous to the values ​​stored
        var firstKey = Object.keys(stories).sort()[0],
            firstValue = stories[firstKey],
            datesBefore = datesBetween(initialDate, parseDate(firstValue["date"]), stories[0]["points"]);
        for (var i = 0, date = Object.keys(datesBefore).length - 1; date > i; i++) {
            story_points.push(parseInt(data.stories_len, 10));
        }

        // values ​​undated between
        story_points = story_points.concat(valuesBetween());

        // last stored value
        var lastKey = Object.keys(stories).sort().reverse()[0],
            lastValue = stories[lastKey];
        story_points.push(parseInt(lastValue["points"], 10));

        // last value stored to the current date
        var today = new Date(),
            datesAfter = datesBetween(parseDate(lastValue["date"]), today, lastValue["points"], true);
        for (var i = 0, date = Object.keys(datesAfter).length; date >= i; i++) {
            story_points.push(parseInt(lastValue["points"], 10))
        }
    }

     story_points.pop();

    var lista = [];
    var count_weekend = 0;
    pontosDeHistoria = parseInt(data.stories_len, 10);
    for (i=0; i <= pontosDeHistoria; i++) {
        var dateString = list_days[i].split("/"),
          dateParsed = new Date('2016', dateString[1] - 1, dateString[0]); // 2016 ? .getYear()

        if (dateParsed.getDay() != 6 && dateParsed.getDay() != 0) {
            lista.push(list_days[i]);
        } else {
            count_weekend += 1;
        };
    };


    for (i=1; i<=count_weekend; i++) {
        var dateStr = lista[lista.length-1].split("/"),
            dateParse = new Date('2016', dateStr[1] - 1, dateStr[0]); // 2016 ? .getYear()

        var next_date = new Date(dateParse.getFullYear(), dateParse.getMonth(), dateParse.getDate()+1);

        if (next_date.getDay() == 6) {
          // ERROR: se for sabado ele bota domingo e dá push
          next_date.setDate(next_date.getDate()+2);
        } else if (next_date.getDay() == 0) {
          next_date.setDate(next_date.getDate()+1);
        };
        lista.push(next_date.format("UTC:dd/mm"));
    }

    // chart plugin
    $('#container').highcharts({
        chart: {
            type: 'line',
        },
        title: {
            text: txt.burndow_chart,
            x: -20 //center
        },
        subtitle: {
            text: data.sprint_name + ' - ' + data.sprint_weeks + ' ' + txt.weeks,
            x: -20
        },
        xAxis: {
            categories: lista,
            labels: {
                style: {
                    color: '#000',
                    fontSize: '9px',
                }
            },
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: txt.stories_points
            },
            min: 0,
            max: parseInt(data.stories_len, 10)
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
        series: [{
            name: txt.estimated,
            // marker: {
            //     enabled: false
            // },
            dashStyle: 'shortdot',
            data: [
                [(lista.length - 1), 0],
                [0, parseInt(data.stories_len, 10)]
            ],
        }, {
            name: txt.actual,
            data: story_points
        }]
    });
});