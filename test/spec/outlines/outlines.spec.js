'use strict';

describe('outlines', function() {
    // load the module
    beforeEach(module('eWaterCycleApp'));
    beforeEach(module('eWaterCycleApp.utils'));
    
    //Create a mocked CesiumViewerService.viewer.dataSources.add function.
    var mockCesiumViewerService;    
    beforeEach(module('eWaterCycleApp.cesiumViewer', function ($provide) {
        mockCesiumViewerService = {
          viewer: {
              dataSources: {
                  add : jasmine.createSpy('add')
              }
            }
        };
        
        $provide.value('CesiumViewerService', mockCesiumViewerService);
    }));
    
    beforeEach(module('mockedCountries'));
    
    var $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_, defaultCountriesJSON, defaultCountriesAbwGeoJSON, defaultCountriesAfgGeoJSON) {        
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('bower_components/countries/countries.json').respond(200, defaultCountriesJSON); 
        $httpBackend.expectGET('bower_components/countries/data/abw.geo.json').respond(200, defaultCountriesAbwGeoJSON); 
        $httpBackend.expectGET('bower_components/countries/data/afg.geo.json').respond(200, defaultCountriesAfgGeoJSON); 
    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
        
    it("should create an application controller", inject(function($rootScope, $controller){
        var scope = $rootScope.$new();
        var ctrl = $controller("OutlinesController", { $scope: scope });
        $httpBackend.flush();
    })); 
    
    describe('directive', function() {            
        var element = '<outlines-toggle-directive></outlines-toggle-directive>';
        var html;
        var scope;
        
        beforeEach(function() {
            inject(function($rootScope, $compile) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                $httpBackend.flush();
                scope.$digest();
            });
        });
        
        it('should create an element with text', function() {               
            expect(html.text()).toContain('Outlines?');
        });

        it('should create a checkbox with 2-way data binding to ol.outlines', function() {              
            expect(html.html()).toContain('input type="checkbox" ng-model="ol.outlines"');            
        });
        
        it('should create a scope variable (ol.outlines) that is false', function() {            
            expect(scope.ol.outlines).toBeFalsy();
        });
    });  
    
    describe('init', function() {     
        var scope;
        var ctrl;
        
        beforeEach(function() {
            inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                ctrl = $controller("OutlinesController", { $scope: scope });
            });
        });
        
        it('should have called the cesium library to add a datasource', function() {
            $httpBackend.flush();
            expect(mockCesiumViewerService.viewer.dataSources.add).toHaveBeenCalled();
        });
    });  
    
    describe('watchers', function() {   
        var scope;
        var ctrl;
        var msgbus;
        
        beforeEach(function() {
            inject(function($rootScope, $controller, Messagebus) {
                msgbus = Messagebus;
                scope = $rootScope.$new();
                ctrl = $controller("OutlinesController", { $scope: scope });           
                $httpBackend.flush();
            });
        });
        
        it('should NOT publish a change to ol.outlines to the Messagebus when initialized', function() {
            spyOn(msgbus, 'publish');
            expect(msgbus.publish).not.toHaveBeenCalled();
        });
        
        it('should publish a change to ol.outlines to the Messagebus as "outlinesChange" when changed', function() {
            spyOn(msgbus, 'publish');
            scope.$apply('ol.outlines = true');
            expect(msgbus.publish).toHaveBeenCalledWith('outlinesChange', true);
            scope.$apply('ol.outlines = false');
            expect(msgbus.publish).toHaveBeenCalledWith('outlinesChange', false);
        });

        it('should listen to the messagebus for changes on "outlinesChange" and act accordingly', function() {
            scope.$apply(msgbus.publish('outlinesChange', true));
            expect(ctrl.outlines).toBeTruthy();
            scope.$apply(msgbus.publish('outlinesChange', false));
            expect(ctrl.outlines).toBeFalsy();
        });
        
    });
});