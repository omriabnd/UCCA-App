
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.projects')
        .service('projectsService', projectsService);

    /** @ngInject */
    function projectsService(apiService) {
        /*apiService.projects.getProjectsTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });*/
        var service = {
            tableData:[],
            getTableStructure: function(){
                return apiService.projects.getProjectTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            delete: function(id){
                return apiService.projects.deleteProject(id).then(function (res){return res.data});
            },
            getTableData: function(searchTerms){
                return apiService.projects.getProjectsTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            }
        };
        return service;
    }

})();
