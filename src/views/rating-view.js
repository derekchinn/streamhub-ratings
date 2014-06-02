define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'inherits',
    'streamhub-ratings/events',
    'streamhub-ratings/util'],
function ($, View, inherits, events, util) {
    'use strict';

    /**
     * Dimension view.
     * @constructor
     * @extends {View}
     * @param {Object} opts Config options.
     */
    var RatingView = function(opts) {
        View.call(this, opts);

        /**
         * User selected option.
         * @type {number=}
         * @private
         */
        this._selected = opts.selectedOption;

        /**
         * The size attribute that will be used when setting sizing.
         * @type {string}
         * @private
         */
        this._sizeAttribute = this.opts.sizeAttribute || 'width';

        /**
         * The current state of the view. This is an array of percentages for
         * each option.
         * @type {Array.<option>}
         * @private
         */
        this._state = [];
    };
    inherits(RatingView, View);

    /** @enum {string} */
    var CLASSES = {
        CHECK_MARK: 'fyre-check',
        PERCENTAGE: 'fyre-percentage',
        SELECTED: 'fyre-selected'
    };

    /** @const {number} */
    RatingView.DELAY_MODIFIER = 100;

    /** @const {number} */
    RatingView.NORMAL_DURATION = 300;

    /** @const {number} */
    RatingView.SELECTED_DURATION = 600;

    /**
     * Animate an element.
     * @param {jQuery.Element} $elem The element to animate.
     * @param {Object} opts The config options for the animation.
     * @param {number} duration The duration of the animation.
     * @param {number=} opt_delay Optional delay value.
     * @private
     */
    RatingView.prototype._animate = function ($elem, opts, duration, opt_delay) {
        return $elem.delay(opt_delay || 0).animate(opts, duration).promise();
    };

    /**
     * Animate the view from it's original state to it's new state.
     * @param {Object} newState The new state to animate to.
     * @private
     */
    RatingView.prototype.animateToState = function (newState) {
        var promises = [];
        this.animateToStateInternal(newState, promises);

        $.when.apply($, promises).done($.proxy(function () {
            this.$el.trigger(events.TRANSITION_COMPLETE);
        }, this));
    };

    /**
     * Internal function to override with actual functionality.
     * @param {Object} newState The new state to animate to.
     * @param {Array} promises Array to hold animation promises.
     */
    RatingView.prototype.animateToStateInternal = util.abstractMethod;

    /**
     * Get the state of the current view. This returns an array of option
     * percentages for all options in the view.
     * @return {Array.<number>}
     */
    RatingView.prototype.getState = function () {
        return this._state;
    };

    /**
     * Hide the view.
     */
    RatingView.prototype.hide = function () {
        this.$el.hide();
    };

    /**
     * Set the initial state of the view.
     * @param {Array.<Object>} state The state to set.
     */
    RatingView.prototype.setInitialState = function (state) {
        var attr = this._sizeAttribute;
        $('.' + CLASSES.PERCENTAGE, this.$el).each(function (idx, elem) {
            $(elem).css(attr, (state[idx] || 0) + '%');
        });
    };

    /**
     * Sets the selected dimension.
     * @param {number} dimension The dimension that is selected.
     */
    RatingView.prototype.setSelected = function (dimension) {

        // TODO: What happens when the view is already loaded and a user selects
        // something? Will it update the list to show the selected one?

        this.$el.find('.' + CLASSES.SELECTED).removeClass(CLASSES.SELECTED);
        var $dimensionEl = this.$el.find('ul > li:eq(' + dimension + ')');
        $dimensionEl.addClass(CLASSES.SELECTED);
        this._selected = dimension;

        var selectedEl = document.createElement('label');
        selectedEl.className = CLASSES.CHECK_MARK;
        $dimensionEl.append(selectedEl);
    };

    /**
     * Show the view.
     */
    RatingView.prototype.show = function () {
        this.$el.show();
    };

    /**
     * Transition from the provided state. This animates from the state
     * provided to the actual state of the view. This allows us to have multiple
     * views that look similar but transition between them.
     * @param {Array.<Object>} state Option transition values.
     */
    RatingView.prototype.transitionFromState = function (state) {
        var currentState = this.getState();
        this.setInitialState(state);
        this.show();
        this.animateToState(currentState);
    };

    return RatingView;
});
