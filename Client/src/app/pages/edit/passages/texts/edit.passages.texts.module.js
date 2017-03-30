/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages.texts', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.passages.texts', {
            url: '/text',
            templateUrl: 'app/pages/edit/passages/texts/edit.passages.texts.html',
            title: 'Edit Passages',
            controller: 'EditPassagesTextsCtrl',
            controllerAs: 'vm',
            resolve:{
              
            }
          });
    }

})();