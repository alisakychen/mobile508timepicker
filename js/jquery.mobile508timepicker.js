/*
	Author: @jsdev | Anthony Delorie June 2013
	Github: https://github.com/jsdev/mobile508datepicker
	MIT License: as is, feel free to fork =)
	Tested on: IOS, Android, Surface, Modern Browsers, IE10+, IE9
 */

(function ($) {
	"use strict";
	$.fn.extend({
		mobile508TimePicker: function (options) {
			var _defaults = {
					min: { hours: 0, minutes: 0},
					max: { hours: 23, minutes: 59},
					increment: 5
				},
				defaults = null,
				$el = $('<section class="datetime-picker" id="time-picker" data-role="popup" data-dismissible="false" data-overlay-theme="a"> \
                            <a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right cancel">Close</a> \
                            <div class="columns"><b class="hours"></b><b class="minutes"></b><b class="ampm"></b></div> \
                            <button id="set-btn" data-theme="b" class="ui-btn-hidden" data-disabled="false">SET</button> \
                        </section>'),
				buildEl = function () {
					$('body').append($el);
					$el.trigger('create');
					$el.popup();
					return $el;
				},
				$textbox = null,
				timeChosen = null,
				buildDOM = function () {
					var i, n;

					$hours.add($minutes).empty();
					for(i = defaults.min.hours; i <= defaults.max.hours; i++) {
						n = leadZero(i);
						$hours.append('<li><button data-value="' + n + '">' + n + '</button></li>');
					}
					for(i = defaults.min.minutes; i <= defaults.max.minutes; i+= defaults.increment) {
						n = leadZero(i);
						$minutes.append('<li><button data-value="' + n + '">' + n + '</button></li>');
					}

					$columns
						.find('.hours').empty().append($hours).end()
						.find('.minutes').empty().append($minutes).end()
						.find('.ampm').empty().append($ampm);
					console.log('appended hours');
				},
				setTime = function () {
					$('.selected').removeAttr('class');
					$hours.find('[data-value="' + timeChosen.hours + '"]')
						.add($minutes.find('[data-value="' + timeChosen.minutes + '"]'))
						.addClass('selected')
						.scrollTopMe();
				},
				clicked = function ($this) {
					var $li = $this.focus().parent(),
						$ul = $li.parent(),
						$focused = $(':focus'),
						typ;

					if (!$this.length || $this.prop('disabled') ) {
						$focused.focus();
						return false;
					}
					typ = $ul.parent()[0].className;
					timeChosen[typ] = $this.data('value');
					setTime();
					return true;
				},
				scrolled = function ($ul) {
					var $lis = $ul.children(),
						lineHeight = $lis.eq(0).height(),
						top = $ul.position().top,
						n = Math.round(-top/lineHeight),
						$buttons = $ul.find('button'),
						$button = $lis.eq(n).find('button'),
						$prevSelected = $ul.find('.selected'),
						prevSelectedIndex = $buttons.index($prevSelected),
						typ = $ul.parent()[0].className;

					if (!$button.prop('disabled')) {
						if (prevSelectedIndex === n) {
							return;
						}
						$ul.scrollTop((-n * lineHeight) + lineHeight);
						timeChosen[typ] = $button.data()['value'];
						setTime();
						return;
					}

					if (prevSelectedIndex > n ) {
						$button = $ul.find('button:enabled').eq(0);
						n = $buttons.index($button);
						$ul.scrollTop((-n * lineHeight) + lineHeight);
						timeChosen[typ] = $button.data()['value'];
						setTime();
						return;
					}

					if (prevSelectedIndex < n ) {
						$button = $ul.find('button:enabled').eq(-1);
						n = $buttons.index($button);
						$ul.scrollTop((-n * lineHeight) + lineHeight);
						timeChosen[typ] = $button.data()['value'];
						setTime();
						return;
					}
				},
				destroy = function () {
					timeChosen = null;
				},
				close = function () {
					destroy();
					$el.popup('close');
					if (defaults.onClose) {
						defaults.onClose();
					}
					$textbox.focus();
				},
				alignValidDate = function () {
					var $uls = $el.find('ul'),
						$ul, $lis, lineHeight,
						$button, $buttons, top, n,
						orderSet = [0,1];

					while(orderSet.length) {
						$ul = $uls.eq(orderSet.pop());
						$buttons = $ul.find('button');
						$lis = $ul.children();
						lineHeight = $lis.eq(0).height();
						top = $ul.position().top;
						n = Math.round(-top/lineHeight);
						$button = $lis.eq(n).find('button');
						n = $buttons.index($button);
						$ul.scrollTop(-n * lineHeight);
						timeChosen[$ul.parent()[0].className] = $button.data()['value'];
						setTime();
					}

				},
				init = function () {
					var val = $textbox.val().split(':'),
						now = new Date(),
						increment = defaults.increment,
						floorMinutes = function(minutes) {
							return Math.floor(minutes/increment) * increment;
						};

					// check if val exists split on : if set
					timeChosen = val.length > 1
						? { hours: val[0], minutes: val[1] }
						: { hours: leadZero(now.getHours()), minutes: leadZero(floorMinutes(now.getMinutes())) };

					buildDOM();
					setTime();

					$el.find('.selected').eq(0).focus();

					$el.popup();
				},
				$hours = $('<ul></ul>'),
				$minutes = $('<ul></ul>'),
				$ampm = $('<ul></ul>'),
				$columns = $el.find('.columns'),
				$cancel =  $el.find('.cancel'),
				$setBtn = $el.find('#set-btn'),
				leadZero = function (i) {
					return ("0" + i).substr(-2);
				};

			$.extend(_defaults, options);

			$el.find('.hours')
				.on('scrollstop', function (e) {
					scrolled($(e.currentTarget).find('ul'));
				});
			$el.find('.minutes')
				.on('scrollstop', function (e) {
					scrolled($(e.currentTarget).find('ul'));
				});

			$el
				.on('click', '#set-btn', function () {
					var h = timeChosen.hours,
						m = timeChosen.minutes;

					alignValidDate();
					$textbox.val([h, m].join(':'));
					close();
				})
				.on('keydown', '#set-btn', function (e) {
					e.preventDefault();
					switch (e.which) {
						case 9:
							if (e.shiftKey) {
								$('.selected').eq(2).focus();
							} else {
								$cancel.focus();
							}
							break;
						case 13:
							e.currentTarget.click();
							break;
					}
				})
				.on('click', 'b button', function (e) {
					clicked($(e.currentTarget));
				})
				.on('keydown', 'b', function (e) {
					var $this = $(e.currentTarget),
						tab = function (dir) {
							var ifPossible = $this[dir]('b').find('.selected').length;

							if (ifPossible) {
								$this[dir]('b').find('.selected').focus();
								return;
							}

							switch (dir) {
								case "prev":
									$cancel.focus();
									break;
								case "next":
									$setBtn.focus();
									break;
							}
						},
						ifPossible = function (dir) {
							var $possible = $this
								.find('.selected')
								.parents('li')
								[dir]('li')
								.find('button');
							if ($possible.length && !$possible.prop('disabled')) {
								clicked($possible);
							}
						};
					e.preventDefault(); //prevents scroll
					switch (e.which) {
						case 9:
							if (e.shiftKey) {
								tab('prev');
							} else {
								tab('next');
							}
							break;
						case 37:
							tab('prev');
							break;
						case 38:
							ifPossible('prev');
							break;
						case 39:
							tab('next');
							break;
						case 40:
							ifPossible('next');
							break;
					}
				})
				.on('keydown', '.cancel', function (e) {
					e.preventDefault();
					switch (e.which) {
						case 9:
							if (e.shiftKey) {
								$setBtn.focus();
							} else {
								$('.month .selected').focus();
							}
							break;
						case 13:
							e.currentTarget.click();
							break;
					}
				})
				.on('click', '.cancel', function (e) {
					e.preventDefault();
					close();
				})
				.on('keydown', function (e) {
					if (e.which === 27) {
						close();
					}
				})

			//Iterate over the current set of matched elements
			return this.each(function () {
				var $this = $(this),
					$dp = $('#time-picker');

				//THIS WILL BUILD IT ONCE, vs. only once foreach in collection
				$dp.length || buildEl();

				$this
					.on('click', function (e) {
						$('.ui-popup-active .ui-popup').popup('close');
						$textbox = $(e.currentTarget);
						defaults = $.extend({}, _defaults);
						$.extend(defaults, $textbox.data('options'));
						init();
						$el.popup('open');
					})
					.on('keydown', function (e) {
						var EnterOrNumberKeys =[13,48,49,50,51,52,53,54,55,56,57];
						if (EnterOrNumberKeys.indexOf(e.which)+1) { e.currentTarget.click(); }
					})
			});
		},

		scrollTopMe: function(){
			return this.each(function () {
				var $li = $(this).parent(),
					$ul = $li.parent(),
					$b = $ul.parent(),
					scrollTop = $ul.children().index($li) * $li.height();

				$b.scrollTop(scrollTop);
			});
		}
	});

})(jQuery);

