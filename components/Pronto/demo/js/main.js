	var deferred;

	$(document).ready(function() {
		// Bind pronto events
		$(window).on("pronto.request", pageRequested)
				 .on("pronto.progress", pageLoadProgress)
				 .on("pronto.load", pageLoaded)
				 .on("pronto.render", pageRendered)
				 .on("pronto.error", pageLoadError);

		// Init pronto
		$.pronto({
			selector: "a:not(.no-pronto)",
			transitionOut: function() {
				if (deferred) {
					deferred.reject();
				}

				deferred = $.Deferred();

				$("#pronto").animate({ opacity: 0 }, 1000, function() {
					console.log("animate done");

					deferred.resolve();
				});

				return deferred;
			}
		});

		// Remember to init first page
		pageRendered();
	});

	function pageRequested(e) {
		// update state to reflect loading
		console.log("Request new page");
	}

	function pageLoadProgress(e, percent) {
		// update progress to reflect loading
		console.log("New page load progress", percent);
	}

	function pageLoaded(e) {
		// unbind old events and remove plugins
		console.log("Destroy old page");
	}

	function pageRendered(e) {
		// bind new events and initialize plugins
		console.log("Render new page");

		$("#pronto").animate({ opacity: 1 }, 1000);
	}

	function pageLoadError(e, error) {
		// watch for load errors
		console.error("Error loading page: ", error);
	}