(function() {
    'use strict';

    angular.module('zAdmin.annotation.assertion')
        .factory('AssertionService', AssertionService);


    /** @ngInject */
    function AssertionService() {
        var AssertionService = {
            checkTree: checkTree,
            checkTreeId: checkTreeId,
            checkAnnotationUnits: checkAnnotationUnits,
            checkParentTreeId: checkParentTreeId,
            validPrefix: validPrefix,
        };

        return AssertionService;

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

        function validPrefix(parentTreeId, treeId) {
            // Valid: a prefix of the tree_id
            var index = treeId.lastIndexOf("-")
            var prefix = treeId.slice(0, index);
            return prefix === treeId;
        }

        function checkParentTreeId(parentTreeId, treeId) {
            // TODO: why parent_tree_id is nul???
            // Exists or null if tree_id=0

            console.log("parentTreeId", parentTreeId, "treeId", treeId)
            // if (treeId && !parentTreeId) {
            //     debugger;
            //     throw "Parent tree id is not existing";
            // }

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

        function checkAnnotationUnits(annotationUnits) {
            console.log("--------------------znnotationUnits=", annotationUnits);
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

        function checkTree(tree) {
            console.log("In check tree function", tree);
            // Check tree_id
            try {
                this.checkTreeId(tree.tree_id);
                this.checkAnnotationUnits(tree.AnnotationUnits);
            } catch(e) {
                console.error(e);
            }
        }

    }

})();
