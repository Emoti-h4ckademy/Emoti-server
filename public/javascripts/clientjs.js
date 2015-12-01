var highChart;
var demoChart;
var seriesWeek;
var seriesDemoPie;
var colors = {
    neutral: '#F9B234',
    anger: '#BF1522',
    happiness: '#E6057D',
    contempt: '#29245C',
    disgust: '#2FAD66',
    sadness: '#29245C',
    surprise: '#652483',
    fear: '#2C3E50'
};

var parsePieData = function (object) {
    var result = [];
    var emObj;
    for (key in object) {
        emObj = {};
        emObj.name= key;
        emObj.y = object[key];
        emObj.color = colors[key];
        result.push(emObj);
    }
    return result;
};

var detectEmotionBtn = function (){
    var retrieverBtn = $('button.emotion-retriever');
    retrieverBtn.on('click', function(){
        var buttonId = this.id;
        $.ajax({
            type: 'POST',
            url: '/api/images/emotiondetect/' + buttonId,
            data: {  },
            dataType: 'json',
            success: function(data){
                var responseContainer = $('.ajax-response-container' + buttonId);
                //console.log(JSON.stringify(data.scores, null, ''));
                var scores = JSON.stringify(data[0].scores);
                responseContainer.html('<h2>' + data[0].emotion + '</h2>' +
                    '<div style="max-width: 564px;"><p><pre>'+ scores +'</pre></p></div>');
            },
            error: function(xhr, type){
                alert('AJAX response returned and error' + xhr + ' ' + type);
            }
        })
    });
};

var getDataForWeek = function () {
    $.ajax({
        type: 'GET',
        url: '/api/charts/week',
        data: {  },
        dataType: 'json',
        success: function(data){
            highChart = new HighCharts();
            highChart.series = highChart.parseData(data);
            highChart.drawChartWeek();
            $( "text:contains('Highcharts.com')" ).css( "display", "none" );
        },
        error: function(xhr, type){
            alert('AJAX response returned and error' + xhr + ' ' + type);
        }
    });
};

var getDataForDemo = function () {
    $.ajax({
        type: 'GET',
        url: '/api/charts/demo',
        data: {  },
        dataType: 'json',
        success: function(data){
            demoChart = new HighCharts();
            demoChart.series = demoChart.parseDataDemo(data)
            demoChart.drawDemoPie();
            $( "text:contains('Highcharts.com')" ).css( "display", "none" );
        },
        error: function(xhr, type){
            alert('AJAX response returned and error' + xhr + ' ' + type);
        }
    });
};

function HighCharts (seriesValue) {
    this.categories = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.series = [];
    this.plotOptions = {
        column: {
            stacking: 'percent'
        }
    };
    this.type = 'column';
    this.mainTitle = 'Emotions during the week';
    this.ytitle = 'Emotions';
    this.series = seriesValue;
    var self = this;
};

HighCharts.prototype ={
    print: function(){
      console.log('Hello from Highcharts object');
    },

    area: function () {
        this.type = 'area';
        this.plotOptions = {
            area: {
                stacking: 'percent',
                lineColor: '#ffffff',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#ffffff'
                }
            }
        };
    },
    bars: function () {
        this.type = 'column';
        this.plotOptions = {
            column: {
                stacking: 'percent'
            }
        };
    },

    drawChartWeek : function (type, seriesValues) {
        type === 'area' ? this.area() : this.bars();
        $('#highcharts').highcharts({
            chart: {
                type: this.type
            },
            title: {
                text: this.mainTitle
            },
            xAxis: {
                categories: this.categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: this.ytitle
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                shared: true
            },
            plotOptions: this.plotOptions
            ,
            series: this.series
        });
    },

    drawDemoPie: function (){
        $('#demopie').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Emotions of Demo Day attendees'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: seriesDemoPie
        });
    },
    parseData: function (data) {
        var series = [];
        var angerArray = [];
        var contemptArray = [];
        var disgustArray = [];
        var fearArray = [];
        var happinessArray = [];
        var neutralArray = [];
        var sadnessArray = [];
        var surpriseArray = [];
        for(var i = 0; i < data.length; i++) {
            angerArray.push(data[i].anger);
            contemptArray.push(data[i].contempt);
            disgustArray.push(data[i].disgust);
            happinessArray.push(data[i].happiness);
            neutralArray.push(data[i].happiness);
            sadnessArray.push(data[i].sadness);
            surpriseArray.push(data[i].surprise);
            fearArray.push(data[i].fear);
        }
        series.push({name : 'Anger', data : angerArray, color : colors.anger});
        series.push({name : 'Contempt', data : contemptArray, color : colors.contempt});
        series.push({name : 'Disgust', data : disgustArray, color : colors.disgust});
        series.push({name : 'Happiness', data : happinessArray, color : colors.happiness});
        series.push({name : 'Neutral', data : neutralArray, color : colors.neutral});
        series.push({name : 'Sadness' , data : sadnessArray, color : colors.sadness});
        series.push({name : 'Surprise', data : surpriseArray, color : colors.surprise});
        series.push({name : 'Fear', data : fearArray, color : colors.fear});

        seriesWeek =  series;
        return seriesWeek;
    },
    parseDataDemo: function (data) {
        var series = [];
        var object = data[0];

        series.push(
            {name: 'Emotions',
            colorByPoint: true,
            data: parsePieData(object)});

        seriesDemoPie = series;
    }
}