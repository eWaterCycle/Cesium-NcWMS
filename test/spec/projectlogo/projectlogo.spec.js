'use strict';

describe('projectlogo', function() {
    // load the module
    beforeEach(module('eWaterCycleApp'));
        
    describe('directive', function() {            
        var element = '<project-logo-box-directive></project-logo-box-directive>';
        var html;
        var scope;
        
        beforeEach(function() {
            inject(function($rootScope, $compile) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                scope.$digest();
            });
        });
        
        it('should create an element with the project logo', function() {        
            expect(html.html()).toContain('img class="logo-custom-ewatercycle" src="images/eWaterCycle_3.svg"');
        });
    });
});