define([
    'streamhub-sdk/jquery',
    'inherits',
    'streamhub-ratings/views/rating-view',
    'streamhub-ratings/events',
    'hgn!streamhub-ratings/templates/quantile-metric',
    'hgn!streamhub-ratings/templates/rating-selection'],
function (
    $,
    inherits,
    RatingView,
    events,
    quantileMetricTemplate,
    ratingSelectionTemplate) {

    'use strict';

    /**
     * View for selecting ratings.
     * @constructor
     * @extends {RatingView}
     * @param {Object} opts Config options.
     */
    var RatingSelectionView = function (opts) {
        RatingView.call(this, opts);
        opts = this.opts;

        /**
         * The options to select from.
         * @type {Array.<Object>}
         * @private
         */
        this._options = $.map(opts.options, function (item, idx) {
            item.value = idx;
            item.selected = idx === opts.selectedOption;
            return item;
        });

        /**
         * The template use to render this view.
         * @type {function()}
         */
        this.template = opts.template || ratingSelectionTemplate;
    };
    inherits(RatingSelectionView, RatingView);

    /** @enum {string} */
    var CLASSES = {
        MAIN: 'fyre-dimension-poll',
        OPTION: 'fyre-option',
        PERCENTAGE: 'fyre-percentage',
        PERCENTAGE_LABEL: 'fyre-percentage-label',
        SELECTED: 'fyre-selected'
    };

    /**
     * Duration for animating the percentage and label.
     * @const {number}
     */
    var DURATION = 400;

    /** @override */
    RatingSelectionView.prototype.elClass = CLASSES.MAIN;

    /** @override */
    RatingSelectionView.prototype.events = (function () {
        var events = {};
        events['click .' + CLASSES.OPTION] = '_handleClick';
        return events;
    })();

    /**
     * Handle the rating click event.
     * @param {jQuery.Event} ev The click event.
     * @private
     */
    RatingSelectionView.prototype._handleClick = function (ev) {
        var selectedOption = $(ev.target).closest('li');
        var selectedValue = parseInt(selectedOption.data('value'), 10);
        this.$el.trigger(events.RATING_SELECTED, {
            text: selectedOption.find('.' + CLASSES.OPTION).html(),
            value: selectedValue
        });
    };

    /** @override */
    RatingSelectionView.prototype.animateToStateInternal = function (newState, promises) {
        var attr = this._sizeAttribute;
        var delay;
        var $elem;
        var $label;
        var opts;
        var self = this;

        $('.' + CLASSES.PERCENTAGE, this.$el).each(function (idx, elem) {
            $elem = $(elem);
            opts = {};
            opts[attr] = (newState[idx] || 0) + '%';
            promises.push(self._animate($elem, opts, DURATION, 0));

            delay = RatingView.DELAY_MODIFIER * idx;
            $label = $elem.siblings('.' + CLASSES.PERCENTAGE_LABEL);
            $label.css({'marginRight': '20px'});
            promises.push(self._animate($label, {'marginRight': '-100px'}, DURATION, delay));
        });
    };

    /** @override */
    RatingSelectionView.prototype.getState = function () {
        var state = new Array(this._options.length);
        if (this._selected !== undefined) {
            state[this._selected] = 100;
        }
        return state;
    };

    /** @override */
    RatingSelectionView.prototype.getTemplateContext = function () {
        return {
            hideHeader: this.opts.hideHeader || false,
            media: this.opts.media,
            options: this._options,
            question: this.opts.question,
            title: this.opts.title
        };
    };

    /** @override */
    RatingSelectionView.prototype.render = function () {
        RatingView.prototype.render.call(this);
        // Render option templates and add to list.
        var $listEl = this.$el.find('ul');
        for (var i = 0, len = this._options.length; i < len; i++) {
            $listEl.append($(quantileMetricTemplate(this._options[i])));
        }

        if (this.opts.selectedOption === undefined) {
            return;
        }
        this.setSelected(this.opts.selectedOption);
    };

    /** @override */
    RatingSelectionView.prototype.setInitialState = function (state) {
        RatingView.prototype.setInitialState.call(this, state);
        $('.' + CLASSES.PERCENTAGE_LABEL, this.$el).each(function (idx, elem) {
            $(elem).html((state[idx] || 0) + '%');
        });
    };

    /** @override */
    RatingSelectionView.prototype.setSelected = function (dimension) {
        RatingView.prototype.setSelected.call(this, dimension);
        this._options[dimension].selected = true;
        this._selected = dimension;
    };

    return RatingSelectionView;
});
