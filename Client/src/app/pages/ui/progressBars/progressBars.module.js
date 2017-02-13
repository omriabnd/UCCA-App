
(function () {
  'use strict';

  angular.module('zAdmin.pages.ui.progressBars', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.progressBars', {
          url: '/progressBars',
          templateUrl: 'app/pages/ui/progressBars/progressBars.html',
          title: 'Progress Bars',
          sidebarMeta: {
            order: 600,
          },
        });
  }

})();
