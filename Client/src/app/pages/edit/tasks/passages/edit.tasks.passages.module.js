(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.passages', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.passages', {
                url: '/tasks',
                template: '<ui-view></ui-view>',
                title: 'Edit Task Passages',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editTaskPassagesService){
                        return editTaskPassagesService.getEditTableStructure()
                    },
                    EditTableData:function(editTaskPassagesService){
                        return editTaskPassagesService.getTableData()
                    }
                }
            })
            .state('edit.tasks.passages.manage', {
                url: '/tasks/:id',
                templateUrl: 'app/pages/edit/tasks/passages/edit.tasks.passages.html',
                title: 'Edit Task Passages',
                controller: 'EditTaskPassagesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:function(editTaskPassagesService){
                        return editTaskPassagesService.getEditTableStructure();
                    },
                    PassagesTableData: function(editTaskPassagesService){
                        return editTaskPassagesService.getPassagesTableData();
                    }
                }
            })
            .state('edit.tasks.passages.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/passages/edit.tasks.passages.create.html',
                title: 'New Passage',
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