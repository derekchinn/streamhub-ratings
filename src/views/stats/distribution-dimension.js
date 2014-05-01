define([
    'streamhub-sdk/view',
    'inherits',
    'hgn!streamhub-ratings/templates/stats/distribution-dimension'],
function (View, inherits, SimpleDistributionDimentionTemplate) {
    "use strict";

    var DistributionDimension = function(name, state) {
        View.call(this);
        state = state || {};

        this.name = name || "";
        this.average = state.average;
        this.distribution = state.distribution;
        this.numQuantiles = this.distribution.length;
    };
    inherits(DistributionDimension, View);

    DistributionDimension.prototype.elClass = 'streamhub-rating-dimensions';
    DistributionDimension.prototype.template = SimpleDistributionDimentionTemplate;

    DistributionDimension.prototype.setElement = function (element) {
        View.prototype.setElement.apply(this, arguments);
        this.$el.addClass(this.elClass);

        var self = this;
        this.$el.on('click', function () {
            self.$el.trigger('focusDimension.hub', self);
        });
    };

    DistributionDimension.prototype.render = function () {
        if (typeof this.template === 'function') {
            this.$el.html(this.template(this));
        }
    };

    return DistributionDimension;
});
