<?php

/**
 * Nano Resources plugin
 *
 * @author Ben Plum
 * @link http://benplum.com
 * @license http://opensource.org/licenses/MIT
 * @Version 1.0.0
 */
class Nano_Resources {

	private $settings;
	private $debug;
	private $theme;
	private $base_url;

	public function config_loaded(&$settings) {
		$this->settings = isset($settings["nano_resources"]) ? $settings["nano_resources"] : array();
		$this->debug = isset($this->settings["debug"]) ? $this->settings["debug"] : false;

		$this->theme = $settings["theme"];
		$this->base_url = $settings["base_url"];
	}

	public function request_url(&$url) {
		if (strpos($url, "css") > -1 || strpos($url, "js") > -1) {
			$url_parts = explode("/", $url);
			$url_count = count($url_parts);

			$type = $url_parts[$url_count - 2];
			$info = pathinfo($url_parts[$url_count - 1]);
			$file = $info["filename"];

			if ( ($type == "js"  && isset($this->settings["js"]["files"][$file])  && is_array($this->settings["js"]["files"][$file]))
			  || ($type == "css" && isset($this->settings["css"]["files"][$file]) && is_array($this->settings["css"]["files"][$file]))
			 ) {
				$this->processResource($file, $type);
			}
		}
	}

	// Process js / css
	private function processResource($file, $type) {
		$sources = $this->settings[$type]["files"][$file];
		$vars = $this->settings[$type]["vars"];

		clearstatcache();

		$theme_root = THEMES_DIR . $this->theme;
		$theme_url = $this->base_url . "/" . basename(THEMES_DIR) . "/" . $this->theme;
		$cache_root = CACHE_DIR . "resources/";
		$cache_file = $cache_root . $file . "." . $type;
		$cache_modified = file_exists($cache_file) ? filemtime($cache_file) : 0;
		$last_modified = 0;

		foreach ($sources as $source) {
			$m = file_exists($theme_root . "/$type/$source") ? filemtime($theme_root . "/$type/$source") : 0;
			if ($m > $last_modified) {
				$last_modified = $m;
			}
		}

		if (!file_exists($cache_file) || $last_modified > $cache_modified || $this->debug === true) {
			$data = "";
			foreach ($sources as $source) {
				$data .= file_exists($theme_root . "/$type/$source") ? file_get_contents($theme_root . "/$type/$source") . "\n" : "";
			}

			$keys = array('$base_url', 'base_url', '$theme_url', 'theme_url');
			$vals = array($this->base_url, $this->base_url, $theme_url, $theme_url);
			if (is_array($vars)) {
				foreach ($vars as $key => $val) {
					$keys[] = '$'.$key;
					$vals[] = $val;
				}
			}

			$data = str_replace($keys, $vals, $data);

			$min_lib = ROOT_DIR . "vendor/resources/" . $type . ".php";
			if ($this->settings[$type]["minify"] && file_exists($min_lib)) {
				require $min_lib;
				if ($type === "js") {
					$data = JShrink\Minifier::minify($data, array("flaggedComments" => false));
				} else if ($type === "css") {
					$data = CssMin::minify($data);
				}
				$data = trim($data);
			}

			if (!is_dir($cache_root)) {
				mkdir($cache_root, 0755, true);
			}

			$datestamp = date('Y-m-d H:i:s');
			file_put_contents($cache_file, "/* CACHED : $datestamp */\n" . $data);

			if ($type === "js") {
				header("Content-type: text/javascript");
			} else {
				header("Content-Type: text/css");
			}
			die("/* RENDERED : $datestamp */\n" . $data);
		} else {
			if (function_exists("apache_request_headers")) {
				$headers = apache_request_headers();
				$ims = isset($headers["If-Modified-Since"]) ? $headers["If-Modified-Since"] : 0;
			} else {
				$ims = $_SERVER["HTTP_IF_MODIFIED_SINCE"];
			}

			if (!$ims || strtotime($ims) != $cache_modified) {
				if ($type === "js") {
				header("Content-type: text/javascript");
				} else {
					header("Content-Type: text/css");
				}
				header("Last-Modified: ".gmdate("D, d M Y H:i:s", $cache_modified).' GMT', true, 200);
				readfile($cache_file);
				die();
			} else {
				header("Last-Modified: ".gmdate("D, d M Y H:i:s", $cache_modified).' GMT', true, 304);
				die();
			}
		}
	}
}

?>