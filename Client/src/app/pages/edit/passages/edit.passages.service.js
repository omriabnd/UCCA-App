
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages')
      .service('editPassagesService', editPassagesService);

  /** @ngInject */
  function editPassagesService(apiService,Core) {
    /*apiService.passages.getPassageTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        Data:{},
        getEditTableStructure: function(){
          var _service = this;
          return apiService.edit.passages.getEditPassageTableStructure().then(function (res){
            // _service.initData(res.data);
            return res.data
          });
        },
        getPassageData: function(id){
          var _service = this;
          return apiService.edit.passages.getPassageData(id).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        savePassageDataInDb: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return bodyData.id ? apiService.edit.passages.putPassageData(bodyData).then(function (res){return res.data}) :  apiService.edit.passages.postPassageData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          var _service = this;
          _service.Data = data;
        },
        set:function(key,obj){
          this.Data[key] = obj;
        },
        get:function(key){
          return this.Data[key] ? (this.Data[key].name ? this.Data[key].name : this.Data[key]) : "";
        },
        clearData: function(){
          service.Data = {};
        }
    }
    return service;
  }

})();
