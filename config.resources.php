<?

$config["nano_resources"] = array(
	"debug" => false,
	"css" => array(
		"files" => array(
			"site" => array(
				"../../components/normalize-css/normalize.css",
				"../../components/Gridlock/fs.gridlock.css",
				"../../components/Shifter/jquery.fs.shifter.css",
				"../../components/Tabber/jquery.fs.tabber.css",

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
				"../../components/Gridlock/fs.gridlock.css",

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
				"../../components/Tabber/jquery.fs.tabber.min.js",

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

?>