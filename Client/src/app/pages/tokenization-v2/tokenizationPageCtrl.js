
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tokenization-v2')
      .controller('TokenizationPageCtrl', TokenizationPageCtrl);

  /** @ngInject */
  function TokenizationPageCtrl($scope, uccaFactory, TokenizationTask, Core) {
      $scope.saveChanges = saveChanges;
      $scope.submitTask = submitTask;

      $scope.name = 'World';

      $scope.tokenizationTask = TokenizationTask;
      $scope.originalText = TokenizationTask.passage.text;


      /**
       *
       *
       *
       * Init some vars of text  + mapping
       * Add originalText to factory once;
       *
       *
       *
       */




      uccaFactory.originalText = $scope.originalText;

      uccaFactory.setOriginalTextNoSpaces();
      uccaFactory.setOriginalTextSpaceMap();

      console.log(uccaFactory.originalText, uccaFactory.originalTextNoSpaces, uccaFactory.originalTextSpaceMap);



      /**
       *
       * Watch for changes in the textarea
       *
       */
      $scope.$watch("tokenizedText", function(tokenizedText){

          console.log('watch tokenizedText');
          if(tokenizedText)
          $scope.savedTokens = uccaFactory.getTokensFromText(tokenizedText, uccaFactory.originalText);
      });

      /**
       *
       *
       * End init
       *
       * */

      $scope.originalTokens = uccaFactory.getTokensFromText($scope.originalText);


      // create a copy of the original text for the tokenized text

      $scope.tokenizedText = angular.copy($scope.originalText);

      function submitTask(){
        return saveChanges("submit");
      }

      function saveChanges(mode){
        $scope.tokenizationTask.tokens = $scope.savedTokens;
        $scope.tokenizationTask.passage.text = $scope.tokenizedText;
        mode = mode ? mode : 'draft';
        uccaFactory.saveTask(mode,$scope.tokenizationTask).then(function(response){
          Core.showNotification("success","Task Saved");
        })
      }

  }

})();
