/*
	maxSpan, minSpan could be passed in via options of a range.
 */

someCallBackFunction = function () {
	console.log('option of a callback coming here');
}

$('.time-picker').mobile508TimePicker({
	onClose: someCallBackFunction
});
