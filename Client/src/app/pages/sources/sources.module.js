(function () {
  'use strict';

  angular.module('zAdmin.pages.sources', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('sources', {
            url: '/sources',
            templateUrl: 'app/pages/sources/sources.html',
            title: 'sources',
            controller: 'sourcesCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 7,
              showOnSideBar:false
            },
            state_id:7,
            resolve:{
              TableStructure:function(sourcesService){return sourcesService.getTableStructure()},
              TableData:function(sourcesService){return sourcesService.getTableData()}
            }
          });
    }

})();