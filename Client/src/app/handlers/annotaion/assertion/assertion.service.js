(function() {
    'use strict';

    angular.module('zAdmin.annotation.assertion')
        .factory('AssertionService', AssertionService);


    /** @ngInject */
    /***
     * Assertion service, check DataService.tree
     * @constructor
     */
    function AssertionService() {
        var AssertionService = {
            checkTree: checkTree,
            checkTreeId: checkTreeId,
            checkAnnotationUnits: checkAnnotationUnits,
            checkParentTreeId: checkParentTreeId,
            validPrefix: validPrefix,
            check_children_tokens_hash: check_children_tokens_hash
        };

        return AssertionService;

        /**
         * Check tree_id
         * @param treeId
         */
        function checkTreeId(treeId) {
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
        }

        /**
         * Check if parent_tree_id is prefix of tree_id
         * Valid: a prefix of the tree_id
         * @param parentTreeId
         * @param treeId
         * @returns {boolean}
         */
        function validPrefix(parentTreeId, treeId) {
            const isNum = /^\d+$/.test(treeId);
            if (isNum) {
                // If treeId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                return parentTreeId === "0"
            }
            const index = treeId.lastIndexOf("-");
            const prefix = treeId.slice(0, index);
            return prefix === parentTreeId;
        }

        /***
         * Check parent_tree_id: exist, correct format and tree_id prefix
         * @param parentTreeId
         * @param treeId
         */
        function checkParentTreeId(parentTreeId, treeId) {
            debugger
            // Exists or null if tree_id=0
            if (treeId == "0") {
                debugger
            }

            console.log("parentTreeId", parentTreeId, "treeId", treeId)
            if (treeId && !parentTreeId) {
                debugger;
                throw "Parent tree id is not existing";
            }

            // correct format
            if (parentTreeId) {
                var splitTreeId = parentTreeId.split('-');
                for (var i = 0; i < splitTreeId.length; i++) {
                    if (!parseInt(splitTreeId[i]) && splitTreeId[i] !== "0") {
                        throw "Parent tree id is not in the correct format";
                    }
                }
            }

            if (!this.validPrefix(parentTreeId, treeId)) {
                throw "Parent tree id is not a prefix of tree id";
            }

        }

        /**
         * Check annotationUnits: recursive function, it sends to check tree_id and parent_tree_id
         * @param annotationUnits
         */
        function checkAnnotationUnits(annotationUnits) {
            console.log("------zannotationUnits=", annotationUnits);
            for (var i = 0; i < annotationUnits.length; i++) {
                console.log("annotationUnits[i].parentUnitId=", annotationUnits[i].parentUnitId)
                console.log("i=", annotationUnits[i]);
                //tODO- check fields
                this.checkTreeId(annotationUnits[i].tree_id);
                this.checkParentTreeId(annotationUnits[i].parent_tree_id, annotationUnits[i].tree_id);


                if (annotationUnits[i].AnnotationUnits.length) {
                    this.checkAnnotationUnits(annotationUnits[i].AnnotationUnits);
                }
            }
        }

        /**
         * Main function, check tree- sends to check tree_id and annotationUnits
         * @param tree
         */
        function checkTree(tree) {
            debugger
            console.log("In check tree function", tree);
            // Check tree_id
            try {
                this.checkTreeId(tree.tree_id);
                this.checkAnnotationUnits(tree.AnnotationUnits);
            } catch(e) {
                console.error(e);
            }
        }

        /**
         * Check if children_tokens_hash contain same tokens like children_tokens
         * @param children_tokens_hash
         * @param children_tokens
         */
        function check_children_tokens_hash(children_tokens_hash, children_tokens) {
            try {
                // children_tokens_hash - tokens object: {id: token, id: token, ...}
                // children_tokens - tokens array
                const children_tokens_hash_ids = Object.keys(children_tokens_hash);
                if (children_tokens_hash_ids.length !== children_tokens.length) {
                    throw "The lengths of children_tokens and children_tokens_hash are not equals";
                }
                for (var i = 0; i < children_tokens_hash_ids.length; i++) {
                    if (parseInt(children_tokens_hash_ids[i]) !== children_tokens[i].id) {
                        throw "The ids at place " + i + " are different between children_tokens_hash and children_tokens";
                    }
                }
            } catch(e) {
                console.error(e);
            }
        }

    }

})();
