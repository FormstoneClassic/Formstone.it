<pre>
<?
	// Build Pico ready content and data files content

	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	ini_set('memory_limit', '32M');
	set_time_limit(0);

	$c_file = file_get_contents(__DIR__ . "/components/components.json");
	$c = json_decode($c_file, true);

	foreach ($c["components"] as $component) {
		$dir = __DIR__ . "/components/" . ucwords($component) . "/";
		if (is_dir($dir)) {
			//parse();
			$b_file = file_get_contents($dir . "bower.json");
			$bower = json_decode($b_file, true);
			$p_file = file_get_contents($dir . "package.json");
			$package = json_decode($p_file, true);

			$file = false;
			$source = false;
			foreach ($bower["main"] as $s) {
				if (strpos($s, ".js") > -1) {
					$source = $s;
				}
			}

			$doc = array();
			if ($source) {
				$file = file_get_contents($dir . $source);

				// Match /** ... */ style block comments
				preg_match_all("/(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)/", $file, $matches);

				foreach($matches[0] as $content) {
					if (strpos($content, "@plugin") > -1) {
						$doc = array_merge(parseContent($content), $doc);
					} else if (strpos($content, "@options") > -1) {
						$params = parseContent($content);
						$doc["options"] = $params["params"];
					} else if (strpos($content, "@events") > -1) {
						$doc["events"] = parseContent($content);
					} else if (strpos($content, "@method") > -1) {
						if (!isset($doc["methods"]) || !is_array($doc["methods"])) {
							$doc["methods"] = array();
						}
						$m = parseContent($content);
						if (strpos($content, "private")) {
							$m["private"] = true;
						}
						if (strpos($content, "global")) {
							$m["global"] = true;
						}
						$doc["methods"][] = $m;
					}
				}
			}

			$main = array();
			$main["js"] = array();
			$main["css"] = array();

			foreach ($bower["main"] as $m) {
				if (strpos($m, ".js") > -1) {
					$main["js"][] = $m;
				} else if (strpos($m, ".css") > -1) {
					$main["css"][] = $m;
				}
			}

			$json = array(
				"name" => $package["name"],
				"description" => str_ireplace("Part of the Formstone Library.", "", $package["description"]),
				"version" => $package["version"],
				"demo" => $package["demo"],
				"repository" => $package["repository"]["url"],
				"documentation" => $doc,
				"files" => $main
			);

			$markdown = "/* \n";
			$markdown .= "Template: component \n";
			$markdown .= "Title: " . $package["name"];
			$markdown .= " \n";
			$markdown .= "Description: " . str_ireplace("Part of the Formstone Library.", "", $package["description"]);
			$markdown .= " \n";
			$markdown .= "Data: " . $package["id"] . ".md";
			$markdown .= " \n";
			$markdown .= "*/ \n";

			file_put_contents(__DIR__ . "/content/components/" . $component . ".json", trim(json_encode($json)));
			file_put_contents(__DIR__ . "/content/components/" . $component . ".md", trim($markdown));

			echo "COMPLETE: " . $component . "\n";
		} else {
			echo "NOT FOUND: " . $component . "\n";
		}
	}

	// Bust Component Cache
	$files = glob(__DIR__ . "/lib/cache/pages/components-*");
    foreach ($files as $file) {
        if (!is_dir($file)) {
            unlink($file);
        }
    }

	function parseContent($content) {
		$return = array();
		$parts = explode("\n", $content);
		$keys = array(
			"name",
			"description",
			"version",
			"example",
			"param",
			"event",
			"return"
		);
		foreach ($parts as $p) {
			foreach ($keys as $key) {
				if (strpos($p, "@$key ") > -1) {
					$part = explode("@$key ", $p);
					$part = trim(end($part));

					// Split down params, events and returns
					if (in_array($key, array("param","event","return"))) {
						if ($key != "return") {
							$pp = explode(" ", $part, 2);
							$part = array(
								"name" => trim($pp[0])
							);
						} else {
							$pp[1] = $part;
							$part = array();
						}

						if (isset($pp[1])) {
							// 0 - all
							// 1 - type
							// 2 - default
							// 3 - description

							// Patterns: \[([^\]]*)\]|\<([^\]]*)\>|\"([^\]]*)\"
							preg_match_all("/\\[([^\\]]*)\\]|\\<([^\\]]*)\\>|\\\"([^\\]]*)\\\"/us", $pp[1], $matches);

							foreach ($matches[1] as $match) {
								$match = trim($match);
								if ($match !== "") $part["type"] = $match;
							}
							foreach ($matches[2] as $match) {
								$match = trim($match);
								if ($match !== "") $part["default"] = $match;
							}
							foreach ($matches[3] as $match) {
								$match = trim($match);
								if ($match !== "") $part["description"] = $match;
							}
						}
					}

					if ($key == "param") {
						if (!is_array($return["params"])) {
							$return["params"] = array();
						}
						$return["params"][] = $part;
					} else if ($key == "event") {
						$return[] = $part;
					} else {
						$return[$key] = $part;
					}
				}
			}
		}
		return $return;
	}

	die("\nFINISHED");
?>
</pre>