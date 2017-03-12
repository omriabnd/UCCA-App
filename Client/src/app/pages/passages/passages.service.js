
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.passages')
      .service('passagesService', passagesService);

  /** @ngInject */
  function passagesService(apiService) {
    apiService.passages.getPassagesTableData().then(function (res){
      service.tableData = res.data.results
    });
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.passages.getPassageTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(passage_id){
            return apiService.passages.deletePassage(passage_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.passages.getPassagesTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    };
    return service;
  }

})();
