/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.passages.projects', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.passages.projects', {
                url: '/tasks',
                templateUrl: 'app/pages/edit/passages/tasks/edit.passages.tasks.html',
                title: 'View Passages Projects',
                controller: 'EditPassagesProjectsCtrl',
                controllerAs: 'vm',
                resolve:{
                    TableStructure:function(editPassageProjectsService){
                        return editPassageProjectsService.getTasksTableStructure()
                    },
                    TableData:function(editPassageProjectsService,$stateParams){
                        return editPassageProjectsService.getTableData($stateParams.id)
                    }
                }
            });
    }

})();