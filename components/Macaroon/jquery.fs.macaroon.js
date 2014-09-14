/* 
 * Macaroon v3.0.6 - 2014-09-13 
 * A jQuery plugin for simple access to browser cookies. Part of the Formstone Library. 
 * http://formstone.it/macaroon/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	/**
	 * @options
	 * @param domain [string] "Cookie domain"
	 * @param expires [int] <604800000> "Time until cookie expires"
	 * @param path [string] "Cookie path"
	 */
	var options = {
		domain: null,
		expires: (7 * 24 * 60 * 60 * 1000), // 604800000 = 7 days
		path: null
	};

	/**
	 * @method
	 * @name create
	 * @description Creates a cookie
	 * @param key [string] "Cookie key"
	 * @param value [string] "Cookie value"
	 * @param opts [object] "Options object"
	 * @example $.macaroon(key, value, options);
	 */
	function _create(key, value, opts) {
		var date = new Date();

		opts = $.extend({}, options, opts);
		if (opts.expires || typeof opts.expires === "number") {
			date.setTime(date.getTime() + opts.expires);
		}

		var expires = (opts.expires || typeof opts.expires === "number") ? "; expires=" + date.toGMTString() : "",
			path = (opts.path) ? "; path=" + opts.path : "",
			domain = (opts.domain) ? "; domain=" + opts.domain : "";

		document.cookie = key + "=" + value + expires + domain + path;
	}

	/**
	 * @method
	 * @name read
	 * @description Returns a cookie's value, or null
	 * @param key [string] "Cookie key"
	 * @return [string | null] "Cookie's value, or null"
	 * @example var value = $.macaroon(key);
	 */
	function _read(key) {
		var keyString = key + "=",
			cookies = document.cookie.split(';');

		for(var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i];
			while (cookie.charAt(0) === ' ') {
				cookie = cookie.substring(1, cookie.length);
			}
			if (cookie.indexOf(keyString) === 0) {
				return cookie.substring(keyString.length, cookie.length);
			}
		}

		return null;
	}

	/**
	 * @method
	 * @name erase
	 * @description Deletes a cookie
	 * @param key [string] "Cookie key"
	 * @example $.macaroon(key, null);
	 */
	function _erase(key) {
		_create(key, "FALSE", { expires: -(7 * 24 * 60 * 60 * 1000) });
	}

	/**
	 * @method
	 * @name defaults
	 * @description Sets default plugin options
	 * @param opts [object] <{}> "Options object"
	 * @example $.macaroon(opts);
	 */

	$.macaroon = function(key, value, opts) {
		// Set defaults
		if (typeof key === "object") {
			options = $.extend(options, key);
			return null;
		} else {
			opts = $.extend({}, options, opts);
		}

		// Delegate intent
		if (typeof key !== "undefined") {
			if (typeof value !== "undefined") {
				if (value === null) {
					_erase(key);
				} else {
					_create(key, value, opts);
				}
			} else {
				return _read(key);
			}
		}
	};
})(jQuery, window);