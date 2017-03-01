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
            title: 'Edit Passages texts',
            controller: 'EditPassagesTextsCtrl',
            controllerAs: 'vm',
            resolve:{
              
            }
          });
    }

})();