/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.projectTasks', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('projectTasks', {
            url: '/project/:id/tasks/:layerType',
            templateUrl: 'app/pages/project_tasks/project.tasks.html',
            title: 'Project Tasks',
            controller: 'projectTasksCtrl',
            controllerAs: 'vm',
            sidebarMeta: false,
            state_id: 3,
            resolve:{
              TableStructure:function(projectTasksService){return projectTasksService.getTableStructure();},
              TableData:function(projectTasksService,$stateParams){
                  return projectTasksService.getTableData([{'searchKey':'project','searchValue': $stateParams.id}]);
              }
            }
          });
    }

})();
