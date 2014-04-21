<?php

/**
 * Nano Placeholder plugin
 *
 * @author Ben Plum
 * @link http://benplum.com
 * @license http://opensource.org/licenses/MIT
 * @Version 1.0.0
 */
class Nano_Placeholder {

	private $settings = array(
		"default" => array(
			"background_color" => "CCCCCC",
			"text_color" => "666666",
			//"image" => false,
			"text" => false
		)
	);

	public function config_loaded(&$settings) {
		if (isset($settings["nano_placeholder"])) {
			$this->settings = $settings["nano_placeholder"];
		}
	}

	public function request_url(&$url) {
		if (strpos($url, "placeholder") > -1) {
			$url_parts = explode("/", strtolower($url));

			if (count($url_parts) >= 2) {
				if ($url_parts[0] === "images") {
					array_shift($url_parts);
				}

				if (strpos($url_parts[1], "x") > -1) {
					// default
					$style = "default";
					$info = pathinfo($url_parts[1]);
				} else {
					// custom
					$style = $url_parts[1];
					$info = pathinfo($url_parts[2]);
				}
				$file = $info["filename"];
				$size = explode("x", $file);

				if (count($size) == 2 && isset($this->settings[$style])) {
					$style = $this->settings[$style];
					self::renderPlaceholder($size[0], $size[1], $style["background_color"], $style["text_color"], $style["image"], $style["text"]);
				}
			}
		}
	}

	// Render placeholder
	static function renderPlaceholder($width, $height, $bg_color = false, $text_color = false, $icon_path = false, $text_string = false) {
		// Check size
		$width = ($width > 2000) ? 2000 : $width;
		$height = ($height > 2000) ? 2000 : $height;

		// Check colors
		$bg_color = (!$bg_color && $bg_color != "000" && $bg_color != "000000") ? "CCCCCC" : ltrim($bg_color,"#");
		$text_color = (!$text_color  && $text_color != "000" && $text_color != "000000") ? "666666" : ltrim($text_color,"#");

		// Set text
		$text = $text_string;
		if ($icon_path) {
			$text = "";
		} else {
			if (!$text_string) {
				$text = $width . " X " . $height;
			}
		}

		// Create image
		$image = imagecreatetruecolor($width, $height);
		// Build rgba from hex
		$bg_color = imagecolorallocate($image, base_convert(substr($bg_color, 0, 2), 16, 10), base_convert(substr($bg_color, 2, 2), 16, 10), base_convert(substr($bg_color, 4, 2), 16, 10));
		$text_color = imagecolorallocate($image, base_convert(substr($text_color, 0, 2), 16, 10), base_convert(substr($text_color, 2, 2), 16, 10), base_convert(substr($text_color, 4, 2), 16, 10));
		// Fill image
		imagefill($image, 0, 0, $bg_color);

		/*
		if ($icon_path) {
			$icon_size = getimagesize($icon_path);
			$icon_width = $icon_size[0];
			$icon_height = $icon_size[1];
			$icon_x = ($width - $icon_width) / 2;
			$icon_y = ($height - $icon_height) / 2;

			$icon = imagecreatefrompng($icon_path);
			imagesavealpha($icon, true);
			imagealphablending($icon, true);
			imagecopyresampled($image, $icon, $icon_x, $icon_y, 0, 0, $icon_width, $icon_height, $icon_width, $icon_height);
			*/
		//} elseif ($text) {
		if ($text) {
			$font = ROOT_DIR . ("vendor/nano_placeholder/arial.ttf");
			$fontsize = ($width > $height) ? ($height / 15) : ($width / 15);
			$textpos = imageTTFBbox($fontsize, 0, $font, $text);
			imagettftext($image, $fontsize, 0, (($width - $textpos[2]) / 2), (($height - $textpos[5]) / 2), $text_color, $font, $text);
		}

		// Serve image and die
		header("Content-Type: image/png");
		imagepng($image);
		imagedestroy($image);
		die();
	}
}

?>