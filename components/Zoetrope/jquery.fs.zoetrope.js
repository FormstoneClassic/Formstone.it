/* 
 * Zoetrope v3.0.4 - 2014-03-14 
 * A requestAnimationFrame polyfill and jQuery Animation shim. Part of the Formstone Library. 
 * http://formstone.it/zoetrope/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

/*
 * Request Animation Frame Polyfill originally by Paul Irish <https://gist.github.com/paulirish/1579671>
 */
;(function(window) {
	"use strict";

	var time = 0,
		vendors = ['webkit', 'moz'];

	for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
		window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
	}

	window.nativeRAF = (typeof window.requestAnimationFrame !== "undefined");

	if (!window.nativeRAF) {
		window.requestAnimationFrame = function(callback, element) {
			var now = new Date().getTime(),
				diff = Math.max(0, 16 - (now - time)),
				id = window.setTimeout(function() {
					callback(now + diff);
				}, diff);

			time = now + diff;

			return id;
		};

		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
})(this);

/*
 * jQuery Animation Shim originally by Corey Frang <https://github.com/gnarf37/jquery-requestAnimationFrame>
 */
;(function($, window) {
	"use strict";

	var animating = false;

	function raf() {
		if (animating) {
			window.requestAnimationFrame(raf);
			jQuery.fx.tick();
		}
	}

	if (!window.nativeRAF) {
		$.fx.timer = function( timer ) {
			if (timer() && $.timers.push(timer) && !animating) {
				animating = true;
				raf();
			}
		};

		$.fx.stop = function() {
			animating = false;
		};
	}
})(jQuery, this);