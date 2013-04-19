$(function() {
    var dateString = data.sprint_started.split("/"),
        dateInitial = new Date(dateString[2], (dateString[1] - 1), dateString[0]),
        dateEnd = new Date(dateInitial),
        daysSprint = data.sprint_weeks * 7;

    dateEnd.setDate(dateEnd.getDate() + daysSprint);

    function getAllStoryPoints() {
        var storyPoints = [],
            daysDiff = [],
            c = 0,
            stories_len = Object.keys(stories).length - 1;

        for (var i = 0; i <= stories_len; i++) {

            storyPoints.push(parseInt(stories[i]["points"]))

            c = i + 1
            if (c < (stories_len + 1)) {
                diff = GetDaysLeft(parseDate(stories[i]["date"]), stories[i]["points"], parseDate(stories[c]["date"]))

                for (x in diff) {

                    if (parseDate(stories[i]["date"]) < diff[x]["date"]) {
                        storyPoints.push(parseInt(diff[x]["points"]))
                    }
                }
            }
        }
        return storyPoints
    }

    function GetDaysLeft(date1, points1, date2) {
        var daysLeft = {},
        count = 0,
            mil = 86400000; //24h

        date1.setDate(date1.getDate() + 1);
        date2.setDate(date2.getDate() - 1);

        for (var i = date1.getTime(); i <= date2.getTime(); i = i + mil) {
            daysLeft[count] = {
                "date": new Date(i),
                "points": points1
            }
            count += 1
        }

        return daysLeft
    }

    function parseDate(date) {
        var dateString = date.split("/"),
            dateParsed = new Date(dateString[2], (dateString[1] - 1), dateString[0])

            return dateParsed
    }

    function listDays(dateInitial, dateEnd) {
        var listDays = [],
            mil = 86400000; //24h

        // make array with all days
        for (var i = dateInitial.getTime(); i <= dateEnd.getTime(); i = i + mil) {
            listDays.push(new Date(i))
        }
        // apply to elements of array
        listDays.map(function(x, i, ar) {
            ar[i] = x.format("UTC:dd/mm");
        });

        return listDays
    }

    var list_days = listDays(dateInitial, dateEnd),
        storyPoints = getAllStoryPoints();

    // chart plugin

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
            text: data.sprint_name + ' - ' + data.sprint_weeks + ' ' + txt.weeks,
            x: -20
        },
        xAxis: {
            categories: list_days,
            labels: {
                style: {
                    color: '#000',
                    fontSize: '9px',
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
            data: [
                [(list_days.length - 1), 0],
                [0, parseInt(data.stories_len)]
            ],
            // enableMouseTracking: false
        }, {
            name: txt.actual,
            data: storyPoints
        }]
    });
});
