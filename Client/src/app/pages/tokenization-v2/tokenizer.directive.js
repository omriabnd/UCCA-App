/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * UccaTokenizerService
     *
     */
    angular.module('zAdmin.pages.tokenization-v2')
        .directive('tokenizerBehaviour', function($timeout,$rootScope, uccaFactory){
            return {
                link: link,
                restrict: 'A',
                scope: {},
            }


            function link(scope, el, attr){

                console.log('tokenizerBehaviour', el);
                $(el).on('keydown', function(evt) {
                    if (evt.keyCode == 32  || evt.keyCode == 8 || (evt.keyCode >=37 && evt.keyCode <=40)) {

                        //if there is a selection
                        console.log($(el).prop("selectionStart"), $(el).prop("selectionEnd"));

                        if( $(el).prop("selectionStart") -  $(el).prop("selectionEnd")) {
                            event.preventDefault();
                            return false;
                        }


                        clickOnTokenText(evt, el);
                    }else {
                        console.log('space not allowed', evt);
                        event.preventDefault();
                        return false;
                    }
                });

                function clickOnTokenText(evt, el){

                    console.log('clickOnTokenText');


                    var charPrevious, charNext;



                    var text = $(el).val();

                    var cursorLocation = $(el).prop("selectionStart");
                    uccaFactory.setCursorLocation(cursorLocation);
                    charPrevious = text.substring((cursorLocation), cursorLocation-1);
                    charNext = text.substring((cursorLocation), cursorLocation+1);


                    /**
                     * If backspace
                     *
                     * validate that deleted char is space
                     *
                     * Merge tokens
                     */
                    if(evt.keyCode == 8){

                        console.log('cursorLocation', cursorLocation);

                        if(cursorLocation){

                            console.log('charPrevious', charPrevious);
                            if(charPrevious != "\n" && charPrevious.trim()=="*"){

                                console.log('deleted char is *');

                                // Delete only * and not space
                                text = text.slice(cursorLocation-1,1);

                            }else {
                                //if not space is deleted - do not allow
                                console.log('not space * no delete');
                                evt.preventDefault();
                                return false;
                            }
                        } else {
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
                    if (evt.keyCode == 32){


                        if(charPrevious.trim()=="" || charNext.trim()=="" || charPrevious.trim()=="*" || charNext.trim()=="*"){
                            evt.preventDefault();
                            return false;
                        }


                        if(text.trim()==""){
                            console.log('empty one');
                            evt.preventDefault();
                            return false;
                        } else {

                            var promise = $timeout(function(){
                                $rootScope.$apply($rootScope.$broadcast('receivedCursor', cursorLocation));
                            },1);

                            promise.then(function() {
                                el[0].selectionStart = uccaFactory.oldCursorLocation +1;
                                el[0].selectionEnd = uccaFactory.oldCursorLocation +1;
                            }, function() {
                              console.error('Error during the tokenization')
                            });
                        }
                    }
                }


            }

    })
})();