define([
    'base64',
    'inherits',
    'streamhub-sdk/collection/clients/http-client'],
function (base64, inherits, LivefyreHttpClient) {
    'use strict';

    /**
     * Rating bootstrap client.
     * @constructor
     * @extends {LivefyreHttpClient}
     * @param {Object} opts Config options.
     */
    var RatingBootstrapClient = function (opts) {
        opts = opts || {};
        opts.serviceName = 'bootstrap';
        LivefyreHttpClient.call(this, opts);
    };
    inherits(RatingBootstrapClient, LivefyreHttpClient);

    /**
     * Get content for a rating collection. 
     * @param {Object} opts Request options.
     * @param {function()=} opt_callback Optional callback function.
     */
    RatingBootstrapClient.prototype.getContent = function (opts, opt_callback) {
        var callback = opt_callback || function () {};
        var data = {
            numQuantiles: Math.min(opts.numQuantiles || 5, 100)
        };
        var url = [
            this._getUrlBase(opts),
            '/api/v3.0/site/',
            opts.siteId,
            '/article/',
            base64.btoa(opts.articleId.toString()),
            '/stats.ratings.distributions/'
        ].join('');

        this._request({
            method: 'GET',
            url: url,
            dataType: 'json',
            data: data
        }, callback);
    };

    /**
     * Get the posted status for the current user. This checks to see if the
     * user has already posted on this collection, since users are only allowed
     * to post once.
     * @param {Object} opts Request options.
     * @param {function()=} opt_callback Optional callback function.
     */
    RatingBootstrapClient.prototype.getPostedStatus = function (opts, opt_callback) {
        var callback = opt_callback || function () {};
        var data = {
            lftoken: opts.token
        };
        var url = [
            this._getUrlBase(opts),
            '/api/v3.0/collection/',
            opts.collectionId,
            '/posted/rating/'
        ].join('');

        this._request({
            method: 'GET',
            url: url,
            dataType: 'json',
            data: data
        }, callback);
    };

    return RatingBootstrapClient;
});
