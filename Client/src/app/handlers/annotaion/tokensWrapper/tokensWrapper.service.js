(function() {
    'use strict';

    angular
        .module("zAdmin.annotation.tokensWrapper")
        .factory('WordsWrapperService',WordsWrapperService);


    /**
     * A services that wraps word
     * @returns {{wrapWords: wrapWords}} - return object containing the service's variables and methods.
     */

    /** @ngInject */
    function WordsWrapperService() {
        var wrapperService = {
            wrapWords: wrapWords
        };

        return wrapperService;

        /**
         * Wrapping function - splits wordsToWrap if setId == true by ' ' and wrap them with span element with class selectable-word and attribute data-wordId=word-{{index in the main article}}.
         * @param wordsToWrap - The line of words to wrap.
         * @param setId - a boolean variable defining if it is the first wrapping
         * @returns {string} - the wrapped words.
         */
        function wrapWords(wordsToWrap,setId){
            if(setId == true){
                var result ='';
                wordsToWrap.forEach(function(token,index){
                    result += '<span parent-index="0"  token-id='+token.id+' class="selectable-word word-'+(index+1)+'" data-wordId="word-'+ (index+1) +'">'+token.text+'</span>';
                    result += ' ';
                });
            }else{
                result = wordsToWrap;
            }
            return result;
        }
    }

})();