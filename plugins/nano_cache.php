<?php

/**
 * Nano Cache plugin [based on Pico Cache by Maximilian Beck]
 *
 * @author Ben Plum
 * @link http://benplum.com
 * @license http://opensource.org/licenses/MIT
 * @Version 1.0.0
 */
class Nano_Cache {

	private $cache_root;
	private $cache_file;
	private $cache_time = 604800; // 60*60*24*7, seven days
	private $cache_enabled = false;
	private $pronto = false;
	private $pronto_title = "";

	public function config_loaded(&$settings) {
		$this->base_url = $settings["base_url"];
		$this->cache_root = CACHE_DIR . "pages/";
		$this->cache_time = isset($settings["nano_cache"]["time"]) ? $settings["nano_cache"]["time"] : $this->cache_time;
		$this->cache_enabled = isset($settings["nano_cache"]["enabled"]) ? $settings["nano_cache"]["enabled"] : $this->cache_enabled;
		$this->pronto_title = $settings["site_title"];
	}

	public function request_url(&$url) {
		if ($_GET["pronto"] === "true" && $_SERVER["HTTP_X_REQUESTED_WITH"] == "XMLHttpRequest" && strpos($_SERVER["HTTP_REFERER"], $this->base_url) > -1) {
			$this->pronto = true;
		}

		$this->cache_file = $this->cache_root . preg_replace("/[^A-Za-z0-9_\-]/", "-", (($url === "") ? "index" : $url)) . ($this->pronto ? ".json" : ".html");

		if ($this->cache_enabled && file_exists($this->cache_file) && (time() - filemtime($this->cache_file)) < $this->cache_time) {
			header("Expires: " . gmdate("D, d M Y H:i:s", $this->cache_time + filemtime($this->cache_file)) . " GMT");
			readfile($this->cache_file);
			die();
		}
	}

	public function after_404_load_content(&$file, &$content) {
		$this->cache_enabled = false;
	}

	public function file_meta(&$meta) {
		$meta["pronto"] = $this->pronto;
		$this->pronto_title = $meta["title"] . " &middot; " . $this->pronto_title;
	}

	public function after_render(&$output) {
		$datestamp = date("Y-m-d H:i:s");

		$output = "<!-- RENDERED : $datestamp -->\n" . $output;

		if ($this->pronto) {
			header("Content-type: application/json");
			$output = json_encode(array(
				"title" => $this->pronto_title,
				"content" => $output
			));
		}

		if ($this->cache_enabled) {
			if (!is_dir($this->cache_root)) {
				mkdir($this->cache_root, 0755, true);
			}
			file_put_contents($this->cache_file, $output);
		}
	}
}

?>