(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.categories', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.categories', {
            url: '/categories/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Categories',
            controller: 'EditCategoriesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:function(editCategoriesService){
                return editCategoriesService.getEditTableStructure()
              },
              CategoryTableData:getData
            }
          });
    }

    function getData(editCategoriesService,$stateParams){
      editCategoriesService.clearData();
      if($stateParams.id != ""){
        return editCategoriesService.getCategoryData($stateParams.id)
      }
      return null;
    }

})();
