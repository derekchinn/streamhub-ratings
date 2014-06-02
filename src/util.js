define([], function () {

    /** @type {Object} */
    var util = {};

    /**
     * Method that must be overridden.
     */
    util.abstractMethod = function () {
        throw 'This method must be overridden';
    };

    /**
     * Function that doesn't do anything.
     */
    util.nullFunction = function () {};

    return util;
});
