
(function () {
  'use strict';

  angular.module('zAdmin.pages.dashboard', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {

    $stateProvider
        .state('dashboard', {
          url: '/dashboard',
          templateUrl: 'app/pages/dashboard/dashboard.html',
          title: 'Dashboard',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 0
          },
            data: {
                permissions: {
                    only: 'GUEST',
                    redirectTo: 'auth'
                }
            }
        });
  }

})();
