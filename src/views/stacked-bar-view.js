define([
    'streamhub-sdk/jquery',
    'inherits',
    'streamhub-metrics',
    'streamhub-ratings/views/rating-view',
    'hgn!streamhub-ratings/templates/quantile-metric',
    'hgn!streamhub-ratings/templates/stacked-bar'],
function ($, inherits, Metric, RatingView, quantileMetricTemplate, stackedBarTemplate) {
    'use strict';

    /**
     * Horizontal stacked bar view. This displays a list of options stacked
     * vertically, with each of their widths being a percentage of the total
     * number of results.
     * @constructor
     * @extends {RatingView}
     * @param {Object} opts Config options.
     */
    var StackedBarView = function (opts) {
        RatingView.call(this, opts);
        this.opts.state = this.opts.state || {};

        /**
         * The distribution of ratings between the quantiles.
         * @type {Array.<number>}
         * @private
         */
        this._distribution = this.opts.state.distribution;

        /**
         * The number of quantiles to show.
         * @type {number}
         * @private
         */
        this._numQuantiles = Math.min(this.opts.numQuantiles || this.opts.options.length);
    };
    inherits(StackedBarView, RatingView);

    /** @enum {string} */
    var CLASSES = {
        DISTRIBUTION: 'fyre-rating-distribution',
        MAIN: 'fyre-rating-results',
        PERCENTAGE: 'fyre-percentage',
        PERCENTAGE_LABEL: 'fyre-percentage-label'
    };

    /** @override */
    StackedBarView.prototype.elClass = CLASSES.MAIN;

    /** @override */
    StackedBarView.prototype.template = stackedBarTemplate;

    StackedBarView.prototype._distributionToMetrics = function (percentize) {
        var metrics = [];
        var sumTotal = 0;
        var idx = 0;

        if (percentize) {
            for (idx = 0; idx < this._numQuantiles; idx++) {
                sumTotal += this._distribution[idx];
            }
        }

        var label;
        var value;

        function percentizeValue(num, sumTotal) {
            if (sumTotal === 0 || num === 0) {
                return 0;
            }
            return Math.floor(value / sumTotal * 1000) / 10;
        }

        for (idx = 0; idx < this._numQuantiles; idx++) {
            value = this._distribution[idx];
            if (percentize) {
                value = percentizeValue(value, sumTotal);
            }
            metrics.push({
                text: this.opts.options[idx].text,
                value: value
            });
            this._state[idx] = value;
        }

        return metrics;
    };

    /** @override */
    StackedBarView.prototype.animateToStateInternal = function (newState, promises) {
        var delay;
        var $elems = $('.' + CLASSES.PERCENTAGE, this.$el);
        var $label;
        var opts;
        var self = this;
        var val;

        /**
         * Animate the option percentage and percentage label elements.
         * @param {jQuery.Element} $elem The element to render.
         * @param {string} val The percentage value.
         * @param {number} duration The duration of the animation.
         * @param {number=} opt_delay Animation delay.
         */
        function animateElement($elem, val, duration, opt_delay) {
            delay = opt_delay || 0;
            opts = {};
            opts[self._sizeAttribute] = val;
            promises.push(self._animate($elem, opts, duration, delay));

            $label = $elem.siblings('.' + CLASSES.PERCENTAGE_LABEL);
            promises.push(self._animate($label, {'marginRight': '20px'}, duration, delay));
        }

        // Animate the selected element first.
        if ($.isNumeric(this._selected)) {
            var $selected = $($elems.eq(this._selected));
            val = (newState[this._selected] || 0) + '%';
            animateElement($selected, val, RatingView.SELECTED_DURATION, 0);
        }

        // Animate the rest of the options in order and add delays for each
        // one, increasing in time for each one.
        $elems.each($.proxy(function (idx, elem) {
            if (this._selected === idx) {
                return;
            }
            val = (newState[idx] || 0) + '%';
            if (idx > this._selected) {
                idx--;
            }
            delay = Math.min(RatingView.DELAY_MODIFIER * idx, 400);
            animateElement($(elem), val, RatingView.NORMAL_DURATION, delay);
        }, this));
    };

    /** @override */
    StackedBarView.prototype.render = function () {
        RatingView.prototype.render.call(this);

        // Convert the distribution to a metric array and add it to the
        // DOM node we're building up
        var $distributionEl = this.$el.find('.' + CLASSES.DISTRIBUTION);
        var metrics = this._distributionToMetrics(true);
        var state = [];

        for (var i = 0; i < this._numQuantiles; i++) {
            var $el = $(quantileMetricTemplate(metrics[i]));
            $distributionEl.append($el);
        }

        if (this.opts.initialState) {
            this.transitionFromState(this.opts.initialState);
        } else {
            this.animateToState(this._state);
        }

        if (this.opts.selectedOption === undefined) {
            return;
        }
        this.setSelected(this.opts.selectedOption);
    };

    /** @override */
    StackedBarView.prototype.setSelected = function (dimension, opt_inc) {
        RatingView.prototype.setSelected.call(this, dimension);
        !!opt_inc && this._state[dimension]++;
    };

    /** @override */
    StackedBarView.prototype.transitionFromState = function (state) {
        $('.' + CLASSES.PERCENTAGE_LABEL).attr('style', '');
        RatingView.prototype.transitionFromState.call(this, state);
    };

    return StackedBarView;
});
