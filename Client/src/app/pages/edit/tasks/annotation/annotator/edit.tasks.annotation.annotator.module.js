/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.annotation.annotator', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.annotation.annotator', {
                url: '/annotator',
                template: '<ui-view></ui-view>',
                title: 'Edit Annotation Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getEditTableStructure()
                    },
                    EditTableData:function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getTableData()
                    }
                }
            })
            .state('edit.tasks.annotation.annotator.manage', {
                url: '/annotator',
                templateUrl: 'app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.html',
                title: 'Edit Annotation Task',
                controller: 'EditAnnotationTaskAnnotatorCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getEditTableStructure();
                    },
                    UserTableData: function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getTableData();
                    }
                }
            })
            .state('edit.tasks.annotation.annotator.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.create.html',
                title: 'Edit Annotation Task',
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