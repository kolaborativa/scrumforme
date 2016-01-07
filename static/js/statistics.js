$(function() {
    var dateString = data.sprint_started.split("/"),
        initialDate = new Date(dateString[2], (dateString[1] - 1), dateString[0]),
        dateEnd = new Date(initialDate),
        daysSprint = data.sprint_weeks * 7;

    // console.log(initialDate);
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
            // ****** DEV
              date_ = new Date(i);
              if (date_.getDay() != 6 && date_.getDay() != 0) {
                daysLeft[count] = {
                  "date": new Date(i),
                  "points": points
                };
                count += 1

              }
            // ****** /DEV
            //daysLeft[count] = {
            //    "date": new Date(i),
            //    "points": points
            //}
            //count += 1
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
        console.log('datesBefore', datesBefore);

        // values ​​undated between
        story_points = story_points.concat(valuesBetween());
        console.log('story_points cacat', story_points);

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
      console.log('datesAfter', Object.keys(datesAfter));
    }

     story_points.pop();
     console.log('story points: ', story_points);
     //console.log('storylen', parseInt(data.stories_len, 10))
     //console.log('list_days', list_days)

    // criar um lista de numeros range parseInt(data.stories_len)
    // verificar se é final de semana. se for mantem o numero anterior
    // [7, 6, 5, 4, 3, 3, 3, 0]
    // 7 => parseInt(data.stories_len, 10)

    //pontosDeHistoria = parseInt(data.stories_len, 10);
    //lista = []
    //for (i=pontosDeHistoria; i >= 0; i--) {
    // lista.push(i)
    //}
    //// lista = [7, 6, 5, 4, 3, 2, 1, 0]
    //
    //for (i=0; i <= pontosDeHistoria; i++) {
    //    console.log('indice', i);
    //    console.log(list_days[i]);
    //     var dateString = list_days[i].split("/"),
    //        dateParsed = new Date('2016', dateString[1] - 1, dateString[0]);
    //
    //    console.log(dateParsed);
    //    // verifica se eh final de semana (6=sabado, 0=domingo)
    //    if (dateParsed.getDay() == 1 || dateParsed.getDay() == 0) {
    //        console.log('fim de semana')
    //        lista[i] = lista[i-1];
    //    };
    //
    //    console.log('------')

        // se for muda a posição do lista para o anterior
    //}
    // list_days = ["05/01", "06/01", "07/01", "08/01", "09/01", "10/01", "11/01", "12/01"]

    //console.log(lista);
     //console.log(parseInt(data.stories_len));

    // percorrer a lista de dias retirando os finais de semana
    // list_days

    var lista = [];
    var count_weekend = 0;
    pontosDeHistoria = parseInt(data.stories_len, 10);
    for (i=0; i <= pontosDeHistoria; i++) {
        //console.log('indice', i);
        //console.log(list_days[i]);
        var dateString = list_days[i].split("/"),
          dateParsed = new Date('2016', dateString[1] - 1, dateString[0]); // 2016 ? .getYear()

        //console.log(dateParsed);
        // verifica se eh final de semana (6=sabado, 0=domingo)
        //if (dateParsed.getDay() != 6 && dateParsed.getDay() != 0) {
        //    lista.push(list_days[i]);
        //
        //};
        if (dateParsed.getDay() != 6 && dateParsed.getDay() != 0) {
            lista.push(list_days[i]);
        } else {
            count_weekend += 1;
        };
    };
    //console.log('lista antes: ', lista);


    for (i=1; i<=count_weekend; i++) {
        //console.log('ultimo dia', lista[lista.length-1]);
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

        //console.log('proxima date', next_date);
    }

    //console.log('lista depois: ', lista);
    //console.log('dias que sao fds: ', count_weekend );



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
                //[(list_days.length - 1), 0],
                [(lista.length - 1), 0],
                [0, parseInt(data.stories_len, 10)]
            ],
            //data: lista,
            // enableMouseTracking: false
        }, {
            name: txt.actual,
            data: story_points
        }]
    });
});