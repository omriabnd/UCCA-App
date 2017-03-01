(function () {
  'use strict';

  angular.module('zAdmin.pages.reg', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('reg', {
            url: '/reg',
            templateUrl: 'app/pages/reg/reg.html',
            title: 'reg',
            controller: 'regCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 1,
            },
          });
    }

})();