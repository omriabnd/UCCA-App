/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.sources', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.sources', {
            url: '/sources/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Sources',
            controller: 'EditSourcesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:function(editSourcesService){
                return editSourcesService.getEditTableStructure()
              },
              SourceTableData:function(editSourcesService,$stateParams){
                if($stateParams.id != ""){
                  return editSourcesService.getSourceData($stateParams.id)
                }
                editSourcesService.clearData();
                return null;
              }
            }
          });
    }

})();