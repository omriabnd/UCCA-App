(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('DataService',DataService);

    /**
     * A data hendler service
     * @param $http
     * @returns {
     *  {
     *      tree: {
     *          numOfAnnotationUnits: number,
     *          AnnotationUnits: Array
     *     },
     *    getData: getData,
     *    insertToTree: insertToTree,
     *    selectedTokensToUnit: selectedTokensToUnit
     *  }
     * } - An object containing the service variables and methods.
     */

    /** @ngInject */
    function DataService($http,apiService,$rootScope,restrictionsValidatorService,ENV_CONST,Core,$timeout) {
        var lastInsertedUnitIndex = 0;
        var unitType = 'REGULAR';
        var annotation_units = [];
        var hashTables = {
            tokensHashTable: {},
            categoriesHashTable: {}
        };
        $rootScope.getTokenIdFromDomElem = getTokenIdFromDomElem;
        $rootScope.unitElemsToTokensArray = unitElemsToTokensArray;

        var DataService = {
            /**
             * A data structure that contains rows of selectable words.
             */
            tree: {
                annotation_unit_tree_id : '0',
                text : '',
                numOfAnnotationUnits: 0,
                unitType:'REGULAR',
                containsAllParentUnits: false,
                AnnotationUnits : [],
                gui_status: 'OPEN'
            },
            lastInsertedUnitIndex: lastInsertedUnitIndex,
            unitType:unitType,
            currentTask:null,
            hashTables: hashTables,
            categories: [],
            getData: getData,
            insertToTree: insertToTree,
            deleteFromTree: deleteFromTree,
            printTree: printTree,
            selectedTokensToUnit:selectedTokensToUnit,
            addCategoryToExistingRow: addCategoryToExistingRow,
            getNextUnit: getNextUnit,
            getPrevUnit: getPrevUnit,
            getNextSibling:getNextSibling,
            getPrevSibling:getPrevSibling,
            getUnitById:getUnitById,
            getParentUnitId:getParentUnitId,
            getUnitByUniqueId:getUnitByUniqueId,
            updateDomUnitWrappers:updateDomUnitWrappers,
            saveTask: saveTask,
            submitTask: submitTask,
            wrapWords:wrapWords,
            updateDomWhenInsertFinishes:updateDomWhenInsertFinishes,
            initTree:initTree,
            createHashTables:createHashTables,
            REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            createTokensHashByTokensArrayForPassage:createTokensHashByTokensArrayForPassage
        };

        return DataService;

        function unitElemsToTokensArray(group){
            if(group && angular.isArray(group)){
                group = group.map(function(elem) {
                    if ($(elem).hasClass('unit-wrapper'))
                        return Array.prototype.slice.call( elem.children )
                    return elem
                })
                group = [].concat.apply([], group)
            }
            return group;
        }
        
        function getTokenIdFromDomElem(elem,byFirstToken){
            if($(elem).attr('token-id')){
                return parseInt($(elem).attr('token-id'));
            }else{
                if(byFirstToken){
                    return parseInt($($(elem).find('[token-id]')[0]).attr('token-id'))
                }
                return parseInt($($(elem).find('[token-id]')[$(elem).find('[token-id]').length-1]).attr('token-id'))
            }
        }

        function initTree(){
            DataService.currentTask.annotation_units.forEach(function(unit,index){
                //for each unit go through it tokens and find them in the tokens array,
                // create a token array and wrap it with spans, then insert it to the tree at the right order
                $rootScope.selectedTokensArray = [];
                if(index > 0){
                    for(var i=0; i<unit.children_tokens.length; i++){
                        var fullTokenObject = DataService.hashTables.tokensHashTable[unit.children_tokens[i].id];
                        var tokenToWrap = [{
                            id: fullTokenObject.id,
                            text: fullTokenObject.text,
                            parent_id: unit.parent_id
                        }];
                        $rootScope.selectedTokensArray.push(DataService.wrapWords(tokenToWrap,true));
                    }

                    var unitCategoriesArray = [];
                    for(var i=0; i<unit.categories.length; i++){
                        var category = {
                            id: DataService.hashTables.categoriesHashTable[unit.categories[i].id].id,
                            color: DataService.hashTables.categoriesHashTable[unit.categories[i].id].color,
                            backgroundColor: DataService.hashTables.categoriesHashTable[unit.categories[i].id].backgroundColor,
                            abbreviation: DataService.hashTables.categoriesHashTable[unit.categories[i].id].abbreviation,
                            name: DataService.hashTables.categoriesHashTable[unit.categories[i].id].name,
                            shouldRefine: DataService.hashTables.categoriesHashTable[unit.categories[i].id].shouldRefine,
                            refinedCategory: DataService.hashTables.categoriesHashTable[unit.categories[i].id].refinedCategory,
                        };
                        unitCategoriesArray.push(category);
                    }
                    if(unit.is_remote_copy){
                        DataService.unitType = 'REMOTE';
                    }else{
                        DataService.unitType = 'REGULAR';
                    }
                    if($rootScope.selectedTokensArray.length > 0){
                        $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                        var tokenToUnitData = {
                            selectedTokensArray : $rootScope.selectedTokensArray,
                            id : DataService.tree.AnnotationUnits+1,
                            level : unit.parent_id,
                            rowCategoryID : $rootScope.currentCategoryID,
                            rowCategoryColor : $rootScope.currentCategoryColor,
                            rowCategoryBGColor : $rootScope.currentCategoryBGColor,
                            rowRefinedCategory : $rootScope.currentCategoryIsRefined,
                            rowCategoryAbbreviation : $rootScope.currentCategoryAbbreviation,
                            rowCategoryName : $rootScope.currentCategoryName,
                            containsAllParentUnits : false,
                            categoriesArray : unitCategoriesArray,
                            isFirstInitTree : true,
                            unitGuiStatus : unit.gui_status
                        }

                        delete DataService.remoteFromUnit;
                        if(unit.is_remote_copy){
                            DataService.remoteFromUnit = {
                                remote_original_id : unit.annotation_unit_tree_id,
                                remote_original_unique_id : DataService.getUnitById(unit.annotation_unit_tree_id).unitUniqueId
                            }
                            
                        }
                        
                        $rootScope.clckedLine = DataService.selectedTokensToUnit(tokenToUnitData);

                        DataService.getUnitById($rootScope.clckedLine).comment = unit.comment;
                    }

                    if(unit.type == 'IMPLICIT'){
                        DataService.unitType = 'REMOTE';

                        var objToPush = {
                            rowId : '',
                            text : '<span>IMPLICIT UNIT</span>',
                            numOfAnnotationUnits: 0,
                            categories:unitCategoriesArray,
                            comment:"",
                            rowShape:'',
                            unitType:'IMPLICIT',
                            gui_status:'OPEN',
                            usedAsRemote:[],
                            children_tokens:[],
                            containsAllParentUnits: false,
                            AnnotationUnits : [

                            ]
                        };

                        DataService.insertToTree(objToPush,$rootScope.clckedLine);
                    }
                }
            })
            DataService.unitType = 'REGULAR';
        }

        function tokensArrayToHash(annotationTokensArray){
            var hash = {}
            annotationTokensArray.forEach(function(token){
                hash[token.id] = DataService.hashTables.tokensHashTable[token.id]
            })
            return hash;
        }

        function createTokensHashByTokensArrayForPassage(annotationTokensArray){
            DataService.tree.children_tokens_hash = tokensArrayToHash(annotationTokensArray);
        }

        function createHashTables(){
            DataService.currentTask.tokens.forEach(function(token){
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
            console.log(DataService.tree);
            console.log(JSON.stringify(DataService.tree));
        }
        /**
         * Get data by given url.
         * @param url - the url to fetch data from.
         * @returns {*} - The response from the WS in the given url.
         */
        function getData(url){
            return $http.get(url).then(successFunction,errorFunction);
        }

        /**
         * Updates the data structure. if level == 0 the new object will inserted in the top level of the data structure
         * else the function will traverse in the data structure and will the suitable place to insert newObject.
         * @param newObject - the new object to insert to the data structure.
         * @param level - defines which level in the data structure to insert the newObject.
         * @return newObject.annotation_unit_tree_id - the new row id.
         */
        
        function insertToTree(newObject,level){
            // console.log('newObject',newObject);
            var tempObject = null;
            if(level == 0){

                DataService.tree.numOfAnnotationUnits++;
                newObject.annotation_unit_tree_id = DataService.tree.numOfAnnotationUnits;
                // DataService.tree.AnnotationUnits.push(newObject);
                tempObject = DataService.tree;

                // update the dataseervice hash to be without the tokens
                // removeTokensFromPassage(newObject);
            }else{
                var splittedIndex = level.toString().split('-');

                tempObject = DataService.tree.AnnotationUnits[parseInt(splittedIndex[0]) - 1];
                if(tempObject){
                    for (var i=1; i<splittedIndex.length; i++){
                        if(tempObject.AnnotationUnits[parseInt(splittedIndex[i]) - 1]){
                            tempObject = tempObject.AnnotationUnits[parseInt(splittedIndex[i]) - 1];
                        }else{
                            // fix when first load page, with remote unit and next sibling regular annotation unit with childrens
                            tempObject = tempObject.AnnotationUnits[tempObject.AnnotationUnits.length - 1];
                            level = tempObject.annotation_unit_tree_id;
                        }
                    }
                    if(tempObject){
                        tempObject.numOfAnnotationUnits++;
                        newObject.annotation_unit_tree_id = level+'-'+(tempObject.AnnotationUnits.length+1)
                        
                        if(newObject.unitType == 'REMOTE'){
                            newObject.remote_located_parent_id = level;                 
                            newObject.remote_original_id = DataService.remoteFromUnit.remote_original_id   
                            newObject.remote_original_unique_id = DataService.remoteFromUnit.remote_original_unique_id   
                            addRemoteChildToUsedAsRemoteOriginalUnit(newObject.remote_original_id,newObject.annotation_unit_tree_id)
                        }
                        // tempObject.AnnotationUnits.push(newObject);
                        // removeTokensFromUnit(newObject,tempObject)
                    }
                    
                }
            }
            // add the new unit to model
            tempObject.AnnotationUnits.push(newObject);
            // update the dataseervice hash to be without the tokens
            if(tempObject.annotation_unit_tree_id == "0"){
                removeTokensFromPassage(newObject);
            }else{
                removeTokensFromUnit(newObject,tempObject);
            }

            
            var parentUnit = DataService.getUnitById(DataService.getParentUnitId(newObject.annotation_unit_tree_id));
            parentUnit.AnnotationUnits.sort(sortByOrderNumber)
            updateTreeNodesIds(parentUnit);

            DataService.lastInsertedUnitIndex = newObject.annotation_unit_tree_id;
            // console.log(DataService.tree);
            return DataService.lastInsertedUnitIndex;
        }

        function updateDomUnitWrappers(parentUnit){
            // console.log("DataService.duringInit",DataService.duringInit);
            if(DataService.duringInit){
                return;
            }else{
                for(var i=0; i<parentUnit.AnnotationUnits.length; i++){

                    if(parentUnit.AnnotationUnits[i].AnnotationUnits.length){
                        updateDomUnitWrappers(parentUnit.AnnotationUnits[i]);
                    }
                    var child = parentUnit.AnnotationUnits[i];
                    var parentLevel = parentUnit.annotation_unit_tree_id;

                    var wordIdToSearch = child.orderNumber;
                    var unitInParentRow = getUnitInParentRowByWordId(parentLevel,wordIdToSearch);
                    // update the root units
                    // console.log("unitInParentRow",unitInParentRow);
                    if(unitInParentRow[0]){
                        // update the parent unit 'child-unit-id' , 'unit-wrapper-id'
                        $(unitInParentRow).attr('child-unit-id',child.annotation_unit_tree_id)

                        // unitToUpdate.annotation_unit_tree_id = (parseInt(unitToUpdate.annotation_unit_tree_id) + 1).toString()
                        $(unitInParentRow).attr('unit-wrapper-id','unit-wrapper-'+parentLevel+'-'+child.annotation_unit_tree_id)
                    }

                }
            }
        }

        function hasAtLeastOneCollapseParent(unit){
            if(unit.annotation_unit_tree_id == "0") {
                return false;
            }else{
                if(unit.gui_status == 'COLLAPSE'){ return true; }
                else{ 
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId(unit.annotation_unit_tree_id));
                    return hasAtLeastOneCollapseParent(parentUnit);
                }
            }

        }

        function updateDomWhenInsertFinishes(){
            $timeout(function(){
                var parentUnit = DataService.getUnitById(DataService.getParentUnitId($rootScope.clckedLine));
                if(hasAtLeastOneCollapseParent(parentUnit)){ // is parent unit is collapse
                    // do nothing
                }else{
                    // give focus to the new unit
                    $('.selected-row').removeClass('selected-row');
                    $('#directive-info-data-container-'+$rootScope.clckedLine).addClass('selected-row');
                    // make a scrollTo new unit
                    $('#directive-info-data-container-'+$rootScope.clckedLine).attr('tabindex','-1').focus()
                }
            });
        }

        /**
         * Update the tree nodes. get a sub-tree parent node and updates all the sub tree.
         * This is a recursive function : if subTreeParentNode has children the function will be
         * called again for each child where the current child will be the new subTreeParentNode.
         * @param subTreeParentNode - the sub-tree parent node.
         * @param nodeNewId - the node new id
         */
        function updateTreeNodesIds(subTreeParentNode){
            // console.log(subTreeParentNode.annotation_unit_tree_id+" -> "+nodeNewId);

            for(var i=0; i<subTreeParentNode.AnnotationUnits.length; i++){
                var old_tree_id = subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id
                if(subTreeParentNode.annotation_unit_tree_id == "0"){
                    subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id = String(i+1) 
                }else{
                    subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id = subTreeParentNode.annotation_unit_tree_id+'-'+(i+1);
                }

                if(subTreeParentNode.AnnotationUnits[i].unitType=='REMOTE'){
                    // update remote_located_parent_id
                    subTreeParentNode.AnnotationUnits[i].remote_located_parent_id = DataService.getParentUnitId(subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id)
                    // update remote_original_id
                    var remmeberToUpdateLater = {
                        newRemoteTreeId : subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id,
                        oldRemoteTreeId: old_tree_id,
                        oldRemoteOriginalId : subTreeParentNode.AnnotationUnits[i].remote_original_id
                    }
                    DataService.REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT[remmeberToUpdateLater.oldRemoteTreeId]=remmeberToUpdateLater
                }

                // need to update the usedAsRemote array after - after the recursion ends
                if(subTreeParentNode.AnnotationUnits[i].usedAsRemote && subTreeParentNode.AnnotationUnits[i].usedAsRemote.length){
                    var remmeberToUpdateLater = {
                        newUnitId : subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id,
                        oldUnitId : old_tree_id
                    }
                    DataService.USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT[remmeberToUpdateLater.newUnitId] = remmeberToUpdateLater
                }
                if(subTreeParentNode.TEMP_LAST_INSERTED_UNIT){
                    DataService.lastInsertedUnitIndex = subTreeParentNode.annotation_unit_tree_id
                    delete subTreeParentNode.TEMP_LAST_INSERTED_UNIT;
                }
                updateTreeNodesIds(subTreeParentNode.AnnotationUnits[i])
            }
            if(subTreeParentNode.TEMP_LAST_INSERTED_UNIT){
                DataService.lastInsertedUnitIndex = subTreeParentNode.annotation_unit_tree_id
                delete subTreeParentNode.TEMP_LAST_INSERTED_UNIT;
            }

        }

        function getUnitInParentRowByWordId(parentLevel,wordIdToSearch){
            return $('#directive-info-data-container-'+parentLevel).find('[token-id='+wordIdToSearch+']').parent()
        }

        function updateUnitIdAndDom(unit){
            console.log("unit",unit);
            updateDomElements(unit)
        }

        function updateDomElements(unitToUpdate){
            // var unitChildren = $('#row-'+unitToUpdate.annotation_unit_tree_id).find($('.unit-wrapper'));
            var unitChildren = $('#row-'+unitToUpdate.annotation_unit_tree_id);
            // update its tree_id
            unitToUpdate.annotation_unit_tree_id = (parseInt(unitToUpdate.annotation_unit_tree_id) + 1).toString()

        }

        function getNewUnitIndex(newUnit,annotationUnitsArray){
            var index = 0;
            annotationUnitsArray.forEach(function(unit,i){
                if( newUnit.orderNumber > unit.orderNumber ){
                    index = i;
                }
            })
            return index;
        }

        function sortByOrderNumber(a,b){
            var a_orderNumber = parseInt(a.orderNumber);
            var b_orderNumber = parseInt(b.orderNumber);
            if (a_orderNumber  < b_orderNumber )
                return -1;
            if (a_orderNumber  > b_orderNumber )
                return 1;
            return 0;

        }

        function removeTokensFromUnit(newObject,unit){
            // update the dataseervice hash to be without the tokens
            newObject.children_tokens.forEach(function(token){
                delete unit.children_tokens_hash[token.id]
            })
        }

        function removeTokensFromPassage(newObject){
            // update the dataseervice hash to be without the tokens
            newObject.children_tokens.forEach(function(token){
                delete DataService.tree.children_tokens_hash[token.id]
            })
            // console.log("Passage tokens number after removing : ", Object.keys(DataService.tree.children_tokens_hash).length)
        }

        function insertTokensBackToUnit(unit){
            var parentUnit = DataService.getUnitById(getParentUnitId(unit.annotation_unit_tree_id));
            Object.keys(unit.children_tokens_hash).forEach(function(tokenid){
                parentUnit.children_tokens_hash[tokenid] = DataService.hashTables.tokensHashTable[tokenid];
            })
        }

        function insertTokensBackToPassage(unitIndex){
            DataService.tree.AnnotationUnits[unitIndex].children_tokens.forEach(function(token){
                DataService.tree.children_tokens_hash[token.id] = DataService.hashTables.tokensHashTable[token.id];
            })
            // console.log("Passage tokens number after putting back : ", Object.keys(DataService.tree.children_tokens_hash).length)
            if( DataService.tree.AnnotationUnits[unitIndex].AnnotationUnits.length > 0){
                DataService.tree.AnnotationUnits[unitIndex].AnnotationUnits.forEach(function(unit){
                    removeTokensFromPassage(unit);
                })  
            }
        }

        /**
         * Delete row from the data tree.
         * If the node is in the data tree top level all it's child is transferred 1 level up. deletes the node and updated tree.
         * If the node is not at the tree's top level the function will traverse to it and then all it's child is transferred 1 level up. deletes the node and updated tree.
         * @param row_id - node id.
         */
        function deleteFromTree(row_id){
            // console.log('row_id',row_id);
            if(row_id != "0"){
                var splittedId = row_id.toString().split('-');
                var tempObject;
                var treeNodeAnnotationUnitsLength;
                var indexToInsertChild;
                var unitToDelete = DataService.getUnitById(row_id);
                if(splittedId.length == 1){
                    /**
                     * Node in tree's top level - the main passage.
                     */

                    var parentUnit = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1]
                    var unitToDeleteChildren = parentUnit.AnnotationUnits;

                    for(var i=0; i<unitToDeleteChildren.length; i++){
                        if(unitToDeleteChildren[i].unitType == 'REMOTE'){
                            removeRemoteChildFromUsedAsRemoteOriginalUnit(unitToDeleteChildren[i].remote_original_id,unitToDeleteChildren[i].annotation_unit_tree_id);
                            DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits.splice(i,1);
                            DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].numOfAnnotationUnits = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits.length;
                            i--;
                        }
                    }

                    treeNodeAnnotationUnitsLength = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits.length;
                    indexToInsertChild = parseInt(splittedId[0]);
                    for(var i=0; i<treeNodeAnnotationUnitsLength; i++){
                        DataService.tree.AnnotationUnits.splice(indexToInsertChild, 0, DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits[i]);
                        indexToInsertChild++
                    }

                    var unitIndex = parseInt(splittedId[0]) - 1;
                    // update the main passage tokens hash table
                    insertTokensBackToPassage(unitIndex);

                    // remove the unit from its parent
                    DataService.tree.AnnotationUnits.splice(unitIndex,1);
                    DataService.tree.numOfAnnotationUnits = DataService.tree.AnnotationUnits.length;
                    

                    //Remove border from parent + update tree node ids
                    updateTreeNodesIds(DataService.tree);

                }else{
                    /**
                     * Traverse to the node.
                     */
                    tempObject = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1];
                    for (i=1; i<splittedId.length-1; i++){
                        tempObject = tempObject.AnnotationUnits[parseInt(splittedId[i]) - 1];
                    }

                    var deletedRow = tempObject.AnnotationUnits[parseInt(splittedId[splittedId.length-1])-1];

                    var unitToDeleteChildren = deletedRow.AnnotationUnits;

                    for(var i=0; i<unitToDeleteChildren.length; i++){
                        if(unitToDeleteChildren[i].unitType == 'REMOTE'){
                            deletedRow.AnnotationUnits.splice(i,1);
                            deletedRow.numOfAnnotationUnits = deletedRow.AnnotationUnits.length;
                            i--;
                        }
                    }

                    deletedRow != undefined ? treeNodeAnnotationUnitsLength = deletedRow.AnnotationUnits.length : treeNodeAnnotationUnitsLength = 0;
                    indexToInsertChild = parseInt(splittedId[splittedId.length-1]);
                    for(i=0; i<treeNodeAnnotationUnitsLength; i++){
                        tempObject.AnnotationUnits.splice(indexToInsertChild, 0, deletedRow.AnnotationUnits[i]);
                        indexToInsertChild++
                    }

                    var unitIndex = parseInt(splittedId[splittedId.length-1])-1;
                    // update the unit tokens hash table
                    insertTokensBackToUnit(unitToDelete);

                    tempObject.AnnotationUnits.splice(unitIndex,1);

                    updateTreeNodesIds(tempObject);
                }
                if(unitToDelete.unitType == "REMOTE"){
                    updateOriginalRemoteUnitUsedAsRemoteArray(unitToDelete)
                }
                updateRemoteUnitsAndUsedAsRemote()
                return updatedFocusedUnitId(row_id);
            }else{
                return "cant_delete_root";
            }
        }

        function updateRemoteUnitsAndUsedAsRemote(){
            var USED_AS_REMOTE_UNITS = DataService.USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT;
            var REMOTE_TEMPS_OBJ = DataService.REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT;
            // console.log("USED_AS_REMOTE_UNITS",USED_AS_REMOTE_UNITS);
            // console.log("REMOTE_TEMPS_OBJ",REMOTE_TEMPS_OBJ);
            
            Object.keys(USED_AS_REMOTE_UNITS) && Object.keys(USED_AS_REMOTE_UNITS).forEach(function(key,index){
                // console.log(index,USED_AS_REMOTE_UNITS[key]);
                var originilUnitToUpdate = DataService.getUnitById(USED_AS_REMOTE_UNITS[key].newUnitId)
                originilUnitToUpdate.usedAsRemote.forEach(function(unitId,index){
                    // update it to be the new remotId
                    if(REMOTE_TEMPS_OBJ[unitId]){
                        // console.log("UPADTE "+unitId+"TO "+REMOTE_TEMPS_OBJ[unitId].newRemoteTreeId);
                        originilUnitToUpdate.usedAsRemote[index] = REMOTE_TEMPS_OBJ[unitId].newRemoteTreeId
                    }
                })
            })
            // DataService.printTree()
            resetRemoteTempArrays();                
        }
        function addRemoteChildToUsedAsRemoteOriginalUnit(originalUnitId,unitIdToAdd){
            var originalUnit = DataService.getUnitById(originalUnitId);
            originalUnit.usedAsRemote.push(unitIdToAdd);
        }

        function removeRemoteChildFromUsedAsRemoteOriginalUnit(originalUnitId,unitIdToRemove){
            var originalUnit = DataService.getUnitById(originalUnitId);
            originalUnit.usedAsRemote = originalUnit.usedAsRemote.filter(function(unitId){return unitId!=unitIdToRemove});
        }

        function isInArray(obj,arrayOfObj){
            return arrayOfObj && arrayOfObj.indexOf(obj) > -1
        }


        function resetRemoteTempArrays(){
            DataService.REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT = {};
            DataService.USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT = {};
        }
        /*
            function that get the remote_row_id  data we want to delete, and update its original 
            unit 'usedAsRemote' array by remove itself from it
        */
        function updateOriginalRemoteUnitUsedAsRemoteArray(deletedRemoteRowId){
            var originalUnit = DataService.getUnitByUniqueId(deletedRemoteRowId.remote_original_unique_id)
            originalUnit.usedAsRemote = originalUnit.usedAsRemote.filter(function(remoteId){
                return remoteId != deletedRemoteRowId.annotation_unit_tree_id
            })
        }


        function updatedFocusedUnitId(row_id){
            var splittedRowId = row_id.toString().split('-');
            if(splittedRowId.length == 1){
                if(parseInt(splittedRowId[0]) > 0){
                    return (parseInt(splittedRowId[0])-1).toString();
                }
            }else{
                var rowParentIndex = '';
                if(splittedRowId[splittedRowId.length-1] == '1'){
                    for (var i=0; i<splittedRowId.length-2; i++){
                        rowParentIndex += splittedRowId[i] + '.';
                    }
                    rowParentIndex += splittedRowId[splittedRowId.length -2];
                    return rowParentIndex;
                }else{
                    for (var i=0; i<splittedRowId.length-1; i++){
                        rowParentIndex += splittedRowId[i] + '.';
                    }
                    rowParentIndex += parseInt(splittedRowId[splittedRowId.length -1])-1;
                    return rowParentIndex;
                }
            }
        }

        function getUnitTreeIdFromDomElem(elem){
            var fullPath = $(elem).attr('unit-wrapper-id').split('unit-wrapper-')[1];
            var fullPathLength = fullPath.split("-").length;
            var childUnitTreeId = $(elem).attr('child-unit-id');
            // var childUnitTreeIdLength = childUnitTreeId.split("-").length;
            // var unitId = fullPath.split('-').splice(1, fullPathLength - childUnitTreeIdLength ).join('-');
            // return unitId;
            return childUnitTreeId;
        }

        function removeFromTreeModel(unitId){
            var parentUnit = DataService.getUnitById( DataService.getParentUnitId(unitId) )
            
            var unitIndex = parentUnit.AnnotationUnits.findIndex(function(annotationUnit){
                return annotationUnit.annotation_unit_tree_id == unitId;
            })
            parentUnit.AnnotationUnits.splice(unitIndex,1)
        }

        function isRemoteIdGoingToChange(remoteId,unitsIdsToDeleteArr){
            if(remoteId == "0"){
                return false;
            }
            else if(unitsIdsToDeleteArr.indexOf(remoteId) != -1){
                return true;
            }else{
                var parentId = DataService.getParentUnitId(remoteId);
                return isRemoteIdGoingToChange(parentId,unitsIdsToDeleteArr);
            }
        }

        function isDirectChildOf(childUnitId,parentUnitIdToCheck){
            if(childUnitId == "0"){
                return false;
            }else if(DataService.getParentUnitId(childUnitId) == parentUnitIdToCheck){
                return true;
            }else{
                var parentId = DataService.getParentUnitId(childUnitId);
                return isDirectChildOf(parentId,parentUnitIdToCheck);
            }
        }

        function getFutureRemoteId(remoteId,parentIdToDel){
            if(isDirectChildOf(remoteId,parentIdToDel)){
                return remoteId+"-1"
            }else{
                return parentIdToDel+"-"+remoteId
            }
        }

        function getFutureOriginalId(originalId,parentIdToDelArr){
            for (var i = 0; i < parentIdToDelArr.length; i++) {
                var parentId = parentIdToDelArr[i];
                if(originalId == parentId){
                    return futureParentId + '-' + originalTail;
                }
                if(isDirectChildOf(originalId,parentId)){
                    var futureParentId = parentIdToDelArr[0] + "-" + (i+1);
                    var originalTail = originalId.split("-")[originalId.split("-").length-1]
                    return futureParentId + '-' + originalTail;
                }
                
            };

        }

        function updateUsedAsRemotes(unitsIdsToDeleteArr,newUnitToAdd){
            for (var j = 0; j < newUnitToAdd.AnnotationUnits.length; j++) {
                var unitChild = newUnitToAdd.AnnotationUnits[j];
                updateUsedAsRemotes(unitsIdsToDeleteArr,unitChild)
                for (var i = 0; i < unitChild.usedAsRemote.length; i++) {
                    var id = unitChild.usedAsRemote[i];
                    if(isRemoteIdGoingToChange(id,unitsIdsToDeleteArr) == true){
                        var futureRemoteId = getFutureRemoteId(id,unitsIdsToDeleteArr[0]);
                        var oldId = unitChild.usedAsRemote[i];
                        var unit = DataService.getUnitByUniqueId(unitChild.unitUniqueId);
                        unit.usedAsRemote[i] = futureRemoteId;
                        unitChild.usedAsRemote[i] = futureRemoteId;
                    }
                };
            };
            
        }

        function getUnitTokensIdsFromElem(unit){
            return Array.prototype.slice.call( unit ).map(function(elem){
                if($(elem).hasClass('selectable-word')){
                    return {
                        id : $(elem).attr('token-id')
                    }
                }
            })
        };

        function getUnitFromTree(parentUnit,unitUniqueId){
            if(parentUnit.unitUniqueId == unitUniqueId){
                return parentUnit;
            }else{
                var result = null;
                for (var i = 0; i < parentUnit.AnnotationUnits.length; i++) {
                    if( result == null ){
                        var unit = parentUnit.AnnotationUnits[i];
                        result = getUnitFromTree(unit,unitUniqueId);
                    }
                    // console.log('result',result);
                };
                return result;
            }
            return null;
        }

        function getUnitByUniqueId(unitUniqueId){
            var foundUnit = getUnitFromTree(DataService.tree,unitUniqueId);
            return foundUnit;
        }

        function updateRemoteOriginalIds(parentUnit){
            for (var i = 0; i < parentUnit.AnnotationUnits.length; i++) {
                var childUnit = parentUnit.AnnotationUnits[i];
                updateRemoteOriginalIds(childUnit);
                if(childUnit.remote_original_unique_id){
                    console.log("remote tree id: "+childUnit.annotation_unit_tree_id);
                    console.log("old remote original id: "+childUnit.remote_original_id);
                    console.log("unique original id: "+childUnit.remote_original_unique_id);
                    var remoteOriginalUnit = getUnitByUniqueId(childUnit.remote_original_unique_id);
                    if(remoteOriginalUnit){
                        console.log("new remote original id: "+remoteOriginalUnit.annotation_unit_tree_id);
                        childUnit.remote_original_id = remoteOriginalUnit.annotation_unit_tree_id;
                    }
                }
            };
        }
        /**
         * Gets the selected words array turns the into 1 line and insert then into the data structure.
         * @param selectedTokensArray - the selected words.
         * @param id
         * @param level - defines the level to insert the words. if undefined insertion will go the top level.
         * @param rowColor - defines the row color.
         */
        function selectedTokensToUnit(tokenToUnitData){
            var selectedTokensArray = tokenToUnitData.selectedTokensArray;
            var id = tokenToUnitData.id;
            var level = tokenToUnitData.level;
            var rowCategoryID = tokenToUnitData.rowCategoryID;
            var rowCategoryColor = tokenToUnitData.rowCategoryColor;
            var rowCategoryBGColor = tokenToUnitData.rowCategoryBGColor;
            var rowRefinedCategory = tokenToUnitData.rowRefinedCategory;
            var rowCategoryAbbreviation = tokenToUnitData.rowCategoryAbbreviation;
            var rowCategoryName = tokenToUnitData.rowCategoryName;
            var containsAllParentUnits = tokenToUnitData.containsAllParentUnits;
            var categoriesArray = tokenToUnitData.categoriesArray;
            var isFirstInitTree = tokenToUnitData.isFirstInitTree;
            var unitGuiStatus = tokenToUnitData.unitGuiStatus;
            var uniqueId = Math.floor(Math.random() * 10000000000);
            if(selectedTokensArray.length > 0){
                var attachedWords = '';
                // $scope.currentColor = color;
                // var lastTokenId = parseInt(splitStringByDelimiter($(selectedTokensArray[0]).attr('data-wordid'),"-")[1]);
                var lastTokenId = $rootScope.getTokenIdFromDomElem($(selectedTokensArray[0]));
                var children_tokens = [];
                var selected_units_array = [];
                var removeFromTree = [];
                selectedTokensArray.forEach(function(word,index){
                    if($(word).hasClass('unit-wrapper')){
                        var currentUnitId = getUnitTreeIdFromDomElem(word);
                        var currentUnit = angular.copy(DataService.getUnitById(currentUnitId));
                        var unitTokens = getUnitTokensIdsFromElem($(word)[0].children);
                        currentUnit.annotation_unit_tree_id = '';
                        
                        selected_units_array.push(
                            currentUnit
                        )
                        // add the current unit's tokens to the tokens array
                        children_tokens = children_tokens.concat(unitTokens);
                        removeFromTree.push(currentUnitId)
                    }else{
                        children_tokens.push({
                            id: $(word).attr('token-id')
                        })
                    }
                    // var currentTokenId = parseInt(splitStringByDelimiter($(word).attr('data-wordid'),"-")[1]);
                    var currentTokenId = $rootScope.getTokenIdFromDomElem(word,true/* by first token in case of unit*/);
                    if(index > 0){
                        if(currentTokenId > lastTokenId + 1){
                            attachedWords += '<span class="dot-sep">...</span>';
                            attachedWords += ' ';
                        }
                    }
                    attachedWords += word;
                    attachedWords += ' ';
                    lastTokenId = $rootScope.getTokenIdFromDomElem(word,false/*by last token in case of unit*/);
                });

                var objToPush = { // TODO: take out from here with constaructor ANNOTATION_UNIT
                    annotation_unit_tree_id : '',
                    unitUniqueId : uniqueId,
                    text : attachedWords,
                    numOfAnnotationUnits: 0,
                    categories:[],
                    comment:"",
                    rowShape:'',
                    usedAsRemote:[],
                    children_tokens: children_tokens,
                    children_tokens_hash: tokensArrayToHash(children_tokens),
                    gui_status: unitGuiStatus ? unitGuiStatus : 'OPEN',
                    unitType:DataService.unitType,
                    containsAllParentUnits: containsAllParentUnits || false,
                    AnnotationUnits : selected_units_array,
                    orderNumber : children_tokens[0] ? children_tokens[0].id : "-1",
                    TEMP_LAST_INSERTED_UNIT : true
                };
                if(categoriesArray != undefined && categoriesArray.length > 0){
                    objToPush.categories = categoriesArray;
                }else if(rowCategoryBGColor != undefined){
                    var categoryToPush = {
                        id: rowCategoryID, 
                        color: rowCategoryColor, 
                        backgroundColor: rowCategoryBGColor, 
                        refinedCategory: rowRefinedCategory, 
                        abbreviation: rowCategoryAbbreviation, 
                        name: rowCategoryName
                    }
                    objToPush.categories.push(categoryToPush);
                }
                var newRowId = '';

                // prevent insert to tree when refinement layer
                if(!isFirstInitTree && DataService.currentTask.project.layer.type == ENV_CONST.LAYER_TYPE.REFINEMENT){
                    Core.showAlert("Cant create new annotation units in refinement layer")
                    console.log('ALERT - selectedTokensToUnit - prevent insert to tree when refinement layer');
                    return level;
                }

                if(level != undefined){
                    // if the parent unit is not the root passage - need to check the restrictions of the layer
                    var parentUnit = getUnitById(level);
                    // only after page init finished - start check for restrictions
                    if(DataService.duringInit === false){ // TODO: uncomment this block
                        
                        if(objToPush.AnnotationUnits.length){
                            // if the objToPush has children - need to check if not violated FORBID_CHILD restriction
                            for (var i = 0; i < objToPush.AnnotationUnits.length; i++) {
                                var childUnit = objToPush.AnnotationUnits[i];
                                if(!restrictionsValidatorService.checkRestrictionsBeforeInsert(objToPush,childUnit,DataService.hashTables.tokensHashTable)){
                                    // if no unit has been added, ewtuern the parent unitRowId
                                    return level;
                                }    
                            };
                        }
                        if(!restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit,objToPush,DataService.hashTables.tokensHashTable)){
                            // if no unit has been added, return the parent unitRowId
                            return level;
                        }
                    }
                }else{
                    level = 0;
                }

                if(removeFromTree.length){
                    updateUsedAsRemotes(removeFromTree,objToPush);
                    // remove the old units
                    removeFromTree.forEach(function(id){
                        removeFromTreeModel(id);
                    })
                }
                // insert the new unit
                newRowId = DataService.insertToTree(objToPush,level); // level is the parent unit

                updateRemoteOriginalIds(DataService.tree);
                // clear the selected array
                $rootScope.selectedTokensArray = [];


                DataService.lastInsertedUnitIndex = newRowId;

                return newRowId.toString();
            }
        }
        
        function submitTask(){
            return saveTask(true/* submit the task */)
        }
        
        function saveTask(shouldSubmit){
            annotation_units = [];
            traversInTree(DataService.tree);
            var mode = shouldSubmit ? 'submit' : 'draft';
            DataService.currentTask['annotation_units'] = annotation_units;
            return apiService.annotation.putTaskData(mode,DataService.currentTask).then(function(res){
                return res;
            });
        }

        /**
         * Wrapping function - splits wordsToWrap if setId == true by ' ' and wrap them with span element with class selectable-word and attribute data-wordId=word-{{index in the main article}}.
         * @param wordsToWrap - The line of words to wrap.
         * @param setId - a boolean variable defining if it is the first wrapping
         * @returns {string} - the wrapped words.
         */
        function wrapWords(wordsToWrap,setId){
            if(setId == true){
                var result ='';
                wordsToWrap.forEach(function(token,index){
                    if(token.parent_id){
                        result += '<span parent-index='+token.parent_id+'  token-id='+token.id+' class="selectable-word '+(token.text=='<br>'?'new-line':'')+' word-'+(token.id)+'" data-wordId="word-'+ (token.id) +'">'+token.text+'</span>';
                    }else{
                        result += '<span parent-index="0"  token-id='+token.id+' class="selectable-word '+(token.text=='<br>'?'new-line':'')+' word-'+(token.id)+'" data-wordId="word-'+ (token.id) +'">'+token.text+'</span>';
                    }
                    result += ' ';
                });
            }else{
                result = wordsToWrap;
            }
            return removeCursors(result);
        }
        function removeCursors(wordsToWrap){
            return $('<span>').append($(wordsToWrap).filter(':not(.cursor)').clone()).html();
        }

        function traversInTree(treeNode){
            console.log(treeNode.annotation_unit_tree_id)
            var unit = {
                annotation_unit_tree_id : treeNode.unitType == 'REMOTE' ? DataService.getUnitByUniqueId(treeNode.remote_original_unique_id).annotation_unit_tree_id : treeNode.annotation_unit_tree_id.toString(),
                task_id: DataService.currentTask.id.toString(),
                comment: treeNode.comment || '',
                categories: treeNode.categories || [],
                parent_id: treeNode.unitType == 'REMOTE' ? treeNode.remote_located_parent_id : DataService.getParentUnitId(treeNode.annotation_unit_tree_id),
                gui_status : treeNode.gui_status,
                type: treeNode.unitType.toUpperCase(),
                is_remote_copy: treeNode.unitType.toUpperCase() == 'REMOTE',
                children_tokens: treeNode.children_tokens
            };
            unit.type == 'REMOTE' ? unit.type = 'REGULAR' : '';
            // unit.categories.forEach(function(category){
            //     delete category.$$hashKey;
            //     delete category.color;
            //     delete category.abbreviation;
            // });
            if(unit.categories.length == 1 && unit.categories[0].id == null){
                unit.categories = [];
            }
            annotation_units.push(unit);
            for(var i=0; i<treeNode.AnnotationUnits.length; i++){
                traversInTree(treeNode.AnnotationUnits[i]);
            }
        }

        function getChildrenTokenForUnit(treeNode){
            var html = document.createElement('div');
            html.innerHTML = treeNode.text;
            var tokens = html.children;
            var children_tokens = [];

            var regexp = /token-id/g;
            // var foo = "abc1, abc2, abc3, zxy, abc4";
            var match, matches = [];

            while ((match = regexp.exec(treeNode.text)) != null) {
              matches.push(match.index);
            }

            for(var i=0; i<tokens.length; i++){
                if(tokenIdNotInArray(parseInt($(tokens[i]).attr('token-id')),children_tokens)){
                        var token ={
                            id: parseInt($(tokens[i]).attr('token-id'))
                        };
                        children_tokens.push(token);
                    }
                }
                

            return children_tokens;
        }

        function tokenIdNotInArray(tokenId,array){
            var result = true;
            for(var i=0; i<array.length; i++){
                if(array[i].id == tokenId){
                    result = false;
                }
            }
            return result;
        }

        function addCategoryToExistingRow(rowID,newCategory,scope){
            var splittedRowId = rowID.toString().split('-');
            var tempRowObject = DataService.tree.AnnotationUnits[parseInt(splittedRowId[0] - 1)];

            for(var i=1; i<splittedRowId.length; i++){
                tempRowObject = tempRowObject.AnnotationUnits[parseInt(splittedRowId[i] - 1)];
            }
            tempRowObject = categoryExitsRemoveIt(tempRowObject,newCategory.id);
            if(!tempRowObject.categories.changed){
                tempRowObject.categories.push(newCategory);
            }

            tempRowObject.categories.changed = true;
        }

        function categoryExitsRemoveIt(rowObject,newCategory){
            for(var i=0; i<rowObject.categories.length; i++){
                if(rowObject.categories[i].id == newCategory){
                    rowObject.categories.splice(i,1);
                    rowObject.categories.changed = true;
                    return rowObject;
                }
                // console.log(DataService.tree);
            }
            rowObject.categories.changed = false;
            return rowObject;
        }

        function getUnitById(unitID){
            if(unitID == -1){
                return null
            }else if(!unitID || unitID == 0){
                return DataService.tree;
            }else{
                var splittedUnitId = splitStringByDelimiter(unitID,"-");
                var tempUnit = DataService.tree;

                for(var i=0; i<splittedUnitId.length; i++){
                    var unitIdToFind = splittedUnitId.slice(0,i+1).join("-");
                    var unitIndex = tempUnit.AnnotationUnits.findIndex(function(unit){return unit.annotation_unit_tree_id == unitIdToFind})
                    tempUnit.AnnotationUnits.length > 0 ? tempUnit = tempUnit.AnnotationUnits[unitIndex] : '';
                }
                return !!tempUnit && tempUnit.annotation_unit_tree_id == unitID ? tempUnit : null;
            }
        }

        function getNextSibling(lastFocusedUnitId){
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].annotation_unit_tree_id;
                }
            }else{
                var parentAnnotationUnits = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits;
                var currentIndex = getMyIndexInParentTree(parentAnnotationUnits,lastFocusedUnitId);
                return parentAnnotationUnits[currentIndex+1] ? parentAnnotationUnits[currentIndex+1] : null;

            }
        }

        function getPrevSibling(lastFocusedUnitId){
        
            var parentAnnotationUnits = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits;
            var currentIndex = getMyIndexInParentTree(parentAnnotationUnits,lastFocusedUnitId);
            return parentAnnotationUnits[currentIndex-1] ? parentAnnotationUnits[currentIndex-1] : null;
        }

        function getMyIndexInParentTree(parentTree,myUnitId){
            var currentIndex = 0;
            parentTree.forEach(function(unit,index){
                if(unit.annotation_unit_tree_id==myUnitId){
                    currentIndex = index;
                }
            });
            return currentIndex;
        }

        function getNextUnit(lastFocusedUnitId,index){
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].annotation_unit_tree_id;
                }
            }else{
                var currentUnit = DataService.getUnitById(lastFocusedUnitId);


                if(currentUnit.AnnotationUnits.length > index){
                    return currentUnit.AnnotationUnits[index].annotation_unit_tree_id;
                }else{
                    if(lastFocusedUnitId == DataService.tree.AnnotationUnits.length){
                        return -1;
                    }
                    var splittedUnitID = splitStringByDelimiter(lastFocusedUnitId,'-');
                    var parentID="";
                    if(currentUnit.annotation_unit_tree_id.length >= 3){
                        parentID = splittedUnitID.slice(0,splittedUnitID.length-1).join("-");
                    }
                    else{
                        parentID = 0;
                    }
                    if (parentID != 0){
                        return getNextUnit(parentID,splittedUnitID[splittedUnitID.length-1])
                    }else{
                        return DataService.tree.AnnotationUnits[parseInt(lastFocusedUnitId)].annotation_unit_tree_id;
                    }

                }
            }

        }

        function getPrevUnit(lastFocusedUnitId,index){
            var prevUnitId, parentUnit;
            // if(index != -1){
            if(index > 0){
                prevUnitId = lastFocusedUnitId+"-"+index;
                parentUnit = getUnitById(prevUnitId);
            }else{
                prevUnitId = lastFocusedUnitId;
                parentUnit = getUnitById(prevUnitId);
            }

            if(parentUnit){
                //go down to the last node of the last node that is not me
                if(parentUnit.annotation_unit_tree_id != lastFocusedUnitId || index == -1){
                    while(parentUnit.AnnotationUnits.length > 0){
                            parentUnit = parentUnit.AnnotationUnits[parentUnit.AnnotationUnits.length-1]
                    }
                }
                return parentUnit.annotation_unit_tree_id;

            }else{
                return lastFocusedUnitId;
            }
            
        }

        function findUnitParentThatHAsBrothers(unitID){
            var splittedUnitId = splitStringByDelimiter(unitID,"-");
            var newParentID = splittedUnitId.slice(0,splittedUnitId.length-2).join("-");
            var parentUnit = getUnitById(newParentID)

            if(parentUnit && parentUnit.AnnotationUnits.length > 0){
                return parentUnit.AnnotationUnits[0].annotation_unit_tree_id;
            }
            findUnitParentThatHAsBrothers(newParentID)
        }

        /**
         * Success callback.
         * @param response - successful response.
         * @returns {*} - the response data.
         */
        function successFunction(response){
            return response.data;
        }

        /**
         * Unsuccessful callback.
         * @param err - the error.
         */
        function errorFunction(err){
            console.log(err);
        }

        /**
         * Split a string by give delimiter.
         * @param stringToSplit - the string to split.
         * @param del - split delimiter.
         */
        function splitStringByDelimiter(stringToSplit,del){
            return stringToSplit.toString().split(del);
        }

        function getParentUnitId(unitId){
            unitId = unitId.toString();
            if(unitId.length == 1){
                if(unitId =="0"){
                    return null;
                }
                return "0";
            }
            var parentUnitId = unitId.split('-');
            parentUnitId = parentUnitId.slice(0,length-1).join('-')
            return parentUnitId.toString()
        }

        /**
         * Use the object's 'data-wordid' attribute in order to sorts the array in ascending order.
         * @param a,b - array elements.
         * @returns {number}
         */
        function sortSelectedWordsArrayByWordIndex(a,b){
            // var aIndex = parseInt($(a).attr('data-wordid').split('-')[1]);
            // var bIndex = parseInt($(b).attr('data-wordid').split('-')[1]);
            var aIndex = $rootScope.getTokenIdFromDomElem(a);
            var bIndex = $rootScope.getTokenIdFromDomElem(b);
            if(aIndex < bIndex){
                return -1;
            }
            if(aIndex > bIndex){
                return 1;
            }
            return 0;
        }
    }

})();