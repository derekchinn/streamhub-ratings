define([
    "streamhub-sdk/jquery",
    "inherits",
    "stream/readable",
    "streamhub-ratings/clients/stats/distribution-client",
    "streamhub-ratings/views/stats/distribution-dimension"],
function ($, inherits, ReadableStream, DistributionClient, DimensionView) {
    "use strict";

    var DistributionStream = function (opts) {
        opts = opts || {};

        this._opts = opts;
        this._network = opts.network;
        this._siteId = opts.siteId;
        this._articleId = opts.articleId;
        this._numQuantiles = opts.numQuantiles;

        this._client = new DistributionClient(opts);
        this._madeRequest = false;

        ReadableStream.call(this, opts);
    };
    inherits(DistributionStream, ReadableStream);

    DistributionStream.prototype._read = function () {
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

    DistributionStream.prototype._toDimensions = function (obj) {
        var dimensionsArray = [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                dimensionsArray.push(new DimensionView(key, obj[key]));
            }
        }

        return dimensionsArray;
    };

    return DistributionStream;
});