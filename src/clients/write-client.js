define([
    'inherits',
    'streamhub-sdk/collection/clients/http-client'],
function (inherits, LivefyreHttpClient) {
    "use strict";

    /**
     * Rating write client.
     * @constructor
     * @extends {LivefyreHttpClient}
     * @param {Object} opts Config options.
     */
    var RatingWriteClient = function (opts) {
        opts = opts || {};
        opts.serviceName = 'quill';
        LivefyreHttpClient.call(this, opts);
    };
    inherits(RatingWriteClient, LivefyreHttpClient);

    /**
     * Post a dimension to the collection.
     * @param {Object} opts Request options.
     * @param {function()=} opt_callback Optional callback function.
     */
    RatingWriteClient.prototype.postRating = function (opts, opt_callback) {
        var callback = opt_callback || function () {};
        var data = {
            lftoken: opts.token,
            rating: JSON.stringify(opts.rating)
        };
        var url = [
            this._getUrlBase(opts),
            '/api/v3.0/collection/',
            opts.collectionId,
            '/post/rating/'
        ].join('');

        this._request({
            method: 'POST',
            url: url,
            dataType: 'json',
            data: data
        }, callback);
    };

    return RatingWriteClient;
});
