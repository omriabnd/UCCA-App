/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.projects', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('projects', {
                url: '/projects',
                templateUrl: 'app/pages/projects/projects.html',
                title: 'Projects',
                controller: 'ProjectsCtrl',
                controllerAs: 'vm',
                sidebarMeta: {
                    icon: 'ion-document-text',
                    order: 2,
                    showOnSideBar:false
                },
                state_id:2,
                resolve:{
                    TableStructure:function(projectsService){return projectsService.getTableStructure()},
                    TableData:function(projectsService){return projectsService.getTableData()}
                }
            });
    }

})();