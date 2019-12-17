/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * uccaFactory
     *
     */
    angular.module('zAdmin.pages.tokenization-v2')
        .factory('uccaFactory', function($sce,$rootScope, apiService,DataService){


            // var originalText, originalTextNoSpaces;
            //
            //
            // //spacemap for calculating the token location
            //
            // var originalTextSpaceMap = [];

            var service = {
                oldCursorLocation: 0,
               
                // originalText: originalText,
                // originalTextNoSpaces: originalTextNoSpaces,
                // setOriginalTextNoSpaces: setOriginalTextNoSpaces,
                // setOriginalTokens: setOriginalTokens,
                // originalTextSpaceMap: originalTextSpaceMap,
                // setOriginalTextSpaceMap: setOriginalTextSpaceMap,
                // getTaskPassage:getTaskPassage,
                getTaskData:getTaskData,
                getTokensFromText: getTokensFromText,
                saveTask:saveTask,
                setCursorLocation:setCursorLocation,
                buildSpaceMap:buildSpaceMap,
                getTokenUnit:getTokenUnit,
                getIndexInTask:getIndexInTask,
                getEntireTokenFromAPart:getEntireTokenFromAPart,
                findNextToken:findNextToken,
                findPrevToken:findPrevToken,
                getAllRetokenizedTokens:getAllRetokenizedTokens,

            };

            return service;   

                    function getTokenUnit(listOfTokens,token) {
                        var tokenUnit;
                        debugger
                        if (listOfTokens.length != 0) {
                            for (var i = 0; i < listOfTokens.length; i++) {
                                if (listOfTokens[i].tree_id == token.unitTreeId) {
                                    tokenUnit = listOfTokens[i].tokens;

                                }
                                getTokenUnit(listOfTokens[i].AnnotationUnits,token);
                            }
                            return tokenUnit;
                        }
                    }

                    function getIndexInTask(token) {
                        return token.static.index_in_task;
                    }
                    function getEntireTokenFromAPart(token) {

                        var tokenUnit;
                        if (token.unitTreeId != 0) {
                            debugger
                            tokenUnit = getTokenUnit(DataService.tree.AnnotationUnits,token)
                        }
                        else { tokenUnit = DataService.tree.tokens }
                        console.log("tokenUnit", tokenUnit)
                        debugger
                        if (token.static.splitByTokenization == true) {
                            var mergeArray = []
                            var newToken = findPrevToken(tokenUnit, token)
                            console.log(newToken)
                            mergeArray.push(newToken, token)
                            return mergeArray
                        }
                        else if (token.static.splitByTokenization == false && findNextToken(tokenUnit, token).static.splitByTokenization == true) {
                            var mergeArray = []
                            mergeArray.push(token, findNextToken(tokenUnit, token))
                            return mergeArray
                        }
                        return token
                    }
                    function findNextToken(list, token) {
                        for (var i = 0; i < list.length; i++) {
                            if (getIndexInTask(list[i]) == getIndexInTask(token) + 1) {
                                return list[i];
                            }
                        }
                        return null;
                    }
                    function findPrevToken(list, token) {
                        debugger
                        for (var i = 0; i < list.length; i++) {
                            if (getIndexInTask(list[i]) == getIndexInTask(token) - 1) {
                                return list[i];
                            }
                        }
                        return null;
                    }
                    function getAllRetokenizedTokens(token) {

                        var returnArray = [];
                        var originalToken = angular.copy(token);
                        console.log("token", token)
                        console.log("token.unitTreeId", token.unitTreeId)
                        //var myTree=angular.copy(DataService.tree)
                        var tokenUnit;
                        if (token.unitTreeId != 0) {
                            debugger
                            tokenUnit = getTokenUnit(DataService.tree.AnnotationUnits,token)
                        }
                        else { tokenUnit = DataService.tree.tokens }
                        console.log("tokenUnit", tokenUnit)
                        var array = [];
                        debugger
                        // case 0: this token was not a retokenized token 
                        if ((token.static.splitByTokenization == null || token.static.splitByTokenization == false) && ((findNextToken(tokenUnit, token) == null) || (findNextToken(tokenUnit, token).static.splitByTokenization == false) || (findNextToken(tokenUnit, token).static.splitByTokenization == null))) {
                            returnArray.push(token.static.text, getIndexInTask(token), getIndexInTask(token));
                            return returnArray;
                        }
                        // case 1: this token was a part of a retokenized token
                        // first part of  a retokenized token
                        if (token.static.splitByTokenization == null || token.static.splitByTokenization == false) {
                            var flag = true;
                        }
                        array.push(token)
                        // push in the array all the following tokens which were splitted
                        while (findNextToken(tokenUnit, token) != null && findNextToken(tokenUnit, token).static.splitByTokenization == true) {
                            var essai = findNextToken(tokenUnit, token)
                            console.log(essai)
                            console.log(findNextToken(tokenUnit, token).static.splitByTokenization)
                            token = findNextToken(tokenUnit, token);
                            array.push(token);
                        }
                        var token = originalToken;
                        // push in the array all the previous  tokens which were splitted
                        while (token.static.splitByTokenization != false && findPrevToken(tokenUnit, token) != null && findPrevToken(tokenUnit, token).static.splitByTokenization == true) {
                            token = findPrevToken(tokenUnit, token)
                            array.push(token)
                        }
                        // if the selected token was splitted 
                        if (flag != true) {
                            array.push(findPrevToken(tokenUnit, token))
                        }
                        // sort the array wich the part of the original tokens sorted by indexInUniy
                        array.sort(function (a, b) {
                            if (getIndexInTask(a) > getIndexInTask(b)) {
                                return 1;
                            }
                            if (getIndexInTask(b) > getIndexInTask(a)) {
                                return -1;
                            }
                            return 0;
                        });
                        var tmpArr = [];
                        debugger
                        // get the text of the part of the token
                        for (var i = 0; i < array.length; i++) {
                            tmpArr[i] = array[i].static.text
                        }
                        // join the texts with a *
                        var newString = tmpArr.join('*');
                        // return the string + the indexes of the first part 
                        // of the original token and the index of the last part
                        returnArray.push(newString, getIndexInTask(array[0]), getIndexInTask(array[array.length - 1]));
                        return returnArray
                    }
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