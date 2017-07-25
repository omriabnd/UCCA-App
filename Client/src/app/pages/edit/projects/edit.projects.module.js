/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.projects', [
        'zAdmin.pages.edit.projects.layers'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.projects', {
                url: '/projects/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Projects',
                controller: 'EditProjectsCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editProjectsService){
                        return editProjectsService.getEditTableStructure()
                    },
                    ProjectTableData:getData
                }
            });
    }

    function getData(editProjectsService,$stateParams){
        if($stateParams.id != ""){
            return editProjectsService.getProjectData($stateParams.id)
        }
        return editProjectsService.clearData();
    }

})();
