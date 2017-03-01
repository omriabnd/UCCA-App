(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages', [
    'zAdmin.pages.edit.passages.texts',
    'zAdmin.pages.edit.passages.sources',
    'zAdmin.pages.edit.passages.tasks',
    'zAdmin.pages.edit.passages.projects'
  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.passages', {
            url: '/passages/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Passages',
            controller: 'EditPassagesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:function(editPassagesService){return editPassagesService.getEditTableStructure()},
              PassageTableData:function(editPassagesService,$stateParams){
                if($stateParams.id != ""){
                  return editPassagesService.getPassageData($stateParams.id)
                }
                editPassagesService.clearData();
                return null;
              }
            }
          });
    }

})();
