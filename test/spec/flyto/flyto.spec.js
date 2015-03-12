'use strict';

describe('flyto', function() {
    // load the module
    beforeEach(module('eWaterCycleApp'));
    beforeEach(module('eWaterCycleApp.utils'));
        
    beforeEach(module('mockedCountries'));
        
    var $httpBackend;    
    beforeEach(inject(function(_$httpBackend_, defaultCountriesJSON) {        
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('bower_components/countries/countries.json').respond(200, defaultCountriesJSON);         
    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
        
    it("should create an application controller", inject(function($rootScope, $controller){
        var scope = $rootScope.$new();
        var ctrl = $controller("FlyToController", { $scope: scope });
        $httpBackend.flush();
    })); 
    
    describe('directive', function() {            
        var element = '<cesium-fly-to-dropdown-directive></cesium-fly-to-dropdown-directive>';
        var html;
        var scope;
        
        beforeEach(function() {
            inject(function($rootScope, $compile, $controller) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                $httpBackend.flush();
                scope.$digest();
            });
        });

        it('should create a dropdown header with explanatory text', function() {              
            expect(html.html()).toContain('a data-toggle="dropdown" href="#"> Fly To');            
        });
        
        it('should create a dropdown list with our 2 mocked countries', function() {              
            expect(scope.fdd.data.locations.countries.length).toBe(2);
            expect(scope.fdd.data.locations.countries[0].name.common).toMatch('Aruba');
            expect(scope.fdd.data.locations.countries[1].name.common).toMatch('Afghanistan');
        });
    });  
    
    describe('messages', function() {   
        var scope;
        var ctrl;
        var msgbus;
        
        beforeEach(function() {
            inject(function($rootScope, $controller, Messagebus) {
                msgbus = Messagebus;
                scope = $rootScope.$new();
                ctrl = $controller("FlyToController", { $scope: scope });           
                $httpBackend.flush();
            });
        });
        
        it('should NOT publish a change to the Messagebus when initialized', function() {
            spyOn(msgbus, 'publish');
            expect(msgbus.publish).not.toHaveBeenCalled();
        });
        
        it('should publish a messsage to Messagebus as "cesiumFlyToCountry" when selected', function() {
            spyOn(msgbus, 'publish');
            ctrl.selectCountry('Aruba');
            expect(msgbus.publish).toHaveBeenCalledWith('cesiumFlyToCountry', {country: 'Aruba', height: 10000000});
            ctrl.selectCountry('Afghanistan');
            expect(msgbus.publish).toHaveBeenCalledWith('cesiumFlyToCountry', {country: 'Afghanistan', height: 10000000});
        });      
    });
});