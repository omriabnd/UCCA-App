/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.users', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('users', {
            url: '/users',
            templateUrl: 'app/pages/users/users.html',
            title: 'Users',
            controller: 'UsersCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 1,
              showOnSideBar:false
            },
            state_id:1,
            data: {
                permissions: {
                    only: "1",
                    redirectTo: 'auth'
                }
            },
            resolve:{
              TableStructure:function(usersService){return usersService.getTableStructure()},
              TableData:function(usersService){return usersService.getTableData()}
            }
          });
    }

})();