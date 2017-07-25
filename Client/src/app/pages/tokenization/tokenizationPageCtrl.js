
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tokenization')
      .controller('TokenizationPageCtrl', TokenizationPageCtrl);

  /** @ngInject */
  function TokenizationPageCtrl($scope, UccaTokenizerService, TokenizationTask, Core) {
    var vm = this;
    vm.initText = initText;
    vm.saveChanges = saveChanges;
    vm.submitTask = submitTask;

    vm.name = 'World';

    vm.tokenizationTask = TokenizationTask;

    initText();


    function initText(){
      vm.originalText = vm.tokenizationTask.passage.text;

      vm.passageText = angular.copy(vm.originalText);
      vm.tokenizedText = angular.copy(vm.passageText);


      vm.textTokens = UccaTokenizerService.getTokensFromText(vm.passageText);

      vm.originalTokens = UccaTokenizerService.getTokensFromText(vm.originalText);


      vm.textMap = UccaTokenizerService.getTextMap(vm.originalText);
      vm.tokenizedText = angular.copy(vm.originalText);
      vm.htmlTextByTokens = "";
    }

    function submitTask(){
      return saveChanges("submit").then(function(res){
        goToMainMenu(res)
      });
    }

    function saveChanges(mode){
        $scope.tokenizationTask.tokens = $scope.savedTokens;
        $scope.tokenizationTask.passage.text = $scope.tokenizedText;
        mode = mode ? mode : 'draft';
        return uccaFactory.saveTask(mode,$scope.tokenizationTask).then(function(response){
          Core.showNotification("success","Task Saved");
          return response;
        })
      }

    function goToMainMenu(res){
          var projectId = this ? this.tokenizationTask.project.id : res.data.project.id;
          var layerType = this ? this.tokenizationTask.project.layer.type : res.data.project.layer.type;
          url: '/project/:id/tasks/:layerType',
              $state.go('projectTasks',{
                  id:projectId,
                  layerType:layerType,
                  refresh:true
              });
          $timeout(function(){$rootScope.$hideSideBar = false;})
      }
  }

})();
