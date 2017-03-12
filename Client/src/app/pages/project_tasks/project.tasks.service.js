
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.projectTasks')
      .service('projectTasksService', projectTasksService);

  /** @ngInject */
  function projectTasksService(apiService) {
    // apiService.tasks.getTasksTableData().then(function (res){
    //   angular.copy(res.data, service.tableData);
    // });
    var service = {
        tableData:[],
        projectLayerType: "",
        getTableStructure: function(){
          return apiService.edit.projects.tasks.getTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(task_id){
            return apiService.tasks.deleteTask(task_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            var _service = this;
            return apiService.edit.projects.tasks.getTasksTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, _service.tableData);
                _service.projectLayerType = res.data.project_layer_type;
                return _service.tableData;
            });
        },
        getProjectLayerType: function(){
          return service.projectLayerType;
      }
    };
    return service;
  }

})();
