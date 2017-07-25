
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages', [
    'ui.router',
    'textAngular',
    'zAdmin.pages.ui',
    'zAdmin.pages.edit',
    'zAdmin.pages.form',
    'zAdmin.pages.tables',
    'zAdmin.pages.auth',
    'zAdmin.pages.reg',
    'zAdmin.pages.profile',
    'zAdmin.pages.users',
    'zAdmin.pages.projects',
    'zAdmin.pages.projectTasks',
    'zAdmin.pages.sources',
    'zAdmin.pages.passages',
    'zAdmin.pages.layers',
    'zAdmin.pages.tasks',
    'zAdmin.pages.categories',
    'zAdmin.pages.annotation',
    'zAdmin.pages.tokenization-v2',
    'zAdmin.permissions',
    'zAdmin.restrictionsValidator'
  ])
  .config(routeConfig)
  .run(run);
  console.warn = function(){};
  var ifNotLoggedIn = function (authService,$state){
    if ( !authService.isLoggedIn ) {
      setTimeout(function(){
        $state.go("auth");
      }, 0);
    } else {
      // setTimeout(function(){
        // $state.go("projects");
      // }, 0);
    }
  };
  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function ($injector) {
      ifNotLoggedIn($injector.get("authService"),$injector.get("$state"));
    });

  }
  /** @ngInject */
  function run(authService,$state,$rootScope, Core, PermissionsService,storageService,$location){
    $rootScope.$connected = authService.isLoggedIn;
    

    $rootScope.$hideSideBar = shouldHideSideBar();
    var user_role = storageService.getObjectFromLocalStorage('user_role');
    if(user_role){
      Core.user_role = user_role
    }else{
      Core.user_role = {
        id:2,
        name:"Guest"
      };
    }

    function shouldHideSideBar(){
      return $location.url().indexOf('tokenizationPage')>0 || $location.url().indexOf('annotationPage')>0 
    }

    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams, options){
        $rootScope.$pageFinishedLoading = false;
    });

    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams, error){
        $rootScope.$pageFinishedLoading = true;
        if(ga) ga('send', 'pageview',$location.absUrl());
    });

    PermissionsService.init();


    ifNotLoggedIn(authService,$state);
  }

})();
