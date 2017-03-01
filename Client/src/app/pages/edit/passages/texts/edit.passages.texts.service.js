
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages.texts')
      .service('editPassagesTextService', editPassagesTextService);

  /** @ngInject */
  function editPassagesTextService(apiService) {
    /*apiService.passages.getPassageTableData().then(function (res){
      service.tableData = res.data
    });*/
    var service = {
        tableData:[]
    }
    return service;
  }

})();
