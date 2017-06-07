
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.annotation.selectionHandler')
        .service('selectionHandlerService', selectionHandlerService);

    /** @ngInject */
    function selectionHandlerService() {
        var selectedTokenList = [];

        var _handler = {
            selectedTokenList: selectedTokenList,
            addTokenToList: function(token){
                this.selectedTokenList.push(token);
                sortSelectedTokenList();
            },
            removeTokenFromList: function(tokenIndex){
                this.selectedTokenList.splice(1,tokenIndex);
            }

        };

        function sortSelectedTokenList(){
            this.selectedTokenList.sort(function(a,b){
                if(a > b){
                    return 1;
                }else if(a < b){
                    return -1;
                }else{
                    return 0;
                }
            })
        }

        return _handler;
    }

})();
