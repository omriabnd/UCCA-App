/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.review', [
        'zAdmin.pages.edit.tasks.review.annotator'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.review', {
                url: '/review/:projectLayerType/:projectId/:parentTaskId/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Review Task',
                controller: 'EditReviewTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editReviewTasksService){
                        return editReviewTasksService.getEditTableStructure()
                    },
                    SourceTableData:function(editReviewTasksService,$stateParams){
                        if($stateParams.id != ""){
                            return editReviewTasksService.getTaskData($stateParams.id)
                        }
                        editReviewTasksService.clearData();
                        return null;
                    }
                }
            });
    }


})();

