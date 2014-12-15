describe("BodyCtrl", function() {

	beforeEach(module('myApp'));

	var cesiumContainer, creditsContainer, animationContainer, cesiumTimeline;
	var viewer;
	beforeEach(function() {
		cesiumContainer = document.createElement('div');
		cesiumContainer.id = 'cesiumContainer';
		cesiumContainer.style.width = '1px';
		cesiumContainer.style.height = '1px';
		cesiumContainer.style.overflow = 'hidden';
		cesiumContainer.style.position = 'relative';
		document.body.appendChild(cesiumContainer);

		creditsContainer = document.createElement('div');
		creditsContainer.id = 'cesiumCredits';
		creditsContainer.style.width = '1px';
		creditsContainer.style.height = '1px';
		creditsContainer.style.overflow = 'hidden';
		creditsContainer.style.position = 'relative';
		document.body.appendChild(creditsContainer);

		animationContainer = document.createElement('div');
		animationContainer.id = 'animationContainer';
		animationContainer.style.width = '1px';
		animationContainer.style.height = '1px';
		animationContainer.style.overflow = 'hidden';
		animationContainer.style.position = 'relative';
		document.body.appendChild(animationContainer);

		cesiumTimeline = document.createElement('div');
		cesiumTimeline.id = 'cesiumTimeline';
		cesiumTimeline.style.width = '1px';
		cesiumTimeline.style.height = '1px';
		cesiumTimeline.style.overflow = 'hidden';
		cesiumTimeline.style.position = 'relative';
		document.body.appendChild(cesiumTimeline);

	});

	afterEach(function() {
		document.body.removeChild(cesiumContainer);
		document.body.removeChild(creditsContainer);
		document.body.removeChild(animationContainer);
		document.body.removeChild(cesiumTimeline);
	});

	it("should initialize cesium", inject(function($controller) {
		var scope = {};

		initScope(scope);

		var viewer = initCesium(false);

		expect(viewer).toBeDefined();

	}));

	it("should initialize all variables in the scope", inject(function($controller) {
		var scope = {};

		initScope(scope);

		expect(scope.baseMap).toEqual(true);
		expect(scope.ncWMSdata).toEqual({
			"metadata" : {},
			"palettes" : []
		});
		expect(scope.datasets).toEqual([]);
		expect(scope.selectedDataset).toEqual("default");
		expect(scope.selectedPalette).toEqual("default");
		expect(scope.selectedTime).toEqual(new Date(Date.UTC(1960, 0, 31, 0, 0, 0)));
		expect(scope.baseMap).toEqual(true);
		expect(scope.logarithmic).toEqual(false);
		expect(scope.annotations).toEqual(false);
		expect(scope.outlines).toEqual(false);
		expect(scope.uncertainty).toEqual(false);
		expect(scope.legendMin).toEqual(0);
		expect(scope.legendMax).toEqual(50);
		expect(scope.legendText).toEqual([ 10, 20, 30, 40 ]);
		expect(scope.selectedUnits).toEqual("");
	}));

});