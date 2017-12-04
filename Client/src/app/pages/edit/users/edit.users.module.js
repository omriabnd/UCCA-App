/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.users', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.users', {
            url: '/users/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Users',
            controller: 'EditUsersCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:function(editUsersService){return editUsersService.getEditTableStructure()},
              UserTableData:getData
            }
          });
    }

    function getData(editUsersService,$stateParams){
      if($stateParams.id != ""){
        return editUsersService.getUserData($stateParams.id)
      }else{
          editUsersService.clearData();
      }
      return null;
    }

})();
