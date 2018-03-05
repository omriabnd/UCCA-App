(function() {
    'use strict';

    angular.module('zAdmin.annotation.assertion')
        .factory('AssertionService', AssertionService);


    /** @ngInject */
    function AssertionService() {
        var AssertionService = {
            checkTreeId: checkTreeId,
        };

        return AssertionService;

        function checkTreeId(treeId) {
            console.log("In checkTree function", treeId);
            // Check treeId
            try {
                // existing
                if (!treeId) {
                    throw "Tree id is not existing";
                }

                // correct format
                var splitTreeId = treeId.split('-');
                for (var i = 0; i < splitTreeId.length; i++) {
                    if (!parseInt(splitTreeId[i]) && splitTreeId[i] !== "0") {
                        throw "Tree id is not in the correct format";
                    }
                }
            } catch(e) {
                console.log(e);
            }
        }

    }

})();
