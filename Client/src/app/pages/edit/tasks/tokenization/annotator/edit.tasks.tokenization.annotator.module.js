/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization.annotator', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.tokenization.annotator', {
                url: '/annotator',
                template: '<ui-view></ui-view>',
                title: 'Edit Tokenization Task Annotator',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getEditTableStructure()
                    },
                    EditTableData:function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getTableData()
                    }
                }
            })
            .state('edit.tasks.tokenization.annotator.manage', {
                url: '/annotator',
                templateUrl: 'app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.html',
                title: 'Edit Tokenization Task annotator',
                controller: 'EditTokenizationTaskAnnotatorCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getEditTableStructure();
                    },
                    UserTableData: function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getTableData();
                    }
                }
            })
            .state('edit.tasks.tokenization.annotator.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.create.html',
                title: 'New User',
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