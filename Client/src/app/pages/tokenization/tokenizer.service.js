/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * UccaTokenizerService
     *
     */
    angular.module('zAdmin.theme')
        .factory('UccaTokenizerService', function($sce, apiService){

        var originalTextNoSpaces = "";
        var textMapArray = [];

        var textMapSpacesArray = [];

        var service = {
            getTokensFromText: getTokensFromText,
            getHtmlTextByTokens: getHtmlTextByTokens,
            getFullHtmlTokensWithOriginalReference: getFullHtmlTokensWithOriginalReference,
            getTextMap: getTextMap,
            getTaskData: getTaskData,
            getTaskPassage: getTaskPassage,
            saveTask: saveTask,
            originalTextNoSpaces: originalTextNoSpaces,
            textMapArray: textMapArray
        };

        return service;


        /**
         *
         * get Full html tokens with original reference
         * @param tokens
         * @param originalText
         * @returns {string}
         */
        function getFullHtmlTokensWithOriginalReference(tokens, originalText){

            var html = "";

            var tokens = tokens || [];

            for(var i = 0; i < tokens.length; i++){

                var token = tokens[i];
                //check if original text is spaced

                if(isOriginalTokenStart(tokens, i, originalText)){
                    html += "<span class='token-wrapper'>";
                }


                var tokenText = token.text;


                //breakTokenTextToSubTokens

                html += "<span class='token'>" + tokenText + "</span>";

                if(isOriginalTokenEnd(tokens, i, originalText) ){
                    //close the span hilight
                    html += "</span>";
                } else {
                    html += "<span class='token-space'> </span>";
                }
            }

            return html;
        }



        /**
         * condition to
         * @param token
         * @param originalText
         * @returns {boolean}
         */

        function isOriginalTokenStart(tokens, index, originalText){

            var token = tokens[index];
            return (token.start_index==0 || originalText.charAt(token.start_index-1)== " ");

        }
        function isOriginalTokenEnd(tokens, index, originalText){
            var token = tokens[index];
            var end_char = (originalText.charAt(token.end_index+1));
            return ((!end_char.trim() || end_char == "," || end_char == "."  || end_char == ";") || token.end_index >= originalText.length);
        }

        function getHtmlTextByTokens(tokens){
            var space = " ";
            var html = "";
            for(var i = 0; i < tokens.length; i++){
                var token = tokens[i];
                if(i>0) {
                    html += space;
                }
                var span = "<span>" + token.text+ "</span>";
                html += span;
            }

            return $sce.trustAsHtml(html);
        }

        function getTokensFromText(text, originalText){

            var originalText = originalText || text;
            var tokensSplit = text.split(" ");
            var startIndex = 0;
            var endIndex = 0;


            //initiate original text without spaces
            if(!originalTextNoSpaces){
                originalTextNoSpaces = originalText.replace(/\s/g,'');

                // console.log('Generate OriginalTextNoSpaces', originalTextNoSpaces);

            }

            /**
             * Generate Text map array if not exist
             */
            if(!textMapArray.length){
                textMapArray = getTextMap(originalText);
            }


            var tokens = [];


            for(var i = 0; i < tokensSplit.length; i++){
                var tokenText = tokensSplit[i];

                if(tokenText != " "){

                    // console.log('startIndexNoSpace', startIndexNoSpace);

                    var startIndexNoSpace = originalTextNoSpaces.indexOf(tokenText, endIndex-i);

                    if(textMapArray[startIndexNoSpace]){
                        startIndex = textMapArray[startIndexNoSpace].originalTextLocation;
                    } else {
                        // console.log('error', startIndexNoSpace, textMapArray);
                    }


                    var endIndexNoSpace = startIndexNoSpace + (tokenText.length-1);

                    endIndex = textMapArray[endIndexNoSpace].originalTextLocation;


                    var requireAnnotation = isRequiredAnnotation(tokenText);

                    var token = {
                        start_index: startIndex,
                        end_index: endIndex,
                        text: tokenText,
                        require_annotation: requireAnnotation
                    };

                    tokens.push(token);
                }
            }

            return tokens;
        }

        function getTextMap(text){
            var textMap = [];
            for (var i = 0; i < text.length; i++){
                var char = text[i];

                if(char !== " "){
                    textMap.push({
                        char: char,
                        originalTextLocation: i
                    })
                }

            }
            return textMap;
        }


        /**
         * Retrieve the task from the server.
         * @param task_id
         * @returns {task_object}
         */
        function getTaskData(task_id){
            return apiService.tokenization.getTaskData(task_id);
        }

        /**
         * Retrieve the task from the server.
         * @param passage_id
         * @returns {task_object}
         */
        function getTaskPassage(passage_id){
            return apiService.tokenization.getPassageData(passage_id);
        }

        function saveTask(taskData){
            return apiService.tokenization.putTaskData(taskData);
        }

        /**
         * This is a mock function it should re-evaluated on saving at the server python code
         * @param tokenText
         * @returns {boolean}
         */
        function isRequiredAnnotation(tokenText){
            var isRequired = true;

            //if all not alphnumeric then false;

            if(tokenText==","){
                isRequired = false;
            }

            return isRequired;
        }


    })
})();