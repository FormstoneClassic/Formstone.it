/*
 * Gridlock Overlay Bookmarklet <http://formstone.it/gridlock>
 * @author Ben Plum
 * @version 1.0.0
 *
 * Copyright 2013 Ben Plum <mr@benplum.co>
 */

//javascript:(function(){if(typeof%20GridlockBookmarklet=='undefined'){document.body.appendChild(document.createElement('script')).src='http://formstone.it/js/gridlock.bookmarklet.js';}else{GridlockBookmarklet();}})();

function GridlockBookmarklet() {
	var $jq,
		OverlayObj,
		Overlay = function() {
			var _this = this,
				config = $jq.extend({
					onLoad: false,
					position: "top-right", // top-right, top-left, bottom-right, bottom-left
					useCookies: false
				}, window.GridlockBookmarkletConfig);

			if ($jq(".gridlock").length < 1) {
				alert("Gridlock Not Found.\nYou'll need to include Gridlock before using this bookmarklet.\n\nLearn more: http://www.benplum.com/projects/gridlock/");
			} else {
				var desktopCount = $jq(".gridlock").hasClass("gridlock-16") ? 16 : 12,
					mobileFirst = $jq(".gridlock").hasClass("gridlock-mf"),
					tabletCount = Math.ceil(desktopCount / 2);
					mobileCount = 3;

				if($jq("#gridlock_styles").length < 1) {
					$jq("body").append('<link id="gridlock_styles" rel="stylesheet" href="base_url/css/gridlock.bookmarklet.css" type="text/css" media="all">');
				}

				if ($jq("#gridlock_overlay").length < 1) {
					var _this = this,
						html = '';

					html += '<menu id="gridlock_menu" class="' + config.position + '">';
					html += '<span class="gridlock_show gridlock_option">Show Grid</span>';
					html += '<span class="gridlock_icon gridlock_remove">Close</span>';
					html += '</menu>';
					html += '<section id="gridlock_overlay" class="' + ((mobileFirst) ? "mobile-first" : "") + '">';
					html += '<div class="row">';
					for (var i = 0; i < desktopCount; i++) {
						html += '<div class="desktop-1 tablet-1 mobile-1"> <span> </span> </div>';
					}
					html += '</div>';
					html += '</section>';

					$jq("body").append(html);

					_this.$menu = $jq("#gridlock_menu");
					_this.$menuItems = _this.$menu.find("span");
					_this.$overlay = $jq("#gridlock_overlay");

					_this.$menu.on("click", ".gridlock_option", $jq.proxy(_this.onClick, _this))
							   .on("click", ".gridlock_remove", $jq.proxy(_this.remove, _this));

					if (config.onLoad || (config.useCookies === true && _this.readCookie("gridlock-active") == "true")) {
						_this.$menuItems.filter(".gridlock_show")
										.trigger("click");
					}
				}
			}
		};
	Overlay.prototype = {
		onClick: function(e) {
			var _this = this;
			var $target = $jq(e.currentTarget);

			if ($target.hasClass("active") || $target.hasClass("remove")) {
				$target.removeClass("active")
					   .html("Show Grid");
				_this.$overlay.removeClass("visible");
				_this.eraseCookie("gridlock-active");
			} else {
				$target.addClass("active")
					   .html("Hide Grid");
				_this.$overlay.addClass("visible");
				_this.createCookie("gridlock-active", "true", 7);
			}
		},
		remove: function(e) {
			var _this = this;

			_this.$menu.remove();
			_this.$overlay.remove();
		},
		createCookie: function(key, value, expires) {
			var date = new Date();
			date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
			var path = "; path=/"
			var domain = "; domain=" + document.domain;
			document.cookie = key + "=" + value + expires + domain + path;
		},
		readCookie: function(key) {
			var keyString = key + "=";
			var cookieArray = document.cookie.split(';');
			for(var i = 0; i < cookieArray.length; i++) {
				var cookie = cookieArray[i];
				while (cookie.charAt(0) == ' ') {
					cookie = cookie.substring(1, cookie.length);
				}
				if (cookie.indexOf(keyString) == 0) return cookie.substring(keyString.length, cookie.length);
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
		jQ.id = "gridlock-jquery";
		jQ.src = "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
		jQ.onload = function() {
			$jq = jQuery.noConflict(true);
			initOverlay();
		};
		document.body.appendChild(jQ);
	}

	if (typeof jQuery == "undefined") {
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
GridlockBookmarklet();