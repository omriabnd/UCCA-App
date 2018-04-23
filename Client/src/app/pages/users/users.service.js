
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.users')
      .service('usersService', usersService);

  /** @ngInject */
  function usersService(apiService) {
    /*apiService.users.getUsersTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.users.getUserTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(user_id){
            return apiService.users.deleteUser(user_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.users.getUsersTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        },
        checkForUserPermission: function(){
          //debugger
        }
    }
    return service;
  }

})();
