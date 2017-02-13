
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.users')
      .service('editUsersService', editUsersService);

  /** @ngInject */
  function editUsersService(apiService, Core) {
    /*apiService.users.getUserTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        Data:{},
        getEditTableStructure: function(){
          return apiService.edit.users.getEditUserTableStructure().then(function (res){return res.data});
        },
        getUserData: function(userId){
          var _service = this;
          return apiService.edit.users.getUserData(userId).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        saveUserDetails: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return bodyData.id ? apiService.edit.users.putUserData(bodyData).then(function (res){return res.data}) :  apiService.edit.users.postUserData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          var _service = this;
          service.Data = data;
        },
        get:function(key){
          return this.Data[key];
        },
        clearData: function(){
          service.Data = {
              id:"",
              first_name:"",
              last_name:"",
              email:"",
              role:"",
              organization:"",
              affiliation:"",
              is_active:""
          };
        }
    }
    return service;
  }

})();
