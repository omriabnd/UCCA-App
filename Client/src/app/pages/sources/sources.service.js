
(function () {
  'use strict';

  angular.module('zAdmin.pages.sources')
      .service('sourcesService', sourcesService);

  /** @ngInject */
  function sourcesService(apiService) {
    apiService.sources.getSourcesTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.sources.getSourceTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(source_id){
            return apiService.sources.deleteSource(source_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.sources.getSourcesTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    }
    return service;
  }

})();
