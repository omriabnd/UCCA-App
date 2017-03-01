/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('zAdmin.pages.dashboard')
      .directive('zFeed', zFeed);

  /** @ngInject */
  function zFeed() {
    return {
      restrict: 'E',
      controller: 'zFeedCtrl',
      templateUrl: 'app/pages/dashboard/zFeed/zFeed.html'
    };
  }
})();