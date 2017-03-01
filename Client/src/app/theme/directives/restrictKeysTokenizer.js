(function () {
  'use strict';
    angular.module('zAdmin.theme')
        .directive("restrictKeysTokenizer", function(UccaTokenizerService, $timeout){
        return {
            link:link,
            restrict: 'A',
        }

        function link(scope, el, attr){


            $(el).on('keydown', function(evt) {
                clickOnTokenText(evt);
            });




            function clickOnTokenText(evt) {

                //console.log('evt', evt.charCode, evt);
                //scope.scopeApply();

                if (evt.keyCode == 32 || evt.keyCode == 8 || (evt.keyCode >= 37 && evt.keyCode <= 40)) {

                } else {
                    console.log('char not allowed', evt);
                    event.preventDefault();
                    return false;
                }


                //if shift key, then jump to next word
                if(evt.shiftKey && evt.keyCode == 39){
                    jumpToNextWord()
                }

                if(evt.shiftKey && evt.keyCode == 37){
                    jumpToPreviousWord();

                }
                if(evt.shiftKey && evt.keyCode == 38){
                    jumpToPassageStart();

                }
                if(evt.shiftKey && evt.keyCode == 40){
                    jumpToPassageEnd();

                }




                //do not add extra space
                if(evt.keyCode == 32 && !canInsertSpace()){
                    //
                    event.preventDefault();
                    return false;

                }

                //allow to delete only space
                if(evt.keyCode == 8 && restrictDelete()){
                    event.preventDefault();
                    return false;
                }



            }

            function jumpToNextWord(){
                var cursorLocation = getCursorPos();
                var index = $(el).val().indexOf(" ", cursorLocation.start + 1) + 1;
                index = (index >= 0)? index : cursorLocation.start;
                setCursorPos(index);
            }

            function jumpToPreviousWord(){
                var cursorLocation = getCursorPos();
                var index = $(el).val().lastIndexOf(" ", cursorLocation.start - 2) +2;
                index = (index >= 0)? index : cursorLocation.start;
                setCursorPos(index);
            }

            function jumpToPassageStart(){
                setCursorPos(0);

            }

            function jumpToPassageEnd(){
                var index = $(el).val().length;
                setCursorPos(index);
            }


            function canInsertSpace(){
                var cursorLocation = getCursorPos();
                //char = 5;
                var charBefore = getCharAt(cursorLocation.start-1);
                var charAfter = getCharAt(cursorLocation.start);

                if(cursorLocation.start != cursorLocation.end ||  !charBefore.trim() || !charAfter.trim()){
                    return false;
                }
                return true;
            }

            function restrictDelete(){
                var cursorLocation = getCursorPos();
                //char = 5;
                var char = getCharAt(cursorLocation.start-1);

                return (cursorLocation.start != cursorLocation.end || char.trim())



            }

            function getCharAt(index){
                var char = $(el).val().charAt(index);

                return char;
            }

            function setCursorPos(index){
                el[0].setSelectionRange(index, index);
            }

            function getCursorPos(input) {
                if(!input){
                    input = $("#textarea-tokenizer")[0];
                }
                if ("selectionStart" in input && document.activeElement == input) {
                    return {
                        start: input.selectionStart,
                        end: input.selectionEnd
                    };
                }
                else if (input.createTextRange) {
                    var sel = document.selection.createRange();
                    if (sel.parentElement() === input) {
                        var rng = input.createTextRange();
                        rng.moveToBookmark(sel.getBookmark());
                        for (var len = 0;
                             rng.compareEndPoints("EndToStart", rng) > 0;
                             rng.moveEnd("character", -1)) {
                            len++;
                        }
                        rng.setEndPoint("StartToStart", input.createTextRange());
                        for (var pos = { start: 0, end: len };
                             rng.compareEndPoints("EndToStart", rng) > 0;
                             rng.moveEnd("character", -1)) {
                            pos.start++;
                            pos.end++;
                        }

                        return pos;
                    }
                }
                return -1;
            }

        }
    })
})();