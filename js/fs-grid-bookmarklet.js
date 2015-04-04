/*
 * Grid Overlay Bookmarklet <http://formstone.it/grid>
 * @author Ben Plum
 * @version 1.1.0
 *
 * Copyright 2013 Ben Plum <mr@benplum.co>
 */

function FSGridBookmarklet() {
	var $jq,
		OverlayObj,
		Overlay = function() {
			var _this = this,
				config = $jq.extend({
					onLoad: false,
					position: "top-right", // top-right, top-left, bottom-right, bottom-left
					useCookies: false
				}, window.FSGridBookmarkletConfig);

			if ($jq(".fs-grid").length < 1) {
				alert("Grid Not Found.\nYou'll need to include Grid before using this bookmarklet.\n\nLearn more: http://formstone.it/grid/");
			} else {
				var desktopCount = 12,
					tabletCount = 6,
					mobileCount = 3;

				if ($jq("#grid_styles").length < 1) {
					$jq("body").append('<link id="grid_styles" rel="stylesheet" href="http://formstone.it/css/fs-grid-bookmarklet.css" type="text/css" media="all">');
				}

				if ($jq("#grid_overlay").length < 1) {
					var html = '';

					html += '<menu id="grid_menu" class="' + config.position + '">';
					html += '<span class="grid_show grid_option">Show Grid</span>';
					html += '<span class="grid_icon grid_remove">Close</span>';
					html += '</menu>';
					html += '<section id="grid_overlay" class="">';
					html += '<div class="row">';
					for (var i = 0; i < desktopCount; i++) {
						html += '<div class="desktop-1 tablet-1 mobile-1"> <span> </span> </div>';
					}
					html += '</div>';
					html += '</section>';

					$jq("body").append(html);

					_this.$menu = $jq("#grid_menu");
					_this.$menuItems = _this.$menu.find("span");
					_this.$overlay = $jq("#grid_overlay");

					_this.$menu.on("click", ".grid_option", $jq.proxy(_this.onClick, _this))
							   .on("click", ".grid_remove", $jq.proxy(_this.remove, _this));

					if (config.onLoad || (config.useCookies === true && _this.readCookie("grid-active") === "true")) {
						_this.$menuItems.filter(".grid_show")
										.trigger("click");
					}
				}
			}
		};

	Overlay.prototype = {
		onClick: function(e) {
			var _this = this,
				$target = $jq(e.currentTarget);

			if ($target.hasClass("active") || $target.hasClass("remove")) {
				$target.removeClass("active")
					   .html("Show Grid");
				_this.$overlay.removeClass("visible");
				_this.eraseCookie("grid-active");
			} else {
				$target.addClass("active")
					   .html("Hide Grid");
				_this.$overlay.addClass("visible");
				_this.createCookie("grid-active", "true", 7);
			}
		},

		remove: function(e) {
			var _this = this;

			_this.$menu.remove();
			_this.$overlay.remove();
		},

		createCookie: function(key, value, expires) {
			var date = new Date(),
				path = "; path=/",
				domain = "; domain=" + document.domain;

			date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();

			document.cookie = key + "=" + value + expires + domain + path;
		},

		readCookie: function(key) {
			var keyString = key + "=",
				cookieArray = document.cookie.split(';');

			for (var i = 0; i < cookieArray.length; i++) {
				var cookie = cookieArray[i];

				while (cookie.charAt(0) === ' ') {
					cookie = cookie.substring(1, cookie.length);
				}

				if (cookie.indexOf(keyString) === 0) {
					return cookie.substring(keyString.length, cookie.length);
				}
			}

			return null;
		},

		eraseCookie: function(key) {
			this.createCookie(key, "", -1);
		}
	};

	function initOverlay() {
		OverlayObj = new Overlay();
	}

	function loadJQuery() {
		var jQ = document.createElement("script");

		jQ.id = "grid-jquery";
		jQ.src = "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
		jQ.onload = function() {
			$jq = jQuery.noConflict(true);
			initOverlay();
		};

		document.body.appendChild(jQ);
	}

	if (typeof jQuery === "undefined") {
		loadJQuery();
	} else {
		var version = jQuery.fn.jquery.split('.');

		if (parseInt(version[1], 10) < 7) {
			loadJQuery();
		} else {
			$jq = jQuery;
			initOverlay();
		}
	}
}

new FSGridBookmarklet();