
	/* global Prism */

	$(document).ready(function() {

		$.rubberband({
			minWidth: [ 320, 500, 740, 980, 1220 ],
			maxWidth: [ 1220, 980, 740, 500, 320 ]
		});

		$("code").each(function() {
			Prism.highlightElement($(this)[0]);
		});

	});