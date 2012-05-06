(function($){
    $(document).ready(function(){
        var myCodeMirror = CodeMirror.fromTextArea($('#editor')[0]);

        $('#interpret').click(function(event){
            event.preventDefault();
            try
            {
                $('#output').text(evalScheemString(myCodeMirror.getValue()));
            }
            catch(error)
            {
                $('#output').text('Exception: '+error.message);
            }
        });
    });
})(jQuery);
