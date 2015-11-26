/**
 * Created by Carlos on 16/11/15.
 */

var highChart;
var seriesGlobal;
var colors = {
    neutral: '#F9B234',
    anger: '#BF1522',
    happiness: '#E6057D',
    contempt: '#29245C',
    disgust: '#2FAD66',
    sadness: '#29245C',
    surprise: '#652483'
}

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

var getDataForCharts = function () {
    $.ajax({
        type: 'GET',
        url: '/api/charts',
        data: {  },
        dataType: 'json',
        success: function(data){
            highChart = new HighCharts();
            highChart.series = highChart.parseData(data);
            highChart.drawchart();
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

    drawchart : function (type, seriesValues) {
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
        }
        series.push({name : 'Anger', data : angerArray, color : colors.anger});
        series.push({name : 'Contempt', data : contemptArray, color : colors.contempt});
        series.push({name : 'Disgust', data : disgustArray, color : colors.disgust});
        series.push({name : 'Happiness', data : happinessArray, color : colors.happiness});
        series.push({name : 'Netural', data : neutralArray, color : colors.neutral});
        series.push({name : 'Sadness' , data : sadnessArray, color : colors.sadness});
        series.push({name : 'Surprise', data : surpriseArray, color : colors.surprise});

        seriesGlobal =  series;
        return seriesGlobal;
    }
}

$(document).ready(function() {
    detectEmotionBtn();
    getDataForCharts();
});