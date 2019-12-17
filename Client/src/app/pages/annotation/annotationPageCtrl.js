

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.annotation')
        .controller('AnnotationPageCtrl', AnnotationPageCtrl);

    /** @ngInject */
    function AnnotationPageCtrl(DefaultHotKeys,uccaFactory, TaskMetaData, DataService, $rootScope, $scope, hotkeys, HotKeysManager, Definitions, ENV_CONST, Core, restrictionsValidatorService, $timeout, $state, selectionHandlerService, $uibModal) {
        var vm = this;
        vm.tokenizationTask = TaskMetaData.Task;
        $rootScope.direction = TaskMetaData.Task.passage.text_direction.toLowerCase();
        $rootScope.disableRemotes = TaskMetaData.Layer.disable_remotes;
        $rootScope.requireAllTokensCovered = TaskMetaData.Layer.require_all_tokens_covered;
        // vm.annotationTokens = tokensInStaticFormat(); // vm.tokenizationTask.tokens;
        vm.annotationTokens = DataService.tree.tokens;
        vm.categories = TaskMetaData.Categories;
        vm.defaultHotKeys = DefaultHotKeys;
        vm.categorizedWords = [];
        vm.definitions = Definitions;
        vm.dataTree = DataService.tree.AnnotationUnits;
        vm.navBarItems = ENV_CONST.NAV_BAR_ITEMS;
        vm.spacePressed = spacePressed;
        selectionHandlerService.spacePressed = spacePressed;
        vm.saveTask = saveTask;
        vm.setFontSize = setFontSize;
        // vm.checkRetokenizeButton = checkRetokenizeButton
        vm.submitTask = submitTask;
        vm.unitsIdsList = [];
        vm.finishAll = finishAll;
        vm.openAll = openAll;
        vm.checkSubmissionRestrictions = checkSubmissionRestrictions;
        vm.goToMainMenu = goToMainMenu;
        vm.resetAllAnnotations = resetAllAnnotations;
        vm.inRemoteMode = inRemoteMode;
        vm.addUserComment = addUserComment;
        vm.viewUserManual = viewUserManual;
        vm.retokenize = retokenize;
        vm.toggleParents = toggleParents;
        vm.sceneFunctionRoles = ENV_CONST.SCENE_FUNCTION_ROLES;
        vm.defaultCategoryHotkeys = ENV_CONST.DEFAULT_CATEGORY_HOTKEYS;
        vm.savingTask = false;
        vm.submittingTask = false;
        // vm.noConnection = false;
        vm.saveFailed = false;
        vm.submitFailed = false;
        vm.loadModalFailed = false;


        if ($rootScope.disableRemotes) { // Remove implicit option
            var index = vm.definitions.findIndex(function (a) { return a.name === 'Implicit' });
            vm.definitions.splice(index, 1);
        }

        try {
            vm.categoryReorderings = JSON.parse(TaskMetaData.Task.project.layer.category_reorderings);
        } catch (SyntaxError) {
            vm.categoryReorderings = {};
        }

        vm.fontSizes = [
            // this sets the different font sizes in the annotation page
            { preview: "AAAA", name: "Big", size: 1.2 },
            { preview: "AAA", name: "big", size: 1 },
            { preview: "AA", name: "normal", size: 0.9 },
            { preview: "A", name: "small", size: 0.8 }
        ];

        init();


        function getParentCategory(unit) {
            if (!!unit && !!unit.categories) {
                for (var i = 0; i < unit.categories.length; i++) {
                    var category = unit.categories[i];
                    if (category.fromParentLayer) {
                        return category;
                    }
                }
            }
            return null;
        }

        $scope.sortByPrototypes = function (category) {
            if (Core.isEmptyObject(vm.categoryReorderings)) {
                return;
            }

            var selectedUnitId = selectionHandlerService.getSelectedUnitId();
            var selectedUnit = DataService.getUnitById(selectedUnitId);

            var selectedTokenList = selectionHandlerService.getSelectedTokenList();

            if (selectedTokenList != undefined && selectedTokenList.length > 0) {
                selectedUnit = DataService.getUnitById(selectedTokenList[0].inChildUnitTreeId);
            } else if (selectedUnitId != undefined && selectedUnitId != 0) {
                selectedTokenList = selectedUnit.tokens;
            }


            if (selectedTokenList === undefined) {
                selectedTokenList = [];
            }

            var selectedTokens = selectedTokenList.map(function (token) {
                return token.static.text.toLowerCase();
            }).join("_");

            console.log(selectedTokens);


            if (!!selectedTokens) {

                var parentCategoryName = "";
                var sceneRole;

                if (!!selectedUnit) {
                    var parentCategory = getParentCategory(selectedUnit);
                    parentCategoryName = !!parentCategory ? parentCategory.name : "";
                    var unitCategories = selectedUnit.categories;

                    for (var i = 0; i < unitCategories.length; i++) {
                        var cat = unitCategories[i];
                        if (cat.name === category.name) {
                            return -1;
                        }
                        if (!cat.fromParentLayer && !!cat.name && sceneRole == undefined) {
                            sceneRole = cat;
                        }
                    }
                }
                var reOrderings;
                if (vm.categoryReorderings[parentCategoryName] != undefined) {
                    reOrderings = vm.categoryReorderings[parentCategoryName][selectedTokens];
                    if (!reOrderings) {
                        reOrderings = vm.categoryReorderings[parentCategoryName][""];
                    }
                } else {
                    return 1;
                }

                if (!!sceneRole) {
                    var functionRoles = reOrderings[sceneRole.name];
                    if (!!functionRoles) {
                        var index = functionRoles.indexOf(category.name);
                        return index > -1 ? index : vm.categories.length;
                    }
                }
                var index = reOrderings[""].indexOf(category.name);
                return index > -1 ? index : vm.categories.length;
            }
            return 1;
        }

        $scope.fromParentLayer = function (cat) {
            return cat.fromParentLayer;
        }

        $scope.notFromParentLayer = function (cat) {
            return !cat.fromParentLayer;
        }

        // function tokensInStaticFormat() {
        //     var tokens = [];
        //     for (var i = 0; i < vm.tokenizationTask.tokens.length; i++) {
        //         // Build token array includes static fields
        //         tokens.push(selectionHandlerService.copyTokenToStaticFormat(vm.tokenizationTask.tokens[i]));
        //     }
        //     return tokens;
        // }

        function toggleParents() {
            $scope.showParents = !$scope.showParents;
            $rootScope.$broadcast("ToggleParents", {});
        }
        //debo
        // function checkRetokenizeButton(data){
        //     if(data.name=='Retokenize'){
        //         enableRetokenizeButton();
        //     }
        // }

        function init() {

            selectionHandlerService.updateSelectedUnit("0", false);
            $(document).on('keydown', function (e) {
                if (!$(e.target).hasClass('unit-comment-text')) {
                    e.preventDefault();
                    e.stopPropagation();
                    // e.stopImmediatePropagation();
                }
                // if(e.keyCode == 224 || e.keyCode == 17 || e.keyCode == 91 || e.keyCode == 93){
                //     e.preventDefault();
                //     e.stopPropagation();
                // }
            })

            $scope.$on('InsertSuccess', function (event, args) {
                if (args.dataBlock.id === 0) {
                    vm.dataTree.AnnotationUnits = args.dataBlock.AnnotationUnits;
                } else {
                }
            });

            $scope.$on('ResetSuccess', function (event, args) {
                vm.categories = TaskMetaData.Categories;
                bindCategoriesHotKeys(hotkeys, $scope, $rootScope, vm, HotKeysManager, DataService);
                bindReceivedDefaultHotKeys(hotkeys, $scope, $rootScope, vm, HotKeysManager, DataService && !hotkeys.fromParentLayer);
            });

            $scope.$on('FailedToLoadTemplate', function (event, args) {
                vm.loadModalFailed = true;
            });

            $timeout(function () { $rootScope.$hideSideBar = true; });
            bindCategoriesHotKeys(hotkeys, $scope, $rootScope, vm, HotKeysManager, DataService);
            bindReceivedDefaultHotKeys(hotkeys, $scope, $rootScope, vm, HotKeysManager, DataService && !hotkeys.fromParentLayer);
            Core.scrollToTop();
        }

        function addUserComment() {
            open('app/pages/annotation/templates/commentOnUnitModal.html', 'sm', '', vm)
        }

        function viewUserManual() {
            open('app/pages/annotation/templates/user_manual_v1.html', 'lg', '', vm)
        }
        function retokenize() {
            open('app/pages/annotation/templates/retokenizeModal.html', 'lg', '', vm)
        }



        function setFontSize(fontSize) {
            $('.main-body').css({ 'font-size': fontSize.size + 'em' })
        }

        function inRemoteMode() {
            return selectionHandlerService.getUnitToAddRemotes() !== "0";
        }

        function submitTask() {

            vm.loadModalFailed = false;
            var finishAllResult = vm.checkSubmissionRestrictions();
            if (finishAllResult) {
                vm.submittingTask = true;
                return DataService.saveTask().then(function () {
                    return DataService.submitTask().then(function (res) {
                        vm.submittingTask = false;
                        vm.submitFailed = false;
                        Core.showNotification('success', 'Annotation Task Submitted.');
                        goToMainMenu(res)
                    }, function (error) {
                        if (error.data === null && error.status === -1 && error.statusText === "") {
                            // vm.noConnection = true;
                            vm.submitFailed = true;
                        }
                        vm.submittingTask = false;
                    });
                    vm.submittingTask = false;
                }, function (error) {
                    if (error.data === null && error.status === -1 && error.statusText === "") {
                        // vm.noConnection = true;
                        vm.submitFailed = true;
                    }
                    vm.submittingTask = false;
                });
            }
        }


        function checkSubmissionRestrictions() {
            var rootUnit = DataService.getUnitById("0");
            var hashTables = DataService.hashTables;
            if (restrictionsValidatorService.evaluateSubmissionRestrictions(rootUnit)) {
                selectionHandlerService.updateSelectedUnit(0);
                Core.showNotification('success', 'Finish All was successful');
                return true;
            }
            return false;
        }

        function buildUnitsIdList(treeId, annotationUnits) {
            vm.unitsIdsList.push(treeId);
            for (var i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].AnnotationUnits) {
                    buildUnitsIdList(annotationUnits[i].tree_id, annotationUnits[i].AnnotationUnits);
                }
            }
        }

        function collapseTree() {
            // Collapse all units i the tree after 'FinishAll'
            vm.unitsIdsList = [];
            buildUnitsIdList(DataService.tree.tree_id, DataService.tree.AnnotationUnits);
            for (var i = 0; i < vm.unitsIdsList.length; i++) {
                // Check if unit immediately below unit 0
                if (vm.unitsIdsList[i].indexOf('-') === -1) {
                    DataService.getUnitById(vm.unitsIdsList[i]).gui_status = "HIDDEN";
                } else if (DataService.getUnitById(vm.unitsIdsList[i]).unitType === 'REGULAR') {
                    DataService.getUnitById(vm.unitsIdsList[i]).gui_status = "COLLAPSE";
                }
            }
        }

        function finishAll() {
            var rootUnit = DataService.getUnitById("0");
            var hashTables = DataService.hashTables;
            var finishAllResult = restrictionsValidatorService.evaluateFinishAll(rootUnit, hashTables);
            if (finishAllResult) {
                selectionHandlerService.updateSelectedUnit(0);
                Core.showNotification('success', 'Finish All was successful');
                collapseTree();
            }
            saveTask();
            return finishAllResult;
        }

        function openAll(unit) {
            if (!unit) {
                unit = DataService.tree;
            }
            unit.gui_status = 'OPEN';
            unit.AnnotationUnits.forEach(function (u) {
                openAll(u);
            })
        }

        function spacePressed() {
            if (selectionHandlerService.getUnitToAddRemotes() !== "0") {
                $rootScope.unitClicked($rootScope.currentVm, selectionHandlerService.getSelectedUnitId(), null)
            } else {
                var selectionList = selectionHandlerService.getSelectedTokenList();
                if (isUnitSelected(selectionList)) {
                    if (DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT) {
                        Core.showAlert("Cant delete annotation units from refinement layer")
                        console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                        return false;
                    }

                    // DataService.deleteUnit(selectionList[0].inChildUnitTreeId );
                    // selectionHandlerService.clearTokenList();

                    // When space pressed, delete the unit, and all remote units.
                    var unitId = selectionList[0].inChildUnitTreeId;
                    var currentUnit = DataService.getUnitById(unitId);

                    if (currentUnit.cloned_to_tree_ids) {
                        vm.dataBlock = currentUnit;
                        open('app/pages/annotation/templates/deleteAllRemoteModal.html', 'md', currentUnit.cloned_to_tree_ids.length, vm);
                    }
                    else {
                        if (currentUnit.unitType === "REMOTE") {
                            var remoteUnit = DataService.getUnitById(currentUnit.cloned_from_tree_id);
                            DataService.deleteRemoteUnit(currentUnit);
                        }
                        var parentUnit = DataService.getParentUnitId(unitId);
                        DataService.deleteUnit(unitId).then(function (res) {
                            selectionHandlerService.updateSelectedUnit(parentUnit);
                        })
                    }
                }
                else if (selectionList.length) {
                    if (DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT) {
                        Core.showAlert("Cant create annotation units int refinement layer")
                        console.log('ALERT - spacePressed -  prevent insert to tree when refinement layer');
                        return false;
                    }
                    selectionHandlerService.toggleCategory();
                }
            }
        }

        function isUnitSelected(selectionList) {
            var result = true;

            if (selectionList.length === 0) return false;

            var tokenIntUnit = selectionList[0].inChildUnitTreeId;
            selectionList.forEach(function (token) {
                if (tokenIntUnit !== token.inChildUnitTreeId) {
                    result = false;
                }
            });

            if (tokenIntUnit === null) {
                return false;
            }
            if (result) {
                return DataService.getUnitById(tokenIntUnit);
            }
            return result;
        }

        function goToMainMenu(res) {
            var projectId = this ? this.tokenizationTask.project.id : res.data.project.id;
            var layerType = this ? this.tokenizationTask.project.layer.type : res.data.project.layer.type;
            url: '/project/:id/tasks/:layerType',
                $state.go('projectTasks', {
                    id: projectId,
                    layerType: layerType,
                    refresh: true
                });
            $timeout(function () { $rootScope.$hideSideBar = false; })
        }

        function resetAllAnnotations(res) {
            console.log('DataService', DataService);
            Core.promptAlert('Are you sure you want to delete all the annotation units?').result.then(function (res) {
                if (res) {
                    $rootScope.resetAllAnnotations = true;
                    console.log("reset All Annotations");
                    DataService.resetTree().then(function (res) {
                        if (res) {
                            window.location.reload(true);
                            //$state.transitionTo($state.current, $state.$current.params, { reload: true, inherit: true, notify: true });
                        }
                        //if(res === 'Success'){
                        //    selectionHandlerService.updateSelectedUnit("0",false);
                        //    $rootScope.$broadcast("ResetFromBarSuccess",{unitId: "0"});                                              //}
                    })
                }
            })
        }

        function saveTask() {
            debugger
            if (navigator.onLine) {
                console.log("navigator.onLine")
            } else {
                console.log(" -- navigator.offLine")
            }

            window.addEventListener('online', function (e) { console.log('online'); });
            window.addEventListener('offline', function (e) { console.log('offline'); });


            vm.loadModalFailed = false;
            vm.savingTask = true;
            return DataService.saveTask().then(function (res) {
                vm.savingTask = false;
                // vm.noConnection = false;
                vm.saveFailed = false;
                Core.showNotification('success', 'Annotation Task Saved.');
            }, function (error) {
                console.log("Save task error:", error);
                if (error.data === null && error.status === -1 && error.statusText === "") {
                    // vm.noConnection = true;
                    vm.saveFailed = true;
                }
                vm.savingTask = false;
            });
            vm.savingTask = false;
        }

        function bindCategoriesHotKeys(hotkeys, scope, rootScope, vm, HotKeysManager, dataService) {
            function sortedIndexedHotkey(index) {
                return function () {
                    var functionToExecute = HotKeysManager.executeOperation($scope.sortedCategories[index]);
                    selectionHandlerService[functionToExecute]($scope.sortedCategories[index]);
                    $rootScope.$broadcast("ResetSuccess");
                }
            }

            // bind the top 9 sorted categories with the keyboard shortcuts 1-9
            for (i = 0; i < 9; i++) {
                var hotkey = "" + (i + 1);
                HotKeysManager.addHotKey(hotkey);
                hotkeys.del(hotkey);
                hotkeys.add({
                    combo: hotkey,
                    description: hotkey + 'th category in sorted list',
                    action: 'keydown',
                    callback: sortedIndexedHotkey(i)
                });
            }

            TaskMetaData.Categories.forEach(function (categoryObj) {
                if (!categoryObj.shortcut_key && !!vm.defaultCategoryHotkeys[categoryObj.name]) {
                    categoryObj['shortcut_key'] = vm.defaultCategoryHotkeys[categoryObj.name];
                }

                if (categoryObj.shortcut_key && !categoryObj.fromParentLayer) {
                    categoryObj.shortcut_key = categoryObj.shortcut_key.toString().toLowerCase();
                    HotKeysManager.addHotKey(categoryObj.shortcut_key);
                    hotkeys.del(categoryObj.shortcut_key.toString().toLowerCase());
                    hotkeys.add({
                        combo: categoryObj.shortcut_key,
                        description: categoryObj.description,
                        action: 'keydown',
                        callback: function () {
                            var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                            selectionHandlerService[functionToExecute](categoryObj);
                            $rootScope.$broadcast("ResetSuccess");
                        }
                    });

                    HotKeysManager.addHotKey('shift+' + categoryObj.shortcut_key.toString().toLowerCase());
                    hotkeys.del(categoryObj.shortcut_key.toString().toLowerCase());
                    hotkeys.add({
                        combo: 'shift+' + categoryObj.shortcut_key,
                        description: 'Remote category ' + categoryObj.name,
                        action: 'keydown',
                        callback: function () {
                            var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                            $rootScope.$broadcast("CreateRemoteUnit", { unitId: selectionHandlerService.getSelectedUnitId(), category: categoryObj });
                            // vm.keyController[0]['addAsRemoteUnit'](categoryObj);
                        }
                    });
                }
            });
        }

        function open(page, size, vm) {
            var remoteOriginalId = $rootScope.clckedLine;
            var viewModal = vm;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: function ($scope, selectionHandlerService, $q) {
                    var tokenUnit
                    var selectedToken = selectionHandlerService.getSelectedTokenList();
                    function getTokenUnit(listOfTokens,token) {
                        debugger
                        if (listOfTokens.length != 0) {
                            for (var i = 0; i < listOfTokens.length; i++) {
                                if (listOfTokens[i].tree_id == token.unitTreeId) {
                                    tokenUnit = listOfTokens[i].tokens;

                                }
                                getTokenUnit(listOfTokens[i].AnnotationUnits,token);
                            }
                            return tokenUnit;
                        }
                    }

                    function getIndexInTask(token) {
                        return token.static.index_in_task;
                    }
                    function getEntireTokenFromAPart(token) {

                        var tokenUnit;
                        if (token.unitTreeId != 0) {
                            debugger
                            tokenUnit = getTokenUnit(DataService.tree.AnnotationUnits,token)
                        }
                        else { tokenUnit = DataService.tree.tokens }
                        console.log("tokenUnit", tokenUnit)
                        debugger
                        if (token.static.splitByTokenization == true) {
                            var mergeArray = []
                            var newToken = findPrevToken(tokenUnit, token)
                            console.log(newToken)
                            mergeArray.push(newToken, token)
                            return mergeArray
                        }
                        else if (token.static.splitByTokenization == false && findNextToken(tokenUnit, token).static.splitByTokenization == true) {
                            var mergeArray = []
                            mergeArray.push(token, findNextToken(tokenUnit, token))
                            return mergeArray
                        }
                        return token
                    }
                    function findNextToken(list, token) {
                        for (var i = 0; i < list.length; i++) {
                            if (getIndexInTask(list[i]) == getIndexInTask(token) + 1) {
                                return list[i];
                            }
                        }
                        return null;
                    }
                    function findPrevToken(list, token) {
                        debugger
                        for (var i = 0; i < list.length; i++) {
                            if (getIndexInTask(list[i]) == getIndexInTask(token) - 1) {
                                return list[i];
                            }
                        }
                        return null;
                    }
                    function getAllRetokenizedTokens(token) {

                        var returnArray = [];
                        var originalToken = angular.copy(token);
                        console.log("token", token)
                        console.log("token.unitTreeId", token.unitTreeId)
                        //var myTree=angular.copy(DataService.tree)
                        var tokenUnit;
                        if (token.unitTreeId != 0) {
                            debugger
                            tokenUnit = getTokenUnit(DataService.tree.AnnotationUnits,token)
                        }
                        else { tokenUnit = DataService.tree.tokens }
                        console.log("tokenUnit", tokenUnit)
                        var array = [];
                        debugger
                        // case 0: this token was not a retokenized token 
                        if ((token.static.splitByTokenization == null || token.static.splitByTokenization == false) && ((findNextToken(tokenUnit, token) == null) || (findNextToken(tokenUnit, token).static.splitByTokenization == false) || (findNextToken(tokenUnit, token).static.splitByTokenization == null))) {
                            returnArray.push(token.static.text, getIndexInTask(token), getIndexInTask(token));
                            return returnArray;
                        }
                        // case 1: this token was a part of a retokenized token
                        // first part of  a retokenized token
                        if (token.static.splitByTokenization == null || token.static.splitByTokenization == false) {
                            var flag = true;
                        }
                        array.push(token)
                        // push in the array all the following tokens which were splitted
                        while (findNextToken(tokenUnit, token) != null && findNextToken(tokenUnit, token).static.splitByTokenization == true) {
                            var essai = findNextToken(tokenUnit, token)
                            console.log(essai)
                            console.log(findNextToken(tokenUnit, token).static.splitByTokenization)
                            token = findNextToken(tokenUnit, token);
                            array.push(token);
                        }
                        var token = originalToken;
                        // push in the array all the previous  tokens which were splitted
                        while (token.static.splitByTokenization != false && findPrevToken(tokenUnit, token) != null && findPrevToken(tokenUnit, token).static.splitByTokenization == true) {
                            token = findPrevToken(tokenUnit, token)
                            array.push(token)
                        }
                        // if the selected token was splitted 
                        if (flag != true) {
                            array.push(findPrevToken(tokenUnit, token))
                        }
                        // sort the array wich the part of the original tokens sorted by indexInUniy
                        array.sort(function (a, b) {
                            if (getIndexInTask(a) > getIndexInTask(b)) {
                                return 1;
                            }
                            if (getIndexInTask(b) > getIndexInTask(a)) {
                                return -1;
                            }
                            return 0;
                        });
                        var tmpArr = [];
                        debugger
                        // get the text of the part of the token
                        for (var i = 0; i < array.length; i++) {
                            tmpArr[i] = array[i].static.text
                        }
                        // join the texts with a *
                        var newString = tmpArr.join('*');
                        // return the string + the indexes of the first part 
                        // of the original token and the index of the last part
                        returnArray.push(newString, getIndexInTask(array[0]), getIndexInTask(array[array.length - 1]));
                        return returnArray
                    }


                    var a = getAllRetokenizedTokens(selectedToken[0])

                    // if the token selected was never splitted
                    $scope.tokenizedText = a[0];
                    var firstIndex = a[1];
                    var lastIndex = a[2];

                    $scope.tokenizedAnnotationUnits = selectedToken[0].unitTreeId
                    $scope.vm = viewModal;
                    if (DataService.serverData) {
                        $scope.comment = DataService.serverData.user_comment;
                    }
                    $scope.saveComment = function () {
                        DataService.serverData.user_comment = $scope.comment;
                    }
                    $scope.deleteAllRemoteInstanceOfThisUnit = function () {

                        // New Remote
                        var clonedList = angular.copy($scope.vm.dataBlock.cloned_to_tree_ids);
                        for (var i = 0; i < clonedList.length; i++) {
                            DataService.deleteRemoteUnit(DataService.getUnitById(clonedList[i]));
                            DataService.deleteUnit(clonedList[i]);
                        }
                        DataService.deleteUnit($scope.vm.dataBlock.tree_id);
                        // selCtrl.updateUI(DataService.getUnitById($("[unit-wrapper-id="+$rootScope.clickedUnit+"]").attr('child-unit-id')));
                    };

                    $scope.$on('deleteStar', function (event, cursorLoc) {
                        return $q(function (resolve, reject) {
                            var tmp = $scope.tokenizedText;
                            tmp = tmp.replace("*", '');
                            $scope.tokenizedText = tmp;
                            resolve('success');
                        });
                    });

                    $scope.$on('cursorMovedRight', function (event, cursorLoc) {
                        return $q(function (resolve, reject) {
                            resolve('success');
                        });
                    });

                    $scope.$on('cursorMovedLeft', function (event, cursorLoc) {
                        return $q(function (resolve, reject) {
                            resolve('success');
                        });
                    });

                    $scope.$on('addSpace', function (event, cursorLoc) {
                        return $q(function (resolve, reject) {
                            var tmp = $scope.tokenizedText;
                            tmp = tmp.substr(0, cursorLoc) + '*' + tmp.substr(cursorLoc);
                            $scope.tokenizedText = tmp;
                            resolve('success');
                        });
                    });

                    $scope.saveRetokenization = function () {
                        debugger
                        var difference = lastIndex - firstIndex + 1;
                        var splittedTokens = $scope.tokenizedText.split('*');
                        var tokenIndex = DataService.tree.tokens.map(function (x) { return getIndexInTask(x); }).indexOf(firstIndex);
                        var originalToken = angular.copy(DataService.tree.tokens[tokenIndex]);
                        var myIndex = originalToken.static.start_index;
                        // set the counter for ids
                        var idList = DataService.tree.tokens.map(function (x) { return x.static.id; })
                        if (Math.min.apply(Math, idList) > 0) {
                            debugger
                            var counter = -1;
                        }
                        else {
                            var counter = Math.min.apply(Math, idList) - 1
                        }
                        // remove the original in the tree
                        DataService.tree.tokens.splice(tokenIndex, difference);
                        var newTokenArray = [];
                        // replace the modified token in the tree
                        for (var i = 0; i < splittedTokens.length; i++) {
                            var token = angular.copy(originalToken);
                            token.static.text = splittedTokens[i];
                            if (splittedTokens.length == 1) { // the token is entire
                                token.static.splitByTokenization = false;
                            }
                            else if (i != 0) { //all the part of the token except the first one
                                token.static.splitByTokenization = true;
                            }
                            else { // first part of the token
                                token.static.splitByTokenization = false;
                            }
                            // set the fields of the new token/s
                            token.static.id = counter;
                            token.static.start_index = myIndex;
                            myIndex = myIndex + token.static.text.length - 1;
                            token.static.end_index = myIndex;
                            myIndex = myIndex + 1;
                            counter -= 1;
                            token.static.index_in_task = firstIndex + i
                            token.indexInUnit = firstIndex + i
                            console.log(token.indexInUnit)
                            debugger
                            token.indexInUnit = firstIndex + i
                            // replace the token in the tree
                            DataService.tree.tokens.splice(tokenIndex, 0, token);
                            console.log(DataService.tree)
                            newTokenArray.push(DataService.tree.tokens[tokenIndex])
                            console.log(newTokenArray)
                            tokenIndex++;
                        }
                        var index2 = firstIndex;
                        var tokenIndex2 = DataService.tree.tokens.map(function (x) { return getIndexInTask(x); }).indexOf(firstIndex);

                        // update in others tokens the indexes(in passage)
                        for (var i = tokenIndex2; i < DataService.tree.tokens.length; i++) {

                            if (i == 0) {
                                DataService.tree.tokens[i].static.start_index = 0;
                            }
                            else {
                                if (DataService.tree.tokens[i].static.splitByTokenization == true) {
                                    DataService.tree.tokens[i].static.start_index = DataService.tree.tokens[i - 1].static.end_index + 1;
                                }
                                else {
                                    DataService.tree.tokens[i].static.start_index = DataService.tree.tokens[i - 1].static.end_index + 2;
                                }
                            }
                            DataService.tree.tokens[i].indexInUnit = i
                            console.log(DataService.tree.tokens[i].indexInUnit)
                            DataService.tree.tokens[i].static.index_in_task = i
                            DataService.tree.tokens[i].static.end_index = DataService.tree.tokens[i].static.start_index + DataService.tree.tokens[i].static.text.length - 1;
                            index2++;
                        }
                        console.log("my newTokenArray ", newTokenArray)
                        console.log("TREEEEEE", DataService.tree);
                        debugger
                        console.log('token', token, 'selectedToken', selectedToken[0], 'originalToken', originalToken)
                        if (selectedToken[0].unitTreeId == 0) {
                            $rootScope.$broadcast("retokenizationPassage", { passageTokens: DataService.tree.tokens });
                        }
                        else {
                            //if(selectedToken[0].static.splitByTokenization==true )
                            debugger
                            $rootScope.$broadcast("retokenization", { oldToken: getEntireTokenFromAPart(selectedToken[0]), newToken: newTokenArray });
                        }
                    }
                }

            }).result.then(function (okRes) {

            }, function (abortRes) {

            });

        };

        function bindReceivedDefaultHotKeys(hotkeys, scope, rootScope, vm, HotKeysManager, dataService) {
            vm.defaultHotKeys.ManualHotKeys.forEach(function (hotKeyObj) {

                HotKeysManager.addHotKey(hotKeyObj.combo);
                hotkeys.add({
                    combo: hotKeyObj.combo,
                    description: hotKeyObj.description,
                    action: hotKeyObj.action,
                    callback: function (e) {
                        var functionToExecute = HotKeysManager.executeOperation(hotKeyObj);
                        vm[functionToExecute]();
                        e.preventDefault()
                    }
                })

            });
            vm.defaultHotKeys.DefaultHotKeysWithClick.forEach(function (hotKeyObj) {

                HotKeysManager.addHotKey(hotKeyObj.combo);

                hotkeys.add({
                    combo: hotKeyObj.combo,
                    description: hotKeyObj.description,
                    action: 'keyup',
                    callback: function (e) {
                        HotKeysManager.updatePressedHotKeys(hotKeyObj, false);
                        e.preventDefault()
                    }
                })
                hotkeys.add({
                    combo: hotKeyObj.combo,
                    description: hotKeyObj.description,
                    action: 'keydown',
                    callback: function (e) {
                        HotKeysManager.updatePressedHotKeys(hotKeyObj, true);
                        e.preventDefault()
                    }
                })
            });
            vm.defaultHotKeys.DefaultHotKeys.forEach(function (hotKeyObj) {

                HotKeysManager.addHotKey(hotKeyObj.combo);
                hotkeys.add({
                    combo: hotKeyObj.combo,
                    description: hotKeyObj.description,
                    action: hotKeyObj.action,
                    callback: function (e) {
                        var functionToExecute = HotKeysManager.executeOperation(hotKeyObj);
                        var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                        // If direction is rtl- opposite right and left
                        if ($rootScope.direction === 'rtl') {
                            if (functionToExecute.includes('Right')) {
                                functionToExecute = functionToExecute.replace("Right", "Left");
                            } else {
                                functionToExecute = functionToExecute.replace("Left", "Right");
                            }
                        }
                        switch (functionToExecute) {
                            case 'abortRemoteMode': {
                                if (selectionHandlerService.selectedTokenList.length) {
                                    selectionHandlerService.clearTokenList();
                                } else {
                                    selectionHandlerService.setUnitToAddRemotes("0");
                                    $('.annotation-page-container').removeClass('crosshair-cursor');
                                }
                                break;
                            }
                            case 'moveRight': {
                                // DataService.getUnitById(selectedUnitId).cursorLocation++;

                                $rootScope.$broadcast("moveRight", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveToNextRelevant': {
                                // DataService.getUnitById(selectedUnitId).cursorLocation++;

                                $rootScope.$broadcast("moveToNextRelevant", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveRightWithShift': {
                                if (DataService.getUnitById(selectedUnitId).unitType === 'REMOTE' || DataService.getUnitById(selectedUnitId).unitType === 'IMPLICIT') {
                                    return
                                }
                                // DataService.getUnitById(selectedUnitId).cursorLocation++;
                                $rootScope.$broadcast("moveRight", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveRightWithCtrl': {
                                $rootScope.$broadcast("moveRight", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveLeft': {
                                // DataService.getUnitById(selectedUnitId).cursorLocation--;
                                $rootScope.$broadcast("moveLeft", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveLeftWithShift': {
                                if (DataService.getUnitById(selectedUnitId).unitType === 'REMOTE' || DataService.getUnitById(selectedUnitId).unitType === 'IMPLICIT') {
                                    return
                                }
                                // DataService.getUnitById(selectedUnitId).cursorLocation--;
                                $rootScope.$broadcast("moveLeft", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveLeftWithCtrl': {
                                // DataService.getUnitById(selectedUnitId).cursorLocation--;
                                $rootScope.$broadcast("moveLeft", { unitId: selectedUnitId, unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation });
                                break;
                            }
                            case 'moveDown': {
                                // if(selectedUnitId.length === 1 && parseInt(selectedUnitId) >= DataService.tree.AnnotationUnits.length){
                                //     break;
                                // }
                                var nextUnit = DataService.getNextUnit(selectedUnitId);
                                var nextSibling = DataService.getSibling(selectedUnitId);

                                if (nextUnit === -1 && nextSibling === undefined) {
                                    return;
                                }

                                while (nextUnit !== -1 && DataService.getUnitById(nextUnit).gui_status === "HIDDEN") {
                                    nextUnit = DataService.getNextUnit(nextUnit);
                                }

                                if (nextSibling && nextSibling.gui_status !== "HIDDEN" && DataService.getParentUnit(nextSibling.tree_id).gui_status === "OPEN") {
                                    selectionHandlerService.updateSelectedUnit(nextSibling.tree_id);
                                    // DataService.getUnitById(nextSibling.tree_id).gui_status = "OPEN";
                                } else {
                                    if (nextUnit && nextUnit !== -1) {
                                        selectionHandlerService.updateSelectedUnit(nextUnit);
                                        // DataService.getUnitById(nextUnit).gui_status = "OPEN";
                                    }
                                }

                                Core.scrollToUnit(selectionHandlerService.getSelectedUnitId());

                                break;
                            }
                            case 'moveUp': {
                                var splitedID = selectedUnitId.split("-");
                                if (splitedID.length > 1 && splitedID[splitedID.length - 1] === "1") {
                                    var parentId = splitedID.slice(0, splitedID.length - 1).join('-');

                                    selectionHandlerService.updateSelectedUnit(parentId);
                                    DataService.getUnitById(parentId).gui_status = "OPEN";
                                    Core.scrollToUnit(selectionHandlerService.getSelectedUnitId());
                                    break;
                                }
                                if (selectedUnitId === "1" || selectedUnitId === "0") {
                                    selectionHandlerService.updateSelectedUnit("0");
                                    Core.scrollToUnit(selectionHandlerService.getSelectedUnitId());
                                    break;
                                }

                                var prevUnit = DataService.getPrevUnit(selectedUnitId);

                                // while(prevUnit.gui_status === "HIDDEN" || DataService.getParentUnit(prevUnit.tree_id).gui_status === "COLLAPSE" || DataService.getParentUnit(prevUnit.tree_id).gui_status === "HIDDEN"){
                                //   if(DataService.getPrevSibling(prevUnit.tree_id) === null){
                                //     prevUnit = DataService.getPrevUnit(prevUnit.tree_id);
                                //   }else{
                                //     prevUnit = DataService.getPrevSibling(prevUnit.tree_id);
                                //   }
                                // }

                                var prevSibling = DataService.getPrevSibling(selectedUnitId);

                                while (prevSibling.gui_status === "HIDDEN" && prevSibling.tree_id !== '0') {
                                    if (prevSibling.tree_id == "1") {
                                        prevSibling = DataService.getUnitById("0")
                                    } else {
                                        prevSibling = DataService.getPrevSibling(prevSibling.tree_id)
                                    }
                                }

                                while (prevSibling.tree_id != "0" && prevSibling.gui_status !== "COLLAPSE" && prevSibling.AnnotationUnits.length > 0) {
                                    prevSibling = prevSibling.AnnotationUnits[prevSibling.AnnotationUnits.length - 1];
                                }



                                if (prevSibling === null) {
                                    selectionHandlerService.updateSelectedUnit(prevUnit.tree_id);
                                    // prevUnit.gui_status = "OPEN";
                                    break;
                                }
                                if (prevSibling.tree_id.length > prevUnit.tree_id.length) {
                                    selectionHandlerService.updateSelectedUnit(prevSibling.tree_id);
                                    // DataService.getUnitById(prevSibling.tree_id).gui_status = "OPEN";
                                } else {
                                    if (prevSibling) {
                                        selectionHandlerService.updateSelectedUnit(prevSibling.tree_id);
                                        // DataService.getUnitById(prevSibling.tree_id).gui_status = "OPEN";
                                    } else {
                                        if (prevUnit && prevUnit.tree_id !== selectedUnitId) {
                                            selectionHandlerService.updateSelectedUnit(prevUnit.tree_id);
                                            // DataService.getUnitById(prevUnit.tree_id).gui_status = "OPEN";

                                        }
                                    }
                                }

                                Core.scrollToUnit(selectionHandlerService.getSelectedUnitId());

                                break;
                            }
                            case 'deleteFromTree': {
                                var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                                var currentUnit = DataService.getUnitById(selectedUnitId);
                                if (DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT) {
                                    Core.showAlert("Cant delete annotation units from refinement layer")
                                    console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                                    return selectedUnitId;
                                }

                                if (selectedUnitId !== '0') {
                                    var currentUnit = DataService.getUnitById(selectedUnitId);

                                    if (currentUnit.cloned_to_tree_ids) {
                                        open('app/pages/annotation/templates/deleteAllRemoteModal.html', 'md', currentUnit.cloned_to_tree_ids.length, vm);
                                    } else {
                                        if (currentUnit.unitType === "REMOTE") {
                                            var remoteUnit = DataService.getUnitById(currentUnit.cloned_from_tree_id);

                                            // New Remote
                                            DataService.deleteRemoteUnit(currentUnit);
                                        }
                                        var parentUnit = DataService.getParentUnitId(selectedUnitId);
                                        DataService.deleteUnit(selectedUnitId).then(function (res) {
                                            selectionHandlerService.updateSelectedUnit(parentUnit);
                                        })
                                    }
                                }
                                break;
                            }
                            case 'checkRestrictionForCurrentUnit': {
                                if (selectedUnitId === "0") {
                                    return;
                                }
                                $rootScope.$broadcast("checkRestrictionForCurrentUnit", { unitId: selectedUnitId });
                                break;
                            }
                            case 'resetAllAnnotations': {
                                DataService.resetTree();
                                break;
                            }
                            case 'addImplicitUnit': {
                                $rootScope.addImplicitUnit();
                                break;
                            }
                            // case 'dismiss' :{
                            //     restrictionsValidatorService.closeModal();
                            //     break;
                            // }
                            default: {
                                vm[functionToExecute]();
                                break;
                            }
                        }

                    }
                })
            });


        }
    }
})();
