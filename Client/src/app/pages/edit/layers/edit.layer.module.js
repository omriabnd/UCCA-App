(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.layers', [
    'zAdmin.pages.edit.layers.root',
    'zAdmin.pages.edit.layers.extension',
    'zAdmin.pages.edit.layers.coarsening',
    'zAdmin.pages.edit.layers.refinement',

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.layers', {
            url: '/layers',
            template : '<ui-view></ui-view>',
            abstract: true,
            title: 'Edit',
            controller:'EditLayerCtrl',
            controllerAs:'vmEditLayerCtrl',
            sidebarMeta: false
          });
    }

})();