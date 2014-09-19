<?php

/** !Core */
$config['site_title'] = "Formstone";
$config['theme'] = "formstone";
$config['base_url'] = "http://formstone.it";


/** !Redirect Plugin */
include "config.redirects.php";


/** !Cache Plugin */
$config["nano_cache"] = array(
	"enabled" => true
	//"time" => 604800
);


/** !Header Plugin */
// $settings["nano_headers"] = array();
// $CSP = "connect-src 'none'; font-src 'self'; frame-src 'self' https://www.googletagmanager.com; img-src 'self'; media-src 'self'; object-src 'self'; script-src 'self' http://www.googletagmanager.com https://www.google-analytics.com; style-src 'self';";
/*
X-Permitted-Cross-Domain-Policies: master-only
Content-Security-Policy: script-src 'self' https://translate.googleapis.com http://www.google.com https://www.google.com https://syndication.twimg.com https://syndication.twitter.com https://p.twitter.com https://cdn.api.twitter.com https://platform.twitter.com https://cdn.syndication.twimg.com https://www.twitter.com https://twitter.com https://ssl.google-analytics.com https://www.google-analytics.com; frame-src https://www.youtube.com https://platform.twitter.com https://twitter.com https://accounts.google.com https://docs.google.com https://www.google.com http://www.google.com; object-src 'self' http://www.google.com https://ssl.google-analytics.com; font-src https://themes.googleusercontent.com https://fonts.googleapis.com 'self'; img-src 'self' https://si0.twimg.com https://platform.twitter.com https://www.twitter.com https://si0.twimg.com/ https://o.twimg.com https://pbs.twimg.com https://www.google-analytics.com data:
*/


/** !Placeholder Plugin */
$config["nano_placeholder"] = array(
	"default" => array(
		"background_color" => "CCCCCC",
		"text_color" => "666666",
		//"image" => false,
		//"text" => "Placeholder"
	),
	"custom" => array(
		"background_color" => "222222",
		"text_color" => "666666",
		//"image" => false,
		"text" => "Placeholder"
	)
);


/** !Resources Plugin */
include "config.resources.php";

?>