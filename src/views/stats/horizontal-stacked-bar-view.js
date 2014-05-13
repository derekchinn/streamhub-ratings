define([
    "streamhub-sdk/jquery",
    "inherits",
    "streamhub-ratings/views/stats/dimension-view",
    "streamhub-metrics",
    "hgn!streamhub-ratings/templates/stats/quantile-metric",
    "hgn!streamhub-ratings/templates/stats/horizontal-stacked-bar"],
function ($, inherits, DimensionView, Metric, QuantileMetricTemplate, HorizontalStackedBarTemplate) {
    "use strict";

    var HorizontalStackedBarView = function(opts) {
        DimensionView.call(this, opts);
    };
    inherits(HorizontalStackedBarView, DimensionView);

    HorizontalStackedBarView.prototype.template = HorizontalStackedBarTemplate;
    HorizontalStackedBarView.prototype.distributionElSelector = ".dimension-distribution";

    HorizontalStackedBarView.prototype.render = function () {
        DimensionView.prototype.render.call(this);

        // Convert the distribution to a metric array and add it to the
        // DOM node we're building up
        var $distributionEl = this.$el.find(this.distributionElSelector);
        var metrics = this._distributionToMetrics(true);
        var len = metrics.length;

        if (len) {
            for (var i = 0; i < len; i++) {
                var $el = $(QuantileMetricTemplate(metrics[i]));
                $el.css("width", metrics[i].getValue() + "%");
                $el.attr("title", metrics[i].getLabel() + ": " + metrics[i].getValue() + "%");
                $distributionEl.append($el);
            }
        }
    };

    HorizontalStackedBarView.prototype._distributionToMetrics = function(percentize) {
        var metrics = [];
        var sumTotal = 0;

        if (percentize) {
            for (var i = 0; i < this.numQuantiles; i++) {
                sumTotal += this.distribution[i];
            } 
        }

        var label;
        var value;
        for (var i = 0; i < this.numQuantiles; i++) {
            label = i + 1;
            value = percentize ? Math.floor(this.distribution[i] / sumTotal * 10000) / 100 : this.distribution[i];
            metrics.push(new Metric({label: label, value: value}));
        }

        return metrics;
    };

    return HorizontalStackedBarView;
});
