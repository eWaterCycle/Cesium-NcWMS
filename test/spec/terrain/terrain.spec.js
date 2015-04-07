'use strict';

describe('terrain', function() {
  // load the module
  beforeEach(module('eWaterCycleApp.utils'));
  beforeEach(module('eWaterCycleApp.terrain'));

  it('should create an application controller', inject(function($rootScope, $controller) {
    var scope = $rootScope.$new();
    $controller('TerrainController', {
      $scope: scope
    });
  }));

  describe('directive', function() {
    var element = '<terrain-toggle-directive></terrain-toggle-directive>';
    var html;
    var scope;

    beforeEach(function() {
      inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        html = $compile(element)(scope);
        scope.$digest();
      });
    });

    it('should create an element with a button', function() {
      expect(html.html()).toContain('<button ng-click="tr.toggleTerrain()"');
    });

    it('should have a data binding to tr.terrain', function() {
      expect(html.html()).toContain('ng-class="{active: tr.terrain}"');
    });

    it('should create a scope variable (tr.terrain) that is true', function() {
      expect(scope.tr.terrain).toBeTruthy();
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
        ctrl = $controller('TerrainController', {
          $scope: scope
        });
        scope.$digest();
      });
    });

    it('should NOT publish a change to tr.terrain to the Messagebus when initialized', function() {
      spyOn(msgbus, 'publish');
      expect(msgbus.publish).not.toHaveBeenCalled();
    });

    it('should publish a change to tr.terrain to the Messagebus as "terrainChange" when changed', function() {
      spyOn(msgbus, 'publish');

      ctrl.toggleTerrain();
      expect(msgbus.publish).toHaveBeenCalledWith('terrainChange', false);
      ctrl.toggleTerrain();
      expect(msgbus.publish).toHaveBeenCalledWith('terrainChange', true);
    });

    it('should listen to the messagebus for changes on "terrainChange" and act accordingly', function() {
      scope.$apply(msgbus.publish('terrainChange', true));
      expect(ctrl.terrain).toBeTruthy();
      scope.$apply(msgbus.publish('terrainChange', false));
      expect(ctrl.terrain).toBeFalsy();
    });

  });
});
