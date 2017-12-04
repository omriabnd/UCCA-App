/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    /**
     * Directive for highlighting tokens
     */

    angular.module('zAdmin.theme')
        .directive("highlightOriginalToken", function(UccaTokenizerService){
        return {
            link: link,
            restrict: 'A',
            scope: {
                originalText: "=",
                savedTokens: "="
            },
            template: '<div></div>'
        }

        function link(scope, el, attr){

            scope.$watch("savedTokens", function(savedTokens){
                var html = UccaTokenizerService.getFullHtmlTokensWithOriginalReference(savedTokens, scope.originalText);
                el.html(html);
            })
        }
    })

})();