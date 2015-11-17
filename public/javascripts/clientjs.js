/**
 * Created by Carlos on 16/11/15.
 */

$(document).ready(function() {

    var retrieverBtn = $('button.emotion-retriever');
    retrieverBtn.on('click', function(){
        var buttonId = this.id;
        $.ajax({
            type: 'POST',
            url: '/api/images/emotiondetect/' + buttonId,
            data: {  },
            dataType: 'json',
            success: function(data){
                console.log(data);
                var responseContainer = $('.ajax-response-container');
                var responseBox = $('.ajax-response-box');
                responseContainer.html('<h2>' + data.emotion + '</h2>' +
                    '<div style="max-width: 564px;"><p><pre>'+ JSON.stringify(data.oxfordResponse.scores, null, '') +'</pre></p></div>');
                // Do some nice stuff here
            },
            error: function(xhr, type){
                alert('AJAX response returned and error' + xhr + ' ' + type);
            }
        })


    });
});