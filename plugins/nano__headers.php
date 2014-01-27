<?php

/**
 * Nano Headers plugin
 *
 * @author Ben Plum
 * @link http://benplum.com
 * @license http://opensource.org/licenses/MIT
 * @Version 1.0.0
 */
class Nano__Headers {
	// double underscore to move up in hook queue!

	private $settings = array(
		"X-Frame-Options" => "SAMEORIGIN",
		"X-XSS-Protection" => "1; mode=block",
		"X-Permitted-Cross-Domain-Policies" => "master-only",
		"Content-Security-Policy" => false, //
		"Strict-Transport-Security" => false, // max-age=15768000
		"Content-Type" => "text/html; charset=utf-8"
	);

	public function config_loaded(&$settings) {
		if (isset($settings["nano_headers"])) {
			$s = $settings["nano_headers"];

			foreach ($s as $key => $val) {
				$this->settings[$key]  = $val;
			}
		}
	}

	public function request_url(&$url) {
		header_remove("Server");
		header_remove("X-Powered-By");

		$is_resource = (strpos($url, ".js") > -1 || strpos($url, ".css") > -1);

		if (!$is_resource) {
			foreach ($this->settings as $key => $val) {
				if ($val !== false) {
					if ($key === "Content-Security-Policy") {
						// so many policies...
						header("X-WebKit-CSP: " . $val);
						header("X-Content-Security-Policy: " . $val);
						header("Content-Security-Policy: " . $val);
					} else {
						header($key . ": " . $val);
					}
				}
			}
		}
	}
}

?>