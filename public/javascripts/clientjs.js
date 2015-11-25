/**
 * Created by Carlos on 16/11/15.
 */

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

var normalizedStackBar = function () {
    var margin = {top: 20, right: 100, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".0%"));

    var svg = d3.select(".stockbarchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/api/charts", function(error, data) {
        if (error) console.log("Error loading data: " + error);

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

        data.forEach(function(d) {
            var y0 = 0;
            d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            d.ages.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
        });

        data.sort(function(a, b) { return b.ages[0].y1 - a.ages[0].y1; });

        x.domain(data.map(function(d) { return d.State; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var state = svg.selectAll(".state")
            .data(data)
            .enter().append("g")
            .attr("class", "state")
            .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

        state.selectAll("rect")
            .data(function(d) { return d.ages; })
            .enter().append("rect")
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .style("fill", function(d) { return color(d.name); });

        var xtrans = x.rangeBand() / 2;
        xtrans = xtrans + 70;

        var legend = svg.select(".state:last-child").selectAll(".legend")
            .data(function(d) { return d.ages; })
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d) { return "translate(" + xtrans + "," + y((d.y0 + d.y1) / 2) + ")"; });

        legend.append("line")
            .attr("x2", 10);

        legend.append("text")
            .attr("x", 13)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

    });
};

function HighCharts (type) {
    this.categories = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.series = [];
    this.plotOptions = {
        column: {
            stacking: 'percent'
        }
    };
    this.type = 'column';
    this.mainTitle = 'Emotions for this user';
    this.ytitle = 'Emotions';
};

HighCharts.prototype ={

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

    retrieveData : function () {
        $.ajax({
            type: 'POST',
            url: '/api/charts',
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
    },

    drawchart : function (type) {
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
            series: [{
                name: 'Anger',
                data: [5, 3, 4, 7, 2, 2, 2]
            }, {
                name: 'Contempt',
                data: [2, 2, 3, 2, 1, 1, 1]
            }, {
                name: 'Disgust',
                data: [3, 4, 4, 2, 5, 1, 1]
            },
            {
                name: 'Fear',
                data: [3, 4, 4, 2, 5, 5, 5]
            },
            {
                name: 'Happiness',
                data: [3, 4, 4, 2, 5, 5, 5]
            },
            {
                name: 'Neutral',
                data: [3, 4, 4, 2, 5, 5, 5]
            },
            {
                name: 'Sadness',
                data: [3, 4, 4, 2, 5, 5, 5]
            },
            {
                name: 'Surprise',
                data: [3, 4, 4, 2, 5, 5, 5]
            }
            ]
        });
    }
}

$(document).ready(function() {
    detectEmotionBtn();
    normalizedStackBar();
    var c = new HighCharts();
    c.drawchart();
});