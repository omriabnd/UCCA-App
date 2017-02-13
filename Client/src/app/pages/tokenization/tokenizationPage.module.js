(function () {
  'use strict';

  angular.module('zAdmin.pages.tokenization', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('tokenizationPage', {
            url: '/tokenizationPage/:taskId',
            templateUrl: 'app/pages/tokenization/tokenization-page.html',
            title: 'Tokenization',
            controller: 'TokenizationPageCtrl',
            controllerAs: 'vm',
            sidebarMeta: null,
            state_id:8,
              resolve:{
                  TokenizationTask:function(UccaTokenizerService,$stateParams){
                      return UccaTokenizerService.getTaskData($stateParams.taskId).then(
                          function(res){
                              return res.data;
                          }
                      )
                  }
              }
          });
    }

})();