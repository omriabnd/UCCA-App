
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tokenization-v2')
      .controller('TokenizationPageCtrl', TokenizationPageCtrl);

  /** @ngInject */
  function TokenizationPageCtrl($scope, uccaFactory, TokenizationTask, Core, $state, $timeout, $rootScope, $q) {
      $scope.saveChanges = saveChanges;
      $scope.submitTask = submitTask;

      $scope.name = 'World';

      $scope.tokenizationTask = TokenizationTask;
      $scope.originalText = TokenizationTask.passage.text;
      // create a copy of the original text for the tokenized text
      var passageFromTokens = createTextFromTokens(TokenizationTask.tokens);
      $scope.direction = TokenizationTask.passage.text_direction;
      console.log("passageFromTokens",TokenizationTask.tokens);

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

      // uccaFactory.setOriginalTextNoSpaces();
      // uccaFactory.setOriginalTextSpaceMap();

      console.log(uccaFactory.originalText, uccaFactory.originalTextNoSpaces, uccaFactory.originalTextSpaceMap);



      /**
       *
       * Watch for changes in the textarea
       *
       */
      $scope.$watch("tokenizedText", function(tokenizedText){
          console.log('watch tokenizedText');
          if(tokenizedText) {
              $scope.savedTokens = uccaFactory.getTokensFromText(tokenizedText);
              console.log("watch",$scope.savedTokens);
          }
      });

       $scope.$on('receivedCursor', function(event, cursorLoc) {
          return $q(function(resolve, reject) {
              var tmp = $scope.tokenizedText;
              tmp = tmp.substr(0, cursorLoc) + '*' + tmp.substr(cursorLoc + 1);

              $scope.tokenizedText = tmp;

              resolve('success');
          });
      });

      /**
       *
       *
       * End init
       *
       * */

      // $scope.originalTokens = uccaFactory.getTokensFromText($scope.originalText);

      $scope.tokenizedText = passageFromTokens;


      function createTextFromTokens(tokensArray){
        var tokensArr = tokensArray;
        var output = '';
        tokensArray.forEach(function(token,index){
            output += (token.text);
            if (index === tokensArr.length-1) {
                return output;
            } else if (token.end_index+1 === tokensArray[index+1].start_index && token.text !== '\n') {
                output += '*';
            } else {
                output += ' ';
            }
        });
        return output;
      }
      function removeSpaceTokenAndUpdatePassage(){
        for (var i=0; i<$scope.savedTokens.length;i++){
            let token=$scope.savedTokens[i]
            let tokenStartIndex=token.start_index;
            if (token.text==' '){
                $scope.savedTokens.splice(i,1);
                $scope.savedTokens=updatePassageIndexes($scope.savedTokens,i,tokenStartIndex)
            }
            return $scope.savedTokens;
        }
      }
      function updatePassageIndexes(passage,index, tokenStartIndex){
          myIndex=tokenStartIndex
        for (var i = index ;i<passage.length;i++){
            passage[i].start_index=myIndex
            passage[i].end_index=passage[i].start_index+passage[i].text.length-1
            myIndex+=2
        }
        return passage
      }

      function submitTask(){
          return saveChanges("submit").then(function(res){
            $timeout(function(){$rootScope.$hideSideBar = false;})
            goToMainMenu(res) 
          })
      }

      function saveChanges(mode){
        $scope.tokenizationTask.tokens = removeSpaceTokenAndUpdatePassage();
        $scope.tokenizationTask.passage.text = $scope.tokenizedText;
        mode = mode ? mode : 'draft';
        return uccaFactory.saveTask(mode,$scope.tokenizationTask).then(function(response){
          Core.showNotification("success", mode == "submit" ? "Submitted" : "Task Saved");
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
