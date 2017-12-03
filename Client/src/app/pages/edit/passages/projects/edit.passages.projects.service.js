
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.passages.projects')
        .service('editPassageProjectsService', editPassageProjectsService);

    /** @ngInject */
    function editPassageProjectsService(apiService) {

        var service = {
            tableData:[],
            getTasksTableStructure: function(){
                return apiService.edit.passages.projects.getTasksTableStructure().then(function (res){return res.data});
            },
            getTableData: function(passageID){
                return apiService.edit.passages.projects.getTasksTableData(passageID).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return  service.tableData;
                });
            }
        }
        return service;
    }

})();