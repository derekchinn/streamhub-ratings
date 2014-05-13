define([
    'streamhub-sdk/view',
    'inherits',
    'hgn!streamhub-ratings/templates/stats/dimension'],
function (View, inherits, SimpleDimensionTemplate) {
    "use strict";

    var DimensionView = function(opts) {
        View.call(this, opts);
        opts = opts || {};
        opts.state = opts.state || {}

        this.name = opts.name || "";
        this.average = opts.state.average;
        this.distribution = opts.state.distribution;
        this.numQuantiles = this.distribution.length;
    };
    inherits(DimensionView, View);

    DimensionView.prototype.elClass = "ratings-dimension";
    DimensionView.prototype.template = SimpleDimensionTemplate;

    DimensionView.prototype.setElement = function (element) {
        View.prototype.setElement.apply(this, arguments);
        this.$el.addClass(this.elClass);

        var self = this;
        this.$el.on('click', function () {
            self.$el.trigger('focusDimension.hub', {view: self});
        });
    };

    return DimensionView;
});
