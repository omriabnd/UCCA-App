
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
      vm.toggleParents = toggleParents;

      vm.fontSizes = [
          {preview:"AAA",name:"big",size:1},
          {preview:"AA",name:"normal",size:0.9},
          {preview:"A",name:"small",size:0.8}
      ];

      init();
      
      
      $scope.sortByPrototypes = function(cat){
    	var selectedTokenList = [];
    	if (selectionHandlerService.getSelectedTokenList() != undefined){
	      	selectedTokenList = selectionHandlerService.getSelectedTokenList();
	      	if(selectedTokenList.length == 0){
		      	var selectedUnit = selectionHandlerService.getSelectedUnitId();
		      	if(selectedUnit != undefined && selectedUnit != 0){
		      		selectedTokenList = DataService.getUnitById(selectedUnit).tokenCopy;
//		      		console.log(selectedTokenList)
		      	}
	      	}
        }
//    	console.log(selectedTokenList)
    	
    	if(selectedTokenList == undefined){
    		selectedTokenList = [];
    	}
      	
      	selectedTokenList = selectedTokenList.map(function (token) {
      	    return token.text;
      	});
      	
      	$scope.selectedTokens = selectedTokenList.join(" ");
      	
      	var pt = {'around': ['Locus', 'Path', 'Approximator', 'AROUND_THE_CORNER', 'Direction'], 'for': ['Purpose', 'Theme', 'Duration', 'Beneficiary', 'Explanation', 'ComparisonRef', 'Cost', 'Experiencer', 'Circumstance', 'Direction', 'Stimulus', 'OrgRole', 'Recipient', 'Frequency', 'Characteristic', 'Beneficiary?', 'Topic', 'Function', 'Time', 'Gestalt', 'Reciprocation', 'ProfessionalAspect', 'InitialLocation', 'Experiencer?', 'Scalar/Rank', 'Part/Portion', 'DeicticTime', 'Agent', 'Identity', 'Value'], 'before': ['Time', 'Locus'], 'our': ['Possessor', 'Agent', 'Experiencer', 'OrgRole', 'Recipient', 'Whole'], 'of': ['Quantity', 'Whole', 'Gestalt', 'Possessor', 'Topic', 'Species', 'Identity', 'Locus', 'Source', 'Stuff', 'Theme', 'Stimulus', 'Manner', 'Explanation', 'Characteristic', 'InsteadOf', 'OrgRole', 'Circumstance', 'SocialRel', 'Cost', 'Time', 'Extent', '?', 'Possession', 'Experiencer', 'Possessor?', 'Agent', 'Source?', 'Causer', 'Direction', 'Approximator', 'Goal', 'Identity?', 'ComparisonRef', 'Causer? ~>Source?', 'Part/Portion', 'Purpose', 'Instrument', 'Originator', 'Duration', 'not MWE: in + a_matter_of', 'Location'], 'from': ['Source', 'Originator', 'StartTime', 'Part/Portion', 'InitialLocation', 'Locus', 'Agent', 'OrgRole', 'Whole', 'Co-Theme', 'Explanation', 'Stimulus', 'ComparisonRef', 'Donor/Speaker', 'Direction', 'AWAY_FROM', 'Comparison/Contrast', 'Gestalt', 'Direction; MWE: away_from', 'SocialRel', 'Location'], 'my': ['Possessor', 'Whole', 'Agent', 'Experiencer', 'OrgRole', 'Recipient', 'Causer', 'Theme', 'Direction'], 'to': ['Goal', 'Purpose', 'Recipient', 'Characteristic', 'Stimulus', 'Explanation', 'Beneficiary', 'Experiencer', 'Locus', 'EndTime', 'ComparisonRef', 'Topic', 'Theme', 'OrgRole', 'Part/Portion', 'Co-Theme', 'Manner', 'Comparison/Contrast', 'SocialRel', 'Time', 'Extent', 'Circumstance', 'Destination', 'StartTime', 'weak MWE', 'MWE: when_it_comes_to'], 'their': ['Possessor', 'Agent', 'OrgRole', 'Experiencer', 'Theme', 'Causer', 'Whole'], 'along with': ['Accompanier'], 'with': ['Co-Agent', 'Topic', 'Characteristic', 'Accompanier', 'Stimulus', 'Theme', 'SocialRel', 'Manner', 'Circumstance', 'OrgRole', 'Possession', 'Beneficiary', 'Part/Portion', 'Instrument', 'Co-Theme', 'Attribute', 'Means', 'Recipient', 'Possessor', 'ProfessionalAspect'], 'out of': ['Source', 'Quantity', 'Whole', 'Locus', 'Manner'], 'on': ['Locus', 'Time', 'Theme', 'Topic', 'Goal', 'Location', 'Manner', 'Whole', 'Beneficiary', 'Activity', 'State', 'ProfessionalAspect', 'Quantity', 'Gestalt', 'Agent', 'Circumstance', 'Characteristic', 'Extent', 'Patient'], 'like': ['ComparisonRef', 'Theme', 'Part/Portion', 'Comparison/Contrast', 'Identity', 'Approximator'], 'at': ['Locus', 'Time', 'OrgRole', 'Cost', 'Stimulus', 'Direction?', 'Direction', 'Topic', 'Recipient', 'Gestalt', 'Circumstance', 'Frequency', 'Manner', 'Goal'], 'in': ['Locus', 'Time', 'Manner', 'Direction', 'Topic', 'Circumstance', 'Goal', 'Interval', 'Characteristic', 'State', 'Theme', 'Path', 'Whole', 'Instrument', 'OrgRole', 'Duration', 'Stimulus', 'Manner?', 'Identity', 'ProfessionalAspect', 'Attribute', 'MWE', 'Activity', 'DeicticTime'], 'as': ['Identity', 'ComparisonRef', 'Explanation', 'Characteristic', 'Time', 'Approximator', 'Part/Portion', 'not MWE', 'Cost', 'Duration', 'Frequency', 'Manner', 'Extent', 'Circumstance', 'MWE: as_usual'], 'MY': ['Possessor', 'OrgRole', 'Experiencer'], 'about': ['Topic', 'Approximator', 'Stimulus', 'Gestalt', 'Attribute'], 'into': ['Goal', 'Direction', 'Locus', 'Path', 'Activity'], 'your': ['Possessor', 'Agent', 'Experiencer', 'Whole', 'OrgRole'], 'out': ['Direction', 'Location', 'Locus', 'State', 'Possessor', 'Path', 'InitialLocation'], 'away': ['Direction', 'Locus'], 'the': ['Manner', 'Locus', 'Time', 'Instrument', 'Path', 'Circumstance', 'Extent', 'Duration', 'not MWE?', 'not MWE, or ‘the’ not part of MWE', 'Part/Portion', 'Purpose', 'Source', 'break MWE'], 'over the phone': ['Instrument', 'Path'], 'phone': ['Instrument', 'Path', 'Manner', 'Locus'], 'At one point': ['Time', 'not MWE'], 'point': ['Time', 'not MWE'], 'one': ['Time', 'not MWE'], 'My': ['Experiencer', 'Possessor', 'Whole', 'Agent', 'OrgRole', 'Recipient'], 'down': ['Path', 'Direction', 'Locus'], 'off': ['Source', 'Locus', 'Direction', 'Location'], 'within': ['Duration', 'Locus', 'Time', 'Extent?', 'Interval'], 'by': ['Agent', 'Means', 'Originator', 'Causer', 'Time', 'Stimulus', 'Locus', 'Instrument', 'Value', 'Function', 'Experiencer', 'Path'], 'outside of': ['Locus'], 'back': ['Direction', 'Time', 'Locus', 'Direction; not MWE'], 'without': ['Manner', 'Circumstance', 'Accompanier', 'State', 'Instrument', 'Characteristic', 'Possession'], 'far': ['Extent'], 'by far': ['Extent'], 'up': ['Direction', 'Locus', 'Path'], 'During': ['Time'], 'during': ['Time'], 'afterward': ['Time'], 'on time': ['Manner', 'Locus'], 'time': ['Manner', 'Locus', 'Time', 'Circumstance', 'Extent', 'Duration'], 's': ['Possessor', 'Whole', 'OrgRole', 'Experiencer', 'Agent', 'Time'], 'As': ['Identity', 'Explanation'], 'all over': ['Locus'], 'over': ['Approximator', 'Locus', 'Direction', 'ComparisonRef', 'Frequency', 'Duration? Circumstance? Path?', 'Path', 'Goal', 'Time', 'Means', 'InsteadOf', 'Scalar/Rank'], 'than': ['ComparisonRef', 'Approximator', 'Part/Portion', 'InsteadOf', 'RATHER_THAN'], 'instead of': ['InsteadOf'], 'under': ['Locus', 'Manner'], 'After': ['Time', 'Explanation', 'Interval'], 'her': ['Agent', 'Possessor', 'Whole', 'Experiencer', 'Recipient', 'OrgRole'], 'from Hell': ['Manner', 'Source'], 'Hell': ['Manner', 'Source'], 'as to': ['Topic'], 'all': ['Extent'], 'of all time': ['Extent'], 'AWAY': ['Locus'], 'throughout': ['Duration', 'Locus', 'Path'], 'between': ['Whole', 'Locus', 'Time', 'Goal', 'Theme'], 'inside': ['Locus', 'Goal'], 'ahead of time': ['Time'], 'ur': ['Possessor'], 'need': ['Circumstance', 'Manner', 'Locus', 'Locus; MWE: in_need_of'], 'in time of need': ['Circumstance'], 'apart': ['Time'], 'his': ['Agent', 'Possessor', 'OrgRole', 'Experiencer', 'Whole', 'Causer'], 'after': ['Time', 'Explanation', 'Interval'], 'Town': ['Locus'], 'in Town': ['Locus'], 'Before': ['Time'], 'Their': ['Agent'], 'until': ['EndTime'], 'through': ['Path', 'Duration', 'Means', 'Instrument', 'Via'], 'At': ['Locus', 'Time', 'Circumstance'], 'since': ['Explanation', 'StartTime', 'Time', 'Duration'], 'Upon': ['Time'], 'limbo': ['Manner', 'Locus'], 'in limbo': ['Manner', 'Locus'], "'s": ['Possessor', 'Agent', 'Time', 'Experiencer', 'Theme', 'OrgRole', 'Duration'], 'On': ['Time', 'Locus', 'Theme'], 'minus': ['Possession', 'Part/Portion'], 'Our': ['Possessor', 'Agent', 'OrgRole'], 'In': ['Locus', 'Time', 'Duration', 'Circumstance', 'Manner'], 'at all': ['Extent'], 'OVER': ['Path', 'Locus'], 'at best': ['Extent'], 'best': ['Extent', 'Manner', 'Locus'], 'nearby': ['Locus', 'Goal'], 'ago': ['Time', 'Interval'], 'in between': ['Locus', 'Time'], 'eat': ['Purpose'], 'to eat': ['Purpose'], 'upon': ['Time'], 'except': ['Part/Portion'], 'WITHOUT': ['Circumstance'], 'on hold': ['Manner', 'Locus'], 'hold': ['Manner', 'Locus'], 'standpoint': ['Locus', 'Source'], 'From standpoint': ['Locus', 'Source'], 'economy': ['Circumstance'], 'with the way it is': ['Circumstance'], 'is': ['Circumstance'], 'round': ['Path', 'Locus'], 'it': ['Circumstance'], 'on the cheap': ['Manner', 'Locus'], 'cheap': ['Manner', 'Locus'], 'in person': ['Manner', 'Locus'], 'person': ['Manner', 'Locus'], 'Since': ['Explanation', 'Time', 'StartTime'], 'in every way': ['Extent'], 'part': ['Extent'], 'way': ['Extent', 'Source'], 'in large part': ['Extent'], 'large': ['Extent'], 'every': ['Extent'], 'other than': ['Part/Portion'], 'at this point': ['Time', 'not MWE'], 'this': ['Time', 'not MWE'], 'all of': ['Approximator'], 'Within': ['Time', 'Interval'], 'due to': ['Explanation'], 'Because of': ['Explanation'], 'own': ['Manner'], 'on own': ['Manner'], 'To': ['Goal', 'Purpose', 'Recipient', 'Characteristic'], 'behind the wheel': ['Locus'], 'wheel': ['Locus'], 'soon': ['Time', 'ComparisonRef', 'not MWE'], 'as soon as': ['Time', 'ComparisonRef', 'not MWE'], 'its': ['Agent', 'Whole', 'Theme'], 'From': ['Source', 'StartTime', 'Locus', 'Originator'], 'Atop': ['Locus'], 'near': ['Locus', 'Time', 'Location'], 'stretch': ['Extent'], 'any': ['Extent'], 'imagination': ['Extent'], 'by any stretch of the imagination': ['Extent'], 'circa': ['Time'], "'": ['Possessor', 'Experiencer'], 'in front of': ['Locus', 'Goal'], 'front': ['Locus', 'Goal', 'Source'], 'together': ['Accompanier'], 'least': ['Approximator', 'Extent'], 'at least': ['Approximator', 'Extent'], 'date': ['Manner', 'Locus'], 'out of date': ['Manner', 'Locus'], 'in the midst of': ['Manner'], 'midst': ['Manner'], 'beyond': ['Extent', 'Time'], 'apart from': ['Part/Portion'], 'For': ['Explanation', 'ComparisonRef', 'Purpose', 'Duration', 'Recipient', 'Direction', 'Cost'], 'on staff': ['ProfessionalAspect'], 'aside from': ['Part/Portion'], 'because of': ['Explanation'], 'besides': ['Part/Portion'], 'on the spot': ['Time'], 'spot': ['Time'], 'clock': ['Time'], 'around the clock': ['Time'], 'towards': ['Beneficiary'], 'In this day': ['Time'], 'as long as': ['Duration', 'Circumstance'], 'terms': ['Topic'], 'in terms of': ['Topic'], 'free': ['Cost'], 'for free': ['Cost'], 'less than': ['Approximator'], 'at fault': ['State'], 'up front': ['Locus'], 'just about': ['Approximator'], 'on the side': ['Manner', 'Locus'], 'side': ['Manner', 'Locus'], '4': ['Explanation'], 'a least': ['Approximator'], 'mean': ['Time'], 'in the mean time': ['Time'], 'on the lookout': ['Manner', 'Locus'], 'lookout': ['Manner', 'Locus'], 'line': ['Locus', 'Manner', 'Goal'], 'in line': ['Manner', 'Locus'], 'home': ['Goal', 'Locus'], 'on a basis': ['Frequency'], 'In this day and age': ['Time'], 'and': ['Manner', 'Locus', 'Time', 'Direction'], 'age': ['Time', 'Purpose', 'not MWE'], 'day': ['Time'], 'such as': ['Part/Portion'], 'behind': ['Locus', 'Location'], 'detail': ['Manner'], 'in detail': ['Manner'], 'outside': ['Locus'], 'With': ['Circumstance', 'Characteristic', 'Manner'], 'business': ['Manner', 'Locus'], 'in business': ['Manner', 'Locus'], 'IN': ['Locus'], 'par': ['Manner', 'Locus'], 'up to par': ['Manner', 'Locus'], 'out of business': ['Manner', 'Locus'], 'down the road': ['Location'], 'long': ['Circumstance'], 'according to': ['Circumstance'], 'thanks to': ['Explanation'], 'indoors': ['Locus'], 'years': ['Duration'], 'over the years': ['Duration'], 'then': ['ComparisonRef', 'InsteadOf'], 'back and forth': ['Direction'], 'forth': ['Direction'], 'onto': ['Goal'], 'above': ['Locus'], 'on a budget': ['Manner', 'Locus'], 'budget': ['Manner', 'Locus'], 'a': ['Locus', 'Manner', 'Cost', 'Explanation', 'Manner?', 'Duration', 'not MWE: in + a_matter_of'], 'all round': ['Extent'], 'more than': ['Approximator'], 'more like': ['Comparison/Contrast'], 'duty': ['Manner', 'Locus'], 'on duty': ['Manner', 'Locus'], 'on top of': ['Locus'], 'top': ['Locus'], 'except for': ['Part/Portion'], 'off of': ['Source', 'Locus'], 'on line': ['Goal', 'Locus'], 'but': ['Part/Portion'], 'middle': ['Manner', 'Locus'], 'in the middle of': ['Manner', 'Locus'], 'at the last minute': ['Time', 'not MWE?'], 'last': ['Time', 'not MWE?'], 'minute': ['Time', 'not MWE?'], 'rather than': ['InsteadOf'], 'next to': ['Locus'], 'around back': ['Locus', 'Direction; not MWE'], 'in the light': ['Manner', 'not MWE, or ‘the’ not part of MWE'], 'light': ['Manner', 'not MWE, or ‘the’ not part of MWE'], 'to death': ['Extent'], 'death': ['Extent'], 'against': ['ComparisonRef', 'Beneficiary'], 'By': ['Time', 'Agent', 'Originator'], 'Of': ['Topic', 'Quantity'], 'below': ['Locus'], 'exception': ['Part/Portion'], 'with the exception of': ['Part/Portion'], 'in need of': ['Manner', 'Locus'], 'nothing but': ['Part/Portion'], 'of late': ['DeicticTime'], 'circumstances': ['Circumstance', 'Locus'], 'under circumstances': ['Circumstance', 'Locus'], 'Unlike': ['ComparisonRef'], 'town': ['Locus', 'Source'], 'in town': ['Locus'], 'sake': ['Purpose'], 'for the sake of': ['Purpose'], 'His': ['Experiencer', 'Possessor'], 'OF': ['Gestalt', 'Possessor', 'Quantity', 'Comparison/Contrast', 'Whole', 'Time', 'Stuff'], 'on way': ['State'], 'AT ALL': ['Extent'], 'ALL': ['Extent'], 'FOR': ['Explanation', 'Cost'], 'plus': ['Approximator'], 'up and running': ['Manner', 'Locus'], 'running': ['Manner', 'Locus'], 'depending on': ['Circumstance'], 'in the best interests': ['Manner', 'Locus'], 'interests': ['Manner', 'Locus'], 'Aside from': ['Part/Portion'], 'in spite of': ['Circumstance'], 'spite': ['Circumstance'], 'in hopes to': ['Purpose'], 'hopes': ['Purpose'], 'HIS': ['Possessor'], 'FROM': ['Source', 'Causer'], 'AROUND': ['Locus', 'Path'], 'out of the way': ['Source'], 'across': ['Locus', 'Path', 'ACROSS_FROM'], 'market': ['Manner', 'Locus'], 'on the market': ['Manner', 'Locus'], 'others': ['Whole'], 'among others': ['Whole'], 'from begiinning': ['StartTime', 'weak MWE'], 'end': ['EndTime', 'not MWE', 'Circumstance'], 'begiinning': ['StartTime', 'weak MWE'], 'to end': ['EndTime', 'not MWE'], 'at times': ['Time', 'not MWE?'], 'times': ['Time', 'not MWE?'], 'too': ['Extent'], 'for age': ['Purpose', 'not MWE'], 'in hurry': ['Manner', 'Locus'], 'hurry': ['Manner', 'Locus'], 'In experience': ['Circumstance'], 'for the most part': ['Extent'], 'most': ['Extent'], 'experience': ['Circumstance'], 'per': ['RateUnit'], 'AT ALL COSTS': ['Extent'], 'search': ['Manner', 'Locus'], 'in search of': ['Manner', 'Locus'], 'reason': ['Explanation'], 'with good reason': ['Explanation'], 'good': ['Explanation'], 'ta': ['Source'], 'out ta': ['Source'], 'out there': ['Locus'], 'there': ['Locus', 'Possessor', 'Agent'], 'past': ['Time', 'Path', 'Locus'], 'rather then': ['InsteadOf'], 'from start to finish': ['StartTime', 'weak MWE'], 'finish': ['StartTime', 'weak MWE'], 'start': ['StartTime', 'weak MWE'], 'control': ['Manner', 'Locus'], 'out of control': ['Manner', 'Locus'], 'at peace': ['Manner', 'Locus'], 'peace': ['Manner', 'Locus'], 'stock': ['Manner', 'Locus'], 'in stock': ['Manner', 'Locus'], 'at first': ['Time'], 'first': ['Time'], 'in the end': ['Circumstance'], 'among': ['Whole'], 'via': ['Via'], 'on campus': ['Location'], 'Back': ['Direction'], 'on shelf': ['Locus', 'not MWE'], 'shelf': ['Locus', 'not MWE'], 'in need': ['Manner', 'Locus; MWE: in_need_of'], 'purpose': ['Manner'], 'on purpose': ['Manner'], 'touch': ['Manner', 'Locus'], 'in touch': ['Manner', 'Locus'], 'Over': ['Instrument', 'Path', 'Approximator'], 'On call': ['Manner', 'Locus'], 'call': ['Manner', 'Locus'], 'Other than': ['Part/Portion'], 'night': ['Time', 'not MWE'], 'at night': ['Time', 'not MWE'], 'out of town': ['Locus', 'Source'], 'on business': ['Activity'], 'In Town': ['Locus'], 're': ['Topic'], 'out of way': ['Direction'], 'Out of business': ['Manner', 'Locus'], 'AT': ['Locus'], 'ON': ['Time', 'Locus'], 'WITH': ['Characteristic', 'Co-Agent'], 'S': ['Possessor'], 'THERE': ['Possessor'], 'OFF': ['Source', 'Locus'], 'ALL OVER': ['Locus'], 'YOUR': ['Agent', 'Possessor'], 'HOME': ['Goal', 'Locus'], 'TO': ['Purpose', 'Goal'], 'BACK': ['Direction'], 'versus': ['Comparison/Contrast'], 'THE': ['Instrument', 'Path'], 'PHONE': ['Instrument', 'Path'], 'OVER THE PHONE': ['Instrument', 'Path'], 'To date': ['DeicticTime'], 'on the phone': ['Manner', 'Locus'], 'in traffic': ['Manner', 'Locus'], 'traffic': ['Manner', 'Locus'], 'love': ['Manner', 'Locus'], 'in love': ['Manner', 'Locus'], 'at which point': ['Time', 'not MWE'], 'which': ['Time', 'not MWE'], 'in time': ['Time'], 'Like': ['ComparisonRef', 'Comparison/Contrast'], 'BEFORE': ['Time'], 'LEAST': ['Approximator'], 'AT LEAST': ['Approximator'], 'Instead of': ['InsteadOf'], 'pain': ['Manner', 'Locus'], 'in pain': ['Manner', 'Locus'], 'MORE than': ['Approximator'], 'ordinary': ['Manner', 'Locus'], 'out of the ordinary': ['Manner', 'Locus'], 'despite': ['Circumstance'], 'till': ['EndTime'], 'if': ['ComparisonRef'], 'as if': ['ComparisonRef'], 'AS': ['ComparisonRef', 'Extent', 'Identity'], 'under warranty': ['Manner', 'Locus'], 'warranty': ['Manner', 'Locus'], 'on the way': ['State'], 'on schedule': ['Manner', 'Locus'], 'schedule': ['Manner', 'Locus'], 'like a human being': ['Comparison/Contrast'], 'thru': ['Locus', 'Path'], 'no': ['Duration'], 'in no time': ['Duration'], 'at a premium': ['Cost'], 'premium': ['Cost'], 'on a whim': ['Explanation', 'Manner?'], 'whim': ['Explanation', 'Manner?'], 'upstairs': ['Locus', 'Direction'], 'downstairs': ['Locus'], 'up to date': ['Manner', 'Locus'], 'in the world': ['Locus', 'break MWE'], 'world': ['Locus', 'break MWE'], 'in a matter of': ['Duration', 'not MWE: in + a_matter_of'], 'matter': ['Duration', 'not MWE: in + a_matter_of'], 'to go': ['Manner'], 'go': ['Manner'], 'out front': ['Locus', 'Source'], 'Among': ['Whole'], 'on the planet': ['Location'], 'regardless of': ['Circumstance'], 'above the call of duty': ['Scalar/Rank'], 'colors': ['Manner'], 'with flying colors': ['Manner'], 'flying': ['Manner']};

      	var prototypes = pt[$scope.selectedTokens] || [];
      	
      	var ind = prototypes.indexOf(cat.name);
      	if (ind === -1) {
      		return vm.categories.length;
      	} else {
      		return ind;
      	}
      }
      
      //$scope.filterByRelevance = function(cat){
      //    return true;
          // commeting out Jakob's previous condition
          // return !cat.fromParentLayer;
      //}
      $scope.notFromParentLayer = function(cat){
    	  return !cat.fromParentLayer;
      }
      
      $scope.fromParentLayer = function(cat){
    	  return cat.fromParentLayer;
      }

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
      
      function toggleParents(){
    	  $scope.showParents = !$scope.showParents;
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
                        selectionHandlerService.updateSelectedUnit("0",false);
                        $rootScope.$broadcast("ResetFromBarSuccess",{unitId: "0"});                        
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
