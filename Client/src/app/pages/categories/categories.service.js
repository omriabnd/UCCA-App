
(function () {
  'use strict';

  angular.module('zAdmin.pages.categories')
      .service('categoriesService', categoriesService);

  /** @ngInject */
  function categoriesService(apiService) {
    apiService.categories.getCategoriesTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.categories.getTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(category_id){
          return apiService.categories.deleteCategory(category_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
          return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
            angular.copy(res.data.results, service.tableData);
            return service.tableData;
          });
        }
    };
    return service;
  }

})();
