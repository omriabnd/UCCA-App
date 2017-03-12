
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tasks')
      .service('tasksService', tasksService);

  /** @ngInject */
  function tasksService(apiService) {
    apiService.tasks.getTasksTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.tasks.getTasksTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(task_id){
            return apiService.tasks.deleteTask(task_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.tasks.getTasksTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    };
    return service;
  }

})();
