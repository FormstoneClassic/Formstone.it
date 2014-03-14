<?php

/**
 * Custom functionality for Formstone.it
 */
class Site {

	private $live = false;
	private $base_url = "";
	private $current_url = "";

	public function config_loaded(&$settings) {
		$this->live = ($settings["base_url"] === "http://formstone.it");
		$this->base_url = $settings["base_url"];
	}

	public function request_url(&$url) {
		if (substr($url, strlen($url)-1, 1) === "/") {
			$url = substr($url, 0, strlen($url)-1);
		}

		$this->current_url = $url;
	}

	public function file_meta(&$meta) {
		// extra page data, json filename should match md filename
		$path = trim(str_ireplace($this->base_url, "", $this->current_url), "/");
		$file = CONTENT_DIR . (($path === "") ? "index" : $path) . ".json";

		if (file_exists($file)) {
			$meta = array_merge($meta, json_decode(file_get_contents($file), true));
		}
	}

	public function get_pages(&$pages, &$current_page, &$prev_page, &$next_page) {
		/*
		for ($i = 0, $count = count($pages); $i < $count; $i++) {
			// unset home
			if (isset($pages[$i]['url']) && $pages[$i]['url'] === $this->base_url) {
				unset($pages[$i]);
			}
		}
		*/
	}

	public function get_page_data(&$data, $page_meta) {
		$data = array_merge($data, $page_meta);
	}

	public function before_render(&$twig_vars, &$twig, &$template) {
		$twig_vars["live"] = $this->live;
	}
}

?>