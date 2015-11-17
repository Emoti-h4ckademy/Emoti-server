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
                $('.ajax-response-box').html('<h2>' + data + '</h2>');
                // Do some nice stuff here
            },
            error: function(xhr, type){
                alert('AJAX response returned and error');
            }
        })


    });
});