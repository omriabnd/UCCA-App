/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tasks', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('tasks', {
            url: '/tasks',
            templateUrl: 'app/pages/tasks/tasks.html',
            title: 'Tasks',
            controller: 'tasksCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-checkbox-outline',
              order: 3,
              showOnSideBar:false
            },
            state_id: 3,
            resolve:{
              TableStructure:function(tasksService){return tasksService.getTableStructure();},
              TableData:function(tasksService){return tasksService.getTableData();}
            }
          });
    }

})();
