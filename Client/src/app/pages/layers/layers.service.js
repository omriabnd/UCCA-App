
(function () {
  'use strict';

  angular.module('zAdmin.pages.layers')
      .service('layersService', layersService);

  /** @ngInject */
  function layersService(apiService) {
    apiService.layers.getLayersTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.layers.getLayersTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(layer_id){
            return apiService.layers.deleteLayer(layer_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.layers.getLayersTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    };
    return service;
  }

})();
