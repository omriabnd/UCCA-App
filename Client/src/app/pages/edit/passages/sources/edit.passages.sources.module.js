/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages.sources', [
      
  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.passages.sources', {
            url: '/sources',
            template: '<ui-view></ui-view>',
            title: 'Edit Passages',
            abstract:true,
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:function(editPassageSourcesService){return editPassageSourcesService.getEditTableStructure()}
            }
          })
          .state('edit.passages.sources.manage', {
            url: '/sources',
            templateUrl: 'app/pages/edit/passages/sources/edit.passages.sources.html',
            title: 'Edit Passages',
            controller: 'EditPassagesSourcesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:function(editPassageSourcesService){return editPassageSourcesService.getEditTableStructure()},
              TableData:function(editPassageSourcesService){return editPassageSourcesService.getTableData()}
            }
          })
          .state('edit.passages.sources.create', {
            url: '/newsources',
            templateUrl: 'app/pages/edit/passages/sources/edit.passages.sources.create.html',
            title: 'Edit Passages',
            controller: 'EditSourcesCtrl',
            controllerAs: 'vm',
            params:{
                from:null
            },
            resolve:{
              EditTableStructure:function(editSourcesService){
                return editSourcesService.getEditTableStructure()
              },
              SourceTableData:function(editSourcesService,$stateParams){
                if($stateParams.id != ""){
                  editSourcesService.getSourceData($stateParams.id);
                }
                editSourcesService.clearData();
                return null;
              }
            }
          })
          ;
    }

})();