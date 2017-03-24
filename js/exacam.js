// This file is part of Exabis Quiz Camera
//
// (c) 2017 GTN - Global Training Network GmbH <office@gtn-solutions.com>
//
// Exabis Competence Grid is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This script is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You can find the GNU General Public License at <http://www.gnu.org/licenses/>.
//
// This copyright notice MUST APPEAR in all copies of the script!

!function () {

	var block_exacam = window.block_exacam = {
		get_param: function (name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(location.search);

			return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		popup_iframe: function (config) {

			// allow passing of an url
			if (typeof config == 'string') {
				config = {
					url: config
				};
			}

			var popup = this.last_popup = new M.core.dialogue({
				headerContent: config.headerContent || config.title || 'Popup', // M.str.moodle.loadinghelp, // previousimagelink + '<div id=\"imagenumber\" class=\"imagetitle\"><h1> Image '
				// + screennumber + ' / ' + this.imageidnumbers[imageid] + ' </h1></div>' + nextimagelink,

				bodyContent: '<iframe src="' + config.url + '" width="100%" height="100%" frameborder="0"></iframe>',
				visible: true, //by default it is not displayed
				modal: false, // sollte true sein, aber wegen moodle bug springt dann das fenster immer nach oben
				zIndex: 1000,
				// ok: width: '80%',
				// ok: width: '500px',
				// ok: width: null, = automatic
				height: config.height || '80%',
				width: config.width || '85%',
			});

			// disable scrollbars
			$(window).disablescroll();

			// hack my own overlay, because moodle dialogue modal is not working
			var overlay = $('<div style="opacity:0.7; filter: alpha(opacity=20); background-color:#000; width:100%; height:100%; z-index:10; top:0; left:0; position:fixed;"></div>')
				.appendTo('body');
			// hide popup when clicking overlay
			overlay.click(function () {
				popup.hide();
			});

			popup.justHide = popup.hide;
			var orig_hide = popup.hide;
			popup.hide = function () {

				if (config.onhide) {
					config.onhide();
				}

				// remove overlay, when hiding popup
				overlay.remove();

				// enable scrolling
				$(window).disablescroll('undo');

				// call original popup.hide()
				orig_hide.call(popup);
			};

			popup.remove = function () {
				if (this.$body.is(':visible')) {
					this.hide();
				}

				this.destroy();
			};

			return popup;
		},

		body_param: function (param) {
			var cl = $('body').attr('class');
			res = cl.replace(new RegExp('^(.*\\s)?' + param + '-([^\\s]+)(\\s.*)?$'), '$2');
			return res == cl ? null : res;
		}
	};

	$(function () {
		if (!window.exacam_config || !window.exacam_config.active) {
			return;
		}

		$(document).on('submit', 'form[action*="startattempt.php"]', function (e) {
			e.preventDefault();

			var form = this;
			var popup;

			window.exacam_webcamtest_finished = function () {
				popup.justHide();
				form.submit();
			};

			popup = block_exacam.popup_iframe({
				url: M.cfg.wwwroot + '/blocks/exacam/quizstart.php?cmid=' + block_exacam.get_param('id')
			});
		});

		if ($('body#page-mod-quiz-attempt').length) {
			var layer = $('<div><b>Webcam Status:</b>'
				+ '<div id="my_camera"></div>'
				// + (window.exacam_config.is_teacher && 'asdf')
				+ '</div>');
			layer.appendTo('div[role="main"]');

			var interval;

			function webcam_error(err) {
				window.clearInterval(interval);
				alert(err);
				window.location.href = M.cfg.wwwroot + '/mod/quiz/view.php?id=' + block_exacam.body_param('cmid');
				//window.location.href = M.cfg.wwwroot + '/course/view.php?id=' + block_exacam.body_param('course');
			}

			Webcam.set({
				width: 100,
				height: 100,
				dest_width: 640,
				dest_height: 480,
				image_format: 'jpeg',
				jpeg_quality: 85
			});
			Webcam.attach('#my_camera');

			Webcam.on('live', function () {
				// camera is live, showing preview image
				// (and user has allowed access)

				function snap() {
					console.log('snap');
					Webcam.snap(function (data_uri) {
						// snap complete, image data is in 'data_uri'

						console.log('upload');
						Webcam.upload(data_uri, M.cfg.wwwroot + '/blocks/exacam/upload.php?cmid=' + block_exacam.body_param('cmid'), function (code, text) {
							// Upload complete!
							// 'code' will be the HTTP response code from the server, e.g. 200
							// 'text' will be the raw response content

							if (code != 200) {
								return webcam_error('Fehler beim speichern des Webcam Bildes');
							}

							if (text !== 'ok') {
								if (text.match(/\n/)) {
									return webcam_error('Unbekannter fehler');
								} else {
									return webcam_error(text);
								}
							}
						});

					});
				}

				if (!window.exacam_config.is_teacher) {
					interval = window.setInterval(snap, 2 * 60 * 1000);
					snap();
				}
			});

			Webcam.on('error', function (err) {
				webcam_error(err);
			});
		}
	});
}();