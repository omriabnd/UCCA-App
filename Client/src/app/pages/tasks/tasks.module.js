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
            title: 'tasks',
            controller: 'tasksCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
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
