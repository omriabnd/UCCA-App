(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('DataService',DataService);

    function DataService($q,$http,apiService,$rootScope,restrictionsValidatorService,ENV_CONST,Core, AssertionService) {
        trace("DataService is here");

        var lastInsertedUnitIndex = 0;
        var unitType = 'REGULAR';
        var annotation_units = [];
        var hashTables = {
            tokensHashTable: {},
            categoriesHashTable: {}
        };

        var unitsUsedAsRemote = {};

        var DataService = {
            /**
             * A data structure that contains rows of selectable words.
             */
            tree: {
                tree_id : '0',
                text : '',
                numOfAnnotationUnits: 0,
                unitType:'REGULAR',
                containsAllParentUnits: false,
                AnnotationUnits : [],
                gui_status: 'OPEN',
                tokens: []
            },
            lastInsertedUnitIndex: lastInsertedUnitIndex,
            unitType:unitType,
            serverData:null,
            baseTokenData: ['id', 'start_index', 'end_index', 'require_annotation', 'text', 'tokenization_task_id', 'splitByTokenization'],
            hashTables: hashTables,
            categories: [],
            unitsUsedAsRemote:unitsUsedAsRemote,
            getData: getData,
            insertToTree: insertToTree,
            toggleCategoryForUnit:toggleCategoryForUnit,
            printTree: printTree,
            getNextUnit: getNextUnit,
            getPrevUnit: getPrevUnit,
            getNextSibling:getNextSibling,
            getPrevSibling:getPrevSibling,
            getUnitById:getUnitById,
            getParentUnitId:getParentUnitId,
            getParentUnit:getParentUnit,
            saveTask: saveTask,
            submitTask: submitTask,
            initTree:initTree,
            deleteUnit:deleteUnit,
            getSibling:getSibling,
            createHashTables:createHashTables,
            isTokenInUnit:isTokenInUnit,
            resetTree:resetTree,
            sortAndUpdate:sortAndUpdate,
            positionInUnit: positionInUnit,
            REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            createTokensHashByTokensArrayForPassage:createTokensHashByTokensArrayForPassage
        };

        return DataService;

        function initTree(){
            trace("DataService - initTree");
            DataService.serverData.annotation_units.forEach(function(unit,index){
                var tokenStack = [];
                unit.children_tokens.forEach(function(token){
                    tokenStack.push(hashTables.tokensHashTable[token.id]);
                })

            });
            DataService.unitType = 'REGULAR';
        }

        /**
         * Build tokens hash object
         * @param annotationTokensArray
         * @returns hash tokens object{{}}
         */
        function tokensArrayToHash(annotationTokensArray){
            trace("DataService - tokensArrayToHash");
            var hash = {};
            annotationTokensArray.forEach(function(token){
                hash[token.id] = DataService.hashTables.tokensHashTable[token.id]
            });
            return hash;
        }

        /**
         * Save the hash tokens object in DataService.tree.tokenMap
         * @param annotationTokensArray
         */
        function createTokensHashByTokensArrayForPassage(annotationTokensArray){
            trace("DataService - createTokensHashByTokensArrayForPassage");
            DataService.tree.tokenMap = tokensArrayToHash(annotationTokensArray);
            // TODO: Need send children_tokens instead of tokens ?
            AssertionService.checkTokenMap(DataService.tree.tokenMap, annotationTokensArray);
        }

        /**
         * Create hash tables, and save them in DataService.hashTables:
         * tokensHashTable- hash object of serverData.tokens.
         * categoriesHashTable- hash object of categories.
         */
        function createHashTables(){
            trace("DataService - createHashTables");
            DataService.serverData.tokens.forEach(function(token){
                DataService.hashTables.tokensHashTable[token.id] = token;
            });
                        
            DataService.categories.forEach(function(category){
                DataService.hashTables.categoriesHashTable[category.id] = category;
            });
        }

        /**
         * Prints the data structure tree.
         */
        function printTree(){
            trace("DataService - printTree");
            console.log(DataService.tree);
            console.log(JSON.stringify(DataService.tree));
        }
        /**
         * Get data by given url.
         * @param url - the url to fetch data from.
         * @returns {*} - The response from the WS in the given url.
         */
        function getData(url) {
            trace("DataService - getData");
            return $http.get(url).then(successFunction, errorFunction);
        }

        /**
         * Return parent unit by given son unitId
         * @param unitId - the unitId to get his parent
         * @returns {*}- the parent unit
         */
        function getParentUnit(unitId){
            trace("DataService - getParentUnit");
            return getUnitById(getParentUnitId(unitId));
        }

        /**
         * Reset tree, put reset about serverData
         */
        function resetTree(){
            trace("DataService - resetTree");
            return apiService.annotation.putTaskData('reset',DataService.serverData).then(function(res){
                return res;
            });

            /*
            return $q(function(resolve, reject) {
                try{
                    $rootScope.$broadcast("DeleteSuccess",{reset:true});
                    $rootScope.$broadcast("resetCursor_" + 0);
                    DataService.tree.AnnotationUnits = [];

                    DataService.tree.tokens.forEach(function(token){
                        token["inParent"] = null;
                    });

                    $rootScope.$broadcast("ResetSuccess");

                    return resolve('Success');
                }catch(e){
                    return resolve('Failed');
                }
            });
            */
        }

        /***
         * Add Category to unit
         * @param unitId - which unit to add the category
         * @param category - the category to add to the unit
         * @returns {*}
         */
        function toggleCategoryForUnit(unitId, category){
            trace("DataService - toggleCategoryForUnit");
            return $q(function(resolve, reject) {
                
                if(category.id == undefined){
                   return reject();
                }

                var unit = getUnitById(unitId);              

                if(unit === null){
                    return reject('ToggleSuccess');
                }
                var elementPos = category ? unit.categories.map(function(x) {return x.id; }).indexOf(category.id) : -1;

                //if the category isn't assigned to that unit yet - add it
                if(elementPos === -1) {
                    if (!restrictionsValidatorService.checkRestrictionsBeforeInsert(getParentUnit(unit.tree_id),unit,DataService.hashTables.tokensHashTable, category)){
                      return reject("Failed") ;
                    }
                    if( unit.AnnotationUnits && unit.AnnotationUnits.length > 0 && restrictionsValidatorService.checkIfUnitViolateForbidChildrenRestriction([category])){
                        return true;
                    }
                    
                    if($rootScope.isSlottedLayerProject){
                    
                        var firstSlotIndex = 0;
                        for(var i=0; i<unit.categories.length; i++){
                            var currentCategory = unit.categories[i];
                            if(currentCategory.fromParentLayer){
                               firstSlotIndex++;
                            }
                        }
                        
                        if(!unit.slotOne){
                            unit.categories[firstSlotIndex] = category;
                        }else if(!unit.slotTwo){
                            unit.categories[firstSlotIndex+1] = category;
                        }
                    }else{
                        unit.categories.push(category);
                    }
                    unit = updateUnitSlots(unit);
                    
                }
                //if the category is already assigned to a unit, remove it
                else{
                    if(unit.categories.length > 1){                        
                        
                        if($rootScope.isSlottedLayerProject){
                            var firstSlotIndex = 0;
                            for(var i=0; i<unit.categories.length; i++){
                                var currentCategoy = unit.categories[i];
                                if(currentCategoy.fromParentLayer){
                                   firstSlotIndex++;
                                }
                            }
                            unit.categories[elementPos] = {};
                            
                            switch(elementPos-firstSlotIndex){
                                case 0:
                                    unit.slotOne = false;
                                    break;
                                case 1:
                                    unit.slotTwo = false;
                                    break;

                            }
                        }else{
                            unit.categories.splice(elementPos,1);
                        }
                        
                    }else{
                        unit.categories = [];
                    }
                }
                DataService.getParentUnit(unit.tree_id).gui_status = "OPEN";
                DataService.getUnitById(unit.tree_id).gui_status = "OPEN";

                // Check tree in AssertionService after toggle category
                AssertionService.checkTree(DataService.tree, DataService.serverData);

                $rootScope.$broadcast("ToggleSuccess",{categories: unit.categories, id: unit.tree_id});
                resolve('ToggleSuccess');
            })

        }

        /**
         * Check if specific token exist in specific unit-
         * return true if the token exist in sons units (like inChildUnitTreeId field)
         * @param selectedUnit
         * @param token
         * @returns {boolean} - Id token exist in selectedUnit
         */
        function isTokenInUnit(selectedUnit, token){
            trace("DataService - isTokenInUnit");
            var tokenInUnit = false;
            if(selectedUnit.AnnotationUnits === undefined){
                selectedUnit.AnnotationUnits = [];
            }
            for(var i=0; i<selectedUnit.AnnotationUnits.length; i++){
                if(selectedUnit.AnnotationUnits[i] == undefined){
                  continue
                }
                var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                if(tokenPosition > -1){
                    tokenInUnit = selectedUnit.AnnotationUnits[i].tree_id;
                    break;
                }
            }
            return tokenInUnit;
        }

        /**
         * Insert to tree- insert new unit to tree
         * @param newObject - object to insert to the tree
         * @param level - the parent unit id
         * @param inInitStage - boolean value, if the tree is initializing now
         * @returns {*} - resolve insert success
         */
        function insertToTree(newObject, level, inInitStage){
            trace("DataService - insertToTree");
            console.log("In insertToTree, newObject=", newObject);

            return $q(function(resolve, reject) {

                if (!inInitStage && DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT) {
                    Core.showAlert("Cant create annotation units in refinement layer")
                    console.log('ALERT - insertToTree -  prevent insert to tree when refinement layer');
                    reject(selectedUnitId);
                }
                var parentUnit = getUnitById(level);

                if (!parentUnit.AnnotationUnits) {
                    parentUnit.AnnotationUnits = [];
                }
                newObject.parent_tree_id = parentUnit.tree_id;

                if (!newObject.tree_id) {
                    if (level.toString() === "0") {
                        //Passage unit or it children units.
                        newObject.tree_id = parseInt(parentUnit.AnnotationUnits.length + 1).toString();
                    } else {
                        newObject.tree_id = level + '-' + parseInt(parentUnit.AnnotationUnits.length + 1);
                    }
                }


                newObject.comment = newObject.comment || "";
                newObject.cluster = newObject.cluster || "";


                var units = [];

                if (newObject.unitType != "REMOTE") {
                    newObject.tokens.forEach(function (token) {
                        if (token.
                            inChildUnitTreeId !== null && token.inChildUnitTreeId !== undefined) {
                            var unitPos = units.map(function (x) {
                                return x.id;
                            }).indexOf(token.inChildUnitTreeId);
                            if (unitPos === -1) {
                                units.push({
                                    id: token.inChildUnitTreeId
                                });
                            };
                            //Find token in parent
                            if (token.unitTreeId === undefined) {
                                token.unitTreeId = "0";
                            }

                            var parentUnit = DataService.getUnitById(token.unitTreeId);
                            var elementPos = parentUnit.tokens.map(function (x) {
                                return x.static.id;
                            }).indexOf(token.static.id);

                            if (elementPos > -1) {
                                parentUnit.tokens[elementPos].inChildUnitTreeId = newObject.tree_id;
                            }
                        }
                    });
                }


                // todo- here is the insertion of the old unit into the new unit (sub unit)
                // todo -- update the id and parent tree id of the new unit
                //Adding children to new unit
                if (units.length > 1) {

                    if (!inInitStage && restrictionsValidatorService.checkIfUnitViolateForbidChildrenRestriction(newObject.categories)) {
                        return level;
                    }

                    units.forEach(function (unit) {
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function (x) {
                            return x.tree_id;
                        }).indexOf(unit.id);
                        if (newObject.AnnotationUnits === undefined) {
                            newObject.AnnotationUnits = [];
                        }
                        if (elementPos > -1) {
                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
//                            parentUnit.AnnotationUnits.splice(elementPos,1);
                        }
                    })
                }


                newObject.unitType = newObject.unitType ? newObject.unitType : "REGULAR";

                if (!inInitStage && newObject.unitType !== "IMPLICIT" && !restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit, newObject, DataService.hashTables.tokensHashTable)) {
                    // if no unit has been added, return the parent unitRowId
                    return level;
                }

                //Removing children unit from parent unit
                if (units.length > 1) {
                    units.forEach(function (unit) {
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function (x) {
                            return x.tree_id;
                        }).indexOf(unit.id);
                        if (elementPos > -1) {
//                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
                            parentUnit.AnnotationUnits.splice(elementPos, 1);
                        }
                    })
                }


                //Update indexInUnit attribute
                // debugger;
                newObject.tokens.forEach(function (token, index, inInit) {
                    token.indexInUnit = index;
                });

                /**
                 * This part computes index_int, which is the index where the unit will be inserted into the list
                 * of children for the current parent unit.
                 */
                var indexToInsert = newObject.tree_id.split("-");
                var index_int = parseInt(indexToInsert[indexToInsert.length - 1]);


                /**
                 * If the unit to be inserted (newObject) is a remote unit, find the first slot in AnnotationUnits
                 * that is empty, and set that as the index where newObject will be inserted. If there is none,
                 * set the index for insertion to be at the end.
                 */
                /**
                 * TODO: after modifying the backend to return tree_ids of remote units as their actual display
                 *       tree_ids, remove this part of the code and check if the tree is built correctly.
                 */
                if (newObject.is_remote_copy) {
                    index_int = (parentUnit.AnnotationUnits.length + 1).toString();
                    for (var i = 0; i < parentUnit.AnnotationUnits.length; i++) {
                        if (parentUnit.AnnotationUnits[i] == undefined) {
                            index_int = i + 1;
                            break;
                        }
                    }

                    /**
                     * For remote units, the annotation_unit_tree_id is that of the unit it was cloned from. Therefore,
                     * we need to update it and this is done in the following line.
                     */
                    newObject.tree_id = newObject.parent_tree_id + "-" + index_int.toString();
                }

                /**
                 * Sort the tokens.
                 */
                newObject.tokens.sort(function (a, b) {
                    if (a.static.start_index > b.static.start_index) {
                        return 1
                    } else if (a.static.start_index < b.static.start_index) {
                        return -1
                    } else return 0
                })

                index_int - 1 > parentUnit.AnnotationUnits.length ? index_int = parentUnit.AnnotationUnits.length + 1 : '';

                //Update slots information
                newObject = updateUnitSlots(newObject);

                !inInitStage ? Core.openAllUnits(newObject) : "";

                parentUnit.AnnotationUnits[index_int - 1] = newObject;

                var parentUnitTokens = parentUnit.tokens;

                parentUnitTokens.forEach(function (token, index) {
                    var elementPos = newObject.tokens.map(function (x) {
                        return x.static.id;
                    }).indexOf(token.static.id);
                    if (elementPos === -1) {
                        token['inChildUnitTreeId'] = null;
                    }
                });


//                parentUnit.gui_status = "OPEN";

                if (!inInitStage) { // After add unit- send to sortAndUpdate. (add unit, no in tree initializing)
                    // Removed code - The is sorUndUpdate in selectionHandler service in the end of initTree.
                    sortAndUpdate(true); // This is needed when adding a unit whose location is before existing units
                }

                updateInUnitIdsForTokens(DataService.tree);

                newObject.unitType !== "REMOTE" ? $rootScope.$broadcast("InsertSuccess", {
                    dataBlock: {
                        id: level,
                        AnnotationUnits: getUnitById(level).AnnotationUnits
                    }, newUnitId: newObject.tree_id
                }) : '';

                // Check tree in AssertionService after add unit
                if (!inInitStage) {
                    // Add indexInUnit attribute to tree.tokens, its needed in the assertion
                    if (!DataService.tree.tokens[1].indexInUnit) {
                        DataService.tree.tokens.forEach(function (token, index) {
                            token.indexInUnit = index;
                        });
                    }
                    AssertionService.checkTree(DataService.tree, DataService.serverData);
                }
                return resolve({status: 'InsertSuccess',id: newObject.tree_id});
            });
        }
        
        function updateUnitSlots(newObject){
            trace("DataService - updateUnitSlots");
            var firstSlotIndex = 0; //the first slot not occupied by the parent layer's categories
            for(var i=0; i<newObject.categories.length; i++){
                var currentCategory = newObject.categories[i];
                if(currentCategory !== undefined && currentCategory.fromParentLayer){
                   firstSlotIndex++;
                }
            }
            if(newObject.categories[firstSlotIndex] !== undefined && newObject.categories[firstSlotIndex].id && !newObject.categories[firstSlotIndex].fromParentLayer){
               newObject.slotOne = true;
            }else{
               newObject.slotOne = false;
            }
            
            if(newObject.categories[firstSlotIndex+1] !== undefined && newObject.categories[firstSlotIndex+1].id && !newObject.categories[firstSlotIndex+1].fromParentLayer){
               newObject.slotTwo = true;
            }else{
               newObject.slotTwo = false;
            }
            
            return newObject;
        }

        /**
         * Calls to updateTreeIds function, and to sortTree function if the parameter doSort = true
         * Buggy function, as now, we commented her calls.
         * But it needed for special annotations, for example- annotate two units together
         * @param doSort
         */
        function sortAndUpdate(doSort){
            trace("DataService - sortAndUpdate");

            if(DataService.tree.AnnotationUnits.length > 0){
                updateTreeIds(DataService.tree);

                doSort ? sortTree(DataService.tree.AnnotationUnits) : '';

                updateTreeIds(DataService.tree);
            }
        }

        /**
         * Delete unit from tree
         * and update the tree without this unit
         * @param unitId
         * @returns {*}
         */
        function deleteUnit(unitId){
            trace("DataService - deleteUnit");
            return $q(function(resolve, reject) {
                var unit = getUnitById(unitId);
                var parentUnit = getUnitById(getParentUnitId(unitId));
                var splitUnitId = unit.tree_id.split('-');
                var unitPositionInParentAnnotationUnits = parseInt(splitUnitId[splitUnitId.length-1])-1;
                $rootScope.$broadcast("RemoveBorder",{id: unit.tree_id});
                if(!unit.AnnotationUnits || unit.AnnotationUnits.length === 0){
                    parentUnit.AnnotationUnits.splice(unitPositionInParentAnnotationUnits,1);
                }else{

                    var preArray = parentUnit.AnnotationUnits.slice(0,unitPositionInParentAnnotationUnits);
                    var afterArray = parentUnit.AnnotationUnits.slice(unitPositionInParentAnnotationUnits+1,parentUnit.AnnotationUnits.length);
                    parentUnit.AnnotationUnits = preArray.concat(unit.AnnotationUnits).concat(afterArray);

                    for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                        if(parentUnit.AnnotationUnits[i].unitType !== "REGULAR"){
                            if(DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].remote_original_id]){
                                if(DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].remote_original_id][parentUnit.AnnotationUnits[i].tree_id]){
                                    delete DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].remote_original_id][parentUnit.AnnotationUnits[i].tree_id];
                                    parentUnit.AnnotationUnits.splice(i,1);
                                    i--;
                                }
                            }else{
                                parentUnit.AnnotationUnits.splice(i,1);
                                i--;
                            }
                          
                        }
                    }
                }

                updateTreeIds(DataService.tree);

                sortTree(DataService.tree.AnnotationUnits);

                updateTreeIds(DataService.tree);

                updateInUnitIdsForTokens(DataService.getParentUnit(unit.tree_id));

                $rootScope.$broadcast("resetCursor_"+parentUnit.tree_id,{categories: unit.categories, id: parentUnit.tree_id});

                $rootScope.$broadcast("DeleteSuccess",{categories: unit.categories, id: unit.tree_id});

                DataService.getParentUnit(unit.tree_id).gui_status = "OPEN";

                // Check tree in AssertionService after delete unit
                // debugger
                AssertionService.checkTree(DataService.tree, DataService.serverData);

                return resolve('DeleteSuccess');
            });
        }

        function updateInUnitIdsForTokens(unit){
            trace("DataService - updateInUnitIdsForTokens");
            unit.tokens.forEach(function(token){
                token.unitTreeId = unit.tree_id;

                    var isTokenInUnit = DataService.isTokenInUnit(unit,token);

                    if(isTokenInUnit){
                        token.inChildUnitTreeId = isTokenInUnit;
                    }else{
                        token.inChildUnitTreeId = null;
                    }
            })

            unit.AnnotationUnits.forEach(function(child_unit){
                updateInUnitIdsForTokens(child_unit);
            })

        }

        /**
         * Sort tree, by sort annotationsUnits
         * @param annotationUnits
         */
        function sortTree(annotationUnits) {
            trace("DataService - sortTree");
            if (annotationUnits.length > 1) {
                annotationUnits.sort(unitComparator);

            }
            for (var i = 0; i < annotationUnits.length; i++) {
                if(annotationUnits[i] == undefined){
                  continue
                }
                sortTree(annotationUnits[i].AnnotationUnits || []);
            }
        }

        /**
         * This function updates the tree IDs so that the index of the unit in the AnnotationUnits 
         * array of its parent is consistent with the tree_id data member.
         * TODO: BUGGY. CHECK AGAIN AFTER MODIFYING THE BACKEND.
         */
        function updateTreeIds(unit, treeId){
            trace("DataService - updateTreeIds");
            if(unit.AnnotationUnits && unit.AnnotationUnits.length > 0){

            //     // remove all empty elements in the array
            //     //for (var i = 0; i < unit.AnnotationUnits.length; i++) {
            //     //    if (unit.AnnotationUnits[i] == undefined) {
            //     //        unit.AnnotationUnits.splice(i,1);
            //     //        i--;
            //     //    }
            //     //}

                for (var i = 0; i < unit.AnnotationUnits.length; i++) {

                    if(unit.AnnotationUnits[i] == undefined){
                      continue
                    }

                    // the old tree id of the unit
                    var oldId = angular.copy(unit.AnnotationUnits[i].tree_id);

                    // updating the id of the unit according to its place in the array
                    // change to getChildTreeId
                    unit.AnnotationUnits[i].tree_id = (unit.tree_id === "0" ? (i+1).toString() : treeId+"-"+(i+1).toString());

                    // update parent treeId
                    unit.AnnotationUnits[i].parent_tree_id = DataService.getParentUnitId(unit.AnnotationUnits[i].tree_id);

                    // if the Id has changed, change the remote units references
                    if(oldId !== unit.AnnotationUnits[i].tree_id){

                        // TODO: Update clonedFromId ?
                        if(DataService.unitsUsedAsRemote[oldId]){
                            DataService.unitsUsedAsRemote[unit.AnnotationUnits[i].tree_id] = angular.copy(DataService.unitsUsedAsRemote[oldId]);
                            delete DataService.unitsUsedAsRemote[oldId];
                        }else{
                            for(var key in DataService.unitsUsedAsRemote){
                                if(DataService.unitsUsedAsRemote[key][oldId]){
                                    DataService.unitsUsedAsRemote[key][unit.AnnotationUnits[i].tree_id] = true;
                                    delete DataService.unitsUsedAsRemote[key][oldId];
                                }
                            }
                        }

                    }
                    updateTreeIds(unit.AnnotationUnits[i],unit.AnnotationUnits[i].tree_id);
                }
            }else{
                unit.tokens.forEach(function(token){
                    token.unitTreeId = treeId;
                    token.inChildUnitTreeId = null;
                });

            }
        }

        /**
         * Sort units - get two units, sort them according to indexInUnit value
         * @param a - first unit
         * @param b - second unit
         * @returns {number} - according the priority of a
         * BUGGY - sortAndUpdate calls to sortTree, sortTree calls to this function,
         * sometimes parentUnit.tokens contain the tokens list, and sometimes parentUnit.tokenCopy contain the tokens list.
         */
        function unitComparator(a, b){
            trace("DataService - unitComparator");
            var aParentUnit = getParentUnit(a.tree_id);
            var bParentUnit = getParentUnit(b.tree_id);

            var aElementPos = aParentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(a.tokens[0].static.id);
            var bElementPos = bParentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(b.tokens[0].static.id);

            if(a.unitType !== "REGULAR" || b.unitType !== "REGULAR"){ // Not REGULAR is first
                if(a.unitType === "REGULAR" && b.unitType !== "REGULAR"){
                    return 1;
                }else if(b.unitType === "REGULAR" && a.unitType !== "REGULAR"){
                    return -1;
                }else{  // Both not regular
                    if(a.unitType === "REMOTE" && b.unitType === "IMPLICIT"){ // Remote before implicit
                        return -1;
                    }else if(a.unitType === "IMPLICIT" && b.unitType === "REMOTE"){
                        return 1;
                    }else{ // Both remote or both implicit
                        if(a.unitType === "REMOTE" && b.unitType === "REMOTE"){ // Both remote
                            if(a.remote_original_id > b.remote_original_id){ //TODO: What is this? cloned_from_id?
                                return 1;
                            }
                            else if(a.remote_original_id < b.remote_original_id){
                                return -1;
                            }else{
                                return 0;  // TODO: Add to assertion service - fail if two remote units have the same parent and clone_from_id
                            }
                        }
                        return 0; // TODO: compare based on an ID, so the sort is stable  - both IMPLICIT
                    }
                }
            }
            // tokenCopy is not contain indexInUnit attribute, with remote units- tokens=[]---error: Cannot read property 'indexInUnit' of undefined
            else {  // Both are regular units
                if(aParentUnit.tokens[aElementPos].indexInUnit > bParentUnit.tokens[bElementPos].indexInUnit){
                    return 1;
                }else if(aParentUnit.tokens[aElementPos].indexInUnit < bParentUnit.tokens[bElementPos].indexInUnit){
                    return -1;
                }else{
                    return 0;
                }
            }
        }

        function tokenStartIndexInParent(token){
            trace("DataService - tokenStartIndexInParent");
            var parentUnit = DataService.getUnitById(token.unitTreeId);
            if(parentUnit !== null){
                var elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                if(elementPos > -1){
                    return parseInt(parentUnit.tokens[elementPos].static.start_index);
                }
            }
        }

        function submitTask(){
            trace("DataService - submitTask");
            return saveTask(true/* submit the task */)
        }

        /**
         * Travers in tree
         * saveTask calls to this function
         * It updates annotation_units fields (tree_id, parent_tree_id, cloned_from_tree_id etc.)
         * @param treeNode - node in the tree, which travers in
         * @returns {boolean}
         */
        function traversInTree(treeNode){
            trace("DataService - traversInTree");
            var unit = {
                tree_id : treeNode.tree_id.toString(),
                task_id: DataService.serverData.id.toString(),
                comment: treeNode.comment || '',
                cluster: treeNode.cluster || '',
                categories: filterCategoriesAtt(angular.copy(treeNode.categories)) || [],
                parent_tree_id: treeNode.unitType === 'REMOTE' ? DataService.getParentUnitId(treeNode.tree_id) : DataService.getParentUnitId(treeNode.tree_id),
                gui_status : treeNode.gui_status || "OPEN",
                type: angular.copy(treeNode.unitType.toUpperCase()),
                is_remote_copy: treeNode.unitType.toUpperCase() === 'REMOTE',
                // todo- remove stsic from tokens
                children_tokens: treeNode.tree_id === "0" ? filterStaticTokens(filterTokensAtt(angular.copy(treeNode.tokens))) : filterStaticTokens(filterTokensAttForUnit(angular.copy(treeNode.tokens))),
                cloned_from_tree_id: treeNode.unitType.toUpperCase() === 'REMOTE' ? treeNode.remote_original_id ? treeNode.remote_original_id: treeNode.cloned_from_tree_id : null
                // remote_original_id - if the tree updated in frontend tree data, cloned_from_tree_id - if the tree updated from server data
            };
            if($rootScope.isSlottedLayerProject){
                
                var firstSlotIndex = 0;
                for(var i=0; i<unit.categories.length; i++){
                    var currentCategoy = unit.categories[i];
                    if(currentCategoy.fromParentLayer){
                       currentCategoy['slot'] = i+3;
                       firstSlotIndex++;
                    }
                }
                
                if(treeNode.slotOne){
                  unit.categories[firstSlotIndex]['slot'] = 1;
                }
                if(treeNode.slotTwo){
                  unit.categories[firstSlotIndex+1]['slot'] = 2;
                }
                
                for(var i=0; i<unit.categories.length; i++){
                    var currentCategory = unit.categories[i];
                    if(currentCategory.id == undefined){
                        unit.categories.splice(i,1);
                        i--;
                    }
                }
                
                if(!treeNode.slotOne && treeNode.slotTwo){
                   return false;
                }
            }


            // if(unit.tree_id === "0"){
            //     delete unit.children_tokens;
            // }
            unit.type === 'REMOTE' ? unit.type = 'REGULAR' : '';
            if(unit.categories.length === 1 && unit.categories[0].id === -1){
                unit.categories = [];
            }

            if(unit.type === "IMPLICIT"){
                delete unit.children_tokens;
            }
            annotation_units.push(unit);
            for(var i=0; i<treeNode.AnnotationUnits.length; i++){
                var output_val = traversInTree(treeNode.AnnotationUnits[i]);
                if (!output_val) {
                    return false;
                }
            }

            return true;
        }

        /*
        * Omri: I think this is never called
         */
        // function arrangeUnitTokens(unitId){
        //     trace("DataService - arrangeUnitTokens");
        //     var currentUnit = getUnitById(unitId);
        //     currentUnit.AnnotationUnits = angular.copy(currentUnit.AnnotationUnits);
        //     arrangeUnitTokensObj(currentUnit);
        //     currentUnit.AnnotationUnits.forEach(function(unit){
        //         unit.tokens.forEach(function(token){
        //             var elementPos = currentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
        //             if(elementPos > -1){
        //                 currentUnit.tokens.splice(elementPos,1);
        //             }
        //         });
        //     })
        //
        // }

        /*
        * Omri: I think this is never called
         */
        // function arrangeUnitTokensObj(currentUnit){
        //     trace("DataService - arrangeUnitTokensObj");
        //     var returnArray = [];
        //     currentUnit.AnnotationUnits = angular.copy(currentUnit.AnnotationUnits);
        //     currentUnit.AnnotationUnits.forEach(function(unit){
        //         unit.tokens.forEach(function(token){
        //             returnArray.push({id:token.id})
        //         });
        //         unit.tokensCopy = returnArray;
        //
        //     })
        //
        // }


        // Remove static from tokens, because the server need get the fields without static member
        function filterStaticTokens(tokens) {
            var newTokens = [];
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    newTokens.push(token.static);
                });
            }
            return newTokens;
        }


        /**
         * Delete some attributes from tokens for the tree root
         * @param tokens
         * @returns {*} filtered tokens
         */
        function filterTokensAtt(tokens){
            trace("DataService - filterTokensAtt");
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    delete token.inChildUnitTreeId;
                    delete token.unitTreeId;
                    delete token.indexInUnit;
                    delete token.borderStyle;
                    delete token.lastTokenNotAdjacent;
                    delete token.nextTokenNotAdjacent;
                    // delete token.positionInChildUnit;
                    delete token.backgroundColor;
                })
            }
            return tokens;

        }

        /**
         * Delete some attributes from tokens for unit
         * @param tokens
         * @returns {*} filtered tokens
         */
        function filterTokensAttForUnit(tokens){
            trace("DataService - filterTokensAttForUnit");
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    delete token.inChildUnitTreeId;
                    delete token.unitTreeId;
                    delete token.indexInUnit;
                    delete token.borderStyle;
                    delete token.lastTokenNotAdjacent;
                    delete token.nextTokenNotAdjacent;
                    // delete token.positionInChildUnit;
                    delete token.backgroundColor;

                    delete token.static.start_index;
                    delete token.static.end_index;
                    delete token.static.require_annotation;
                    delete token.static.tokenization_task_id;
                    delete token.static.text;
                })
            }
            return tokens;

        }

        /**
         * Delete some attributes from categories
         * @param categories
         * @returns {*}- filtered categories
         */
        function filterCategoriesAtt(categories){
            trace("DataService - filterCategoriesAtt");
            if(categories !== undefined){
                categories.forEach(function(category){
                    delete category.shortcut_key;
                    delete category.was_default;
                    delete category.description;
                    delete category.tooltip;
                    delete category.callbackFunction;
                })
            }
            return categories;

        }

        /**
         * Save task when save button clicked
         * @param shouldSubmit - shouldSubmit(submit or draft)
         */
        function saveTask(shouldSubmit){
            trace("DataService - saveTask");
            annotation_units = [];
            var tokensCopy = angular.copy(DataService.tree.tokens);
            tokensCopy = filterTokensAtt(tokensCopy);
            tokensCopy = filterStaticTokens(tokensCopy);// TODO-- remove static from tokens list

            // arrangeUnitTokens("0");
            // Update annotation_units
            var traversResult = traversInTree(DataService.tree);
            if (!traversResult) {
                Core.showNotification('error','Cannot save if a unit has category in slot two but not in slot one.');
                return $q.reject();
            }
            var mode = shouldSubmit ? 'submit' : 'draft';
            DataService.serverData['annotation_units'] = annotation_units;
            DataService.serverData.tokens = [];
            DataService.serverData.tokens= tokensCopy;

            return apiService.annotation.putTaskData(mode,DataService.serverData).then(function(res){
                // Check tree in AssertionService when saving the task
                AssertionService.checkTree(DataService.tree, DataService.serverData);
                $rootScope.$broadcast("ResetSuccess");
                return res;
            });
        }

        /**
         * Get unit by id
         * @param unitID - id of the unit we want to get
         * @returns {*} - unit according to unit id
         */
        function getUnitById(unitID){
            trace("DataService - getUnitById");
            if(unitID == -1){
                return null
            }else if(!unitID || unitID == 0){
                return DataService.tree;
            }else{
                var splittedUnitId = splitStringByDelimiter(unitID,"-");
                var tempUnit = DataService.tree;

                for(var i=0; i<splittedUnitId.length; i++){
                    var unitIdToFind = splittedUnitId.slice(0,i+1).join("-");

                    var unitIndex = tempUnit.AnnotationUnits.findIndex(function(unit){
                      if(unit == undefined){
                        return false;
                      }
                      return unit.tree_id == unitIdToFind
                    });
                    tempUnit.AnnotationUnits.length > 0 && unitIndex > -1 ? tempUnit = tempUnit.AnnotationUnits[unitIndex] : '';
                }
                return !!tempUnit && tempUnit.tree_id == unitID ? tempUnit : null;
            }
        }

        /**
         * Get next sibling unit when hotkey moves down
         * @param lastFocusedUnitId -  the current focused unit
         * @returns {*} - the next sibling
         */
        function getNextSibling(lastFocusedUnitId){
            trace("DataService - getNextSibling");
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].tree_id;
                }
            }else{
                var parentAnnotationUnits = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits;
                var currentIndex = getMyIndexInParentTree(parentAnnotationUnits,lastFocusedUnitId);
                return parentAnnotationUnits[currentIndex+1] ? parentAnnotationUnits[currentIndex+1] : null;

            }
        }

        /**
         * Get prev sibling unit when hotkey moves up
         * @param lastFocusedUnitId - the current focused unit
         * @returns {null} - the prev sibling
         */
        function getPrevSibling(lastFocusedUnitId){
            trace("DataService - getPrevSibling");
            var parentAnnotationUnits = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits;
            var currentIndex = getMyIndexInParentTree(parentAnnotationUnits,lastFocusedUnitId);
            return parentAnnotationUnits[currentIndex-1] ? parentAnnotationUnits[currentIndex-1] : null;
        }

        /**
         * Get index in parent tree
         * @param parentTree
         * @param myUnitId
         * @returns {number}
         */
        function getMyIndexInParentTree(parentTree, myUnitId){
            trace("DataService - getMyIndexInParentTree");
            var currentIndex = 0;
            parentTree.forEach(function(unit,index){
                if(unit.tree_id==myUnitId){
                    currentIndex = index;
                }
            });
            return currentIndex;
        }

        /**
         * Get the first sibling of unit
         * @param unitId
         * @returns {*}- the first sibling
         */
        function getSibling(unitId){
            trace("DataService - getSibling");
            var currentUnit = DataService.getUnitById(unitId);
            return currentUnit.AnnotationUnits[0];
        }

        /**
         * // Get next unit when hotkey moves down and there is no more siblings
         * @param lastFocusedUnitId
         * @param index - lastFocusedUnitId splitted by ‘-’
         * @returns {*}
         */
        function getNextUnit(lastFocusedUnitId, index){
            trace("DataService - getNextUnit");
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].tree_id;
                }
            }else{
                var currentUnit = DataService.getUnitById(lastFocusedUnitId);
                if(currentUnit.AnnotationUnits === undefined){
                    currentUnit.AnnotationUnits = [];
                }

                if(currentUnit.AnnotationUnits.length > index){
                    return currentUnit.AnnotationUnits[index].tree_id;
                }else{
                    if(lastFocusedUnitId == DataService.tree.AnnotationUnits.length){
                        return -1;
                    }
                    var splittedUnitID = splitStringByDelimiter(lastFocusedUnitId,'-');
                    var parentID="";
                    if(currentUnit.tree_id.length >= 3){
                        parentID = splittedUnitID.slice(0,splittedUnitID.length-1).join("-");
                    }
                    else{
                        parentID = 0;
                    }
                    if (parentID != 0){
                        return getNextUnit(parentID,splittedUnitID[splittedUnitID.length-1])
                    }else{
                        return DataService.tree.AnnotationUnits[parseInt(lastFocusedUnitId)].tree_id;
                    }

                }
            }

        }

        /**
         * Get prev unit when hotkey moves up and there is no more siblings
         * @param lastFocusedUnitId
         * @param index - no useful
         * @returns {*}
         */
        function getPrevUnit(lastFocusedUnitId, index){
            trace("DataService - getPrevUnit");
            if(lastFocusedUnitId !== "0"){
                var prevNode = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits[parseInt(lastFocusedUnitId) - 2];
                if(prevNode){
                    while(prevNode.AnnotationUnits.length > 0){
                        prevNode = prevNode.AnnotationUnits[prevNode.AnnotationUnits.length-1];
                    }
                    return prevNode;
                }
                return DataService.tree;
            }
            return DataService.tree;
        }

        /**
         * Success callback.
         * @param response - successful response.
         * @returns {*} - the response data.
         */
        function successFunction(response){
            trace("DataService - successFunction");
            return response.data;
        }

        /**
         * Unsuccessful callback.
         * @param err - the error.
         */
        function errorFunction(err){
            trace("DataService - errorFunction");
            console.error(err);
        }

        /**
         * Split a string by give delimiter.
         * @param stringToSplit - the string to split.
         * @param del - split delimiter.
         */
        function splitStringByDelimiter(stringToSplit,del){
            trace("DataService - splitStringByDelimiter");
            return stringToSplit.toString().split(del);
        }

        /**
         * OLD FUNCTION
         * Get parent unit id
         * @param unitId - unit id, which we search his parent
         * @returns {*} - parent unit id
         */
        // function getParentUnitId(unitId){
        //     trace("DataService - getParentUnitId");
        //     if(unitId === null){
        //         return null;
        //     }
        //     unitId = unitId.toString();
        //     if(unitId.length == 1){
        //         if(unitId =="0"){
        //             return null;
        //         }
        //         return "0";
        //     }
        //     var parentUnitId = unitId.split('-');
        //     parentUnitId = parentUnitId.slice(0,length-1).join('-');
        //     return parentUnitId.toString()
        // }

        /**
         * Get parent unit id
         * @param unitId - unit id, which we search his parent
         * @returns {*} - parent unit id
         */
        function getParentUnitId(unitId) {
            trace("DataService - getParentUnitId");
            if(unitId === null){
                return null;
            }
            var isNum = /^\d+$/.test(unitId);
            if (isNum) {
                 if(unitId === "0"){
                    return null;
                }
                // If unitId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                return "0";
            }
            var index = unitId.lastIndexOf("-");
            var parent = unitId.slice(0, index);
            return parent;
        }

        function positionInUnit(unit, token) {
            for (var i = 0; i < unit.tokens.length; i++) {
                if (unit.tokens[i].static.id === token.static.id) {
                    if (unit.tokens.length === 1) {
                        return 'FirstAndLast';
                    }
                    if (unit.tokens[i].indexInUnit === 0) {
                        return 'First';
                    }
                    if (unit.tokens[i].indexInUnit === unit.tokens.length-1) {
                        return 'Last';
                    }
                    return 'Middle';
                }
            }
            throw "The token " + token.static.text + " isn't exist in unit.tokens";
        }
    }

})();
