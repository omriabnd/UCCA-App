/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';
    /**
     * UccaTokenizerService
     *
     */
    angular.module('zAdmin.pages.tokenization-v2')
        .directive('retokenizerBehaviour', function ($timeout, $rootScope, uccaFactory) {
            return {
                link: link,
                restrict: 'A',
                scope: {},
            }

            function link(scope, el, attr) {

                console.log('tokenizerBehaviour', el);

                $(el).on('keydown', function (evt) {
                    debugger
                    if (evt.keyCode == 32 || evt.keyCode == 8 || (evt.keyCode >= 37 && evt.keyCode <= 40)) {
                        //if there is a selection

                        if ($(el).prop("selectionStart") - $(el).prop("selectionEnd")) {
                            event.preventDefault();
                            return false;
                        }

                        else {clickOnTokenText(evt, el)};
                    } else {
                        console.log('space not allowed', evt);
                        event.preventDefault();
                        return false;
                    }
                });

                function clickOnTokenText(evt, el) {
                    var charPrevious, charNext;
                    debugger
                    var text = $(el).val();
                    var cursorLocation = $(el).prop("selectionStart");
                    uccaFactory.setCursorLocation(cursorLocation);
                    charPrevious = text.substring((cursorLocation), cursorLocation - 1);
                    charNext = text.substring((cursorLocation), cursorLocation + 1);
                    /**
                     * If backspace
                     *
                     * validate that deleted char is space
                     *
                     * Merge tokens
                     */
                    if (evt.keyCode == 37){
                        var promise = $timeout(function () {
                            $rootScope.$apply($rootScope.$broadcast('cursorMovedLeft', cursorLocation));
                        }, 5);
                        promise.then(function () {
                            el[0].selectionStart = uccaFactory.oldCursorLocation - 1;
                            el[0].selectionEnd = uccaFactory.oldCursorLocation - 1;
                        }, function () {
                            console.error('Error during the tokenization')
                        });
                    }

                    if (evt.keyCode == 39){
                        var promise = $timeout(function () {
                            $rootScope.$apply($rootScope.$broadcast('cursorMovedRight', cursorLocation));
                        }, 5);

                        promise.then(function () {
                            el[0].selectionStart = uccaFactory.oldCursorLocation + 1;
                            el[0].selectionEnd = uccaFactory.oldCursorLocation + 1;
                        }, function () {
                            console.error('Error during the tokenization')
                        });
                    }
                    if (evt.keyCode == 8) {

                        if (cursorLocation) {

                            if (charPrevious != "\n" && charPrevious.trim() == "*") {

                                var promise = $timeout(function () {
                                    $rootScope.$apply($rootScope.$broadcast('deleteStar', cursorLocation));
                                }, 5);
    
                                promise.then(function () {
                                    el[0].selectionStart = uccaFactory.oldCursorLocation + 1;
                                    el[0].selectionEnd = uccaFactory.oldCursorLocation + 1;
                                }, function () {
                                    console.error('Error during the tokenization')
                                });

                            } else {
                                //if not space is deleted - do not allow
                                console.log('not space * no delete');
                                evt.preventDefault();
                                return false;
                            }
                        } 
                        else {
                            console.log('not space * no delete');
                            evt.preventDefault();
                            return false;
                        }
                    }
                    /**
                     * if space
                     *
                     * check that space not exist already
                     *
                     */
                    else if (evt.keyCode == 32) {
                        if (charPrevious.trim() == "" || charNext.trim() == "" || charPrevious.trim() == "*" || charNext.trim() == "*") {
                            evt.preventDefault();
                            return false;
                        }
                        if (text.trim() == "") {
                            console.log('empty one');
                            evt.preventDefault();
                            return false;
                        } 
                        else {
                            var promise = $timeout(function () {
                                $rootScope.$apply($rootScope.$broadcast('addSpace', cursorLocation));
                            }, 5);

                            promise.then(function () {
                                el[0].selectionStart = uccaFactory.oldCursorLocation + 1;
                                el[0].selectionEnd = uccaFactory.oldCursorLocation + 1;
                            }, function () {
                                console.error('Error during the tokenization')
                            });
                        }
                    }
                }
            }
        })
})();