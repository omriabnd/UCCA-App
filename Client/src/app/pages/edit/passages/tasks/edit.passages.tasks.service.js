
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.passages.tasks')
        .service('editPassageTasksService', editPassageTasksService);

    /** @ngInject */
    function editPassageTasksService(apiService) {

        var service = {
            tableData:[],
            getTasksTableStructure: function(){
                return apiService.edit.passages.tasks.getTasksTableStructure().then(function (res){return res.data});
            },
            getTableData: function(passageID){
                return apiService.edit.passages.tasks.getTasksTableData(passageID).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return  service.tableData;
                });
            }
        }
        return service;
    }

})();