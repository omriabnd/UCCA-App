
(function () {
  'use strict';

  angular.module('zAdmin.pages.charts', [
      'zAdmin.pages.charts.amCharts',
      'zAdmin.pages.charts.chartJs',
      'zAdmin.pages.charts.chartist',
      'zAdmin.pages.charts.morris'
  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('charts', {
          url: '/charts',
          abstract: true,
          template: '<div ui-view></div>',
          title: 'Charts',
          sidebarMeta: {
            icon: 'ion-stats-bars',
            order: 150,
          },
        });
  }

})();
