/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.passages.tasks', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.passages.tasks', {
                url: '/tasks',
                templateUrl: 'app/pages/edit/passages/tasks/edit.passages.tasks.html',
                title: 'View Passages Tasks',
                controller: 'EditPassagesTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    TableStructure:function(editPassageTasksService){
                        return editPassageTasksService.getTasksTableStructure()
                    },
                    TableData:function(editPassageTasksService,$stateParams){
                        return editPassageTasksService.getTableData($stateParams.id)
                    }
                }
            });
    }

})();