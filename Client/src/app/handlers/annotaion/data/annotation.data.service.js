(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('DataService',DataService);

    function DataService($q,$http,apiService,$rootScope,restrictionsValidatorService,ENV_CONST,Core,$timeout) {
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
            sortUndUpdate:sortUndUpdate,
            REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            createTokensHashByTokensArrayForPassage:createTokensHashByTokensArrayForPassage
        };

        return DataService;

        function initTree(){
            DataService.currentTask.annotation_units.forEach(function(unit,index){
                var tokenStack = [];
                unit.children_tokens.forEach(function(token){
                    tokenStack.push(hashTables.tokensHashTable[token.id]);
                })

            });
            DataService.unitType = 'REGULAR';
        }

        function tokensArrayToHash(annotationTokensArray){
            var hash = {};
            annotationTokensArray.forEach(function(token){
                hash[token.id] = DataService.hashTables.tokensHashTable[token.id]
            });
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

        function getParentUnit(unitId){
            return getUnitById(getParentUnitId(unitId));
        }

        function resetTree(){
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

        }

        function toggleCategoryForUnit(unitId,category){
            return $q(function(resolve, reject) {
                
                if(category.id == undefined){
                   return reject();
                }

                var unit = getUnitById(unitId);              



                if(unit === null){
                    return reject('ToggleSuccess');
                }
                var elementPos = category ? unit.categories.map(function(x) {return x.id; }).indexOf(category.id) : -1;
                if(elementPos === -1){
                    
                if(!restrictionsValidatorService.checkRestrictionsBeforeInsert(getParentUnit(unit.annotation_unit_tree_id),unit,DataService.hashTables.tokensHashTable, category)){
                    return reject("Failed") ;
                }
                    
                if( unit.AnnotationUnits && unit.AnnotationUnits.length > 0 && restrictionsValidatorService.checkIfUnitViolateForbidChildrenRestriction([category])){
                    return true;
                }
                    
                if($rootScope.isSlottedLayerProject){
                    
                        var firstSlotIndex = 0;
                        for(var i=0; i<unit.categories.length; i++){
                            var currentCategoy = unit.categories[i];
                            if(currentCategoy.fromParentLayer){
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
                    
                }else{
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
                DataService.getParentUnit(unit.annotation_unit_tree_id).gui_status = "OPEN";
                DataService.getUnitById(unit.annotation_unit_tree_id).gui_status = "OPEN";

                $rootScope.$broadcast("ToggleSuccess",{categories: unit.categories, id: unit.annotation_unit_tree_id});
                resolve('ToggleSuccess');
            })

        }

        function isTokenInUnit(selectedUnit,token){
            var tokenInUnit = false;
            if(selectedUnit.AnnotationUnits === undefined){
                selectedUnit.AnnotationUnits = [];
            }
            for(var i=0; i<selectedUnit.AnnotationUnits.length; i++){
                if(selectedUnit.AnnotationUnits[i] == undefined){
                  continue
                }
                var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.id; }).indexOf(token.id);
                if(tokenPosition > -1){
                    tokenInUnit = selectedUnit.AnnotationUnits[i].annotation_unit_tree_id;
                    break;
                }
            }
            return tokenInUnit;
        }

        function insertToTree(newObject,level,inInitStage){
            return $q(function(resolve, reject) { 
                
                if(!inInitStage && DataService.currentTask.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                    Core.showAlert("Cant create annotation units in refinement layer")
                    console.log('ALERT - insertToTree -  prevent insert to tree when refinement layer');
                    reject(selectedUnitId);
                }
                
                var parentUnit = getUnitById(level);

                if(!parentUnit.AnnotationUnits){
                    parentUnit.AnnotationUnits = [];
                }
                if(!newObject.annotation_unit_tree_id){
                  if(level.toString() === "0"){
                      //Passage unit or it children units.
                      newObject.annotation_unit_tree_id = parseInt(parentUnit.AnnotationUnits.length + 1).toString();
                  }else{
                      newObject.annotation_unit_tree_id = level + '-' +  parseInt(parentUnit.AnnotationUnits.length + 1);
                  }
                }



                newObject.comment = newObject.comment || "";

                var units = [];

                if(newObject.unitType == "REMOTE"){

                }else{
                  newObject.tokens.forEach(function(token){
                      if(token.inUnit !== null && token.inUnit !== undefined){
                          var unitPos = units.map(function(x) {return x.id; }).indexOf(token.inUnit);
                          if(unitPos === -1){
                              units.push({
                                  id:token.inUnit
                              });
                          };
                          //Find token in parent
                          if(token.parentId === undefined){
                              token.parentId = "0";
                          }
                          var parentUnit = DataService.getUnitById(token.parentId);
                          if(parentUnit.tokens === undefined){
                              parentUnit['tokens'] = parentUnit.tokenCopy;
                          }
                          var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);

                          if(elementPos > -1){
                              parentUnit.tokens[elementPos].inUnit = newObject.annotation_unit_tree_id;
                          }
                      }
                  });
                }



                //Adding children to new unit
                if(units.length > 1){
                    
                    if( restrictionsValidatorService.checkIfUnitViolateForbidChildrenRestriction(newObject.categories)){
                        return level;
                    }
                    
                    units.forEach(function(unit){
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function(x) {return x.annotation_unit_tree_id; }).indexOf(unit.id);
                        if(newObject.AnnotationUnits === undefined){
                            newObject.AnnotationUnits = [];
                        }
                        if(elementPos > -1){                        
                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
//                            parentUnit.AnnotationUnits.splice(elementPos,1);
                        }
                    })
                }
                
                

                newObject.unitType =  newObject.unitType ? newObject.unitType : "REGULAR";

                if(newObject.unitType !== "IMPLICIT" && !restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit,newObject,DataService.hashTables.tokensHashTable)){
                    // if no unit has been added, return the parent unitRowId
                    return level;
                }
                
                //Removing children unit from parent unit
                if(units.length > 1){
                    
                    units.forEach(function(unit){
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function(x) {return x.annotation_unit_tree_id; }).indexOf(unit.id);
                        if(elementPos > -1){                        
//                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
                            parentUnit.AnnotationUnits.splice(elementPos,1);
                        }
                    })
                }
                
                

                //Update IndexInParent attribute
                newObject.tokens.forEach(function(token,index,inInit){
                    token.indexInParent = index;
                });

                var indexToInsert = newObject.annotation_unit_tree_id.split("-");
                var index_int = parseInt(indexToInsert[indexToInsert.length-1]);

                if(newObject.is_remote_copy){
                  index_int = (parentUnit.AnnotationUnits.length + 1).toString();
                  for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                    if(parentUnit.AnnotationUnits[i] == undefined){
                      index_int = i + 1;
                      break;
                    }
                  }

                  newObject.annotation_unit_tree_id = newObject.parent_id + "-" + index_int.toString();
                }

                newObject.tokens.sort(function(a,b){
                  if(a.start_index > b.start_index){
                      return 1
                  }else if(a.start_index < b.start_index){
                      return -1
                  }else return 0
                })

                index_int - 1 > parentUnit.AnnotationUnits.length ? index_int =  parentUnit.AnnotationUnits.length + 1 : '';
                
                //Update slots information
                newObject = updateUnitSlots(newObject);
                
                !inInitStage ? Core.openAllUnits(newObject) : "";

                parentUnit.AnnotationUnits[index_int - 1] = newObject;

                var parentUnitTokens = parentUnit.tokens;

                parentUnitTokens.forEach(function(token,index){
                    var elementPos = newObject.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos === -1){
                        token['inUnit'] = null;
                    }
                });

//                parentUnit.gui_status = "OPEN";

                if(!inInitStage){
                    // Removed code - The is sorUndUpdate in selectionHendler service in the end of initTree.
                    sortUndUpdate(true)
                }
                
                updateInUnitIdsForTokens(DataService.tree);

                newObject.unitType !== "REMOTE" ? $rootScope.$broadcast("InsertSuccess",{dataBlock: { id: level, AnnotationUnits: getUnitById(level).AnnotationUnits},newUnitId: newObject.annotation_unit_tree_id }) : '';

                return resolve({status: 'InsertSuccess',id: newObject.annotation_unit_tree_id});
            });
        }
        
        function updateUnitSlots(newObject){
            
            var firstSlotIndex = 0; //the first slot not occupied by the parent layer's categories
            for(var i=0; i<newObject.categories.length; i++){
                var currentCategoy = newObject.categories[i];
                if(currentCategoy !== undefined && currentCategoy.fromParentLayer){
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

        function sortUndUpdate(doSort){

          if(DataService.tree.AnnotationUnits.length > 0){
            updateTreeIds(DataService.tree);

            doSort ? sortTree(DataService.tree.AnnotationUnits) : '';

            updateTreeIds(DataService.tree);
          }

        }

        function deleteUnit(unitId){
            return $q(function(resolve, reject) {
                var unit = getUnitById(unitId);
                var parentUnit = getUnitById(getParentUnitId(unitId));
                var splitUnitId = unit.annotation_unit_tree_id.split('-');
                var unitPositionInParentAnnotationUnits = parseInt(splitUnitId[splitUnitId.length-1])-1;
                $rootScope.$broadcast("RemoveBorder",{id: unit.annotation_unit_tree_id});
                if(!unit.AnnotationUnits || unit.AnnotationUnits.length === 0){
                    parentUnit.AnnotationUnits.splice(unitPositionInParentAnnotationUnits,1);
                }else{

                    var preArray = parentUnit.AnnotationUnits.slice(0,unitPositionInParentAnnotationUnits);
                    var afterArray = parentUnit.AnnotationUnits.slice(unitPositionInParentAnnotationUnits+1,parentUnit.AnnotationUnits.length);
                    parentUnit.AnnotationUnits = preArray.concat(unit.AnnotationUnits).concat(afterArray);

                    for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                        if(parentUnit.AnnotationUnits[i].unitType !== "REGULAR"){
                            if(DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].remote_original_id]){
                                if(DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].remote_original_id][parentUnit.AnnotationUnits[i].annotation_unit_tree_id]){
                                    delete DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].remote_original_id][parentUnit.AnnotationUnits[i].annotation_unit_tree_id];
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

                updateInUnitIdsForTokens(DataService.getParentUnit(unit.annotation_unit_tree_id));

                $rootScope.$broadcast("resetCursor_"+parentUnit.annotation_unit_tree_id,{categories: unit.categories, id: parentUnit.annotation_unit_tree_id});

                $rootScope.$broadcast("DeleteSuccess",{categories: unit.categories, id: unit.annotation_unit_tree_id});

                DataService.getParentUnit(unit.annotation_unit_tree_id).gui_status = "OPEN";

                return resolve('DeleteSuccess');
            });
        }

        function updateInUnitIdsForTokens(unit){
            unit.tokens.forEach(function(token){
                token.parentId = unit.annotation_unit_tree_id;

                    var isTokenInUnit = DataService.isTokenInUnit(unit,token);

                    if(isTokenInUnit){
                        token.inUnit = isTokenInUnit;
                    }else{
                        token.inUnit = null;
                    }
            })

            unit.AnnotationUnits.forEach(function(child_unit){
                updateInUnitIdsForTokens(child_unit);
            })

        }
        function sortTree(annotationUnits) {
            if (annotationUnits.length > 1) {
                annotationUnits.sort(sortUnits);

            }
            for (var i = 0; i < annotationUnits.length; i++) {
                if(annotationUnits[i] == undefined){
                  continue
                }
                sortTree(annotationUnits[i].AnnotationUnits || []);
            }
        }

        function updateTreeIds(unit,treeId){
            if(unit.AnnotationUnits && unit.AnnotationUnits.length > 0){
                for (var i = 0; i < unit.AnnotationUnits.length; i++) {

                    if(unit.AnnotationUnits[i] == undefined){
                      continue
                    }

                    var oldId = angular.copy(unit.AnnotationUnits[i].annotation_unit_tree_id);

                    unit.AnnotationUnits[i].annotation_unit_tree_id = unit.annotation_unit_tree_id === "0" ? (i+1).toString() : treeId+"-"+(i+1).toString();

                    if(oldId !== unit.AnnotationUnits[i].annotation_unit_tree_id){

                        // console.log("Old id is : ", oldId, " new id is : ", unit.AnnotationUnits[i].annotation_unit_tree_id );
                        if(DataService.unitsUsedAsRemote[oldId]){
                            DataService.unitsUsedAsRemote[unit.AnnotationUnits[i].annotation_unit_tree_id] = angular.copy(DataService.unitsUsedAsRemote[oldId]);

                            delete DataService.unitsUsedAsRemote[oldId];
                        }else{
                            for(var key in DataService.unitsUsedAsRemote){
                                if(DataService.unitsUsedAsRemote[key][oldId]){
                                    DataService.unitsUsedAsRemote[key][unit.AnnotationUnits[i].annotation_unit_tree_id] = true;

                                    delete DataService.unitsUsedAsRemote[key][oldId];
                                }
                            }
                        }
                    }
                    updateTreeIds(unit.AnnotationUnits[i],unit.AnnotationUnits[i].annotation_unit_tree_id);
                }
            }else{
                unit.tokens.forEach(function(token){
                    token.parentId = treeId;
                    token.inUnit = null;
                });

            }
        }

        function sortUnits(a,b){
            var aParentUnit = getParentUnit(a.annotation_unit_tree_id);
            var bParentUnit = getParentUnit(b.annotation_unit_tree_id);

            var aElementPos = aParentUnit.tokens.map(function(x) {return x.id; }).indexOf(a.tokens[0].id);
            var bElementPos = bParentUnit.tokens.map(function(x) {return x.id; }).indexOf(b.tokens[0].id);

            if(a.unitType !== "REGULAR" || b.unitType !== "REGULAR"){
                if(a.unitType === "REGULAR" && b.unitType !== "REGULAR"){
                    return 1;
                }else if(b.unitType === "REGULAR" && a.unitType !== "REGULAR"){
                    return -1;
                }else{
                    if(a.unitType === "REMOTE" && b.unitType === "IMPLICIT"){
                        return -1;
                    }else if(a.unitType === "IMPLICIT" && b.unitType === "REMOTE"){
                        return 1;
                    }else{
                        if(a.unitType === "REMOTE" && b.unitType === "REMOTE"){
                            if(a.remote_original_id > b.remote_original_id){
                                return 1;
                            }
                            else if(a.remote_original_id < b.remote_original_id){
                                return -1;
                            }else{ return 0;}
                        }
                        return 0;
                    }
                }
            }
            else if(aParentUnit.tokens[aElementPos].indexInParent > bParentUnit.tokens[bElementPos].indexInParent){
                return 1;
            }else if(aParentUnit.tokens[aElementPos].indexInParent < bParentUnit.tokens[bElementPos].indexInParent){
                return -1;
            }else{
                return 0;
            }
        }

        function tokenStartIndexInParent(token){
            var parentUnit = DataService.getUnitById(token.parentId);
            if(parentUnit !== null){
                var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                if(elementPos > -1){
                    return parseInt(parentUnit.tokens[elementPos].start_index);
                }
            }
        }

        function submitTask(){
            return saveTask(true/* submit the task */)
        }

        function traversInTree(treeNode){
            var unit = {
                annotation_unit_tree_id : treeNode.unitType === 'REMOTE' ? treeNode.remote_original_id : treeNode.annotation_unit_tree_id.toString(),
                task_id: DataService.currentTask.id.toString(),
                comment: treeNode.comment || '',
                categories: angular.copy(filterCategoriesAtt(treeNode.categories) || []),
                parent_id: treeNode.unitType === 'REMOTE' ? DataService.getParentUnitId(treeNode.annotation_unit_tree_id) : DataService.getParentUnitId(treeNode.annotation_unit_tree_id),
                gui_status : treeNode.gui_status || "OPEN",
                type: angular.copy(treeNode.unitType.toUpperCase()),
                is_remote_copy: treeNode.unitType.toUpperCase() === 'REMOTE',
                children_tokens: treeNode.annotation_unit_tree_id === "0" ? filterTokensAtt(angular.copy(treeNode.tokens)) : filterTokensAttForUnit(angular.copy(treeNode.tokens))
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
                    var currnetCategory = unit.categories[i];
                    if(currnetCategory.id == undefined){
                        unit.categories.splice(i,1);
                        i--;
                    }
                }
                
                if(!treeNode.slotOne && treeNode.slotTwo){
                   return false;
                }
            }
            
            if(unit.annotation_unit_tree_id === "0"){
                delete unit.children_tokens;
            }
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

        function arrangeUnitTokens(unitId){
            var currentUnit = getUnitById(unitId);
            currentUnit.AnnotationUnits = angular.copy(currentUnit.AnnotationUnits);
            arrangeUnitTokensObj(currentUnit);
            currentUnit.AnnotationUnits.forEach(function(unit){
                unit.tokens.forEach(function(token){
                    var elementPos = currentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos > -1){
                        currentUnit.tokens.splice(elementPos,1);
                    }
                });
            })

        }

        function arrangeUnitTokensObj(currentUnit){
            var returnArray = [];
            currentUnit.AnnotationUnits = angular.copy(currentUnit.AnnotationUnits);
            currentUnit.AnnotationUnits.forEach(function(unit){
                unit.tokens.forEach(function(token){
                    returnArray.push({id:token.id})
                });
                unit.tokensCopy = returnArray;

            })

        }

        function filterTokensAtt(tokens){
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    delete token.inUnit;
                    delete token.parentId;
                    delete token.indexInParent;
                    delete token.borderStyle;
                    delete token.lastTokenNotAdjacent;
                    delete token.nextTokenNotAdjacent;
                    delete token.positionInUnit;
                    delete token.backgroundColor;
                })
            }
            return tokens;

        }

        function filterTokensAttForUnit(tokens){
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    delete token.inUnit;
                    delete token.parentId;
                    delete token.indexInParent;
                    delete token.borderStyle;
                    delete token.lastTokenNotAdjacent;
                    delete token.nextTokenNotAdjacent;
                    delete token.positionInUnit;
                    delete token.backgroundColor;
                    delete token.start_index;
                    delete token.end_index;
                    delete token.require_annotation;
                    delete token.tokenization_task_id;
                    delete token.text;
                })
            }
            return tokens;

        }

        function filterCategoriesAtt(categories){
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

        function saveTask(shouldSubmit){
            annotation_units = [];
            var tokensCopy = angular.copy(DataService.tree.tokens);
            tokensCopy = filterTokensAtt(tokensCopy);
            // arrangeUnitTokens("0");
            var traversResult = traversInTree(DataService.tree);
            if (!traversResult) {
                Core.showNotification('error','Cannot save if a unit has category in slot two but not in slot one.');
                return $q.reject();
            }
            var mode = shouldSubmit ? 'submit' : 'draft';
            DataService.currentTask['annotation_units'] = annotation_units;
            DataService.currentTask.tokens = [];
            DataService.currentTask.tokens= tokensCopy;

            for(var i=0; i<DataService.currentTask.annotation_units.length; i++){
                
                DataService.currentTask.annotation_units[i].tokens = [];
                DataService.currentTask.annotation_units[i].tokens = DataService.currentTask.annotation_units[i].tokensCopy;

            }
            return apiService.annotation.putTaskData(mode,DataService.currentTask).then(function(res){
                $rootScope.$broadcast("ResetSuccess");
                return res;
            });
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

                    var unitIndex = tempUnit.AnnotationUnits.findIndex(function(unit){
                      if(unit == undefined){
                        return false;
                      }
                      return unit.annotation_unit_tree_id == unitIdToFind
                    });
                    tempUnit.AnnotationUnits.length > 0 && unitIndex > -1 ? tempUnit = tempUnit.AnnotationUnits[unitIndex] : '';
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

        function getSibling(unitId){
            var currentUnit = DataService.getUnitById(unitId);
            return currentUnit.AnnotationUnits[0];
        }

        function getNextUnit(lastFocusedUnitId,index){
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].annotation_unit_tree_id;
                }
            }else{
                var currentUnit = DataService.getUnitById(lastFocusedUnitId);
                if(currentUnit.AnnotationUnits === undefined){
                    currentUnit.AnnotationUnits = [];
                }

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
            if(unitId === null){
                return null;
            }
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
    }

})();
