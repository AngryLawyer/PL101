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

        $('#factorial').click(function(event) {
            event.preventDefault();
            myCodeMirror.setValue(
                '(begin\n'+
                '  (define factorial\n'+
                '    (lambda (n)\n'+
                '      (if (= n 0) 1\n'+
                '          (* n (factorial (- n 1))))))\n'+
                '(factorial 5))'
            );
        });

        $('#fibonacci').click(function(event) {
            event.preventDefault();
            myCodeMirror.setValue(
                '(begin\n'+
                '  (define fib\n'+
                '    (lambda (n)\n'+
                '      (if (< n 2)\n'+
                '      n\n'+
                '      (+ (fib (- n 1)) (fib (- n 2))))))\n'+
                '(fib 8))'
            );
        });

        $('#reverse').click(function(event) {
            event.preventDefault();
            myCodeMirror.setValue(
                '(begin\n'+
                '  (define reverse\n'+
                '    (lambda (x)\n'+
                '      (if (null? x) ()\n'+
                '        (append\n'+
	            '          (reverse (cdr x))\n'+
                '            (list (car x))))))\n'+
                '(reverse \'(1 2 3 4 5)))'
            );
        });
    });
})(jQuery);
