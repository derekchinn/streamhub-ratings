define([
    "streamhub-sdk/jquery",
    "base64"],
function($, base64) {
    'use strict';

    var DistributionClient = function (opts) {
        opts = opts || {};
        this._version = opts.version || "v3.0";
        this._network = opts.network;
        this._siteId = opts.siteId;
        this._articleId = opts.articleId;
    };

    DistributionClient.prototype.getContent = function(opts, callback) {
        callback = callback || function() {};
        
        var numQuantiles = opts.numQuantiles || 5;
        numQuantiles = numQuantiles <= 100 ? numQuantiles : 100;

        var url = "http://bootstrap." + 
            this._network +
            "/api/" +
            this._version +
            "/site/" +
            this._siteId +
            "/article/" +
            this._articleId +
            // base64.btoa(this._articleId.toString()) +
            "/stats.ratings.distributions/";

        var params = {
            numQuantiles: numQuantiles
        };

        this._makeRequest(url, params, callback);
    };

    DistributionClient.prototype._makeRequest = function (url, params, callback) {
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            dataType: 'json',
            success: function(response, status, jqXhr) {
                callback(null, response);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    return DistributionClient;
});