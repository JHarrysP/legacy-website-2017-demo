$.fn.ticker = function( options ) {
    
    options = $.extend({
        uppercase: true,
        extra: '#/·',
        speed: 50
    }, options);
    
    var alph = 'ABCDEFGHIJKLMNÑOÓPQRSTUVXYZ';
    
    if ( !options.uppercase ) {
        alph = alph + alph.toLowerCase();
    }
    alph = '01101011011100'+alph + options.extra + ' ';
    
    return this.each(function() {
        var k = 1,
            elems = $(this).children(),
            arr = alph.split(''),
            len = 0,
            fill = function( a ) {
                while( a.length < len ) {
                    a.push(' ');
                }
                return a;
            },
            texts = $.map( elems, function( elem ) {
                var text = $(elem).text();
                len = Math.max(len, text.length);
                return options.uppercase ? text.toUpperCase() : text;
            }),
            target = $('<div>'),
            render = function(print) {
                target.data('prev', print.join(''));
                fill(print);
                print = $.map(print, function(p) {
                    return p == ' ' ? '&#160;' : p;
                });
                return target.html('<span>' + print.join('</span><span>') + '</span>');
            },
            attr = {}
        
        $.each(this.attributes, function(i, item) {
            target.attr( item.name, item.value );
        });

        $(this).replaceWith( render( texts[0].split('') ) );

        target.click(function(e) {

            
      
            var next = fill(texts[k].split('')),
                prev = fill(target.data('prev').split('')),
                print = prev;
            
            $.each(next, function(i) {
                if (next[i] == prev[i]) {
                    return;
                }
                var index = alph.indexOf( prev[i] ),
                    j = 0,
                    tid = window.setInterval(function() {
                        if ( next[i] != arr[index] ) {
                            index = index == alph.length-1 ? 0 : index + 1;
                        } else {
                            window.clearInterval(tid);
                        }
                        print[i] = alph[index];
                        render(print);
                }, options.speed)
            });
            k = k == texts.length-1 ? 0 : k + 1;
        });
      
    });
};
$('.binary').ticker();

function flipText() {
  $('.binary').click();
}
window.setInterval(flipText,7000);
