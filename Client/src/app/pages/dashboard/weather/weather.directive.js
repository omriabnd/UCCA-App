/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('zAdmin.pages.dashboard')
      .directive('weather', weather);

  /** @ngInject */
  function weather() {
    return {
      restrict: 'EA',
      controller: 'WeatherCtrl',
      templateUrl: 'app/pages/dashboard/weather/weather.html'
    };
  }
})();