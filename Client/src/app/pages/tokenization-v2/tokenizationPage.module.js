/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tokenization-v2', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('tokenizationPage', {
            url: '/tokenizationPage/:taskId',
            templateUrl: 'app/pages/tokenization-v2/tokenization-page.html',
            title: 'Tokenization',
            controller: 'TokenizationPageCtrl',
            // controllerAs: 'vm',
            sidebarMeta: null,
            state_id:8,
            resolve:{
                TokenizationTask:function(uccaFactory,$stateParams){
                    return uccaFactory.getTaskData($stateParams.taskId).then(
                        function(res){
                            return res.data;
                        }
                    )
                }
            }
          });
    }

})();