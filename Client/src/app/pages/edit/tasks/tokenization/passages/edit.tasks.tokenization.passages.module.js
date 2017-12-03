/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization.passages', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.tokenization.passages', {
                url: '/tasks/tokenization',
                template: '<ui-view></ui-view>',
                title: 'Edit Tokenization Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getEditTableStructure()
                    },
                    EditTableData:function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getTableData()
                    }
                }
            })
            .state('edit.tasks.tokenization.passages.manage', {
                url: '/tasks/tokenization/:id',
                templateUrl: 'app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.html',
                title: 'Edit Tokenization Task',
                controller: 'EditTokenizationTaskPassagesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getEditTableStructure();
                    },
                    PassagesTableData: function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getTableData();
                    }
                }
            })
            .state('edit.tasks.tokenization.passages.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.create.html',
                title: 'Edit Tokenization Task',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editPassagesService){
                        return editPassagesService.getEditTableStructure()
                    }
                }
            })
        ;
    }

})();