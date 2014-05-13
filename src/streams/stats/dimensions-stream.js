define([
    "streamhub-sdk/jquery",
    "inherits",
    "stream/readable",
    "streamhub-ratings/clients/stats/dimensions-client",
    "streamhub-ratings/views/stats/dimension-view"],
function ($, inherits, ReadableStream, DimensionsClient, DimensionView) {
    "use strict";

    var DimensionsStream = function (opts) {
        opts = opts || {};

        this._opts = opts;
        this._network = opts.network;
        this._siteId = opts.siteId;
        this._articleId = opts.articleId;
        this._numQuantiles = opts.numQuantiles;

        this._client = opts.client || new DimensionsClient(opts);
        this._dimensionView = opts.dimensionView || DimensionView;
        this._madeRequest = false;

        ReadableStream.call(this, opts);
    };
    inherits(DimensionsStream, ReadableStream);

    DimensionsStream.prototype._read = function () {
        if (this._madeRequest) {
            return this.push(null);
        }

        var self = this;
        this._client.getContent(this._opts, function (err, data) {
            if (err) {
                return self.emit('error', err);
            }

            self._madeRequest = true;

            var dimensions = self._toDimensions(data.data);
            if (!dimensions.length) {
                return self.push(null)
            }

            self.push.apply(self, dimensions);
        });
    };

    DimensionsStream.prototype._toDimensions = function (obj) {
        var dimensionsArray = [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                dimensionsArray.push(new this._dimensionView({name: key, state: obj[key]}));
            }
        }

        return dimensionsArray;
    };

    return DimensionsStream;
});