"use strict";

/**
 * GET home page
 * @param req
 * @param res
 */
exports.index = function (req, res) {
    res.render('index.html', { user: req.user });
};

/**
 * Respond to partials
 * @param req
 * @param res
 */
exports.partial = function (req, res) {
    res.render('partials/' + req.params);
};

/**
 * GET login page
 * @param req
 * @param res
 */
exports.login = function (req, res) {
    res.render('login.html', { user: req.user });
};

/**
 * GET authentication page, explaining app's authentication requirements
 * @param req
 * @param res
 */
exports.authentication = function (req, res) {
    res.render('authentication.html', { user: req.user });
};
