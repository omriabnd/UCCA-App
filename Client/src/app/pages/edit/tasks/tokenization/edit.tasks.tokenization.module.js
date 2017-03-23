/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization', [
        'zAdmin.pages.edit.tasks.tokenization.passages',
        'zAdmin.pages.edit.tasks.tokenization.annotator'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.tokenization', {
                url: '/tokenization/:projectLayerType/:projectId/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Tokenization Task',
                controller: 'EditTokenizationTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editTokenizationTasksService){
                        return editTokenizationTasksService.getEditTableStructure()
                    },
                    SourceTableData:function(editTokenizationTasksService,$stateParams){
                        if($stateParams.id != ""){
                            return editTokenizationTasksService.getTaskData($stateParams.id)
                        }
                        editTokenizationTasksService.clearData();
                        return null;
                    }
                }
            });
    }


})();

