
(function () {
  'use strict';

  angular.module('zAdmin.pages.tokenization')
      .controller('TokenizationPageCtrl', TokenizationPageCtrl);

  /** @ngInject */
  function TokenizationPageCtrl($scope, UccaTokenizerService, TokenizationTask, Core) {
    var vm = this;
    vm.initText = initText;
    vm.saveChanges = saveChanges;

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

    function saveChanges(){
      vm.tokenizationTask.tokens = vm.textTokens;
      vm.tokenizationTask.passage.text = vm.passageText;

      UccaTokenizerService.saveTask(vm.tokenizationTask).then(function(response){
          Core.showNotification("success","Task Saved");
      })
    }
  }

})();
