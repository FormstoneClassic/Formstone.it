<?php

/** !Core */
$config['site_title'] = "Formstone";
$config['theme'] = "formstone";
//$config['base_url'] = "http://formstone.it";


/** !Redirect Plugin */
$config["nano_navigation"]["redirects"] = array(
	"boxer" 		=> "components/boxer",
	"gridlock" 		=> "components/gridlock",
	"macaroon" 		=> "components/macaroon",
	"mimeo" 		=> "components/mimeo",
	"naver"			=> "components/naver",
	"pager"		=> "components/pager",
	"picker"		=> "components/picker",
	"pronto"		=> "components/pronto",
	"ranger"		=> "components/ranger",
	"roller"		=> "components/roller",
	"rubberband"	=> "components/rubberband",
	"scroller"		=> "components/scroller",
	"selecter"		=> "components/selecter",
	"shifter"		=> "components/shifter",
	"sizer"			=> "components/sizer",
	"stepper"		=> "components/stepper",
	"tabber"		=> "components/tabber",
	"tipper"		=> "components/tipper",
	"wallpaper"		=> "components/wallpaper",
	"zoetrope"		=> "components/zoetrope",
	"zoomer"		=> "components/zoomer"
);


/** !Cache Plugin */
$config["nano_cache"] = array(
	"enabled" => false
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
$config["nano_resources"] = array(
	"debug" => true,
	"css" => array(
		"files" => array(
			"site" => array(
				/* "../../components/Sprout/sprout.css", */
				"../../components/normalize-css/normalize.css",
				"../../components/Gridlock/fs.gridlock-base.css",
				"../../components/Gridlock/fs.gridlock-12.css",
				"../../components/Shifter/jquery.fs.shifter.css",

				"css/fonts.css",
				"css/prism.css",
				"css/base.css",
				"css/master.css"
			),
			"site-ie8" => array(
				"../../components/Gridlock/fs.gridlock-ie.css",
				"css/ie/ie8.css",
			),
			"site-ie9" => array(
				"css/ie/ie9.css",
			),
			"demo" => array(
				"../../components/normalize-css/normalize.css",
				"../../components/Gridlock/fs.gridlock-base.css",
				"../../components/Gridlock/fs.gridlock-12.css",

				"css/fonts.css",
				"css/prism.css",
				"css/base.css",
				"css/demos.css"
			),
			"demo.ie" => array(
				"../../components/Gridlock/fs.gridlock-ie.css"
			),
			"gridlock.bookmarklet" => array(
				"css/gridlock-bookmarklet.css"
			)
		),
		"vars" => array(
			"tan"         => "#D6C591",
			"orange"  	  => "#C65032",
			"gray" 		  => "#494C51",

			"textGray"	  => "#666",
			"bgGray"	  => "#f8f8f8",
			"lighterGray" => "#ccc",
			"lightGray"   => "#999",

			"black0"      => "rgba(0, 0, 0, 0)",
			"black25"     => "rgba(0, 0, 0, 0.25)",
			"black50"     => "rgba(0, 0, 0, 0.5)",
			"black75"     => "rgba(0, 0, 0, 0.75)",

			"white0"      => "rgba(255, 255, 255, 0)",
			"white25"     => "rgba(255, 255, 255, 0.25)",
			"white50"     => "rgba(255, 255, 255, 0.5)",
			"white75"     => "rgba(255, 255, 255, 0.75)",

			"black"       => "#1C1F1D",
			"white"       => "#fff",

			"lato"   => "font-family: 'Lato', sans-serif;",
			"ptMono" => "font-family: 'PTMono', monospace;",

			"iconSprite" => "url(../images/icons.svg) no-repeat"
		),
		"minify" => true
	),
	"js" => array(
		"files" => array(
			"modernizr" => array(
				"js/lib/modernizr.custom.js",
			),
			"site" => array(
				"../../components/jquery/jquery.min.js",
				"../../components/Pronto/jquery.fs.pronto.min.js",
				"../../components/Rubberband/jquery.fs.rubberband.min.js",
				"../../components/Scout/jquery.bp.scout.js",
				"../../components/Scout/jquery.bp.scout.maxScroll.js",
				"../../components/Shifter/jquery.fs.shifter.min.js",

				"js/prism.js",
				"js/main.js"
			),
			"site-ie8" => array(
				"js/ie/matchMedia.ie8.js",
			),
			"site-ie9" => array(
				"js/ie/matchMedia.ie9.js",
			),
			"demo" => array(
				"../../components/jquery/jquery.min.js",
				"../../components/Rubberband/jquery.fs.rubberband.min.js",

				"js/prism.js",
				"js/demos.js"
			),
			"gridlock.bookmarklet" => array(
				"js/gridlock-bookmarklet.js"
			)
		),
		"vars" => array(
			// "gridlock_bookmarklet_css" => file_get_contents("lib/cache/resources/gridlock.bookmarklet.css")
		),
		"minify" => true
	)
);