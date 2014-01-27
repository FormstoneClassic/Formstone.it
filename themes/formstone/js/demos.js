(function(){ var els = "address|article|aside|audio|canvas|command|datalist|details|dialog|figure|figcaption|footer|header|hgroup|keygen|mark|meter|menu|nav|progress|ruby|section|time|video".split('|'); for(var i = 0; i < els.length; i++) { document.createElement(els[i]); } } )();

	$(document).ready(function() {
		
		$.rubberband({
			minWidth: [ 320, 500, 740, 980, 1220 ],
			maxWidth: [ 1220, 980, 740, 500, 320 ]
		});
		
		$("code").each(function() {
			Prism.highlightElement($(this)[0]);
		});
		
	});