define([
    'streamhub-sdk/jquery',
    'inherits',
    'streamhub-ratings/clients/bootstrap-client',
    'stream/readable'],
function ($, inherits, RatingBootstrapClient, ReadableStream) {
    'use strict';

    /**
     * Rating results stream. This will fetch the results of a ratings
     * collection and display it.
     * @constructor
     * @extends {ReadableStream}
     * @param {Object} opts Config options.
     */
    var RatingResultsStream = function (opts) {
        opts = opts || {};

        /**
         * The client for fetching data.
         * @type {LivefyreHttpClient}
         * @private
         */
        this._client = opts.client || new RatingBootstrapClient(opts);

        /**
         * Whether the single results request has been made yet.
         * @type {boolean}
         * @private
         */
        this._madeRequest = false;

        /**
         * Config options.
         * @type {Object}
         * @private
         */
        this._opts = opts;

        ReadableStream.call(this, opts);
    };
    inherits(RatingResultsStream, ReadableStream);

    /**
     * Build an array of views out of the provided data.
     * @param {Object} data The dimension data to build views out of.
     * @param {function(new: View)} ViewCtor Constructor for the views.
     * @return {Array.<View>} Array of dimension views.
     * @private
     */
    RatingResultsStream.prototype._buildDimensionViews = function (data) {
        var dimensionsArray = [];
        $.each(data, $.proxy(function (key, state) {
            dimensionsArray.push(new this._opts.resultsView({
                name: key,
                state: state,
                options: this._opts.options,
                selectedOption: this._opts.selectedOption,
                initialState: this._opts.initialState
            }));
        }, this));
        return dimensionsArray;
    };

    /**
     * Handle the get content response. Build the dimension views and send them
     * along in the stream.
     * @param {?string} err Error message if request failed.
     * @param {Object} resp Response data.
     * @private
     */
    RatingResultsStream.prototype._handleContentResponse = function (err, resp) {
        if (err) {
            return this.emit('error', err);
        }
        this._madeRequest = true;

        var dimensions = this._buildDimensionViews(resp.data);
        if (!dimensions.length) {
            return this.push(null);
        }
        this.push.apply(this, dimensions);
        this._opts.$antenna.trigger('results.loaded');
    };

    /** @override */
    RatingResultsStream.prototype._read = function () {
        // If results have already been fetched, don't do anything.
        if (this._madeRequest) {
            return this.push(null);
        }
        var callback = $.proxy(this._handleContentResponse, this);
        this._client.getContent(this._opts, callback);
    };

    return RatingResultsStream;
});
