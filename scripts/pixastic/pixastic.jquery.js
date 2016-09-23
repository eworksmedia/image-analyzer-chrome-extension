
if (typeof jQuery != "undefined" && jQuery && jQuery.fn) {
	jQuery.fn.pixastic = function(action, options) {
		var newElements = [];
		this.each(
			function () {
				if ($(this).get(0).tagName == "IMG" && !$(this).get(0).complete) {
					return;
				}
				var res = Pixastic.process($(this).get(0), action, options);
				if (res) {
					newElements.push(res);
				}
			}
		);
		if (newElements.length > 0)
			return jQuery(newElements);
		else
			return this;
	};

};
