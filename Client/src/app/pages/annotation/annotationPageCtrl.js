
(function () {
  'use strict';

  angular.module('zAdmin.pages.annotation')
      .controller('AnnotationPageCtrl', AnnotationPageCtrl);

  /** @ngInject */
  function AnnotationPageCtrl(DefaultHotKeys,TaskMetaData,AnnotationTextService,DataService,$rootScope,$scope,hotkeys,HotKeysManager, Definitions, ENV_CONST, Core, restrictionsValidatorService) {

    $rootScope.callToSelectedTokensToUnit = callToSelectedTokensToUnit;
    $rootScope.addCategoryToExistingRow = addCategoryToExistingRow;
    $rootScope.selectedRow = '';
    //Capture variable for this.
    var vm = this;
    vm.printTree = printTree;
    vm.toggleAnnotationUnitView = toggleAnnotationUnitView;
    vm.saveTask = saveTask;
    vm.submitTask = submitTask;
    vm.finishAll = finishAll;
    vm.tokenizationTask = TaskMetaData.Task;
    vm.annotationTokens = vm.tokenizationTask.tokens;
    vm.categories = TaskMetaData.Categories;
    vm.defaultHotKeys = DefaultHotKeys;
    vm.categorizedWords = [];
    vm.definitions = Definitions;
    vm.dataTree = DataService.tree.AnnotationUnits;
    vm.wrappedText = DataService.wrapWords(vm.annotationTokens,true);
    DataService.tree.text = vm.wrappedText;
    vm.navBarItems = ENV_CONST.NAV_BAR_ITEMS;
    vm.unitIsCollapsed = false;
    vm.keyController = [];
    vm.rootScope = $rootScope;


    init();

    function init(){
      bindCategoriesHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService);
      bindReceivedDefaultHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService && !hotkeys.fromParentLayer);
    }

    function callToSelectedTokensToUnit(level,containsAllParentUnits){
      return DataService.selectedTokensToUnit($rootScope.selectedTokensArray,vm.dataTree.length+1,level,$rootScope.currentCategoryID,$rootScope.currentCategoryColor,$rootScope.currentCategoryBGColor,$rootScope.currentCategoryIsRefined,$rootScope.currentCategoryAbbreviation,$rootScope.currentCategoryName,containsAllParentUnits);

    }

    function toggleAnnotationUnitView(element){
      var currentTarget =element.currentTarget;
      var annotationUnitContainer = $(currentTarget).next().find('.categorized-word');

      $(annotationUnitContainer).toggleClass( "closed-annotation-unit" );
      // vm.unitIsCollapsed = !vm.unitIsCollapsed;
      $($(currentTarget).find('i')).toggleClass( 'ion-minus-round' );
      $($(currentTarget).find('i')).toggleClass( 'ion-plus-round' );
      
    }


    function addCategoryToExistingRow(){
      if($rootScope.clckedLine == ''){
        var lastSelectedRow = $('.selected-row').find('.text');
        lastSelectedRow.length != 0 ? $rootScope.clckedLine = $(lastSelectedRow[0]).attr('id').split('-')[1] : '';
      }
      var newCategory = {
        id:$rootScope.currentCategoryID,
        color:$rootScope.currentCategoryColor,
        backgroundColor:$rootScope.currentCategoryBGColor,
        refinedCategory:$rootScope.currentCategoryIsRefined,
        abbreviation: $rootScope.currentCategoryAbbreviation,
        name: $rootScope.currentCategoryNames
      };
      $rootScope.clckedLine != '' ? DataService.addCategoryToExistingRow($rootScope.clckedLine,newCategory,$scope) : '';
    }

    /**
     * Prints the data structure tree.
     */
    function printTree(){
      DataService.printTree();
    }

    function submitTask(){
      var finishAllResult = vm.finishAll();
      if(finishAllResult){
        return DataService.submitTask().then(function(res){
          Core.showNotification('success','Annotation Task Submitted.');
        });
      }
    }
    function saveTask(){
      DataService.saveTask().then(function(res){
        Core.showNotification('success','Annotation Task Saved.');
      });
    }

    function finishAll(){
        var rootUnit = DataService.getUnitById("0");
        var finishAllResult = restrictionsValidatorService.evaluateFinishAll(rootUnit);
        if(finishAllResult){
          Core.showNotification('success','Finish All was successful');
          return true;
        }else{
          return false;
        }
    }
  }

  function bindCategoriesHotKeys(hotkeys,scope,rootScope,vm,HotKeysManager,dataService){
    vm.categories.forEach(function(categoryObj){
      if(categoryObj.shortcut_key && !categoryObj.fromParentLayer){

        HotKeysManager.addHotKey(categoryObj.shortcut_key);
        hotkeys.bindTo(scope)
            .add({
              combo: categoryObj.shortcut_key,
              description: categoryObj.description,
              action: 'keydown',
              callback: function() {
                var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                var unitIndex = vm.rootScope.clckedLine == "" ? 0 : vm.rootScope.clckedLine;
                for(var i = 0; i< vm.keyController.length; i++){
                  if(vm.keyController[i].index == unitIndex){
                    vm.keyController[i][functionToExecute](categoryObj);
                    // executeFunction(functionToExecute,rootScope,dataService,HotKeysManager);
                  }
                }
              }
            })

        HotKeysManager.addHotKey('shift+'+categoryObj.shortcut_key);
        hotkeys.bindTo(scope)
            .add({
              combo: 'shift+'+categoryObj.shortcut_key,
              description: 'Remote category '+categoryObj.name,
              action: 'keydown',
              callback: function() {
                var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                var unitIndex = vm.rootScope.clckedLine == "" ? 0 : vm.rootScope.clckedLine;
                for(var i = 0; i< vm.keyController.length; i++){
                  if(vm.keyController[i].index == unitIndex){
                    vm.keyController[i]['addAsRemoteUnit'](categoryObj);
                    // executeFunction(functionToExecute,rootScope,dataService,HotKeysManager);
                  }
                }
              }
            })
      }
    });
  }
  function bindReceivedDefaultHotKeys(hotkeys,scope,rootScope,vm,HotKeysManager,dataService){
    vm.defaultHotKeys.ManualHotKeys.forEach(function(hotKeyObj){

      HotKeysManager.addHotKey(hotKeyObj.combo);
      hotkeys.bindTo(scope)
          .add({
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

      hotkeys.bindTo(scope)
          .add({
            combo: hotKeyObj.combo,
            description: hotKeyObj.description,
            action: 'keyup',
            callback: function() {
              HotKeysManager.updatePressedHotKeys(hotKeyObj,false);
              // if(hotKeyObj.combo == 'shift'){
              //   rootScope.lastSelectedWordWithShiftPressed = undefined;
              // }
            }
          })
          .add({
            combo: hotKeyObj.combo,
            description: hotKeyObj.description,
            action: 'keydown',
            callback: function() {
              HotKeysManager.updatePressedHotKeys(hotKeyObj,true);
            }
          })
    });
    vm.defaultHotKeys.DefaultHotKeys.forEach(function(hotKeyObj){

      HotKeysManager.addHotKey(hotKeyObj.combo);
      hotkeys.bindTo(scope)
          .add({
            combo: hotKeyObj.combo,
            description: hotKeyObj.description,
            action: hotKeyObj.action,
            callback: function(e) {
              var functionToExecute = HotKeysManager.executeOperation(hotKeyObj);
              var unitIndex = vm.rootScope.clckedLine == "" ? 0 : vm.rootScope.clckedLine;
              for(var i = 0; i< vm.keyController.length; i++){
                if(vm.keyController[i].index == unitIndex){
                  vm.keyController[i][functionToExecute]();
                  // e.preventDefault()
                  // executeFunction(functionToExecute,rootScope,dataService,HotKeysManager);
                }
              }
            }
          })
    });
  }

  function executeFunction(functionToExecute,rootScope,dataService,hotKeysManager){
    var currentFocusedUnit = '';
    $('.selected-row').removeClass('selected-row');

    switch(functionToExecute){
      case 'deleteFromTree':
        if(rootScope.clckedLine != 0 && rootScope.clckedLine != undefined){
          rootScope.clckedLine = dataService[functionToExecute](rootScope.clckedLine);
          hotKeysManager.setFocusedUnit(rootScope.clckedLine.toString());
          $($('#directive-info-data-container-'+rootScope.clckedLine)[0]).addClass('selected-row');
        }
        break;
      case 'moveDown':
        currentFocusedUnit = rootScope.clckedLine || 0;
        if(currentFocusedUnit == 0){
          $($('#directive-info-data-container-1')[0]).addClass('selected-row');
          rootScope.clckedLine = '1';
        }else{
          var unitIdToFocusOn = dataService.getNextUnit(currentFocusedUnit,'down');
        }
        break;
      case 'moveUp':
        currentFocusedUnit = rootScope.clckedLine || 0;
        if(currentFocusedUnit == '1'){
          rootScope.clckedLine = '0';
        }else{
          var unitIdToFocusOn = dataService.getNextUnit(currentFocusedUnit,'up');
        }
        break;
    }

  }

})();
