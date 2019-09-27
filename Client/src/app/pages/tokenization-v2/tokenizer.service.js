/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * uccaFactory
     *
     */
    angular.module('zAdmin.pages.tokenization-v2')
        .factory('uccaFactory', function($sce, apiService){


            // var originalText, originalTextNoSpaces;
            //
            //
            // //spacemap for calculating the token location
            //
            // var originalTextSpaceMap = [];

            var service = {
                oldCursorLocation: 0,
                getTokensFromText: getTokensFromText,
                // originalText: originalText,
                // originalTextNoSpaces: originalTextNoSpaces,
                // setOriginalTextNoSpaces: setOriginalTextNoSpaces,
                // setOriginalTokens: setOriginalTokens,
                // originalTextSpaceMap: originalTextSpaceMap,
                // setOriginalTextSpaceMap: setOriginalTextSpaceMap,
                getTaskData:getTaskData,
                // getTaskPassage:getTaskPassage,
                saveTask:saveTask,
                setCursorLocation:setCursorLocation,
                buildSpaceMap:buildSpaceMap
            };

            return service;


            // set the space map for calculating the token location
            function buildSpaceMap(text) {
                var last_val = 0;
                var textSpaceArray = [];
                for (var i = 0; i < text.length; i++) {
                    if (text[i] === " ") {
                        last_val += 1;
                    } else if (text[i] !== '*') {
                        textSpaceArray.push(last_val);
                    }
                }
                return textSpaceArray;
            }

            // // set the space map
            // function setOriginalTextSpaceMap(){
            //     var last_val = 0;
            //     for (var i = 0; i < service.originalText.length; i++) {
            //         if (service.originalText[i] == " ") {
            //             last_val += 1;
            //         }
            //         else {
            //             originalTextSpaceMap.push(last_val);
            //         }
            //     }
            // }
            //
            // function setOriginalTextNoSpaces(){
            //
            //     console.log('setOriginalTextNoSpaces');
            //     // originalTextNoSpaces = service.originalText.replace(/\s/g, '');
            //     originalTextNoSpaces = service.originalText.replace(/ /g, '');
            //     return originalTextNoSpaces;
            // }
            //
            //
            // function setOriginalTokens(tokens) {
            //     this.originalTokens = tokens;
            // }

            function setCursorLocation(cur) {
                this.oldCursorLocation = cur;
            }

            /**
             *
             * function that create the tokens on each change
             *
             * @param text
             * @returns {Array of tokens}
             *
             *
             * First token start at 0 index
             */

            function getTokensFromText(text){
                var processText = text.replace(/\n/g, " \n ");

                var tokensSplit = processText.split('*').join(' ').split(' ');
                var textSpaceMap = buildSpaceMap(text);
                var startIndex;
                var endIndex = 0;
                var signIndex = 0;

                var tokens = [];

                for(var i = 0; i < tokensSplit.length; i++){
                    var tokenText = tokensSplit[i];
                    var requireAnnotation = isRequiredAnnotation(tokenText);

                    if (i === 0) {
                        startIndex = 0;
                    } else if (textSpaceMap[signIndex] !== textSpaceMap[signIndex-1]) { // if space is splitting
                        startIndex = endIndex + 2;
                    } else { // if * is splitting
                        startIndex = endIndex + 1;
                    }
                    endIndex = startIndex + tokenText.length - 1;
                    signIndex += tokenText.length;

                    var token = {
                        start_index: startIndex,
                        end_index: endIndex,
                        text: tokenText,
                        require_annotation: requireAnnotation
                    };

                    tokens.push(token);
                }
                return tokens;
            }

            function isRequiredAnnotation(str) {
                var punct_regexp = /[^\'-\/;\:!\?\(\)\[\]\"\{\}\+&<>—“”\.,\n\s]/;
                //var temp = /^([^\u0400-\u04FF0-9A-Z%&a-zA]+)$/;
                return punct_regexp.test(str);
            }

            /**
             * Retrieve the task from the server.
             * @param task_id
             * @returns {task_object}
             */
            
            function getTaskData(task_id){
                return apiService.tokenization.getTaskData(task_id);
            }

            // /**
            //  * Retrieve the task from the server.
            //  * @param passage_id
            //  * @returns {task_object}
            //  */
            // function getTaskPassage(passage_id){
            //     return apiService.tokenization.getPassageData(passage_id);
            // }

            function saveTask(mode,taskData){
                return apiService.tokenization.putTaskData(mode,taskData);
            }

        })
})();