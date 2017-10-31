
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.annotation')
      .controller('AnnotationPageCtrl', AnnotationPageCtrl);

  /** @ngInject */
  function AnnotationPageCtrl(DefaultHotKeys,TaskMetaData,AnnotationTextService,DataService,$rootScope,$scope,hotkeys,HotKeysManager, Definitions, ENV_CONST, Core, restrictionsValidatorService,$timeout,$state, selectionHandlerService,$uibModal) {
      var vm = this;
      vm.tokenizationTask = TaskMetaData.Task;
      vm.annotationTokens = vm.tokenizationTask.tokens;
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
      vm.submitTask = submitTask;
      vm.finishAll = finishAll;
      vm.goToMainMenu = goToMainMenu;
      vm.resetAllAnnotations = resetAllAnnotations;
      vm.inRemoteMode = inRemoteMode;
      vm.addUserComment = addUserComment;

      vm.fontSizes = [
          {preview:"AAA",name:"big",size:1},
          {preview:"AA",name:"normal",size:0.9},
          {preview:"A",name:"small",size:0.8}
      ];

      init();

      function init(){
          
          selectionHandlerService.updateSelectedUnit("0",false);
          $(document).on('keydown', function(e) {
            if(!$(e.target).hasClass('unit-comment-text')){
              e.preventDefault();
              e.stopPropagation();
              // e.stopImmediatePropagation();
            }
            // if(e.keyCode == 224 || e.keyCode == 17 || e.keyCode == 91 || e.keyCode == 93){
            //     e.preventDefault();
            //     e.stopPropagation();
            // }
          })

          $scope.$on('InsertSuccess', function(event, args) {
              if(args.dataBlock.id === 0 ){
                  vm.dataTree.AnnotationUnits = args.dataBlock.AnnotationUnits;
              }else{
              }
          });

          $scope.$on('ResetSuccess', function(event, args) {
              vm.categories = TaskMetaData.Categories;
              bindCategoriesHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService);
              bindReceivedDefaultHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService && !hotkeys.fromParentLayer);
          });

          $timeout(function(){$rootScope.$hideSideBar = true;});
          bindCategoriesHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService);
          bindReceivedDefaultHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService && !hotkeys.fromParentLayer);
      }

      function addUserComment(){
          open('app/pages/annotation/templates/commentOnUnitModal.html','sm','',vm)
      }
      function setFontSize(fontSize){
          $('.main-body').css({'font-size':fontSize.size+'em'})
      }

      function inRemoteMode (){
        return selectionHandlerService.getUnitToAddRemotes() !== "0";
      }

      function submitTask(){
          var finishAllResult = vm.finishAll(true);
          if(finishAllResult){
              return DataService.saveTask().then(function(){
                  return DataService.submitTask().then(function(res){
                      Core.showNotification('success','Annotation Task Submitted.');
                      goToMainMenu(res)
                  });
              })
          }
      }

      function finishAll(fromSubmit){
          var rootUnit = DataService.getUnitById("0");
          var hashTables = DataService.hashTables;
          var finishAllResult = restrictionsValidatorService.evaluateFinishAll(rootUnit,fromSubmit,hashTables);
          if(finishAllResult){
              Core.showNotification('success','Finish All was successful');
              return true;
          }else{
              return false;
          }
      }

      function spacePressed(){
            
            if(selectionHandlerService.getUnitToAddRemotes() !== "0"){
              $rootScope.unitClicked($rootScope.currentVm,selectionHandlerService.getSelectedUnitId(),null)
            }else{              
              var selectionList = selectionHandlerService.getSelectedTokenList();
              if(isUnitSelected(selectionList)){
                  if(DataService.currentTask.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                    Core.showAlert("Cant delete annotation units from refinement layer")
                    console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                    return false;
                  }
                  DataService.deleteUnit(selectionList[0].inUnit);
                  selectionHandlerService.clearTokenList();
              }
              else if(selectionList.length){
                  if(DataService.currentTask.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                    Core.showAlert("Cant create annotation units int refinement layer")
                    console.log('ALERT - spacePressed -  prevent insert to tree when refinement layer');
                    return false;
                  }
                  selectionHandlerService.toggleCategory();
              }
            }

      }

      function isUnitSelected(selectionList){
          var result = true;

          if(selectionList.length === 0) return false;

          var tokenIntUnit = selectionList[0].inUnit;
          selectionList.forEach(function(token){
              if(tokenIntUnit !== token.inUnit){
                  result = false;
              }
          });

          if(tokenIntUnit === null){
              return false;
          }
          if(result){
              return DataService.getUnitById(tokenIntUnit);
          }
          return result;

      }

      function goToMainMenu(res){
          var projectId = this ? this.tokenizationTask.project.id : res.data.project.id;
          var layerType = this ? this.tokenizationTask.project.layer.type : res.data.project.layer.type;
          url: '/project/:id/tasks/:layerType',
              $state.go('projectTasks',{
                  id:projectId,
                  layerType:layerType,
                  refresh:true
              });
          $timeout(function(){$rootScope.$hideSideBar = false;})
      }

      function resetAllAnnotations(res){
          console.log('DataService',DataService);
          Core.promptAlert('Are you sure you want to delete all the annotation units?').result.then(function(res){
              if(res){
                  $rootScope.resetAllAnnotations = true;
                  console.log("reset All Annotations");
                  DataService.resetTree().then(function(res){
                      if(res === 'Success'){

                      }
                  })
              }
          })
      }

      function saveTask(){
          return DataService.saveTask().then(function(res){
              Core.showNotification('success','Annotation Task Saved.');
          });
      }

      function bindCategoriesHotKeys(hotkeys,scope,rootScope,vm,HotKeysManager,dataService){
          TaskMetaData.Categories.forEach(function(categoryObj){
              if(categoryObj.shortcut_key && !categoryObj.fromParentLayer){
                  categoryObj.shortcut_key = categoryObj.shortcut_key.toString().toLowerCase();
                  HotKeysManager.addHotKey(categoryObj.shortcut_key);
                  hotkeys.del(categoryObj.shortcut_key.toString().toLowerCase());
                  hotkeys.add({
                          combo: categoryObj.shortcut_key,
                          description: categoryObj.description,
                          action: 'keydown',
                          callback: function() {
                              var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                              selectionHandlerService[functionToExecute](categoryObj);
                              $rootScope.$broadcast("ResetSuccess");
                          }
                      });

                  HotKeysManager.addHotKey('shift+'+categoryObj.shortcut_key.toString().toLowerCase());
                  hotkeys.del(categoryObj.shortcut_key.toString().toLowerCase());
                  hotkeys.add({
                          combo: 'shift+'+categoryObj.shortcut_key,
                          description: 'Remote category '+categoryObj.name,
                          action: 'keydown',
                          callback: function() {
                              var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                              $rootScope.$broadcast("CreateRemoteUnit",{unitId: selectionHandlerService.getSelectedUnitId(),category:categoryObj});
                              // vm.keyController[0]['addAsRemoteUnit'](categoryObj);
                          }
                      });
              }
          });
      }
      
      function open(page, size,message,vm) {
            var remoteOriginalId = $rootScope.clckedLine;
            var viewModal = vm;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: function($scope){
                    $scope.vm = viewModal;
                    if(DataService.currentTask){
                        $scope.comment = DataService.currentTask.user_comment;
                    }

                    $scope.message = message;

                    $scope.saveComment = function(){
                        DataService.currentTask.user_comment = $scope.comment;
                    }

                    var remoteOriginalTreeId = remoteOriginalId;
                    $scope.deleteAllRemoteInstanceOfThisUnit = function(){

                        for(var key in DataService.unitsUsedAsRemote[$scope.vm.dataBlock.annotation_unit_tree_id]){
                            DataService.deleteUnit(key);
                            delete DataService.unitsUsedAsRemote[$scope.vm.dataBlock.annotation_unit_tree_id][key];
                        }
                        DataService.deleteUnit($scope.vm.dataBlock.annotation_unit_tree_id);
                        // selCtrl.updateUI(DataService.getUnitById($("[unit-wrapper-id="+$rootScope.clickedUnit+"]").attr('child-unit-id')));
                    };
                }
            }).result.then(function(okRes){

            },function(abortRes){

            });
        };
      
      function bindReceivedDefaultHotKeys(hotkeys,scope,rootScope,vm,HotKeysManager,dataService){
          vm.defaultHotKeys.ManualHotKeys.forEach(function(hotKeyObj){

              HotKeysManager.addHotKey(hotKeyObj.combo);
              hotkeys.add({
                      combo: hotKeyObj.combo,
                      description: hotKeyObj.description,
                      action: hotKeyObj.action,
                      callback: function(e) {
                          var functionToExecute = HotKeysManager.executeOperation(hotKeyObj);
                          vm[functionToExecute]();
                          e.preventDefault()
                      }
                  })

          });
          vm.defaultHotKeys.DefaultHotKeysWithClick.forEach(function(hotKeyObj){

              HotKeysManager.addHotKey(hotKeyObj.combo);

              hotkeys.add({
                      combo: hotKeyObj.combo,
                      description: hotKeyObj.description,
                      action: 'keyup',
                      callback: function(e) {
                          HotKeysManager.updatePressedHotKeys(hotKeyObj,false);
                          e.preventDefault()
                      }
                  })
              hotkeys.add({
                      combo: hotKeyObj.combo,
                      description: hotKeyObj.description,
                      action: 'keydown',
                      callback: function(e) {
                          HotKeysManager.updatePressedHotKeys(hotKeyObj,true);
                          e.preventDefault()
                      }
                  })
          });
          vm.defaultHotKeys.DefaultHotKeys.forEach(function(hotKeyObj){

              HotKeysManager.addHotKey(hotKeyObj.combo);
              hotkeys.add({
                      combo: hotKeyObj.combo,
                      description: hotKeyObj.description,
                      action: hotKeyObj.action,
                      callback: function(e) {
                          var functionToExecute = HotKeysManager.executeOperation(hotKeyObj);
                          var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                          switch(functionToExecute){
                              case 'abortRemoteMode':{
                                selectionHandlerService.setUnitToAddRemotes("0");
                                $('.annotation-page-container').removeClass('crosshair-cursor');
                                break;
                              }
                              case 'moveRight':{
                                  // DataService.getUnitById(selectedUnitId).cursorLocation++;

                                  $rootScope.$broadcast("moveRight",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveRightWithShift':{
                                  // DataService.getUnitById(selectedUnitId).cursorLocation++;
                                  $rootScope.$broadcast("moveRight",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveRightWithCtrl':{
                                  $rootScope.$broadcast("moveRight",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveLeft':{
                                  // DataService.getUnitById(selectedUnitId).cursorLocation--;
                                  $rootScope.$broadcast("moveLeft",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveLeftWithShift':{
                                  // DataService.getUnitById(selectedUnitId).cursorLocation--;
                                  $rootScope.$broadcast("moveLeft",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveLeftWithCtrl':{
                                  // DataService.getUnitById(selectedUnitId).cursorLocation--;
                                  $rootScope.$broadcast("moveLeft",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveDown':{
                                  // if(selectedUnitId.length === 1 && parseInt(selectedUnitId) >= DataService.tree.AnnotationUnits.length){
                                  //     break;
                                  // }
                                  var nextUnit = DataService.getNextUnit(selectedUnitId);
                                  var nextSibling = DataService.getSibling(selectedUnitId);


                                  if(nextUnit === -1 && nextSibling === undefined){
                                      return;
                                  }

                                  while(nextUnit !== -1 && DataService.getUnitById(nextUnit).gui_status === "HIDDEN"){
                                    nextUnit = DataService.getNextUnit(nextUnit);
                                  }

                                  if(nextSibling && nextSibling.gui_status !== "HIDDEN" && DataService.getParentUnit(nextSibling.annotation_unit_tree_id).gui_status === "OPEN"){
                                      selectionHandlerService.updateSelectedUnit(nextSibling.annotation_unit_tree_id);
                                      // DataService.getUnitById(nextSibling.annotation_unit_tree_id).gui_status = "OPEN";
                                  }else{
                                      if(nextUnit && nextUnit !== -1){
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
                                      var parentId = splitedID.slice(0,splitedID.length-1).join('-');

                                      selectionHandlerService.updateSelectedUnit(parentId);
                                      DataService.getUnitById(parentId).gui_status = "OPEN";
                                      break;
                                  }
                                  if (selectedUnitId === "1" || selectedUnitId === "0") {
                                      selectionHandlerService.updateSelectedUnit("0");
                                      break;
                                  }

                                  var prevUnit = DataService.getPrevUnit(selectedUnitId);

                                  // while(prevUnit.gui_status === "HIDDEN" || DataService.getParentUnit(prevUnit.annotation_unit_tree_id).gui_status === "COLLAPSE" || DataService.getParentUnit(prevUnit.annotation_unit_tree_id).gui_status === "HIDDEN"){
                                  //   if(DataService.getPrevSibling(prevUnit.annotation_unit_tree_id) === null){
                                  //     prevUnit = DataService.getPrevUnit(prevUnit.annotation_unit_tree_id);
                                  //   }else{
                                  //     prevUnit = DataService.getPrevSibling(prevUnit.annotation_unit_tree_id);
                                  //   }
                                  // }

                                  var prevSibling = DataService.getPrevSibling(selectedUnitId);

                                  while(prevSibling.gui_status === "HIDDEN"){
                                    if(prevSibling.annotation_unit_tree_id == "1"){
                                        prevSibling = DataService.getUnitById("0")
                                    }else{
                                      prevSibling = DataService.getPrevSibling(prevSibling.annotation_unit_tree_id)
                                    }
                                  }

                                  while(prevSibling.annotation_unit_tree_id != "0" && prevSibling.gui_status !== "COLLAPSE" && prevSibling.AnnotationUnits.length > 0){
                                    prevSibling = prevSibling.AnnotationUnits[prevSibling.AnnotationUnits.length - 1];
                                  }



                                  if (prevSibling === null) {
                                      selectionHandlerService.updateSelectedUnit(prevUnit.annotation_unit_tree_id);
                                      // prevUnit.gui_status = "OPEN";
                                      break;
                                  }
                                  if (prevSibling.annotation_unit_tree_id.length > prevUnit.annotation_unit_tree_id.length) {
                                      selectionHandlerService.updateSelectedUnit(prevSibling.annotation_unit_tree_id);
                                      // DataService.getUnitById(prevSibling.annotation_unit_tree_id).gui_status = "OPEN";
                                  } else {
                                      if (prevSibling) {
                                          selectionHandlerService.updateSelectedUnit(prevSibling.annotation_unit_tree_id);
                                          // DataService.getUnitById(prevSibling.annotation_unit_tree_id).gui_status = "OPEN";
                                      } else {
                                          if (prevUnit && prevUnit.annotation_unit_tree_id !== selectedUnitId) {
                                              selectionHandlerService.updateSelectedUnit(prevUnit.annotation_unit_tree_id);
                                              // DataService.getUnitById(prevUnit.annotation_unit_tree_id).gui_status = "OPEN";

                                          }
                                      }
                                  }
                                  
                                  Core.scrollToUnit(selectionHandlerService.getSelectedUnitId());
                                  
                                  break;
                              }
                              case 'deleteFromTree':{
                                  var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                                  var currentUnit = DataService.getUnitById(selectedUnitId);
                                  if(DataService.currentTask.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                                    Core.showAlert("Cant delete annotation units from refinement layer")
                                    console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                                    return selectedUnitId;
                                  }

                                  if(selectedUnitId !== '0'){
                                        var currentUnit = DataService.getUnitById(selectedUnitId);
                                      
                                        if(DataService.unitsUsedAsRemote[selectedUnitId] !==  undefined && !Core.isEmptyObject(DataService.unitsUsedAsRemote[selectedUnitId])){
                                            open('app/pages/annotation/templates/deleteAllRemoteModal.html','md',Object.keys(DataService.unitsUsedAsRemote[selectedUnitId]).length,vm);
                                        }else{
                                            if(currentUnit.unitType === "REMOTE"){
                                                //UpdateUsedAsRemote
                                                var remoteUnit = DataService.getUnitById(currentUnit.remote_original_id);
                                                var elementPos = DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.annotation_unit_tree_id]
                                                if(elementPos){
                                                    delete DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.annotation_unit_tree_id];
                                                }

                                                delete DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.annotation_unit_tree_id];
                                            }
                                            var parentUnit = DataService.getParentUnitId(selectedUnitId);
                                            DataService.deleteUnit(selectedUnitId).then(function(res){
                                                selectionHandlerService.updateSelectedUnit(parentUnit);
                                            })
                                        }
                                  }
                                  break;
                              }
                              case 'checkRestrictionForCurrentUnit':{
                                  if(selectedUnitId === "0"){
                                        return;
                                  }
                                  $rootScope.$broadcast("checkRestrictionForCurrentUnit",{unitId: selectedUnitId});
                                  break;
                              }
                              case 'resetAllAnnotations':{
                                  DataService.resetTree();
                                  break;
                              }
                              case 'addImplicitUnit':{
                                  $rootScope.addImplicitUnit();
                                  break;
                              }
                              default:{
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
