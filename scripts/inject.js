var IMAGE_ANALYZER_EXTENSION = (function(){
	/**
		Private Vars
	**/
	var overlay_cors_security_error_message = 'Unable to load image due to cross-origin policy';
	var overlay_download_element = null;
	var overlay_images_raw = null;
	var overlay_images = [];
	var overlay_images_exif_count = 0;
	var overlay_images_current = null;
	var overlay_images_index = -1;
	var overlay_images_loading_template = [
		'<div class="ian-overlay-loading"></div>'
	].join('\n');
	var overlay_images_message = [
		'<div class="ian-overlay-message">{{message}}</div>'
	].join('\n');
	var overlay_images_container_template = [
		'<div class="ian-overlay-container">',
		'	<div class="ian-overlay-media-container">',
		'		<div>',
		'			<img src="" />',
		'		</div>',
		'	</div>',
		'	<div class="ian-overlay-info-container">',
		'		<p><button type="button" class="ian-btn ian-btn-primary ian-btn-arrow" data-direction="previous"><span class="ian-arrow-left"></span></button> <span class="ian-images-count"><span>0</span> / <span>0</span></span> <button type="button" class="ian-btn ian-btn-primary ian-btn-arrow" data-direction="next"><span class="ian-arrow-right"></span></button> <button type="button" class="ian-btn ian-btn-primary ian-pull-right ian-btn-close">Close</button></p>',
		'		<p><button type="button" class="ian-btn ian-btn-success ian-btn-block ian-btn-download">Download</button></p>',
		'		<h2 data-property="name"><span></span></h2>',
		'		<div class="ian-btn-group">',
		'			<a class="ian-btn ian-btn-default active" data-expand="properties">Properties</a>', 
		'			<a class="ian-btn ian-btn-default" data-expand="exif">EXIF</a>',
		'			<a class="ian-btn ian-btn-default" data-expand="histogram">Histogram</a>',
		'		</div>',
		'		<div class="ian-overlay-info-section open" data-expand="properties">',
		'			<h3 data-property="src">Src <span></span></h3>',
		'			<h3 data-property="srcset">Srcset <span></span></h3>',
		'			<h3 data-property="currentSrc">Current Src <span></span></h3>',
		'			<h3 data-property="sizes">Sizes <span></span></h3>',
		'			<h3 data-property="fileSize">File Size <span></span></h3>',
		'			<h3 data-property="link">Link <span></span></h3>',
		'			<h3 data-property="dimensions">Width x Height <span></span></h3>',
		'			<h3 data-property="dimensionsActual">Native Width x Native Height <span></span></h3>',
		'			<h3 data-property="alt">Alt <span></span></h3>',
		'			<hr data-expand="attributes" data-expand-title="view raw attributes" data-expanded-title="close raw attributes" />',
		'			<pre data-expand="attributes"></pre>',
		'		</div>',
		'		<div class="ian-overlay-info-section" data-expand="exif">',
		'			<h3 data-property="exif.Make">Make <span></span></h3>',
		'			<h3 data-property="exif.Model">Model <span></span></h3>',
		'			<h3 data-property="exif.DateTime">Date <span></span></h3>',
		'			<h3 data-property="exif.Copyright">Copyright <span></span></h3>',
		'			<h3 data-property="exif.ApertureValue">Aperture Value <span></span></h3>',
		'			<h3 data-property="exif.FNumber">F-stop <span></span></h3>',
		'			<h3 data-property="exif.FocalLength">Focal Length <span></span></h3>',
		'			<h3 data-property="exif.FocalPlaneXResolution">Focal Plane X Resolution <span></span></h3>',
		'			<h3 data-property="exif.FocalPlaneYResolution">Focal Plane Y Resolution <span></span></h3>',
		'			<h3 data-property="exif.FocalPlaneResolutionUnit">Focal Plane Resolution Unit <span></span></h3>',
		'			<h3 data-property="exif.ExposureTime" data-display-type="fraction">Exposure Time <span></span></h3>',
		'			<h3 data-property="exif.ExposureProgram">Exposure Program <span></span></h3>',
		'			<h3 data-property="exif.ISOSpeedRatings">ISO <span></span></h3>',
		'			<h3 data-property="exif.Flash">Flash <span></span></h3>',
		'			<h3 data-property="exif.ShutterSpeedValue">Shutter Speed <span></span></h3>',
		'			<h3 data-property="exif.WhiteBalance">White Balance <span></span></h3>',
		'			<h3 data-property="exif.ComponentsConfiguration">Components Configuration <span></span></h3>',
		'			<h3 data-property="exif.CustomRendered">Custom Rendered <span></span></h3>',
		'			<h3 data-property="exif.Orientation">Orientation <span></span></h3>',
		'			<h3 data-property="exif.PixelXDimension">Pixel X Dimension <span></span></h3>',
		'			<h3 data-property="exif.PixelYDimension">Pixel Y Dimension <span></span></h3>',
		'			<h3 data-property="exif.ResolutionUnit">Resolution Unit <span></span></h3>',
		'			<h3 data-property="exif.SceneCaptureType">Scene Capture Type <span></span></h3>',
		'			<h3 data-property="exif.XResolution">Resolution <span></span></h3>',
		'			<h3 data-property="exif.GPSLatitude">Latitude <span></span></h3>',
		'			<h3 data-property="exif.GPSLongitude">Longitude <span></span></h3>',
		'			<h3 data-property="exif.GPSAltitude">Altitude <span></span></h3>',
		'			<h3 data-property="exif.GPSImgDirection">Direction <span></span></h3>',
		'			<hr data-expand="exif" data-expand-title="view raw exif" data-expanded-title="close raw exif" />',
		'			<pre data-expand="exif"></pre>',
		'		</div>',
		'		<div class="ian-overlay-info-section" data-expand="histogram">',
		'			<h3 id="histogram-rgb">RGB <span><canvas width="255" height="300"></canvas></span></h3>',
		'			<h3 id="histogram-avg">Weighted Average <span><canvas width="255" height="300"></canvas></span></h3>',
		'		</div>',
		'	</div>',
		'</div>'
	].join('\n');
	/**
		Private Methods
	**/
	var _init = function() {
		// setup message channel with background script
		chrome.runtime.onMessage.addListener(function(request, sender, callback) {
			switch(request.action) {
				case 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_PROPERTIES':
					_ianOverlayProcessImages({
						'src': request.image,
						'link': request.link
					});
				break;
			};
		});
		// end message channel
	};
		
	var _ianOverlayProcessImages = function(startImage) {
		overlay_images_raw = $('img');
		/* TODO - update after release
		          merge _ianOverlayGetElementsWithBackgroundImage()
				  so it's not only <img> nodes
		*/
		if(!overlay_images_raw.length) _ianOverlayProcessImagesComplete();
		$.each(overlay_images_raw, function(index, img) {
			var hasSomeSource = false;
			var image = {
				'imageRef': img,
				'fileSize': 0,
				'useableSource': '',
				'name': '',
				'src': 'n/a',
				'srcset': 'n/a',
				'currentSrc': 'n/a',
				'sizes': 'n/a',
				'link': 'n/a',
				'dimensions': '0 x 0',
				'dimensionsActual': '0 x 0',
				'alt': 'n/a',
				'exif': {},
				'exifPretty': ''
			};
			if($(img).attr('src') != undefined && $(img).attr('src') != '') {
				hasSomeSource = true;
				image.src = $(img).attr('src');
				image.useableSource = $(img).attr('src');
				image.name = image.src.split('/').pop();
				image.dimensions = $(img).width() + ' x ' + $(img).height();
			} else if($(img).prop('currentSrc') != '') {
				hasSomeSource = true;
				image.currentSrc = $(img).prop('currentSrc');
				image.useableSource = $(img).prop('currentSrc');
				image.name = image.currentSrc.split('/').pop();
				image.dimensions = $(img).width() + ' x ' + $(img).height();
			};
			if($(img).attr('srcset') && $(img).attr('srcset') != '') {
				image.srcset = $(img).attr('srcset');
			};
			if($(img).attr('sizes') && $(img).attr('sizes') != '') {
				image.sizes = $(img).attr('sizes');
			};
			if($(img).attr('alt') && $(img).attr('alt') != '') {
				image.alt = $(img).attr('alt');
			};
			if(startImage != undefined && startImage.link != '') {
				image.link = startImage.link;
			} else if($(img).parent().prop('tagName').toLowerCase() == 'a') {
				image.link = $(img).parent().attr('href');
			};
			if(hasSomeSource) {
				overlay_images.push(image);
				(function(image_ref) {
					// get exif
					EXIF.getData(img, function() {
						image_ref.fileSize = _bytesToSize(this.fileSize);
						image_ref.dimensionsActual = $(image_ref.imageRef).get(0).naturalWidth + ' x ' + $(image_ref.imageRef).get(0).naturalHeight;	
						image_ref.exif = this.exifdata;
						image_ref.exifPretty = EXIF.pretty(this);
						overlay_images_exif_count += 1;
						_ianOverlayProcessImagesComplete();
					});
				})(overlay_images[overlay_images.length - 1]);
				if(startImage != undefined && startImage.src == image.useableSource) overlay_images_index = overlay_images.length - 1;
			} else {
				_ianOverlayProcessImagesComplete();	
			};
		});
	};
	
	var _ianOverlayProcessImagesComplete = function() {
		if(!$('.ian-overlay-loading').length) $(overlay_images_loading_template).appendTo(document.body);	
		$('.ian-overlay-loading').css({
			'width': Math.round((overlay_images_exif_count / overlay_images.length) * 100).toString() + '%'
		});
		if(overlay_images_exif_count < overlay_images.length) return;
		$('.ian-overlay-loading').remove();
		if(overlay_images.length) {
			// render
			if(overlay_images_index < 0) {
				_ianOverlayNext();
			} else {
				_ianOverlayImagesDisplay();
			};
			// overlay actions
			if(overlay_images.length < 2) {
				$('.ian-overlay-info-container .ian-btn-arrow, .ian-overlay-info-container .ian-images-count').css({
					'display': 'none',
					'visibility': 'hidden'
				});
			} else {
				$.each($('.ian-overlay-info-container .ian-btn-arrow'), function(index, button) {
					$(button).off('click').on('click', function(e) {
						if($(this).attr('data-direction') == 'previous') {
							_ianOverlayPrevious();
						} else if($(this).attr('data-direction') == 'next') {
							_ianOverlayNext();
						};
					});
				});
			};
			$('.ian-overlay-info-container .ian-btn-close').off('click').on('click', function(e) {
				$('.ian-overlay-container, .ian-overlay-media-container, .ian-overlay-info-container').removeClass('open');
				setTimeout(function() {
					$('.ian-overlay-container').remove();
					$(document.body).removeClass('ian-overlay-active');
				}, 750);	
				overlay_images_raw = null;
				overlay_images = [];
				overlay_images_current = null;
				overlay_images_index = -1;
			});
			$('.ian-overlay-info-container .ian-btn-download').off('click').on('click', function(e) {
				overlay_download_element = document.createElement('a');
				overlay_download_element.href = overlay_images_current.useableSource;
				overlay_download_element.download = overlay_images_current.name;
				document.body.appendChild(overlay_download_element);
				overlay_download_element.click();
				document.body.removeChild(overlay_download_element);
			});
			$('.ian-overlay-info-container hr[data-expand]').off('click').on('click', function(e) {
				if($(this).hasClass('expanded')) {
					$(this).removeClass('expanded');
					$('.ian-overlay-info-container pre[data-expand="' + $(this).attr('data-expand') + '"]').removeClass('expanded');
				} else {
					$(this).addClass('expanded');
					$('.ian-overlay-info-container pre[data-expand="' + $(this).attr('data-expand') + '"]').addClass('expanded');
				};			
			});
			$('a[data-expand]').off('click').on('click', function(e) {
				$('a[data-expand]').removeClass('active');
				$('div[data-expand]').removeClass('open');
				$(this).addClass('active');
				$('div[data-expand="' + $(this).attr('data-expand') + '"]').addClass('open');
			});
			// end overlay actions
		} else {
			// no suitable images found
			$(overlay_images_message.replace(/{{message}}/, 'No suitable &lt;img&gt; found')).appendTo(document.body);
			setTimeout(function() {
				$('.ian-overlay-message').addClass('open');
				setTimeout(function() {
					$('.ian-overlay-message').removeClass('open');
					setTimeout(function() {
						$('.ian-overlay-message').remove();
					}, 200);
				}, 2000);
			}, 250);
		};
	};
	
	var _ianOverlayNext = function() {
		overlay_images_index += 1;
		if(overlay_images_index > (overlay_images.length - 1)) overlay_images_index = 0;
		_ianOverlayImagesDisplay();
	};
	
	var _ianOverlayPrevious = function() {
		overlay_images_index -= 1;
		if(overlay_images_index < 0) overlay_images_index = overlay_images.length - 1;	
		_ianOverlayImagesDisplay();
	};
	
	var _ianOverlayImagesDisplay = function() {
		overlay_images_current = overlay_images[overlay_images_index];
		if(!$('.ian-overlay-container').length) {
			$(overlay_images_container_template).appendTo(document.body);
			$(document.body).addClass('ian-overlay-active');
			setTimeout(function() {
				$('.ian-overlay-container, .ian-overlay-info-container, .ian-overlay-media-container').addClass('open');
			}, 100);
		};
		$('.ian-images-count span:first').html(overlay_images_index + 1);
		$('.ian-images-count span:last').html(overlay_images.length);
		$('.ian-overlay-media-container img').fadeOut('fast', function() {
			$('.ian-overlay-media-container img').attr('src', overlay_images_current.useableSource).fadeIn('fast').off('load').on('load', function(e) {
				// get histogram
				var src = $('.ian-overlay-media-container img').attr('src');
				if(src.indexOf('//') == -1) {
					if(src.indexOf('/') !== 0) {
						var page_url = document.location.href.split('/');
						page_url.pop();
						page_url = page_url.join('/') + '/';	
						src = page_url + src;
					} else {
						src = document.location.origin + src;
					};
				};
				chrome.runtime.sendMessage({
					'action' : 'IMAGE_ANALYZER_IMAGE_HISTOGRAM',
					'img': src
				}, _ianOverlayImagesDisplayHistogram);
				chrome.runtime.sendMessage({
					'action' : 'IMAGE_ANALYZER_IMAGE_HISTOGRAM_AVERAGE',
					'img': src
				}, _ianOverlayImagesDisplayHistogramAverage);
			});
		});
		$.each($('.ian-overlay-container [data-property]'), function(index, element) {
			var property = $(this).attr('data-property');
			var value = _getDescendantProp(overlay_images_current, property);
			if(value == undefined) {
				$(this).find('span').html('n/a');
			} else if(value.constructor != undefined && value.constructor == Number) {
				if($(this).attr('data-display-type') != undefined && $(this).attr('data-display-type') == 'fraction') {
					var fraction = new Fraction(value.valueOf());
					$(this).find('span').html(fraction.numerator + '/' + fraction.denominator);
				} else {
					$(this).find('span').html(value.valueOf());
				};
			} else {
				$(this).find('span').html(value);	
			};
		});
		$('.ian-overlay-info-container pre[data-expand="attributes"]').html('');
		$.each($(overlay_images_current.imageRef)[0].attributes, function(index, attribute) {
			$('.ian-overlay-info-container pre[data-expand="attributes"]').append(this.nodeName + ' : ' + this.nodeValue + '\n');
		});
		$('.ian-overlay-info-container pre[data-expand="exif"]').html(overlay_images_current.exifPretty);
	};
	
	var _ianOverlayImagesDisplayHistogram = function(data) {
		var ctx = $('#histogram-rgb canvas')[0].getContext('2d');
		ctx.clearRect(0, 0, $('#histogram-rgb canvas').width(), $('#histogram-rgb canvas').height());
		var rmax = Math.max.apply(null, data.rvals);
		var bmax = Math.max.apply(null, data.bvals);
		var gmax = Math.max.apply(null, data.gvals);
		_ianOverlayImagesDisplayHistogramColorBars(ctx, rmax, data.rvals, 'rgb(255, 0, 0)', 100);
		_ianOverlayImagesDisplayHistogramColorBars(ctx, gmax, data.gvals, 'rgb(0, 255, 0)', 200);
		_ianOverlayImagesDisplayHistogramColorBars(ctx, bmax, data.bvals, 'rgb(0, 0, 255)', 300);
	};
	
	var _ianOverlayImagesDisplayHistogramAverage = function(data) {
		var ctx = $('#histogram-avg canvas')[0].getContext('2d');
		ctx.clearRect(0, 0, $('#histogram-avg canvas').width(), $('#histogram-avg canvas').height());
		var max = Math.max.apply(null, data.values);
		$.each(data.values, function(i, x) {
			var pct = (data.values[i] / max) * 100;
			ctx.fillRect(i, 100, 1, -Math.round(pct));
		});
	};
	
	var _ianOverlayImagesDisplayHistogramColorBars = function(ctx, max, vals, color, y) {
		ctx.fillStyle = color;
		$.each(vals, function(i, x) {
			var pct = (vals[i] / max) * 100;
			ctx.fillRect(i, y, 1, -Math.round(pct));
		});
	};
	
	var _ianOverlayGetElementsWithBackgroundImage = function() {
		var tags = document.getElementsByTagName('*'),
			el = null,
			elements = [];
		for (var i = 0; i < tags.length; i++) {
			el = tags[i];
			if (el.currentStyle) {
				if(el.currentStyle['backgroundImage'] !== 'none') { 
					elements.push(el);
				};
			} else if (window.getComputedStyle) {
				if(document.defaultView.getComputedStyle(el, null).getPropertyValue('background-image') !== 'none') {
					elements.push(el);
				};
			};
		};
		return elements;
	};
	
	var _getDescendantProp = function(obj, path) {
		var arr = path.split('.');
		while(arr.length && (obj = obj[arr.shift()]));
		return obj;
	}
	
	// http://scratch99.com/web-development/javascript/convert-bytes-to-mb-kb/
	var _bytesToSize = function(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return 'n/a';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i == 0) return bytes + ' ' + sizes[i];
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	};
	/**
		Public
	**/
	return {
		init: _init
	}
}());
IMAGE_ANALYZER_EXTENSION.init();