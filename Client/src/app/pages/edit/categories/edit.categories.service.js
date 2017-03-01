
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.categories')
      .service('editCategoriesService', editCategoriesService);

  /** @ngInject */
  function editCategoriesService(apiService, Core) {
    /*apiService.users.getUserTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        Data:{},
        getEditTableStructure: function(){
          return apiService.edit.categories.getEditCategoryTableStructure().then(function (res){return res.data});
        },
        getCategoryData: function(id){
          var _service = this;
          return apiService.edit.categories.getCategoryData(id).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        saveCategoryDetails: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return bodyData.id ? apiService.edit.categories.putCategoryData(bodyData).then(function (res){return res.data}) :  apiService.edit.categories.postCategoryData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          var _service = this;
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
