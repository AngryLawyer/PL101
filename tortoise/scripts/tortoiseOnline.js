(function($){

    var Turtle = function (id) {
        var canvas = $('#' + id);
        this.paper = Raphael(id);
        this.originx = canvas.width() / 2;
        this.originy = canvas.height() / 2;
        this.clear(); 
    };
    Turtle.prototype.clear = function () {
        this.paper.clear();
        this.x = this.originx;
        this.y = this.originy;
        this.angle = 90;
        this.pen = true;
        this.turtleimg = undefined;
        this.updateTurtle();
    };
    Turtle.prototype.updateTurtle = function () {
        if(this.turtleimg === undefined) {
            this.turtleimg = this.paper.image(
                "http://nathansuniversity.com/gfx/turtle2.png",
                0, 0, 64, 64);
        }
        this.turtleimg.attr({
            x: this.x - 32,
            y: this.y - 32,
            transform: "r" + (-this.angle)});
        this.turtleimg.toFront();
    };
    Turtle.prototype.drawTo = function (x, y) {
        var x1 = this.x;
        var y1 = this.y;
        var params = { "stroke-width": 4 };
        var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
            x1, y1, x, y)).attr(params);
    };
    Turtle.prototype.forward = function (d) {
        var newx = this.x + Math.cos(Raphael.rad(this.angle)) * d;
        var newy = this.y - Math.sin(Raphael.rad(this.angle)) * d;
        if(this.pen) {
            this.drawTo(newx, newy);
        }
        this.x = newx;
        this.y = newy;
        this.updateTurtle();
    };
    Turtle.prototype.right = function (ang) {
        this.angle -= ang;
        this.updateTurtle();
    };
    Turtle.prototype.left = function (ang) {
        this.angle += ang;
        this.updateTurtle();
    };

    Turtle.prototype.penup = function () {
        this.pen = false;
    };

    Turtle.prototype.pendown = function () {
        this.pen = true;
    };

    Turtle.prototype.color = function (colourName) {
    };

    Turtle.prototype.home = function () {
        this.x = this.originx;
        this.y = this.originy;
        this.angle = 90;
        this.updateTurtle();
    };

    var myTurtle = new Turtle('turtleCanvas');

    // In a function to avoid people destructively updating it
    var getBasicEnvironment = function() {

        var init_env = { };
        add_binding(init_env, 'forward', function(d) { 
            myTurtle.forward(d);
        });
        add_binding(init_env, 'right', function(a) {
            myTurtle.right(a);
        });
        add_binding(init_env, 'left', function(a) {
            myTurtle.left(a);
        });
        add_binding(init_env, 'penup', function() {
            myTurtle.penup();
        });
        add_binding(init_env, 'pendown', function() {
            myTurtle.pendown();
        });

        return init_env;
    }

    $(document).ready(function(){

        $('#run').click(function(event){
            event.preventDefault();
            myTurtle.clear();
            $('#output').text('');
            try {
                var parsed = TORTOISE.parse($('#editor').val());
                var result = evalStatements(parsed, getBasicEnvironment());
            }
            catch (e) {
                $('#output').text(e.message);
            }
        });

         

    });
})(jQuery);
