
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.sources')
      .service('editSourcesService', editSourcesService);

  /** @ngInject */
  function editSourcesService(apiService, Core) {
    /*apiService.sources.getSourceTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getEditTableStructure: function(){
          return apiService.edit.sources.getEditSourceTableStructure().then(function (res){return res.data});
        },
        getSourceData: function(sourceId){
          var _service = this;
          return apiService.edit.sources.getSourceData(sourceId).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        saveSourceDetails: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return !bodyData.id ? apiService.edit.sources.postSourceData(bodyData).then(function (res){return res.data}) :  apiService.edit.sources.putSourceData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          service.Data = data;
        },
        get:function(key){
          return this.Data[key];
        },
        clearData: function(){
          service.Data = {};
        }
    }
    return service;
  }

})();
