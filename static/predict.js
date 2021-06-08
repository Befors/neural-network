let imageLoaded = false;
$("#image-selector").change(function () {
	imageLoaded = false;
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
		imageLoaded = true;
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

let model;
let modelLoaded = false;
$( document ).ready(async function () {
	modelLoaded = false;
	$('.progress-bar').show();
    model = await tf.loadGraphModel('model/model.json');
	$('.progress-bar').hide();
	modelLoaded = true;
});

$("#predict-button").click(async function () {
	if (!modelLoaded) { alert("Сначала должна быть загружена модель"); return; }
	if (!imageLoaded) { alert("Сначала выберите изображение"); return; }
	
	let image = $('#selected-image').get(0);
	
	let tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([224, 224])
		.expandDims()
		.toFloat()
		.reverse(-1);
	let predictions = await model.predict(tensor).data();
	
	let top5 = Array.from(predictions)
		.map(function (p, i) {
			return {
				probability: p,
				className: TARGET_CLASSES[i]
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 2);

	$("#prediction-list").empty();
	top5.forEach(function (p) {
		$("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);
		});
});
