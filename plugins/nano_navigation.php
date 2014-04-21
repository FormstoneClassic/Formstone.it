<?php

/**
 * Nano Navigation plugin
 *
 * @author Ben Plum
 * @link http://benplum.com
 * @license http://opensource.org/licenses/MIT
 * @Version 1.1.4
 */
class Nano_Navigation {

	private $base_url = "";
	private $navigation;
	private $redirect_lower;
	private $redirects;
	private $is_sitemap = false;

	public function config_loaded(&$settings) {
		$this->base_url = $settings["base_url"];
		$this->redirects = isset($settings["nano_navigation"]["redirects"]) ? $settings["nano_navigation"]["redirects"] : false;
	}

	public function request_url(&$url) {
		// $url = strtolower($url);

		if (array_key_exists($url, $this->redirects)) {
			$redirect = (strpos($this->redirects[$url], "http") > -1) ? $this->redirects[$url] : $this->base_url."/".$this->redirects[$url];
			$this->redirect($redirect);
		}
		if ($url === 'sitemap.xml') {
			$this->is_sitemap = true;
		}
	}

	public function before_load_content(&$file) {
		if ($this->is_sitemap) {
			$file = str_ireplace("sitemap.xml.md", "index.md", $file);
		}
	}

	public function before_read_file_meta(&$headers) {
		$headers["order"] = "Order";
	}

	public function file_meta(&$meta) {
		$this->redirect_lower = ($meta["template"] === "redirect");
	}

	public function get_pages(&$pages, &$current_page, &$prev_page, &$next_page) {
		$parsed = array();
		$r = false;

		for ($i = 0, $count = count($pages); $i < $count; $i++) {
			if (isset($pages[$i]["url"]) && isset($current_page["url"]) && $pages[$i]["url"] === $current_page["url"]) {
				$pages[$i]["active"] = true;
			}
		}

		foreach ($pages as $page) {
			$parts = explode("/", trim(str_ireplace($this->base_url, "", $page["url"]), "/"));
			$count = count($parts);

			$parsed = array_merge_recursive($parsed, $this->parse_tree($parts, $page, $current_page));
		}

		$this->sort_tree($parsed);

		unset($parsed["children"]["_index"]);
		$this->navigation = $parsed["children"];

		$prev_page = false;
		$next_page = false;

		foreach ($this->navigation as $p) {
			if (isset($p["children"])) {
				$this->find_siblings($p["children"], $prev_page, $next_page);
			}
		}

		if ($this->redirect_lower) {
			$this->redirect_lower($this->navigation);
		}

		if ($this->is_sitemap) {
			header($_SERVER['SERVER_PROTOCOL']." 200 OK");
			header("Content-Type: application/xml; charset=UTF-8");
			header("Content-Type: text/xml");

			$xml = '<?xml version="1.0" encoding="UTF-8"?>';
			$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
			$xml .= $this->recurse_sitemap($this->navigation);
			$xml .= '</urlset>';

			die($xml);
		}
	}

	public function before_render(&$twig_vars, &$twig, &$template) {
		$twig_vars["navigation"] = $this->navigation;
	}

	private function parse_tree($parts = array(), $page = array(), $current_page = array()) {
		if (count($parts) == 1) {
			$parts0 = ($parts[0] == "") ? "_index" : $parts[0];
			return array("children" => array($parts0 => $page));
		} else {
			if ($parts[1] == "") {
				array_pop($parts);
				return $this->parse_tree($parts, $page, $current_page);
			}

			$first = array_shift($parts);
			return array("children" => array($first => $this->parse_tree($parts, $page, $current_page)));
        }
    }

	private function sort_tree(&$pages) {
		if (!is_array($pages)) {
			return false;
		}

		$ordered = array();
		$unordered = array();
		foreach ($pages as $k => $page) {
			if (is_array($page)) {
				if (!is_numeric($page["order"])) {
					$unordered[$k] = $page;
				} else {
					$ordered[$k] = $page;
				}
			}
		}

		if (count($ordered) > 0 || count($unordered) > 0) {
			usort($ordered, "sortByOrder");
			ksort($unordered);
			$pages = array_merge($ordered, $unordered);
		}

		foreach ($pages as $k => $v) {
			$this->sort_tree($pages[$k]);
		}

		return true;
	}

	private function find_siblings($navigation, &$prev_page, &$next_page) {
		$keys = array_keys($navigation);

		for ($i = 0, $count = count($navigation); $i < $count; $i++) {
			$page = $navigation[ $keys[$i] ];

			if ($page["active"]) {
				if ($i > 0) {
					$next_page = $navigation[ $keys[$i - 1] ];
				}
				if ($i < $count) {
					$prev_page = $navigation[ $keys[$i + 1] ];
				}
				return;
			} else if (isset($page["children"])) {
				$this->find_siblings($page["children"], $prev_page, $next_page);
			}
		}
	}

    private function redirect_lower($navigation) {
		foreach ($navigation as $page) {
			if ($page["active"]) {
				$p = reset($page["children"]);
				$this->redirect($p["url"]);
			} else if (isset($page["children"])) {
				$this->redirect_lower($page["children"]);
			}
		}
	}

	private function redirect($url) {
		header("HTTP/1.1 301 Moved Permanently");
		header("Location: " . $url);
		die();
	}

	private function recurse_sitemap($pages) {
		$xml = "";

		foreach ($pages as $page) {
			$xml .= '<url><loc>'.$page['url'].'</loc></url>';

			if (count($page["children"]) > 0) {
				$xml .= $this->recurse_sitemap($page["children"]);
			}
		}

		return $xml;
	}
}

function sortByOrder($a, $b) {
    return $b["order"] - $a["order"];
}

?>