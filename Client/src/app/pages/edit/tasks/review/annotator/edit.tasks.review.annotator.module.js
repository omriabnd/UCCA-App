/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.review.annotator', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.review.annotator', {
                url: '/annotator',
                template: '<ui-view></ui-view>',
                title: 'Edit Review Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getEditTableStructure()
                    },
                    EditTableData:function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getTableData()
                    }
                }
            })
            .state('edit.tasks.review.annotator.manage', {
                url: '/annotator',
                templateUrl: 'app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.html',
                title: 'Edit Review Task',
                controller: 'EditReviewTaskAnnotatorCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getEditTableStructure();
                    },
                    UserTableData: function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getTableData();
                    }
                }
            })
            .state('edit.tasks.review.annotator.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.create.html',
                title: 'Edit Review Task',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editPassagesService){
                        return editUserService.getEditTableStructure()
                    }
                }
            })
        ;
    }

})();