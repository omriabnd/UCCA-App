/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.passages', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('passages', {
            url: '/passages',
            templateUrl: 'app/pages/passages/passages.html',
            title: 'Passages',
            controller: 'PassagesCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 6,
              showOnSideBar:false
            },
            state_id:6,
            resolve:{
              TableStructure:function(passagesService){return passagesService.getTableStructure()},
              TableData:function(passagesService){return passagesService.getTableData()}
            }
          });
    }

})();