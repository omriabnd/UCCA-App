
(function () {
  'use strict';

  angular.module('zAdmin.pages.ui.modals', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.modals', {
          url: '/modals',
          templateUrl: 'app/pages/ui/modals/modals.html',
          controller: 'ModalsPageCtrl',
          controllerAd: 'vm',
          title: 'Modals',
          sidebarMeta: {
            order: 300,
          },
        });
  }

})();
