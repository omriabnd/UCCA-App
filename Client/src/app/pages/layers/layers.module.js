/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.layers', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('layers', {
            url: '/layers',
            templateUrl: 'app/pages/layers/layers.html',
            title: 'Layers',
            controller: 'layersCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-cube',
              order: 5,
              showOnSideBar:false
            },
            state_id:5,
            resolve:{
              TableStructure:function(layersService){return layersService.getTableStructure();},
              TableData:function(layersService){
                  return layersService.getTableData();
              }
            }
          });
    }

})();
