(function () {
  'use strict';

  angular.module('zAdmin.pages.categories', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('categories', {
            url: '/categories',
            templateUrl: 'app/pages/categories/categories.html',
            title: 'Categories',
            controller: 'categoriesCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 4,
              showOnSideBar:false
            },
            state_id:4,
            resolve:{
              TableStructure:function(categoriesService){return categoriesService.getTableStructure()},
              TableData:function(categoriesService){return categoriesService.getTableData()}
            }
          });
    }

})();
