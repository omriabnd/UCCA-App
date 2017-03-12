/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    angular.module('zAdmin.theme')
        .directive("uccaTokenizer", function(UccaTokenizerService, $timeout){
        return {
            link:link,
            restrict: 'A',
            scope: {
                passageText: "=",
                tokenizedText: "=",
                textTokens: "="
            }

        }

        function link(scope, el, attr){


            scope.textTokens = UccaTokenizerService.getTokensFromText(scope.tokenizedText, scope.passageText);


            scope.$watch("tokenizedText", function(){
                updateTextTokens();
            });

            function updateTextTokens(){
                scope.textTokens = UccaTokenizerService.getTokensFromText(scope.tokenizedText, scope.passageText);
                console.log('updateTokens');

                $timeout(function(){scope.$apply},2);
            }

        }
    })
})();