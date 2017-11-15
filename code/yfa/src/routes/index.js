"use strict";

/**
 * GET home page
 * @param req
 * @param res
 */
exports.index = function (req, res) {
    res.render('index.html');
};

/**
 * Respond to partials
 * @param req
 * @param res
 */
exports.partial = function (req, res) {
    res.render('partials/' + req.params);
};
