'use strict';

describe('logoBox', function() {
    // load the module
    beforeEach(module('eWaterCycleApp.templates'));
    beforeEach(module('eWaterCycleApp.logos'));

    describe('directive', function() {
        var element = '<logo-box-directive></logo-box-directive>';
        var html;
        var scope;

        beforeEach(function() {
            inject(function($rootScope, $compile) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                scope.$digest();
            });
        });

        it('should create an element with the nlesc logo and link', function() {
            expect(html.html()).toContain('a href="http://www.esciencecenter.nl"');
            expect(html.html()).toContain('img class="logo-custom-nlesc" src="images/ESCIENCE_logo.png"');
        });

        it('should create an element with the tudelft logo and link', function() {
            expect(html.html()).toContain('a href="http://wrm.tudelft.nl"');
            expect(html.html()).toContain('img class="logo-custom-tud" src="images/preTU_P5_white1409040577.gif"');
        });

        it('should create an element with the uu logo and link', function() {
            expect(html.html()).toContain('a href="http://www.uu.nl"');
            expect(html.html()).toContain('img class="logo-custom-uu" src="images/UU-logo2011_RGB_diap.png"');
        });
    });
});
