"use strict"
var MODULE_NAME = "AuthController"
var logger = require("log4js").getLogger(MODULE_NAME)
var authService = require("../services/authService")

module.exports.login = function * () {
	try {
		logger.debug("Login request username=" + this.request.body.username)
		yield authService.login(this.request.body.username, this.request.body.password, this.session)
		this.status = 200
	} catch (err) {
		if (err.type && err.type === "no") {
			logger.warn("Server refused the auth attempt of user#" + this.request.body.username)
			this.status = 401
			this.body = "Bad username or password"
		} else {
			throw err
		}
	}
}

module.exports.logout = function * () {
	if (this.session) {
		logger.debug("Cleaning user session")
		this.session = null
	}
	this.status = 200
}

module.exports.authRequired = function * (next) {
	if (!this.session.username || !this.session.password) {
		logger.warn("User is not authenticated")
		this.status = 401
		this.body = "User must be authenticated"
		return
	}

	logger.debug("The user is authenticated. Handeling request")
	yield next
}
