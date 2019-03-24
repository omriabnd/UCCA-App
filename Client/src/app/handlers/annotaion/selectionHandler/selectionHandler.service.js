
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.annotation.selectionHandler')
        .service('selectionHandlerService', selectionHandlerService);

    /** @ngInject */
    function selectionHandlerService(DataService, $rootScope,$q,Core, AssertionService, restrictionsValidatorService) {
        trace("selectionHandlerService is here");
        var selectedTokenList = [];
        var keyboardSelectedTokens = [];
        var selectedUnit = "0";
        var selectedToken = null;
        var tokenClicked = false;
        var selectionDirection = "DOWN";
        var unitToAddRemotes = "0";
        var categoryForRemote = [];
        var mouseDown = false;
        var lastSelectedToken = null;


        var _handler = {
            selectedTokenList: selectedTokenList,
            keyboardSelectedTokens: keyboardSelectedTokens,
            selectedUnit:selectedUnit,
            selectionDirection:selectionDirection,
            unitToAddRemotes:unitToAddRemotes,
            categoryForRemote:categoryForRemote,
            mouseDown: mouseDown,
            selectedToken: selectedToken,
            lastSelectedToken:lastSelectedToken,
            updateIndexInUnitAttribute:updateIndexInUnitAttribute,
            // updatePositionInChildUnitAttribute:updatePositionInChildUnitAttribute,
            // updateNextTokenNotAdjacent:updateNextTokenNotAdjacent,
            // updateLastTokenNotAdjacent:updateLastTokenNotAdjacent,
            updateTokenBorders:updateTokenBorders,
            getTreeLastId:getTreeLastId,
            getSelectedTokenList: function(){
                trace("selectionHandlerService - getSelectedTokenList");
                return this.selectedTokenList;
            },
            isTokenClicked: function(){
                trace("selectionHandlerService - isTokenClicked");
                return this.tokenClicked;
            },
            setTokenClicked: function(){
                trace("selectionHandlerService - setTokenClicked");
                this.tokenClicked = true;
            },
            disableTokenClicked: function(){
                trace("selectionHandlerService - disableTokenClicked");
                this.tokenClicked = false;
            },
            setUnitToAddRemotes: function(id){
                trace("selectionHandlerService - setUnitToAddRemotes");
                this.unitToAddRemotes = id;
            },
            getUnitToAddRemotes: function(id){
                trace("selectionHandlerService - getUnitToAddRemotes");
                return this.unitToAddRemotes;
            },
            setSelectedToken: function(token){
                trace("selectionHandlerService - setSelectedToken");
                this.selectedToken = token;
            },
            getSelectedToken: function(){
                trace("selectionHandlerService - getSelectedToken");
                return this.selectedToken;
            },
            setLastInsertedToken: function(token){
                trace("selectionHandlerService - setLastInsertedToken");
                this.lastSelectedToken = token;
            },
            getLastInsertedToken: function(){
                trace("selectionHandlerService - getLastInsertedToken");
                return this.lastSelectedToken;
            },

            copyTokenToStaticFormat: function(token) {
                trace("selectionHandlerService - copyTokenToStaticFormat");
                var newFormatToken = {static: {}};
                Object.keys(token).forEach(function(key) {
                    if (DataService.baseTokenData.indexOf(key) > -1) {// Check if key exist in baseTokenData fields
                        newFormatToken.static[key] = token[key];
                        // delete token[key];
                    } else {
                        newFormatToken[key] = token[key];
                    }
                });
                return newFormatToken;
            },

            addTokenToList: function(token, selectedUnit, groupUnit){
                trace("selectionHandlerService - addTokenToList");
                /**
                 * Adds the token "token" into the list of selected tokens (selectedTokenList).
                 * If token is already selected, do nothing.
                 * If groupUnit is false, remove the token from unit tokens
                 * @type {Number}
                 */
                var elementPos = this.selectedTokenList.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                if(elementPos === -1){
                    // Remove this line because removeTokenFromUnitTokens function updates inChildUnitTreeId (before adding the unit)
                    // Buggy, because it put inChildUnitTreeId field in clicked token, without crete unit to this token.
                    // !groupUnit ? _handler.removeTokenFromUnitTokens(token) : '';

                    this.selectedTokenList.push(token);
                    sortSelectedTokenList(this.selectedTokenList);
                }
                this.selectedUnit = selectedUnit;
            },
            setCategoryForRemote: function(category){
                trace("selectionHandlerService - setCategoryForRemote");
                this.categoryForRemote = [];
                this.categoryForRemote.push(category);
            },
            getCategoryForRemote: function(){
                trace("selectionHandlerService - getCategoryForRemote");
                return this.categoryForRemote;
            },
            clearCategoryForRemote: function(category){
                trace("selectionHandlerService - clearCategoryForRemote");
                this.categoryForRemote = [];
            },
            setSelectionDirection: function(mode){
                trace("selectionHandlerService - setSelectionDirection");
                this.selectionDirection = mode;
            },
            getSelectionDirection: function(mode){
                trace("selectionHandlerService - getSelectionDirection");
                return this.selectionDirection;
            },
            isTokenInList: function(token){
                trace("selectionHandlerService - isTokenInList");
                var elementPos = this.selectedTokenList.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                return elementPos > -1;
            },
            removeTokenFromList: function(tokenId){
                trace("selectionHandlerService - removeTokenFromList");
                /**
                 * Unselect a token.
                 */
                var elementPos = this.selectedTokenList.map(function(x) {return x.static.id; }).indexOf(tokenId);
                //Omri: the next line is commented out as it doesn't do anything (Feb 11)
                //var objectFound = this.selectedTokenList[elementPos];
                // _handler.addTokenFromUnitTokens();
                this.selectedTokenList.splice(elementPos,1);
            },
            removeTokenFromUnitTokens: function(token){
                trace("selectionHandlerService - removeTokenFromUnitTokens");
                var unit = DataService.getUnitById(_handler.getSelectedUnitId());
                if(unit) {
                    /**
                     * If unit.tokens not exist, create it according to unit.tokenMap // tokens not exist in the beginning of initTree when tree_id='0'
                     */
                    if (!unit.tokens.length) {
                        unit.tokens = [];
                        for (var key in unit.tokenMap) {
                            // Push token to tokens list in static format
                            unit.tokens.push(_handler.copyTokenToStaticFormat(unit.tokenMap[key]));
                        }
                    }
                    var elementPos = unit.tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                    if(elementPos > -1){
                        var selectedUnitId = _handler.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);
                        // Remove this block, with Omri, Feb 11
                        // if(selectedUnit.AnnotationUnits === undefined){
                        //     selectedUnit.AnnotationUnits = [];
                        // }
                        var tokenInUnit = _handler.isTokenInUnit(selectedUnit,token);
                        //old code line: (re-written as the if block below Feb 11)
                        // !tokenInUnit ? token['inChildUnitTreeId'] = selectedUnitId.toString() === "0" ? (selectedUnit.AnnotationUnits.length + 1).toString() : selectedUnit.tree_id !== "0" ? selectedUnit.tree_id + "-" +(selectedUnit.AnnotationUnits.length + 1).toString() : (selectedUnit.AnnotationUnits.length + 1).toString() : '';
                        //with Omri, Feb 11
                        if (!tokenInUnit) {
                            var newInUnitField = (selectedUnit.AnnotationUnits.length + 1).toString();
                            if (selectedUnitId.toString() != "0") {
                                newInUnitField = selectedUnitId + "-" + newInUnitField;
                            }
                            token['inChildUnitTreeId'] = newInUnitField;
                        }
                    }
                }
            },
            /**
             * Check if token exist in unit
             * @param selectedUnit
             * @param token
             * @returns {boolean} - if the token exist in the unit
             */
            isTokenInUnit: function(selectedUnit, token){
                trace("selectionHandlerService - isTokenInUnit");
                var tokenInUnit = false;
                for(var i=0; i<selectedUnit.AnnotationUnits.length; i++){
                    var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                    if(tokenPosition > -1){
                        tokenInUnit = true;
                        break;
                    }
                }
                // console.log("_________TokenInUnit=", tokenInUnit)
                return tokenInUnit;
            },

            clearTokenList: function(afterInsert){
                trace("selectionHandlerService - clearTokenList");
                // console.log("Token list cleared");

                if(!afterInsert){
                    // This code apparently handles tokens whose child unit has been deleted
                    _handler.getSelectedTokenList().forEach(function(token){
                        if(token.unitTreeId === undefined){
                            token.unitTreeId = "0";
                        }
                        var parentUnit = DataService.getUnitById(DataService.getParentUnitId(token.unitTreeId));
                        var elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                        var tokenInUnit = false;
                        for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                            var tokenPosition = parentUnit.AnnotationUnits[i].tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                            if(tokenPosition > -1){
                                tokenInUnit = true;
                                break;
                            }
                        }
                        !tokenInUnit ? parentUnit.tokens[elementPos]['inChildUnitTreeId'] = null : '';
                    });
                }

                this.selectedTokenList = [];
                this.keyboardSelectedTokens = [];
            },


            updateSelectedUnit: function(index,afterInsert){
                trace("selectionHandlerService - updateSelectedUnit");
                /**
                 * Updates the focus unit.
                 * TODO: change the name selectedUnit to focusUnit
                 * @type {string}
                 */
                this.selectedUnit = index.toString();
                if(!_handler.isTokenClicked()){
                    _handler.clearTokenList(afterInsert);
                }
                _handler.disableTokenClicked();
                // // Check tree in AssertionService when update focus unit
                // AssertionService.checkTree(DataService.tree, DataService.serverData);
            },

            findElementPosition: function(tokenList, token) {
                if (token)
                    return tokenList.map(function(x) {return x.static.id; }).indexOf(token.static.id);
            },


            calcTokenClosure: function(tokenList) {
                if(!tokenList || tokenList.length === 0)
                    return [];

                var closure = [];
                var unit = DataService.getUnitById(tokenList[0].unitTreeId);

                tokenList.forEach(function(token) {
                    var pos = _handler.findElementPosition(closure, token);
                    if(pos !== -1) {
                        return;
                    }

                    // Add token to closure
                    closure.push(token);
                    if(token.inChildUnitTreeId) {
                        // We know that this is the first time we've encountered any token of this child unit.
                        // After we encounter the first token, we add the entire child unit, so all other tokens are
                        // already in the closure
                        unit.tokens.forEach(function(siblingToken) {
                            if(siblingToken !== token && siblingToken.inChildUnitTreeId === token.inChildUnitTreeId) {
                                closure.push(siblingToken);
                            }
                        })
                    }
                });

                return closure;
            },

            /*
             * Keyboard Selection is a bit elaborate, because we need to handle multiple cases.
             *
             * We maintain two lists: keyboardSelectedTokens and selectedTokenList.
             * keyboardSelectedTokens are the tokens that were actually selected with the keyboard (by shift-right or
             * shift-left). selectedTokenList are the tokens that are shown as selected.
             *
             * The two lists are not identical because of discontiguous units. Consider for example the following
             * tokens:
             *
             * 1 A 2 3 B 4 5
             *
             * A and B are of the same unit.
             * When the user selects A with the keyboard, we want to select B as well, so in this case
             *    keyboardSelectedTokens will be A, and selectedTokenList will be A B
             *
             * In this example, if the user selects A 2 3 B, both lists will be the same. If the user then unselects
             * B, keyboardSelectedTokens will be A 2 3 but selectedTokenList will still be A 2 3 B, since B has to be
             * selected with A.
             *
             * We need to handle contiguous units specifically, consider the following:
             * 1 A B 2  -  A B are in the same unit
             *
             * The cursor is between 1 and A and the user selects to the left. We will be called with A as the token,
             * keyboardSelectedTokens will be A and selectedTokenList will be A B. The cursor will be between B and 2.
             *
             * Now the user unselects B from the right. We will be called with B as the token. We want to remove A
             * from both lists, so we need to treat all B calls as A calls. So we normalize tokens - each token is
             * normalized to the first token in the contiguous part of its unit.
             *
             * So normalized B above is actually A.
             */

            normalizeToken: function(token) {
                // If the token is not in a child unit, it is normalized.
                // If it is, find the first contiguous token in this child unit that is to the left of token.
                //
                // 1 2 3 A B C 4 5 E F 6 7
                // ABCEF are the same unit
                //
                // normalized(number) = number
                // normalized(A) = A
                // normalized(B) and normalized(C) = A
                // normalized(E) = E
                // normalized(F) = E

                if (!token.inChildUnitTreeId || token.indexInUnit===0) {
                    return token;
                }

                var unit = DataService.getUnitById(token.unitTreeId);
                var index = token.indexInUnit;
                while(index > 0 && unit.tokens[index-1].inChildUnitTreeId === token.inChildUnitTreeId) {
                    index--;
                }

                return unit.tokens[index];
            },

            keyboardToggleTokenSelection: function(token) {
                token = _handler.normalizeToken(token);

                // Normalize the token - find the first contigi
                // if token is not exist in keyboardSelectedTokens list- add it, else- remove it
                var elementPos = _handler.findElementPosition(this.keyboardSelectedTokens, token);
                if(elementPos === -1){
                    this.keyboardSelectedTokens.push(token);
                } else {
                    this.keyboardSelectedTokens.splice(elementPos,1);
                }

                // this.clearTokenList();
                // TODO: Build a list of all tokens - in all the units of tikens in keyboardSelectedTokens
                var shouldBeSelected = _handler.calcTokenClosure(this.keyboardSelectedTokens);
                var currentlySelected = angular.copy(_handler.selectedTokenList);

                // We need to make sure _handler.selectedTokenList is the same as shouldBeSelected.
                // All tokens that are in shouldBeSelected and not in currentlySelected are clicked so they can be
                // selected.
                // All tokens that are in currentlySelected but not in shouldBeSelected are unselected;
                // First loop - select all the tokens that need to be selected

                shouldBeSelected.forEach(function(token) {
                    _handler.addTokenToList(token, token.unitTreeId); // addTokenToList already handles tokens already in the list
                });
                // Comment it- because it causes to bug: Can't continue a selection with the arrows which was first made by the mouse.
                // currentlySelected.forEach(function(token) {
                //     // If token is not in shouldBeSelected, remove selection from token
                //     var elementPos = _handler.findElementPosition(shouldBeSelected, token);
                //     if (elementPos === -1) {
                //         _handler.removeTokenFromList(token.static.id);
                //     }
                // });
            },

            getSelectedUnitId: function(){
                trace("selectionHandlerService - getSelectedUnitId");
                return this.selectedUnit;
            },

            setSelectedUnitId: function(unit){
                trace("selectionHandlerService - setSelectedUnitId");
                this.selectedUnit = unit;
            },

            // TODO: Remove this function, the mouseDown variable and getMouseMode
            toggleMouseUpDown: function(){
                trace("selectionHandlerService - toggleMouseUpDown");
                this.mouseDown = !this.mouseDown;
            },

            getMouseMode: function(){
                trace("selectionHandlerService - getMouseMode");
                return this.mouseDown;
            },

            /**
             * Init tree when the annotation page is finish loading
             * @param data
             * @returns {*}
             */
            initTree: function(data){
                function initImplicitUnit(unit, index) {
                    var objToPush = {
                        rowId : '',
                        text : '<span>IMPLICIT UNIT</span>',
                        numOfAnnotationUnits: 0,
                        categories:[],
                        comment:"",
                        cluster:"",
                        rowShape:'',
                        unitType:'IMPLICIT',
                        orderNumber: '-1',
                        gui_status:'OPEN',
                        usedAsRemote:[],
                        children_tokens:[],
                        containsAllParentUnits: false,
                        tokens:[{
                            static: {
                                "text": "IMPLICIT UNIT",
                            },
                            "unitTreeId":unit.parent_tree_id,
                            "inChildUnitTreeId":null
                        }],
                        AnnotationUnits : [

                        ],
                        parent_tree_id: unit.parent_tree_id
                    };

                    /**
                     * insertToTree for implicit units
                     */
                    var newRowId = DataService.insertToTree(objToPush,unit.parent_tree_id,index != DataService.serverData.annotation_units.length -1);

                    unit.categories.sort(compareSlot);
                    changeSlots(unit.categories);

                    unit.categories.forEach(function(category,index){
                        var cat = DataService.hashTables.categoriesHashTable[category.id];
                        if (category.slot) {
                            cat.slot = category.slot; // Add slot field to category, it needed in the assertion
                        }
                        _handler.toggleCategory(cat,unit.tree_id);
                        _handler.clearTokenList();
                    });
                }
                function initRemoteUnit(unit, index) {
                    DataService.unitType = 'REMOTE';
                    unit["tokens"] = [];
                    unit.unitType = "REMOTE";
                    unit.children_tokens.forEach(function(token){
                        unit["tokens"].push(_handler.copyTokenToStaticFormat(DataService.hashTables.tokensHashTable[token.id]));
                    });

                    unit.categories.sort(compareSlot);
                    changeSlots(unit.categories);
                    var unitCategory = unit.categories[0] ? DataService.hashTables.categoriesHashTable[ unit.categories[0].id] : null;
                    _handler.toggleCategory(unitCategory,null,unit,unit,index != DataService.serverData.annotation_units.length -1,true).then(function(res){
                        // unit.categories.forEach(function(category,index){
                        //     if(index === 0){
                        //
                        //     }else{
                        //         _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],res.id,null,null,true);
                        //     }
                        //     _handler.clearTokenList();
                        // });
                    });


                    DataService.unitType = 'REGULAR';
                    var unitToAddTo = DataService.getUnitById(unit.tree_id);

                    if(unitToAddTo){
                        if(unitToAddTo.usedAsRemote === undefined){
                            unitToAddTo["usedAsRemote"] = [];
                        }

                        var remotePosition = DataService.getUnitById(unit.cloned_from_tree_id).AnnotationUnits.map(function(x) {return x.id; }).indexOf(unit.id);
                        if(remotePosition > -1){
                            unitToAddTo["usedAsRemote"].push(DataService.getUnitById(unit.parent_tree_id).AnnotationUnits[remotePosition].tree_id);
                        }else{
                            unitToAddTo["usedAsRemote"].push(unit.parent_tree_id + "-" + DataService.getUnitById(unit.parent_tree_id).AnnotationUnits.length);
                        }
                    }

                    // if(DataService.unitsUsedAsRemote[unit.tree_id] === undefined){
                    //     DataService.unitsUsedAsRemote[unit.tree_id] = {};
                    // }

                    // var parentUnitUnits = DataService.getUnitById(unit.tree_id);
                    // var amountOfRemotes = 0;
                    // // if (parentUnitUnits) {
                    //     parentUnitUnits.AnnotationUnits.forEach(function (unit) {
                    //         if (unit.unitType === "REMOTE") {
                    //             amountOfRemotes++;
                    //         }
                    //     });
                    // // }

                    // New Remote
                    // DataService.addRemoteUnit(unit); // Comment it because we added this call in insertToTree function.

                    // DataService.unitsUsedAsRemote[unit.tree_id][unit.parent_tree_id + "-" + parseInt(parseInt(amountOfRemotes+1))] = true;

                    // selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                }

                function compareSlot(a,b) {
                  if (a.slot > b.slot)
                    return -1;
                  if (a.slot < b.slot)
                    return 1;
                  return 0;
                }

                //categories array should be: [slot:3, slot:4, ..., slot:1, slot:2]
                function changeSlots(categories) {
                    if (categories.length >= 2 &&
                        categories[categories.length-1].slot === 1 && categories[categories.length-2].slot === 2) {
                        var tmp = categories[categories.length-1];
                        categories[categories.length-1] = categories[categories.length-2];
                        categories[categories.length-2] = tmp;
                    }
                }

                function initRegularUnit(unit) {
                    unit.children_tokens.forEach(function(token){
                        var parentId = unit.tree_id.indexOf('-') === -1 ? "0" : unit.tree_id.split("-").slice(0,unit.tree_id.split("-").length-1).join("-");
                        // Fill parent tokens, if unit=1-> fill tree.tokens
                        _handler.addTokenToList(_handler.copyTokenToStaticFormat(DataService.hashTables.tokensHashTable[token.id]), parentId)
                    });
                    if(unit.categories.length === 0){
                        _handler.toggleCategory(null,false,unit.is_remote_copy,unit,true);
                    }else{

                        // Sort categories according to slot: slot 3 and bigger in the beginning anf after - slot 1 or 2
                        unit.categories.sort(compareSlot);
                        changeSlots(unit.categories);
                        var slotCategories = angular.copy(unit.categories);

                        var cat = DataService.hashTables.categoriesHashTable[unit.categories[0].id];
                        if (unit.categories[0].slot) {
                            cat.slot = unit.categories[0].slot;
                        }
                        _handler.toggleCategory(cat,false,false,unit,true)
                            .then(function(){
                                unit.categories.forEach(function(category,index){
                                    if(index === 0){
                                        // _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],false,false,unit.gui_status);
                                    }else{
                                        var  slot = category.slot
                                        var cat = DataService.hashTables.categoriesHashTable[category.id];
                                        if (slot) {
                                            cat.slot = slot;
                                        }
                                        _handler.toggleCategory(cat,unit.tree_id,false, unit);
                                    }
                                    _handler.clearTokenList();
                                });

                                for (var i = 0; i < slotCategories.length; i++) {
                                    if (slotCategories[i].slot !== unit.categories[i].slot) {
                                        unit.categories[i].slot = slotCategories[i].slot;
                                    }
                                }
                            });


                    }

                    _handler.clearTokenList();
                }

                trace("selectionHandlerService - initTree");
                return $q(function(resolve, reject) {
                    // First create the regular and implicit units
                    DataService.serverData.annotation_units.forEach(function(unit,index){
                        unit.AnnotationUnits = [];

                        // We're checking unit.type and not unit.unitType because the server sends unit.type
                        if(unit.type === "IMPLICIT"){
                            initImplicitUnit(unit, index);
                        }else if(!unit.cloned_from_tree_id && unit.tree_id !== "0"){
                            initRegularUnit(unit);
                        }
                    });

                    // Now create the remote units. We create them after the regular units because they
                    // reference regular units, and this way we're sure the regular units exist before the
                    // remote units are created
                    DataService.serverData.annotation_units.forEach(function(unit,index){
                        if(unit.cloned_from_tree_id) {
                            // The server's unit.type for remote units is REGULAR, so we need to check cloned_from_tree_id,
                            // which is not undefined in case the unit is remote
                            // We don't bother checking if unit.cloned_from_tree_id is 0 (which may be falsey in Javascript,
                            // because unit 0 cannot be cloned).
                            unit.AnnotationUnits = [];
                            initRemoteUnit(unit, index);
                        }
                    });

                    if (!DataService.tree.tokens.length) { // Builds a tokens list unit 0, if it does not exist
                        DataService.serverData.tokens.forEach(function (token) {
                            DataService.tree.tokens.push(_handler.copyTokenToStaticFormat(token));
                        });
                    }

                    // Add attributes to tree.tokens: indexInUnit, unitTreeId
                    updateIndexInUnitAttribute(DataService.tree.tokens);

                    // todo: check if indexInUnit updated here in unit 0 (in tree.tokens)
                    // add unitTreeId and indexInUnit attributes
                    DataService.tree.tokens.forEach(function(token, index) {
                        token['unitTreeId'] = "0";
                        token.indexInUnit = index;
                    });


                    DataService.unitType = 'REGULAR';
                    // after init the tree, is it needed?
                    // DataService.sortAndUpdate();
                    _handler.updateSelectedUnit("0",false);

                    // Check tree in AssertionService at the end of init tree
                    AssertionService.checkTree(DataService.tree, DataService.serverData);
                    return resolve({status: 'InitTreeFinished'});
                })
            },

            /***
             When copying to the child unit we delete leftBorder and rightBorder properties
             as there are no borders in the child unit. However, we still need to know whether to show an ellipsis.
             Ellipses are shown at discontinuities, which are right before leftBorder is true (except for before
             the first token in the unit).
             */
            // Commented because we removed showEllipsis field from token
            // copyTokensToSubUnit: function(selectedTokenList) {
            //     var tokens = angular.copy(selectedTokenList);
            //     if(tokens !== undefined){
            //         tokens.forEach(function(token, index){
            //             // If token has rightBorder, and not the last token
            //             if (token.rightBorder && index !== tokens.length-1) {
            //                 token.showEllipsis = true;
            //             }
            //             delete token.leftBorder;
            //             delete token.rightBorder;
            //         })
            //     }
            //     return tokens;
            // },


            checkRestrictionsForImplicit: function(parentUnit) {
                return restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit, "IMPLICIT", []);
            },

            checkRestrictionsForRemote: function(parentUnit, category) {
                return restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit, "REMOTE", [], category);
            },



            checkRestrictions: function(category, unit) {
                // First decide whether we are adding a new unit or not
                var selectedUnit = DataService.getUnitById(_handler.selectedUnit);
                if(_handler.selectedTokenList && _handler.selectedTokenList.length) {
                    // If the token list is not empty, we're adding a new unit
                    // The user is creating a new unit
                    return restrictionsValidatorService.checkRestrictionsBeforeInsert(selectedUnit, "REGULAR", _handler.selectedTokenList, category);
                }
                else {
                    // We're toggling a category for a unit (which apparently is only called when a category is *added*
                    var unitToRest = unit;
                    if (!unitToRest) {
                        unitToRest = selectedUnit;
                    }
                    //update unitToRest.categories with all fields from hashTables, add slot field
                    for (var c in unitToRest.categories) {
                        if (unitToRest.categories[c].id) {
                            var slot = unitToRest.categories[c].slot;
                            unitToRest.categories[c] = DataService.hashTables.categoriesHashTable[unitToRest.categories[c].id];
                            if (slot) {
                                unitToRest.categories[c].slot = slot;
                            }
                        }
                    }
                    return restrictionsValidatorService.checkRestrictionsBeforeAddingCategory(unitToRest, category);
                }
            },

            toggleCategory: function(category,justToggle,remote,unit,inInitStage){
                /**
                 * toggleCategory is also responsible for creating new units which are assigned a category.
                 */
                trace("selectionHandlerService - toggleCategory");
                //console.log("category "+category.name+"   unit "+unit.tree_id);
                return $q(function(resolve, reject) {

                    // Omri commented out restriction not to allow double unary restrictions
                    //if(_handler.selectedTokenList.length > 0 && newUnitContainAllParentTokensTwice(_handler.selectedTokenList) || checkifThereIsPartsOFUnitTokensInsideList(_handler.selectedTokenList,inInitStage)){
                    //    return
                    //}

                    // Check the restrictions for the new unit here, before making any modifications to the data in the DataService
                    // declare unitTOCheck, if unit is undefined, take it according to justToggle (unit id)
                    var unitToCheck = unit;
                    if (!unit && justToggle) {
                        unitToCheck = DataService.getUnitById(justToggle);
                    }
                    if(!inInitStage && !_handler.checkRestrictions(category, unitToCheck)) {
                        return reject("Failed");
                    }

                    // Saving last selected unit and tokens because aUnitIsSelected changes the selected,
                    // and we want save selected in the case: when adding a category or creating a unit, the target unit should remain selected.
                    var lastSelected = { unit: _handler.selectedUnit, tokens:  _handler.selectedTokenList};

                    if(!aUnitIsSelected(_handler.selectedTokenList,inInitStage) && (_handler.selectedTokenList.length && !justToggle) || remote || inInitStage){
                        //_handler mean we selected token and now we need to create new unit.

                        // Call here to removeTokenFromUnitTokens function, so inChildUnitTreeId field will update here, when the unit is adding to the tree.
                        for (var t = 0; t < _handler.selectedTokenList.length; t++) {
                            _handler.removeTokenFromUnitTokens(_handler.selectedTokenList[t]);
                        }

                        updateIndexInUnitAttribute(_handler.selectedTokenList);
                        // updatePositionInChildUnitAttribute(_handler.selectedTokenList);
                        // updateNextTokenNotAdjacent(_handler.selectedTokenList);
                        // updateLastTokenNotAdjacent(_handler.selectedTokenList);

                        if (_handler.selectedTokenList.length) {
                            updateTokenBorders(_handler.selectedTokenList);
                        }

                        var newUnit = {
                            tokens : angular.copy(_handler.selectedTokenList),
                            categories:[],
                            gui_status:unit ? unit.gui_status : "OPEN",
                            comment: unit ? unit.comment : '',
                            cluster: unit ? unit.cluster : '',
                            tree_id: unit && unit.tree_id ? unit.tree_id : null,
                            parent_tree_id: unit && unit.parent_tree_id ? unit.parent_tree_id : null,
                            is_remote_copy: unit && unit.is_remote_copy ? unit.is_remote_copy : false,
                            is_finished: unit && unit.is_finished ? unit.finished: false,
                            cloned_from_tree_id: unit && unit.cloned_from_tree_id ? unit.cloned_from_tree_id : null
                        };

                        for (var index = 0; index < newUnit.tokens.length; index++) {
                            newUnit.tokens[index].unit = newUnit;
                        }

                        if(remote){
                            newUnit = angular.copy(remote);
                            newUnit.categories = [];

                            for (var i = 0; i < remote.categories.length; i++) {
                                var tempCat = angular.copy(remote.categories[i]);
                                tempCat !== undefined ? newUnit.categories.push(DataService.hashTables.categoriesHashTable[tempCat.id]) : '';
                            }
                            _handler.selectedUnit = newUnit.parent_tree_id;

                        }


                        category && !remote ? newUnit.categories.push(angular.copy(category)) : '';
                        /**
                         * InsertToTree for regular (non-implicit) units
                         */
                        return DataService.insertToTree(newUnit,_handler.selectedUnit,inInitStage).then(function(res){
                            if(res.status === "InsertSuccess"){
                                // Remove focus from new unit -- Cancel change focus to newly created unit
                                // _handler.updateSelectedUnit(res.id,true);
                                // Core.scrollToUnit(res.id);

                                // _handler.clearTokenList();
                                return resolve({id: res.id});
                                // return res.id;
                            }
                        });
                    }else{
                        if(justToggle){
                            _handler.updateSelectedUnit(justToggle);
                        }
                        //Toggle the category for existing unit
                        if(_handler.selectedUnit.toString() !== "0"){
                            return DataService.toggleCategoryForUnit(_handler.selectedUnit,category).then(function(res){
                                _handler.selectedUnit = lastSelected.unit; // update selected unit after adding a category to the inner unit
                                _handler.selectedTokenList = lastSelected.tokens;
                                if(res.status === "ToggleSuccess"){
                                    _handler.updateSelectedUnit(res.id);
                                    return resolve({id: res.id});
                                }
                            })
                        }
                    }
                    // Check tree in AssertionService after toggle category
                    AssertionService.checkTree(DataService.tree, DataService.serverData);

                    $rootScope.$broadcast("ResetSuccess");
                })
            }
        };

        function checkifThereIsPartsOFUnitTokensInsideList(selectedTokenList,inInitStage){
            trace("selectionHandlerService - checkifThereIsPartsOFUnitTokensInsideList");
            if(inInitStage){
                return false;
            }
            //Checks if the new unit contains only parts of existing units. if so, block the unit insertion.
            var result = false;
            var unitsObject = {};

            selectedTokenList.forEach(function(token){

                if(token.inChildUnitTreeId !== null && DataService.getUnitById(token.inChildUnitTreeId) !== null){
                    var existingUnit = DataService.getUnitById(token.inChildUnitTreeId);
                    var sumOfTokenInList = selectedTokenList.filter(function(tokenInList) {
                        return tokenInList.inChildUnitTreeId === token.inChildUnitTreeId ;
                    });

                    if(sumOfTokenInList.length !== existingUnit.tokens.length){
                        result = true;
                    }

                }
            })

            return result;
        }

        function newUnitContainAllParentTokensTwice(selectedTokenList){
            trace("selectionHandlerService - newUnitContainAllParentTokensTwice");
            var currentUnit = DataService.getUnitById(selectedTokenList[0].unitTreeId);

            if(currentUnit.tree_id !== "0"){
                var parentUnit = DataService.getUnitById(DataService.getParentUnitId(currentUnit.tree_id));

                return compareUnitsTokens(selectedTokenList,currentUnit.tokens) && compareUnitsTokens(currentUnit.tokens,parentUnit.tokens);
            }

        }

        function compareUnitsTokens(unitATokens,unitBTokens){
            trace("selectionHandlerService - compareUnitsTokens");
            var result = true;
            if(unitATokens.length === unitBTokens.length){
                unitATokens.forEach(function(token){
                    var elementPos = unitBTokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                    if(elementPos === -1){
                        result = false;
                    }
                })
            }else{
                result = false;
            }
            return result;
        }

        function aUnitIsSelected(selectedTokenList,inInitStage){
            trace("selectionHandlerService - aUnitIsSelected");
            var result = true;
            var unitId = null;

            if(selectedTokenList.length === 0){
                return false;
            }
            unitId = selectedTokenList[0].inChildUnitTreeId;

            if(unitId === null){
                return false;
            }
            selectedTokenList.forEach(function(token){
                if(unitId !== token.inChildUnitTreeId){
                    result = false;
                }
            });

            if(!result ){
                return false
            }

            var tokenInUnit = selectedTokenList[0].inChildUnitTreeId;
            tokenInUnit && DataService.getUnitById(tokenInUnit) && !inInitStage ? _handler.updateSelectedUnit(tokenInUnit) : '';
            return DataService.getUnitById(tokenInUnit);
        }

        function updateIndexInUnitAttribute(selectedTokenList){
            trace("selectionHandlerService - updateIndexInUnitAttribute");
            selectedTokenList.forEach(function(token,index){
                var parentUnitTokens;
                if(token.unitTreeId){
                    if(DataService.getUnitById(token.unitTreeId) && DataService.getUnitById(token.unitTreeId).tokens){
                        parentUnitTokens = DataService.getUnitById(token.unitTreeId).tokens;
                    }else{
                        return;
                    }
                }else{
                    parentUnitTokens = DataService.getUnitById("0").tokens;
                }
                var elementPos = parentUnitTokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                if(elementPos > -1){
                    token['indexInUnit'] = elementPos;
                }
            })
        }

        // function updatePositionInChildUnitAttribute(selectedTokenList){
        //     console.log("selectedTokenList=", selectedTokenList)
        //     trace("selectionHandlerService - updatePositionInChildUnitAttribute");
        //     selectedTokenList.forEach(function(token,index){
        //         if(selectedTokenList.length === 1){
        //             token['positionInChildUnit'] = 'FirstAndLast';
        //         }else if(index === 0){
        //             token['positionInChildUnit'] = 'First';
        //         }else if(index === selectedTokenList.length-1){
        //             token['positionInChildUnit'] = 'Last';
        //         }else{
        //             token['positionInChildUnit'] = 'Middle';
        //         }
        //     })
        // }

        function updateTokenBorders(selectedTokenList) {
            // Each token has three properties regarding borders:
            //    leftBorder indicates whether we need to add a left border to the token. This is true if the token
            //    is the first in the unit, or is first after a discontinuity.
            //
            //    rightBorder indiicates whether we need to add a right border to the token. This is true if the token
            //    is the last in the unit, or last before a discontinuity.
            //
            //    This all applies to tokens in the parent unit. When copying to the child unit we delete these properties
            //    as there are no borders in the child unit. However, we still need to know whether to show an ellipsis.
            //    Ellipses are shown at discontinuities, which are right before leftBorder is true (except for before
            //    the first token in the unit). We handle that in a different place in the code.
            //
            //    TODO: Add all this explanation to a suitable document.

            trace("selectionHandlerService - updateTokenBorders");
            var numTokens = selectedTokenList.length;

            selectedTokenList[0].leftBorder = true;

            for(var index=0; index < numTokens-1; index++) {
                // Compare selectedTokenList[index] to selectedTokenList[index+1]
                var first = selectedTokenList[index];
                var second = selectedTokenList[index+1];
                // if (first.static.id + 1 === second.static.id) {
                if (first.indexInUnit + 1 === second.indexInUnit) {
                    first.rightBorder = second.leftBorder = false;
                } else {
                    first.rightBorder = second.leftBorder = true;
                }
            }

            selectedTokenList[selectedTokenList.length - 1].rightBorder = true;
        }

        /*
        function updateNextTokenNotAdjacent(selectedTokenList){
            trace("selectionHandlerService - updateNextTokenNotAdjacent");
            selectedTokenList.forEach(function(token,index){
                if(index === selectedTokenList.length-1 || token.indexInUnit + 1 === selectedTokenList[index+1].indexInUnit){
                    token['nextTokenNotAdjacent'] = false;
                }else if(token.indexInUnit + 1 !== selectedTokenList[index+1].indexInUnit){
                    token['nextTokenNotAdjacent'] = true;
                }
            })
        }
        
        function updateLastTokenNotAdjacent(selectedTokenList){
            trace("selectionHandlerService - updateLastTokenNotAdjacent");
            selectedTokenList.forEach(function(token,index){
                if(index === 0 || token.indexInUnit - 1 === selectedTokenList[index-1].indexInUnit){
                    token['lastTokenNotAdjacent'] = false;
                }else if(token.indexInUnit - 1 !== selectedTokenList[index-1].indexInUnit){
                    token['lastTokenNotAdjacent'] = true;
                }

                // TODO: What about this in DataService.positionInUnit function?
                // if(token["positionInChildUnit"] === "First" && token['nextTokenNotAdjacent']){
                //     token['positionInChildUnit'] = 'FirstAndLast';
                // }
                // if(token["positionInChildUnit"] === "Last" && token['lastTokenNotAdjacent']){
                //     token['positionInChildUnit'] = 'FirstAndLast';
                // }
                // if(token["positionInChildUnit"] === "Middle" && token['lastTokenNotAdjacent'] && token['nextTokenNotAdjacent']){
                //     token['positionInChildUnit'] = 'FirstAndLast';
                // }
                // if(token["positionInChildUnit"] === "Middle" && token['lastTokenNotAdjacent']){
                //     token['positionInChildUnit'] = 'First';
                // }
                // if(token["positionInChildUnit"] === "Middle" && token['nextTokenNotAdjacent']){
                //     token['positionInChildUnit'] = 'Last';
                // }

            })

        } */

        function sortSelectedTokenList(selectedTokenList){
            trace("selectionHandlerService - sortSelectedTokenList");
            selectedTokenList.sort(function(a,b){
                if(a.static.start_index > b.static.start_index){
                    return 1;
                }else if(a.static.start_index < b.static.start_index){
                    return -1;
                }else{
                    return 0;
                }
            })
        }

        function getTreeLastId(currentUnit){
            trace("selectionHandlerService - getTreeLastId");
            if(currentUnit.AnnotationUnits.length == 0){
                return currentUnit.tree_id;
            }

            var lastChild =  currentUnit.AnnotationUnits[ currentUnit.AnnotationUnits.length - 1 ];
            return getTreeLastId(lastChild);
        }

        return _handler;
    }

})();
