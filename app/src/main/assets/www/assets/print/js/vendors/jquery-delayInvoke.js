

(function ($) {

    $.extend({

        delayInvoke: function (func, delay) {
            var timeout;

            return function () {

                var args = arguments;

                clearTimeout(timeout);

                timeout = setTimeout(function () {
                    func.apply(this, args);
                    timeout = null;
                }, delay);

            };

        }
    });

})(jQuery);