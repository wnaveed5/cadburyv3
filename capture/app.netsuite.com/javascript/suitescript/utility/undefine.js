/**
 * We need to temporarily disable define in order to correctly initialize 1.0 scripts and their libraries.
 * The define is later restored using define.js
 * Also, ensure that the define being removed is the one added by suitescript.
 */
if (typeof define !== 'undefined' && !!define.suitescript) {
	window._tmp_def = define;
	define = undefined;
}
