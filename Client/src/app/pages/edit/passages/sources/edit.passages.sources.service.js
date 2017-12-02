
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages.sources')
      .service('editPassageSourcesService', editPassageSourcesService);

  /** @ngInject */
  function editPassageSourcesService(apiService) {
    // apiService.edit.passages.sources.getSourceTableData().then(function (res){
    //   angular.copy(res.data.results, service.tableData);
    // });
    var service = {
        tableData:[],
        getEditTableStructure: function(){
          return apiService.edit.passages.sources.getEditSourceTableStructure().then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
          return /*!!!searchTerms ? service.tableData : */apiService.edit.passages.sources.getSourceTableData(searchTerms).then(function (res){
            angular.copy(res.data.results, service.tableData);
            return service.tableData;
          });
        }
        
    }
    return service;
  }

})();