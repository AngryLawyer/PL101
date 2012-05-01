var evalScheem = function (expr, env) {

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (expr === 'error') throw('Error');

    // Look at head of list for operation
    switch (expr[0]) {
        case '=':
            var eq =
                (evalScheem(expr[1], env) ===
                 evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case 'if':
            if (evalScheem(expr[1]) === '#t')
            {
                return evalScheem(expr[2]);
            }
            return evalScheem(expr[3]);
    }
};

module.exports.evalScheem = evalScheem;
