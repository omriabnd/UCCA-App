/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.core', [])

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module("zAdmin.const", [

  ]);

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$urlRouterProvider", "baSidebarServiceProvider"];
  run.$inject = ["authService", "$state", "$rootScope", "Core", "PermissionsService", "storageService", "$location"];
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


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme', [
      'toastr',
      'chart.js',
      'angular-chartist',
      'angular.morris-chart',
      'textAngular',
      'zAdmin.theme.components',
      'zAdmin.api',
      'zAdmin.permissions'
  ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.annotation", [
        "cfp.hotkeys",
        "zAdmin.annotation.data",
        "zAdmin.annotation.definitions",
        "zAdmin.annotation.hotKeysManager",
        "zAdmin.annotation.selectionHandler"
    ]);

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.permissions",[
        ,
        'permission',
        'permission.ui'
    ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module("zAdmin.http", [

  ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module("zAdmin.api", [
    'zAdmin.http',
    'zAdmin.storage'
  ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module("zAdmin.storage", [

  ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.annotation', [
        "zAdmin.annotation",
        "zAdmin.annotation.directives"
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        getAnnotationTask.$inject = ["AnnotationTextService", "$stateParams", "DataService", "restrictionsValidatorService", "selectionHandlerService"];
        getDefinitions.$inject = ["DefinitionsService"];
        getDefaultHotKeys.$inject = ["DataService"];
        $stateProvider
            .state('annotationPage', {
                url: '/annotationPage/:taskId',
                templateUrl: 'app/pages/annotation/annotation-page.html',
                title: 'Annotation',
                controller: 'AnnotationPageCtrl',
                controllerAs: 'vm',
                sidebarMeta: null,
                state_id:9,
                resolve: {
                    TaskMetaData: getAnnotationTask,
                    Definitions : getDefinitions,
                    DefaultHotKeys: getDefaultHotKeys
                }
            });

        Array.prototype.move = function (old_index, new_index) {
            while (old_index < 0) {
                old_index += this.length;
            }
            while (new_index < 0) {
                new_index += this.length;
            }
            if (new_index >= this.length) {
                var k = new_index - this.length;
                while ((k--) + 1) {
                    this.push(undefined);
                }
            }
            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
            return this; // for testing purposes
        };

        function getAnnotationTask(AnnotationTextService,$stateParams,DataService,restrictionsValidatorService,selectionHandlerService) {
            return AnnotationTextService.getAnnotationTask($stateParams.taskId).then(function(taskResponse){
                var layer_id = taskResponse.project.layer.id;

                var curentLayer = taskResponse.project.layer
                var allCategories = curentLayer.categories;

                if(!!curentLayer.parent){
                    // this is how we will know to style this category in derived layer
                    allCategories.forEach(function(cat){return cat.refinedCategory = true})
                }

                while( !!curentLayer.parent ){
                    curentLayer.parent.categories.forEach(function(category){
                        category.fromParentLayer = true
                    })
                    allCategories = allCategories.concat(curentLayer.parent.categories)
                    curentLayer = curentLayer.parent;
                }

                // sort and move the parent category to locat upper then the childrent categories
                if(!!taskResponse.project.layer.parent){
                    allCategories.forEach(function(cat,index){
                        if(!cat.parent){
                            // move the parent categories to be before thr children categories
                            allCategories.move(index,0)
                        }
                    })
                }

                allCategories.forEach(function(category,index){
                    category['callbackFunction'] = 'toggleCategory';
                    if(category.parent && category.parent.id){
                        // move the child category to be after its parent
                        // allCategories.move(index,allCategories.findIndex(cat => cat.id==category.parent.id)+1);
                        allCategories.move(index,allCategories.findIndex(
                            function(cat){ return cat.id==category.parent.id }
                        ) + 1);
                    }
                });

                var relvenatParentsCategories = allCategories.filter(function(cat){
                    return !cat.fromParentLayer && !!cat.parent && !!cat.parent.id
                });

                relvenatParentsCategories.forEach(function(category){
                    // var parentIndex = allCategories.findIndex(cat => cat.id == category.parent.id);
                    var parentIndex = allCategories.findIndex(
                        function(cat){ return cat.id==category.parent.id }
                    );
                    // this is how we will know to add style to this category
                    allCategories[parentIndex]['shouldRefine'] = true
                });
                taskResponse.tokens = replaceEnterWithBr(taskResponse.tokens);
                DataService.currentTask = taskResponse;

                restrictionsValidatorService.initRestrictionsTables(taskResponse.project.layer.restrictions);

                setCategoriesColor(AnnotationTextService,allCategories);
                setCategoriesAbbreviation(AnnotationTextService,allCategories);
                if(DataService.currentTask.annotation_units.length > 0){
                    DataService.categories = allCategories;
                    DataService.createHashTables();
                    DataService.createTokensHashByTokensArrayForPassage(taskResponse.tokens);
                    selectionHandlerService.initTree();
                }
                
                return{
                    Task:taskResponse,
                    Layer: taskResponse.project.layer,
                    Categories: allCategories
                }
            });
        }
        function replaceEnterWithBr(tokensArray){
          tokensArray.forEach(function(token){
              token.text = token.text.replace(/\n/g,'<br>').replace(/\u21b5/g,'<br>');
          });
          return tokensArray;
        }
        function getDefinitions(DefinitionsService) {
            return DefinitionsService.getDefinitions();
        }

        function getDefaultHotKeys(DataService) {
            return DataService.getData('app/resources/annotation/defaultHotKeys.json');
        }

        function setCategoriesColor(AnnotationTextService,categories){
            AnnotationTextService.assignColorsToCategories(categories);
        }
        function setCategoriesAbbreviation(AnnotationTextService,categories){
            AnnotationTextService.assignAbbreviationToCategories(categories);
        }
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.auth', [])
  .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('auth', {
            url: '/auth',
            templateUrl: 'app/pages/auth/auth.html',
            title: 'Login',
            controller: 'authCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 1
            }
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.categories', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('categories', {
            url: '/categories',
            templateUrl: 'app/pages/categories/categories.html',
            title: 'Categories',
            controller: 'categoriesCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-ios-pricetag',
              order: 4,
              showOnSideBar:false
            },
            state_id:4,
            resolve:{
              TableStructure:["categoriesService", function(categoriesService){return categoriesService.getTableStructure()}],
              TableData:["categoriesService", function(categoriesService){return categoriesService.getTableData()}]
            }
          });
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.form', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('form', {
          url: '/form',
          template : '<ui-view></ui-view>',
          abstract: true,
          title: 'Form Elements',
          sidebarMeta: {
            icon: 'ion-compose',
            order: 250,
          },
        })
        .state('form.inputs', {
          url: '/inputs',
          templateUrl: 'app/pages/form/inputs/inputs.html',
          title: 'Form Inputs',
          sidebarMeta: {
            order: 0,
          },
        })
        .state('form.layouts', {
          url: '/layouts',
          templateUrl: 'app/pages/form/layouts/layouts.html',
          title: 'Form Layouts',
          sidebarMeta: {
            order: 100,
          },
        })
        .state('form.wizard',
        {
          url: '/wizard',
          templateUrl: 'app/pages/form/wizard/wizard.html',
          controller: 'WizardCtrl',
          controllerAs: 'vm',
          title: 'Form Wizard',
          sidebarMeta: {
            order: 200,
          },
        });
  }
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit', [
    'zAdmin.pages.edit.users',
    'zAdmin.pages.edit.sources',
    'zAdmin.pages.edit.passages',
    'zAdmin.pages.edit.categories',
    'zAdmin.pages.edit.layers',
    'zAdmin.pages.edit.tasks',
    'zAdmin.pages.edit.projects'

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit', {
            url: '/edit',
            template : '<ui-view></ui-view>',
            abstract: true,
            title: 'Edit',
            controller:'EditCtrl',
            controllerAs:'vmEditCtrl',
            sidebarMeta: false
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.layers', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('layers', {
            url: '/layers',
            templateUrl: 'app/pages/layers/layers.html',
            title: 'Layers',
            controller: 'layersCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-cube',
              order: 5,
              showOnSideBar:false
            },
            state_id:5,
            resolve:{
              TableStructure:["layersService", function(layersService){return layersService.getTableStructure();}],
              TableData:["layersService", function(layersService){
                  return layersService.getTableData();
              }]
            }
          });
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.maps', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('maps', {
          url: '/maps',
          templateUrl: 'app/pages/maps/maps.html',
          abstract: true,
          title: 'Maps',
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 500,
          },
        })
        .state('maps.gmap', {
          url: '/gmap',
          templateUrl: 'app/pages/maps/google-maps/google-maps.html',
          controller: 'GmapPageCtrl',
          title: 'Google Maps',
          sidebarMeta: {
            order: 0,
          },
        })
        .state('maps.leaflet', {
          url: '/leaflet',
          templateUrl: 'app/pages/maps/leaflet/leaflet.html',
          controller: 'LeafletPageCtrl',
          title: 'Leaflet Maps',
          sidebarMeta: {
            order: 100,
          },
        })
        .state('maps.bubble', {
          url: '/bubble',
          templateUrl: 'app/pages/maps/map-bubbles/map-bubbles.html',
          controller: 'MapBubblePageCtrl',
          title: 'Bubble Maps',
          sidebarMeta: {
            order: 200,
          },
        })
        .state('maps.line', {
          url: '/line',
          templateUrl: 'app/pages/maps/map-lines/map-lines.html',
          controller: 'MapLinesPageCtrl',
          title: 'Line Maps',
          sidebarMeta: {
            order: 300,
          },
        });
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.passages', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('passages', {
            url: '/passages',
            templateUrl: 'app/pages/passages/passages.html',
            title: 'Passages',
            controller: 'PassagesCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-clipboard',
              order: 6,
              showOnSideBar:false
            },
            state_id:6,
            resolve:{
              TableStructure:["passagesService", function(passagesService){return passagesService.getTableStructure()}],
              TableData:["passagesService", function(passagesService){return passagesService.getTableData()}]
            }
          });
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.profile', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('profile', {
          url: '/profile',
          title: 'Edit Profile',
          templateUrl: 'app/pages/profile/profile.html',
          controller: 'ProfilePageCtrl',
          controllerAs:'vm',
          resolve:{
            Profile: ["profileService", function(profileService){
              return profileService.getProfileData().then(function(res){
                  return res.data
              });
            }]
          }
        });
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.projectTasks', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('projectTasks', {
            url: '/project/:id/tasks/:layerType',
            templateUrl: 'app/pages/project_tasks/project.tasks.html',
            title: 'Project Tasks',
            controller: 'projectTasksCtrl',
            controllerAs: 'vm',
            sidebarMeta: false,
            state_id: 3,
            resolve:{
              TableStructure:["projectTasksService", function(projectTasksService){return projectTasksService.getTableStructure();}],
              TableData:["projectTasksService", "$stateParams", function(projectTasksService,$stateParams){
                  return projectTasksService.getTableData([{'searchKey':'project','searchValue': $stateParams.id}]);
              }]
            }
          });
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.projects', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('projects', {
                url: '/projects',
                templateUrl: 'app/pages/projects/projects.html',
                title: 'Projects',
                controller: 'ProjectsCtrl',
                controllerAs: 'vm',
                sidebarMeta: {
                    icon: 'ion-document-text',
                    order: 2,
                    showOnSideBar:false
                },
                state_id:2,
                resolve:{
                    TableStructure:["projectsService", function(projectsService){return projectsService.getTableStructure()}],
                    TableData:["projectsService", function(projectsService){return projectsService.getTableData()}]
                }
            });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.reg', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('reg', {
            url: '/reg',
            templateUrl: 'app/pages/reg/reg.html',
            title: 'reg',
            controller: 'regCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 1,
            },
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.sources', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('sources', {
            url: '/sources',
            templateUrl: 'app/pages/sources/sources.html',
            title: 'Sources',
            controller: 'sourcesCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-at',
              order: 7,
              showOnSideBar:false
            },
            state_id:7,
            resolve:{
              TableStructure:["sourcesService", function(sourcesService){return sourcesService.getTableStructure()}],
              TableData:["sourcesService", function(sourcesService){return sourcesService.getTableData()}]
            }
          });
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider", "$urlRouterProvider"];
  angular.module('zAdmin.pages.tables', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('tables', {
          url: '/tables',
          template : '<ui-view></ui-view>',
          abstract: true,
          controller: 'TablesPageCtrl',
          title: 'Tables',
          sidebarMeta: {
            icon: 'ion-grid',
            order: 300,
          },
        }).state('tables.basic', {
          url: '/basic',
          templateUrl: 'app/pages/tables/basic/tables.html',
          title: 'Basic Tables',
          sidebarMeta: {
            order: 0,
          },
        }).state('tables.smart', {
          url: '/smart',
          templateUrl: 'app/pages/tables/smart/tables.html',
          title: 'Smart Tables',
          sidebarMeta: {
            order: 100,
          },
        });
    $urlRouterProvider.when('/tables','/tables/basic');
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.tasks', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('tasks', {
            url: '/tasks',
            templateUrl: 'app/pages/tasks/tasks.html',
            title: 'Tasks',
            controller: 'tasksCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-checkbox-outline',
              order: 3,
              showOnSideBar:false
            },
            state_id: 3,
            resolve:{
              TableStructure:["tasksService", function(tasksService){return tasksService.getTableStructure();}],
              TableData:["tasksService", function(tasksService){return tasksService.getTableData();}]
            }
          });
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.tokenization', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('tokenizationPage', {
            url: '/tokenizationPage/:taskId',
            templateUrl: 'app/pages/tokenization/tokenization-page.html',
            title: 'Tokenization',
            controller: 'TokenizationPageCtrl',
            controllerAs: 'vm',
            sidebarMeta: null,
            state_id:8,
              resolve:{
                  TokenizationTask:["UccaTokenizerService", "$stateParams", function(UccaTokenizerService,$stateParams){
                      return UccaTokenizerService.getTaskData($stateParams.taskId).then(
                          function(res){
                              return res.data;
                          }
                      )
                  }]
              }
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.tokenization-v2', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('tokenizationPage', {
            url: '/tokenizationPage/:taskId',
            templateUrl: 'app/pages/tokenization-v2/tokenization-page.html',
            title: 'Tokenization',
            controller: 'TokenizationPageCtrl',
            // controllerAs: 'vm',
            sidebarMeta: null,
            state_id:8,
            resolve:{
                TokenizationTask:["uccaFactory", "$stateParams", function(uccaFactory,$stateParams){
                    return uccaFactory.getTaskData($stateParams.taskId).then(
                        function(res){
                            return res.data;
                        }
                    )
                }]
            }
          });
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui', [
    'zAdmin.pages.ui.typography',
    'zAdmin.pages.ui.buttons',
    'zAdmin.pages.ui.icons',
    'zAdmin.pages.ui.modals',
    'zAdmin.pages.ui.grid',
    'zAdmin.pages.ui.alerts',
    'zAdmin.pages.ui.progressBars',
    'zAdmin.pages.ui.notifications',
    'zAdmin.pages.ui.tabs',
    'zAdmin.pages.ui.slider',
    'zAdmin.pages.ui.panels'
  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui', {
          url: '/ui',
          template : '<ui-view></ui-view>',
          abstract: true,
          title: 'UI Features',
          sidebarMeta: {
            icon: 'ion-android-laptop',
            order: 200
          },
        });
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.users', [])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('users', {
            url: '/users',
            templateUrl: 'app/pages/users/users.html',
            title: 'Users',
            controller: 'UsersCtrl',
            controllerAs: 'vm',
            sidebarMeta: {
              icon: 'ion-android-person',
              order: 1,
              showOnSideBar:false
            },
            state_id:1,
            data: {
                permissions: {
                    only: "1",
                    redirectTo: 'auth'
                }
            },
            resolve:{
              TableStructure:["usersService", function(usersService){return usersService.getTableStructure()}],
              TableData:["usersService", function(usersService){return usersService.getTableData()}]
            }
          });
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components', []);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.annotation.data", [
        'zAdmin.http'
    ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.annotation.definitions", []);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.annotation.hotKeysManager", []);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.annotation.selectionHandler", [
        'zAdmin.http'
    ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.restrictionsValidator", [

    ]);

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module("zAdmin.annotation.directives", [

    ]);

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
    getData.$inject = ["editCategoriesService", "$stateParams"];
  angular.module('zAdmin.pages.edit.categories', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.categories', {
            url: '/categories/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Categories',
            controller: 'EditCategoriesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:["editCategoriesService", function(editCategoriesService){
                return editCategoriesService.getEditTableStructure()
              }],
              CategoryTableData:getData
            }
          });
    }

    function getData(editCategoriesService,$stateParams){
      editCategoriesService.clearData();
      if($stateParams.id != ""){
        return editCategoriesService.getCategoryData($stateParams.id)
      }
      return null;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit.layers', [
    'zAdmin.pages.edit.layers.root',
    'zAdmin.pages.edit.layers.extension',
    'zAdmin.pages.edit.layers.coarsening',
    'zAdmin.pages.edit.layers.refinement',

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.layers', {
            url: '/layers',
            template : '<ui-view></ui-view>',
            abstract: true,
            title: 'Edit',
            controller:'EditLayerCtrl',
            controllerAs:'vmEditLayerCtrl',
            sidebarMeta: false
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit.layers', [
    'zAdmin.pages.edit.layers.root',
    'zAdmin.pages.edit.layers.extension',
    'zAdmin.pages.edit.layers.coarsening',
    'zAdmin.pages.edit.layers.refinement',

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.layers', {
            url: '/layers',
            template : '<ui-view></ui-view>',
            abstract: true,
            title: 'Edit Layers',
            controller:'EditLayerCtrl',
            controllerAs:'vmEditLayerCtrl',
            sidebarMeta: false
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit.passages', [
    'zAdmin.pages.edit.passages.texts',
    'zAdmin.pages.edit.passages.sources',
    'zAdmin.pages.edit.passages.tasks',
    'zAdmin.pages.edit.passages.projects'
  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.passages', {
            url: '/passages/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Passages',
            controller: 'EditPassagesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:["editPassagesService", function(editPassagesService){return editPassagesService.getEditTableStructure()}],
              PassageTableData:["editPassagesService", "$stateParams", function(editPassagesService,$stateParams){
                if($stateParams.id != ""){
                  return editPassagesService.getPassageData($stateParams.id)
                }
                editPassagesService.clearData();
                return null;
              }]
            }
          });
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit.sources', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.sources', {
            url: '/sources/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Sources',
            controller: 'EditSourcesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:["editSourcesService", function(editSourcesService){
                return editSourcesService.getEditTableStructure()
              }],
              SourceTableData:["editSourcesService", "$stateParams", function(editSourcesService,$stateParams){
                if($stateParams.id != ""){
                  return editSourcesService.getSourceData($stateParams.id)
                }
                editSourcesService.clearData();
                return null;
              }]
            }
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    getData.$inject = ["editProjectsService", "$stateParams"];
    angular.module('zAdmin.pages.edit.projects', [
        'zAdmin.pages.edit.projects.layers'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.projects', {
                url: '/projects/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Projects',
                controller: 'EditProjectsCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editProjectsService", function(editProjectsService){
                        return editProjectsService.getEditTableStructure()
                    }],
                    ProjectTableData:getData
                }
            });
    }

    function getData(editProjectsService,$stateParams){
        if($stateParams.id != ""){
            return editProjectsService.getProjectData($stateParams.id)
        }
        return editProjectsService.clearData();
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks', [
        'zAdmin.pages.edit.tasks.passages',
        'zAdmin.pages.edit.tasks.tokenization',
        'zAdmin.pages.edit.tasks.annotation',
        'zAdmin.pages.edit.tasks.review'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks', {
                url: '/tasks',
                template : '<ui-view></ui-view>',
                title: 'Edit Tasks',
                controller: 'EditTasksCtrl',
                controllerAs: 'vmEditTasksCtrl',
                sidebarMeta: false
            });
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
    getData.$inject = ["editUsersService", "$stateParams"];
  angular.module('zAdmin.pages.edit.users', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.users', {
            url: '/users/:id',
            templateUrl: 'app/pages/edit/edit.html',
            title: 'Edit Users',
            controller: 'EditUsersCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:["editUsersService", function(editUsersService){return editUsersService.getEditTableStructure()}],
              UserTableData:getData
            }
          });
    }

    function getData(editUsersService,$stateParams){
      if($stateParams.id != ""){
        return editUsersService.getUserData($stateParams.id)
      }else{
          editUsersService.clearData();
      }
      return null;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.alerts', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.alerts', {
          url: '/alerts',
          templateUrl: 'app/pages/ui/alerts/alerts.html',
          title: 'Alerts',
          sidebarMeta: {
            order: 500,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.icons', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.icons', {
          url: '/icons',
          templateUrl: 'app/pages/ui/icons/icons.html',
          controller: 'IconsPageCtrl',
          title: 'Icons',
          sidebarMeta: {
            order: 200,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.modals', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.modals', {
          url: '/modals',
          templateUrl: 'app/pages/ui/modals/modals.html',
          controller: 'ModalsPageCtrl',
          controllerAd: 'vm',
          title: 'Modals',
          sidebarMeta: {
            order: 300,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.grid', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.grid', {
          url: '/grid',
          templateUrl: 'app/pages/ui/grid/grid.html',
          title: 'Grid',
          sidebarMeta: {
            order: 400,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.panels', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.panels', {
          url: '/panels',
          templateUrl: 'app/pages/ui/panels/panels.html',
          controller: 'NotificationsPageCtrl',
          title: 'Panels',
          sidebarMeta: {
            order: 1100,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.buttons', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.buttons', {
          url: '/buttons',
          templateUrl: 'app/pages/ui/buttons/buttons.html',
          controller: 'ButtonPageCtrl',
          title: 'Buttons',
          sidebarMeta: {
            order: 100,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.notifications', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.notifications', {
          url: '/notifications',
          templateUrl: 'app/pages/ui/notifications/notifications.html',
          controller: 'NotificationsPageCtrl',
          title: 'Notifications',
          sidebarMeta: {
            order: 700,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.slider', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.slider', {
          url: '/slider',
          templateUrl: 'app/pages/ui/slider/slider.html',
          title: 'Sliders',
          sidebarMeta: {
            order: 1000,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.progressBars', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.progressBars', {
          url: '/progressBars',
          templateUrl: 'app/pages/ui/progressBars/progressBars.html',
          title: 'Progress Bars',
          sidebarMeta: {
            order: 600,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.typography', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.typography', {
          url: '/typography',
          templateUrl: 'app/pages/ui/typography/typography.html',
          title: 'Typography',
          sidebarMeta: {
            order: 0,
          },
        });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.ui.tabs', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.tabs', {
          url: '/tabs',
          templateUrl: 'app/pages/ui/tabs/tabs.html',
          title: 'Tabs & Accordions',
          sidebarMeta: {
            order: 800,
          },
        });
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.coarsening', [
        'zAdmin.pages.edit.layers.coarsening.categories'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.coarsening', {
                url: '/coarsening/{id}',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Coarsening Layer',
                controller: 'EditCoarseningLayerCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editCoarseningLayerService", function(editCoarseningLayerService){
                        return editCoarseningLayerService.getEditTableStructure();
                    }],
                    SourceTableData:["editCoarseningLayerService", "$stateParams", "storageService", function(editCoarseningLayerService,$stateParams,storageService){

                        return editCoarseningLayerService.getLayerData($stateParams.id).then(function(res){

                            var shouldEdit = storageService.getFromLocalStorage("shouldEditLayer");

                            shouldEdit == 'false' ? editCoarseningLayerService.initDataForCoarseningLayer() : '';

                            return editCoarseningLayerService.Data;
                        })
                    }]
                }
            });

    }



})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.refinement', [
        'zAdmin.pages.edit.layers.refinement.categories',
        'zAdmin.pages.edit.layers.refinement.restrictions'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.refinement', {
                url: '/refinement/{id}',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Refinement Layer',
                controller: 'EditRefinementLayerCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editRefinementLayerService", function(editRefinementLayerService){
                        return editRefinementLayerService.getEditTableStructure();
                    }],
                    SourceTableData:["editRefinementLayerService", "$stateParams", "storageService", function(editRefinementLayerService,$stateParams,storageService){

                        return editRefinementLayerService.getLayerData($stateParams.id).then(function(res){

                            var shouldEdit = storageService.getFromLocalStorage("shouldEditLayer");

                            shouldEdit == 'false' ? editRefinementLayerService.initDataForRefinementLayer() : '';

                            return editRefinementLayerService.Data;
                        })
                    }]
                }
            });

    }



})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.extension', [
        'zAdmin.pages.edit.layers.extension.categories',
        'zAdmin.pages.edit.layers.extension.restrictions'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.extension', {
                url: '/extension/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Extension Layers',
                controller: 'EditExtensionLayersCtrl',
                controllerAs: 'vm',
                params:{
                    layerType: null,
                    shouldEdit: false
                },
                resolve:{
                    EditTableStructure:["editExtensionLayerService", function(editExtensionLayerService){
                        return editExtensionLayerService.getEditTableStructure();
                    }],
                    SourceTableData:["editExtensionLayerService", "$stateParams", "storageService", function(editExtensionLayerService,$stateParams,storageService){

                        return editExtensionLayerService.getLayerData($stateParams.id).then(function(res){

                            var shouldEdit = storageService.getFromLocalStorage("shouldEditLayer");

                            shouldEdit == 'false' ? editExtensionLayerService.initDataForExtensionLayer() : '';

                            return editExtensionLayerService.Data;
                        })
                    }]
                }
            });

    }



})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.root', [
        'zAdmin.pages.edit.layers.root.categories',
        'zAdmin.pages.edit.layers.root.restrictions'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.root', {
                url: '/root/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Root Layer',
                controller: 'EditRootLayerCtrl',
                controllerAs: 'vm',
                params:{
                    layerType: null
                },
                resolve:{
                    EditTableStructure:["editRootLayerService", function(editRootLayerService){
                        return editRootLayerService.getEditTableStructure();
                    }],
                    SourceTableData:["editRootLayerService", "$stateParams", function(editRootLayerService,$stateParams){
                        if($stateParams.id != ""){

                            return editRootLayerService.getLayerData($stateParams.id).then(function(res){

                                return editRootLayerService.Data;
                            })

                        }
                        editRootLayerService.clearData();
                        return null;
                    }]
                }
            });



    }



})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.passages.projects', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.passages.projects', {
                url: '/tasks',
                templateUrl: 'app/pages/edit/passages/tasks/edit.passages.tasks.html',
                title: 'Edit Passages',
                controller: 'EditPassagesProjectsCtrl',
                controllerAs: 'vm',
                resolve:{
                    TableStructure:["editPassageProjectsService", function(editPassageProjectsService){
                        return editPassageProjectsService.getTasksTableStructure()
                    }],
                    TableData:["editPassageProjectsService", "$stateParams", function(editPassageProjectsService,$stateParams){
                        return editPassageProjectsService.getTableData($stateParams.id)
                    }]
                }
            });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit.passages.sources', [
      
  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.passages.sources', {
            url: '/sources',
            template: '<ui-view></ui-view>',
            title: 'Edit Passages',
            abstract:true,
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:["editPassageSourcesService", function(editPassageSourcesService){return editPassageSourcesService.getEditTableStructure()}]
            }
          })
          .state('edit.passages.sources.manage', {
            url: '/sources',
            templateUrl: 'app/pages/edit/passages/sources/edit.passages.sources.html',
            title: 'Edit Passages',
            controller: 'EditPassagesSourcesCtrl',
            controllerAs: 'vm',
            resolve:{
              EditTableStructure:["editPassageSourcesService", function(editPassageSourcesService){return editPassageSourcesService.getEditTableStructure()}],
              TableData:["editPassageSourcesService", function(editPassageSourcesService){return editPassageSourcesService.getTableData()}]
            }
          })
          .state('edit.passages.sources.create', {
            url: '/newsources',
            templateUrl: 'app/pages/edit/passages/sources/edit.passages.sources.create.html',
            title: 'Edit Passages',
            controller: 'EditSourcesCtrl',
            controllerAs: 'vm',
            params:{
                from:null
            },
            resolve:{
              EditTableStructure:["editSourcesService", function(editSourcesService){
                return editSourcesService.getEditTableStructure()
              }],
              SourceTableData:["editSourcesService", "$stateParams", function(editSourcesService,$stateParams){
                if($stateParams.id != ""){
                  editSourcesService.getSourceData($stateParams.id);
                }
                editSourcesService.clearData();
                return null;
              }]
            }
          })
          ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.passages.tasks', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.passages.tasks', {
                url: '/tasks',
                templateUrl: 'app/pages/edit/passages/tasks/edit.passages.tasks.html',
                title: 'Edit Passages',
                controller: 'EditPassagesTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    TableStructure:["editPassageTasksService", function(editPassageTasksService){
                        return editPassageTasksService.getTasksTableStructure()
                    }],
                    TableData:["editPassageTasksService", "$stateParams", function(editPassageTasksService,$stateParams){
                        return editPassageTasksService.getTableData($stateParams.id)
                    }]
                }
            });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

    routeConfig.$inject = ["$stateProvider"];
  angular.module('zAdmin.pages.edit.passages.texts', [

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit.passages.texts', {
            url: '/text',
            templateUrl: 'app/pages/edit/passages/texts/edit.passages.texts.html',
            title: 'Edit Passages',
            controller: 'EditPassagesTextsCtrl',
            controllerAs: 'vm',
            resolve:{
              
            }
          });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.projects.layers', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.projects.layers', {
                url: '/layers',
                templateUrl: 'app/pages/edit/projects/layers/edit.projects.layers.html',
                title: 'Edit Projects',
                controller: 'EditProjectsLayersCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editProjectLayerService", function(editProjectLayerService){
                        return editProjectLayerService.getEditTableStructure()
                    }],
                    LayersTableData: ["editProjectLayerService", function(editProjectLayerService){
                        return editProjectLayerService.getLayersTableData()
                    }]
                }
            });
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.annotation', [
        'zAdmin.pages.edit.tasks.annotation.annotator'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.annotation', {
                url: '/annotation/:projectLayerType/:projectId/:parentTaskId/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Annotation Task',
                controller: 'EditAnnotationTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:['$stateParams','editAnnotationTasksService',function($stateParams,editAnnotationTasksService){
                        return editAnnotationTasksService.getEditTableStructure().then(function(res){
                            if(checkIfNeedToShowChooseParentTask($stateParams)){
                                res = setShowInTable(res,"parent",true);      
                            }
                            return res;
                        })
                    }],
                    SourceTableData:["editAnnotationTasksService", "$stateParams", function(editAnnotationTasksService,$stateParams){
                        if($stateParams.id != ""){
                            return editAnnotationTasksService.getTaskData($stateParams.id)
                        }
                        editAnnotationTasksService.clearData();
                        return null;
                    }]
                }
            });
    }

    function checkIfNeedToShowChooseParentTask(params){
        var show = false;
        if(params.projectLayerType != 'ROOT' && params.id == "" && params.parentTaskId == ""){
            show = true;
        }
        return show;
    }

    function setShowInTable(structure,key,val){
        if(!!structure){
            structure.forEach(function(obj){
                if(obj.key == key){
                    obj.showInTable = val;
                }
            })
        }
        return structure
    }


})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.passages', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.passages', {
                url: '/tasks',
                template: '<ui-view></ui-view>',
                title: 'Edit Task Passages',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editTaskPassagesService", function(editTaskPassagesService){
                        return editTaskPassagesService.getEditTableStructure()
                    }],
                    EditTableData:["editTaskPassagesService", function(editTaskPassagesService){
                        return editTaskPassagesService.getTableData()
                    }]
                }
            })
            .state('edit.tasks.passages.manage', {
                url: '/tasks/:id',
                templateUrl: 'app/pages/edit/tasks/passages/edit.tasks.passages.html',
                title: 'Edit Task Passages',
                controller: 'EditTaskPassagesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:["editTaskPassagesService", function(editTaskPassagesService){
                        return editTaskPassagesService.getEditTableStructure();
                    }],
                    PassagesTableData: ["editTaskPassagesService", function(editTaskPassagesService){
                        return editTaskPassagesService.getPassagesTableData();
                    }]
                }
            })
            .state('edit.tasks.passages.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/passages/edit.tasks.passages.create.html',
                title: 'New Passage',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editPassagesService", function(editPassagesService){
                        return editPassagesService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.tokenization', [
        'zAdmin.pages.edit.tasks.tokenization.passages',
        'zAdmin.pages.edit.tasks.tokenization.annotator'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.tokenization', {
                url: '/tokenization/:projectLayerType/:projectId/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Tokenization Task',
                controller: 'EditTokenizationTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editTokenizationTasksService", function(editTokenizationTasksService){
                        return editTokenizationTasksService.getEditTableStructure()
                    }],
                    SourceTableData:["editTokenizationTasksService", "$stateParams", function(editTokenizationTasksService,$stateParams){
                        if($stateParams.id != ""){
                            return editTokenizationTasksService.getTaskData($stateParams.id)
                        }
                        editTokenizationTasksService.clearData();
                        return null;
                    }]
                }
            });
    }


})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.review', [
        'zAdmin.pages.edit.tasks.review.annotator'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.review', {
                url: '/review/:projectLayerType/:projectId/:parentTaskId/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Review Task',
                controller: 'EditReviewTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editReviewTasksService", function(editReviewTasksService){
                        return editReviewTasksService.getEditTableStructure()
                    }],
                    SourceTableData:["editReviewTasksService", "$stateParams", function(editReviewTasksService,$stateParams){
                        if($stateParams.id != ""){
                            return editReviewTasksService.getTaskData($stateParams.id)
                        }
                        editReviewTasksService.clearData();
                        return null;
                    }]
                }
            });
    }


})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.coarsening.categories', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.coarsening.categories', {
                url: '/categories',
                template: '<ui-view></ui-view>',
                title: 'Edit Coarsening Layer',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editCoarseningLayerCategoriesService", function(editCoarseningLayerCategoriesService){
                        return editCoarseningLayerCategoriesService.getEditTableStructure()
                    }],
                    EditTableData:["editCoarseningLayerCategoriesService", function(editCoarseningLayerCategoriesService){
                        return editCoarseningLayerCategoriesService.getTableData()
                    }]
                }
            })
            .state('edit.layers.coarsening.categories.manage', {
                url: '/categories',
                templateUrl: 'app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.html',
                title: 'Edit Coarsening Layer',
                controller: 'EditCoarseningLayerCategoriesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null,
                },
                resolve:{
                    EditTableStructure:["editCoarseningLayerCategoriesService", function(editCoarseningLayerCategoriesService){
                        return editCoarseningLayerCategoriesService.getEditTableStructure()
                    }],
                    parentCategoriesSmartTableData: ["editCoarseningLayerCategoriesService", "storageService", "$stateParams", function(editCoarseningLayerCategoriesService,storageService,$stateParams){
                        var searchTerms = [{'searchKey': 'id', 'searchValue': $stateParams.parentId}];
                        return editCoarseningLayerCategoriesService.getParentCategoriesTableData(searchTerms)
                    }]
                }
            })
            .state('edit.layers.coarsening.categories.create', {
                url: '/newctegories',
                templateUrl: 'app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.create.html',
                title: 'Edit Coarsening Layer',
                controller: 'EditCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editCategoriesService", function(editCategoriesService){
                        return editCategoriesService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.refinement.categories', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.refinement.categories', {
                url: '/categories',
                template: '<ui-view></ui-view>',
                title: 'Edit Refinement Layer',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editRefinementLayerCategoriesService", function(editRefinementLayerCategoriesService){return editRefinementLayerCategoriesService.getEditTableStructure()}],
                    EditTableData:["editRefinementLayerCategoriesService", function(editRefinementLayerCategoriesService){return editRefinementLayerCategoriesService.getTableData()}]
                }
            })
            .state('edit.layers.refinement.categories.manage', {
                url: '/categories',
                templateUrl: 'app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.html',
                title: 'Edit Refinement Layer',
                controller: 'EditRefinementLayerCategoriesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null,
                },
                resolve:{
                    EditTableStructure:["editRefinementLayerCategoriesService", function(editRefinementLayerCategoriesService){
                        return editRefinementLayerCategoriesService.getEditTableStructure()
                    }],
                    parentCategoriesSmartTableData: ["editRefinementLayerCategoriesService", "$stateParams", function(editRefinementLayerCategoriesService,$stateParams){
                        var searchTerms = [{'searchKey': 'id', 'searchValue': $stateParams.parentId}]
                        return editRefinementLayerCategoriesService.getParentCategoriesTableData(searchTerms)
                    }]
                }
            })
            .state('edit.layers.refinement.categories.create', {
                url: '/newctegories',
                templateUrl: 'app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.create.html',
                title: 'Edit Refinement Layer',
                controller: 'EditCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editCategoriesService", function(editCategoriesService){
                        return editCategoriesService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.refinement.restrictions', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.refinement.restrictions', {
                url: '/restrictions/:id',
                templateUrl: 'app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.html',
                title: 'Edit Refinement Layer',
                controller: 'EditRefinementLayerRestrictionsCtrl',
                controllerAs: 'vm',
                params:{
                    chosenItem: null,
                    itemRowIndex: null
                },
                resolve:{
                    EditTableStructure:["editRefinementLayerRestrictionsService", function(editRefinementLayerRestrictionsService){
                        return editRefinementLayerRestrictionsService.getEditTableStructure()
                    }],
                    EditTableData:["editRefinementLayerService", function(editRefinementLayerService){
                        return editRefinementLayerService.get('categories');
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.extension.categories', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.extension.categories', {
                url: '/categories',
                template: '<ui-view></ui-view>',
                title: 'Edit Extension Layers',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editExtensionLayerCategoriesService", function(editExtensionLayerCategoriesService){
                        return editExtensionLayerCategoriesService.getEditTableStructure()
                    }],
                    EditTableData:["editExtensionLayerCategoriesService", function(editExtensionLayerCategoriesService){
                        return editExtensionLayerCategoriesService.getTableData()
                    }]
                }
            })
            .state('edit.layers.extension.categories.manage', {
                url: '/categories',
                templateUrl: 'app/pages/edit/layers/extension/categories/edit.layers.extension.categories.html',
                title: 'Edit Extension Layers',
                controller: 'EditExtensionLayerCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editExtensionLayerCategoriesService", function(editExtensionLayerCategoriesService){
                        return editExtensionLayerCategoriesService.getEditTableStructure()
                    }]
                }
            })
            .state('edit.layers.extension.categories.create', {
                url: '/newctegories',
                templateUrl: 'app/pages/edit/layers/extension/categories/edit.layers.extension.categories.create.html',
                title: 'Edit Extension Layers',
                controller: 'EditCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editCategoriesService", function(editCategoriesService){
                        return editCategoriesService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.extension.restrictions', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.extension.restrictions', {
                url: '/restrictions/:id',
                templateUrl: 'app/pages/edit/layers/extension/restrictions/edit.layers.extension.restrictions.html',
                title: 'Edit Extension Layers',
                controller: 'EditExtensionLayerRestrictionsCtrl',
                controllerAs: 'vm',
                params:{
                    chosenItem: null,
                    itemRowIndex: null
                },
                resolve:{
                    EditTableStructure:["editExtensionLayerRestrictionsService", function(editExtensionLayerRestrictionsService){
                        return editExtensionLayerRestrictionsService.getEditTableStructure()
                    }],
                    EditTableData:["editExtensionLayerService", function(editExtensionLayerService){
                        return editExtensionLayerService.get('categories');
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.root.categories', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.root.categories', {
                url: '/categories',
                template: '<ui-view></ui-view>',
                title: 'Edit Root Layer',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editRootLayerCategoriesService", function(editRootLayerCategoriesService){return editRootLayerCategoriesService.getEditTableStructure()}],
                    EditTableData:["editRootLayerCategoriesService", function(editRootLayerCategoriesService){return editRootLayerCategoriesService.getTableData()}]
                }
            })
            .state('edit.layers.root.categories.manage', {
                url: '/managecategories',
                templateUrl: 'app/pages/edit/layers/root/categories/edit.layers.root.categories.html',
                title: 'Edit Root Layer',
                controller: 'EditRootLayerCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editRootLayerCategoriesService", function(editRootLayerCategoriesService){
                        return editRootLayerCategoriesService.getEditTableStructure()
                    }]
                }
            })
            .state('edit.layers.root.categories.create', {
                url: '/newctegories',
                templateUrl: 'app/pages/edit/layers/root/categories/edit.layers.root.categories.create.html',
                title: 'Edit Root Layer',
                controller: 'EditCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editCategoriesService", function(editCategoriesService){
                        return editCategoriesService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.layers.root.restrictions', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.root.restrictions', {
                url: '/restrictions/:id',
                templateUrl: 'app/pages/edit/layers/root/restrictions/edit.layers.root.restrictions.html',
                title: 'Edit Root Layer',
                controller: 'EditRootLayerRestrictionsCtrl',
                controllerAs: 'vm',
                params:{
                    chosenItem: null,
                    itemRowIndex: null
                },
                resolve:{
                    EditTableStructure:["editRootLayerRestrictionsService", function(editRootLayerRestrictionsService){
                        return editRootLayerRestrictionsService.getEditTableStructure()
                    }],
                    EditTableData:["editRootLayerService", function(editRootLayerService){
                        return editRootLayerService.get('categories');
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.annotation.annotator', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.annotation.annotator', {
                url: '/annotator',
                template: '<ui-view></ui-view>',
                title: 'Edit Annotation Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editAnnotationTaskAnnotatorService", function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getEditTableStructure()
                    }],
                    EditTableData:["editAnnotationTaskAnnotatorService", function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getTableData()
                    }]
                }
            })
            .state('edit.tasks.annotation.annotator.manage', {
                url: '/annotator',
                templateUrl: 'app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.html',
                title: 'Edit Annotation Task',
                controller: 'EditAnnotationTaskAnnotatorCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:["editAnnotationTaskAnnotatorService", function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getEditTableStructure();
                    }],
                    UserTableData: ["editAnnotationTaskAnnotatorService", function(editAnnotationTaskAnnotatorService){
                        return editAnnotationTaskAnnotatorService.getTableData();
                    }]
                }
            })
            .state('edit.tasks.annotation.annotator.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.create.html',
                title: 'Edit Annotation Task',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editPassagesService", function(editPassagesService){
                        return editUserService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.tokenization.annotator', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.tokenization.annotator', {
                url: '/annotator',
                template: '<ui-view></ui-view>',
                title: 'Edit Tokenization Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editTokenizationTaskAnnotatorService", function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getEditTableStructure()
                    }],
                    EditTableData:["editTokenizationTaskAnnotatorService", function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getTableData()
                    }]
                }
            })
            .state('edit.tasks.tokenization.annotator.manage', {
                url: '/annotator',
                templateUrl: 'app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.html',
                title: 'Edit Tokenization Task',
                controller: 'EditTokenizationTaskAnnotatorCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:["editTokenizationTaskAnnotatorService", function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getEditTableStructure();
                    }],
                    UserTableData: ["editTokenizationTaskAnnotatorService", function(editTokenizationTaskAnnotatorService){
                        return editTokenizationTaskAnnotatorService.getTableData();
                    }]
                }
            })
            .state('edit.tasks.tokenization.annotator.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.create.html',
                title: 'Edit Tokenization Task',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editPassagesService", function(editPassagesService){
                        return editUserService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.tokenization.passages', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.tokenization.passages', {
                url: '/tasks/tokenization',
                template: '<ui-view></ui-view>',
                title: 'Edit Tokenization Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editTokenizationTaskPassagesService", function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getEditTableStructure()
                    }],
                    EditTableData:["editTokenizationTaskPassagesService", function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getTableData()
                    }]
                }
            })
            .state('edit.tasks.tokenization.passages.manage', {
                url: '/tasks/tokenization/:id',
                templateUrl: 'app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.html',
                title: 'Edit Tokenization Task',
                controller: 'EditTokenizationTaskPassagesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:["editTokenizationTaskPassagesService", function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getEditTableStructure();
                    }],
                    PassagesTableData: ["editTokenizationTaskPassagesService", function(editTokenizationTaskPassagesService){
                        return editTokenizationTaskPassagesService.getTableData();
                    }]
                }
            })
            .state('edit.tasks.tokenization.passages.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.create.html',
                title: 'Edit Tokenization Task',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editPassagesService", function(editPassagesService){
                        return editPassagesService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    routeConfig.$inject = ["$stateProvider"];
    angular.module('zAdmin.pages.edit.tasks.review.annotator', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.review.annotator', {
                url: '/annotator',
                template: '<ui-view></ui-view>',
                title: 'Edit Review Task',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editReviewTaskAnnotatorService", function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getEditTableStructure()
                    }],
                    EditTableData:["editReviewTaskAnnotatorService", function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getTableData()
                    }]
                }
            })
            .state('edit.tasks.review.annotator.manage', {
                url: '/annotator',
                templateUrl: 'app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.html',
                title: 'Edit Review Task',
                controller: 'EditReviewTaskAnnotatorCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null
                },
                resolve:{
                    EditTableStructure:["editReviewTaskAnnotatorService", function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getEditTableStructure();
                    }],
                    UserTableData: ["editReviewTaskAnnotatorService", function(editReviewTaskAnnotatorService){
                        return editReviewTaskAnnotatorService.getTableData();
                    }]
                }
            })
            .state('edit.tasks.review.annotator.create', {
                url: '/newpassage',
                templateUrl: 'app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.create.html',
                title: 'Edit Review Task',
                controller: 'EditPassagesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:["editPassagesService", function(editPassagesService){
                        return editUserService.getEditTableStructure()
                    }]
                }
            })
        ;
    }

})();
'use strict';

angular.module('zAdmin', [
  'ngAnimate',
  'ui.bootstrap',
  'ui.sortable',
  'ui.router',
  'ngTouch',
  'toastr',
  'smart-table',
  "xeditable",
  'ui.slimscroll',
  'ngJsTree',
  'angular-progress-button-styles',
  'frapontillo.bootstrap-switch',
  'zAdmin.core',
  'zAdmin.theme',
  'zAdmin.pages'
]);

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

	Core.$inject = ["$rootScope", "$uibModal", "$timeout", "PermPermissionStore", "PermRoleStore", "storageService", "toastr"];
  angular.module('zAdmin.core')
      .service('Core', Core);

	/** @ngInject */
	function Core($rootScope,$uibModal,$timeout,PermPermissionStore,PermRoleStore,storageService, toastr) {

		var core = {
			init: init,
			showMore: showMore,
			showMoreWithoutJson: showMoreWithoutJson,
			goNext: goNext,
			search: search,
			removeRow: removeRow,
			extractDataFromStructure: extractDataFromStructure,
			checkForPagePermissions: checkForPagePermissions,
			findItemInArrayById:findItemInArrayById,
			findItemPositionInArrayById:findItemPositionInArrayById,
			tablePageSize: 5,
			user_role: storageService.getObjectFromLocalStorage('user_role') || {"id":"4","Name":"Guest"},
			smartTableCanUseAction:smartTableCanUseAction,
			checkDependenciesKeys: checkDependenciesKeys,
			showNotification: showNotification,
			validate: validate,
			hasValue: hasValue,
			previewTask: previewTask,
			showAlert: showAlert,
			exportAsset: exportAsset,
			initCategoriesStringToArray: initCategoriesStringToArray,
			generateRestrictionObject: generateRestrictionObject,
			parseSmartTableColumnData:parseSmartTableColumnData,
			viewOnlyRuleOk:viewOnlyRuleOk,
			promptAlert:promptAlert
		};
		
		return core;

		function viewOnlyRuleOk(_viewOnlyRule){
		    var isOk = false;
		    var viewOnlyRule = _viewOnlyRule || this;
		    if(viewOnlyRule){
		        switch(viewOnlyRule.validateFunction){
		            case "hasValue":
		                isOk = checkIfHasValueInAssetKey(viewOnlyRule.key)
		                break;
		        }
		    }
		    return isOk;
		}
		
		function checkIfHasValueInAssetKey(assetKey){
			if(core.currentService && core.currentService.Data){
			    if(angular.isArray(core.currentService.Data[assetKey])){
			        return core.currentService.Data[assetKey].length > 0
			    }
			    return !!core.currentService.Data[assetKey] 
			}
			return false;
		}

		function parseSmartTableColumnData(itemRow,value){
			if(itemRow[value['key']]){
				if(angular.isArray(itemRow[value['key']])){
					return itemRow[value['key']].map(function(obj){
						if(obj.name){
							return obj.name+"("+obj.id+")"
						}else if(obj.short_text){
							return obj.short_text+"("+obj.id+")"
						}else{
							return obj.id
						}
					}).toString().split(",").join(", ")
				}else{
					return (itemRow[value['key']].name || itemRow[value['key']].short_text || itemRow[value['key']].id || itemRow[value['key']] )
				}
			}else{
				return "";
			}
		}

		function generateRestrictionObject(categoryOneArray,restrictionType,categoryTwoArray){
		    categoryOneArray = categoryOneArray.map(function(cat){
		        delete cat.description;
		        delete cat.tooltip;
		        return cat;
		    })
		    categoryTwoArray = categoryTwoArray.map(function(cat){
		        delete cat.description;
		        delete cat.tooltip;
		        return cat;
		    })
		    return {
		        categories_1: categoryOneArray,
		        type:restrictionType.key,
		        categories_2: categoryTwoArray
		    }
		}

		function initCategoriesStringToArray(categoriesAsString){
		    return JSON.parse(categoriesAsString.replace(/'/g,'"').replace(/True/g,'true').replace(/False/g,'false').replace(/None/g,'null'))
		}

		function exportAsset(){
			var asset = angular.copy(this.currentService.Data, asset)
			asset.description = fetchDescription(asset.description);
			this.showMore(asset);
		}

		function fetchDescription(desc){
			if(!!desc){
				if(!!$(desc).text()){
					return $(desc).text()
				}else if(!!desc){
					return desc
				}else{
					return "Asset as JSON"
				}
			}
			return "Asset as JSON"
		}

		function smartTableCanUseAction(functionName,onlyForRoles){
		  /*
		    logic wehn to show the button
		  */
		  var permitted = true;
		  if(!!onlyForRoles && onlyForRoles.length){
		    permitted = (onlyForRoles.indexOf(core.user_role.name.toUpperCase()) > -1)
		  }
		  return permitted;
		}

		function goNext(currentPage) {
			var tableScope = angular.element($('div[st-pagination]')).isolateScope();
			if (tableScope.currentPage == tableScope.numPages) {
				var vm = this;
				vm.currentService.getTableData([{'searchKey':'offset','searchValue': vm.smartTableDataSafe.length}]).then(function (res) {
					vm.smartTableDataSafe = vm.smartTableDataSafe.concat(res);
					$timeout(function(){
						tableScope.selectPage(currentPage + 1);
					})
				});
			} else {
				tableScope.selectPage(currentPage + 1);
			}
		};

		function previewTask (obj,index){

		  switch(obj.type){
		    case 'TOKENIZATION':
		      openInNewTab('#/tokenizationPage/'+obj.id)
		      break;
		    default:
		      openInNewTab('#/annotationPage/'+obj.id)
		      break;
		  }
		}

		function openInNewTab(url) {
		  var win = window.open(url, '_blank');
		  win.focus();
		}
		
		function checkForPagePermissions(state_id) {
			return PermPermissionStore.getStore()[state_id.toString()].validationFunction[2](state_id.toString());
		}

		function showMoreWithoutJson(obj, pagelink, size) {
			this.showMore(obj, pagelink, size, true);
		}

		function showMore(obj, pagelink, size, hideJson) {
			var pagelink = angular.isString(pagelink) ? pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html' : 'app/pages/ui/modals/modalTemplates/largeModal.html';
			var size = size || 'lg';
			$uibModal.open({
				animation: true,
				templateUrl: pagelink,
				size: size,
				scope: $rootScope.$new(),
				controller: ["$scope","$sce",function ($scope,$sce) {
					$scope.htmlContent = obj.htmlContent;
					$scope.name = obj.name;
					if(obj.description){
					    $scope.description = $sce.trustAsHtml(obj.description);
					}
					if(!hideJson){
						$scope.jsonString = JSON.stringify(obj);
					}
				}]
			});
		};

		function promptAlert(message) {
			var pagelink = 'app/pages/ui/modals/modalTemplates/dangerModal.html';
			var size = 'md';
			return $uibModal.open({
				animation: true,
				templateUrl: pagelink,
				size: size,
				scope: $rootScope.$new(),
				controller: ["$scope",function ($scope) {
					$scope.message = message
				}]
			});
		}

		function extractDataFromStructure(structure) {
			var result = {};
			for (var i = 0; i < structure.length; i++) {
				if(structure[i].shouldSendToServer != false){
					structure[i].type == "checkbox" ? result[structure[i].key] = !!structure[i].value : result[structure[i].key] = structure[i].value || null;
				}
			}
			return result;
		}

		function searchBy(structure) {
			var searchBy = structure.map(function (structureObj) {
				return {
					"searchKey": structureObj.key,
					"searchValue": typeof structureObj.value == 'object' ? structureObj.value.label : structureObj.type == 'checkbox' ? !!structureObj.value : structureObj.value
				}
			}).filter(function (searchObj) {
				searchObj.searchValue = searchObj.searchValue && searchObj.searchValue.value ? searchObj.searchValue.value : searchObj.searchValue;
				return searchObj.searchValue !== undefined && searchObj.searchValue.toString().length;
			});
			return searchBy;
		}

		function search(structure) {
			console.log("searchBy", searchBy(structure));
			var searchTerms = searchBy(structure);
			$rootScope.$pageFinishedLoading = false;
			core.currentService.getTableData(searchTerms).then(searchSuccess, searchFailed);
		}

		function searchSuccess(res) {
			core.currentCtrl.smartTableDataSafe = res;
			$rootScope.$pageFinishedLoading = true;
			core.currentCtrl.$totalResults = $rootScope.$totalResults;
		}

		function searchFailed(err) {
			console.log("searchFailed err :", err);
			$rootScope.$pageFinishedLoading = true;
		}

		function autoExecute() {
			// call it from controller this way: vm.autoExecute = Core.autoExecute.apply(this,vm.smartTableStructure);
			var vm = this;
			var args = Array.prototype.slice.call(arguments);
			args.filter(function (item, index) {
				if (item.autoExecute) {
					console.log("item", item);
					vm[item.functionName]();
				}
			})
		}

		function removeRow(obj,index){
			var vm = this;
			console.log("removeRow "+index,obj);
			vm.currentService.delete(obj.id).then(removeSuccess.bind(obj),removeFailed);
		}

		function removeSuccess(res) {
			core.currentCtrl.removeRowWithObj = this;
			// core.currentCtrl.smartTableDataSafe.splice(core.currentCtrl.removeRowIndex, 1);
			core.currentCtrl.smartTableDataSafe = core.currentCtrl.smartTableDataSafe.filter(function(obj){
				return obj.id != core.currentCtrl.removeRowWithObj.id
			})
			delete core.currentCtrl.removeRowWithObj;
			core.showNotification('success','Remove Success');
		}

		function removeFailed(err) {
			console.log('removeFailed',err);
		}

		function findItemInArrayById(idToLookFor,arrayToLookIn){
			var searchResults = arrayToLookIn.filter(function(obj){
				if(obj.id == idToLookFor){
					return obj;
				}
			});
			return searchResults.length == 0;
		}

		function findItemPositionInArrayById(idToLookFor,arrayToLookIn){
			var result = -1;
			for(var i=0; i<arrayToLookIn.length; i++){
				if(idToLookFor == arrayToLookIn[i].id){
					result = i;
				}
			}
			return result;
		}

		function setTableVisibleFields(vm,TableStructure){
		  for(var i=0; i<TableStructure.length; i++){
		    TableStructure[i].showInTable ? vm.tableVisibleFields[TableStructure[i].key] = true : vm.tableVisibleFields[TableStructure[i].key] = false;
		  }
		}

		function checkDependenciesKeys(dependenciesKeys,smartTableStructure){
			var result = -1;
			dependenciesKeys.forEach(function(object,index){
				smartTableStructure.forEach(function(tableRow){
					if(tableRow.key == object.key && tableRow.value == ""){
						result = index;
					}
				});
			});
			return result;
		}

		function showNotification(notificationType,textToShow){
			var titles = {
				error:'Pay Attention!!!',
				success: 'Well Done'
			};
			toastr[notificationType](textToShow, titles[notificationType], {
                    "autoDismiss": false,
                    "positionClass": "toast-top-right",
                    "type": notificationType,
                    "timeOut": "5000",
                    "extendedTimeOut": "2000",
                    "allowHtml": false,
                    "closeButton": false,
                    "tapToDismiss": true,
                    "progressBar": false,
                    "newestOnTop": true,
                    "maxOpened": 0,
                    "preventDuplicates": false,
                    "preventOpenDuplicates": false
                })
		}

		function showAlert(message) {
		    $uibModal.open({
		        animation: true,
		        templateUrl: 'app/pages/annotation/templates/errorModal.html',
		        size: 'sm',
		        controller: ["$scope", function($scope){
		            $scope.message = message;
		        }]
		    });
		};

		function validate(structureToValidate){
			var _core = this;
			var result = true;
			structureToValidate.forEach(function(rowElement){
				if(!!rowElement.validationRule && rowElement.validationRule.type == "Require" && rowElement.value == ""){
					_core.showNotification('error',"Field "+rowElement.name+" is required.");
					result = false;
				}
			});
			return result;
		}

		function hasValue(obj){
			if(obj == ""){
				return false;
			}
			return true;
		}

		function init(vm, smartTableStructure, currentService) {
			storageService.deleteFromLocalStorage("shouldEditLayer");
			if (!!vm) {

				if (!!smartTableStructure) {

					vm.smartTableStructure = smartTableStructure;

					vm.smartTableStructure.filter(function (item, index) {
						if (item.autoExecute) {
							console.log("excecute item", item);
							vm[item.functionName]();
						}
					});
				}

				vm.currentService = currentService;
				
				core.currentService = currentService;
				core.currentCtrl = vm;

			    vm.tableVisibleFields = {};

				vm.showMore = core.showMore;
				
				vm.viewOnlyRuleOk = core.viewOnlyRuleOk;

				vm.showMoreWithoutJson = core.showMoreWithoutJson;

				vm.parseSmartTableColumnData = core.parseSmartTableColumnData;
				
				vm.removeRow = core.removeRow;

				vm.goNext = core.goNext;
				
				vm.search = core.search;
				
				vm.exportAsset = core.exportAsset;

				vm.smartTablePageSize = core.tablePageSize;

				vm.smartTableDataSafe = [].concat(vm.smartTableData)
				
				vm.$totalResults = $rootScope.$totalResults;
				
				vm.smartTableCanUseAction = core.smartTableCanUseAction

				setTableVisibleFields(vm, smartTableStructure);
			}
			return vm;
		}
	}

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.const')
	.constant('ENV_CONST', {
		IS_DEV:false,
		TEST_URL:"http://private-daea0-ucca.apiary-mock.com/api/v1",
		PROD_URL:"http://localhost:8000/api/v1",
		LOCAL_RESOURCES: "app/resources",
		TASK_TYPE:{
			ANNOTATION:"ANNOTATION",
			TOKENIZATION:"TOKENIZATION",
			REVIEW:"REVIEW"
		},
		TASK_STATUS:{
			NOT_STARTED:"NOT_STARTED",
			ONGOING:"ONGOING", 
			SUBMITTED:"SUBMITTED", 
			REJECTED:"REJECTED"
		},
		TASK_STATUS_ID:{
			NOT_STARTED:1,
			ONGOING:2, 
			SUBMITTED:3, 
			REJECTED:4
		},
		ANNOTATION_TYPE:{
			IMPLICIT:"IMPLICIT",
			REGULAR:"REGULAR"
		},
		ROLE:{
			ADMIN:{
				name:"Admin",
				id:1,
				TABS: ["1","2","3","4","5","6","7","8","9"]
			},
			PROJECT_MANAGER:{
				name:"Project Manager",
				id:2,
				TABS: ["2","3","4","5","6","7","8","9"]
			},
			ANNOTATOR:{
				name:"Annotator",
				id:3,
				TABS: ["2","3"]
			},
			GUEST:{
				name:"Guest",
				id:4,
				TABS: ["2","3","4","5"]
			}
		},
		RESTRICTIONS_TYPE:[
			{
				key:'REQUIRE_SIBLING',
				name: 'require sibling',
				value: 1
			},
			{
				key:'REQUIRE_CHILD',
				name: 'require child',
				value: 2
			},
			{
				key:'FORBID_SIBLING',
				name: 'forbid sibling',
				value: 3
			},
			{
				key:'FORBID_CHILD',
				name: 'forbid child',
				value: 4
			},
			{
				key:'FORBID_ANY_CHILD',
				name: 'forbid any child',
				value: 5
			}
		],
		LAYER_TYPE:{
			ROOT:"ROOT",
			EXTENSION:"EXTENSION", 
			COARSENING:"COARSENING", 
			REFINEMENT:"REFINEMENT"
		},
		ANNOTATION_GUI_STATUS:{
			OPEN:"OPEN",
			HIDDEN:"HIDDEN",
			COLLAPSE:"COLLAPSE"
		},
		TABS_ID:["1","2","3","4","5","6","7","8","9"],
		NOTIFICATIONS:{
			USER_CREATED: "User Created.",
			GENERAL_ERROR: "Something went wrong. Please try again later."
		},
		CATEGORIES_COLORS:[
			{color: "white", backgroundColor: "#444267"},
			{color: "white", backgroundColor: "#0c9640"},
			{color: "white", backgroundColor: "#AACC55"},
			{color: "white", backgroundColor: "#db3937"},
			{color: "white", backgroundColor: "#9302d9"},
			{color: "white", backgroundColor: "#ef86af"},
			{color: "white", backgroundColor: "#ff7b23"},
			{color: "white", backgroundColor: "#3f32fe"},
			{color: "white", backgroundColor: "#cb9d02"},
			{color: "white", backgroundColor: "#935754"},
			{color: "white", backgroundColor: "#4099b7"},
			{color: "black", backgroundColor: "#66CDAA"},
			{color: "white", backgroundColor: "#DC143C"}
		],
		NAV_BAR_ITEMS:[
			{
				id:1,
				name:"Finish All",
				tooltip:"Alt+a: Finish All",
				executeFunction:"finishAll"
			},
			{
				id:2,
				name:"Save",
				tooltip:"Alt+s: Save",
				executeFunction:"saveTask"
			},
			{
				id:3,
				name:"Submit",
				tooltip:"Alt+b: Submit (unit will be considered completed)",
				executeFunction:"submitTask"
			},
			{
				id:4,
				name:"Reset",
				tooltip:"Alt+x: Reset annotation",
				executeFunction:"resetAllAnnotations"
			},
			/*{
				id:5,
				name:"Help",
				tooltip:"?: Help",
				executeFunction:"help"
			},
			{
				id:6,
				name:"Settings",
				tooltip:"Alt+t: Settings",
				executeFunction:"openSettings"
			},*/
			{
				id:7,
				name:"Main Menu",
				tooltip:"Alt+m: Go To Main Menu",
				executeFunction:"goToMainMenu"
			}
		],
		PASSAGE_TYPE:{
			'PRIVATE' : {
				id:1,
				label:'PRIVATE'
			},
			'PUBLIC' : {
				id:2,
				label:'PUBLIC'
			}
		}

	});

})();



/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  config.$inject = ["baConfigProvider", "colorHelper"];
  angular.module('zAdmin.theme')
    .config(config);

  /** @ngInject */
  function config(baConfigProvider, colorHelper) {
    //baConfigProvider.changeTheme({z: true});
    //
    //baConfigProvider.changeColors({
    //  default: 'rgba(#000000, 0.2)',
    //  defaultText: '#ffffff',
    //  dashboard: {
    //    white: '#ffffff',
    //  },
    //});
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  configProvider.$inject = ["colorHelper"];
  var basic = {
    default: '#ffffff',
    defaultText: '#666666',
    border: '#dddddd',
    borderDark: '#aaaaaa',
  };

  // main functional color scheme
  var colorScheme = {
    primary: '#209e91',
    info: '#2dacd1',
    success: '#90b900',
    warning: '#dfb81c',
    danger: '#e85656',
  };

  // dashboard colors for charts
  var dashboardColors = {
    blueStone: '#005562',
    surfieGreen: '#0e8174',
    silverTree: '#6eba8c',
    gossip: '#b9f2a1',
    white: '#10c4b5',
  };

  angular.module('zAdmin.theme')
    .provider('baConfig', configProvider);

  /** @ngInject */
  function configProvider(colorHelper) {
    var conf = {
      theme: {
        z: false,
      },
      colors: {
        default: basic.default,
        defaultText: basic.defaultText,
        border: basic.border,
        borderDark: basic.borderDark,

        primary: colorScheme.primary,
        info: colorScheme.info,
        success: colorScheme.success,
        warning: colorScheme.warning,
        danger: colorScheme.danger,

        primaryLight: colorHelper.tint(colorScheme.primary, 30),
        infoLight: colorHelper.tint(colorScheme.info, 30),
        successLight: colorHelper.tint(colorScheme.success, 30),
        warningLight: colorHelper.tint(colorScheme.warning, 30),
        dangerLight: colorHelper.tint(colorScheme.danger, 30),

        primaryDark: colorHelper.shade(colorScheme.primary, 15),
        infoDark: colorHelper.shade(colorScheme.info, 15),
        successDark: colorHelper.shade(colorScheme.success, 15),
        warningDark: colorHelper.shade(colorScheme.warning, 15),
        dangerDark: colorHelper.shade(colorScheme.danger, 15),

        dashboard: {
          blueStone: dashboardColors.blueStone,
          surfieGreen: dashboardColors.surfieGreen,
          silverTree: dashboardColors.silverTree,
          gossip: dashboardColors.gossip,
          white: dashboardColors.white,
        },
      }
    };

    conf.changeTheme = function(theme) {
      angular.merge(conf.theme, theme)
    };

    conf.changeColors = function(colors) {
      angular.merge(conf.colors, colors)
    };

    conf.$get = function () {
      delete conf.$get;
      return conf;
    };
    return conf;
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  var IMAGES_ROOT = 'assets/img/';

  angular.module('zAdmin.theme')
    .constant('layoutSizes', {
      resWidthCollapseSidebar: 1200,
      resWidthHideSidebar: 500
    })
    .constant('layoutPaths', {
      images: {
        root: IMAGES_ROOT,
        profile: IMAGES_ROOT + 'app/profile/',
        amMap: 'assets/img/theme/vendor/ammap//dist/ammap/images/',
        amChart: 'assets/img/theme/vendor/amcharts/dist/amcharts/images/'
      }
    })
    .constant('colorHelper', {
      tint: function(color, weight) {
        return mix('#ffffff', color, weight);
      },
      shade: function(color, weight) {
        return mix('#000000', color, weight);
      },
    });

  function shade(color, weight) {
    return mix('#000000', color, weight);
  }

  function tint(color, weight) {
    return mix('#ffffff', color, weight);
  }

  //SASS mix function
  function mix(color1, color2, weight) {
    // convert a decimal value to hex
    function d2h(d) {
      return d.toString(16);
    }
    // convert a hex value to decimal
    function h2d(h) {
      return parseInt(h, 16);
    }

    var result = "#";
    for(var i = 1; i < 7; i += 2) {
      var color1Part = h2d(color1.substr(i, 2));
      var color2Part = h2d(color2.substr(i, 2));
      var resultPart = d2h(Math.floor(color2Part + (color1Part - color2Part) * (weight / 100.0)));
      result += ('0' + resultPart).slice(-2);
    }
    return result;
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  themeRun.$inject = ["$timeout", "$rootScope", "layoutPaths", "preloader", "$q", "baSidebarService", "themeLayoutSettings", "apiService"];
  angular.module('zAdmin.theme')
    .run(themeRun);

  /** @ngInject */
  function themeRun($timeout, $rootScope, layoutPaths, preloader, $q, baSidebarService, themeLayoutSettings, apiService) {
    var whatToWait = [
      preloader.loadAmCharts(),
      // apiService.fetchData()
    ];

    var theme = themeLayoutSettings;
    if (theme.z) {
      if (theme.mobile) {
        whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'z-bg-mobile.jpg'));
      } else {
        whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'z-bg.jpg'));
        whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'z-bg-zred.jpg'));
      }
    }

    $q.all(whatToWait).then(function(){
      $rootScope.$pageFinishedLoading = true;
    });

    $timeout(function(){
      if (!$rootScope.$pageFinishedLoading) {
        $rootScope.$pageFinishedLoading = true;
      }
    }, 7000);

    $rootScope.$baSidebarService = baSidebarService;
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  themeLayoutSettings.$inject = ["baConfig"];
  angular.module('zAdmin.theme')
    .service('themeLayoutSettings', themeLayoutSettings);

  /** @ngInject */
  function themeLayoutSettings(baConfig) {
    var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|windows phone/).test(navigator.userAgent.toLowerCase());
    var mobileClass = isMobile ? 'mobile' : '';
    var zClass = baConfig.theme.z ? 'z-theme' : '';
    angular.element(document.body).addClass(mobileClass).addClass(zClass);

    return {
      z: baConfig.theme.z,
      mobile: isMobile,
    }
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    PermissionsService.$inject = ["$q", "PermPermissionStore", "PermRoleStore", "ENV_CONST", "Core"];
    angular.module('zAdmin.permissions')
        .service('PermissionsService', PermissionsService);

    /** @ngInject */
    function PermissionsService($q,PermPermissionStore,PermRoleStore,ENV_CONST,Core) {
        var service = {
            setPermissions: function(user_role){
                return  $q(function(resolve, reject) {
                    if (setUserPermissions(user_role,ENV_CONST)) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                });
            },
            init:init
        };

        init();

        function init(){
            for(var i=0; i<ENV_CONST.TABS_ID.length; i++){
                PermPermissionStore.definePermission(ENV_CONST.TABS_ID[i],function(permissionName){
                    return ENV_CONST.ROLE[Core.user_role.name.toUpperCase()].TABS.includes(permissionName)
                });
            }
            setUserPermissions(Core.user_role.id);
        }

        function setUserPermissions(user_role){
            switch(user_role){
                case ENV_CONST.ROLE.ADMIN.id:{
                    PermRoleStore.defineRole('ADMIN',ENV_CONST.TABS_ID,function(){return true});
                    return true;
                }
                case ENV_CONST.ROLE.GUEST.id:{
                    PermRoleStore.defineRole('GUEST',ENV_CONST.TABS_ID,function(){return true});
                    return true;
                }
                case ENV_CONST.ROLE.PROJECT_MANAGER.id:{
                    PermRoleStore.defineRole('PROJECT_MANAGER',function(){return true});
                    return true;
                }
                case ENV_CONST.ROLE.ANNOTATOR.id:{
                    PermRoleStore.defineRole('ANNOTATOR',function(){return true});
                    return true;
                }

            }
            return true;
        }

        return service;
    }



})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

	httpService.$inject = ["$http", "$q", "$timeout", "$rootScope", "$location", "ENV_CONST", "Core", "storageService", "$state"];
  angular.module('zAdmin.http',[
  	'zAdmin.const',
  	])
	.service('httpService', httpService);

	/** @ngInject */
	function httpService($http,$q,$timeout,$rootScope,$location,ENV_CONST,Core,storageService,$state) {
		
		var is_dev = ($location.host() === 'localhost') || ENV_CONST.IS_DEV;
		var url = (is_dev && ENV_CONST.IS_DEV ) ? ENV_CONST.TEST_URL : ENV_CONST.PROD_URL;

		/*var is_prod_server = ($location.absUrl().indexOf($rootScope.PROD_CONST.HOST) > -1);
		if(is_prod_server){
			// for ucca production server
			url = $rootScope.PROD_CONST.API_ENDPOINT;
		}*/

		function SuccessResults (successResult) {
			var response = {
				code:1,
				message:"Success",
				data:successResult.data
			}
			if(successResult.data){
				$rootScope.$totalResults = successResult.data.count;
			}
			return response;
		}

		function ErrorResults (errorResult) {
			var response = {
				code:999,
				message:"Failed",
				data:errorResult
			}
			var type= {
				"-1": "error",
				"400" : "error",
				"401" :	"info",
				"403" :	"info",
				"404" : "error",
				"415" :	"error",
				"429" :	"error",
				"500" : "warning",
				"502" : "warning",
				"503" : "warning"
			}
			$rootScope.$pageFinishedLoading = true;
			Core.showNotification(type[errorResult.status],errorResult.statusText+":\n"+fetchError(errorResult))
			redirectToLoginOnTokenExpired(errorResult)
			throw errorResult;
		}

		function fetchError(errorResult){
			var res = "";
			if(!!errorResult && !!errorResult.data){
				if(Array.isArray(errorResult.data)){
					res = errorResult.data[0]
				}else if(typeof errorResult.data == "object"){
					if(!!Object.keys(errorResult.data)[0]){
						var moreInfo = "";
						switch(Object.keys(errorResult.data)[0]){
							case 'detail':
								moreInfo = "";
								break;
							case 'non_field_errors':
								moreInfo = "";
								break;
							default:
								moreInfo = ": "+Object.keys(errorResult.data)[0];
								break;
						}
						res = errorResult.data[Object.keys(errorResult.data)[0]] + moreInfo
					}
				}
			}
			return res;
		}

		function redirectToLoginOnTokenExpired(errorResult){
			if(errorResult && errorResult.data && errorResult.data.detail == "Invalid token."){
				storageService.clearLocalStorage()
				$state.go('auth',{reload:true})
			}
		}

		function httpRequest(requestType, requestStringName, bodyData, notFromCache, fromResources) {

			if($rootScope.PROD_CONST){
				var requestURL = buildRequestURL(requestType, requestStringName, bodyData, notFromCache, fromResources)
				return requestType(requestURL, bodyData, {cache: !notFromCache}).then(
					SuccessResults,ErrorResults
				);
			}else{
				return $http.get('settings.json').then(function(settings){
					$rootScope.PROD_CONST = settings.data;
					
					addGoogleAnalyticsSupport($rootScope.PROD_CONST.GOOGLE_ANALYTICS_ID);

					var requestURL = buildRequestURL(requestType, requestStringName, bodyData, notFromCache, fromResources)
					return requestType(requestURL, bodyData, {cache: !notFromCache}).then(
						SuccessResults,ErrorResults
					);
				})
			}

		}

		function addGoogleAnalyticsSupport(accountId){
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', accountId, 'auto');
		}

		function buildRequestURL(requestType, requestStringName, bodyData, notFromCache, fromResources){
			var is_prod_server = ($location.absUrl().indexOf($rootScope.PROD_CONST.HOST) > -1);
			if(is_prod_server){
				// for ucca production server
				url = $rootScope.PROD_CONST.API_ENDPOINT;
			}

			var requestURL = url + '/'+ requestStringName;

			if(fromResources){
				requestURL = requestStringName;
			}
			
			if(requestType===$http.get){
				if(bodyData && Object.keys(bodyData).length){
					var bodyDataJson = bodyData;
					Object.keys(bodyData).forEach(function(object,index){
						requestURL += index==0 ? '?' : '&';
						requestURL += bodyData[object]['searchKey']+'='+ bodyData[object]['searchValue'];
					})
				}
			}
			if(requestType===$http.delete){
				requestURL += bodyData;
			}
			return requestURL
		}

		function getHeaders(){
			var headers = {"Content-Type": "application/json"}
			var UserInfo = storageService.getObjectFromLocalStorage('UserInfo');
			if(!!UserInfo && !!UserInfo.token){
				headers = {
				    "Content-Type": "application/json",
				    "Authorization": "Token " + UserInfo.token
				}
			}
			return headers
		}
		var handler = {
		  getRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.get = getHeaders();
		    return httpRequest($http.get, requestStringName,  bodyData, notFromCache, fromResources);
		  },
		  postRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.post = getHeaders();
		    return httpRequest($http.post, requestStringName,  bodyData, notFromCache, fromResources);
		  },
		  putRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.put = getHeaders();
		    return httpRequest($http.put, requestStringName,  bodyData, notFromCache, fromResources);
		  },
		  deleteRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.delete = getHeaders();
		    return httpRequest($http.delete, requestStringName,  bodyData, notFromCache, fromResources);
		  }
		}
		return handler;
	};

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
	'use strict';

	apiService.$inject = ["$rootScope", "$http", "$q", "$timeout", "httpService", "storageService", "Core"];
	angular.module('zAdmin.api')
		.service('apiService', apiService);

	/** @ngInject */
	function apiService($rootScope,$http,$q,$timeout,httpService,storageService,Core) {
		var api = {
			isLoggedIn: function(){
				return storageService.getFromLocalStorage('isLoggedIn');
			},
			logout: function(){
				return httpService.postRequest('logout').then(function(res){
					return res
				}).then(function(){
					storageService.clearLocalStorage();
				},function(){
					storageService.clearLocalStorage();
				});
			},
			login: function(doLogin){
				return httpService.postRequest('login',doLogin).then(function(res){
					if(!res.data.error){
						storageService.saveObjectInLocalStorage('UserInfo',res.data)
						return res;
					}else{
						$rootScope.$pageFinishedLoading = true;
						Core.showNotification('info',res.data.error)
						throw res.data.error
					}
				});
			},
			registerNewUser: function(new_user_object){
				return httpService.postRequest('signup/',new_user_object);
			},
			forgotPassword: function(email){
				return httpService.postRequest('forgot_password',email);
			},
			tokenization:{
				getTaskData: function(task_id){
					return httpService.getRequest('user_tasks/'+task_id);
				},
				getPassageData: function(passage_id){
					return httpService.getRequest('passages',passage_id);
				},
				putTaskData: function(mode,taskData){
					return httpService.putRequest('user_tasks/'+taskData.id+'/'+mode,taskData);
				}
			},
			annotation:{
				getTaskData: function(task_id){
					return httpService.getRequest('user_tasks/'+task_id);
				},
				putTaskData: function(mode,taskData){
					return httpService.putRequest('user_tasks/'+taskData.id+'/'+mode,taskData);
				},
				getCategories: function(){
					return httpService.getRequest('categories');
				},
				getProjectLayer:function(layer_id){
					return httpService.getRequest('layers/'+layer_id);
				}
			},
			profile:{
				getProfileData: function(){
					var user_id = storageService.getObjectFromLocalStorage("UserInfo").profile.id;
					return httpService.getRequest('users/'+user_id);
				},
				putProfileData: function(profileDetails){
					return httpService.putRequest('users/'+profileDetails.id+'/',profileDetails);
				},
				postUserPassword: function(passwordDetails){
					return httpService.postRequest('change_password',passwordDetails);
				}
			},
			users: {
				getUserTableStructure: function(){
					return httpService.getRequest('app/pages/users/users.table.structure.json',{},true,true);
				},
				getUsersTableData: function(searchTerms){
					return httpService.getRequest('users',searchTerms);
				},
				deleteUser: function(user_id){
					return httpService.deleteRequest('users/',user_id);
				}
			},
			projects: {
				getProjectTableStructure: function(){
					return httpService.getRequest('app/pages/projects/projects.table.structure.json',{},true,true);
				},
				getProjectsTableData: function(searchTerms){
					return httpService.getRequest('projects',searchTerms);
				},
				deleteProject: function(project_id){
					return httpService.deleteRequest('projects/',project_id);
				}
			},
			sources: {
				getSourceTableStructure: function(){
					return httpService.getRequest('app/pages/sources/sources.table.structure.json',{},true,true);
				},
				getSourcesTableData: function(searchTerms){
					return httpService.getRequest('sources',searchTerms);
				},
				deleteSource: function(source_id){
					return httpService.deleteRequest('sources/',source_id);
				}
			},
			layers: {
				getLayersTableStructure: function(){
					return httpService.getRequest('app/pages/layers/layers.table.structure.json',{},true,true);
				},
				getLayersTableData: function(searchTerms){
					return httpService.getRequest('layers',searchTerms);
				},
				deleteLayer: function(layer_id){
					return httpService.deleteRequest('layers/',layer_id);
				}
			},
			tasks: {
				getTasksTableStructure: function(){
					return httpService.getRequest('app/pages/tasks/tasks.table.structure.json',{},true,true);
				},
				getTasksTableData: function(searchTerms){
					return httpService.getRequest('tasks',searchTerms);
				},
				deleteTask: function(task_id){
					return httpService.deleteRequest('tasks/',task_id);
				}
			},
			categories: {
				getTableStructure: function(){
					return httpService.getRequest('app/pages/categories/categories.structure.json',{},true,true);
				},
				getCategoriesTableData: function(searchTerms){
					return httpService.getRequest('categories',searchTerms);
				},
				deleteCategory: function(source_id){
					return httpService.deleteRequest('categories/',source_id);
				}
			},
			passages: {
				getPassageTableStructure: function(){
					return httpService.getRequest('app/pages/passages/passages.table.structure.json',{},true,true);
				},
				getPassagesTableData: function(searchTerms){
					return httpService.getRequest('passages',searchTerms);
				},
				deletePassage: function(passage_id){
					return httpService.deleteRequest('passages/',passage_id);
				}
			},
			edit: {
				users:{
					getEditUserTableStructure: function(){
						return httpService.getRequest('app/pages/edit/users/edit.users.structure.json',{},true,true);
					},
					getUserData: function(user_id){
						return httpService.getRequest('users/'+user_id);
					},
					putUserData: function(user_details){
						return httpService.putRequest('users/'+user_details.id+'/',user_details);
					},
					postUserData: function(user_details){
						return httpService.postRequest('users/',user_details);
					}
				},
				projects:{
					getEditProjectTableStructure: function(){
						return httpService.getRequest('app/pages/edit/projects/edit.projects.structure.json',{},true,true);
					},
					getProjectData: function(project_id){
						return httpService.getRequest('projects/'+project_id);
					},
					putProjectData: function(project_details){
						return httpService.putRequest('projects/'+project_details.id+'/',project_details);
					},
					postProjectData: function(project_details){
						return httpService.postRequest('projects/',project_details);
					},
					layer: {
						getTableStructure: function () {
							return httpService.getRequest('app/pages/edit/projects/layers/edit.projects.layers.structure.json', {}, true, true);
						},
						getSelectTableStructure: function () {
							return httpService.getRequest('app/pages/edit/projects/layers/edit.projects.layers.select.structure.json', {}, true, true);
						},
						getLayersTableData: function(){
							return httpService.getRequest('layers/');
						}
					},
					tasks: {
						getTableStructure: function () {
							return httpService.getRequest('app/pages/project_tasks/project.tasks.table.structure.json', {}, true, true);
						},
						getSelectTableStructure: function () {
							return httpService.getRequest('app/pages/project_tasks/project.tasks.structure.json', {}, true, true);
						},
						getTasksTableData: function(project_id){
							return httpService.getRequest('tasks/',project_id);
						}
					}
				},
				categories:{
					getEditCategoryTableStructure: function(){
						return httpService.getRequest('app/pages/edit/categories/edit.categories.structure.json', {}, true, true);
					},
					getCategoryData: function(category_id){
						return httpService.getRequest('categories/'+category_id);
					},
					putCategoryData: function(category_details){
						return httpService.putRequest('categories/'+category_details.id+'/',category_details);
					},
					postCategoryData: function(category_details){
						return httpService.postRequest('categories/',category_details);
					}
				},
				sources:{
					getEditSourceTableStructure: function(){
						return httpService.getRequest('app/pages/edit/sources/edit.sources.structure.json',{},true,true);
					},
					getSourceData: function(source_id){
						return httpService.getRequest('sources/'+source_id);
					},
					putSourceData: function(source_details){
						return httpService.putRequest('sources/'+source_details.id+'/',source_details);
					},
					postSourceData: function(source_details){
						return httpService.postRequest('sources/',source_details);
					}
				},
				layers:{
					extension:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('app/pages/edit/layers/extension/edit.layers.extension.structure.json',{},true,true);
						},
						getCoarseningLayerTableStructure: function(){
							return httpService.getRequest('app/pages/edit/layers/extension/coarsening.table.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/extension/categories/edit.layers.extension.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/extension/categories/edit.layers.extension.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/extension/extension/edit.layers.extension.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/extension/restrictions/edit.layers.extension.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/extension/categories/edit.layers.extension.categories.select.structure.json',{},true,true);
							}
						}
					},
					coarsening:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('app/pages/edit/layers/coarsening/edit.layers.coarsening.table.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							},
							getParentCategoriesTableData:function(searchTerms){
								return httpService.getRequest('layers',searchTerms);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/coarsening/restrictions/edit.layers.coarsening.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/coarsening/restrictions/edit.layers.coarsening.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/categories/edit.layers.coarsening.categories.select.structure.json',{},true,true);
							}
						}
					},
					refinement:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('app/pages/edit/layers/refinement/edit.layers.refinement.table.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							},
							getParentCategoriesTableData:function(searchTerms){
								return httpService.getRequest('layers',searchTerms);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/categories/edit.layers.refinement.categories.select.structure.json',{},true,true);
							}
						}
					},
					root:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('app/pages/edit/layers/root/edit.layers.root.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/root/edit.layers.root.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/root/categories/edit.layers.root.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/root/edit.layers.root.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/root/restrictions/edit.layers.root.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('app/pages/edit/layers/categories/edit.layers.categories.select.structure.json',{},true,true);
							}
						}
					}
				},
				tasks:{
					getReviewTaskEditTableStructure: function(){
						return httpService.getRequest('app/pages/edit/tasks/edit.tasks.review.structure.json',{},true,true);
					},
					getTaskData: function(task_id){
						return httpService.getRequest('tasks/'+task_id);
					},
					putTaskData: function(task_details){
						return httpService.putRequest('tasks/'+task_details.id+'/',task_details);
					},
					postTaskData: function(task_details){
						return httpService.postRequest('tasks/',task_details);
					},
					passages:{
						getPassagesTableStructure: function(){
							return httpService.getRequest('app/pages/edit/tasks/passages/edit.tasks.passages.table.structure.json',{},true,true);
						}
					},
					tokenization:{
						getTokenizationTaskEditTableStructure: function(){
							return httpService.getRequest('app/pages/edit/tasks/tokenization/edit.tasks.tokenization.structure.json',{},true,true);
						},
						annotator: {
							getAnnotatorsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.table.structure.json',{},true,true);
							}
						},
						passages:{
							getPassagesTableStructure: function(){
								return httpService.getRequest('app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.table.structure.json',{},true,true);
							}
						},
					},
					annotation:{
						getAnnotationTaskEditTableStructure: function(){
							return httpService.getRequest('app/pages/edit/tasks/annotation/edit.tasks.annotation.structure.json',{},true,true);
						},
						annotator: {
							getAnnotatorsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.table.structure.json',{},true,true);
							}
						}
					},
					review:{
						getReviewTaskEditTableStructure: function(){
							return httpService.getRequest('app/pages/edit/tasks/review/edit.tasks.review.structure.json',{},true,true);
						},
						annotator: {
							getAnnotatorsTableStructure: function(){
								return httpService.getRequest('app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.table.structure.json',{},true,true);
							}
						}
					}
				},
				passages:{
					getEditPassageTableStructure: function(){
						return httpService.getRequest('app/pages/edit/passages/edit.passages.structure.json',{},true,true);
					},
					getPassageData: function(passage_id){
						return httpService.getRequest('passages/'+passage_id);
					},
					putPassageData: function(passage_details){
						return httpService.putRequest('passages/'+passage_details.id+'/',passage_details);
					},
					postPassageData: function(passage_details){
						return httpService.postRequest('passages/',passage_details);
					},
					sources:{
						getSourceTableStructure: function(){
							return httpService.getRequest('app/pages/edit/passages/sources/edit.passages.sources.structure.json',{},true,true);
						},
						getEditSourceTableStructure: function(){
							return httpService.getRequest('app/pages/edit/passages/sources/edit.passages.sources.structure.json',{},true,true);
						},
						getSourceTableData: function(searchTerms){
							return httpService.getRequest('sources',searchTerms);
						}
					},
					tasks:{
						getTasksTableStructure: function(){
							return httpService.getRequest('app/pages/edit/passages/tasks/edit.passages.tasks.structure.json', {}, true, true);
						},
						getTasksTableData: function(passage_id){
							return httpService.getRequest('passages/'+passage_id+'/tasks');
						}
					},
					projects:{
						getTasksTableStructure: function(){
							return httpService.getRequest('app/pages/edit/passages/projects/edit.passages.projects.structure.json', {}, true, true);
						},
						getTasksTableData: function(passage_id){
							return httpService.getRequest('passages/'+passage_id+'/projects');
						}
					}
				}
			}
		}
		return api;
	}

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.storage')
	.service('storageService', storageService);

	/** @ngInject */
	function storageService() {

		var storage = {
		    
		    saveInLocalStorage: function(key,value){
		      localStorage.setItem(key, value);
		    },
		    deleteFromLocalStorage: function(key){
		      localStorage.removeItem(key);
		    },
		    getFromLocalStorage: function(key){
		      return localStorage.getItem(key);
		    },
		    saveObjectInLocalStorage: function(key, value){
		      localStorage.setItem(key, JSON.stringify(value));
		    },
		    getObjectFromLocalStorage: function(key){
		    	try{
		    		return JSON.parse(localStorage.getItem(key));
		    	}catch(e){
		    		console.error(e);
		    		return {};
		    	}
		    },
		    clearLocalStorage: function(){
		      localStorage.clear();
		    }
		}

		return storage;
	}

})();

(function() {
    'use strict';

    AnnotationTextService.$inject = ["apiService", "ENV_CONST", "$rootScope", "DataService"];
    angular.module('zAdmin.pages.annotation')
        .factory('AnnotationTextService',AnnotationTextService);

    var annotationTextUrl = "app/resources/annotation/annotationText.json";

    /**
     * A service that retrievs the text to be annotated.
     * @param $http
     * @returns {{getAnnotationText: getAnnotationText}} - an object containing the service variables and methods.
     */

    /** @ngInject */
    function AnnotationTextService(apiService, ENV_CONST,$rootScope,DataService) {
        var textService = {
            getAnnotationTask: getAnnotationTask,
            getProjectLayer:getProjectLayer,
            assignColorsToCategories: assignColorsToCategories,
            assignAbbreviationToCategories: assignAbbreviationToCategories,
            toggleAnnotationUnitView: toggleAnnotationUnitView,
            isRTL: isRTL,
        };

        return textService;

        /**
         * Retrieves an article.
         * @returns {*}
         */
        function getAnnotationTask(task_id){
            return apiService.annotation.getTaskData(task_id).then(function(response){return response.data});
        }

        function getProjectLayer(layer_id){
            return apiService.annotation.getProjectLayer(layer_id).then(function(response){return response.data});
        }
        
        function assignAbbreviationToCategories(categories){
            var categoriesHash = {}
            categories.forEach(function(category){
                if(categoriesHash[category.abbreviation]){
                    categoriesHash[category.abbreviation].category.abbreviation += (categoriesHash[category.abbreviation].times)
                    categoriesHash[category.abbreviation].times += 1;
                    category.abbreviation += (categoriesHash[category.abbreviation].times)
                }else{
                    categoriesHash[category.abbreviation] = {
                        "category" : category,
                        "times" : 1
                    }
                }
            })
        }
        
        function assignColorsToCategories(categories){
            categories.forEach(function(category, index){
                category.color = ENV_CONST.CATEGORIES_COLORS[index % ENV_CONST.CATEGORIES_COLORS.length].color
                category.backgroundColor = ENV_CONST.CATEGORIES_COLORS[index % ENV_CONST.CATEGORIES_COLORS.length].backgroundColor
            })
        }

        function toggleAnnotationGuiStatus(plusMinusElem){
            if ($(plusMinusElem).hasClass('minus-round')) {
                return ENV_CONST.ANNOTATION_GUI_STATUS.COLLAPSE
            }else{
                return ENV_CONST.ANNOTATION_GUI_STATUS.OPEN
            }
        }

        function toggleAnnotationUnitView(element){

            var elem = element.toElement ? element.toElement : element;

            $rootScope.focusUnit($(elem).closest('.categorized-word').find('.directive-info-data-container').first())
            
            
            var currentTarget =element.currentTarget;
            var annotationUnitContainer = $(currentTarget).next().find('.categorized-word');

            DataService.getUnitById($rootScope.clckedLine).gui_status = toggleAnnotationGuiStatus($($(currentTarget).find('i')))
            
        }

        function isRTL(s){           
            var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
                rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
                rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');
            return rtlDirCheck.test(s);
        };

    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  AnnotationPageCtrl.$inject = ["DefaultHotKeys", "TaskMetaData", "AnnotationTextService", "DataService", "$rootScope", "$scope", "hotkeys", "HotKeysManager", "Definitions", "ENV_CONST", "Core", "restrictionsValidatorService", "$timeout", "$state", "selectionHandlerService"];
  angular.module('zAdmin.pages.annotation')
      .controller('AnnotationPageCtrl', AnnotationPageCtrl);

  /** @ngInject */
  function AnnotationPageCtrl(DefaultHotKeys,TaskMetaData,AnnotationTextService,DataService,$rootScope,$scope,hotkeys,HotKeysManager, Definitions, ENV_CONST, Core, restrictionsValidatorService,$timeout,$state, selectionHandlerService) {
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
      vm.saveTask = saveTask;
      vm.setFontSize = setFontSize;
      vm.submitTask = submitTask;
      vm.finishAll = finishAll;
      vm.goToMainMenu = goToMainMenu;
      vm.resetAllAnnotations = resetAllAnnotations;

      vm.fontSizes = [
          {preview:"AAA",name:"big",size:1},
          {preview:"AA",name:"normal",size:0.9},
          {preview:"A",name:"small",size:0.8}
      ];

      init();



      function init(){

          $scope.$on('InsertSuccess', function(event, args) {
              if(args.dataBlock.id === 0 ){
                  vm.dataTree.AnnotationUnits = args.dataBlock.AnnotationUnits;
              }else{
              }
          });

          $scope.$on('ResetSuccess', function(event, args) {
              bindCategoriesHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService);
              bindReceivedDefaultHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService && !hotkeys.fromParentLayer);
          });

          $timeout(function(){$rootScope.$hideSideBar = true;});
          bindCategoriesHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService);
          bindReceivedDefaultHotKeys(hotkeys,$scope,$rootScope,vm,HotKeysManager,DataService && !hotkeys.fromParentLayer);
      }

      function setFontSize(fontSize){
          $('.main-body').css({'font-size':fontSize.size+'em'})
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
            var selectionList = selectionHandlerService.getSelectedTokenList();
            if(selectionList.length){
                selectionHandlerService.toggleCategory();
            }
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
                              selectionHandlerService[functionToExecute](categoryObj);
                          }
                      });

                  HotKeysManager.addHotKey('shift+'+categoryObj.shortcut_key);
                  hotkeys.bindTo(scope)
                      .add({
                          combo: 'shift+'+categoryObj.shortcut_key,
                          description: 'Remote category '+categoryObj.name,
                          action: 'keydown',
                          callback: function() {
                              var functionToExecute = HotKeysManager.executeOperation(categoryObj);
                              // vm.keyController[0]['addAsRemoteUnit'](categoryObj);
                          }
                      });
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
                      callback: function(e) {
                          HotKeysManager.updatePressedHotKeys(hotKeyObj,false);
                          e.preventDefault()
                      }
                  })
                  .add({
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
              hotkeys.bindTo(scope)
                  .add({
                      combo: hotKeyObj.combo,
                      description: hotKeyObj.description,
                      action: hotKeyObj.action,
                      callback: function(e) {
                          var functionToExecute = HotKeysManager.executeOperation(hotKeyObj);
                          var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                          switch(functionToExecute){
                              case 'moveRight':{
                                  DataService.getUnitById(selectedUnitId).cursorLocation++;

                                  $rootScope.$broadcast("moveRight",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveRightWithShift':{
                                  DataService.getUnitById(selectedUnitId).cursorLocation++;
                                  $rootScope.$broadcast("moveRight",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveRightWithCtrl':{
                                  DataService.getUnitById(selectedUnitId).cursorLocation++;
                                  $rootScope.$broadcast("moveRight",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveLeft':{
                                  DataService.getUnitById(selectedUnitId).cursorLocation--;
                                  $rootScope.$broadcast("moveLeft",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveLeftWithShift':{
                                  DataService.getUnitById(selectedUnitId).cursorLocation--;
                                  $rootScope.$broadcast("moveLeft",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveLeftWithCtrl':{
                                  DataService.getUnitById(selectedUnitId).cursorLocation--;
                                  $rootScope.$broadcast("moveLeft",{unitId: selectedUnitId,unitCursorPosition: DataService.getUnitById(selectedUnitId).cursorLocation});
                                  break;
                              }
                              case 'moveDown':{
                                  if(selectedUnitId.length === 1 && parseInt(selectedUnitId) >= DataService.tree.AnnotationUnits.length){
                                      break;
                                  }
                                  var nextUnit = DataService.getNextUnit(selectedUnitId);
                                  var nextSibling = DataService.getSibling(selectedUnitId);
                                  if(nextSibling){
                                      selectionHandlerService.updateSelectedUnit(nextSibling.annotation_unit_tree_id);
                                      DataService.getUnitById(nextSibling.annotation_unit_tree_id).gui_status = "OPEN";
                                  }else{
                                      if(nextUnit){
                                          selectionHandlerService.updateSelectedUnit(nextUnit);
                                          DataService.getUnitById(nextUnit).gui_status = "OPEN";
                                      }
                                  }
                                  break;
                              }
                              case 'moveUp':{
                                  var splitedID = selectedUnitId.split("-");
                                  if(splitedID.length > 1 && splitedID[splitedID.length-1] === "1"){
                                      var parentId = DataService.getParentUnitId(selectedUnitId);
                                      selectionHandlerService.updateSelectedUnit(parentId);
                                      DataService.getUnitById(parentId).gui_status = "OPEN";
                                      break;
                                  }
                                  if(selectedUnitId === "1"){
                                      selectionHandlerService.updateSelectedUnit("0");
                                      break;
                                  }
                                  var prevUnit = DataService.getPrevUnit(selectedUnitId);
                                  var prevSibling = DataService.getPrevSibling(selectedUnitId);

                                  if(prevSibling === null){
                                      selectionHandlerService.updateSelectedUnit(prevUnit.annotation_unit_tree_id);
                                      prevUnit.gui_status = "OPEN";
                                      break;
                                  }
                                  if(prevSibling.annotation_unit_tree_id.length > prevUnit.annotation_unit_tree_id.length){
                                      selectionHandlerService.updateSelectedUnit(prevSibling.annotation_unit_tree_id);
                                      DataService.getUnitById(prevSibling.annotation_unit_tree_id).gui_status = "OPEN";
                                  }else{
                                      if(prevUnit){
                                          selectionHandlerService.updateSelectedUnit(prevUnit.annotation_unit_tree_id);
                                          DataService.getUnitById(prevUnit.annotation_unit_tree_id).gui_status = "OPEN";
                                      }else{
                                          if(prevSibling){
                                              selectionHandlerService.updateSelectedUnit(prevSibling.annotation_unit_tree_id);
                                              DataService.getUnitById(prevSibling.annotation_unit_tree_id).gui_status = "OPEN";
                                          }
                                      }
                                  }
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


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  authService.$inject = ["$rootScope", "apiService"];
  angular.module('zAdmin.pages.auth')
      .service('authService', authService);

  /** @ngInject */
  function authService($rootScope,apiService) {
  	var service = {
        isLoggedIn: JSON.parse(apiService.isLoggedIn()),
        doLogin: function (loginDetails) {
          return apiService.login(loginDetails).then(function(res){return res.data});
        },
        logout: function(){
          return apiService.logout().then(function(res){
            $rootScope.$connected = false;
            return res
          },function(){
            $rootScope.$connected = false;
            return res
          });
        },
        forgotPassword: function(email){
          return apiService.forgotPassword(email);
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  authCtrl.$inject = ["$scope", "$rootScope", "$state", "$filter", "editableOptions", "editableThemes", "authService", "storageService", "PermissionsService", "Core", "$timeout"];
  angular.module('zAdmin.pages.auth')
      .controller('authCtrl', authCtrl);

  /** @ngInject */
  function authCtrl($scope, $rootScope, $state, $filter, editableOptions, editableThemes, authService, storageService, PermissionsService,Core,$timeout) {
  	var vm = this;
    $rootScope.$hideSideBar = true;
    vm.loginDetails = {
      "password": null,
      "email":null
    };

  	vm.login = login;
    vm.forgotPassword = forgotPassword;

    function forgotPassword(){
      if(vm.loginDetails.email.$valid){
        var postEmail = {
          'email':vm.loginDetails.email.$viewValue
        }
        authService.forgotPassword(postEmail).then(resendPasswordSuccess,resendPasswordFailed)
      }
    }

    function resendPasswordSuccess(res){
      if(!res.data.error){
        console.log("resend password success:", res.data.msg)
        Core.showNotification("success",res.data.msg)
      }else{
        Core.showNotification("error",res.data.error)
      }
    }

    function resendPasswordFailed(err){
      console.log("resend password error :", err)
    }

  	function login(){
      if( vm.loginDetails.$valid ) {
        $rootScope.$pageFinishedLoading = false;
        var postData =  {
          email    : vm.loginDetails.email.$viewValue,
          password : vm.loginDetails.password.$viewValue
        }
        authService.doLogin(postData).then(loginSuccess,loginFailed)
      }
  	}

    function loginSuccess(res){
      storageService.saveInLocalStorage('isLoggedIn',true);
      $rootScope.$connected = true;
      Core.user_role = res.profile.role;
      storageService.saveObjectInLocalStorage('user_role',Core.user_role);
      PermissionsService.setPermissions(res.profile.role.id).then(function(){
        $timeout(function(){$rootScope.$hideSideBar = false;}) 
        $state.go('tasks');
      });
    }

    function loginFailed(err){
      console.log("login failed error :", err);
      // $rootScope.$connected = true;
    }


  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  categoriesService.$inject = ["apiService"];
  angular.module('zAdmin.pages.categories')
      .service('categoriesService', categoriesService);

  /** @ngInject */
  function categoriesService(apiService) {
    /*apiService.categories.getCategoriesTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.categories.getTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(category_id){
          return apiService.categories.deleteCategory(category_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
          return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
            angular.copy(res.data.results, service.tableData);
            return service.tableData;
          });
        }
    };
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  categoriesCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "categoriesService", "TableStructure", "Core", "TableData"];
  angular.module('zAdmin.pages.categories')
      .controller('categoriesCtrl', categoriesCtrl);

  /** @ngInject */
  function categoriesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, categoriesService, TableStructure, Core, TableData) {

    var vm = this;
    vm.searchTable = $state.current.name;

    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,categoriesService);

    vm.editRow = editRow;

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.categories',{id:obj.id})
    }

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editService.$inject = ["apiService"];
  angular.module('zAdmin.pages.edit')
      .service('editService', editService);

  /** @ngInject */
  function editService(apiService) {
    var service = {
        
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal"];
  angular.module('zAdmin.pages.edit')
      .controller('EditCtrl', EditCtrl);

  /** @ngInject */
  function EditCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal) {
  	var vm = this;
  	vm.back = back;
    vm.addNewAssetMode = !!!$state.params.id;
    vm.editAssetMode = !!$state.params.id;
    
    function back(){
      history.back();
    }

  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  layersService.$inject = ["apiService"];
  angular.module('zAdmin.pages.layers')
      .service('layersService', layersService);

  /** @ngInject */
  function layersService(apiService) {
    /*apiService.layers.getLayersTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.layers.getLayersTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(layer_id){
            return apiService.layers.deleteLayer(layer_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.layers.getLayersTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    };
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  layersCtrl.$inject = ["$state", "layersService", "TableStructure", "Core", "TableData", "storageService"];
  angular.module('zAdmin.pages.layers')
      .controller('layersCtrl', layersCtrl);

  /** @ngInject */
  function layersCtrl($state, layersService, TableStructure, Core, TableData, storageService) {

    var vm = this;
    vm.smartTableData = TableData;

    Core.init(vm,TableStructure,layersService);


    vm.editRow = editRow;
    vm.createExtensionLayer = createExtensionLayer;
    vm.createCoarseningLayer = createCoarseningLayer;
    vm.createRefinementLayer = createRefinementLayer;

    function editRow (obj,index){
      console.log("editRow " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",true);
      $state.go('edit.layers.'+obj.type.toLowerCase(),{id:obj.id, shouldEdit: true})
    }

    function createExtensionLayer(obj,index){
      console.log("editRow extension " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",false);
      $state.go('edit.layers.extension',{id:obj.id})
    }

    function createCoarseningLayer(obj,index){
      console.log("editRow coarsening " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",false);
      $state.go('edit.layers.coarsening',{id:obj.id})
    }

    function createRefinementLayer(obj,index){
      console.log("editRow refinement " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",false);
      $state.go('edit.layers.refinement',{id:obj.id})
    }

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  passagesService.$inject = ["apiService"];
  angular.module('zAdmin.pages.passages')
      .service('passagesService', passagesService);

  /** @ngInject */
  function passagesService(apiService) {
    /*apiService.passages.getPassagesTableData().then(function (res){
      service.tableData = res.data.results
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.passages.getPassageTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(passage_id){
            return apiService.passages.deletePassage(passage_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.passages.getPassagesTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    };
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  PassagesCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "passagesService", "TableStructure", "Core", "TableData"];
  angular.module('zAdmin.pages.passages')
      .controller('PassagesCtrl', PassagesCtrl);

  /** @ngInject */
  function PassagesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, passagesService, TableStructure, Core,TableData) {
  	
      var vm = this;
      vm.smartTableData = TableData;
      Core.init(vm,TableStructure,passagesService);

      vm.editRow = editRow;

      function editRow (obj,index){
        console.log("editRow",obj);
        $state.go('edit.passages',{id:obj.id})
      }

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  ProfileModalCtrl.$inject = ["$scope", "$uibModalInstance"];
  angular.module('zAdmin.pages.profile')
    .controller('ProfileModalCtrl', ProfileModalCtrl);

  /** @ngInject */
  function ProfileModalCtrl($scope, $uibModalInstance) {
    $scope.link = '';
    $scope.ok = function () {
      $uibModalInstance.close($scope.link);
    };
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  ProfilePageCtrl.$inject = ["$scope", "fileReader", "$filter", "$uibModal", "profileService", "Profile", "Core"];
  angular.module('zAdmin.pages.profile')
    .controller('ProfilePageCtrl', ProfilePageCtrl);

  /** @ngInject */
  function ProfilePageCtrl($scope, fileReader, $filter, $uibModal, profileService, Profile, Core) {
    var vm = this;
    vm.profileDetails = Profile;
    vm.passwordDetails = {
      // old_password: null,
      new_password:'',
      new_password_again:''
    };

    vm.saveProfileData = saveProfileData;
    vm.updatePassword = updatePassword;
    vm.cancle = cancle;
    vm.arePersonalInfoPasswordsEqual = arePersonalInfoPasswordsEqual;



    function arePersonalInfoPasswordsEqual () {
      return !!vm.passwordDetails.new_password_again && vm.passwordDetails.new_password == vm.passwordDetails.new_password_again;
    };

    function cancle(){
      // window.history.back();
    }

    function saveProfileData(){
      profileService.saveProfileData(vm.profileDetails).then(saveProfileSuccess,saveProfileFailed)
    }

    function updatePassword(){
      vm.newPassEquals = vm.arePersonalInfoPasswordsEqual()
      if(vm.passwordDetails.$valid && vm.newPassEquals ){
        var newPasswordDetails = vm.passwordDetails;
        var postPasswords = {
          "new_password1":vm.passwordDetails.new_password, 
          "new_password2":vm.passwordDetails.new_password_again
        }
        profileService.updatePassword(postPasswords).then(savePasswordSuccess,saveProfileFailed)
      }

    }

    function savePasswordSuccess(res){
      Core.showNotification('success','Update Success')
    }
    function saveProfileSuccess(res){
      vm.profileDetails = res.data;
      Core.showNotification('success','Update Success')
    }

    function saveProfileFailed(err){
      console.log("saveFailed", err);
    }
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  ProfileService.$inject = ["apiService"];
  angular.module('zAdmin.pages.profile')
      .service('profileService', ProfileService);

  /** @ngInject */
  function ProfileService(apiService) {
    var service = {
        UserProfile:[],
        getProfileData: function(){
          return apiService.profile.getProfileData();
        },
        saveProfileData: function(profileDetails){
          return apiService.profile.putProfileData(profileDetails);
        },
        updatePassword: function(passwordDetails){
          return apiService.profile.postUserPassword(passwordDetails);
        }

    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  projectTasksService.$inject = ["apiService"];
  angular.module('zAdmin.pages.projectTasks')
      .service('projectTasksService', projectTasksService);

  /** @ngInject */
  function projectTasksService(apiService) {
    // apiService.tasks.getTasksTableData().then(function (res){
    //   angular.copy(res.data, service.tableData);
    // });
    var service = {
        tableData:[],
        projectLayerType: "",
        getTableStructure: function(){
          return apiService.edit.projects.tasks.getTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(task_id){
            return apiService.tasks.deleteTask(task_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            var _service = this;
            return apiService.edit.projects.tasks.getTasksTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, _service.tableData);
                _service.projectLayerType = res.data.project_layer_type;
                return _service.tableData;
            });
        },
        getProjectLayerType: function(){
          return service.projectLayerType;
      }
    };
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  projectTasksCtrl.$inject = ["$scope", "$state", "projectTasksService", "TableStructure", "Core", "TableData", "ENV_CONST"];
  angular.module('zAdmin.pages.projectTasks')
      .controller('projectTasksCtrl', projectTasksCtrl);

  /** @ngInject */
  function projectTasksCtrl($scope, $state, projectTasksService, TableStructure, Core, TableData, ENV_CONST) {

    var vm = this;
    vm.searchTable = $state.current.name;
    vm.smartTableData = TableData;
    // vm.createNewTask = createNewTask;
    vm.createNewAnnotatoinTask = createNewAnnotatoinTask;
    vm.createNewReviewTask = createNewReviewTask;
    Core.init(vm,TableStructure,projectTasksService);
    vm.smartTableCanUseAction = smartTableCanUseAction;

    vm.editRow = editRow;
    vm.previewTask = Core.previewTask;
    vm.projectId =  $state.params.id;
    vm.currentProject = {};
    
    vm.projectRootLayerType = !!$state.params.layerType && ($state.params.layerType.toUpperCase() == ENV_CONST.LAYER_TYPE.ROOT);
    vm.projectDerivedLayerType = !!$state.params.layerType && ($state.params.layerType.toUpperCase() != ENV_CONST.LAYER_TYPE.ROOT);

    
    vm.smartTableStructure.forEach(function(obj){
      if(obj.key=='project'){
        obj.value = $state.params.id;
        if(TableData[0] && TableData[0]['project'] ){
          vm.currentProject = TableData[0]['project'];
        }
      }
    })
    
    function editRow (obj,index){
      console.log("editRow",obj);
      if(obj.id){
        $state.go('edit.tasks.'+obj.type.toLowerCase(),{
          id:obj.id,
          projectLayerType:$state.params.layerType.toUpperCase(),
          projectId:$state.params.id,
          parentTaskId:obj.id
        })
      }else{
        // its the top bottun of "create tokenization/annotation task". tableRow must have an id...
        // $state.go('edit.tasks.tokenization',{
        $state.go('edit.tasks.'+(vm.projectRootLayerType ? 'tokenization' : 'annotation'),{
          projectLayerType:$state.params.layerType.toUpperCase(),
          projectId:$state.params.id,
        })
      }

    }

    function smartTableCanUseAction(functionName,onlyForRoles,objType,onlyForTypes,statusPerms){
      /*
        logic wehn to show the button
      */
      var permitted = true;
      if(!!onlyForRoles && onlyForRoles.length){
        permitted = (onlyForRoles.indexOf(Core.user_role.name.toUpperCase()) > -1)
      }
      if(permitted && !!onlyForTypes && onlyForTypes.length && !!objType){
        permitted = (onlyForTypes.indexOf(objType) > -1)
      }
      if(permitted && !!statusPerms && !!statusPerms.accepteds && !!statusPerms.accepteds.length){
        permitted = (statusPerms.accepteds.indexOf(statusPerms.status) > -1)
      }
      return permitted;
    }

    function createNewAnnotatoinTask(obj,index){
      $state.go('edit.tasks.annotation',{
        projectLayerType:$state.params.layerType.toUpperCase(),
        projectId:$state.params.id,
        parentTaskId:obj.id
      })
    }

    function createNewReviewTask(obj,index){
      $state.go('edit.tasks.review',{
        projectLayerType:$state.params.layerType.toUpperCase(),
        projectId:$state.params.id,
        parentTaskId:obj.id
      })
    }



  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    projectsService.$inject = ["apiService"];
    angular.module('zAdmin.pages.projects')
        .service('projectsService', projectsService);

    /** @ngInject */
    function projectsService(apiService) {
        /*apiService.projects.getProjectsTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });*/
        var service = {
            tableData:[],
            getTableStructure: function(){
                return apiService.projects.getProjectTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            delete: function(id){
                return apiService.projects.deleteProject(id).then(function (res){return res.data});
            },
            getTableData: function(searchTerms){
                return apiService.projects.getProjectsTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            }
        };
        return service;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    ProjectsCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "projectsService", "TableStructure", "Core", "TableData"];
    angular.module('zAdmin.pages.projects')
        .controller('ProjectsCtrl', ProjectsCtrl);

    /** @ngInject */
    function ProjectsCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, projectsService, TableStructure, Core,TableData) {

        var vm = this;
        vm.smartTableData = TableData;
        Core.init(vm,TableStructure,projectsService);

        vm.editRow = editRow;
        vm.myTasks = myTasks;

        function myTasks (obj,index){
            console.log("editRow",obj);
            $state.go('projectTasks',{id:obj.id,layerType:obj.layer.type})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.projects',{id:obj.id})
        }

    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  regCtrl.$inject = ["$scope", "$rootScope", "$state", "$filter", "editableOptions", "editableThemes", "regService", "storageService"];
  angular.module('zAdmin.pages.reg')
      .controller('regCtrl', regCtrl);

  /** @ngInject */
  function regCtrl($scope, $rootScope, $state, $filter, editableOptions, editableThemes, regService, storageService) {
  	var vm = this;
    vm.GuestUserDetailes = {};
  	vm.register = register;

  	function register(){
      regService.registerNewUser(vm.GuestUserDetailes).then(registerSuccess,resterFailed)
  	}

    function registerSuccess(res){
      $state.go('auth');
    }

    function resterFailed(err){
      console.log("register failed error :", err)
    }
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  regService.$inject = ["apiService"];
  angular.module('zAdmin.pages.reg')
      .service('regService', regService);

  /** @ngInject */
  function regService(apiService) {
  	var service = {
        registerNewUser: function(newUserDetails){
          return apiService.registerNewUser(newUserDetails);
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  sourcesService.$inject = ["apiService"];
  angular.module('zAdmin.pages.sources')
      .service('sourcesService', sourcesService);

  /** @ngInject */
  function sourcesService(apiService) {
    /*apiService.sources.getSourcesTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.sources.getSourceTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(source_id){
            return apiService.sources.deleteSource(source_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.sources.getSourcesTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  sourcesCtrl.$inject = ["$state", "sourcesService", "TableStructure", "Core", "TableData"];
  angular.module('zAdmin.pages.sources')
      .controller('sourcesCtrl', sourcesCtrl);

  /** @ngInject */
  function sourcesCtrl($state, sourcesService, TableStructure, Core, TableData) {

    var vm = this;
    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,sourcesService);

    vm.editRow = editRow;

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.sources',{id:obj.id})
    }


  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  TablesPageCtrl.$inject = ["$scope", "$filter", "editableOptions", "editableThemes"];
  angular.module('zAdmin.pages.tables')
      .controller('TablesPageCtrl', TablesPageCtrl);

  /** @ngInject */
  function TablesPageCtrl($scope, $filter, editableOptions, editableThemes) {

    $scope.smartTablePageSize = 10;

    $scope.smartTableData = [
      {
        id: 1,
        firstName: 'Mark',
        lastName: 'Otto',
        username: '@mdo',
        email: 'mdo@gmail.com',
        age: '28'
      },
      {
        id: 2,
        firstName: 'Jacob',
        lastName: 'Thornton',
        username: '@fat',
        email: 'fat@yandex.ru',
        age: '45'
      },
      {
        id: 3,
        firstName: 'Larry',
        lastName: 'Bird',
        username: '@twitter',
        email: 'twitter@outlook.com',
        age: '18'
      },
      {
        id: 4,
        firstName: 'John',
        lastName: 'Snow',
        username: '@snow',
        email: 'snow@gmail.com',
        age: '20'
      },
      {
        id: 5,
        firstName: 'Jack',
        lastName: 'Sparrow',
        username: '@jack',
        email: 'jack@yandex.ru',
        age: '30'
      },
      {
        id: 6,
        firstName: 'Ann',
        lastName: 'Smith',
        username: '@ann',
        email: 'ann@gmail.com',
        age: '21'
      },
      {
        id: 7,
        firstName: 'Barbara',
        lastName: 'Black',
        username: '@barbara',
        email: 'barbara@yandex.ru',
        age: '43'
      },
      {
        id: 8,
        firstName: 'Sevan',
        lastName: 'Bagrat',
        username: '@sevan',
        email: 'sevan@outlook.com',
        age: '13'
      },
      {
        id: 9,
        firstName: 'Ruben',
        lastName: 'Vardan',
        username: '@ruben',
        email: 'ruben@gmail.com',
        age: '22'
      },
      {
        id: 10,
        firstName: 'Karen',
        lastName: 'Sevan',
        username: '@karen',
        email: 'karen@yandex.ru',
        age: '33'
      },
      {
        id: 11,
        firstName: 'Mark',
        lastName: 'Otto',
        username: '@mark',
        email: 'mark@gmail.com',
        age: '38'
      },
      {
        id: 12,
        firstName: 'Jacob',
        lastName: 'Thornton',
        username: '@jacob',
        email: 'jacob@yandex.ru',
        age: '48'
      },
      {
        id: 13,
        firstName: 'Haik',
        lastName: 'Hakob',
        username: '@haik',
        email: 'haik@outlook.com',
        age: '48'
      },
      {
        id: 14,
        firstName: 'Garegin',
        lastName: 'Jirair',
        username: '@garegin',
        email: 'garegin@gmail.com',
        age: '40'
      },
      {
        id: 15,
        firstName: 'Krikor',
        lastName: 'Bedros',
        username: '@krikor',
        email: 'krikor@yandex.ru',
        age: '32'
      },
      {
        "id": 16,
        "firstName": "Francisca",
        "lastName": "Brady",
        "username": "@Gibson",
        "email": "franciscagibson@comtours.com",
        "age": 11
      },
      {
        "id": 17,
        "firstName": "Tillman",
        "lastName": "Figueroa",
        "username": "@Snow",
        "email": "tillmansnow@comtours.com",
        "age": 34
      },
      {
        "id": 18,
        "firstName": "Jimenez",
        "lastName": "Morris",
        "username": "@Bryant",
        "email": "jimenezbryant@comtours.com",
        "age": 45
      },
      {
        "id": 19,
        "firstName": "Sandoval",
        "lastName": "Jacobson",
        "username": "@Mcbride",
        "email": "sandovalmcbride@comtours.com",
        "age": 32
      },
      {
        "id": 20,
        "firstName": "Griffin",
        "lastName": "Torres",
        "username": "@Charles",
        "email": "griffincharles@comtours.com",
        "age": 19
      },
      {
        "id": 21,
        "firstName": "Cora",
        "lastName": "Parker",
        "username": "@Caldwell",
        "email": "coracaldwell@comtours.com",
        "age": 27
      },
      {
        "id": 22,
        "firstName": "Cindy",
        "lastName": "Bond",
        "username": "@Velez",
        "email": "cindyvelez@comtours.com",
        "age": 24
      },
      {
        "id": 23,
        "firstName": "Frieda",
        "lastName": "Tyson",
        "username": "@Craig",
        "email": "friedacraig@comtours.com",
        "age": 45
      },
      {
        "id": 24,
        "firstName": "Cote",
        "lastName": "Holcomb",
        "username": "@Rowe",
        "email": "coterowe@comtours.com",
        "age": 20
      },
      {
        "id": 25,
        "firstName": "Trujillo",
        "lastName": "Mejia",
        "username": "@Valenzuela",
        "email": "trujillovalenzuela@comtours.com",
        "age": 16
      },
      {
        "id": 26,
        "firstName": "Pruitt",
        "lastName": "Shepard",
        "username": "@Sloan",
        "email": "pruittsloan@comtours.com",
        "age": 44
      },
      {
        "id": 27,
        "firstName": "Sutton",
        "lastName": "Ortega",
        "username": "@Black",
        "email": "suttonblack@comtours.com",
        "age": 42
      },
      {
        "id": 28,
        "firstName": "Marion",
        "lastName": "Heath",
        "username": "@Espinoza",
        "email": "marionespinoza@comtours.com",
        "age": 47
      },
      {
        "id": 29,
        "firstName": "Newman",
        "lastName": "Hicks",
        "username": "@Keith",
        "email": "newmankeith@comtours.com",
        "age": 15
      },
      {
        "id": 30,
        "firstName": "Boyle",
        "lastName": "Larson",
        "username": "@Summers",
        "email": "boylesummers@comtours.com",
        "age": 32
      },
      {
        "id": 31,
        "firstName": "Haynes",
        "lastName": "Vinson",
        "username": "@Mckenzie",
        "email": "haynesmckenzie@comtours.com",
        "age": 15
      },
      {
        "id": 32,
        "firstName": "Miller",
        "lastName": "Acosta",
        "username": "@Young",
        "email": "milleryoung@comtours.com",
        "age": 55
      },
      {
        "id": 33,
        "firstName": "Johnston",
        "lastName": "Brown",
        "username": "@Knight",
        "email": "johnstonknight@comtours.com",
        "age": 29
      },
      {
        "id": 34,
        "firstName": "Lena",
        "lastName": "Pitts",
        "username": "@Forbes",
        "email": "lenaforbes@comtours.com",
        "age": 25
      },
      {
        "id": 35,
        "firstName": "Terrie",
        "lastName": "Kennedy",
        "username": "@Branch",
        "email": "terriebranch@comtours.com",
        "age": 37
      },
      {
        "id": 36,
        "firstName": "Louise",
        "lastName": "Aguirre",
        "username": "@Kirby",
        "email": "louisekirby@comtours.com",
        "age": 44
      },
      {
        "id": 37,
        "firstName": "David",
        "lastName": "Patton",
        "username": "@Sanders",
        "email": "davidsanders@comtours.com",
        "age": 26
      },
      {
        "id": 38,
        "firstName": "Holden",
        "lastName": "Barlow",
        "username": "@Mckinney",
        "email": "holdenmckinney@comtours.com",
        "age": 11
      },
      {
        "id": 39,
        "firstName": "Baker",
        "lastName": "Rivera",
        "username": "@Montoya",
        "email": "bakermontoya@comtours.com",
        "age": 47
      },
      {
        "id": 40,
        "firstName": "Belinda",
        "lastName": "Lloyd",
        "username": "@Calderon",
        "email": "belindacalderon@comtours.com",
        "age": 21
      },
      {
        "id": 41,
        "firstName": "Pearson",
        "lastName": "Patrick",
        "username": "@Clements",
        "email": "pearsonclements@comtours.com",
        "age": 42
      },
      {
        "id": 42,
        "firstName": "Alyce",
        "lastName": "Mckee",
        "username": "@Daugherty",
        "email": "alycedaugherty@comtours.com",
        "age": 55
      },
      {
        "id": 43,
        "firstName": "Valencia",
        "lastName": "Spence",
        "username": "@Olsen",
        "email": "valenciaolsen@comtours.com",
        "age": 20
      },
      {
        "id": 44,
        "firstName": "Leach",
        "lastName": "Holcomb",
        "username": "@Humphrey",
        "email": "leachhumphrey@comtours.com",
        "age": 28
      },
      {
        "id": 45,
        "firstName": "Moss",
        "lastName": "Baxter",
        "username": "@Fitzpatrick",
        "email": "mossfitzpatrick@comtours.com",
        "age": 51
      },
      {
        "id": 46,
        "firstName": "Jeanne",
        "lastName": "Cooke",
        "username": "@Ward",
        "email": "jeanneward@comtours.com",
        "age": 59
      },
      {
        "id": 47,
        "firstName": "Wilma",
        "lastName": "Briggs",
        "username": "@Kidd",
        "email": "wilmakidd@comtours.com",
        "age": 53
      },
      {
        "id": 48,
        "firstName": "Beatrice",
        "lastName": "Perry",
        "username": "@Gilbert",
        "email": "beatricegilbert@comtours.com",
        "age": 39
      },
      {
        "id": 49,
        "firstName": "Whitaker",
        "lastName": "Hyde",
        "username": "@Mcdonald",
        "email": "whitakermcdonald@comtours.com",
        "age": 35
      },
      {
        "id": 50,
        "firstName": "Rebekah",
        "lastName": "Duran",
        "username": "@Gross",
        "email": "rebekahgross@comtours.com",
        "age": 40
      },
      {
        "id": 51,
        "firstName": "Earline",
        "lastName": "Mayer",
        "username": "@Woodward",
        "email": "earlinewoodward@comtours.com",
        "age": 52
      },
      {
        "id": 52,
        "firstName": "Moran",
        "lastName": "Baxter",
        "username": "@Johns",
        "email": "moranjohns@comtours.com",
        "age": 20
      },
      {
        "id": 53,
        "firstName": "Nanette",
        "lastName": "Hubbard",
        "username": "@Cooke",
        "email": "nanettecooke@comtours.com",
        "age": 55
      },
      {
        "id": 54,
        "firstName": "Dalton",
        "lastName": "Walker",
        "username": "@Hendricks",
        "email": "daltonhendricks@comtours.com",
        "age": 25
      },
      {
        "id": 55,
        "firstName": "Bennett",
        "lastName": "Blake",
        "username": "@Pena",
        "email": "bennettpena@comtours.com",
        "age": 13
      },
      {
        "id": 56,
        "firstName": "Kellie",
        "lastName": "Horton",
        "username": "@Weiss",
        "email": "kellieweiss@comtours.com",
        "age": 48
      },
      {
        "id": 57,
        "firstName": "Hobbs",
        "lastName": "Talley",
        "username": "@Sanford",
        "email": "hobbssanford@comtours.com",
        "age": 28
      },
      {
        "id": 58,
        "firstName": "Mcguire",
        "lastName": "Donaldson",
        "username": "@Roman",
        "email": "mcguireroman@comtours.com",
        "age": 38
      },
      {
        "id": 59,
        "firstName": "Rodriquez",
        "lastName": "Saunders",
        "username": "@Harper",
        "email": "rodriquezharper@comtours.com",
        "age": 20
      },
      {
        "id": 60,
        "firstName": "Lou",
        "lastName": "Conner",
        "username": "@Sanchez",
        "email": "lousanchez@comtours.com",
        "age": 16
      }
    ];

    $scope.editableTableData = $scope.smartTableData.slice(0, 36);

    $scope.peopleTableData = [
      {
        id: 1,
        firstName: 'Mark',
        lastName: 'Otto',
        username: '@mdo',
        email: 'mdo@gmail.com',
        age: '28',
        status: 'info'
      },
      {
        id: 2,
        firstName: 'Jacob',
        lastName: 'Thornton',
        username: '@fat',
        email: 'fat@yandex.ru',
        age: '45',
        status: 'primary'
      },
      {
        id: 3,
        firstName: 'Larry',
        lastName: 'Bird',
        username: '@twitter',
        email: 'twitter@outlook.com',
        age: '18',
        status: 'success'
      },
      {
        id: 4,
        firstName: 'John',
        lastName: 'Snow',
        username: '@snow',
        email: 'snow@gmail.com',
        age: '20',
        status: 'danger'
      },
      {
        id: 5,
        firstName: 'Jack',
        lastName: 'Sparrow',
        username: '@jack',
        email: 'jack@yandex.ru',
        age: '30',
        status: 'warning'
      }
    ];

    $scope.metricsTableData = [
      {
        image: 'app/browsers/chrome.svg',
        browser: 'Google Chrome',
        visits: '10,392',
        isVisitsUp: true,
        purchases: '4,214',
        isPurchasesUp: true,
        percent: '45%',
        isPercentUp: true
      },
      {
        image: 'app/browsers/firefox.svg',
        browser: 'Mozilla Firefox',
        visits: '7,873',
        isVisitsUp: true,
        purchases: '3,031',
        isPurchasesUp: false,
        percent: '28%',
        isPercentUp: true
      },
      {
        image: 'app/browsers/ie.svg',
        browser: 'Internet Explorer',
        visits: '5,890',
        isVisitsUp: false,
        purchases: '2,102',
        isPurchasesUp: false,
        percent: '17%',
        isPercentUp: false
      },
      {
        image: 'app/browsers/safari.svg',
        browser: 'Safari',
        visits: '4,001',
        isVisitsUp: false,
        purchases: '1,001',
        isPurchasesUp: false,
        percent: '14%',
        isPercentUp: true
      },
      {
        image: 'app/browsers/opera.svg',
        browser: 'Opera',
        visits: '1,833',
        isVisitsUp: true,
        purchases: '83',
        isPurchasesUp: true,
        percent: '5%',
        isPercentUp: false
      }
    ];

    $scope.users = [
      {
        "id": 1,
        "name": "Esther Vang",
        "status": 4,
        "group": 3
      },
      {
        "id": 2,
        "name": "Leah Freeman",
        "status": 3,
        "group": 1
      },
      {
        "id": 3,
        "name": "Mathews Simpson",
        "status": 3,
        "group": 2
      },
      {
        "id": 4,
        "name": "Buckley Hopkins",
        "group": 4
      },
      {
        "id": 5,
        "name": "Buckley Schwartz",
        "status": 1,
        "group": 1
      },
      {
        "id": 6,
        "name": "Mathews Hopkins",
        "status": 4,
        "group": 2
      },
      {
        "id": 7,
        "name": "Leah Vang",
        "status": 4,
        "group": 1
      },
      {
        "id": 8,
        "name": "Vang Schwartz",
        "status": 4,
        "group": 2
      },
      {
        "id": 9,
        "name": "Hopkin Esther",
        "status": 1,
        "group": 2
      },
      {
        "id": 10,
        "name": "Mathews Schwartz",
        "status": 1,
        "group": 3
      }
    ];

    $scope.statuses = [
      {value: 1, text: 'Good'},
      {value: 2, text: 'Awesome'},
      {value: 3, text: 'Excellent'},
    ];

    $scope.groups = [
      {id: 1, text: 'user'},
      {id: 2, text: 'customer'},
      {id: 3, text: 'vip'},
      {id: 4, text: 'admin'}
    ];

    $scope.showGroup = function(user) {
      if(user.group && $scope.groups.length) {
        var selected = $filter('filter')($scope.groups, {id: user.group});
        return selected.length ? selected[0].text : 'Not set';
      } else return 'Not set'
    };

    $scope.showStatus = function(user) {
      var selected = [];
      if(user.status) {
        selected = $filter('filter')($scope.statuses, {value: user.status});
      }
      return selected.length ? selected[0].text : 'Not set';
    };


    $scope.removeUser = function(index) {
      $scope.users.splice(index, 1);
    };

    $scope.addUser = function() {
      $scope.inserted = {
        id: $scope.users.length+1,
        name: '',
        status: null,
        group: null
      };
      $scope.users.push($scope.inserted);
    };

    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';


  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  tasksService.$inject = ["apiService"];
  angular.module('zAdmin.pages.tasks')
      .service('tasksService', tasksService);

  /** @ngInject */
  function tasksService(apiService) {
    /*apiService.tasks.getTasksTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.tasks.getTasksTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(task_id){
            return apiService.tasks.deleteTask(task_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.tasks.getTasksTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        }
    };
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  tasksCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "tasksService", "TableStructure", "Core", "TableData"];
  angular.module('zAdmin.pages.tasks')
      .controller('tasksCtrl', tasksCtrl);

  /** @ngInject */
  function tasksCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, tasksService, TableStructure, Core, TableData) {

    var vm = this;
    vm.searchTable = $state.current.name;

    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,tasksService);
    vm.smartTableCanUseAction = smartTableCanUseAction;
    vm.editRow = editRow;
    vm.previewTask = Core.previewTask;
    
    function smartTableCanUseAction(functionName,onlyForRoles,objType,onlyForTypes,statusPerms){
      /*
        logic wehn to show the button
      */
      var permitted = true
      if(!!onlyForRoles && onlyForRoles.length){
        permitted = (onlyForRoles.indexOf(Core.user_role.name.toUpperCase()) > -1)
      }
      if(permitted && !!statusPerms && !!statusPerms.accepteds && !!statusPerms.accepteds.length){
        permitted = (statusPerms.accepteds.indexOf(statusPerms.status) > -1)
      }

      return permitted;
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.tasks',{id:obj.id})
    }

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  TokenizationPageCtrl.$inject = ["$scope", "UccaTokenizerService", "TokenizationTask", "Core"];
  angular.module('zAdmin.pages.tokenization')
      .controller('TokenizationPageCtrl', TokenizationPageCtrl);

  /** @ngInject */
  function TokenizationPageCtrl($scope, UccaTokenizerService, TokenizationTask, Core) {
    var vm = this;
    vm.initText = initText;
    vm.saveChanges = saveChanges;
    vm.submitTask = submitTask;

    vm.name = 'World';

    vm.tokenizationTask = TokenizationTask;

    initText();


    function initText(){
      vm.originalText = vm.tokenizationTask.passage.text;

      vm.passageText = angular.copy(vm.originalText);
      vm.tokenizedText = angular.copy(vm.passageText);


      vm.textTokens = UccaTokenizerService.getTokensFromText(vm.passageText);

      vm.originalTokens = UccaTokenizerService.getTokensFromText(vm.originalText);


      vm.textMap = UccaTokenizerService.getTextMap(vm.originalText);
      vm.tokenizedText = angular.copy(vm.originalText);
      vm.htmlTextByTokens = "";
    }

    function submitTask(){
      return saveChanges("submit");
    }

    function saveChanges(mode){
      vm.tokenizationTask.tokens = vm.textTokens;
      vm.tokenizationTask.passage.text = vm.passageText;
      mode = mode ? mode : 'draft';
      UccaTokenizerService.saveTask(mode,vm.tokenizationTask).then(function(response){
          Core.showNotification("success","Task Saved");
      })
    }
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * UccaTokenizerService
     *
     */
    angular.module('zAdmin.theme')
        .factory('UccaTokenizerService', ["$sce", "apiService", function($sce, apiService){

        var originalTextNoSpaces = "";
        var textMapArray = [];

        var textMapSpacesArray = [];

        var service = {
            getTokensFromText: getTokensFromText,
            getHtmlTextByTokens: getHtmlTextByTokens,
            getFullHtmlTokensWithOriginalReference: getFullHtmlTokensWithOriginalReference,
            getTextMap: getTextMap,
            getTaskData: getTaskData,
            getTaskPassage: getTaskPassage,
            saveTask: saveTask,
            originalTextNoSpaces: originalTextNoSpaces,
            textMapArray: textMapArray
        };

        return service;


        /**
         *
         * get Full html tokens with original reference
         * @param tokens
         * @param originalText
         * @returns {string}
         */
        function getFullHtmlTokensWithOriginalReference(tokens, originalText){

            var html = "";

            var tokens = tokens || [];

            for(var i = 0; i < tokens.length; i++){

                var token = tokens[i];
                //check if original text is spaced

                if(isOriginalTokenStart(tokens, i, originalText)){
                    html += "<span class='token-wrapper'>";
                }


                var tokenText = token.text;


                //breakTokenTextToSubTokens

                html += "<span class='token'>" + tokenText + "</span>";

                if(isOriginalTokenEnd(tokens, i, originalText) ){
                    //close the span hilight
                    html += "</span>";
                } else {
                    html += "<span class='token-space'> </span>";
                }
            }

            return html;
        }



        /**
         * condition to
         * @param token
         * @param originalText
         * @returns {boolean}
         */

        function isOriginalTokenStart(tokens, index, originalText){

            var token = tokens[index];
            return (token.start_index==0 || originalText.charAt(token.start_index-1)== " ");

        }
        function isOriginalTokenEnd(tokens, index, originalText){
            var token = tokens[index];
            var end_char = (originalText.charAt(token.end_index+1));
            return ((!end_char.trim() || end_char == "," || end_char == "."  || end_char == ";") || token.end_index >= originalText.length);
        }

        function getHtmlTextByTokens(tokens){
            var space = " ";
            var html = "";
            for(var i = 0; i < tokens.length; i++){
                var token = tokens[i];
                if(i>0) {
                    html += space;
                }
                var span = "<span>" + token.text+ "</span>";
                html += span;
            }

            return $sce.trustAsHtml(html);
        }

        function getTokensFromText(text, originalText){

            var originalText = originalText || text;
            var tokensSplit = text.split(" ");
            var startIndex = 0;
            var endIndex = 0;


            //initiate original text without spaces
            if(!originalTextNoSpaces){
                originalTextNoSpaces = originalText.replace(/\s/g,'');

                // console.log('Generate OriginalTextNoSpaces', originalTextNoSpaces);

            }

            /**
             * Generate Text map array if not exist
             */
            if(!textMapArray.length){
                textMapArray = getTextMap(originalText);
            }


            var tokens = [];


            for(var i = 0; i < tokensSplit.length; i++){
                var tokenText = tokensSplit[i];

                if(tokenText != " "){

                    // console.log('startIndexNoSpace', startIndexNoSpace);

                    var startIndexNoSpace = originalTextNoSpaces.indexOf(tokenText, endIndex-i);

                    if(textMapArray[startIndexNoSpace]){
                        startIndex = textMapArray[startIndexNoSpace].originalTextLocation;
                    } else {
                        // console.log('error', startIndexNoSpace, textMapArray);
                    }


                    var endIndexNoSpace = startIndexNoSpace + (tokenText.length-1);

                    endIndex = textMapArray[endIndexNoSpace].originalTextLocation;


                    var requireAnnotation = isRequiredAnnotation(tokenText);

                    var token = {
                        start_index: startIndex,
                        end_index: endIndex,
                        text: tokenText,
                        require_annotation: requireAnnotation
                    };

                    tokens.push(token);
                }
            }

            return tokens;
        }

        function getTextMap(text){
            var textMap = [];
            for (var i = 0; i < text.length; i++){
                var char = text[i];

                if(char !== " "){
                    textMap.push({
                        char: char,
                        originalTextLocation: i
                    })
                }

            }
            return textMap;
        }


        /**
         * Retrieve the task from the server.
         * @param task_id
         * @returns {task_object}
         */
        function getTaskData(task_id){
            return apiService.tokenization.getTaskData(task_id);
        }

        /**
         * Retrieve the task from the server.
         * @param passage_id
         * @returns {task_object}
         */
        function getTaskPassage(passage_id){
            return apiService.tokenization.getPassageData(passage_id);
        }

        function saveTask(mode,taskData){
            return apiService.tokenization.putTaskData(mode,taskData);
        }

        /**
         * This is a mock function it should re-evaluated on saving at the server python code
         * @param tokenText
         * @returns {boolean}
         */
        function isRequiredAnnotation(tokenText){
            var isRequired = true;

            //if all not alphnumeric then false;

            if(tokenText==","){
                isRequired = false;
            }

            return isRequired;
        }


    }])
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  TokenizationPageCtrl.$inject = ["$scope", "uccaFactory", "TokenizationTask", "Core", "$state", "$timeout", "$rootScope"];
  angular.module('zAdmin.pages.tokenization-v2')
      .controller('TokenizationPageCtrl', TokenizationPageCtrl);

  /** @ngInject */
  function TokenizationPageCtrl($scope, uccaFactory, TokenizationTask, Core, $state, $timeout, $rootScope) {
      $scope.saveChanges = saveChanges;
      $scope.submitTask = submitTask;

      $scope.name = 'World';

      $scope.tokenizationTask = TokenizationTask;
      $scope.originalText = TokenizationTask.passage.text;
      // create a copy of the original text for the tokenized text
      var passageFromTokens = createTextFromTokens(TokenizationTask.tokens);

      /**
       *
       *
       *
       * Init some vars of text  + mapping
       * Add originalText to factory once;
       *
       *
       *
       */




      uccaFactory.originalText = $scope.originalText;

      uccaFactory.setOriginalTextNoSpaces();
      uccaFactory.setOriginalTextSpaceMap();

      console.log(uccaFactory.originalText, uccaFactory.originalTextNoSpaces, uccaFactory.originalTextSpaceMap);



      /**
       *
       * Watch for changes in the textarea
       *
       */
      $scope.$watch("tokenizedText", function(tokenizedText){

          console.log('watch tokenizedText');
          if(tokenizedText)
          $scope.savedTokens = uccaFactory.getTokensFromText(tokenizedText, uccaFactory.originalText);
      });

      /**
       *
       *
       * End init
       *
       * */

      $scope.originalTokens = uccaFactory.getTokensFromText($scope.originalText);

      // $scope.tokenizedText = angular.copy($scope.originalText);
      $scope.tokenizedText = passageFromTokens;


      function createTextFromTokens(tokensArray){
        var tokensArr = tokensArray;
        var output = '';
        tokensArray.forEach(function(token,index){
          output += (token.text) + (index == tokensArr.length-1 ? '' : ' ');
        })
        return output;
      }

      function submitTask(){
        return saveChanges().then(function(){
          return saveChanges("submit").then(function(){
            $state.go('tasks',{},{refresh:true})
            $timeout(function(){$rootScope.$hideSideBar = false;}) 
          })
        })
      }

      function saveChanges(mode){
        $scope.tokenizationTask.tokens = $scope.savedTokens;
        $scope.tokenizationTask.passage.text = $scope.tokenizedText;
        mode = mode ? mode : 'draft';
        return uccaFactory.saveTask(mode,$scope.tokenizationTask).then(function(response){
          Core.showNotification("success","Task Saved");
        })
      }

  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * UccaTokenizerService
     *
     */
    angular.module('zAdmin.pages.tokenization-v2')
        .directive('tokenizerBehaviour', ["$timeout", function($timeout){
            return {
                link: link,
                restrict: 'A',
                scope: {},
            }

            function link(scope, el, attr){

                console.log('tokenizerBehaviour', el);
                $(el).on('keydown', function(evt) {
                    if (evt.keyCode == 32  || evt.keyCode == 8 || (evt.keyCode >=37 && evt.keyCode <=40)) {

                        //if there is a selection
                        console.log($(el).prop("selectionStart"), $(el).prop("selectionEnd"));

                        if( $(el).prop("selectionStart") -  $(el).prop("selectionEnd")) {
                            event.preventDefault();
                            return false;
                        }


                        clickOnTokenText(evt, el);
                    }else {
                        console.log('space not allowed', evt);
                        event.preventDefault();
                        return false;
                    }
                });

                function clickOnTokenText(evt, el){

                    console.log('clickOnTokenText');


                    var charPrevious, charNext;



                    var text = $(el).val();

                    var cursorLocation = $(el).prop("selectionStart");
                    charPrevious = text.substring((cursorLocation), cursorLocation-1);
                    charNext = text.substring((cursorLocation), cursorLocation+1);


                    /**
                     * If backspace
                     *
                     * validate that deleted char is space
                     *
                     * Merge tokens
                     */
                    if(evt.keyCode == 8){

                        console.log('cursorLocation', cursorLocation);

                        if(cursorLocation){

                            console.log('charPrevious', charPrevious);
                            if(charPrevious != "\n" && charPrevious.trim()==""){

                                console.log('deleted char isSpace');

                                text = text.slice(cursorLocation-1,1);

                            }else {
                                //if not space is deleted - do not allow
                                console.log('not space no delete');
                                evt.preventDefault();
                                return false;
                            }
                        } else {
                            console.log('not space no delete');
                            evt.preventDefault();
                            return false;
                        }

                    }


                    /**
                     * if space
                     *
                     * check that space not exist already
                     *
                     */
                    if (evt.keyCode == 32){


                        if(charPrevious.trim()=="" || charNext.trim()==""){
                            evt.preventDefault();
                            return false;
                        }


                        if(text.trim()==""){
                            console.log('empty one');
                            event.preventDefault();
                            return false;
                        } else {


                            $timeout(function(){
                                scope.$apply();
                            },1);

                        }

                    }

                }


            }
        
    }])
})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    /**
     * uccaFactory
     *
     */
    angular.module('zAdmin.pages.tokenization-v2')
        .factory('uccaFactory', ["$sce", "apiService", function($sce, apiService){

            

            var originalText,
                    originalTextNoSpaces
                    ;


            //spacemap for calculating the token location

            var originalTextSpaceMap = [];

            var service = {
                getTokensFromText: getTokensFromText,
                originalText: originalText,
                originalTextNoSpaces: originalTextNoSpaces,
                setOriginalTextNoSpaces: setOriginalTextNoSpaces,
                originalTextSpaceMap: originalTextSpaceMap,
                setOriginalTextSpaceMap: setOriginalTextSpaceMap,
                getTaskData:getTaskData,
                getTaskPassage:getTaskPassage,
                saveTask:saveTask,
            };

            return service;


            // set the space map

            function setOriginalTextSpaceMap(){
                var last_val = 0;
                for (var i = 0; i < service.originalText.length; i++) {
                    if (service.originalText[i] == " ") {
                        last_val += 1;
                    }
                    else {
                        originalTextSpaceMap.push(last_val);
                    }
                }
            }

            /**
             *
             *
             *
             * */

            function setOriginalTextNoSpaces(){

                console.log('setOriginalTextNoSpaces');
                // originalTextNoSpaces = service.originalText.replace(/\s/g, '');
                originalTextNoSpaces = service.originalText.replace(/ /g, '');
                return originalTextNoSpaces;
            }




            /**
             *
             * function that create the tokens on each change
             *
             * @param text
             * @param originalText
             * @returns {Array}
             *
             *
             * First token start at 0
             *
             * originalText[start_index,...,end_index] = token
             *
             */
            function getTokensFromText(text){

                var processText = text.replace(/\n/g, " \n ");
                
                console.log(text, processText);

                var tokensSplit = processText.split(" ");
                var startIndex = 0;
                var endIndex = 0;
                var endIndex_no_spaces = 0;



                var tokens = [];


                for(var i = 0; i < tokensSplit.length; i++){
                    var tokenText = tokensSplit[i];

                    if(tokenText != " " && tokenText != ""){
                        var start_index_no_spaces = originalTextNoSpaces.indexOf(tokenText, endIndex_no_spaces);
                        startIndex = start_index_no_spaces + originalTextSpaceMap[start_index_no_spaces];
                        endIndex_no_spaces = start_index_no_spaces + tokenText.length - 1;
                        endIndex = endIndex_no_spaces + originalTextSpaceMap[endIndex_no_spaces];

                        var requireAnnotation = isRequiredAnnotation(tokenText);

                        var token = {
                            start_index: startIndex,
                            end_index: endIndex,
                            text: tokenText,
                            require_annotation: requireAnnotation
                        };

                        tokens.push(token);
                    }
                }

                return tokens;
            }


            function isRequiredAnnotation(str) {
                var punct_regexp = /[^\'-\/;\:!\?\(\)\[\]\"\{\}\+&<>—“”\.,]/;
                //var temp = /^([^\u0400-\u04FF0-9A-Z%&a-zA]+)$/;
                return punct_regexp.test(str);
            }

            /**
             * Retrieve the task from the server.
             * @param task_id
             * @returns {task_object}
             */
            function getTaskData(task_id){
                return apiService.tokenization.getTaskData(task_id);
            }

            /**
             * Retrieve the task from the server.
             * @param passage_id
             * @returns {task_object}
             */
            function getTaskPassage(passage_id){
                return apiService.tokenization.getPassageData(passage_id);
            }

            function saveTask(mode,taskData){
                return apiService.tokenization.putTaskData(mode,taskData);
            }

        }])
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  usersService.$inject = ["apiService"];
  angular.module('zAdmin.pages.users')
      .service('usersService', usersService);

  /** @ngInject */
  function usersService(apiService) {
    /*apiService.users.getUsersTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getTableStructure: function(){
          return apiService.users.getUserTableStructure().then(function (res){return res.data});
        },
        getData: function(){
          return service.tableData;
        },
        delete: function(user_id){
            return apiService.users.deleteUser(user_id).then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
            return apiService.users.getUsersTableData(searchTerms).then(function (res){
                angular.copy(res.data.results, service.tableData);
                return service.tableData;
            });
        },
        checkForUserPermission: function(){
          debugger
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  UsersCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "usersService", "TableStructure", "Core", "TableData"];
  angular.module('zAdmin.pages.users')
      .controller('UsersCtrl', UsersCtrl);

  /** @ngInject */
  function UsersCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, usersService, TableStructure, Core,TableData) {

  	var vm = this;
    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,usersService);

    vm.editRow = editRow;

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.users',{id:obj.id})
    }


  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  toastrLibConfig.$inject = ["toastrConfig"];
  angular.module('zAdmin.theme.components')
      .config(toastrLibConfig);

  /** @ngInject */
  function toastrLibConfig(toastrConfig) {
    angular.extend(toastrConfig, {
      closeButton: true,
      closeHtml: '<button>&times;</button>',
      timeOut: 5000,
      autoDismiss: false,
      containerId: 'toast-container',
      maxOpened: 0,
      newestOnTop: true,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });
  }
})();
/**
 * Change top "Daily Downloads", "Active Users" values with animation effect
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  animatedChange.$inject = ["$timeout"];
  angular.module('zAdmin.theme')
      .directive('animatedChange', animatedChange);

  /** @ngInject */
  function animatedChange($timeout) {
    return {
      link: function (scope, element) {
        $timeout(function(){
          var newValue = element.attr('new-value');
          var oldvalue = parseInt(element.html());

          function changeValue(val) {
            $timeout(function(){
              element.html(val);
            }, 30);
          }

          if (newValue > oldvalue) {
            for (var i = oldvalue; i <= newValue; i++) {
              changeValue(i);
            }
          } else {
            for (var j = oldvalue; j >= newValue; j--) {
              changeValue(j);
            }
          }
          $timeout(function(){
            element.next().find('i').addClass('show-arr');
          }, 500);
        }, 3500);
      }
    };
  }

})();
/**
 * Auto expand textarea field
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('autoExpand', autoExpand);

  /** @ngInject */
  function autoExpand() {
    return {
      restrict: 'A',
      link: function ($scope, elem) {
        elem.bind('keydown', function ($event) {
          var element = $event.target;
          $(element).height(0);
          var height = $(element)[0].scrollHeight;
          height = (height < 16) ? 16 : height;
          $(element).height(height);
        });

        // Expand the textarea as soon as it is added to the DOM
        setTimeout/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
          var element = elem;
          $(element).height(0);
          var height = $(element)[0].scrollHeight;
          height = (height < 16) ? 16 : height;
          $(element).height(height);
        }, 0)
      }
    };
  }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  autoFocus.$inject = ["$timeout", "$parse"];
  angular.module('zAdmin.theme')
      .directive('autoFocus', autoFocus);

  /** @ngInject */
  function autoFocus($timeout, $parse) {
    return {
      link: function (scope, element, attrs) {
        var model = $parse(attrs.autoFocus);
        scope.$watch(model, function (value) {
          if (value === true) {
            $timeout(function(){
              element[0].focus();
              element[0].select();
            });
          }
        });
        element.bind('z', function () {
          scope.$apply(model.assign(scope, false));
        });
      }
    };
  }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    borderPaint.$inject = ["$timeout", "$parse", "DataService"];
    angular.module('zAdmin.theme')
        .directive('borderPaint', borderPaint);

    /** @ngInject */
    function borderPaint($timeout, $parse, DataService) {

        var directive = {
            restrict:'A',
            link: lincFunc,
            replace:false

        };

        function lincFunc(scope, element, attrs){
            var borderStyles = "{border: 1px solid}";


            // scope.$watch('scope.dirCtrl.token.backgroundColor',function(newVal,oldVal){
            //     console.log(scope.dirCtrl.token.backgroundColor);
            //     var parentUnit  = DataService.getUnitById(DataService.getParentUnitId(scope.dirCtrl.parentId));
            // });
        }

        return directive;
    }

})();
/**
 * Auto expand textarea field
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    extractObjectName.$inject = ["$timeout"];
    angular.module('zAdmin.theme')
        .directive('extractObjectName', extractObjectName);

    /** @ngInject */
    function extractObjectName($timeout) {
        return {
            restrict: 'A',
            scope:{
              fieldElem:"="
            },
            link: function ($scope, elem) {

                $timeout(function(){
                    //DOM has finished rendering
                    elem[0].value = $scope.fieldElem ? $scope.fieldElem.name : '';
                });
            }
        };
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  focusMe.$inject = ["$timeout", "$parse"];
  angular.module('zAdmin.theme')
      .directive('focusMe', focusMe);

  /** @ngInject */
  function focusMe($timeout, $parse) {
    // using to focus elelmnts in modal when its open
    return {
      link: function(scope, element, attrs) {
        var body = $('body');
        scope.$watch(body, function(value) {
          // console.log('focusMe');
          if( $('body').hasClass('modal-open') ) { 
            $timeout(function() {
              element[0].focus(); 
              element[0].select(); 
            });
          }
        });
        
      }
    };
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    /**
     * Directive for highlighting tokens
     */

    angular.module('zAdmin.theme')
        .directive("highlightOriginalToken", ["UccaTokenizerService", function(UccaTokenizerService){
        return {
            link: link,
            restrict: 'A',
            scope: {
                originalText: "=",
                savedTokens: "="
            },
            template: '<div></div>'
        }

        function link(scope, el, attr){

            scope.$watch("savedTokens", function(savedTokens){
                var html = UccaTokenizerService.getFullHtmlTokensWithOriginalReference(savedTokens, scope.originalText);
                el.html(html);
            })
        }
    }])

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('includeWithScope', includeWithScope);

  /** @ngInject */
  function includeWithScope() {
    return {
      restrict: 'AE',
      templateUrl: function(ele, attrs) {
        return attrs.includeWithScope;
      }
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  ionSlider.$inject = ["$timeout"];
  angular.module('zAdmin.theme')
    .directive('ionSlider', ionSlider);

  /** @ngInject */
  function ionSlider($timeout) {
    return {
      restrict: 'EA',
      template: '<div></div>',
      replace: true,
      scope: {
        min: '=',
        max: '=',
        type: '@',
        prefix: '@',
        maxPostfix: '@',
        prettify: '=',
        prettifySeparator: '@',
        grid: '=',
        gridMargin: '@',
        postfix: '@',
        step: '@',
        hideMinMax: '@',
        hideFromTo: '@',
        from: '=',
        to: '=',
        disable: '=',
        onChange: '=',
        onFinish: '=',
        values: '=',
        timeout: '@'
      },
      link: function ($scope, $element) {
            $element.ionRangeSlider({
              min: $scope.min,
              max: $scope.max,
              type: $scope.type,
              prefix: $scope.prefix,
              maxPostfix: $scope.maxPostfix,
              prettify_enabled: $scope.prettify,
              prettify_separator: $scope.prettifySeparator,
              grid: $scope.grid,
              gridMargin: $scope.gridMargin,
              postfix: $scope.postfix,
              step: $scope.step,
              hideMinMax: $scope.hideMinMax,
              hideFromTo: $scope.hideFromTo,
              from: $scope.from,
              to: $scope.to,
              disable: $scope.disable,
              onChange: $scope.onChange,
              onFinish: $scope.onFinish,
              values: $scope.values
            });

            $scope.$watch('min', function (value) {
              $timeout(function(){
                $element.data("ionRangeSlider").update({min: value});
              });
            }, true);
            $scope.$watch('max', function (value) {
              $timeout(function(){
                $element.data("ionRangeSlider").update({max: value});
              });
            });
            $scope.$watch('from', function (value) {
              $timeout(function(){
                $element.data("ionRangeSlider").update({from: value});
              });
            });
            $scope.$watch('to', function (value) {
              $timeout(function(){
                $element.data("ionRangeSlider").update({to: value});
              });
            });
            $scope.$watch('disable', function (value) {
              $timeout(function(){
                $element.data("ionRangeSlider").update({disable: value});
              });
            });
      }
    };
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('keepOnTop', keepOnTop);

  /** @ngInject */
  function keepOnTop() {
    return {
      link: function (scope,elem,attr) {
        $(window).on('scroll', function() {
          var scrollTop = $(window).scrollTop();
          $(elem).css('marginTop',scrollTop+'px')
        });
      }
    };
  }

})();
/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  languageAlign.$inject = ["$timeout", "$rootScope"];
  angular.module('zAdmin.theme')
      .directive('languageAlign', languageAlign);

  /** @ngInject */
  function languageAlign($timeout, $rootScope) {
    
    function isRTL(s){           
        var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
            rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
            rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');
        return rtlDirCheck.test(s);
    };
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var model = attrs.languageAlign;
        if (isRTL(model)){
          $(elem).css('direction','rtl');
        }
      }
    };
  }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('ngFileSelect', ngFileSelect);

  /** @ngInject */
  function ngFileSelect() {
    return {
      link: function ($scope, el) {
        el.bind('change', function (e) {
          $scope.file = (e.srcElement || e.target).files[0];
          $scope.getFile();
        })
      }
    }
  }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    angular.module('zAdmin.theme')
        .directive("restrictKeysTokenizer", ["UccaTokenizerService", "$timeout", function(UccaTokenizerService, $timeout){
        return {
            link:link,
            restrict: 'A',
        }

        function link(scope, el, attr){


            $(el).on('keydown', function(evt) {
                clickOnTokenText(evt);
            });




            function clickOnTokenText(evt) {

                //console.log('evt', evt.charCode, evt);
                //scope.scopeApply();

                if (evt.keyCode == 32 || evt.keyCode == 8 || (evt.keyCode >= 37 && evt.keyCode <= 40)) {

                } else {
                    console.log('char not allowed', evt);
                    event.preventDefault();
                    return false;
                }


                //if shift key, then jump to next word
                if(evt.shiftKey && evt.keyCode == 39){
                    jumpToNextWord()
                }

                if(evt.shiftKey && evt.keyCode == 37){
                    jumpToPreviousWord();

                }
                if(evt.shiftKey && evt.keyCode == 38){
                    jumpToPassageStart();

                }
                if(evt.shiftKey && evt.keyCode == 40){
                    jumpToPassageEnd();

                }




                //do not add extra space
                if(evt.keyCode == 32 && !canInsertSpace()){
                    //
                    event.preventDefault();
                    return false;

                }

                //allow to delete only space
                if(evt.keyCode == 8 && restrictDelete()){
                    event.preventDefault();
                    return false;
                }



            }

            function jumpToNextWord(){
                var cursorLocation = getCursorPos();
                var index = $(el).val().indexOf(" ", cursorLocation.start + 1) + 1;
                index = (index >= 0)? index : cursorLocation.start;
                setCursorPos(index);
            }

            function jumpToPreviousWord(){
                var cursorLocation = getCursorPos();
                var index = $(el).val().lastIndexOf(" ", cursorLocation.start - 2) +2;
                index = (index >= 0)? index : cursorLocation.start;
                setCursorPos(index);
            }

            function jumpToPassageStart(){
                setCursorPos(0);

            }

            function jumpToPassageEnd(){
                var index = $(el).val().length;
                setCursorPos(index);
            }


            function canInsertSpace(){
                var cursorLocation = getCursorPos();
                //char = 5;
                var charBefore = getCharAt(cursorLocation.start-1);
                var charAfter = getCharAt(cursorLocation.start);

                if(cursorLocation.start != cursorLocation.end ||  !charBefore.trim() || !charAfter.trim()){
                    return false;
                }
                return true;
            }

            function restrictDelete(){
                var cursorLocation = getCursorPos();
                //char = 5;
                var char = getCharAt(cursorLocation.start-1);

                return (cursorLocation.start != cursorLocation.end || char.trim())



            }

            function getCharAt(index){
                var char = $(el).val().charAt(index);

                return char;
            }

            function setCursorPos(index){
                el[0].setSelectionRange(index, index);
            }

            function getCursorPos(input) {
                if(!input){
                    input = $("#textarea-tokenizer")[0];
                }
                if ("selectionStart" in input && document.activeElement == input) {
                    return {
                        start: input.selectionStart,
                        end: input.selectionEnd
                    };
                }
                else if (input.createTextRange) {
                    var sel = document.selection.createRange();
                    if (sel.parentElement() === input) {
                        var rng = input.createTextRange();
                        rng.moveToBookmark(sel.getBookmark());
                        for (var len = 0;
                             rng.compareEndPoints("EndToStart", rng) > 0;
                             rng.moveEnd("character", -1)) {
                            len++;
                        }
                        rng.setEndPoint("StartToStart", input.createTextRange());
                        for (var pos = { start: 0, end: len };
                             rng.compareEndPoints("EndToStart", rng) > 0;
                             rng.moveEnd("character", -1)) {
                            pos.start++;
                            pos.end++;
                        }

                        return pos;
                    }
                }
                return -1;
            }

        }
    }])
})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('scrollPosition', scrollPosition);

  /** @ngInject */
  function scrollPosition() {
    return {
      scope: {
        scrollPosition: '=',
        maxHeight: '='
      },
      link: function (scope) {
        $(window).on('scroll', function() {
          var scrollTop = $(window).scrollTop() > scope.maxHeight;
          if (scrollTop !== scope.prevScrollTop) {
            scope.$apply(function() {
              scope.scrollPosition = scrollTop;
            });
          }
          scope.prevScrollTop = scrollTop;
        });
      }
    };
  }

})();
/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    setSortable.$inject = ["$timeout", "$rootScope"];
    angular.module('zAdmin.theme')
        .directive('setSortable', setSortable);

    /** @ngInject */
    function setSortable($timeout, $rootScope) {
        return {
            restrict: 'A',
            scope:{
              isSortable: '='
            },
            link: function ($scope, elem) {
                if($scope.isSortable){
                    var element = $(elem)[0];
                    $(element).attr('ui-sortable');
                }
            }
        };
    }

})();
/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    smartInnerTable.$inject = ["$timeout", "$rootScope"];
    innerTableCtrl.$inject = ["$scope", "$state", "$rootScope", "apiService", "Core"];
    angular.module('zAdmin.theme')
        .directive('smartInnerTable', smartInnerTable);

    /** @ngInject */
    function smartInnerTable($timeout, $rootScope) {
        return {
            restrict: 'E',
            templateUrl:'app/pages/tables/widgets/smartInnerTable.html',
            controller: innerTableCtrl,
            controllerAs:'vm',
            scope:{
                tableData:'=',
                pageName:'=',
                ctrlModule:'=',
                viewOnly:'=',
                viewOnlyRule:'=',
                categoryName:'@',
                managePageRoute:'=',
                loadSelectDataStructure:'=',
                isSortable:'='
                
            },
            link: function (scope, elem) {
                scope.$watch('tableData', function() {
                    scope.vm.smartTableData = [];
                    angular.isArray(scope.tableData) ? scope.vm.smartTableData = scope.tableData : scope.vm.smartTableData.push(scope.tableData);
                });
            }
        };
    }
    /** @ngInject */
    function innerTableCtrl($scope, $state,$rootScope,apiService,Core) {

        var vm = this;

        vm.manage = manage;
        vm.edit = goToEditPageThroughParentCtrl;
        vm.toggleItem = toggleItem;
        vm.removeRow = removeRow;
        vm.runFunction = runFunction;
        vm.viewOnlyRuleOk = Core.viewOnlyRuleOk.bind($scope.viewOnlyRule);

        $scope.ctrlModule.smartTableStructure.forEach(function(tableRow){
            if(tableRow.key == $scope.pageName){
                vm.smartTableStructure = tableRow.tableStructure;
            }
        })

        if (vm.smartTableStructure == undefined) vm.smartTableStructure = $scope.ctrlModule.smartTableStructure;

        $scope.vm.smartTableData = [];
        angular.isArray($scope.tableData) ? $scope.vm.smartTableData = $scope.tableData : $scope.vm.smartTableData.push($scope.tableData);

        function manage(){
            $scope.ctrlModule.manage($scope.managePageRoute);
        }

        function goToEditPageThroughParentCtrl(obj,index){
            $scope.ctrlModule.edit($scope.managePageRoute,true,obj,index,$scope.vm.smartTableData[index]);
        }

        function removeRow(obj, index){
            $scope.ctrlModule.deleteItemInData($scope.pageName,index)
            $scope.ctrlModule.refreshData($scope.pageName);
        }

        function runFunction(functionName,obj,index){
            switch(functionName){
                case 'removeRow':
                    removeRow(obj, index)
                    break;
                case 'edit':
                    goToEditPageThroughParentCtrl(obj,index)
                    break;
                case 'toggleItem':
                    toggleItem(category,categoryValue)
                    break;
                case 'manage':
                    $scope.ctrlModule.manage($scope.managePageRoute);
                    break;
                case 'parseSmartTableColumnData':
                    return $scope.ctrlModule[functionName](obj,index);// (itemRow,value)
                    break;
                default:
                    $scope.ctrlModule[functionName](obj,index);
                    break;
                
            }
        }
        
        function toggleItem(category,categoryValue){
            try{
                $scope.ctrlModule.toggleItem($scope.categoryName,category,categoryValue);
            }catch(e){
                console.log(e)
            }
            
           
        }




    }


})();
/**
 * angular-ui-sortable - This directive allows you to jQueryUI Sortable.
 * @version v0.13.4 - 2015-06-07
 * @link http://angular-ui.github.com
 * @license MIT
 */

(function(window, angular, undefined) {
    'use strict';
    /*
     jQuery UI Sortable plugin wrapper

     @param [ui-sortable] {object} Options to pass to $.fn.sortable() merged onto ui.config
     */
    angular.module('ui.sortable', [])
        .value('uiSortableConfig',{})
        .directive('uiSortable', [
            'uiSortableConfig', '$timeout', '$log',
            function(uiSortableConfig, $timeout, $log) {
                return {
                    require: '?ngModel',
                    scope: {
                        ngModel: '=',
                        uiSortable: '=',
                        isSortable:'='
                    },
                    link: function(scope, element, attrs, ngModel) {
                        var savedNodes;

                        function combineCallbacks(first,second){
                            if(second && (typeof second === 'function')) {
                                return function() {
                                    first.apply(this, arguments);
                                    second.apply(this, arguments);
                                };
                            }
                            return first;
                        }

                        function getSortableWidgetInstance(element) {
                            // this is a fix to support jquery-ui prior to v1.11.x
                            // otherwise we should be using `element.sortable('instance')`
                            var data = element.data('ui-sortable');
                            if (data && typeof data === 'object' && data.widgetFullName === 'ui-sortable') {
                                return data;
                            }
                            return null;
                        }

                        function hasSortingHelper (element, ui) {
                            var helperOption = element.sortable('option','helper');
                            return helperOption === 'clone' || (typeof helperOption === 'function' && ui.item.sortable.isCustomHelperUsed());
                        }

                        // thanks jquery-ui
                        function isFloating (item) {
                            return (/left|right/).test(item.css('float')) || (/inline|table-cell/).test(item.css('display'));
                        }

                        function getElementScope(elementScopes, element) {
                            var result = null;
                            for (var i = 0; i < elementScopes.length; i++) {
                                var x = elementScopes[i];
                                if (x.element[0] === element[0]) {
                                    result = x.scope;
                                    break;
                                }
                            }
                            return result;
                        }

                        function afterStop(e, ui) {
                            ui.item.sortable._destroy();
                        }

                        var opts = {};

                        // directive specific options
                        var directiveOpts = {
                            'ui-floating': undefined
                        };

                        var callbacks = {
                            receive: null,
                            remove:null,
                            start:null,
                            stop:null,
                            update:null
                        };

                        var wrappers = {
                            helper: null
                        };

                        angular.extend(opts, directiveOpts, uiSortableConfig, scope.uiSortable);

                        if (!angular.element.fn || !angular.element.fn.jquery) {
                            $log.error('ui.sortable: jQuery should be included before AngularJS!');
                            return;
                        }

                        if (ngModel && scope.isSortable) {

                            // When we add or remove elements, we need the sortable to 'refresh'
                            // so it can find the new/removed elements.
                            scope.$watch('ngModel.length', function() {
                                // Timeout to let ng-repeat modify the DOM
                                $timeout(function() {
                                    // ensure that the jquery-ui-sortable widget instance
                                    // is still bound to the directive's element
                                    if (!!getSortableWidgetInstance(element)) {
                                        element.sortable('refresh');
                                    }
                                }, 0, false);
                            });

                            callbacks.start = function(e, ui) {
                                if (opts['ui-floating'] === 'auto') {
                                    // since the drag has started, the element will be
                                    // absolutely positioned, so we check its siblings
                                    var siblings = ui.item.siblings();
                                    var sortableWidgetInstance = getSortableWidgetInstance(angular.element(e.target));
                                    sortableWidgetInstance.floating = isFloating(siblings);
                                }

                                // Save the starting position of dragged item
                                ui.item.sortable = {
                                    model: ngModel.$modelValue[ui.item.index()],
                                    index: ui.item.index(),
                                    source: ui.item.parent(),
                                    sourceModel: ngModel.$modelValue,
                                    cancel: function () {
                                        ui.item.sortable._isCanceled = true;
                                    },
                                    isCanceled: function () {
                                        return ui.item.sortable._isCanceled;
                                    },
                                    isCustomHelperUsed: function () {
                                        return !!ui.item.sortable._isCustomHelperUsed;
                                    },
                                    _isCanceled: false,
                                    _isCustomHelperUsed: ui.item.sortable._isCustomHelperUsed,
                                    _destroy: function () {
                                        angular.forEach(ui.item.sortable, function(value, key) {
                                            ui.item.sortable[key] = undefined;
                                        });
                                    }
                                };
                            };

                            callbacks.activate = function(e, ui) {
                                // We need to make a copy of the current element's contents so
                                // we can restore it after sortable has messed it up.
                                // This is inside activate (instead of start) in order to save
                                // both lists when dragging between connected lists.
                                savedNodes = element.contents();

                                // If this list has a placeholder (the connected lists won't),
                                // don't inlcude it in saved nodes.
                                var placeholder = element.sortable('option','placeholder');

                                // placeholder.element will be a function if the placeholder, has
                                // been created (placeholder will be an object).  If it hasn't
                                // been created, either placeholder will be false if no
                                // placeholder class was given or placeholder.element will be
                                // undefined if a class was given (placeholder will be a string)
                                if (placeholder && placeholder.element && typeof placeholder.element === 'function') {
                                    var phElement = placeholder.element();
                                    // workaround for jquery ui 1.9.x,
                                    // not returning jquery collection
                                    phElement = angular.element(phElement);

                                    // exact match with the placeholder's class attribute to handle
                                    // the case that multiple connected sortables exist and
                                    // the placehoilder option equals the class of sortable items
                                    var excludes = element.find('[class="' + phElement.attr('class') + '"]:not([ng-repeat], [data-ng-repeat])');

                                    savedNodes = savedNodes.not(excludes);
                                }

                                // save the directive's scope so that it is accessible from ui.item.sortable
                                var connectedSortables = ui.item.sortable._connectedSortables || [];

                                connectedSortables.push({
                                    element: element,
                                    scope: scope
                                });

                                ui.item.sortable._connectedSortables = connectedSortables;
                            };

                            callbacks.update = function(e, ui) {
                                // Save current drop position but only if this is not a second
                                // update that happens when moving between lists because then
                                // the value will be overwritten with the old value
                                if(!ui.item.sortable.received) {
                                    ui.item.sortable.dropindex = ui.item.index();
                                    var droptarget = ui.item.parent();
                                    ui.item.sortable.droptarget = droptarget;

                                    var droptargetScope = getElementScope(ui.item.sortable._connectedSortables, droptarget);
                                    ui.item.sortable.droptargetModel = droptargetScope.ngModel;

                                    // Cancel the sort (let ng-repeat do the sort for us)
                                    // Don't cancel if this is the received list because it has
                                    // already been canceled in the other list, and trying to cancel
                                    // here will mess up the DOM.
                                    element.sortable('cancel');
                                }

                                // Put the nodes back exactly the way they started (this is very
                                // important because ng-repeat uses comment elements to delineate
                                // the start and stop of repeat sections and sortable doesn't
                                // respect their order (even if we cancel, the order of the
                                // comments are still messed up).
                                if (hasSortingHelper(element, ui) && !ui.item.sortable.received &&
                                    element.sortable( 'option', 'appendTo' ) === 'parent') {
                                    // restore all the savedNodes except .ui-sortable-helper element
                                    // (which is placed last). That way it will be garbage collected.
                                    savedNodes = savedNodes.not(savedNodes.last());
                                }
                                savedNodes.appendTo(element);

                                // If this is the target connected list then
                                // it's safe to clear the restored nodes since:
                                // update is currently running and
                                // stop is not called for the target list.
                                if(ui.item.sortable.received) {
                                    savedNodes = null;
                                }

                                // If received is true (an item was dropped in from another list)
                                // then we add the new item to this list otherwise wait until the
                                // stop event where we will know if it was a sort or item was
                                // moved here from another list
                                if(ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
                                    scope.$apply/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
                                        ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0,
                                            ui.item.sortable.moved);
                                    });
                                }
                            };

                            callbacks.stop = function(e, ui) {
                                // If the received flag hasn't be set on the item, this is a
                                // normal sort, if dropindex is set, the item was moved, so move
                                // the items in the list.
                                if(!ui.item.sortable.received &&
                                    ('dropindex' in ui.item.sortable) &&
                                    !ui.item.sortable.isCanceled()) {

                                    scope.$apply/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
                                        ngModel.$modelValue.splice(
                                            ui.item.sortable.dropindex, 0,
                                            ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
                                    });
                                } else {
                                    // if the item was not moved, then restore the elements
                                    // so that the ngRepeat's comment are correct.
                                    if ((!('dropindex' in ui.item.sortable) || ui.item.sortable.isCanceled()) &&
                                        !hasSortingHelper(element, ui)) {
                                        savedNodes.appendTo(element);
                                    }
                                }

                                // It's now safe to clear the savedNodes
                                // since stop is the last callback.
                                savedNodes = null;
                            };

                            callbacks.receive = function(e, ui) {
                                // An item was dropped here from another list, set a flag on the
                                // item.
                                ui.item.sortable.received = true;
                            };

                            callbacks.remove = function(e, ui) {
                                // Workaround for a problem observed in nested connected lists.
                                // There should be an 'update' event before 'remove' when moving
                                // elements. If the event did not fire, cancel sorting.
                                if (!('dropindex' in ui.item.sortable)) {
                                    element.sortable('cancel');
                                    ui.item.sortable.cancel();
                                }

                                // Remove the item from this list's model and copy data into item,
                                // so the next list can retrive it
                                if (!ui.item.sortable.isCanceled()) {
                                    scope.$apply/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
                                        ui.item.sortable.moved = ngModel.$modelValue.splice(
                                            ui.item.sortable.index, 1)[0];
                                    });
                                }
                            };

                            wrappers.helper = function (inner) {
                                if (inner && typeof inner === 'function') {
                                    return function (e, item) {
                                        var innerResult = inner.apply(this, arguments);
                                        item.sortable._isCustomHelperUsed = item !== innerResult;
                                        return innerResult;
                                    };
                                }
                                return inner;
                            };

                            scope.$watch('uiSortable', function(newVal /*, oldVal*/) {
                                // ensure that the jquery-ui-sortable widget instance
                                // is still bound to the directive's element
                                var sortableWidgetInstance = getSortableWidgetInstance(element);
                                if (!!sortableWidgetInstance) {
                                    angular.forEach(newVal, function(value, key) {
                                        // if it's a custom option of the directive,
                                        // handle it approprietly
                                        if (key in directiveOpts) {
                                            if (key === 'ui-floating' && (value === false || value === true)) {
                                                sortableWidgetInstance.floating = value;
                                            }

                                            opts[key] = value;
                                            return;
                                        }

                                        if (callbacks[key]) {
                                            if( key === 'stop' ){
                                                // call apply after stop
                                                value = combineCallbacks(
                                                    value, function() { scope.$apply(); });

                                                value = combineCallbacks(value, afterStop);
                                            }
                                            // wrap the callback
                                            value = combineCallbacks(callbacks[key], value);
                                        } else if (wrappers[key]) {
                                            value = wrappers[key](value);
                                        }

                                        opts[key] = value;
                                        element.sortable('option', key, value);
                                    });
                                }
                            }, true);

                            angular.forEach(callbacks, function(value, key) {
                                opts[key] = combineCallbacks(value, opts[key]);
                                if( key === 'stop' ){
                                    opts[key] = combineCallbacks(opts[key], afterStop);
                                }
                            });

                        } else {
                            $log.info('ui.sortable: ngModel not provided!', element);
                        }

                        // Create sortable
                        scope.isSortable ? element.sortable(opts) : "";
                    }
                };
            }
        ]);

})(window, window.angular);

/**
 * Auto expand textarea field
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    htmlStringToContent.$inject = ["Core", "$sce"];
    angular.module('zAdmin.theme')
        .directive('htmlStringToContent', htmlStringToContent);

    /** @ngInject */
    function htmlStringToContent(Core,$sce) {
        return {
            restrict: 'A',
            'scope':{
              'elemValue':'='
            },
            link: function ($scope, elem) {
                var htmlRegExp = /<[a-z][\s\S]*>/i;
                var stringToCheck = $scope.elemValue;
                if(htmlRegExp.test(stringToCheck)){
                    var htmlElements = $.parseHTML( stringToCheck );
                    $scope.dataAsHtml = $('<div></div>').append(htmlElements);
                    $scope.thisCanBeusedInsideNgBindHtml = $sce.trustAsHtml(stringToCheck);
                    $scope.elemValue = $scope.dataAsHtml[0].innerText;
                    $(elem).addClass('table-object');
                    $(elem).on('click',function(){
                        var objectToDisplay = {'name':'Project description','htmlContent':$scope.thisCanBeusedInsideNgBindHtml};
                        var pageLink = 'app/pages/ui/modals/modalTemplates/htmlContentModal.html';
                        Core.showMore(objectToDisplay, pageLink)
                    })
                }
            }
        };
    }

})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';
    angular.module('zAdmin.theme')
        .directive("uccaTokenizer", ["UccaTokenizerService", "$timeout", function(UccaTokenizerService, $timeout){
        return {
            link:link,
            restrict: 'A',
            scope: {
                passageText: "=",
                tokenizedText: "=",
                textTokens: "="
            }

        }

        function link(scope, el, attr){


            scope.textTokens = UccaTokenizerService.getTokensFromText(scope.tokenizedText, scope.passageText);


            scope.$watch("tokenizedText", function(){
                updateTextTokens();
            });

            function updateTextTokens(){
                scope.textTokens = UccaTokenizerService.getTokensFromText(scope.tokenizedText, scope.passageText);
                console.log('updateTokens');

                $timeout(function(){scope.$apply},2);
            }

        }
    }])
})();
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('trackWidth', trackWidth);

  /** @ngInject */
  function trackWidth() {
    return {
      scope: {
        trackWidth: '=',
        minWidth: '=',
      },
      link: function (scope, element) {
        scope.trackWidth = $(element).width() < scope.minWidth;
        scope.prevTrackWidth = scope.trackWidth;

        $(window).resize(function() {
          var trackWidth = $(element).width() < scope.minWidth;
          if (trackWidth !== scope.prevTrackWidth) {
            scope.$apply(function() {
              scope.trackWidth = trackWidth;
            });
          }
          scope.prevTrackWidth = trackWidth;
        });
      }
    };
  }

})();
/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  zoomIn.$inject = ["$timeout", "$rootScope"];
  angular.module('zAdmin.theme')
      .directive('zoomIn', zoomIn);

  /** @ngInject */
  function zoomIn($timeout, $rootScope) {
    return {
      restrict: 'A',
      link: function ($scope, elem) {
        var delay = 1000;

        if ($rootScope.$pageFinishedLoading) {
          delay = 100;
        }

        $timeout(function(){
          elem.removeClass('full-invisible');
          elem.addClass('animated zoomIn');
        }, delay);
      }
    };
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .service('baUtil', baUtil);

  /** @ngInject */
  function baUtil() {

    this.isDescendant = function(parent, child) {
      var node = child.parentNode;
      while (node != null) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    this.hexToRGB = function(hex, alpha) {
      var r = parseInt( hex.slice(1,3), 16 );
      var g = parseInt( hex.slice(3,5), 16 );
      var b = parseInt( hex.slice(5,7), 16 );
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    }
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  fileReader.$inject = ["$q"];
  angular.module('zAdmin.theme')
      .service('fileReader', fileReader);

  /** @ngInject */
  function fileReader($q) {
    var onLoad = function(reader, deferred, scope) {
      return function () {
        scope.$apply/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
          deferred.resolve(reader.result);
        });
      };
    };

    var onError = function (reader, deferred, scope) {
      return function () {
        scope.$apply/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
          deferred.reject(reader.result);
        });
      };
    };

    var onProgress = function(reader, scope) {
      return function (event) {
        scope.$broadcast('fileProgress',
            {
              total: event.total,
              loaded: event.loaded
            });
      };
    };

    var getReader = function(deferred, scope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, scope);
      reader.onerror = onError(reader, deferred, scope);
      reader.onprogress = onProgress(reader, scope);
      return reader;
    };

    var readAsDataURL = function (file, scope) {
      var deferred = $q.defer();

      var reader = getReader(deferred, scope);
      reader.readAsDataURL(file);

      return deferred.promise;
    };

    return {
      readAsDataUrl: readAsDataURL
    };
  }
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  preloader.$inject = ["$q"];
  angular.module('zAdmin.theme')
    .service('preloader', preloader);

  /** @ngInject */
  function preloader($q) {
    return {
      loadImg: function (src) {
        var d = $q.defer();
        var img = new Image();
        img.src = src;
        img.onload = function(){
          d.resolve();
        };
        return d.promise;
      },
      loadAmCharts : function(){
        var d = $q.defer();
        AmCharts.ready(function(){
          d.resolve();
        });
        return d.promise;
      }
    }
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  stopableInterval.$inject = ["$window"];
  angular.module('zAdmin.theme')
    .service('stopableInterval', stopableInterval);

  /** @ngInject */
  function stopableInterval($window) {
    return {
      start: function (interval, calback, time) {
        function startInterval() {
          return interval(calback, time);
        }

        var i = startInterval();

        angular.element($window).bind('focus', function () {
          if (i) interval.cancel(i);
          i = startInterval();
        });

        angular.element($window).bind('z', function () {
          if (i) interval.cancel(i);
        });
      }
    }
  }

})();
(function() {
    'use strict';

    DataService.$inject = ["$q", "$http", "apiService", "$rootScope", "restrictionsValidatorService", "ENV_CONST", "Core", "$timeout"];
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
            saveTask: saveTask,
            submitTask: submitTask,
            initTree:initTree,
            deleteUnit:deleteUnit,
            getSibling:getSibling,
            createHashTables:createHashTables,
            isTokenInUnit:isTokenInUnit,
            resetTree:resetTree,
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

        function resetTree(){
            return $q(function(resolve, reject) {
                try{
                    $rootScope.$broadcast("DeleteSuccess",{reset:true});
                    DataService.tree.AnnotationUnits = [];

                    DataService.tree.AnnotationUnits.tokens.forEach(function(token){
                        token["inParent"] = null;
                    });

                    $rootScope.$broadcast("ResetSuccess");

                    return resolve('Success');
                }catch(e){
                    return resolve('Failed');
                }
            })

        }

        function toggleCategoryForUnit(unitId,category){
            return $q(function(resolve, reject) {
                var unit = getUnitById(unitId);
                var elementPos = unit.categories.map(function(x) {return x.id; }).indexOf(category.id);
                if(elementPos === -1){
                    unit.categories.push(category);
                }else{
                    if(unit.categories.length > 1){
                        unit.categories.splice(elementPos,1);
                    }else{
                        unit.categories = [];
                    }
                }
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
                var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.id; }).indexOf(token.id);
                if(tokenPosition > -1){
                    tokenInUnit = selectedUnit.AnnotationUnits[i].annotation_unit_tree_id;
                    break;
                }
            }
            return tokenInUnit;
        }

        function insertToTree(newObject,level){
            return $q(function(resolve, reject) {

                var parentUnit = getUnitById(level);
                if(!parentUnit.AnnotationUnits){
                    parentUnit.AnnotationUnits = [];
                }
                if(level.toString() === "0"){
                    //Passage unit or it children units.
                    newObject.annotation_unit_tree_id = parseInt(parentUnit.AnnotationUnits.length + 1).toString();
                }else{
                    newObject.annotation_unit_tree_id = level + '-' +  parseInt(parentUnit.AnnotationUnits.length + 1);
                }
                newObject.comment = "";

                var units = [];

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

                if(units.length > 1){
                    units.forEach(function(unit){
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function(x) {return x.annotation_unit_tree_id; }).indexOf(unit.id);
                        if(newObject.AnnotationUnits === undefined){
                            newObject.AnnotationUnits = [];
                        }
                        if(elementPos > -1){
                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
                            parentUnit.AnnotationUnits.splice(elementPos,1);
                        }
                    })
                }

                newObject.unitType =  newObject.unitType ? newObject.unitType : "REGULAR";

                if(newObject.unitType !== "IMPLICIT" && !restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit,newObject,DataService.hashTables.tokensHashTable)){
                    // if no unit has been added, return the parent unitRowId
                    return level;
                }

                parentUnit.AnnotationUnits.push(newObject);

                parentUnit.gui_status = "OPEN";

                updateTreeIds(DataService.tree);

                sortTree(DataService.tree.AnnotationUnits);

                updateTreeIds(DataService.tree);

                newObject.unitType !== "REMOTE" ? $rootScope.$broadcast("InsertSuccess",{dataBlock: { id: level, AnnotationUnits: getUnitById(level).AnnotationUnits} }) : '';

                return resolve({status: 'InsertSuccess',id: newObject.annotation_unit_tree_id});
            });
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
                        if(parentUnit.AnnotationUnits[i].unitType === "IMPLICIT"){
                            parentUnit.AnnotationUnits.splice(i,1);
                            i--;
                        }
                    }
                }

                updateTreeIds(DataService.tree);

                sortTree(DataService.tree.AnnotationUnits);

                updateTreeIds(DataService.tree);

                $rootScope.$broadcast("DeleteSuccess",{categories: unit.categories, id: unit.annotation_unit_tree_id});

                resolve('DeleteSuccess');
            });
        }

        function sortTree(annotationUnits) {
            if (annotationUnits.length > 1) {
                annotationUnits.sort(sortUnits);

            }
            for (var i = 0; i < annotationUnits.length; i++) {
                sortTree(annotationUnits[i].AnnotationUnits || []);
            }
        }

        function updateTreeIds(unit,treeId){
            if(unit.annotation_unit_tree_id){

                unit.tokens.forEach(function(token){
                    token.parentId = unit.annotation_unit_tree_id;

                    var isTokenInUnit = DataService.isTokenInUnit(unit,token);

                    if(isTokenInUnit){
                        token.inUnit = isTokenInUnit;
                    }
                });

            }
            if(unit.AnnotationUnits && unit.AnnotationUnits.length > 0){
                for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                    unit.AnnotationUnits[i].annotation_unit_tree_id = unit.annotation_unit_tree_id === "0" ? (i+1).toString() : treeId+"-"+(i+1).toString();
                    unit.AnnotationUnits[i].tokens.forEach(function(token){
                        token.parentId = unit.AnnotationUnits[i].annotation_unit_tree_id;

                        var isTokenInUnit = DataService.isTokenInUnit(unit.AnnotationUnits[i],token);

                        if(isTokenInUnit){
                            token.inUnit = isTokenInUnit;
                        }
                    });
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
            if(tokenStartIndexInParent(a.tokens[0]) > tokenStartIndexInParent(b.tokens[0])){
                return 1;
            }else if(tokenStartIndexInParent(a.tokens[0]) < tokenStartIndexInParent(b.tokens[0])){
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
                categories: filterCategoriesAtt(treeNode.categories) || [],
                parent_id: treeNode.unitType === 'REMOTE' ? DataService.getParentUnitId(treeNode.annotation_unit_tree_id) : DataService.getParentUnitId(treeNode.annotation_unit_tree_id),
                gui_status : treeNode.gui_status || "OPEN",
                type: angular.copy(treeNode.unitType.toUpperCase()),
                is_remote_copy: treeNode.unitType.toUpperCase() === 'REMOTE',
                children_tokens: treeNode.annotation_unit_tree_id === "0" ? filterTokensAtt(angular.copy(treeNode.tokens)) : filterTokensAttForUnit(angular.copy(treeNode.tokens))
            };
            if(unit.annotation_unit_tree_id === "0"){
                delete unit.children_tokens;
            }
            unit.type === 'REMOTE' ? unit.type = 'REGULAR' : '';
            if(unit.categories.length === 1 && unit.categories[0].id === null){
                unit.categories = [];
            }

            if(unit.type === "IMPLICIT"){
                delete unit.children_tokens;
            }
            annotation_units.push(unit);
            for(var i=0; i<treeNode.AnnotationUnits.length; i++){
                traversInTree(treeNode.AnnotationUnits[i]);
            }
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
            traversInTree(DataService.tree);
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
                    var unitIndex = tempUnit.AnnotationUnits.findIndex(function(unit){return unit.annotation_unit_tree_id == unitIdToFind});
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
(function() {
    'use strict';

    DefinitionsService.$inject = ["DataService"];
    angular.module('zAdmin.annotation.data')
        .factory('DefinitionsService',DefinitionsService);

    var definitionsUrl = 'app/resources/annotation/definitions.json';

    /**
     * Get the restrictions list from the json file.
     * @param DataService - Service that handles data.
     * @returns {{getDefinitions: getDefinitions}} - the array of restrictions.
     */

    /** @ngInject */
    function DefinitionsService(DataService) {
        var DefinitionsService = {
            getDefinitions: getDefinitions,
            getDefinitionsById: getDefinitionsById
        };

        return DefinitionsService;

        /**
         * Get the restrictions json.
         * @returns {*} - a json file.
         */
        function getDefinitions(){
            return DataService.getData(definitionsUrl);
        }

        function getDefinitionsById(categoryId){
            DefinitionsService.getDefinitions().then(function(response){
                for(var i = 0; i < categories.length; i++ ){
                    if(categories[i].id == categoryId){
                        return categories[i];
                    }
                }
            });

        }
    }

})();
(function() {
    'use strict';

    angular.module('zAdmin.annotation.hotKeysManager')
        .factory('HotKeysManager',HotKeysManager);


    /** @ngInject */
    function HotKeysManager() {
        var HotKeysManager = {
            mouseDown: false,
            hotKeys:{},
            focusedUnit: '0',
            addHotKey:addHotKey,
            updatePressedHotKeys:updatePressedHotKeys,
            executeOperation:executeOperation,
            checkIfHotKeyIsPressed:checkIfHotKeyIsPressed,
            getFocusedUnit: getFocusedUnit,
            setFocusedUnit: setFocusedUnit,
            setMouseMode:setMouseMode,
            getMouseMode: getMouseMode
        };
        
        return HotKeysManager;

        function addHotKey(hotKeyName){
            HotKeysManager.hotKeys[hotKeyName] = {};
            HotKeysManager.hotKeys[hotKeyName]['pressed'] = false;
        }

        function executeOperation(hotKey){
            return hotKey.callbackFunction;
        }

        function updatePressedHotKeys(hotKey,mode){
            HotKeysManager.hotKeys[hotKey.combo]['pressed'] = mode;
        }

        function checkIfHotKeyIsPressed(hotKey){
            return HotKeysManager.hotKeys[hotKey]['pressed'];
        }

        function getFocusedUnit(){
            return HotKeysManager.focusedUnit;
        }

        function setFocusedUnit(newValue){
            HotKeysManager.focusedUnit = newValue;
        }

        function setMouseMode(isMouseDown){
            HotKeysManager.mouseDown = isMouseDown;
        }

        function getMouseMode(){
            return HotKeysManager.mouseDown;
        }
        
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    selectionHandlerService.$inject = ["DataService"];
    angular.module('zAdmin.annotation.selectionHandler')
        .service('selectionHandlerService', selectionHandlerService);

    /** @ngInject */
    function selectionHandlerService(DataService) {
        var selectedTokenList = [];
        var selectedUnit = "0";
        var tokenClicked = false;
        var selectionDirection = "DOWN";
        var unitToAddRemotes = "0";


        var _handler = {
            selectedTokenList: selectedTokenList,
            selectedUnit:selectedUnit,
            selectionDirection:selectionDirection,
            unitToAddRemotes:unitToAddRemotes,
            getSelectedTokenList: function(){
                return this.selectedTokenList;
            },
            isTokenClicked: function(){
              return this.tokenClicked;
            },
            setTokenClicked: function(){
                this.tokenClicked = true;
            },
            disableTokenClicked: function(){
                this.tokenClicked = false;
            },
            setUnitToAddRemotes: function(id){
                this.unitToAddRemotes = id;
            },
            getUnitToAddRemotes: function(id){
                return this.unitToAddRemotes;
            },
            addTokenToList: function(token,selectedUnit,groupUnit){
                var elementPos = this.selectedTokenList.map(function(x) {return x.id; }).indexOf(token.id);
                if(elementPos === -1){
                    !groupUnit ? _handler.removeTokenFromUnitTokens(token) : '';
                    var copiedToken = angular.copy(token);
                    this.selectedTokenList.push(copiedToken);
                    sortSelectedTokenList(this.selectedTokenList);
                    updatePositionInUnitAttribute(this.selectedTokenList);
                    updateNextTokenNotAdjacent(this.selectedTokenList);
                    updateLastTokenNotAdjacent(this.selectedTokenList);
                }
                this.selectedUnit = selectedUnit;
            },
            setSelectionDirection: function(mode){
              this.selectionDirection = mode;
            },
            getSelectionDirection: function(mode){
                return this.selectionDirection;
            },
            removeTokenFromList: function(tokenId){
                var elementPos = this.selectedTokenList.map(function(x) {return x.id; }).indexOf(tokenId);
                var objectFound = this.selectedTokenList[elementPos];
                // _handler.addTokenFromUnitTokens();
                this.selectedTokenList.splice(elementPos,1);
            },
            removeTokenFromUnitTokens: function(token){
                var unit = DataService.getUnitById(_handler.getSelectedUnitId());
                if(unit){
                    if(unit.tokenCopy === undefined){
                        unit.tokenCopy = [];
                        for(var key in unit.children_tokens_hash){
                            unit.tokenCopy.push(unit.children_tokens_hash[key]);
                        }
                    }
                    var elementPos = unit.tokenCopy.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos > -1){
                        var selectedUnitId = _handler.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);
                        if(selectedUnit.AnnotationUnits === undefined){
                            selectedUnit.AnnotationUnits = [];
                        }
                        var tokenInUnit = _handler.isTokenInUnit(selectedUnit,token);
                        !tokenInUnit ? token['inUnit'] = selectedUnitId.toString() === "0" ? (selectedUnit.AnnotationUnits.length + 1).toString() : selectedUnit.annotation_unit_tree_id + "-" +(selectedUnit.AnnotationUnits.length + 1).toString() : ''

                    }
                }

            },
            isTokenInUnit: function(selectedUnit,token){
                var tokenInUnit = false;
                for(var i=0; i<selectedUnit.AnnotationUnits.length; i++){
                    var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(tokenPosition > -1){
                        tokenInUnit = true;
                        break;
                    }
                }
                return tokenInUnit;
            },
            clearTokenList: function(afterInsert){
                if(!afterInsert){
                    _handler.getSelectedTokenList().forEach(function(token){
                        if(token.parentId === undefined){
                            token.parentId = "0";
                        }
                        var parentUnit = DataService.getUnitById(DataService.getParentUnitId(token.parentId));
                        var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                        var tokenInUnit = false;
                        for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                            var tokenPosition = parentUnit.AnnotationUnits[i].tokens.map(function(x) {return x.id; }).indexOf(token.id);
                            if(tokenPosition > -1){
                                tokenInUnit = true;
                                break;
                            }
                        }
                        !tokenInUnit ? parentUnit.tokens[elementPos]['inUnit'] = null : '';
                    });
                }

                this.selectedTokenList.forEach(function(token){
                    token.inUnit = null;
                });

                this.selectedTokenList = [];
            },
            addTokenFromUnitTokens: function(token){
                var unit = DataService.getUnitById(_handler.getSelectedUnitId());
                var elementPos = this.selectedTokenList.map(function(x) {return x.id; }).indexOf(token.id);
                if(elementPos === -1){
                    unit.tokenCopy.push(token);
                }
            },
            updateSelectedUnit: function(index,afterInsert){
                this.selectedUnit = index.toString();
                if(!_handler.isTokenClicked()){
                    _handler.clearTokenList(afterInsert);
                }
                _handler.disableTokenClicked();
            },
            getSelectedUnitId: function(){
                return this.selectedUnit;
            },
            initTree: function(data){
                DataService.currentTask.annotation_units.forEach(function(unit,index){
                    var tokenStack = [];
                    if(unit.type === "IMPLICIT"){
                        var objToPush = {
                            rowId : '',
                            text : '<span>IMPLICIT UNIT</span>',
                            numOfAnnotationUnits: 0,
                            categories:[],
                            comment:"",
                            rowShape:'',
                            unitType:'IMPLICIT',
                            orderNumber: '-1',
                            gui_status:'OPEN',
                            usedAsRemote:[],
                            children_tokens:[],
                            containsAllParentUnits: false,
                            tokens:[{
                                "text":"IMPLICIT UNIT",
                                "parentId":unit.parent_id,
                                "inUnit":null
                            }],
                            AnnotationUnits : [

                            ]
                        };
                        var newRowId = DataService.insertToTree(objToPush,unit.parent_id);

                        unit.categories.forEach(function(category,index){
                            _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],unit.annotation_unit_tree_id);
                            _handler.clearTokenList();
                        });

                    }else if(unit.is_remote_copy){

                        DataService.unitType = 'REMOTE';

                        unit["tokens"] = [];

                        unit.unitType = "REMOTE";

                        unit.children_tokens.forEach(function(token){
                            unit["tokens"].push(DataService.hashTables.tokensHashTable[token.id]);
                        });
                        unit["children_tokens"] = unit["tokens"];

                        unit["remote_original_id"] = angular.copy(unit.annotation_unit_tree_id);

                        unit.categories.forEach(function(category,index){
                            if(index === 0){
                                _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],null,unit);
                            }else{
                                _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],unit.parent_id + "-"  + unit.annotation_unit_tree_id);
                            }
                            _handler.clearTokenList();
                        });

                        if(unit.categories.length === 0){
                            _handler.toggleCategory(null,null,unit);
                        }

                        DataService.unitType = 'REGULAR';

                        var unitToAddTo = DataService.getUnitById(unit.annotation_unit_tree_id);

                        if(unitToAddTo){
                            if(unitToAddTo.usedAsRemote === undefined){
                                unitToAddTo["usedAsRemote"] = [];
                            }

                            var remotePosition = DataService.getUnitById(unit.remote_original_id).AnnotationUnits.map(function(x) {return x.id; }).indexOf(unit.id);
                            if(remotePosition > -1){
                                unitToAddTo["usedAsRemote"].push(DataService.getUnitById(unit.parent_id).AnnotationUnits[remotePosition].annotation_unit_tree_id);
                            }else{
                                unitToAddTo["usedAsRemote"].push(unit.parent_id + "-" + unit.annotation_unit_tree_id);
                            }
                        }

                        if(DataService.unitsUsedAsRemote[unit.annotation_unit_tree_id] === undefined){
                            DataService.unitsUsedAsRemote[unit.annotation_unit_tree_id] = {};
                        }
                        DataService.unitsUsedAsRemote[unit.annotation_unit_tree_id][unit.parent_id + "-" + unit.annotation_unit_tree_id] = true;



                        // selectionHandlerService.setUnitToAddRemotes("0");
                        $('.annotation-page-container').toggleClass('crosshair-cursor');

                    }else if(unit.annotation_unit_tree_id !== "0"){
                        unit.children_tokens.forEach(function(token){
                            var parentId = unit.annotation_unit_tree_id.length === 1 ? "0" : unit.annotation_unit_tree_id.split("-").slice(0,unit.annotation_unit_tree_id.split("-").length-1).join("-");
                            _handler.addTokenToList(DataService.hashTables.tokensHashTable[token.id],parentId)
                        });
                        if(unit.categories.length === 0){
                            _handler.toggleCategory();
                        }else{
                            unit.categories.forEach(function(category,index){
                                if(index === 0){
                                    _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],false,false,unit.gui_status);
                                }else{
                                    _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],unit.annotation_unit_tree_id);
                                }
                                _handler.clearTokenList();
                            });

                        }
                        _handler.clearTokenList();
                    }


                });
                DataService.unitType = 'REGULAR';
            },
            toggleCategory: function(category,justToggle,remote,gui_status){

                if(this.selectedTokenList.length > 0 && newUnitContainAllParentTokensTwice(this.selectedTokenList)){
                    return
                }

                if(!aUnitIsSelected(this.selectedTokenList) && (this.selectedTokenList.length && !justToggle) || remote){
                    //This mean we selected token and now we need to create new unit.
                    var newUnit = {
                        tokens : angular.copy(this.selectedTokenList),
                        categories:[],
                        gui_status:gui_status
                    };
                    if(remote){
                        newUnit = angular.copy(remote);
                        var tempCat = angular.copy(newUnit.categories[0]);
                        newUnit.categories = [];
                        tempCat !== undefined ? newUnit.categories.push(DataService.hashTables.categoriesHashTable[tempCat.id]) : '';

                        this.selectedUnit = newUnit.parent_id;

                    }

                    category !== null && !remote ? newUnit.categories.push(angular.copy(category)) : '';
                    DataService.insertToTree(newUnit,this.selectedUnit).then(function(res){
                        if(res === "InsertSuccess"){
                            _handler.clearTokenList(true);
                        }
                    });
                }else{
                    if(justToggle){
                        _handler.updateSelectedUnit(justToggle);
                    }
                    //Toggle the category for existing unit
                    if(this.selectedUnit.toString() !== "0"){
                        DataService.toggleCategoryForUnit(this.selectedUnit,category).then(function(res){
                            if(res === "ToggleSuccess"){
                                _handler.clearTokenList();
                            }
                        })
                    }
                }
            }

        };

        function newUnitContainAllParentTokensTwice(selectedTokenList){
            var currentUnit = DataService.getUnitById(selectedTokenList[0].parentId);

            if(currentUnit.annotation_unit_tree_id !== "0"){
                var parentUnit = DataService.getUnitById(DataService.getParentUnitId(currentUnit.annotation_unit_tree_id));

                return compareUnitsTokens(selectedTokenList,currentUnit.tokens) && compareUnitsTokens(currentUnit.tokens,parentUnit.tokens);
            }

        }

        function compareUnitsTokens(unitATokens,unitBTokens){
            var result = true;
            if(unitATokens.length === unitBTokens.length){
                unitATokens.forEach(function(token){
                    var elementPos = unitBTokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos === -1){
                        result = false;
                    }
                })
            }else{
                result = false;
            }
            return result;
        }

        function aUnitIsSelected(selectedTokenList){
            var result = true;
            var unitId = null;

            if(selectedTokenList.length === 0){
                return false;
            }
            unitId = selectedTokenList[0].inUnit;

            if(unitId === null){
                return false;
            }
            selectedTokenList.forEach(function(token){
                if(unitId !== token.inUnit){
                    result = false;
                }
            });

            if(!result ){
                return false
            }

            var tokenInUnit = selectedTokenList[0].inUnit;
            tokenInUnit && DataService.getUnitById(tokenInUnit) ? _handler.updateSelectedUnit(tokenInUnit) : '';
            return DataService.getUnitById(tokenInUnit);
        }

        function updatePositionInUnitAttribute(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                if(selectedTokenList.length === 1){
                    token['positionInUnit'] = 'FirstAndLast';
                }else if(index === 0){
                    token['positionInUnit'] = 'First';
                }else if(index === selectedTokenList.length-1){
                    token['positionInUnit'] = 'Last';
                }else{
                    token['positionInUnit'] = 'Middle';
                }
            })
        }

        function updateNextTokenNotAdjacent(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                if(index === selectedTokenList.length-1 || token.end_index + 2 === selectedTokenList[index+1].start_index){
                    token['nextTokenNotAdjacent'] = false;
                }else if(token.end_index + 2 !== selectedTokenList[index+1].start_index){
                    token['nextTokenNotAdjacent'] = true;
                }

            })

        }
        function updateLastTokenNotAdjacent(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                if(index === 0 || token.start_index - 2 === selectedTokenList[index-1].end_index){
                    token['lastTokenNotAdjacent'] = false;
                }else if(token.start_index - 2 !== selectedTokenList[index-1].end_index){
                    token['lastTokenNotAdjacent'] = true;
                }

                if(token["positionInUnit"] === "First" && token['nextTokenNotAdjacent']){
                    token['positionInUnit'] = 'FirstAndLast';
                }
                if(token["positionInUnit"] === "Last" && token['lastTokenNotAdjacent']){
                    token['positionInUnit'] = 'FirstAndLast';
                }
                if(token["positionInUnit"] === "Middle" && token['lastTokenNotAdjacent'] && token['nextTokenNotAdjacent']){
                    token['positionInUnit'] = 'FirstAndLast';
                }
                if(token["positionInUnit"] === "Middle" && token['lastTokenNotAdjacent']){
                    token['positionInUnit'] = 'First';
                }
                if(token["positionInUnit"] === "Middle" && token['nextTokenNotAdjacent']){
                    token['positionInUnit'] = 'Last';
                }

            })

        }

        function sortSelectedTokenList(selectedTokenList){
            selectedTokenList.sort(function(a,b){
                if(a.start_index > b.start_index){
                    return 1;
                }else if(a.start_index < b.start_index){
                    return -1;
                }else{
                    return 0;
                }
            })
        }

        return _handler;
    }

})();



/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    restrictionsValidatorService.$inject = ["$timeout", "$rootScope", "$location", "ENV_CONST", "$uibModal"];
    angular.module('zAdmin.restrictionsValidator',[
        'zAdmin.const'
    ])
        .service('restrictionsValidatorService', restrictionsValidatorService);

    /** @ngInject */
    function restrictionsValidatorService($timeout,$rootScope,$location,ENV_CONST,$uibModal) {
        /*
            %NAME%, %NAME_1%, %NAME_2% 
            will change to the category name in the alert modal
        */
        var errorMasseges ={
            FORBID_ANY_CHILD : 'category %NAME% cannot have any child.',
            FORBID_CHILD : 'category %NAME_1% cannot have child with category %NAME_2%.',
            FORBID_SIBLING: 'category %NAME_1% cannot have sibling with category %NAME_2%.',
            REQUIRE_SIBLING: 'category %NAME_1% must have sibling with category %NAME_2%.',
            REQUIRE_CHILD: 'category %NAME_1% must have a child with category %NAME_2%..',
            UNIT_CONTAIN_ONLY_PUNCTUATIONS : 'You cannot create annotation unit from only punctuation tokens'
        };
        var restrictionsTables;
        var handler = {
          initRestrictionsTables: initRestrictionsTables,
          checkRestrictionsBeforeInsert: checkRestrictionsBeforeInsert,
          checkRestrictionsOnFinish: checkRestrictionsOnFinish,
          evaluateFinishAll: evaluateFinishAll
        };
        return handler;

        function initRestrictionsTableObject(){
            restrictionsTables = {
                FORBID_ANY_CHILD: {},
                FORBID_CHILD:{},
                FORBID_SIBLING:{},
                REQUIRE_CHILD: {},
                REQUIRE_SIBLING:{}
            };
        }

        function initRestrictionsTables(layer_restrictions){
            initRestrictionsTableObject();
            // console.log(layer_restrictions);
            layer_restrictions.forEach(function(restriction){
                addRestrictionToTable(restriction);
            });
            // console.log(restrictionsTables);

        }

        function addRestrictionToTable(restriction){
            var categories_1 = restriction.categories_1[0].id ? restriction.categories_1 : JSON.parse(restriction.categories_1.replace(/'/g,'"'));
            var categories_2 = restriction.categories_2[0] ? restriction.categories_2[0].id ? restriction.categories_2 : JSON.parse(restriction.categories_2.replace(/'/g,'"')) : [];
            switch(restriction.type){
                case 'FORBID_ANY_CHILD':
                    categories_1.forEach(function(category_1){
                        restrictionsTables.FORBID_ANY_CHILD[category_1.id] = 'All'
                    });
                    break;
                default:
                    categories_1.forEach(function(category_1){
                        restrictionsTables[restriction.type][category_1.id] = {};
                        categories_2.forEach(function(category_2){
                            restrictionsTables[restriction.type][category_1.id][category_2.id] = category_2.name;
                        });
                    });
                    break;
            }
        }

        function checkRestrictionsBeforeInsert(parentAnnotationUnit, newAnnotationUnit,tokensHashTable){
            newAnnotationUnit.children_tokens = newAnnotationUnit.tokens;
            var result = doesUnitContainsOnlyPunctuation(newAnnotationUnit,tokensHashTable);
            if(result){
                var msg = errorMasseges['UNIT_CONTAIN_ONLY_PUNCTUATIONS'];
                showErrorModal(msg);
                return false;
            }
            result = checkIfUnitViolateForbidAnyChildRestriction(parentAnnotationUnit);
            if(result){
                var replacements  = {"%NAME%":result.name};
                var msg = errorMasseges['FORBID_ANY_CHILD'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            result = checkIfUnitViolateForbidChildRestriction(parentAnnotationUnit,newAnnotationUnit);
            if(result){
                var replacements  = {"%NAME_1%":result[0].name, "%NAME_2%":result[1].name};
                var msg = errorMasseges['FORBID_CHILD'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            result = checkIfUnitViolateForbidSiblingRestriction(parentAnnotationUnit,newAnnotationUnit);
            if(result){
                var replacements  = {"%NAME_1%":result[0].name, "%NAME_2%":result[1].name};
                var msg = errorMasseges['FORBID_SIBLING'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            return true;
        }
        
        function doesUnitContainsOnlyPunctuation(newAnnotationUnit,tokensHashTable){
            var isOnlyPunc = true;
            newAnnotationUnit.children_tokens.forEach(function(token){
                var currentToken = tokensHashTable[token.id];
                if(currentToken.require_annotation == true){
                    isOnlyPunc = false;
                }
            })
            return isOnlyPunc;
        }

        function checkIfUnitViolateForbidAnyChildRestriction(parentAnnotationUnit){
            if(parentAnnotationUnit.annotation_unit_tree_id != "0"){
                //Go through all of the parent annotation unit categories and check if they exists in the FORBID_ANY_CHILD restrictions table.
                for(var i=0; i< parentAnnotationUnit.categories.length; i++){
                    var currentCategory = parentAnnotationUnit.categories[i];
                    if(currentCategory && restrictionsTables['FORBID_ANY_CHILD'][currentCategory.id]){
                        return currentCategory;
                    }
                }
                return false;
            }
            return false;
        }

        function checkIfUnitViolateForbidChildRestriction(parentAnnotationUnit,newAnnotationUnit){
            if(parentAnnotationUnit.annotation_unit_tree_id != "0"){
                //Go through all of the parent annotation unit categories and check if they exists in the FORBID_CHILD restrictions table.
                for(var i=0; i< parentAnnotationUnit.categories.length; i++){
                    var currentCategory = parentAnnotationUnit.categories[i];
                    if(currentCategory && restrictionsTables['FORBID_CHILD'][currentCategory.id]){
                        for(var j=0; j< newAnnotationUnit.categories.length; j++){
                            var newAnnotationCurrentCategory = newAnnotationUnit.categories[j];
                            if(currentCategory && newAnnotationCurrentCategory && restrictionsTables['FORBID_CHILD'][currentCategory.id] && restrictionsTables['FORBID_CHILD'][currentCategory.id][newAnnotationCurrentCategory.id]){
                                return [currentCategory,newAnnotationCurrentCategory];
                            }
                        }
                    }
                }
                return false;
            }
            return false;
        }

        function checkIfUnitViolateForbidSiblingRestriction(parentAnnotationUnit,newAnnotationUnit){
            for(var i=0; i< parentAnnotationUnit.AnnotationUnits.length; i++){
                var currentAnnotationUnitSibling = parentAnnotationUnit.AnnotationUnits[i];
                for(var j=0; j< currentAnnotationUnitSibling.categories.length; j++){
                    var currentCategory = currentAnnotationUnitSibling.categories[j];
                    for(var k=0; k< newAnnotationUnit.categories.length; k++){
                        var newAnnotationUnitCategory = newAnnotationUnit.categories[k];
                        if(currentCategory && newAnnotationUnitCategory && newAnnotationUnitCategory && restrictionsTables['FORBID_SIBLING'][newAnnotationUnitCategory.id] && restrictionsTables['FORBID_SIBLING'][newAnnotationUnitCategory.id][currentCategory.id]){
                            return [currentCategory,newAnnotationUnitCategory];
                        } else if(currentCategory && restrictionsTables['FORBID_SIBLING'][currentCategory.id] && restrictionsTables['FORBID_SIBLING'][currentCategory.id][newAnnotationUnitCategory.id]){
                            return [currentCategory,newAnnotationUnitCategory];
                        }
                    }

                }
            }
            return false;
        }

        var VIOLATED_CATEGORY = {}
        function checkRestrictionsOnFinish(annotationUnit,parentUnit,hashTables){
            VIOLATED_CATEGORY = {}
            var vaiolate = false;
            var categories_hash = hashTables.categoriesHashTable;
            
            var violateUnitsCategoriesAmount = checkIfAllUnitsHaveAtLeastOneCategory(annotationUnit,categories_hash);
            // console.log("violateUnitsCategoriesAmount",violateUnitsCategoriesAmount);
            
            if(!violateUnitsCategoriesAmount){
                var vaiolateForbidSibling = checkIfForbidSiblingHandler(annotationUnit,parentUnit);
                // console.log('vaiolateForbidSibling',vaiolateForbidSibling);                
                if(!vaiolateForbidSibling){
                    var vaiolateForbidChild = checkIfForbidChildHandler(annotationUnit);
                    // console.log('vaiolateForbidChild',vaiolateForbidChild);
                    if(!vaiolateForbidChild){
                        var vaiolateRequireSibling  = checkIfUnitViolateRequireSiblingAndAlert(annotationUnit,parentUnit)
                        // console.log('vaiolateRequireSibling',vaiolateRequireSibling);
                        if(!vaiolateRequireSibling){
                            var violateRequireChild = checkIfUnitViolateRequireChildRestrictionAndAlert(annotationUnit);
                            // console.log('violateRequireChild',violateRequireChild);
                            if(violateRequireChild){
                                vaiolate = true;
                            }
                        }else{
                            vaiolate = true;
                        }
                    }else{
                        vaiolate = true;
                    }
                }else{
                    vaiolate = true;
                }
            }else{
                vaiolate = true;
            }
            

            if(!vaiolate){
               annotationUnit.gui_status = 'HIDDEN'
            }

            return !vaiolate;
        }
        function checkIfForbidChildHandler(annotationUnit){
            var isVaioled =  false
            for(var i=0; i<annotationUnit.AnnotationUnits.length; i++){
                var currentChild = annotationUnit.AnnotationUnits[i];
                var result = checkIfUnitViolateForbidChildRestriction(annotationUnit,currentChild);
                restrictionResultHandleForForbidChild(result,annotationUnit);
                
                if(result){
                    return isVaioled = true
                }
                
            }
            return isVaioled
        }

        function checkIfForbidSiblingHandler(annotationUnit,parentUnit){
            var isVaioled =  false
            for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                var currentChild = parentUnit.AnnotationUnits[i];
                var result = checkIfUnitViolateForbidSiblingRestriction(parentUnit,currentChild);
                restrictionResultHandleForForbidSibling(result,annotationUnit);
                
                if(result){
                    return isVaioled = true
                }
                
            }
            return isVaioled
        }

        function checkIfUnitViolateRequireSiblingAndAlert(annotationUnit,parentUnit){
            var result = checkIfUnitViolateRequireSiblingRestriction(annotationUnit,parentUnit);
            restrictionResultHandler(result,annotationUnit,'REQUIRE_SIBLING')
            return result; 
        }
        
        function checkIfUnitViolateRequireSiblingRestriction(annotationUnit,parentUnit){
            var result = false;
            for(var i=0; i< annotationUnit.categories.length; i++){
                // Go over all the unit categories, 
                // and look if there is any category that exists in the restrictionsTables['REQUIRE_SIBLING'];
                var currentCategory = annotationUnit.categories[i];
                if(restrictionsTables['REQUIRE_SIBLING'][currentCategory.id]){
                    // Prepare hash table that will hold the final result. 
                    // whether we found all the required categories.
                    var categoriesIdToLookForFoundNotFoundTable = createCategoriesIdToLookForFoundNotFoundTable({
                        parentCategory: currentCategory,
                        childCategory:restrictionsTables['REQUIRE_SIBLING'][currentCategory.id]
                    });

                    //Go over all the unit siblings and look for the required categories.
                    console.log('REQUIRE_SIBLING annotationUnit',parentUnit);
                    for(var j=0; j<parentUnit.AnnotationUnits.length; j++){
                        var currentAnnotationUnitSibling = parentUnit.AnnotationUnits[j];

                        if(currentAnnotationUnitSibling.annotation_unit_tree_id == annotationUnit.annotation_unit_tree_id){
                            continue
                        }

                        //Go over all the current siblings categories.
                        for(var k=0; k<currentAnnotationUnitSibling.categories.length; k++){
                            var currentAnnotationUnitSiblingCategory = currentAnnotationUnitSibling.categories[k];

                            if(categoriesIdToLookForFoundNotFoundTable.hasOwnProperty(currentAnnotationUnitSiblingCategory.id)){
                                categoriesIdToLookForFoundNotFoundTable[currentAnnotationUnitSiblingCategory.id].isFound = true;
                            }
                        }
                    }
                }
            }

            result = checkIfAllRequiredCategoriesWasFound(categoriesIdToLookForFoundNotFoundTable);
            if(result != false){
                console.log("annotationUnit " + annotationUnit.annotation_unit_tree_id + " is not valid");
                return result;
            }else{
                console.log("annotationUnit " + annotationUnit.annotation_unit_tree_id + " is valid");
                return result;
            }    
        }
        
        function checkIfUnitViolateRequireChildRestrictionAndAlert(annotationUnit){
            var result = checkIfUnitViolateRequireChildRestrictionDeep(annotationUnit);
            restrictionResultHandler(result,annotationUnit,'REQUIRE_CHILD')
            return result;
        }
        function checkIfUnitViolateRequireChildRestrictionDeep(annotationUnit){
            for(var i=0; i<annotationUnit.AnnotationUnits.length; i++){
                checkIfUnitViolateRequireChildRestrictionDeep(annotationUnit.AnnotationUnits[i]);
            }
            if(!!VIOLATED_CATEGORY && !!VIOLATED_CATEGORY.unFoundCategory && VIOLATED_CATEGORY.unFoundCategory.isFound==false){
                return VIOLATED_CATEGORY;
            }
            VIOLATED_CATEGORY = checkIfUnitViolateRequireChildRestriction(annotationUnit);
            console.log('VIOLATED_CATEGORY',VIOLATED_CATEGORY);
            return VIOLATED_CATEGORY
        }

        function restrictionResultHandler(result,annotationUnit,restrictionType){
            if(result){
                var replacements  = {"%NAME_1%": result.parentCategory.name, "%NAME_2%": result.unFoundCategory.name};
                var msg = errorMasseges[restrictionType].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            else {
                // annotationUnit.gui_status = 'HIDDEN';
                return true;
            }
        }

        function restrictionResultHandleForForbidChild(result,annotationUnit){
            if(result){
                var replacements  = {"%NAME_1%":result[0].name, "%NAME_2%":result[1].name};
                var msg = errorMasseges['FORBID_CHILD'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
        }

        function restrictionResultHandleForForbidSibling(result,annotationUnit){
            if(result){
                var replacements  = {"%NAME_1%":result[0].name, "%NAME_2%":result[1].name};
                var msg = errorMasseges['FORBID_SIBLING'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
        }

        function checkIfUnitViolateRequireChildRestriction(annotationUnit){
            var result = false;
            for(var i=0; i< annotationUnit.categories.length; i++){
                // Go over all the unit categories, and look if there is any category that exists in the restrictionsTables['REQUIRE_CHILD'];
                var currentCategory = annotationUnit.categories[i];
                if(restrictionsTables['REQUIRE_CHILD'][currentCategory.id]){
                    // Prepare hash table that will hold the final result. whether we found all the required categories.
                    var categoriesIdToLookForFoundNotFoundTable = createCategoriesIdToLookForFoundNotFoundTable({
                        parentCategory: currentCategory,
                        childCategory:restrictionsTables['REQUIRE_CHILD'][currentCategory.id]
                    });

                    // Go over all the unit children and look for the required categories.
                    for(var j=0; j<annotationUnit.AnnotationUnits.length; j++){
                        var currentAnnotationUnitChild = annotationUnit.AnnotationUnits[j];

                        // Go over all the current child categories.
                        for(var k=0; k<currentAnnotationUnitChild.categories.length; k++){
                            var currentAnnotationUnitChildCategory = currentAnnotationUnitChild.categories[k];

                            if(categoriesIdToLookForFoundNotFoundTable.hasOwnProperty(currentAnnotationUnitChildCategory.id)){
                                categoriesIdToLookForFoundNotFoundTable[currentAnnotationUnitChildCategory.id].isFound = true;
                            }
                        }
                    }
                }
            }

            result = checkIfAllRequiredCategoriesWasFound(categoriesIdToLookForFoundNotFoundTable);
            if(result != false){
                console.log("annotationUnit " + annotationUnit.annotation_unit_tree_id + " is not valid");
                return result;
            }else{
                console.log("annotationUnit " + annotationUnit.annotation_unit_tree_id + " is valid");
                return result;
            }

        }

        function createCategoriesIdToLookForFoundNotFoundTable(requiredCategoriesObject){
            var table = {};
            for(var key in requiredCategoriesObject.childCategory){
                table[key] = {
                    isFound :false,
                    name: requiredCategoriesObject.childCategory[key],
                    parentCategory : requiredCategoriesObject.parentCategory
                }
            }
            return table;
        }

        function checkIfAllRequiredCategoriesWasFound(requiredCategoriesTable){
            for(var key in requiredCategoriesTable){
                if(!requiredCategoriesTable[key].isFound){
                    return {
                        unFoundCategory :requiredCategoriesTable[key],
                        parentCategory : requiredCategoriesTable[key].parentCategory
                    }
                }
            }
            return false;
        }

        var NOT_ALL_TOKENS_IN_UNIT_ERROR = false;
        function evaluateFinishAll(mainPassage,fromSubmit,hashTables){
            var evaluationResult = true;
            if(fromSubmit){
                var hash_tokens = hashTables.tokensHashTable;
                checkIfAllTokenThatRequireAnnotationIsInUnit(mainPassage,hash_tokens,true);
                if(NOT_ALL_TOKENS_IN_UNIT_ERROR){
                    evaluationResult = false;
                }
                NOT_ALL_TOKENS_IN_UNIT_ERROR = false;
            }

            if(!evaluationResult){
                showErrorModal("Not all non-pangtuation tokens are in units.")
                return false
            }else{
                for(var i=0; i<mainPassage.AnnotationUnits.length; i++){
                    evaluationResult = checkRestrictionsOnFinish(mainPassage.AnnotationUnits[i],mainPassage,hashTables);
                    if(!evaluationResult){
                        return false
                    }
                }
                return true;
            }

        }

        function isForbidAnyChild(unit){
            if(unit.annotation_unit_tree_id != "0"){
                //Go through all of the parent annotation unit categories and check if they exists in the FORBID_ANY_CHILD restrictions table.
                for(var i=0; i< unit.categories.length; i++){
                    var currentCategory = unit.categories[i];
                    if(restrictionsTables['FORBID_ANY_CHILD'][currentCategory.id]){
                        return true;
                    }
                }
                return false;
            }
        }

        function checkIfAllTokenThatRequireAnnotationIsInUnit(rootUnit,hash_tokens,checkIfOk){
            var rootUnit = rootUnit;
            if(NOT_ALL_TOKENS_IN_UNIT_ERROR){
                return checkIfOk = false
            }
            Object.keys(rootUnit.children_tokens_hash).some(function(tokenId){
                var token = hash_tokens[tokenId];
                // if there is only one token and its non pangtuation
                if(rootUnit.annotation_unit_tree_id == "0"){
                    rootUnit.children_tokens = rootUnit.children_tokens_hash;
                }
                if(token.require_annotation && Object.keys(rootUnit.children_tokens).length > 1){
                    // check if the current rootUnit has category that forbid_any_child
                    if(isForbidAnyChild(rootUnit) == false){
                        checkIfOk = false;
                        NOT_ALL_TOKENS_IN_UNIT_ERROR = true;
                        // console.log("REQUIRE_ANNOTATION",token);
                        return true; // its only break from the some loop
                    }
                }
            })

            rootUnit.AnnotationUnits.forEach(function(unit){
                if(NOT_ALL_TOKENS_IN_UNIT_ERROR){
                    return checkIfOk = false
                }   
                return checkIfAllTokenThatRequireAnnotationIsInUnit(unit,hash_tokens,checkIfOk)
            });
            return checkIfOk;
        }

        function checkAtLeastOneCategoryRecursion(parentUnit,categories_hash){
            // console.log(parentUnit.annotation_unit_tree_id);
            if(parentUnit.categories == undefined){
                return false;
            }else if(!parentUnit.categories.length){
                return false;
            }else{

                // check if at least one category is not default
                var atLeastOnNotDefault = false;
                
                parentUnit.categories.some(function(currentCategory){
                    return atLeastOnNotDefault = (categories_hash[currentCategory.id] && categories_hash[currentCategory.id].was_default === false)
                })

                if(atLeastOnNotDefault){
                    
                    var foundErrorResult = parentUnit.AnnotationUnits.some(function(unit){
                        if(checkAtLeastOneCategoryRecursion(unit,categories_hash) === false){
                            return true
                        }
                    })

                    return !foundErrorResult;

                }else{
                    return atLeastOnNotDefault; // = false 
                }
            }
        }

        function checkIfAllUnitsHaveAtLeastOneCategory(parentUnit,categories_hash){
            var allOk = checkAtLeastOneCategoryRecursion(parentUnit,categories_hash);
            if(!allOk){
                showErrorModal("All units must have at least one non-default category");
            }
            return !allOk;
        }

        function showErrorModal(message){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/errorModal.html',
                size: 'md',
                controller: ["$scope", function($scope){
                    $scope.message = message;
                }]
            });
        }
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  WizardCtrl.$inject = ["$scope"];
  angular.module('zAdmin.pages.form')
      .controller('WizardCtrl', WizardCtrl);

  /** @ngInject */
  function WizardCtrl($scope) {
   var vm = this;

    vm.personalInfo = {};
    vm.productInfo = {};
    vm.shipment = {};

    vm.arePersonalInfoPasswordsEqual = function () {
      return vm.personalInfo.confirmPassword && vm.personalInfo.password == vm.personalInfo.confirmPassword;
    };
  }

})();



/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editCategoriesService.$inject = ["apiService", "Core"];
  angular.module('zAdmin.pages.edit.categories')
      .service('editCategoriesService', editCategoriesService);

  /** @ngInject */
  function editCategoriesService(apiService, Core) {
    /*apiService.users.getUserTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        Data:{},
        getEditTableStructure: function(){
          return apiService.edit.categories.getEditCategoryTableStructure().then(function (res){return res.data});
        },
        getCategoryData: function(id){
          var _service = this;
          return apiService.edit.categories.getCategoryData(id).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        saveCategoryDetails: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return bodyData.id ? apiService.edit.categories.putCategoryData(bodyData).then(function (res){return res.data}) :  apiService.edit.categories.postCategoryData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          var _service = this;
          service.Data = data;
        },
        get:function(key){
            if( typeof this.Data[key] == 'object' && !!this.Data[key] && !!this.Data[key].name){
                return this.Data[key].name;
            }
            return this.Data[key];
        },
        clearData: function(){
          service.Data = {
            is_active:true
          };
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditCategoriesCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "Core", "editCategoriesService"];
  angular.module('zAdmin.pages.edit.categories')
      .controller('EditCategoriesCtrl', EditCategoriesCtrl);

  /** @ngInject */
  function EditCategoriesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core, editCategoriesService) {
  	var vm = this;
  	vm.upsert = upsert;
    vm.back = back;
    Core.init(vm,EditTableStructure,editCategoriesService);

    // insertUserDataIntoStructure();
    vm.smartTableStructure.forEach(function(obj){
      obj.value = editCategoriesService.get(obj.key);
    })

  	function upsert(obj){
  	  console.log("edit",obj);
      editCategoriesService.saveCategoryDetails(obj).then(function(response){
          // $state.go('categories');
          if($state.current.name.indexOf(".categories.create") > -1){
            var goToState = $state.current.name.replace("create","manage");
            $state.go(goToState,{},{reload:true});
          }else{
            history.back();
          }
      })
  	}

    function back(){
        // $state.go('categories');
        history.back();
    }
    
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editLayerService.$inject = ["apiService"];
  angular.module('zAdmin.pages.edit.layers')
      .service('editLayerService', editLayerService);

  /** @ngInject */
  function editLayerService(apiService) {
    var service = {
        
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditLayerCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "Core"];
  angular.module('zAdmin.pages.edit.layers')
      .controller('EditLayerCtrl', EditLayerCtrl);

  /** @ngInject */
  function EditLayerCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal,Core) {
  	var vm = this;
  	vm.back = back;
    
    vm.chooseRow = chooseRow;

    function chooseRow(obj,index,currentService,ctrlToRefresh){
        console.log("chooseRow "+index,obj);
        var LayerDetails = {
            "id":obj.id,
            "name":obj.name,
            "shortcut_key": obj.shortcut_key,
            "abbreviation":obj.abbreviation

        };
        if( currentService.get('type')=="EXTENSION" ){
            var parentLayer = currentService.get('parent');
            if(parentLayer[0]){
                var itemNotAlreadyInParentLayer = Core.findItemInArrayById(LayerDetails.id,parentLayer[0].categories);
                if(itemNotAlreadyInParentLayer == false){ // item is Already In Parent Layer
                    Core.showNotification('error','Cant add this category. It is already located in the parent layer.')
                    return;
                }
            }else{
                Core.showNotification('error','Extension layer must have a parent layer.')
                return;
            }
        }
        var itemAlreadySelected = Core.findItemInArrayById(LayerDetails.id,currentService.get('categories'));
        if(itemAlreadySelected){
            promptHotKeySelectionModal(obj,LayerDetails,ctrlToRefresh,currentService);
        }else{
            Core.showNotification('error','Category already exists.')
            return;
        }
    }

    function promptHotKeySelectionModal(obj,LayerDetails,ctrlToRefresh,currentService){
        $uibModal.open({
            animation: true,
            templateUrl: 'app/pages/edit/layers/select.hotkey.modal.html',
            size: 'md',
            resolve: {
                items: function () {
                    return $scope.items;
                }
            },
            controller: ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
                $scope.categoryHotKey = null;

                $scope.save = function() {
                    if($scope.categoryHotKey != null && $scope.categoryHotKey != ''){
                        obj.selected = true;
                    }
                    LayerDetails.shortcut_key = $scope.categoryHotKey;
                    currentService.set("categories",LayerDetails);
                    ctrlToRefresh.refreshData("categories");
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
            }]
        });
    }

    function back(){
      history.back();
    }

  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editPassagesService.$inject = ["apiService", "Core"];
  angular.module('zAdmin.pages.edit.passages')
      .service('editPassagesService', editPassagesService);

  /** @ngInject */
  function editPassagesService(apiService,Core) {
    /*apiService.passages.getPassageTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        Data:{},
        getEditTableStructure: function(){
          var _service = this;
          return apiService.edit.passages.getEditPassageTableStructure().then(function (res){
            // _service.initData(res.data);
            return res.data
          });
        },
        getPassageData: function(id){
          var _service = this;
          return apiService.edit.passages.getPassageData(id).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        savePassageDataInDb: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          // service.clearData();
          return bodyData.id ? apiService.edit.passages.putPassageData(bodyData).then(function (res){return res.data}) :  apiService.edit.passages.postPassageData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          var _service = this;
          _service.Data = data;
        },
        set:function(key,obj){
          this.Data[key] = obj;
        },
        get:function(key){
          return this.Data[key] ? (this.Data[key].name ? this.Data[key].name : this.Data[key]) : "";
        },
        clearData: function(){
          service.Data = {
            is_active:true
          };
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditPassagesCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "editPassagesService", "Core", "ENV_CONST"];
  angular.module('zAdmin.pages.edit.passages')
      .controller('EditPassagesCtrl', EditPassagesCtrl);

  /** @ngInject */
  function EditPassagesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editPassagesService, Core, ENV_CONST) {
  	var vm = this;
    vm.upsert = edit;
    vm.chooseText = chooseText;
    vm.chooseSource = chooseSource;
    vm.viewTasks = viewTasks;
    vm.viewProjects = viewProjects;
    vm.refreshData = refreshData;
    vm.back = back;
    Core.init(this,EditTableStructure,editPassagesService);

    vm.smartTableStructure.forEach(function(obj){
      obj.value = editPassagesService.get(obj.key);
      if(obj.key == 'type'){
        obj.value = ENV_CONST.PASSAGE_TYPE[obj.value] || ENV_CONST.PASSAGE_TYPE['PUBLIC']
      }
    });

    function back(){
      $state.go('passages');
    }

    function edit(obj){
      var postData = angular.copy(vm.smartTableStructure);
      var selectedSource = editPassagesService.Data.source
      postData.map(function(obj){
        if(obj.key == 'type'){
          obj.value = obj.value.label
        }
        else if(obj.key == 'source'){
          obj.value = selectedSource
        }
        return obj
      })
      editPassagesService.savePassageDataInDb(postData).then(function(){
        //Implement confirm / fail alert
        $state.go('passages');
      })
    }
    function chooseText(){
      console.log("chooseText");
      $state.go('edit.passages.texts')
    }
    function chooseSource(){
      console.log("chooseSource");
      $state.go('edit.passages.sources.manage')
    }
    function viewTasks(){
      console.log("viewTasks");
      $state.go('edit.passages.tasks')
    }
    function viewProjects(){
      console.log("viewProjects");
      $state.go('edit.passages.projects')
    }
    function refreshData(key){
      // set values from service
      vm.smartTableStructure.forEach(function(obj){
        key == obj.key ? obj.value = editPassagesService.get(obj.key) : "";
      })
    }
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editSourcesService.$inject = ["apiService", "Core"];
  angular.module('zAdmin.pages.edit.sources')
      .service('editSourcesService', editSourcesService);

  /** @ngInject */
  function editSourcesService(apiService, Core) {
    /*apiService.sources.getSourceTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        tableData:[],
        getEditTableStructure: function(){
          return apiService.edit.sources.getEditSourceTableStructure().then(function (res){return res.data});
        },
        getSourceData: function(sourceId){
          var _service = this;
          return apiService.edit.sources.getSourceData(sourceId).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        saveSourceDetails: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return !bodyData.id ? apiService.edit.sources.postSourceData(bodyData).then(function (res){return res.data}) :  apiService.edit.sources.putSourceData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          service.Data = data;
        },
        get:function(key){
          return this.Data[key];
        },
        clearData: function(){
          service.Data = {
            id : "",
            name : "",
            text : "",
            created_by : "",
            created_at : "",
            updated_at : "",
            is_active : true
          };
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditSourcesCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "Core", "editSourcesService"];
  angular.module('zAdmin.pages.edit.sources')
      .controller('EditSourcesCtrl', EditSourcesCtrl);

  /** @ngInject */
  function EditSourcesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core,editSourcesService) {
  	var vm = this;
  	vm.upsert = upsert;
    vm.back = back;
    Core.init(this,EditTableStructure,editSourcesService);

    vm.smartTableStructure.forEach(function(obj){
      obj.value = editSourcesService.get(obj.key);
    })

  	function upsert(obj){
      console.log("edit",obj);
      editSourcesService.saveSourceDetails(obj).then(function(response){
        if($state.params.from && $state.params.from == 'passages'){
          $state.go("edit.passages")
        }else{
          $state.go("sources")
        }
      })
    }

    function back(){
      $state.go('sources');
    }
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editProjectsService.$inject = ["apiService", "Core"];
    angular.module('zAdmin.pages.edit.projects')
        .service('editProjectsService', editProjectsService);

    /** @ngInject */
    function editProjectsService(apiService, Core) {
        /*apiService.projects.getProjectsTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.projects.getEditProjectTableStructure().then(function (res){return res.data});
            },
            getProjectData: function(id){
                var _service = this;
                return apiService.edit.projects.getProjectData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveProjectDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                bodyData.layer = bodyData.layer[0];
                return bodyData.id ? apiService.edit.projects.putProjectData(bodyData).then(function (res){return res.data}) :  apiService.edit.projects.postProjectData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                var _service = this;
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key])){
                    if(typeof this.Data[key] == "string" || typeof this.Data[key] == "boolean" || typeof this.Data[key] == "number"){
                        return this.Data[key];
                    }
                    return [this.Data[key]]
                }
                return this.Data[key];
            },
            set:function(key,obj,shouldReplace){
                if(angular.isArray(this.Data[key])){
                    shouldReplace ? this.Data[key][0] = obj : this.Data[key].push(obj);
                    
                }else{
                    this.Data[key] = obj;
                }
            },
            getData: function(){
              return this.Data;
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    name:"",
                    description:"",
                    layer: "",
                    tooltip:"",
                    tasks:[],
                    created_by:"",
                    is_active:true,
                    created_at:"",
                    updated_at:""
                };
                return service.Data;
            }
        };
        return service;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditProjectsCtrl.$inject = ["$stateParams", "$state", "EditTableStructure", "Core", "editProjectsService", "toastr"];
    angular.module('zAdmin.pages.edit.projects')
        .controller('EditProjectsCtrl', EditProjectsCtrl);

    /** @ngInject */
    function EditProjectsCtrl($stateParams, $state, EditTableStructure, Core, editProjectsService, toastr) {
        var vm = this;
        vm.upsert = upsert;
        vm.chooseLayer = chooseLayer;
        vm.refreshData = refreshData;
        vm.manage = manage;
        vm.back = back;
        Core.init(vm,EditTableStructure,editProjectsService);

        vm.smartTableStructure.forEach(function(obj){
            if(obj.dontBindToService != true){
                obj.value = editProjectsService.get(obj.key);
            }
        });

        function upsert(obj){
            console.log("edit",obj);

            var isValid = Core.validate(obj);
            if(isValid){
                var projectID = editProjectsService.get("id");                
                editProjectsService.saveProjectDetails(obj).then(function(response){
                    if(Core.hasValue(projectID)){
                        editProjectsService.clearData();
                        $state.go('projects');
                    }else{
                        Core.showNotification('success',"Project Saved.")
                        // editProjectsService.set("id",response.id);
                        // refreshData("id");
                        // $state.go('edit.projects',{id:response.id},{reload:true})
                        $state.go('projects')
                    }
                    
                }) 
            }
            
        }

        function manage (formElem){
            var dependenciesKeys  = !!formElem.validationRule ? formElem.validationRule.dependenciesKeys : [];
            var canProceed = Core.checkDependenciesKeys(dependenciesKeys,vm.smartTableStructure);

            if(canProceed < 0){
                if(formElem == 'tasks' || formElem.managePageRoute == 'tasks'){ // formElem here its the pageRoute
                    $state.go('projectTasks',{id:$stateParams.id,layerType:editProjectsService.get('layer')[0].type})
                }else{
                    $state.go('edit.projects.'+formElem) // formElem here its the pageRoute
                }
            }else{
                Core.showNotification('error',formElem.validationRule.dependenciesKeys[canProceed].errorMessage);
            }



        }

        function chooseLayer(){
            $state.go("edit.projects.layers")
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editProjectsService.get(obj.key) : "";
            })
        }

        function back(){
            $state.go('projects');
        }


    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editTasksService.$inject = ["apiService", "Core"];
    angular.module('zAdmin.pages.edit.tasks')
        .service('editTasksService', editTasksService);

    /** @ngInject */
    function editTasksService(apiService, Core) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.getTokenizationTaskEditTableStructure().then(function (res){return res.data});
            },
            getTaskData: function(id){
                var _service = this;
                return apiService.edit.tasks.getTaskData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            getTasksTableData: function(){
                return apiService.tasks.getTasksTableData().then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            saveTaskDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                service.clearData();
                return !bodyData.id ? apiService.edit.tasks.postTaskData(bodyData).then(function (res){return res.data}) :  apiService.edit.tasks.putTaskData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    manager_comment:"",
                    status:"",
                    passages: [],
                    parent:[],
                    annotator:[],
                    is_active:true,
                    is_demo:false
                };
            }
        }
        return service;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditTasksCtrl.$inject = ["$scope", "$state", "$timeout"];
    angular.module('zAdmin.pages.edit.tasks')
        .controller('EditTasksCtrl', EditTasksCtrl);

    /** @ngInject */
    function EditTasksCtrl($scope,$state, $timeout) {
        var vm = this;
        vm.upsert = upsert;
        vm.back = back;
        vm.choosePassage = choosePassage;
        vm.refreshData = refreshData;

        function upsert(obj){
            console.log("edit",obj);
            editTasksService.saveTaskDetails(obj).then(function(response){
                $state.go("projectTasks")
            },function(err){
                $state.go("projectTasks")
            })
        }

        function back(){
            $state.go('projectTasks');
        }

        function choosePassage(){
            $state.go('edit.tasks.passages.manage');
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editTasksService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editUsersService.$inject = ["apiService", "Core"];
  angular.module('zAdmin.pages.edit.users')
      .service('editUsersService', editUsersService);

  /** @ngInject */
  function editUsersService(apiService, Core) {
    /*apiService.users.getUserTableData().then(function (res){
      angular.copy(res.data.results, service.tableData);
    });*/
    var service = {
        Data:{},
        getEditTableStructure: function(){
          return apiService.edit.users.getEditUserTableStructure().then(function (res){return res.data});
        },
        getUserData: function(userId){
          var _service = this;
          return apiService.edit.users.getUserData(userId).then(function (res){
            _service.initData(res.data);
            return res.data
          });
        },
        saveUserDetails: function(smartTableStructure){
          var bodyData = Core.extractDataFromStructure(smartTableStructure);
          service.clearData();
          return bodyData.id ? apiService.edit.users.putUserData(bodyData).then(function (res){return res.data}) :  apiService.edit.users.postUserData(bodyData).then(function (res){return res.data});
        },
        initData:function(data){
          var _service = this;
          service.Data = data;
        },
        get:function(key){
          return this.Data[key];
        },
        clearData: function(){
          service.Data = {
              id:"",
              first_name:"",
              last_name:"",
              email:"",
              role:"",
              organization:"",
              affiliation:"",
              is_active:true
          };
        }
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditUsersCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "Core", "editUsersService", "ENV_CONST"];
  angular.module('zAdmin.pages.edit.users')
      .controller('EditUsersCtrl', EditUsersCtrl);

  /** @ngInject */
  function EditUsersCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core, editUsersService, ENV_CONST) {
  	var vm = this;
  	vm.upsert = upsert;
    vm.back = back;
    Core.init(vm,EditTableStructure,editUsersService);

    // insertUserDataIntoStructure();
    vm.smartTableStructure.forEach(function(obj){
      obj.value = editUsersService.get(obj.key);
    });

    

  	function upsert(obj){
  	  console.log("edit",obj);

      var isValid = Core.validate(obj);
      if(isValid){
          editUsersService.saveUserDetails(obj).then(successUserCreation,failedUserCreation)
      }
  	}

    function back(){
        $state.go('users');
    }

    function successUserCreation(res){
        Core.showNotification('success',ENV_CONST.NOTIFICATIONS.USER_CREATED);
        $state.go('users');
    }

    function failedUserCreation(err){
        // Core.showNotification('error',ENV_CONST.NOTIFICATIONS.GENERAL_ERROR);
    }
    
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  GmapPageCtrl.$inject = ["$timeout"];
  angular.module('zAdmin.pages.maps')
      .controller('GmapPageCtrl', GmapPageCtrl);

  /** @ngInject */
  function GmapPageCtrl($timeout) {
    function initialize() {
      var mapCanvas = document.getElementById('google-maps');
      var mapOptions = {
        center: new google.maps.LatLng(44.5403, -78.5463),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(mapCanvas, mapOptions);
    }

    $timeout(function(){
      initialize();
    }, 100);
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  MapBubblePageCtrl.$inject = ["baConfig", "$timeout", "layoutPaths"];
  angular.module('zAdmin.pages.maps')
      .controller('MapBubblePageCtrl', MapBubblePageCtrl);

  /** @ngInject */
  function MapBubblePageCtrl(baConfig, $timeout, layoutPaths) {
    var layoutColors = baConfig.colors;
    var latlong = {};
    latlong['AD'] = {'latitude': 42.5, 'longitude': 1.5};
    latlong['AE'] = {'latitude': 24, 'longitude': 54};
    latlong['AF'] = {'latitude': 33, 'longitude': 65};
    latlong['AG'] = {'latitude': 17.05, 'longitude': -61.8};
    latlong['AI'] = {'latitude': 18.25, 'longitude': -63.1667};
    latlong['AL'] = {'latitude': 41, 'longitude': 20};
    latlong['AM'] = {'latitude': 40, 'longitude': 45};
    latlong['AN'] = {'latitude': 12.25, 'longitude': -68.75};
    latlong['AO'] = {'latitude': -12.5, 'longitude': 18.5};
    latlong['AP'] = {'latitude': 35, 'longitude': 105};
    latlong['AQ'] = {'latitude': -90, 'longitude': 0};
    latlong['AR'] = {'latitude': -34, 'longitude': -64};
    latlong['AS'] = {'latitude': -14.3333, 'longitude': -170};
    latlong['AT'] = {'latitude': 47.3333, 'longitude': 13.3333};
    latlong['AU'] = {'latitude': -27, 'longitude': 133};
    latlong['AW'] = {'latitude': 12.5, 'longitude': -69.9667};
    latlong['AZ'] = {'latitude': 40.5, 'longitude': 47.5};
    latlong['BA'] = {'latitude': 44, 'longitude': 18};
    latlong['BB'] = {'latitude': 13.1667, 'longitude': -59.5333};
    latlong['BD'] = {'latitude': 24, 'longitude': 90};
    latlong['BE'] = {'latitude': 50.8333, 'longitude': 4};
    latlong['BF'] = {'latitude': 13, 'longitude': -2};
    latlong['BG'] = {'latitude': 43, 'longitude': 25};
    latlong['BH'] = {'latitude': 26, 'longitude': 50.55};
    latlong['BI'] = {'latitude': -3.5, 'longitude': 30};
    latlong['BJ'] = {'latitude': 9.5, 'longitude': 2.25};
    latlong['BM'] = {'latitude': 32.3333, 'longitude': -64.75};
    latlong['BN'] = {'latitude': 4.5, 'longitude': 114.6667};
    latlong['BO'] = {'latitude': -17, 'longitude': -65};
    latlong['BR'] = {'latitude': -10, 'longitude': -55};
    latlong['BS'] = {'latitude': 24.25, 'longitude': -76};
    latlong['BT'] = {'latitude': 27.5, 'longitude': 90.5};
    latlong['BV'] = {'latitude': -54.4333, 'longitude': 3.4};
    latlong['BW'] = {'latitude': -22, 'longitude': 24};
    latlong['BY'] = {'latitude': 53, 'longitude': 28};
    latlong['BZ'] = {'latitude': 17.25, 'longitude': -88.75};
    latlong['CA'] = {'latitude': 54, 'longitude': -100};
    latlong['CC'] = {'latitude': -12.5, 'longitude': 96.8333};
    latlong['CD'] = {'latitude': 0, 'longitude': 25};
    latlong['CF'] = {'latitude': 7, 'longitude': 21};
    latlong['CG'] = {'latitude': -1, 'longitude': 15};
    latlong['CH'] = {'latitude': 47, 'longitude': 8};
    latlong['CI'] = {'latitude': 8, 'longitude': -5};
    latlong['CK'] = {'latitude': -21.2333, 'longitude': -159.7667};
    latlong['CL'] = {'latitude': -30, 'longitude': -71};
    latlong['CM'] = {'latitude': 6, 'longitude': 12};
    latlong['CN'] = {'latitude': 35, 'longitude': 105};
    latlong['CO'] = {'latitude': 4, 'longitude': -72};
    latlong['CR'] = {'latitude': 10, 'longitude': -84};
    latlong['CU'] = {'latitude': 21.5, 'longitude': -80};
    latlong['CV'] = {'latitude': 16, 'longitude': -24};
    latlong['CX'] = {'latitude': -10.5, 'longitude': 105.6667};
    latlong['CY'] = {'latitude': 35, 'longitude': 33};
    latlong['CZ'] = {'latitude': 49.75, 'longitude': 15.5};
    latlong['DE'] = {'latitude': 51, 'longitude': 9};
    latlong['DJ'] = {'latitude': 11.5, 'longitude': 43};
    latlong['DK'] = {'latitude': 56, 'longitude': 10};
    latlong['DM'] = {'latitude': 15.4167, 'longitude': -61.3333};
    latlong['DO'] = {'latitude': 19, 'longitude': -70.6667};
    latlong['DZ'] = {'latitude': 28, 'longitude': 3};
    latlong['EC'] = {'latitude': -2, 'longitude': -77.5};
    latlong['EE'] = {'latitude': 59, 'longitude': 26};
    latlong['EG'] = {'latitude': 27, 'longitude': 30};
    latlong['EH'] = {'latitude': 24.5, 'longitude': -13};
    latlong['ER'] = {'latitude': 15, 'longitude': 39};
    latlong['ES'] = {'latitude': 40, 'longitude': -4};
    latlong['ET'] = {'latitude': 8, 'longitude': 38};
    latlong['EU'] = {'latitude': 47, 'longitude': 8};
    latlong['FI'] = {'latitude': 62, 'longitude': 26};
    latlong['FJ'] = {'latitude': -18, 'longitude': 175};
    latlong['FK'] = {'latitude': -51.75, 'longitude': -59};
    latlong['FM'] = {'latitude': 6.9167, 'longitude': 158.25};
    latlong['FO'] = {'latitude': 62, 'longitude': -7};
    latlong['FR'] = {'latitude': 46, 'longitude': 2};
    latlong['GA'] = {'latitude': -1, 'longitude': 11.75};
    latlong['GB'] = {'latitude': 54, 'longitude': -2};
    latlong['GD'] = {'latitude': 12.1167, 'longitude': -61.6667};
    latlong['GE'] = {'latitude': 42, 'longitude': 43.5};
    latlong['GF'] = {'latitude': 4, 'longitude': -53};
    latlong['GH'] = {'latitude': 8, 'longitude': -2};
    latlong['GI'] = {'latitude': 36.1833, 'longitude': -5.3667};
    latlong['GL'] = {'latitude': 72, 'longitude': -40};
    latlong['GM'] = {'latitude': 13.4667, 'longitude': -16.5667};
    latlong['GN'] = {'latitude': 11, 'longitude': -10};
    latlong['GP'] = {'latitude': 16.25, 'longitude': -61.5833};
    latlong['GQ'] = {'latitude': 2, 'longitude': 10};
    latlong['GR'] = {'latitude': 39, 'longitude': 22};
    latlong['GS'] = {'latitude': -54.5, 'longitude': -37};
    latlong['GT'] = {'latitude': 15.5, 'longitude': -90.25};
    latlong['GU'] = {'latitude': 13.4667, 'longitude': 144.7833};
    latlong['GW'] = {'latitude': 12, 'longitude': -15};
    latlong['GY'] = {'latitude': 5, 'longitude': -59};
    latlong['HK'] = {'latitude': 22.25, 'longitude': 114.1667};
    latlong['HM'] = {'latitude': -53.1, 'longitude': 72.5167};
    latlong['HN'] = {'latitude': 15, 'longitude': -86.5};
    latlong['HR'] = {'latitude': 45.1667, 'longitude': 15.5};
    latlong['HT'] = {'latitude': 19, 'longitude': -72.4167};
    latlong['HU'] = {'latitude': 47, 'longitude': 20};
    latlong['ID'] = {'latitude': -5, 'longitude': 120};
    latlong['IE'] = {'latitude': 53, 'longitude': -8};
    latlong['IL'] = {'latitude': 31.5, 'longitude': 34.75};
    latlong['IN'] = {'latitude': 20, 'longitude': 77};
    latlong['IO'] = {'latitude': -6, 'longitude': 71.5};
    latlong['IQ'] = {'latitude': 33, 'longitude': 44};
    latlong['IR'] = {'latitude': 32, 'longitude': 53};
    latlong['IS'] = {'latitude': 65, 'longitude': -18};
    latlong['IT'] = {'latitude': 42.8333, 'longitude': 12.8333};
    latlong['JM'] = {'latitude': 18.25, 'longitude': -77.5};
    latlong['JO'] = {'latitude': 31, 'longitude': 36};
    latlong['JP'] = {'latitude': 36, 'longitude': 138};
    latlong['KE'] = {'latitude': 1, 'longitude': 38};
    latlong['KG'] = {'latitude': 41, 'longitude': 75};
    latlong['KH'] = {'latitude': 13, 'longitude': 105};
    latlong['KI'] = {'latitude': 1.4167, 'longitude': 173};
    latlong['KM'] = {'latitude': -12.1667, 'longitude': 44.25};
    latlong['KN'] = {'latitude': 17.3333, 'longitude': -62.75};
    latlong['KP'] = {'latitude': 40, 'longitude': 127};
    latlong['KR'] = {'latitude': 37, 'longitude': 127.5};
    latlong['KW'] = {'latitude': 29.3375, 'longitude': 47.6581};
    latlong['KY'] = {'latitude': 19.5, 'longitude': -80.5};
    latlong['KZ'] = {'latitude': 48, 'longitude': 68};
    latlong['LA'] = {'latitude': 18, 'longitude': 105};
    latlong['LB'] = {'latitude': 33.8333, 'longitude': 35.8333};
    latlong['LC'] = {'latitude': 13.8833, 'longitude': -61.1333};
    latlong['LI'] = {'latitude': 47.1667, 'longitude': 9.5333};
    latlong['LK'] = {'latitude': 7, 'longitude': 81};
    latlong['LR'] = {'latitude': 6.5, 'longitude': -9.5};
    latlong['LS'] = {'latitude': -29.5, 'longitude': 28.5};
    latlong['LT'] = {'latitude': 55, 'longitude': 24};
    latlong['LU'] = {'latitude': 49.75, 'longitude': 6};
    latlong['LV'] = {'latitude': 57, 'longitude': 25};
    latlong['LY'] = {'latitude': 25, 'longitude': 17};
    latlong['MA'] = {'latitude': 32, 'longitude': -5};
    latlong['MC'] = {'latitude': 43.7333, 'longitude': 7.4};
    latlong['MD'] = {'latitude': 47, 'longitude': 29};
    latlong['ME'] = {'latitude': 42.5, 'longitude': 19.4};
    latlong['MG'] = {'latitude': -20, 'longitude': 47};
    latlong['MH'] = {'latitude': 9, 'longitude': 168};
    latlong['MK'] = {'latitude': 41.8333, 'longitude': 22};
    latlong['ML'] = {'latitude': 17, 'longitude': -4};
    latlong['MM'] = {'latitude': 22, 'longitude': 98};
    latlong['MN'] = {'latitude': 46, 'longitude': 105};
    latlong['MO'] = {'latitude': 22.1667, 'longitude': 113.55};
    latlong['MP'] = {'latitude': 15.2, 'longitude': 145.75};
    latlong['MQ'] = {'latitude': 14.6667, 'longitude': -61};
    latlong['MR'] = {'latitude': 20, 'longitude': -12};
    latlong['MS'] = {'latitude': 16.75, 'longitude': -62.2};
    latlong['MT'] = {'latitude': 35.8333, 'longitude': 14.5833};
    latlong['MU'] = {'latitude': -20.2833, 'longitude': 57.55};
    latlong['MV'] = {'latitude': 3.25, 'longitude': 73};
    latlong['MW'] = {'latitude': -13.5, 'longitude': 34};
    latlong['MX'] = {'latitude': 23, 'longitude': -102};
    latlong['MY'] = {'latitude': 2.5, 'longitude': 112.5};
    latlong['MZ'] = {'latitude': -18.25, 'longitude': 35};
    latlong['NA'] = {'latitude': -22, 'longitude': 17};
    latlong['NC'] = {'latitude': -21.5, 'longitude': 165.5};
    latlong['NE'] = {'latitude': 16, 'longitude': 8};
    latlong['NF'] = {'latitude': -29.0333, 'longitude': 167.95};
    latlong['NG'] = {'latitude': 10, 'longitude': 8};
    latlong['NI'] = {'latitude': 13, 'longitude': -85};
    latlong['NL'] = {'latitude': 52.5, 'longitude': 5.75};
    latlong['NO'] = {'latitude': 62, 'longitude': 10};
    latlong['NP'] = {'latitude': 28, 'longitude': 84};
    latlong['NR'] = {'latitude': -0.5333, 'longitude': 166.9167};
    latlong['NU'] = {'latitude': -19.0333, 'longitude': -169.8667};
    latlong['NZ'] = {'latitude': -41, 'longitude': 174};
    latlong['OM'] = {'latitude': 21, 'longitude': 57};
    latlong['PA'] = {'latitude': 9, 'longitude': -80};
    latlong['PE'] = {'latitude': -10, 'longitude': -76};
    latlong['PF'] = {'latitude': -15, 'longitude': -140};
    latlong['PG'] = {'latitude': -6, 'longitude': 147};
    latlong['PH'] = {'latitude': 13, 'longitude': 122};
    latlong['PK'] = {'latitude': 30, 'longitude': 70};
    latlong['PL'] = {'latitude': 52, 'longitude': 20};
    latlong['PM'] = {'latitude': 46.8333, 'longitude': -56.3333};
    latlong['PR'] = {'latitude': 18.25, 'longitude': -66.5};
    latlong['PS'] = {'latitude': 32, 'longitude': 35.25};
    latlong['PT'] = {'latitude': 39.5, 'longitude': -8};
    latlong['PW'] = {'latitude': 7.5, 'longitude': 134.5};
    latlong['PY'] = {'latitude': -23, 'longitude': -58};
    latlong['QA'] = {'latitude': 25.5, 'longitude': 51.25};
    latlong['RE'] = {'latitude': -21.1, 'longitude': 55.6};
    latlong['RO'] = {'latitude': 46, 'longitude': 25};
    latlong['RS'] = {'latitude': 44, 'longitude': 21};
    latlong['RU'] = {'latitude': 60, 'longitude': 100};
    latlong['RW'] = {'latitude': -2, 'longitude': 30};
    latlong['SA'] = {'latitude': 25, 'longitude': 45};
    latlong['SB'] = {'latitude': -8, 'longitude': 159};
    latlong['SC'] = {'latitude': -4.5833, 'longitude': 55.6667};
    latlong['SD'] = {'latitude': 15, 'longitude': 30};
    latlong['SE'] = {'latitude': 62, 'longitude': 15};
    latlong['SG'] = {'latitude': 1.3667, 'longitude': 103.8};
    latlong['SH'] = {'latitude': -15.9333, 'longitude': -5.7};
    latlong['SI'] = {'latitude': 46, 'longitude': 15};
    latlong['SJ'] = {'latitude': 78, 'longitude': 20};
    latlong['SK'] = {'latitude': 48.6667, 'longitude': 19.5};
    latlong['SL'] = {'latitude': 8.5, 'longitude': -11.5};
    latlong['SM'] = {'latitude': 43.7667, 'longitude': 12.4167};
    latlong['SN'] = {'latitude': 14, 'longitude': -14};
    latlong['SO'] = {'latitude': 10, 'longitude': 49};
    latlong['SR'] = {'latitude': 4, 'longitude': -56};
    latlong['ST'] = {'latitude': 1, 'longitude': 7};
    latlong['SV'] = {'latitude': 13.8333, 'longitude': -88.9167};
    latlong['SY'] = {'latitude': 35, 'longitude': 38};
    latlong['SZ'] = {'latitude': -26.5, 'longitude': 31.5};
    latlong['TC'] = {'latitude': 21.75, 'longitude': -71.5833};
    latlong['TD'] = {'latitude': 15, 'longitude': 19};
    latlong['TF'] = {'latitude': -43, 'longitude': 67};
    latlong['TG'] = {'latitude': 8, 'longitude': 1.1667};
    latlong['TH'] = {'latitude': 15, 'longitude': 100};
    latlong['TJ'] = {'latitude': 39, 'longitude': 71};
    latlong['TK'] = {'latitude': -9, 'longitude': -172};
    latlong['TM'] = {'latitude': 40, 'longitude': 60};
    latlong['TN'] = {'latitude': 34, 'longitude': 9};
    latlong['TO'] = {'latitude': -20, 'longitude': -175};
    latlong['TR'] = {'latitude': 39, 'longitude': 35};
    latlong['TT'] = {'latitude': 11, 'longitude': -61};
    latlong['TV'] = {'latitude': -8, 'longitude': 178};
    latlong['TW'] = {'latitude': 23.5, 'longitude': 121};
    latlong['TZ'] = {'latitude': -6, 'longitude': 35};
    latlong['UA'] = {'latitude': 49, 'longitude': 32};
    latlong['UG'] = {'latitude': 1, 'longitude': 32};
    latlong['UM'] = {'latitude': 19.2833, 'longitude': 166.6};
    latlong['US'] = {'latitude': 38, 'longitude': -97};
    latlong['UY'] = {'latitude': -33, 'longitude': -56};
    latlong['UZ'] = {'latitude': 41, 'longitude': 64};
    latlong['VA'] = {'latitude': 41.9, 'longitude': 12.45};
    latlong['VC'] = {'latitude': 13.25, 'longitude': -61.2};
    latlong['VE'] = {'latitude': 8, 'longitude': -66};
    latlong['VG'] = {'latitude': 18.5, 'longitude': -64.5};
    latlong['VI'] = {'latitude': 18.3333, 'longitude': -64.8333};
    latlong['VN'] = {'latitude': 16, 'longitude': 106};
    latlong['VU'] = {'latitude': -16, 'longitude': 167};
    latlong['WF'] = {'latitude': -13.3, 'longitude': -176.2};
    latlong['WS'] = {'latitude': -13.5833, 'longitude': -172.3333};
    latlong['YE'] = {'latitude': 15, 'longitude': 48};
    latlong['YT'] = {'latitude': -12.8333, 'longitude': 45.1667};
    latlong['ZA'] = {'latitude': -29, 'longitude': 24};
    latlong['ZM'] = {'latitude': -15, 'longitude': 30};
    latlong['ZW'] = {'latitude': -20, 'longitude': 30};

    var mapData = [
      {'code': 'AF', 'name': 'Afghanistan', 'value': 32358260, 'color': layoutColors.primaryDark},
      {'code': 'AL', 'name': 'Albania', 'value': 3215988, 'color': layoutColors.warning},
      {'code': 'DZ', 'name': 'Algeria', 'value': 35980193, 'color': layoutColors.danger},
      {'code': 'AO', 'name': 'Angola', 'value': 19618432, 'color': layoutColors.danger},
      {'code': 'AR', 'name': 'Argentina', 'value': 40764561, 'color': layoutColors.success},
      {'code': 'AM', 'name': 'Armenia', 'value': 3100236, 'color': layoutColors.warning},
      {'code': 'AU', 'name': 'Australia', 'value': 22605732, 'color': layoutColors.warningDark},
      {'code': 'AT', 'name': 'Austria', 'value': 8413429, 'color': layoutColors.warning},
      {'code': 'AZ', 'name': 'Azerbaijan', 'value': 9306023, 'color': layoutColors.warning},
      {'code': 'BH', 'name': 'Bahrain', 'value': 1323535, 'color': layoutColors.primaryDark},
      {'code': 'BD', 'name': 'Bangladesh', 'value': 150493658, 'color': layoutColors.primaryDark},
      {'code': 'BY', 'name': 'Belarus', 'value': 9559441, 'color': layoutColors.warning},
      {'code': 'BE', 'name': 'Belgium', 'value': 10754056, 'color': layoutColors.warning},
      {'code': 'BJ', 'name': 'Benin', 'value': 9099922, 'color': layoutColors.danger},
      {'code': 'BT', 'name': 'Bhutan', 'value': 738267, 'color': layoutColors.primaryDark},
      {'code': 'BO', 'name': 'Bolivia', 'value': 10088108, 'color': layoutColors.success},
      {'code': 'BA', 'name': 'Bosnia and Herzegovina', 'value': 3752228, 'color': layoutColors.warning},
      {'code': 'BW', 'name': 'Botswana', 'value': 2030738, 'color': layoutColors.danger},
      {'code': 'BR', 'name': 'Brazil', 'value': 196655014, 'color': layoutColors.success},
      {'code': 'BN', 'name': 'Brunei', 'value': 405938, 'color': layoutColors.primaryDark},
      {'code': 'BG', 'name': 'Bulgaria', 'value': 7446135, 'color': layoutColors.warning},
      {'code': 'BF', 'name': 'Burkina Faso', 'value': 16967845, 'color': layoutColors.danger},
      {'code': 'BI', 'name': 'Burundi', 'value': 8575172, 'color': layoutColors.danger},
      {'code': 'KH', 'name': 'Cambodia', 'value': 14305183, 'color': layoutColors.primaryDark},
      {'code': 'CM', 'name': 'Cameroon', 'value': 20030362, 'color': layoutColors.danger},
      {'code': 'CA', 'name': 'Canada', 'value': 34349561, 'color': layoutColors.primary},
      {'code': 'CV', 'name': 'Cape Verde', 'value': 500585, 'color': layoutColors.danger},
      {'code': 'CF', 'name': 'Central African Rep.', 'value': 4486837, 'color': layoutColors.danger},
      {'code': 'TD', 'name': 'Chad', 'value': 11525496, 'color': layoutColors.danger},
      {'code': 'CL', 'name': 'Chile', 'value': 17269525, 'color': layoutColors.success},
      {'code': 'CN', 'name': 'China', 'value': 1347565324, 'color': layoutColors.primaryDark},
      {'code': 'CO', 'name': 'Colombia', 'value': 46927125, 'color': layoutColors.success},
      {'code': 'KM', 'name': 'Comoros', 'value': 753943, 'color': layoutColors.danger},
      {'code': 'CD', 'name': 'Congo, Dem. Rep.', 'value': 67757577, 'color': layoutColors.danger},
      {'code': 'CG', 'name': 'Congo, Rep.', 'value': 4139748, 'color': layoutColors.danger},
      {'code': 'CR', 'name': 'Costa Rica', 'value': 4726575, 'color': layoutColors.primary},
      {'code': 'CI', 'name': 'Cote d\'Ivoire', 'value': 20152894, 'color': layoutColors.danger},
      {'code': 'HR', 'name': 'Croatia', 'value': 4395560, 'color': layoutColors.warning},
      {'code': 'CU', 'name': 'Cuba', 'value': 11253665, 'color': layoutColors.primary},
      {'code': 'CY', 'name': 'Cyprus', 'value': 1116564, 'color': layoutColors.warning},
      {'code': 'CZ', 'name': 'Czech Rep.', 'value': 10534293, 'color': layoutColors.warning},
      {'code': 'DK', 'name': 'Denmark', 'value': 5572594, 'color': layoutColors.warning},
      {'code': 'DJ', 'name': 'Djibouti', 'value': 905564, 'color': layoutColors.danger},
      {'code': 'DO', 'name': 'Dominican Rep.', 'value': 10056181, 'color': layoutColors.primary},
      {'code': 'EC', 'name': 'Ecuador', 'value': 14666055, 'color': layoutColors.success},
      {'code': 'EG', 'name': 'Egypt', 'value': 82536770, 'color': layoutColors.danger},
      {'code': 'SV', 'name': 'El Salvador', 'value': 6227491, 'color': layoutColors.primary},
      {'code': 'GQ', 'name': 'Equatorial Guinea', 'value': 720213, 'color': layoutColors.danger},
      {'code': 'ER', 'name': 'Eritrea', 'value': 5415280, 'color': layoutColors.danger},
      {'code': 'EE', 'name': 'Estonia', 'value': 1340537, 'color': layoutColors.warning},
      {'code': 'ET', 'name': 'Ethiopia', 'value': 84734262, 'color': layoutColors.danger},
      {'code': 'FJ', 'name': 'Fiji', 'value': 868406, 'color': layoutColors.warningDark},
      {'code': 'FI', 'name': 'Finland', 'value': 5384770, 'color': layoutColors.warning},
      {'code': 'FR', 'name': 'France', 'value': 63125894, 'color': layoutColors.warning},
      {'code': 'GA', 'name': 'Gabon', 'value': 1534262, 'color': layoutColors.danger},
      {'code': 'GM', 'name': 'Gambia', 'value': 1776103, 'color': layoutColors.danger},
      {'code': 'GE', 'name': 'Georgia', 'value': 4329026, 'color': layoutColors.warning},
      {'code': 'DE', 'name': 'Germany', 'value': 82162512, 'color': layoutColors.warning},
      {'code': 'GH', 'name': 'Ghana', 'value': 24965816, 'color': layoutColors.danger},
      {'code': 'GR', 'name': 'Greece', 'value': 11390031, 'color': layoutColors.warning},
      {'code': 'GT', 'name': 'Guatemala', 'value': 14757316, 'color': layoutColors.primary},
      {'code': 'GN', 'name': 'Guinea', 'value': 10221808, 'color': layoutColors.danger},
      {'code': 'GW', 'name': 'Guinea-Bissau', 'value': 1547061, 'color': layoutColors.danger},
      {'code': 'GY', 'name': 'Guyana', 'value': 756040, 'color': layoutColors.success},
      {'code': 'HT', 'name': 'Haiti', 'value': 10123787, 'color': layoutColors.primary},
      {'code': 'HN', 'name': 'Honduras', 'value': 7754687, 'color': layoutColors.primary},
      {'code': 'HK', 'name': 'Hong Kong, China', 'value': 7122187, 'color': layoutColors.primaryDark},
      {'code': 'HU', 'name': 'Hungary', 'value': 9966116, 'color': layoutColors.warning},
      {'code': 'IS', 'name': 'Iceland', 'value': 324366, 'color': layoutColors.warning},
      {'code': 'IN', 'name': 'India', 'value': 1241491960, 'color': layoutColors.primaryDark},
      {'code': 'ID', 'name': 'Indonesia', 'value': 242325638, 'color': layoutColors.primaryDark},
      {'code': 'IR', 'name': 'Iran', 'value': 74798599, 'color': layoutColors.primaryDark},
      {'code': 'IQ', 'name': 'Iraq', 'value': 32664942, 'color': layoutColors.primaryDark},
      {'code': 'IE', 'name': 'Ireland', 'value': 4525802, 'color': layoutColors.warning},
      {'code': 'IL', 'name': 'Israel', 'value': 7562194, 'color': layoutColors.primaryDark},
      {'code': 'IT', 'name': 'Italy', 'value': 60788694, 'color': layoutColors.warning},
      {'code': 'JM', 'name': 'Jamaica', 'value': 2751273, 'color': layoutColors.primary},
      {'code': 'JP', 'name': 'Japan', 'value': 126497241, 'color': layoutColors.primaryDark},
      {'code': 'JO', 'name': 'Jordan', 'value': 6330169, 'color': layoutColors.primaryDark},
      {'code': 'KZ', 'name': 'Kazakhstan', 'value': 16206750, 'color': layoutColors.primaryDark},
      {'code': 'KE', 'name': 'Kenya', 'value': 41609728, 'color': layoutColors.danger},
      {'code': 'KP', 'name': 'Korea, Dem. Rep.', 'value': 24451285, 'color': layoutColors.primaryDark},
      {'code': 'KR', 'name': 'Korea, Rep.', 'value': 48391343, 'color': layoutColors.primaryDark},
      {'code': 'KW', 'name': 'Kuwait', 'value': 2818042, 'color': layoutColors.primaryDark},
      {'code': 'KG', 'name': 'Kyrgyzstan', 'value': 5392580, 'color': layoutColors.primaryDark},
      {'code': 'LA', 'name': 'Laos', 'value': 6288037, 'color': layoutColors.primaryDark},
      {'code': 'LV', 'name': 'Latvia', 'value': 2243142, 'color': layoutColors.warning},
      {'code': 'LB', 'name': 'Lebanon', 'value': 4259405, 'color': layoutColors.primaryDark},
      {'code': 'LS', 'name': 'Lesotho', 'value': 2193843, 'color': layoutColors.danger},
      {'code': 'LR', 'name': 'Liberia', 'value': 4128572, 'color': layoutColors.danger},
      {'code': 'LY', 'name': 'Libya', 'value': 6422772, 'color': layoutColors.danger},
      {'code': 'LT', 'name': 'Lithuania', 'value': 3307481, 'color': layoutColors.warning},
      {'code': 'LU', 'name': 'Luxembourg', 'value': 515941, 'color': layoutColors.warning},
      {'code': 'MK', 'name': 'Macedonia, FYR', 'value': 2063893, 'color': layoutColors.warning},
      {'code': 'MG', 'name': 'Madagascar', 'value': 21315135, 'color': layoutColors.danger},
      {'code': 'MW', 'name': 'Malawi', 'value': 15380888, 'color': layoutColors.danger},
      {'code': 'MY', 'name': 'Malaysia', 'value': 28859154, 'color': layoutColors.primaryDark},
      {'code': 'ML', 'name': 'Mali', 'value': 15839538, 'color': layoutColors.danger},
      {'code': 'MR', 'name': 'Mauritania', 'value': 3541540, 'color': layoutColors.danger},
      {'code': 'MU', 'name': 'Mauritius', 'value': 1306593, 'color': layoutColors.danger},
      {'code': 'MX', 'name': 'Mexico', 'value': 114793341, 'color': layoutColors.primary},
      {'code': 'MD', 'name': 'Moldova', 'value': 3544864, 'color': layoutColors.warning},
      {'code': 'MN', 'name': 'Mongolia', 'value': 2800114, 'color': layoutColors.primaryDark},
      {'code': 'ME', 'name': 'Montenegro', 'value': 632261, 'color': layoutColors.warning},
      {'code': 'MA', 'name': 'Morocco', 'value': 32272974, 'color': layoutColors.danger},
      {'code': 'MZ', 'name': 'Mozambique', 'value': 23929708, 'color': layoutColors.danger},
      {'code': 'MM', 'name': 'Myanmar', 'value': 48336763, 'color': layoutColors.primaryDark},
      {'code': 'NA', 'name': 'Namibia', 'value': 2324004, 'color': layoutColors.danger},
      {'code': 'NP', 'name': 'Nepal', 'value': 30485798, 'color': layoutColors.primaryDark},
      {'code': 'NL', 'name': 'Netherlands', 'value': 16664746, 'color': layoutColors.warning},
      {'code': 'NZ', 'name': 'New Zealand', 'value': 4414509, 'color': layoutColors.warningDark},
      {'code': 'NI', 'name': 'Nicaragua', 'value': 5869859, 'color': layoutColors.primary},
      {'code': 'NE', 'name': 'Niger', 'value': 16068994, 'color': layoutColors.danger},
      {'code': 'NG', 'name': 'Nigeria', 'value': 162470737, 'color': layoutColors.danger},
      {'code': 'NO', 'name': 'Norway', 'value': 4924848, 'color': layoutColors.warning},
      {'code': 'OM', 'name': 'Oman', 'value': 2846145, 'color': layoutColors.primaryDark},
      {'code': 'PK', 'name': 'Pakistan', 'value': 176745364, 'color': layoutColors.primaryDark},
      {'code': 'PA', 'name': 'Panama', 'value': 3571185, 'color': layoutColors.primary},
      {'code': 'PG', 'name': 'Papua New Guinea', 'value': 7013829, 'color': layoutColors.warningDark},
      {'code': 'PY', 'name': 'Paraguay', 'value': 6568290, 'color': layoutColors.success},
      {'code': 'PE', 'name': 'Peru', 'value': 29399817, 'color': layoutColors.success},
      {'code': 'PH', 'name': 'Philippines', 'value': 94852030, 'color': layoutColors.primaryDark},
      {'code': 'PL', 'name': 'Poland', 'value': 38298949, 'color': layoutColors.warning},
      {'code': 'PT', 'name': 'Portugal', 'value': 10689663, 'color': layoutColors.warning},
      {'code': 'PR', 'name': 'Puerto Rico', 'value': 3745526, 'color': layoutColors.primary},
      {'code': 'QA', 'name': 'Qatar', 'value': 1870041, 'color': layoutColors.primaryDark},
      {'code': 'RO', 'name': 'Romania', 'value': 21436495, 'color': layoutColors.warning},
      {'code': 'RU', 'name': 'Russia', 'value': 142835555, 'color': layoutColors.warning},
      {'code': 'RW', 'name': 'Rwanda', 'value': 10942950, 'color': layoutColors.danger},
      {'code': 'SA', 'name': 'Saudi Arabia', 'value': 28082541, 'color': layoutColors.primaryDark},
      {'code': 'SN', 'name': 'Senegal', 'value': 12767556, 'color': layoutColors.danger},
      {'code': 'RS', 'name': 'Serbia', 'value': 9853969, 'color': layoutColors.warning},
      {'code': 'SL', 'name': 'Sierra Leone', 'value': 5997486, 'color': layoutColors.danger},
      {'code': 'SG', 'name': 'Singapore', 'value': 5187933, 'color': layoutColors.primaryDark},
      {'code': 'SK', 'name': 'Slovak Republic', 'value': 5471502, 'color': layoutColors.warning},
      {'code': 'SI', 'name': 'Slovenia', 'value': 2035012, 'color': layoutColors.warning},
      {'code': 'SB', 'name': 'Solomon Islands', 'value': 552267, 'color': layoutColors.warningDark},
      {'code': 'SO', 'name': 'Somalia', 'value': 9556873, 'color': layoutColors.danger},
      {'code': 'ZA', 'name': 'South Africa', 'value': 50459978, 'color': layoutColors.danger},
      {'code': 'ES', 'name': 'Spain', 'value': 46454895, 'color': layoutColors.warning},
      {'code': 'LK', 'name': 'Sri Lanka', 'value': 21045394, 'color': layoutColors.primaryDark},
      {'code': 'SD', 'name': 'Sudan', 'value': 34735288, 'color': layoutColors.danger},
      {'code': 'SR', 'name': 'Suriname', 'value': 529419, 'color': layoutColors.success},
      {'code': 'SZ', 'name': 'Swaziland', 'value': 1203330, 'color': layoutColors.danger},
      {'code': 'SE', 'name': 'Sweden', 'value': 9440747, 'color': layoutColors.warning},
      {'code': 'CH', 'name': 'Switzerland', 'value': 7701690, 'color': layoutColors.warning},
      {'code': 'SY', 'name': 'Syria', 'value': 20766037, 'color': layoutColors.primaryDark},
      {'code': 'TW', 'name': 'Taiwan', 'value': 23072000, 'color': layoutColors.primaryDark},
      {'code': 'TJ', 'name': 'Tajikistan', 'value': 6976958, 'color': layoutColors.primaryDark},
      {'code': 'TZ', 'name': 'Tanzania', 'value': 46218486, 'color': layoutColors.danger},
      {'code': 'TH', 'name': 'Thailand', 'value': 69518555, 'color': layoutColors.primaryDark},
      {'code': 'TG', 'name': 'Togo', 'value': 6154813, 'color': layoutColors.danger},
      {'code': 'TT', 'name': 'Trinidad and Tobago', 'value': 1346350, 'color': layoutColors.primary},
      {'code': 'TN', 'name': 'Tunisia', 'value': 10594057, 'color': layoutColors.danger},
      {'code': 'TR', 'name': 'Turkey', 'value': 73639596, 'color': layoutColors.warning},
      {'code': 'TM', 'name': 'Turkmenistan', 'value': 5105301, 'color': layoutColors.primaryDark},
      {'code': 'UG', 'name': 'Uganda', 'value': 34509205, 'color': layoutColors.danger},
      {'code': 'UA', 'name': 'Ukraine', 'value': 45190180, 'color': layoutColors.warning},
      {'code': 'AE', 'name': 'United Arab Emirates', 'value': 7890924, 'color': layoutColors.primaryDark},
      {'code': 'GB', 'name': 'United Kingdom', 'value': 62417431, 'color': layoutColors.warning},
      {'code': 'US', 'name': 'United States', 'value': 313085380, 'color': layoutColors.primary},
      {'code': 'UY', 'name': 'Uruguay', 'value': 3380008, 'color': layoutColors.success},
      {'code': 'UZ', 'name': 'Uzbekistan', 'value': 27760267, 'color': layoutColors.primaryDark},
      {'code': 'VE', 'name': 'Venezuela', 'value': 29436891, 'color': layoutColors.success},
      {'code': 'PS', 'name': 'West Bank and Gaza', 'value': 4152369, 'color': layoutColors.primaryDark},
      {'code': 'VN', 'name': 'Vietnam', 'value': 88791996, 'color': layoutColors.primaryDark},
      {'code': 'YE', 'name': 'Yemen, Rep.', 'value': 24799880, 'color': layoutColors.primaryDark},
      {'code': 'ZM', 'name': 'Zambia', 'value': 13474959, 'color': layoutColors.danger},
      {'code': 'ZW', 'name': 'Zimbabwe', 'value': 12754378, 'color': layoutColors.danger}
    ];

    var map;
    var minBulletSize = 3;
    var maxBulletSize = 70;
    var min = Infinity;
    var max = -Infinity;

    // get min and max values
    for (var i = 0; i < mapData.length; i++) {
      var value = mapData[i].value;
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }

    // build map
    AmCharts.theme = AmCharts.themes.z;
    map = new AmCharts.AmMap();

    map.addTitle('Population of the World in 2011', 14);
    map.addTitle('source: Gapminder', 11);
    map.areasSettings = {
      unlistedAreasColor: '#000000',
      unlistedAreasAlpha: 0.1
    };
    map.imagesSettings.balloonText = '<span style="font-size:14px;"><b>[[title]]</b>: [[value]]</span>';
    map.pathToImages = layoutPaths.images.amMap;

    var dataProvider = {
      mapVar: AmCharts.maps.worldLow,
      images: []
    };

    // it's better to use circle square to show difference between values, not a radius
    var maxSquare = maxBulletSize * maxBulletSize * 2 * Math.PI;
    var minSquare = minBulletSize * minBulletSize * 2 * Math.PI;

    // create circle for each country
    for (var i = 0; i < mapData.length; i++) {
      var dataItem = mapData[i];
      var value = dataItem.value;
      // calculate size of a bubble
      var square = (value - min) / (max - min) * (maxSquare - minSquare) + minSquare;
      if (square < minSquare) {
        square = minSquare;
      }
      var size = Math.sqrt(square / (Math.PI * 2));
      var id = dataItem.code;

      dataProvider.images.push({
        type: 'circle',
        width: size,
        height: size,
        color: dataItem.color,
        longitude: latlong[id].longitude,
        latitude: latlong[id].latitude,
        title: dataItem.name,
        value: value
      });
    }

    map.dataProvider = dataProvider;
    map.export = {
      enabled: true
    };

    $timeout(function() {
      map.write('map-bubbles');
    }, 100);
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  LeafletPageCtrl.$inject = ["$timeout"];
  angular.module('zAdmin.pages.maps')
      .controller('LeafletPageCtrl', LeafletPageCtrl);

  /** @ngInject */
  function LeafletPageCtrl($timeout) {
    function initialize() {
      L.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet/dist/images';
      var map = L.map(document.getElementById('leaflet-map')).setView([51.505, -0.09], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.marker([51.5, -0.09]).addTo(map)
          .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
          .openPopup();
    }

    $timeout(function(){
      initialize();
    }, 100);

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  MapLinesPageCtrl.$inject = ["baConfig", "$timeout", "layoutPaths"];
  angular.module('zAdmin.pages.maps')
      .controller('MapLinesPageCtrl', MapLinesPageCtrl);

  /** @ngInject */
  function MapLinesPageCtrl(baConfig, $timeout, layoutPaths) {
    var layoutColors = baConfig.colors;
    // svg path for target icon
    var targetSVG = 'M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z';
// svg path for plane icon
    var planeSVG = 'M19.671,8.11l-2.777,2.777l-3.837-0.861c0.362-0.505,0.916-1.683,0.464-2.135c-0.518-0.517-1.979,0.278-2.305,0.604l-0.913,0.913L7.614,8.804l-2.021,2.021l2.232,1.061l-0.082,0.082l1.701,1.701l0.688-0.687l3.164,1.504L9.571,18.21H6.413l-1.137,1.138l3.6,0.948l1.83,1.83l0.947,3.598l1.137-1.137V21.43l3.725-3.725l1.504,3.164l-0.687,0.687l1.702,1.701l0.081-0.081l1.062,2.231l2.02-2.02l-0.604-2.689l0.912-0.912c0.326-0.326,1.121-1.789,0.604-2.306c-0.452-0.452-1.63,0.101-2.135,0.464l-0.861-3.838l2.777-2.777c0.947-0.947,3.599-4.862,2.62-5.839C24.533,4.512,20.618,7.163,19.671,8.11z';
    $timeout(function() {
      var map = AmCharts.makeChart( 'map-lines', {
        type: 'map',
        theme: 'z',
        dataProvider: {
          map: 'worldLow',
          linkToObject: 'london',
          images: [ {
            id: 'london',
            svgPath: targetSVG,
            title: 'London',
            latitude: 51.5002,
            longitude: -0.1262,
            scale: 1.5,
            zoomLevel: 2.74,
            zoomLongitude: -20.1341,
            zoomLatitude: 49.1712,

            lines: [ {
              latitudes: [ 51.5002, 50.4422 ],
              longitudes: [ -0.1262, 30.5367 ]
            }, {
              latitudes: [ 51.5002, 46.9480 ],
              longitudes: [ -0.1262, 7.4481 ]
            }, {
              latitudes: [ 51.5002, 59.3328 ],
              longitudes: [ -0.1262, 18.0645 ]
            }, {
              latitudes: [ 51.5002, 40.4167 ],
              longitudes: [ -0.1262, -3.7033 ]
            }, {
              latitudes: [ 51.5002, 46.0514 ],
              longitudes: [ -0.1262, 14.5060 ]
            }, {
              latitudes: [ 51.5002, 48.2116 ],
              longitudes: [ -0.1262, 17.1547 ]
            }, {
              latitudes: [ 51.5002, 44.8048 ],
              longitudes: [ -0.1262, 20.4781 ]
            }, {
              latitudes: [ 51.5002, 55.7558 ],
              longitudes: [ -0.1262, 37.6176 ]
            }, {
              latitudes: [ 51.5002, 38.7072 ],
              longitudes: [ -0.1262, -9.1355 ]
            }, {
              latitudes: [ 51.5002, 54.6896 ],
              longitudes: [ -0.1262, 25.2799 ]
            }, {
              latitudes: [ 51.5002, 64.1353 ],
              longitudes: [ -0.1262, -21.8952 ]
            }, {
              latitudes: [ 51.5002, 40.4300 ],
              longitudes: [ -0.1262, -74.0000 ]
            } ],

            images: [ {
              label: 'Flights from London',
              svgPath: planeSVG,
              left: 100,
              top: 45,
              labelShiftY: 5,
              labelShiftX: 5,
              color: layoutColors.defaultText,
              labelColor: layoutColors.defaultText,
              labelRollOverColor: layoutColors.defaultText,
              labelFontSize: 20
            }, {
              label: 'show flights from Vilnius',
              left: 106,
              top: 70,
              labelColor: layoutColors.defaultText,
              labelRollOverColor: layoutColors.defaultText,
              labelFontSize: 11,
              linkToObject: 'vilnius'
            } ]
          },

            {
              id: 'vilnius',
              svgPath: targetSVG,
              title: 'Vilnius',
              latitude: 54.6896,
              longitude: 25.2799,
              scale: 1.5,
              zoomLevel: 4.92,
              zoomLongitude: 15.4492,
              zoomLatitude: 50.2631,

              lines: [ {
                latitudes: [ 54.6896, 50.8371 ],
                longitudes: [ 25.2799, 4.3676 ]
              }, {
                latitudes: [ 54.6896, 59.9138 ],
                longitudes: [ 25.2799, 10.7387 ]
              }, {
                latitudes: [ 54.6896, 40.4167 ],
                longitudes: [ 25.2799, -3.7033 ]
              }, {
                latitudes: [ 54.6896, 50.0878 ],
                longitudes: [ 25.2799, 14.4205 ]
              }, {
                latitudes: [ 54.6896, 48.2116 ],
                longitudes: [ 25.2799, 17.1547 ]
              }, {
                latitudes: [ 54.6896, 44.8048 ],
                longitudes: [ 25.2799, 20.4781 ]
              }, {
                latitudes: [ 54.6896, 55.7558 ],
                longitudes: [ 25.2799, 37.6176 ]
              }, {
                latitudes: [ 54.6896, 37.9792 ],
                longitudes: [ 25.2799, 23.7166 ]
              }, {
                latitudes: [ 54.6896, 54.6896 ],
                longitudes: [ 25.2799, 25.2799 ]
              }, {
                latitudes: [ 54.6896, 51.5002 ],
                longitudes: [ 25.2799, -0.1262 ]
              }, {
                latitudes: [ 54.6896, 53.3441 ],
                longitudes: [ 25.2799, -6.2675 ]
              } ],

              images: [ {
                label: 'Flights from Vilnius',
                svgPath: planeSVG,
                left: 100,
                top: 45,
                labelShiftY: 5,
                labelShiftX: 5,
                color: layoutColors.defaultText,
                labelColor: layoutColors.defaultText,
                labelRollOverColor: layoutColors.defaultText,
                labelFontSize: 20
              }, {
                label: 'show flights from London',
                left: 106,
                top: 70,
                labelColor: layoutColors.defaultText,
                labelRollOverColor: layoutColors.defaultText,
                labelFontSize: 11,
                linkToObject: 'london'
              } ]
            }, {
              svgPath: targetSVG,
              title: 'Brussels',
              latitude: 50.8371,
              longitude: 4.3676
            }, {
              svgPath: targetSVG,
              title: 'Prague',
              latitude: 50.0878,
              longitude: 14.4205
            }, {
              svgPath: targetSVG,
              title: 'Athens',
              latitude: 37.9792,
              longitude: 23.7166
            }, {
              svgPath: targetSVG,
              title: 'Reykjavik',
              latitude: 64.1353,
              longitude: -21.8952
            }, {
              svgPath: targetSVG,
              title: 'Dublin',
              latitude: 53.3441,
              longitude: -6.2675
            }, {
              svgPath: targetSVG,
              title: 'Oslo',
              latitude: 59.9138,
              longitude: 10.7387
            }, {
              svgPath: targetSVG,
              title: 'Lisbon',
              latitude: 38.7072,
              longitude: -9.1355
            }, {
              svgPath: targetSVG,
              title: 'Moscow',
              latitude: 55.7558,
              longitude: 37.6176
            }, {
              svgPath: targetSVG,
              title: 'Belgrade',
              latitude: 44.8048,
              longitude: 20.4781
            }, {
              svgPath: targetSVG,
              title: 'Bratislava',
              latitude: 48.2116,
              longitude: 17.1547
            }, {
              svgPath: targetSVG,
              title: 'Ljubljana',
              latitude: 46.0514,
              longitude: 14.5060
            }, {
              svgPath: targetSVG,
              title: 'Madrid',
              latitude: 40.4167,
              longitude: -3.7033
            }, {
              svgPath: targetSVG,
              title: 'Stockholm',
              latitude: 59.3328,
              longitude: 18.0645
            }, {
              svgPath: targetSVG,
              title: 'Bern',
              latitude: 46.9480,
              longitude: 7.4481
            }, {
              svgPath: targetSVG,
              title: 'Kiev',
              latitude: 50.4422,
              longitude: 30.5367
            }, {
              svgPath: targetSVG,
              title: 'Paris',
              latitude: 48.8567,
              longitude: 2.3510
            }, {
              svgPath: targetSVG,
              title: 'New York',
              latitude: 40.43,
              longitude: -74
            }
          ]
        },

        areasSettings: {
          unlistedAreasColor: layoutColors.info
        },

        imagesSettings: {
          color: layoutColors.warningLight,
          selectedColor: layoutColors.warning
        },

        linesSettings: {
          color: layoutColors.warningLight,
          alpha: 0.8
        },


        backgroundZoomsToTop: true,
        linesAboveImages: true,

        export: {
          'enabled': true
        },
        pathToImages: layoutPaths.images.amMap
      } );
    }, 100);

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  IconsPageCtrl.$inject = ["$scope"];
  angular.module('zAdmin.pages.ui.icons')
      .controller('IconsPageCtrl', IconsPageCtrl);

  /** @ngInject */
  function IconsPageCtrl($scope) {
    $scope.icons = {
      kameleonIcons: [
        {
          name: 'Beach',
          img: 'Beach'
        },
        {
          name: 'Bus',
          img: 'Bus'
        },
        {
          name: 'Cheese',
          img: 'Cheese'
        },
        {
          name: 'Desert',
          img: 'Desert'
        },
        {
          name: 'Images',
          img: 'Images'
        },
        {
          name: 'Magician',
          img: 'Magician'
        },
        {
          name: 'Makeup',
          img: 'Makeup'
        },
        {
          name: 'Programming',
          img: 'Programming'
        },
        {
          name: 'Shop',
          img: 'Shop'
        },
        {
          name: 'Surfer',
          img: 'Surfer'
        },
        {
          name: 'Phone Booth',
          img: 'Phone-Booth'
        },
        {
          name: 'Ninja',
          img: 'Ninja'
        },
        {
          name: 'Apartment',
          img: 'Apartment'
        },
        {
          name: 'Batman',
          img: 'Batman'
        },
        {
          name: 'Medal',
          img: 'Medal-2'
        },
        {
          name: 'Money',
          img: 'Money-Increase'
        },
        {
          name: 'Street View',
          img: 'Street-View'
        },
        {
          name: 'Student',
          img: 'Student-3'
        },
        {
          name: 'Bell',
          img: 'Bell'
        },
        {
          name: 'Woman',
          img: 'Boss-5'
        },
        {
          name: 'Euro',
          img: 'Euro-Coin'
        },
        {
          name: 'Chessboard',
          img: 'Chessboard'
        },
        {
          name: 'Burglar',
          img: 'Burglar'
        },
        {
          name: 'Dna',
          img: 'Dna'
        },
        {
          name: 'Clipboard Plan',
          img: 'Clipboard-Plan'
        },
        {
          name: 'Boss',
          img: 'Boss-3'
        },
        {
          name: 'Key',
          img: 'Key'
        },
        {
          name: 'Surgeon',
          img: 'Surgeon'
        },
        {
          name: 'Hacker',
          img: 'Hacker'
        },
        {
          name: 'Santa',
          img: 'Santa'
        }
      ],
      kameleonRoundedIcons: [
        {
          color: 'success',
          img: 'Apartment',
          name: 'Apartment'
        },
        {
          color: 'warning',
          img: 'Bus',
          name: 'Bus'
        },
        {
          color: 'primary',
          img: 'Checklist',
          name: 'Checklist'
        },
        {
          color: 'warning',
          img: 'Desert',
          name: 'Desert'
        },
        {
          color: 'danger',
          img: 'Laptop-Signal',
          name: 'Laptop Signal'
        },
        {
          color: 'info',
          img: 'Love-Letter',
          name: 'Love Letter'
        },
        {
          color: 'success',
          img: 'Makeup',
          name: 'Makeup'
        },
        {
          color: 'primary',
          img: 'Santa',
          name: 'Santa'
        },
        {
          color: 'success',
          img: 'Surfer',
          name: 'Surfer'
        },
        {
          color: 'info',
          img: 'Vector',
          name: 'Vector'
        },
        {
          color: 'warning',
          img: 'Money-Increase',
          name: 'Money Increase'
        },
        {
          color: 'info',
          img: 'Alien',
          name: 'Alien'
        },
        {
          color: 'danger',
          img: 'Online-Shopping',
          name: 'Online Shopping'
        },
        {
          color: 'warning',
          img: 'Euro-Coin',
          name: 'Euro'
        },
        {
          color: 'info',
          img: 'Boss-3',
          name: 'Boss'
        }
      ],
      ionicons: ['ion-ionic', 'ion-arrow-right-b', 'ion-arrow-down-b', 'ion-arrow-left-b', 'ion-arrow-up-c', 'ion-arrow-right-c', 'ion-arrow-down-c', 'ion-arrow-left-c', 'ion-arrow-return-right', 'ion-arrow-return-left', 'ion-arrow-swap', 'ion-arrow-shrink', 'ion-arrow-expand', 'ion-arrow-move', 'ion-arrow-resize', 'ion-chevron-up', 'ion-chevron-right', 'ion-chevron-down', 'ion-chevron-left', 'ion-navicon-round', 'ion-navicon', 'ion-drag', 'ion-log-in', 'ion-log-out', 'ion-checkmark-round', 'ion-checkmark', 'ion-checkmark-circled', 'ion-close-round', 'ion-plus-round', 'ion-minus-round', 'ion-information', 'ion-help', 'ion-backspace-outline', 'ion-help-buoy', 'ion-asterisk', 'ion-alert', 'ion-alert-circled', 'ion-refresh', 'ion-loop', 'ion-shuffle', 'ion-home', 'ion-search', 'ion-flag', 'ion-star', 'ion-heart', 'ion-heart-broken', 'ion-gear-a', 'ion-gear-b', 'ion-toggle-filled', 'ion-toggle', 'ion-settings', 'ion-wrench', 'ion-hammer', 'ion-edit', 'ion-trash-a', 'ion-trash-b', 'ion-document', 'ion-document-text', 'ion-clipboard', 'ion-scissors', 'ion-funnel', 'ion-bookmark', 'ion-email', 'ion-email-unread', 'ion-folder', 'ion-filing', 'ion-archive', 'ion-reply', 'ion-reply-all', 'ion-forward'],
      fontAwesomeIcons: ['fa fa-adjust', 'fa fa-anchor', 'fa fa-archive', 'fa fa-area-chart', 'fa fa-arrows', 'fa fa-arrows-h', 'fa fa-arrows-v', 'fa fa-asterisk', 'fa fa-at', 'fa fa-automobile', 'fa fa-ban', 'fa fa-bank', 'fa fa-bar-chart', 'fa fa-bar-chart-o', 'fa fa-barcode', 'fa fa-bars', 'fa fa-bed', 'fa fa-beer', 'fa fa-bell', 'fa fa-bell-o', 'fa fa-bell-slash', 'fa fa-bell-slash-o', 'fa fa-bicycle', 'fa fa-binoculars', 'fa fa-birthday-cake', 'fa fa-bolt', 'fa fa-bomb', 'fa fa-book', 'fa fa-bookmark', 'fa fa-bookmark-o', 'fa fa-briefcase', 'fa fa-bug', 'fa fa-building', 'fa fa-building-o', 'fa fa-bullhorn'],
      socicon: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', ',', ';', ':', '+', '@', '=', '-', '^', '?', '$', '*', '&', '(', '#', '.', '_', ']', ')', '\'', '"', '}', '{']
    }
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  ModalsPageCtrl.$inject = ["$scope", "$uibModal"];
  angular.module('zAdmin.pages.ui.notifications')
    .controller('ModalsPageCtrl', ModalsPageCtrl);

  /** @ngInject */
  function ModalsPageCtrl($scope, $uibModal) {
    $scope.open = function (page, size) {
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    };
  }


})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  ButtonPageCtrl.$inject = ["$scope", "$timeout"];
  angular.module('zAdmin.pages.ui.buttons')
      .controller('ButtonPageCtrl', ButtonPageCtrl);

  /** @ngInject */
  function ButtonPageCtrl($scope, $timeout) {
    $scope.progressFunction = function() {
      return $timeout(function() {}, 3000);
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  NotificationsPageCtrl.$inject = ["$scope", "toastr", "toastrConfig"];
  angular.module('zAdmin.pages.ui.notifications')
      .controller('NotificationsPageCtrl', NotificationsPageCtrl);

  /** @ngInject */
  function NotificationsPageCtrl($scope, toastr, toastrConfig) {
    var defaultConfig = angular.copy(toastrConfig);
    $scope.types = ['success', 'error', 'info', 'warning'];

    $scope.quotes = [
      {
        title: 'Come to Freenode',
        message: 'We rock at <em>#angularjs</em>',
        options: {
          allowHtml: true
        }
      },
      {
        title: 'Looking for bootstrap?',
        message: 'Try ui-bootstrap out!'
      },
      {
        title: 'Wants a better router?',
        message: 'We have you covered with ui-router'
      },
      {
        title: 'Angular 2',
        message: 'Is gonna rock the world'
      },
      {
        title: null,
        message: 'Titles are not always needed'
      },
      {
        title: null,
        message: 'Toastr rock!'
      },
      {
        title: 'What about nice html?',
        message: '<strong>Sure you <em>can!</em></strong>',
        options: {
          allowHtml: true
        }
      },
      {
        title: 'Ionic is <em>cool</em>',
        message: 'Best mobile framework ever',
        options: {
          allowHtml: true
        }
      }
    ];

    var openedToasts = [];
    $scope.options = {
      autoDismiss: false,
      positionClass: 'toast-top-right',
      type: 'info',
      timeOut: '5000',
      extendedTimeOut: '2000',
      allowHtml: false,
      closeButton: false,
      tapToDismiss: true,
      progressBar: false,
      newestOnTop: true,
      maxOpened: 0,
      preventDuplicates: false,
      preventOpenDuplicates: false,
      title: "Some title here",
      msg: "Type your message here"
    };


    $scope.clearLastToast = function () {
      var toast = openedToasts.pop();
      toastr.clear(toast);
    };

    $scope.clearToasts = function () {
      toastr.clear();
    };

    $scope.openRandomToast = function () {
      var type = Math.floor(Math.random() * $scope.types.length);
      var quote = Math.floor(Math.random() * $scope.quotes.length);
      var toastType = $scope.types[type];
      var toastQuote = $scope.quotes[quote];
      openedToasts.push(toastr[toastType](toastQuote.message, toastQuote.title, toastQuote.options));
      $scope.optionsStr = "toastr." + toastType + "(\'" + toastQuote.message + "\', \'" + toastQuote.title + "', " + JSON.stringify(toastQuote.options || {}, null, 2) + ")";
    };

    $scope.openToast = function () {
      angular.extend(toastrConfig, $scope.options);
      openedToasts.push(toastr[$scope.options.type]($scope.options.msg, $scope.options.title));
      var strOptions = {};
      for (var o in  $scope.options) if (o != 'msg' && o != 'title')strOptions[o] = $scope.options[o];
      $scope.optionsStr = "toastr." + $scope.options.type + "(\'" + $scope.options.msg + "\', \'" + $scope.options.title + "\', " + JSON.stringify(strOptions, null, 2) + ")";
    };

    $scope.$on('$destroy', function iVeBeenDismissed() {
      angular.extend(toastrConfig, defaultConfig);
    })
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  appImage.$inject = ["layoutPaths"];
  angular.module('zAdmin.theme')
      .filter('appImage', appImage);

  /** @ngInject */
  function appImage(layoutPaths) {
    return function(input) {
      return layoutPaths.images.root + input;
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  kameleonImg.$inject = ["layoutPaths"];
  angular.module('zAdmin.theme')
      .filter('kameleonImg', kameleonImg);

  /** @ngInject */
  function kameleonImg(layoutPaths) {
    return function(input) {
      return layoutPaths.images.root + 'theme/icon/kameleon/' + input + '.svg';
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  profilePicture.$inject = ["layoutPaths"];
  angular.module('zAdmin.theme')
      .filter('profilePicture', profilePicture);

  /** @ngInject */
  function profilePicture(layoutPaths) {
    return function(input, ext) {
      ext = ext || 'png';
      return layoutPaths.images.profile + input + '.' + ext;
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
    .filter('plainText', plainText);

  /** @ngInject */
  function plainText() {
    return function(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  BaSidebarCtrl.$inject = ["$scope", "baSidebarService", "Core"];
  angular.module('zAdmin.theme.components')
    .controller('BaSidebarCtrl', BaSidebarCtrl);

  /** @ngInject */
  function BaSidebarCtrl($scope, baSidebarService,Core) {

    $scope.menuItems = baSidebarService.getMenuItems();

    $scope.defaultSidebarState = $scope.menuItems[0].stateRef;

    setShowOnSideBar();

    $scope.hoverItem = function ($event) {
      $scope.showHoverElem = true;
      $scope.hoverElemHeight =  $event.currentTarget.clientHeight;
      var menuTopValue = 66;
      $scope.hoverElemTop = $event.currentTarget.getBoundingClientRect().top - menuTopValue;
    };

    $scope.$on('$stateChangeSuccess', function () {
      if (baSidebarService.canSidebarBeHidden()) {
        baSidebarService.setMenuCollapsed(true);
      }
    });

    function setShowOnSideBar(){
      $scope.menuItems.forEach(function(menuItem){
          if(menuItem.showOnSideBar == false){
            menuItem.showOnSideBar= Core.checkForPagePermissions(menuItem.state_id);
          }
      })
    }
  }
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  baSidebar.$inject = ["$timeout", "baSidebarService", "baUtil", "layoutSizes"];
  angular.module('zAdmin.theme.components')
      .directive('baSidebar', baSidebar);

  /** @ngInject */
  function baSidebar($timeout, baSidebarService, baUtil, layoutSizes) {
    var jqWindow = $(window);
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/baSidebar/ba-sidebar.html',
      controller: 'BaSidebarCtrl',
      link: function(scope, el) {

        scope.menuHeight = el[0].childNodes[0].clientHeight - 84;
        jqWindow.on('click', _onWindowClick);
        jqWindow.on('resize', _onWindowResize);

        scope.$on('$destroy', function() {
          jqWindow.off('click', _onWindowClick);
          jqWindow.off('resize', _onWindowResize);
        });

        function _onWindowClick($evt) {
          if (!baUtil.isDescendant(el[0], $evt.target) &&
              !$evt.originalEvent.$sidebarEventProcessed &&
              !baSidebarService.isMenuCollapsed() &&
              baSidebarService.canSidebarBeHidden()) {
            $evt.originalEvent.$sidebarEventProcessed = true;
            $timeout(function(){
              baSidebarService.setMenuCollapsed(true);
            }, 10);
          }
        }

        // watch window resize to change menu collapsed state if needed
        function _onWindowResize() {
          var newMenuCollapsed = baSidebarService.shouldMenuBeCollapsed();
          var newMenuHeight = _calculateMenuHeight();
          if (newMenuCollapsed != baSidebarService.isMenuCollapsed() || scope.menuHeight != newMenuHeight) {
            scope.$apply(function(){
              scope.menuHeight = newMenuHeight;
              baSidebarService.setMenuCollapsed(newMenuCollapsed)
            });
          }
        }

        function _calculateMenuHeight() {
          return el[0].childNodes[0].clientHeight - 84;
        }
      }
    };
  }

})();
(function() {
  'use strict';

  angular.module('zAdmin.theme.components')
      .provider('baSidebarService', baSidebarServiceProvider);

  /** @ngInject */
  function baSidebarServiceProvider() {
    var staticMenuItems = [];

    this.addStaticItem = function() {
      staticMenuItems.push.apply(staticMenuItems, arguments);
    };

    /** @ngInject */
    this.$get = ["$state", "layoutSizes", function($state, layoutSizes) {
      return new _factory();

      function _factory() {
        var isMenuCollapsed = shouldMenuBeCollapsed();

        this.getMenuItems = function() {
          var states = defineMenuItemStates();
          var menuItems = states.filter(function(item) {
            return item.level == 0;
          });

          menuItems.forEach(function(item) {
            var children = states.filter(function(child) {
              return child.level == 1 && child.name.indexOf(item.name) === 0;
            });
            item.subMenu = children.length ? children : null;
          });

          return menuItems.concat(staticMenuItems);
        };

        this.shouldMenuBeCollapsed = shouldMenuBeCollapsed;
        this.canSidebarBeHidden = canSidebarBeHidden;

        this.setMenuCollapsed = function(isCollapsed) {
          isMenuCollapsed = isCollapsed;
        };

        this.isMenuCollapsed = function() {
          return isMenuCollapsed;
        };

        this.toggleMenuCollapsed = function() {
          isMenuCollapsed = !isMenuCollapsed;
        };

        this.getAllStateRefsRecursive = function(item) {
          var result = [];
          _iterateSubItems(item);
          return result;

          function _iterateSubItems(currentItem) {
            currentItem.subMenu && currentItem.subMenu.forEach(function(subItem) {
              subItem.stateRef && result.push(subItem.stateRef);
              _iterateSubItems(subItem);
            });
          }
        };

        function defineMenuItemStates() {
          return $state.get()
              .filter(function(s) {
                return s.sidebarMeta;
              })
              .map(function(s) {
                var meta = s.sidebarMeta;
                return {
                  name: s.name,
                  title: s.title,
                  level: (s.name.match(/\./g) || []).length,
                  order: meta.order,
                  icon: meta.icon,
                  stateRef: s.name,
                  showOnSideBar: meta.showOnSideBar,
                  state_id: s.state_id
                };
              })
              .sort(function(a, b) {
                return (a.level - b.level) * 100 + a.order - b.order;
              });
        }

        function shouldMenuBeCollapsed() {
          return window.innerWidth <= layoutSizes.resWidthCollapseSidebar;
        }

        function canSidebarBeHidden() {
          return window.innerWidth <= layoutSizes.resWidthHideSidebar;
        }
      }

    }];
    this.$get.$inject = ["$state", "layoutSizes"];

  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  baSidebarToggleMenu.$inject = ["baSidebarService"];
  baSidebarCollapseMenu.$inject = ["baSidebarService"];
  BaSidebarTogglingItemCtrl.$inject = ["$scope", "$element", "$attrs", "$state", "baSidebarService"];
  baUiSrefTogglingSubmenu.$inject = ["$state"];
  baUiSrefToggler.$inject = ["baSidebarService"];
  angular.module('zAdmin.theme.components')
      .directive('baSidebarToggleMenu', baSidebarToggleMenu)
      .directive('baSidebarCollapseMenu', baSidebarCollapseMenu)
      .directive('baSidebarTogglingItem', baSidebarTogglingItem)
      .controller('BaSidebarTogglingItemCtrl', BaSidebarTogglingItemCtrl)
      .directive('baUiSrefTogglingSubmenu', baUiSrefTogglingSubmenu)
      .directive('baUiSrefToggler', baUiSrefToggler);

  /** @ngInject */
  function baSidebarToggleMenu(baSidebarService) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        elem.on('click', function($evt) {
          $evt.originalEvent.$sidebarEventProcessed = true;
          scope.$apply(function() {
            baSidebarService.toggleMenuCollapsed();
          });
        });
      }
    };
  }

  /** @ngInject */
  function baSidebarCollapseMenu(baSidebarService) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        elem.on('click', function($evt) {
          $evt.originalEvent.$sidebarEventProcessed = true;
          if (!baSidebarService.isMenuCollapsed()) {
            scope.$apply(function() {
              baSidebarService.setMenuCollapsed(true);
            });
          }
        });
      }
    };
  }

  /** @ngInject */
  function baSidebarTogglingItem() {
    return {
      restrict: 'A',
      controller: 'BaSidebarTogglingItemCtrl'
    };
  }

  /** @ngInject */
  function BaSidebarTogglingItemCtrl($scope, $element, $attrs, $state, baSidebarService) {
    var vm = this;
    var menuItem = vm.$$menuItem = $scope.$eval($attrs.baSidebarTogglingItem);
    if (menuItem && menuItem.subMenu && menuItem.subMenu.length) {
      vm.$$expandSubmenu = function() { console.warn('$$expandMenu should be overwritten by baUiSrefTogglingSubmenu') };
      vm.$$collapseSubmenu = function() { console.warn('$$collapseSubmenu should be overwritten by baUiSrefTogglingSubmenu') };

      var subItemsStateRefs = baSidebarService.getAllStateRefsRecursive(menuItem);

      vm.$expand = function() {
        vm.$$expandSubmenu();
        $element.addClass('ba-sidebar-item-expanded');
      };

      vm.$collapse = function() {
        vm.$$collapseSubmenu();
        $element.removeClass('ba-sidebar-item-expanded');
      };

      vm.$toggle = function() {
        $element.hasClass('ba-sidebar-item-expanded') ?
            vm.$collapse() :
            vm.$expand();
      };

      if (_isState($state.current)) {
        $element.addClass('ba-sidebar-item-expanded');
      }

      $scope.$on('$stateChangeStart', function (event, toState) {
        if (!_isState(toState) && $element.hasClass('ba-sidebar-item-expanded')) {
          vm.$collapse();
          $element.removeClass('ba-sidebar-item-expanded');
        }
      });

      $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (_isState(toState) && !$element.hasClass('ba-sidebar-item-expanded')) {
          vm.$expand();
          $element.addClass('ba-sidebar-item-expanded');
        }
      });
    }

    function _isState(state) {
      return state && subItemsStateRefs.some(function(subItemState) {
            return state.name.indexOf(subItemState) == 0;
          });
    }
  }

  /** @ngInject */
  function baUiSrefTogglingSubmenu($state) {
    return {
      restrict: 'A',
      require: '^baSidebarTogglingItem',
      link: function(scope, el, attrs, baSidebarTogglingItem) {
        baSidebarTogglingItem.$$expandSubmenu = function() { el.slideDown(); };
        baSidebarTogglingItem.$$collapseSubmenu = function() { el.slideUp(); };
      }
    };
  }

  /** @ngInject */
  function baUiSrefToggler(baSidebarService) {
    return {
      restrict: 'A',
      require: '^baSidebarTogglingItem',
      link: function(scope, el, attrs, baSidebarTogglingItem) {
        el.on('click', function() {
          if (baSidebarService.isMenuCollapsed()) {
            // If the whole sidebar is collapsed and this item has submenu. We need to open sidebar.
            // This should not affect mobiles, because on mobiles sidebar should be hidden at all
            scope.$apply(function() {
              baSidebarService.setMenuCollapsed(false);
            });
            baSidebarTogglingItem.$expand();
          } else {
            baSidebarTogglingItem.$toggle();
          }
        });
      }
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  /**
   * Includes basic panel layout inside of current element.
   */
  baPanel.$inject = ["baPanel", "baConfig"];
  angular.module('zAdmin.theme')
      .directive('baPanel', baPanel);

  /** @ngInject */
  function baPanel(baPanel, baConfig) {
    return angular.extend({}, baPanel, {
      template: function(el, attrs) {
        var res = '<div  class="panel ' + (baConfig.theme.z ? 'panel-z' : '') + ' full-invisible ' + (attrs.baPanelClass || '');
        res += '" zoom-in ' + (baConfig.theme.z ? 'ba-panel-z' : '') + '>';
        res += baPanel.template(el, attrs);
        res += '</div>';
        return res;
      }
    });
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .factory('baPanel', baPanel);

  /** @ngInject */
  function baPanel() {

    /** Base baPanel directive */
    return {
      restrict: 'A',
      transclude: true,
      scope:true,
      link:function($scope,elem){
        $scope.togglePannel = togglePannel;

        function togglePannel(){
          $scope.hideBody = !$scope.hideBody;
          $(elem).find('.panel-body').slideToggle(300)
        }
      },
      template: function(elem, attrs) {
        var res = '<div class="panel-body" ng-transclude></div>';
        if (attrs.baPanelTitle) {
          var titleTpl = '<div class="panel-heading clearfix"><h3 class="panel-title">' + attrs.baPanelTitle + '<i class="pannel-toggler ion-chevron-{{!!hideBody ? \'up\' : \'down\'}}" ng-click="togglePannel()"></h3></div>';
          res = titleTpl + res; // title should be before
        }

        return res;
      }
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  baPanelz.$inject = ["baPanelzHelper", "$window", "$rootScope"];
  angular.module('zAdmin.theme')
      .directive('baPanelz', baPanelz);

  /** @ngInject */
  function baPanelz(baPanelzHelper, $window, $rootScope) {
    var bodyBgSize;

    baPanelzHelper.bodyBgLoad().then(function() {
      bodyBgSize = baPanelzHelper.getBodyBgImageSizes();
    });

    $window.addEventListener('resize', function() {
      bodyBgSize = baPanelzHelper.getBodyBgImageSizes();
    });

    return {
      restrict: 'A',
      link: function($scope, elem) {
        if(!$rootScope.$isMobile) {
          baPanelzHelper.bodyBgLoad().then/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
            setTimeout(recalculatePanelStyle);
          });
          $window.addEventListener('resize', recalculatePanelStyle);

          $scope.$on('$destroy', function () {
            $window.removeEventListener('resize', recalculatePanelStyle);
          });
        }

        function recalculatePanelStyle() {
          if (!bodyBgSize) {
            return;
          }
          elem.css({
            backgroundSize: Math.round(bodyBgSize.width) + 'px ' + Math.round(bodyBgSize.height) + 'px',
            backgroundPosition: Math.floor(bodyBgSize.positionX) + 'px ' + Math.floor(bodyBgSize.positionY) + 'px'
          });
        }

      }
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  baPanelzHelper.$inject = ["$q"];
  angular.module('zAdmin.theme')
      .service('baPanelzHelper', baPanelzHelper);

  /** @ngInject */
  function baPanelzHelper($q) {
    var res = $q.defer();
    var computedStyle = getComputedStyle(document.body, ':before');
    var image = new Image();
    image.src = computedStyle.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
    image.onerror = function() {
      res.reject();
    };
    image.onload = function() {
      res.resolve();
    };

    this.bodyBgLoad = function() {
      return res.promise;
    };

    this.getBodyBgImageSizes = function() {
      var elemW = document.documentElement.clientWidth;
      var elemH = document.documentElement.clientHeight;
      if(elemW <= 640) return;
      var imgRatio = (image.height / image.width);       // original img ratio
      var containerRatio = (elemH / elemW);     // container ratio

      var finalHeight, finalWidth;
      if (containerRatio > imgRatio) {
        finalHeight = elemH;
        finalWidth = (elemH / imgRatio);
      } else {
        finalWidth = elemW;
        finalHeight = (elemW * imgRatio);
      }
      return { width: finalWidth, height: finalHeight, positionX: (elemW - finalWidth)/2, positionY: (elemH - finalHeight)/2};
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  /**
   * Represents current element as panel, adding all necessary classes.
   */
  baPanelSelf.$inject = ["baPanel"];
  angular.module('zAdmin.theme')
      .directive('baPanelSelf', baPanelSelf);

  /** @ngInject */
  function baPanelSelf(baPanel) {
    return angular.extend({}, baPanel, {
      link: function(scope, el, attrs) {
        el.addClass('panel panel-white');
        if (attrs.baPanelClass) {
          el.addClass(attrs.baPanelClass);
        }
      }
    });
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components')
      .directive('backTop', backTop);

  /** @ngInject */
  function backTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/backTop/backTop.html',
      controller: function () {
        $('#backTop').backTop({
          'position': 200,
          'speed': 100
        });
      }
    };
  }

})();
(function() {
  'use strict';

  angular.module('zAdmin.theme.components')
    .directive('baWizard', baWizard);

  /** @ngInject */
  function baWizard() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'app/theme/components/baWizard/baWizard.html',
      controllerAs: '$baWizardController',
      controller: 'baWizardCtrl'
    }
  }
})();

(function() {
  'use strict';

  baWizardCtrl.$inject = ["$scope"];
  angular.module('zAdmin.theme.components')
    .controller('baWizardCtrl', baWizardCtrl);

  /** @ngInject */
  function baWizardCtrl($scope) {
    var vm = this;
    vm.tabs = [];

    vm.tabNum = 0;
    vm.progress = 0;

    vm.addTab = function(tab) {
      tab.setPrev(vm.tabs[vm.tabs.length - 1]);
      vm.tabs.push(tab);
      vm.selectTab(0);
    };

    $scope.$watch(angular.bind(vm, function () {return vm.tabNum;}), calcProgress);

    vm.selectTab = function (tabNum) {
      vm.tabs[vm.tabNum].submit();
      if (vm.tabs[tabNum].isAvailiable()) {
        vm.tabNum = tabNum;
        vm.tabs.forEach(function (t, tIndex) {
          tIndex == vm.tabNum ? t.select(true) : t.select(false);
        });
      }
    };

    vm.isFirstTab = function () {
      return vm.tabNum == 0;
    };

    vm.isLastTab = function () {
      return vm.tabNum == vm.tabs.length - 1 ;
    };

    vm.nextTab = function () {
      vm.selectTab(vm.tabNum + 1)
    };

    vm.previousTab = function () {
      vm.selectTab(vm.tabNum - 1)
    };

    function calcProgress() {
      vm.progress = ((vm.tabNum + 1) / vm.tabs.length) * 100;
    }
  }
})();


(function() {
  'use strict';

  angular.module('zAdmin.theme.components')
    .directive('baWizardStep', baWizardStep);

  /** @ngInject */
  function baWizardStep() {
    return {
      restrict: 'E',
      transclude: true,
      require: '^baWizard',
      scope: {
        form: '='
      },
      templateUrl:  'app/theme/components/baWizard/baWizardStep.html',
      link: function($scope, $element, $attrs, wizard) {
        $scope.selected = true;

        var tab = {
          title: $attrs.title,
          select: select,
          submit: submit,
          isComplete: isComplete,
          isAvailiable: isAvailiable,
          prevTab: undefined,
          setPrev: setPrev
        };

        wizard.addTab(tab);

        function select(isSelected) {
          if (isSelected) {
            $scope.selected = true;
          } else {
            $scope.selected = false;
          }
        }

        function submit() {
          $scope.form && $scope.form.$setSubmitted(true);
        }

        function isComplete() {
          return $scope.form ? $scope.form.$valid : true;
        }

        function isAvailiable() {
          return tab.prevTab ? tab.prevTab.isComplete() : true;
        }

        function setPrev(pTab) {
          tab.prevTab = pTab;
        }
      }
    };
  }
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  contentTop.$inject = ["$location", "$state"];
  angular.module('zAdmin.theme.components')
      .directive('contentTop', contentTop);

  /** @ngInject */
  function contentTop($location, $state) {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/contentTop/contentTop.html',
      link: function($scope) {
        $scope.$watch(function () {
          var title = $state.current.title;
          if(!!$state.current.title && $state.current.title.indexOf('Edit') != -1){
            if(!!!$state.params.id){
              title = $state.current.title.replace('Edit','Add')
            }
          }
          $scope.activePageTitle = title;
        });
      }
    };
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  MsgCenterCtrl.$inject = ["$scope", "$sce"];
  angular.module('zAdmin.theme.components')
      .controller('MsgCenterCtrl', MsgCenterCtrl);

  /** @ngInject */
  function MsgCenterCtrl($scope, $sce) {
    $scope.users = {
      0: {
        name: 'Vlad',
      },
      1: {
        name: 'Kostya',
      },
      2: {
        name: 'Andrey',
      },
      3: {
        name: 'Nasta',
      }
    };

    $scope.notifications = [
      {
        userId: 0,
        template: '&name posted a new article.',
        time: '1 min ago'
      },
      {
        userId: 1,
        template: '&name changed his contact information.',
        time: '2 hrs ago'
      },
      {
        image: 'assets/img/shopping-cart.svg',
        template: 'New orders received.',
        time: '5 hrs ago'
      },
      {
        userId: 2,
        template: '&name replied to your comment.',
        time: '1 day ago'
      },
      {
        userId: 3,
        template: 'Today is &name\'s birthday.',
        time: '2 days ago'
      },
      {
        image: 'assets/img/comments.svg',
        template: 'New comments on your post.',
        time: '3 days ago'
      },
      {
        userId: 1,
        template: '&name invited you to join the event.',
        time: '1 week ago'
      }
    ];

    $scope.messages = [
      {
        userId: 3,
        text: 'After you get up and running, you can place Font Awesome icons just about...',
        time: '1 min ago'
      },
      {
        userId: 0,
        text: 'You asked, Font Awesome delivers with 40 shiny new icons in version 4.2.',
        time: '2 hrs ago'
      },
      {
        userId: 1,
        text: 'Want to request new icons? Here\'s how. Need vectors or want to use on the...',
        time: '10 hrs ago'
      },
      {
        userId: 2,
        text: 'Explore your passions and discover new ones by getting involved. Stretch your...',
        time: '1 day ago'
      },
      {
        userId: 3,
        text: 'Get to know who we are - from the inside out. From our history and culture, to the...',
        time: '1 day ago'
      },
      {
        userId: 1,
        text: 'Need some support to reach your goals? Apply for scholarships across a variety of...',
        time: '2 days ago'
      },
      {
        userId: 0,
        text: 'Wrap the dropdown\'s trigger and the dropdown menu within .dropdown, or...',
        time: '1 week ago'
      }
    ];

    $scope.getMessage = function(msg) {
      var text = msg.template;
      if (msg.userId || msg.userId === 0) {
        text = text.replace('&name', '<strong>' + $scope.users[msg.userId].name + '</strong>');
      }
      return $sce.trustAsHtml(text);
    };
  }
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components')
      .directive('msgCenter', msgCenter);

  /** @ngInject */
  function msgCenter() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/msgCenter/msgCenter.html',
      controller: 'MsgCenterCtrl'
    };
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  pageTopCtrl.$inject = ["authService", "$state"];
  angular.module('zAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
      controllerAs:"vm",
      controller:pageTopCtrl
    };
  }
  
  /** @ngInject */
  function pageTopCtrl(authService,$state) {
    var vm = this;
    this.logout = function(){
      authService.logout().then(function(data){
        $state.go('auth');
      },function(data){
        $state.go('auth');
      })
    } 
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components')
      .directive('widgets', widgets);

  /** @ngInject */
  function widgets() {
    return {
      restrict: 'EA',
      scope: {
        ngModel: '='
      },
      templateUrl: 'app/theme/components/widgets/widgets.html',
      replace: true
    };
  }

})();
(function() {
    'use strict';

    DefinitionsController.$inject = ["$scope", "$rootScope", "DataService", "$timeout", "$uibModal", "restrictionsValidatorService", "Core", "selectionHandlerService"];
    angular
        .module('zAdmin.annotation.directives')
        .directive('categoriesDirective',categoriesDirective);




    function categoriesDirective() {
        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/categories/categories.html',
            scope:{
                definitionDetails: '=',
                definitionId: '='
            },
            link: linkDefinitions,
            controller: DefinitionsController,
            controllerAs: 'defCtrl',
            bindToController: true

        };

        return directive;

        function linkDefinitions($scope, elem, attrs) {
            $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.backgroundColor);
        }


    }

    /** @ngInject */
    function DefinitionsController($scope,$rootScope,DataService, $timeout, $uibModal, restrictionsValidatorService,Core,selectionHandlerService) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;
        defCtrl.showCategoryInfo = showCategoryInfo;

        function highLightSelectedWords(color) {

            // $('.clickedToken').css('border','3px solid '+ defCtrl.definitionDetails.color);
            // $('.clickedToken').removeClass('clickedToken');

            var parentUnitId = $rootScope.clckedLine;
            // parentUnitId = parentUnitId.length == 1 ? parentUnitId[0] : parentUnitId.slice(1,parentUnitId.length).join('-');
            var parenUnit = DataService.getUnitById(parentUnitId);
            parentUnitId = '#row-'+parentUnitId;
            var parentUnitDomElement = $(parentUnitId);

            // var unitContainsAllParentUnitTokens = parentUnitDomElement.children().length-1 == $rootScope.selectedTokensArray.length;

            selectionHandlerService.toggleCategory(defCtrl.definitionDetails);

            // if(!(parenUnit.containsAllParentUnits && unitContainsAllParentUnitTokens)){
            //     $rootScope.currentCategoryID = defCtrl.definitionDetails.id;
            //     $rootScope.currentCategoryColor = defCtrl.definitionDetails.color || 'rgb(0,0,0)';
            //     $rootScope.currentCategoryBGColor = defCtrl.definitionDetails.backgroundColor || 'rgb(0,0,0)';
            //     $rootScope.currentCategoryIsRefined = defCtrl.definitionDetails.refinedCategory;
            //     $rootScope.currentCategoryAbbreviation = defCtrl.definitionDetails.abbreviation;
            //     $rootScope.currentCategoryName = defCtrl.definitionDetails.name;
            //     $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
            //
            //     var selectedUnits =  ($rootScope.clickedUnit != undefined && $rootScope.clickedUnit.includes('unit-wrapper') && $rootScope.selectedTokensArray.length === 1 );
            //
            //     if(!selectedUnits && $rootScope.selectedTokensArray.length > 0){
            //         $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine,unitContainsAllParentUnitTokens);
            //         DataService.updateDomWhenInsertFinishes();
            //     }else{
            //         if(selectedUnits){
            //             //The user has selected 1 unit box need to toggle category.
            //             $rootScope.clckedLine = $rootScope.clickedUnit.split('unit-wrapper-'+$rootScope.clckedLine+'-')[1];
            //
            //         }
            //         if(checkIfRowWasClicked($rootScope)){
            //             $rootScope.addCategoryToExistingRow();
            //         }
            //     }
            //     $rootScope.lastSelectedWordWithShiftPressed = undefined;
            // }
        }

        function preventIfPanctuation() {
            var isPunc = false;
            if($rootScope.selectedTokensArray.length == 1 && $rootScope.selectedTokensArray[0]){
                // check if the selected token is pangtuation
                var currentTokenId = $($rootScope.selectedTokensArray[0]).attr('token-id');
                var currentToken = DataService.hashTables.tokensHashTable[currentTokenId]
                if(currentToken.require_annotation==false){
                    console.log("Punctuation",currentToken);
                    Core.showAlert("The token is not for annotate");
                    isPunc = true;
                }
            }
            return isPunc;
        }

        function showCategoryInfo(categoryINdex) {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/categoryInfo.html',
                size: 'lg',
                controller: ["$scope", "$sce", function($scope,$sce){
                    $scope.name = defCtrl.definitionDetails.name;
                    if(defCtrl.definitionDetails.description){
                        $scope.description = $sce.trustAsHtml(defCtrl.definitionDetails.description);
                    }
                }]
            });
        };
        
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



    function checkIfRowWasClicked(rootScope){
        return rootScope.clckedLine != undefined && rootScope.clckedLine != '0';
    }

    


})();
(function() {
    'use strict';

    annotationUnitDirective.$inject = ["$rootScope", "DataService", "selectionHandlerService", "HotKeysManager", "hotkeys", "DefinitionsService", "$timeout", "$compile", "$uibModal", "restrictionsValidatorService", "ENV_CONST", "Core"];
    angular.module('zAdmin.annotation.directives')
        .directive('annotationUnits',annotationUnitDirective);

    /** @ngInject */
    function annotationUnitDirective($rootScope,DataService,selectionHandlerService,HotKeysManager,hotkeys,DefinitionsService, $timeout, $compile, $uibModal,restrictionsValidatorService, ENV_CONST, Core) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/annotationUnits/annotationUnits.html',
            scope:{
                unit:'=',
                previewLine: '=',
                annotationUnitTreeId: '=',
                childDirective: '@',
                categories: '=',
                control: '=',
                tokens:'='
            },
            link: annotationUnitDirectiveLink,
            controller: AnnotationUnitController,
            controllerAs: 'dirCtrl',
            bindToController: true,
            replace:false

        };

        return directive;

        function AnnotationUnitController(DataService) {
            var vm = this;
            vm.unitClicked = unitClicked;
            vm.isUnitClicked = isUnitClicked;
            vm.deleteUnit = deleteUnit;
            vm.toggleMouseUpDown = toggleMouseUpDown;
            vm.checkRestrictionForCurrentUnit = checkRestrictionForCurrentUnit;
            vm.addCommentToUnit = addCommentToUnit;
            vm.unitIsSelected =unitIsSelected;
            vm.switchToRemoteMode = switchToRemoteMode;
            vm.toggleAnnotationUnitView = toggleAnnotationUnitView;
            vm.isUnitCollaped = isUnitCollaped;
            vm.isUnitHidden = isUnitHidden;
            vm.dataBlock = DataService.getUnitById(vm.unit.annotation_unit_tree_id);

            vm.dataBlock['cursorLocation'] = 0;
            vm.dataBlock.parentUnitId = DataService.getParentUnitId(vm.dataBlock.annotation_unit_tree_id);
            vm.dataBlock.annotation_unit_tree_id !== "0" ? updateStartEndIndexForTokens(vm.dataBlock.tokens) : '';

        }

        function annotationUnitDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.dirCtrl;
            $scope.vm.dataBlock.tokens = $scope.vm.tokens;
            $scope.vm.dataBlock.tokenCopy = angular.copy($scope.vm.dataBlock.tokens)

            if($scope.vm.dataBlock.children_tokens_hash === undefined){
                $scope.vm.dataBlock.children_tokens_hash = {};
                $scope.vm.dataBlock.tokens.forEach(function(token){
                    $scope.vm.dataBlock.children_tokens_hash[token.id] = token;
                })
            }

            if($scope.vm.dataBlock.gui_status === undefined){
                $scope.vm.dataBlock.gui_status = "OPEN";
            }

            $scope.$on('ToggleSuccess', function(event, args) {
                if(args.id.toString() === $scope.vm.dataBlock.annotation_unit_tree_id ){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.annotation_unit_tree_id ));
                    paintTokens(parentUnit.tokens,parentUnit);
                }else{
                }
            });

            $scope.$on('InsertSuccess', function(event, args) {
                if(args.dataBlock.id.toString() === $scope.vm.dataBlock.annotation_unit_tree_id ){
                    if($scope.vm.dataBlock.AnnotationUnits.AnnotationUnits){
                        delete $scope.vm.dataBlock.AnnotationUnits.AnnotationUnits;
                    }
                    selectionHandlerService.updateSelectedUnit($scope.vm.dataBlock.annotation_unit_tree_id,true);
                    paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
                }else{
                }
            });

            $scope.$on('DeleteSuccess', function(event, args) {
                if(args.reset){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.annotation_unit_tree_id ));
                    RemoveBorder(parentUnit.tokens,parentUnit);
                }else{
                    paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
                }
            });

            $scope.$on('RemoveBorder', function(event, args) {
                if(args.id.toString() === $scope.vm.dataBlock.annotation_unit_tree_id ){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.annotation_unit_tree_id ));
                    RemoveBorder(parentUnit.tokens,parentUnit);
                }
            });


            $scope.vm.dataBlock.AnnotationUnits.length > 0 ? paintTokens($scope.vm.tokens,$scope.vm.dataBlock) : '';
        }

        function isUnitHidden(vm){
            return vm.gui_status === "HIDDEN";
        }

        function toggleAnnotationUnitView(vm){
            if(vm.dataBlock.gui_status === "OPEN"){
                vm.dataBlock.gui_status = "COLLAPSE"
            }else{
                vm.dataBlock.gui_status = "OPEN";
            }
        }

        function isUnitCollaped(vm){
            return vm.dataBlock.gui_status === "COLLAPSE";
        }

        function unitIsSelected(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.annotation_unit_tree_id;
        }
        function addCommentToUnit(unitId,vm){
            selectionHandlerService.updateSelectedUnit(unitId);
            open('app/pages/annotation/templates/commentOnUnitModal.html','sm','',vm)
        }
        function open(page, size,message,vm) {
            var remoteOriginalId = $rootScope.clckedLine;
            var viewModal = vm;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: ["$scope", function($scope){
                    $scope.vm = viewModal;
                    if(vm.dataBlock){
                        $scope.comment = $scope.vm.dataBlock.comment;
                    }

                    $scope.message = message;

                    $scope.saveComment = function(){
                        $scope.vm.dataBlock.comment = $scope.comment;
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
                }]
            }).result.then(function(okRes){

            },function(abortRes){

            });
        };



        function andBorderColor(tokens){
            tokens.forEach(function(token){
                if(token.categories.length === 2){
                    token.borderStyle = "border-top : 3px solid "+token.categories[1].backgroundColor+"; border-bottom : 3px solid "+token.categories[0].backgroundColor+"; border-left : 3px solid "+token.categories[0].backgroundColor+";"
                }
            })
        }

        function RemoveBorder(tokens, dataBlock){
            dataBlock.AnnotationUnits.forEach(function(unit,index){
                unit.tokens.forEach(function(token){
                    var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                    var elementPos = childUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                    var elementPosInThisUnit = tokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos !== -1){
                        tokens[elementPosInThisUnit].borderStyle = "border : none;";
                    }
                })
            });
        }

        function paintTokens(tokens, dataBlock){
            dataBlock.AnnotationUnits.forEach(function(unit,index){
                if(unit.unitType !== "REMOTE"){
                    unit.tokens.forEach(function(token){
                        var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                        var elementPos = childUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                        var elementPosInThisUnit = tokens.map(function(x) {return x.id; }).indexOf(token.id);
                        if(elementPos !== -1 && elementPosInThisUnit !== -1){
                            if(unit.categories.length === 1 && unit.categories[0] === undefined || unit.categories.length === 0){
                                unit.categories[0] = {
                                    id:9999,
                                    backgroundColor: 'gray'
                                }
                            }
                            childUnitTokens[elementPos].backgroundColor = unit.categories[0] ? unit.categories[0].backgroundColor : "transparent";

                            if(unit.categories.length === 1 && unit.categories[0].id === 9999){
                                tokens[elementPosInThisUnit].borderStyle = "transparent";
                            }

                            if(unit.categories.length > 1){
                                var elementPos = unit.categories.map(function(x) {return x.id; }).indexOf(9999);
                                if(elementPos > -1){
                                    unit.categories.splice(unit.categories,1);
                                }
                            }

                            switch(token.positionInUnit){
                                case 'First': {
                                    tokens[elementPosInThisUnit].borderStyle = borderForFirstToken(childUnitTokens[elementPos],unit.categories);
                                    break;
                                }
                                case 'FirstAndLast':{
                                    tokens[elementPosInThisUnit].borderStyle = borderForFirstAndLastToken(unit.categories);
                                    break;
                                }
                                case 'Last': {
                                    tokens[elementPosInThisUnit].borderStyle = borderForLastToken(childUnitTokens[elementPos],unit.categories);
                                    break;
                                }
                                case 'Middle': {
                                    tokens[elementPosInThisUnit].borderStyle = borderForMiddleToken(childUnitTokens[elementPos],unit.categories);
                                    break;
                                }
                            }

                        }
                    })
                }

            });
        }

        function borderForFirstAndLastToken(categories){
            switch(categories.length){
                case 1:{
                    return "border : 3px solid "+categories[0].backgroundColor+";";
                }
                case 2:{
                    return "border : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+";";
                }
                case 3:{
                    return "border : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";";
                }
                default:{
                    return "border : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";border-right : 3px solid "+categories[3].backgroundColor+";";
                }
            }
        }

        function borderForFirstToken(token,categories){
            switch(categories.length){
                case 1:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[0].backgroundColor+"; border-left : 3px solid "+categories[0].backgroundColor+";";
                }
                case 2:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[0].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";";
                }
            }


        }
        function borderForMiddleToken(token,categories){
            switch(categories.length){
                case 1:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[0].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+";";
                }
            }

            if(token.lastTokenNotAdjacent && token.nextTokenNotAdjacent){
                return "border : 3px solid "+token.backgroundColor+";";
            }else if(token.lastTokenNotAdjacent){
                return "border-top : 3px solid "+token.backgroundColor+"; border-bottom : 3px solid "+token.backgroundColor+"; border-left : 3px solid "+token.backgroundColor+";"
            }else if(token.nextTokenNotAdjacent){
                return "border-top : 3px solid "+token.backgroundColor+";  border-bottom : 3px solid "+token.backgroundColor+"; border-right : 3px solid "+token.backgroundColor+";"
            }
            return "border-top : 3px solid "+token.backgroundColor+"; border-bottom : 3px solid "+token.backgroundColor+";";

        }

        function borderForLastToken(token,categories){
            switch(categories.length){
                case 1:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[0].backgroundColor+"; border-right : 3px solid "+categories[0].backgroundColor+";";
                }
                case 2:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-right : 3px solid "+categories[0].backgroundColor+";";
                }
                case 3:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-right : 3px solid "+categories[2].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-right : 3px solid "+categories[3].backgroundColor+";";
                }
            }

        }

        function checkRestrictionForCurrentUnit(unit_id,event){
            if(!unit_id){
                // in case of coe here from hot key
                unit_id = $rootScope.clckedLine
                var rowElem = $('#directive-info-data-container-'+unit_id)
            }
            if(event){
                //  in case come here from click on 'f' in unit gui row
                var rowElem = $(event.toElement).parents(".directive-info-data-container").first()
            }
            var unitToValidate = DataService.getUnitById(unit_id);
            var parentUnit = DataService.getUnitById(DataService.getParentUnitId(unitToValidate.annotation_unit_tree_id))
            var hashTables = DataService.hashTables;
            var isUnitValidated = restrictionsValidatorService.checkRestrictionsOnFinish(unitToValidate,parentUnit,hashTables);
            if(isUnitValidated){
                if(parentUnit.annotation_unit_tree_id === "0"){
                    unitToValidate.gui_status = 'HIDDEN';
                }else{
                    unitToValidate.gui_status = 'COLLAPSE';
                }
                Core.showNotification('success','Annotation unit ' + unitToValidate.annotation_unit_tree_id + ' has finished successfully' )
            }
        }

        function toggleMouseUpDown(){
            var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed("ctrl");
            !shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
            HotKeysManager.updatePressedHotKeys({combo:'shift'},!shiftPressed);

            shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
        }

        function isUnitClicked(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.annotation_unit_tree_id;
        }

        function deleteUnit(unitId,vm){
            if(DataService.currentTask.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                Core.showAlert("Cant delete annotation units from refinement layer")
                console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                return unitId;
            }

            var currentUnit = DataService.getUnitById(unitId);


            if(DataService.unitsUsedAsRemote[unitId] !==  undefined){
                open('app/pages/annotation/templates/deleteAllRemoteModal.html','md',Object.keys(DataService.unitsUsedAsRemote[unitId]).length,vm);
            }else{
                if(currentUnit.unitType === "REMOTE"){
                    //UpdateUsedAsRemote
                    var remoteUnit = DataService.getUnitById(currentUnit.remote_original_id);
                    var elementPos = remoteUnit.usedAsRemote.map(function(x) {return x; }).indexOf(currentUnit.annotation_unit_tree_id);
                    if(elementPos > -1){
                        remoteUnit.usedAsRemote.splice(elementPos,1);
                    }

                    delete DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.annotation_unit_tree_id];
                }
                var parentUnit = DataService.getParentUnitId(unitId);
                DataService.deleteUnit(unitId).then(function(res){
                    selectionHandlerService.updateSelectedUnit(parentUnit);
                })
            }

        }

        function switchToRemoteMode(vm,event){
            addAsRemoteUnit(vm);
        }

        function addAsRemoteUnit(vm,category,event){
            var clickedUnit = selectionHandlerService.getSelectedUnitId();
            if(DataService.getUnitById(clickedUnit).unitType === "REMOTE"){
                // cant add remote unit to remote unit
                return;
            }
            if(category === undefined){
                category = {
                    id : null,
                    color : 'gray',
                    abbreviation : null
                };

            }
            //If a unit (not i the main passage) is selected switch to addRemoteUnit Mode
            if(clickedUnit !== '0'){
                $('.annotation-page-container').toggleClass('crosshair-cursor');
                selectionHandlerService.setUnitToAddRemotes(clickedUnit);
            }
        }

        function unitClicked(vm,index){
            if(selectionHandlerService.getUnitToAddRemotes() !== "0" && selectionHandlerService.getUnitToAddRemotes() !== index){
                // selectionHandlerService.disableTokenClicked();
                DataService.unitType = 'REMOTE';
                // var clickedUnit  = selectionHandlerService.getUnitToAddRemotes();
                var objToPush = {
                    rowId : '',
                    numOfAnnotationUnits: 0,
                    categories:[], // {color:defCtrl.definitionDetails.backgroundColor}
                    comment:"",
                    rowShape:'',
                    unitType:'REMOTE',
                    orderNumber: '-1',
                    gui_status:'OPEN',
                    usedAsRemote:[],
                    children_tokens:[],
                    containsAllParentUnits: false,
                    tokens:angular.copy(DataService.getUnitById(index).tokens),
                    AnnotationUnits : [

                    ]
                };

                objToPush["remote_original_id"] = vm.dataBlock.annotation_unit_tree_id;

                var newRowId = DataService.insertToTree(objToPush,selectionHandlerService.getUnitToAddRemotes()).then(function(res){
                    DataService.unitType = 'REGULAR';

                    if(DataService.unitsUsedAsRemote[vm.dataBlock.annotation_unit_tree_id] === undefined){
                        DataService.unitsUsedAsRemote[vm.dataBlock.annotation_unit_tree_id] = {};
                    }
                    DataService.unitsUsedAsRemote[vm.dataBlock.annotation_unit_tree_id][res.id] = true;


                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                });


            }
            selectionHandlerService.updateSelectedUnit(index);
        }

        function updateStartEndIndexForTokens(tokens){
            var currentIndex = 0;
            tokens.forEach(function(token){
                token.start_index = currentIndex;
                token.end_index = token.start_index;
                token.end_index += token.text.length;
                currentIndex = token.end_index + 2;
            })

        }




    }

})();
(function() {
    'use strict';

    unitCursorDirective.$inject = ["$rootScope", "selectionHandlerService", "HotKeysManager", "DataService"];
    angular.module('zAdmin.annotation.directives')
        .directive('unitCursor',unitCursorDirective);

    /** @ngInject */
    function unitCursorDirective($rootScope,selectionHandlerService,HotKeysManager,DataService) {

        var directive = {
            restrict:'E',
            template:'<span class="unit-cursor" ng-if="vm.isCursorUnitClicked(vm,$parent.$index)">|</span>',
            scope:{
                unitId:"="
            },
            link: unitCursorDirectiveLink,
            controller: unitCursorController,
            controllerAs: 'cursorCtrl',
            bindToController: true,
            replace:false,
            tokenClicked: false

        };

        return directive;

        function unitCursorDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.cursorCtrl;
            $scope.vm.cursorLocation = 0;
            $scope.vm.cursorUpdated = false;

            $scope.$on('tokenIsClicked', function(event, args) {
                // var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                // var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');

                if(args.parentId === $scope.vm.unitId.toString() ){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    var unitNode = DataService.getUnitById(args.parentId);
                    var elementPos = unitNode.tokens.map(function(x) {return x.id; }).indexOf(args.token.id);
                    if(elementPos > -1){
                        $(elem).insertAfter( unitTokens[elementPos] );
                        $scope.vm.cursorLocation = elementPos + 1;
                    }
                }
            });

            $scope.$on('moveRight', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                if(args.unitId === $scope.vm.unitId.toString()  && !$scope.vm.cursorUpdated){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    if($scope.vm.cursorLocation < unitTokens.length){
                        if(shiftPressed){
                            var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                            token.tokenIsClicked = true;
                            selectionHandlerService.setTokenClicked();

                            $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId});
                        }else if(ctrlPressed){
                            $scope.vm.cursorUpdated = true;
                        }else{
                            selectionHandlerService.clearTokenList();
                        }
                        !shiftPressed ? $(elem).insertAfter( unitTokens[$scope.vm.cursorLocation] ) : '';
                        var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                        $scope.vm.cursorLocation++;
                        var nextToken = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];

                        if(nextToken !== undefined && token.inUnit && nextToken.inUnit){
                            if(token.inUnit === nextToken.inUnit){
                                DataService.getUnitById(args.unitId).cursorLocation++;
                                $scope.vm.cursorUpdated = false;
                                $rootScope.$broadcast("moveRight",{unitId: args.unitId,unitCursorPosition: DataService.getUnitById(args.unitId).cursorLocation});
                            }
                        }
                    }

                }else if($scope.vm.cursorUpdated){
                    $scope.vm.cursorUpdated = false;
                }
            });

            $scope.$on('moveLeft', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                if(args.unitId === $scope.vm.unitId.toString() &&  !$scope.vm.cursorUpdated){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    if($scope.vm.cursorLocation > 0){
                        if(shiftPressed){

                        }else if(ctrlPressed){
                            $scope.vm.cursorUpdated = true;
                        }else{
                            selectionHandlerService.clearTokenList();
                        }
                        $scope.vm.cursorLocation--;
                        var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                        var prevToken = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation-1];

                        $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );

                        if(prevToken !== undefined && token.inUnit && prevToken.inUnit){
                            if(token.inUnit === prevToken.inUnit){
                                DataService.getUnitById(args.unitId).cursorLocation--;
                                $scope.vm.cursorUpdated = false;
                                $rootScope.$broadcast("moveLeft",{unitId: args.unitId,unitCursorPosition: DataService.getUnitById(args.unitId).cursorLocation});
                            }
                        }


                    }
                }else if($scope.vm.cursorUpdated){
                    $scope.vm.cursorUpdated = false;
                }
            });
        }

        function unitCursorController() {
            var vm = this;
            vm.isCursorUnitClicked = isCursorUnitClicked;
        }

        function isCursorUnitClicked(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.unitId.toString();
        }

    }

})();/**
 * Created by Nissan PC on 05/06/2017.
 */

(function() {
    'use strict';

    ItemController.$inject = ["$scope"];
    angular
        .module('zAdmin.annotation.directives')
        .directive('navBarItem',navBarItemDirective);
        

    function navBarItemDirective() {
        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/nav-bar-item/navBarItem.html',
            scope:{
                imagePath:'=',
                toolTip:'='
            },
            link: linkFunction,
            controller: ItemController,
            controllerAs: 'vm',
            bindToController: true

        };

        return directive;

        function linkFunction($scope, elem, attrs, modelCtrl) {
            // $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.color);
        }


    }

    /** @ngInject */
    function ItemController($scope) {
        // Injecting $scope just for comparison
        var vm = this;
        var annotationPageVM = $scope.$parent.vm;
        vm.itemClicked = itemClicked;

        function itemClicked(functionName){
            console.log(functionName);
            if(annotationPageVM[functionName]){
                annotationPageVM[functionName]()
            }else{
                console.log("function not exist",functionName);
            }
        }
    }



})();
(function() {
    'use strict';

    annotationTokenDirective.$inject = ["$rootScope", "selectionHandlerService", "HotKeysManager", "DataService"];
    angular.module('zAdmin.annotation.directives')
        .directive('annotationToken',annotationTokenDirective);

    /** @ngInject */
    function annotationTokenDirective($rootScope,selectionHandlerService,HotKeysManager,DataService) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/token/token.html',
            scope:{
                token:"=",
                parentId:"@"
            },
            link: annotationTokenDirectiveLink,
            controller: AnnotationTokenController,
            controllerAs: 'dirCtrl',
            bindToController: true,
            replace:true,
            tokenClicked: false

        };

        return directive;

        function annotationTokenDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.dirCtrl;
            $scope.vm.token['indexInParent'] = $scope.$parent.$index;
            $scope.vm.tokenInSelectionList = tokenInSelectionList;

            $scope.$on('tokenIsClicked', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');

                if(args.token.id !== $scope.vm.token.id ){
                    !ctrlPressed ? $scope.vm.tokenIsClicked = false : '';
                }else if(args.parentId !== undefined && (args.parentId.toString() ===  $scope.vm.parentId )){
                    !ctrlPressed && !shiftPressed && !args.selectAllTokenInUnit ? selectionHandlerService.clearTokenList() : '';
                    selectionHandlerService.addTokenToList($scope.vm.token,$scope.vm.parentId,args.selectAllTokenInUnit);
                    // $scope.vm.tokenIsClicked = true;
                }
            });

        }




        function AnnotationTokenController() {
            var vm = this;
            vm.token['inUnit'] === undefined ? vm.token['inUnit'] = null : '';
            vm.tokenIsClicked = directive.tokenClicked;
            vm.tokenClicked = tokenClicked;
            vm.isUnitClicked = isUnitClicked;
            vm.addOnHover = addOnHover;
            vm.tokenDbClick = tokenDbClick;
            vm.tokenUnitIsSelected = tokenUnitIsSelected;
            vm.initToken = initToken;
        }

        function tokenDbClick(vm){
            selectionHandlerService.clearTokenList();
            if(vm.token.inUnit !== null && vm.token.inUnit !== undefined){
                DataService.getUnitById(vm.token.inUnit).gui_status = "OPEN";
                DataService.getUnitById(DataService.getParentUnitId(vm.token.inUnit)).gui_status = "OPEN";
                selectionHandlerService.updateSelectedUnit(vm.token.inUnit);
            }

        }

        function isUnitClicked(vm,index){
            vm.token.parentId === undefined ?  vm.token.parentId = "0": '';
            return selectionHandlerService.getSelectedUnitId() === vm.token.parentId && getUnitCursorLocation(vm.token) === index.toString();
        }

        function getUnitCursorLocation(token){
            var parentUnit = DataService.getUnitById(token.parentId);
            return parentUnit.cursorLocation.toString();
        }

        function addOnHover(vm){

            if(HotKeysManager.checkIfHotKeyIsPressed('shift')){
                var selectedTokenList = selectionHandlerService.getSelectedTokenList();
                var lastSelectedToken = selectedTokenList[selectedTokenList.length - 1];
                if(lastSelectedToken !== undefined && lastSelectedToken['indexInParent'] + 1 !== vm.token['indexInParent']){
                    var parentUnit = DataService.getUnitById(vm.token.parentId);
                    if(lastSelectedToken['indexInParent'] < vm.token['indexInParent']){
                        // selectionHandlerService.clearTokenList();
                        for(var i= lastSelectedToken['indexInParent']+1; i<vm.token['indexInParent']+1; i++){
                            if(parentUnit.tokens[i].parentId === undefined){
                                parentUnit.tokens[i]['parentId'] = "0";
                            }
                            if(tokenInSelectionList({token:parentUnit.tokens[i]})){
                                selectionHandlerService.removeTokenFromList(parentUnit.tokens[i].id);
                            }else if(parentUnit.tokens[i].parentId){
                                $rootScope.$broadcast('tokenIsClicked', {
                                    token: parentUnit.tokens[i],
                                    parentId: parentUnit.tokens[i].parentId,
                                    selectAllTokenInUnit: false
                                });
                            }
                        }
                    }else{
                        selectionHandlerService.clearTokenList();
                        for(var k=0,i = lastSelectedToken['indexInParent']; i>vm.token['indexInParent']; i--,k++){
                            if(parentUnit.tokens[i].parentId === undefined){
                                parentUnit.tokens[i]['parentId'] = "0";
                            }
                            if(tokenInSelectionList({token:parentUnit.tokens[i]})){
                                selectionHandlerService.removeTokenFromList(parentUnit.tokens[i].id);
                            }else if(parentUnit.tokens[i].parentId){
                                $rootScope.$broadcast('tokenIsClicked',{
                                    token: parentUnit.tokens[i],
                                    parentId: parentUnit.tokens[i].parentId,
                                    selectAllTokenInUnit: false
                                });
                            }
                        }
                    }

                }
                tokenClicked(vm);
            }
        }

        function initToken(vm,index){
            console.log(index)
        }

        function tokenClicked(vm){
            directive.tokenClicked = !directive.tokenClicked;
            vm.tokenIsClicked = !vm.tokenIsClicked;
            selectionHandlerService.setTokenClicked();

            var tokenInUnit = DataService.getUnitById(vm.token.inUnit);
            if(vm.token.inUnit !== null && tokenInUnit){
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
                var parentUnit = DataService.getUnitById(vm.token.parentId);
                var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inUnit === vm.token.inUnit; });

                tokenGroup.forEach(function(token){
                    $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: token.parentId,selectAllTokenInUnit: true});
                })
            }else{
                $rootScope.$broadcast('tokenIsClicked',{token: vm.token, parentId: vm.parentId, selectAllTokenInUnit: false});
            }
        }

        function tokenUnitIsSelected(vm){
            if(!vm.token.parentId){
                vm.token.parentId = "0";
            }
            return selectionHandlerService.getSelectedUnitId() === vm.token.parentId;
        }

        function tokenInSelectionList(vm){
            var selectionList = selectionHandlerService.selectedTokenList;
            var elementPos = selectionList.map(function(x) {return x.id; }).indexOf(vm.token.id);
            return elementPos > -1;
        }


    }

})();/**
 * Created by Nissan PC on 05/06/2017.
 */

(function() {
    'use strict';

    goToUnitDirective.$inject = ["$rootScope", "DataService", "AnnotationTextService"];
    angular
        .module('zAdmin.annotation.directives')
        .directive('goToUnit',goToUnitDirective);

    function goToUnitDirective($rootScope,DataService,AnnotationTextService) {
        return {
            restrict: 'A',
            scope: true,
            bindToController: true,
            link: function ($scope, elem) {

                $(elem).click(function(){

                    // highlight the unit, and make its parent row focused

                    var unitId = $(this).attr('unit-wrapper-id');
                    var splittedUnitID = unitId.split('-');

                    var parentContainerId = $(event.toElement).attr('parent-index');

                    var parentContainer = $(this.parentElement.parentElement.parentElement).addClass('selected-row');
                    // $('.highlight-unit').removeClass('highlight-unit');
                    // $("[unit-wrapper-id="+unitId+"]").toggleClass('highlight-unit');

                    event.stopPropagation();

                    DataService.unitType == 'REGULAR' ? $rootScope.clickedUnit = unitId : '';

                    focusUnit(parentContainer,$rootScope,DataService);
                })
                $(elem).dblclick(function(){
                    $('.highlight-unit').removeClass('highlight-unit');
                    var childUnitId = $(this).attr('child-unit-id');
                    var parentContainerId = $(event.toElement).attr('parent-index');
                    // $('.selected-row').removeClass('selected-row');

                    var parentContainer = $('#directive-info-data-container-'+childUnitId).addClass('selected-row');
                    // var childUnitId = splittedUnitID.slice(3,splittedUnitID.length).join('-');
                    var annotationUnit = $('#directive-info-data-container-'+childUnitId).parents('.categorized-word')

                    var expandBtn = annotationUnit[1] ? $(annotationUnit[1]).find('.expand-btn') : $(annotationUnit[0]).find('.expand-btn');
                    // annotationUnit.removeClass('hidden');
                    $scope.$apply(function(){
                        DataService.getUnitById(childUnitId).gui_status = 'OPEN';
                        AnnotationTextService.toggleAnnotationUnitView(expandBtn[0]);
                    })

                    event.stopPropagation();

                    focusUnit(parentContainer,$rootScope,DataService);

                    DataService.lastInsertedUnitIndex = $rootScope.clckedLine;
                });
            }
        };
    }

    /**
     * Handle click on row - update the current selected row.
     */
    function focusUnit(element,rootScope,DataService){

        var dataWordId = $(element).attr('data-wordid');
        if(dataWordId == undefined){
            var clickedRowId = [];
            if(element.toElement){
                clickedRowId = $(element.toElement).attr('id').split('-');
            }
            else{
                clickedRowId = $(element).attr('id').split('-');
            }
            rootScope.clckedLine = clickedRowId.slice(4,clickedRowId.length).join('-');
            /*$rootScope.clckedLine = clickedRowId[clickedRowId.length-1];*/
        }else{
            var clickedRowId = $(element.toElement).attr('parent-index').split('-');
            clickedRowId.length == 1 ? rootScope.clckedLine = clickedRowId[0] : rootScope.clckedLine = clickedRowId.slice(1,clickedRowId.length).join('-');
            /*rootScope.clckedLine = clickedRowId[clickedRowId.length-1];*/
        }
        $('.selected-row').removeClass('selected-row').delay(500);
        if(element.toElement){
            $(element.toElement).addClass('selected-row').delay(500);
        }else{
            $(element).addClass('selected-row').delay(500);
        }    

        // $('.selectable-word').removeClass('clickedToken');
        // rootScope.selectedTokensArray = [];    
    }



})();
(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('unitCategory',unitCategoryDirective);

    /** @ngInject */
    function unitCategoryDirective() {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/unitCategory/unitCategory.html',
            scope:{
                color:'=',
                abbreviation:'=',
                categoryId:'='
            },
            link: unitCategoryDirectiveLink,
            replace:false

        };

        return directive;

        function unitCategoryDirectiveLink($scope, elem, attrs) {
        }




    }

})();
(function() {
    'use strict';

    DefinitionsController.$inject = ["$scope", "$rootScope", "DataService", "$timeout", "$compile", "selectionHandlerService"];
    angular
        .module('zAdmin.annotation.directives')
        .directive('utilityButtonsDirective',utilityButtonsDirective);




    function utilityButtonsDirective() {
        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/utility-buttons/restrictions.html',
            scope:{
                definitionDetails: '=',
                definitionId: '='
            },
            link: linkDefinitions,
            controller: DefinitionsController,
            controllerAs: 'defCtrl',
            bindToController: true

        };

        return directive;

        function linkDefinitions($scope, elem, attrs,selectedWords) {
            // $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.color);
        }


    }

    /** @ngInject */
    function DefinitionsController($scope,$rootScope, DataService, $timeout, $compile,selectionHandlerService) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;
        defCtrl.addImplicitUnit = addImplicitUnit;
        defCtrl.unGroupUnit = unGroupUnit;

        function unGroupUnit(){
            var unitId = selectionHandlerService.getSelectedUnitId();
            var parentUnit = DataService.getParentUnitId(unitId);
            if(unitId !== 0){
                DataService.deleteUnit(unitId).then(function(res){
                    selectionHandlerService.updateSelectedUnit(parentUnit);
                });

            }
        }


        function addImplicitUnit(){
            var selectedUnitId = selectionHandlerService.getSelectedUnitId();
            var selectedUnit = DataService.getUnitById(selectedUnitId);

            if(DataService.unitType === 'REGULAR' && selectedUnit.unitType !== "REMOTE" && selectedUnit.unitType !== "IMPLICIT"){
                var objToPush = {
                    rowId : '',
                    text : '<span>IMPLICIT UNIT</span>',
                    numOfAnnotationUnits: 0,
                    categories:[], // {color:defCtrl.definitionDetails.backgroundColor}
                    comment:"",
                    rowShape:'',
                    unitType:'IMPLICIT',
                    orderNumber: '-1',
                    gui_status:'OPEN',
                    usedAsRemote:[],
                    children_tokens:[],
                    containsAllParentUnits: false,
                    tokens:[{
                        "text":"IMPLICIT UNIT",
                        "parentId":selectionHandlerService.getSelectedUnitId(),
                        "inUnit":null
                    }],
                    AnnotationUnits : [

                    ]
                };

                var newRowId = DataService.insertToTree(objToPush,selectionHandlerService.getSelectedUnitId());
                // DataService.getUnitById($rootScope.clckedLine).usedAsRemote.push(newRowId);

                // $timeout(function(){
                //     $scope.$apply();
                //     DataService.unitType = 'REGULAR';
                //     // $('#'+$rootScope.clickedUnit).toggleClass('highlight-unit');
                //     $("[unit-wrapper-id="+$rootScope.clickedUnit+"]").toggleClass('highlight-unit');
                //     $('.annotation-page-container').toggleClass('crosshair-cursor');
                //     $( ".unit-wrapper" ).attr('mousedown','').unbind('mousedown');
                //     $( ".selectable-word" ).attr('mousedown','').unbind('mousedown');
                //     $( ".selectable-word" ).on('mousedown',$rootScope.tokenClicked);
                //     $( ".directive-info-data-container" ).attr('mousedown','').unbind('mousedown');
                //     $( ".directive-info-data-container" ).on('mousedown',$rootScope.focusUnit);
                // },0);
                //
                // console.log(newRowId);
                // $compile($('.text-wrapper'))($rootScope);
            }
        }

        function highLightSelectedWords(color) {

            // $('.clickedToken').css('border','3px solid '+ defCtrl.definitionDetails.color);
            // $('.clickedToken').removeClass('clickedToken');

            $rootScope.currentCategoryID = defCtrl.definitionDetails.id;
            $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
            if($rootScope.selectedTokensArray.length > 0){
                $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine);
                DataService.updateDomWhenInsertFinishes();
                console.log($rootScope.clckedLine);
            }else{
                if(checkIfRowWasClicked($rootScope)){
                    $rootScope.addCategoryToExistingRow();
                }
            }

            $rootScope.lastSelectedWordWithShiftPressed = undefined;
            // $rootScope.clckedLine = '';
        }
    }

    function checkIfRowWasClicked(rootScope){
        return rootScope.clckedLine != undefined && rootScope.clckedLine != '0';
    }

    /**
     * Use the object's 'data-wordid' attribute in order to sorts the array in ascending order.
     * @param a,b - array elements.
     * @returns {number}
     */
    function sortSelectedWordsArrayByWordIndex(a,b){
        var aIndex = parseInt($(a).attr('data-wordid').split('-')[1]);
        var bIndex = parseInt($(b).attr('data-wordid').split('-')[1]);
        if(aIndex < bIndex){
            return -1;
        }
        if(aIndex > bIndex){
            return 1;
        }
        return 0;
    }


})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditCoarseningLayerCtrl.$inject = ["$scope", "$timeout", "$state", "$stateParams", "EditTableStructure", "Core", "editCoarseningLayerService", "storageService"];
    angular.module('zAdmin.pages.edit.layers.coarsening')
        .controller('EditCoarseningLayerCtrl', EditCoarseningLayerCtrl);

    /** @ngInject */
    function EditCoarseningLayerCtrl($scope, $timeout, $state, $stateParams, EditTableStructure, Core,editCoarseningLayerService, storageService) {
        var vm = this;
        vm.back = back;
        vm.upsert = upsert;
        vm.manage = manage;
        vm.edit = edit;
        vm.chooseCategory = chooseCategory;
        vm.manageRestrictions = manageRestrictions;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.getInnerSmartTableStructure = getInnerSmartTableStructure;

        // var layerType = storageService.getFromLocalStorage('layerType');
        //
        // updateTableDataAccordingToLayerType(layerType);

        Core.init(this,EditTableStructure,editCoarseningLayerService);

        vm.smartTableStructure.forEach(function(obj){
            var value = editCoarseningLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            var _parent = editCoarseningLayerService.get('parent');
            var _parentId = angular.isArray(_parent) ? _parent[0].id : _parent.id
            $state.go('edit.layers.coarsening.'+pageRoute,{parentId: _parentId});
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editCoarseningLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                // $state.go("layers")
            })
        }

        function chooseCategory(){
            var _parent = editCoarseningLayerService.get('parent');
            var _parentId = angular.isArray(_parent) ? _parent[0].id : _parent.id
            $state.go('edit.layers.coarsening.categories.manage',{parentId: _parentId});
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editCoarseningLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editCoarseningLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.restrictions');
        }

        function getInnerSmartTableStructure(key){
            return editCoarseningLayerService.getInnerSmartTableStructure(key);
        }

        function toggleItem(){

        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editCoarseningLayerService.$inject = ["apiService", "Core", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.coarsening')
        .service('editCoarseningLayerService', editCoarseningLayerService);

    /** @ngInject */
    function editCoarseningLayerService(apiService, Core, ENV_CONST) {
        /*apiService.sources.getSourceTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.coarsening.getEditLayerTableStructure().then(function (res){return res.data});
            },
            getLayerData: function(id){
                var _service = this;
                return apiService.edit.layers.coarsening.getLayerData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveLayerDetails: function(smartTableStructure){
                var structure = prepareLayerCategoriesForSend(smartTableStructure);
                var bodyData = Core.extractDataFromStructure(structure);
                service.clearData();
                return !bodyData.id ? apiService.edit.layers.coarsening.postLayerData(bodyData).then(function (res){return res.data}) :  apiService.edit.layers.coarsening.putLayerData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                var categories = prepareCoarsningCategories(data.categories);
                if(categories.length){
                    data.categories = categories;
                }
                service.Data = data;
            },
            get:function(key){
                return this.Data[key];
            },
            getInnerSmartTableStructure: function(key){
                return this.Data[key].tableStructure;
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;
                    
                }else{                    
                    this.Data[key][0] = obj;
                }
            },
            initStructureForCoarseningLayer: function(){
                var _service = this;
                return apiService.edit.layers.getCoarseningLayerTableStructure().then(function (res){
                    return res.data
                });
            },
            initDataForCoarseningLayer: function(){
                var _service = this;
                var initialData = _service.Data;
                _service.clearData();
                _service.Data.type = ENV_CONST.LAYER_TYPE.COARSENING;
                _service.Data.parent = initialData;
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    "name": "",
                    "description": "",
                    "id": "",
                    "parent": false,
                    "children": [],
                    "type": ENV_CONST.LAYER_TYPE.COARSENING,
                    "tooltip": "",
                    "projects": [  ],
                    "categories": [],
                    "restrictions": [],
                    "created_by": {
                        "first_name":"",
                        "last_name":"",
                        "name":""
                    },
                    "is_active": true,
                    "created_at": "",
                    "updated_at": ""
                };
            }
        };
        return service;
    }

    /*
    * transform the categories array to group by childCategory
    */
    function prepareCoarsningCategories(categories){
        if(!categories){
            return categories;
        }else{
            var response = [];
            var childCategories = {};
            var pairs = {};

            categories.forEach(function(cat){
                childCategories[cat.id] = cat;
            });

            Object.keys(childCategories).forEach(function(parentId){
                pairs[parentId] = {
                    'parent_category': [],
                    'category': [childCategories[parentId]]
                }
            });

            categories.forEach(function(cat){
                if(cat.parent){
                    pairs[cat.id].parent_category.push(cat.parent)
                }
            });
            
            Object.keys(pairs).forEach(function(parentId){
                response.push(pairs[parentId])
            });
            
            return response;
        }
    }

    function prepareLayerCategoriesForSend(smartTableStructure){
        var structure = angular.copy(smartTableStructure, structure)
        structure.forEach(function(rowObj){
            if(rowObj.key == 'categories'){
                console.log(rowObj);
                var parsedCategories = [];
                rowObj.value.forEach(function(valueObj){
                    valueObj.parent_category.forEach(function(parentCategoryObj){
                        var category = {
                            id: valueObj.category[0].id,
                            name: valueObj.category[0].name,
                            parent: {
                                id: parentCategoryObj.id,
                                name: parentCategoryObj.name
                            }
                        }
                        parsedCategories.push(category)
                    })
                })
                rowObj.value = parsedCategories;
            }
        });
        return structure;
    }


})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editRefinementLayerService.$inject = ["apiService", "Core", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.refinement')
        .service('editRefinementLayerService', editRefinementLayerService);

    /** @ngInject */
    function editRefinementLayerService(apiService, Core, ENV_CONST) {
        /*apiService.sources.getSourceTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.refinement.getEditLayerTableStructure().then(function (res){return res.data});
            },
            getLayerData: function(id){
                var _service = this;
                return apiService.edit.layers.refinement.getLayerData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveLayerDetails: function(smartTableStructure){
                var structure = prepareLayerCategoriesForSend(smartTableStructure);
                var bodyData = Core.extractDataFromStructure(structure);
                service.clearData();
                return !bodyData.id ? apiService.edit.layers.refinement.postLayerData(bodyData).then(function (res){return res.data}) :  apiService.edit.layers.refinement.putLayerData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                var categories = prepareRefinementCategories(data.categories);
                if(categories.length){
                    data.categories = categories;
                }
                service.Data = data;
            },
            get:function(key){
                return this.Data[key];
            },
            getInnerSmartTableStructure: function(key){
                return this.Data[key].tableStructure;
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;
                    
                }else{                    
                    this.Data[key][0] = obj;
                }
            },
            initDataForRefinementLayer: function(){
                var _service = this;
                var initialData = _service.Data;
                _service.clearData();
                _service.Data.type = ENV_CONST.LAYER_TYPE.REFINEMENT;
                _service.Data.restrictions = [];
                _service.Data.parent = initialData;
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    "name": "",
                    "description": "",
                    "id": "",
                    "parent": false,
                    "children": [],
                    "type": ENV_CONST.LAYER_TYPE.REFINEMENT,
                    "tooltip": "",
                    "projects": [  ],
                    "categories": [],
                    "restrictions": [],
                    "created_by": {
                        "first_name":"",
                        "last_name":"",
                        "name":""
                    },
                    "is_active": true,
                    "created_at": "",
                    "updated_at": ""
                };
            }
        };
        return service;
    }
    
    /*
    * transform the categories array to group by parentCategory
    */
    function prepareRefinementCategories(categories){
        if(!categories){
            return categories;
        }else{
            var response = [];
            var parentCategories = {};
            var pairs = {};

            categories.forEach(function(cat){
                if(cat.parent){
                    parentCategories[cat.parent.id] = cat.parent;
                }
            });

            Object.keys(parentCategories).forEach(function(parentId){
                pairs[parentId] = {
                    'parent_category': [parentCategories[parentId]],
                    'category': []
                }
            });

            categories.forEach(function(cat){
                if(cat.parent){
                    pairs[cat.parent.id].category.push(cat)
                }
            });
            
            Object.keys(pairs).forEach(function(parentId){
                response.push(pairs[parentId])
            });
            
            return response;
        }
    }

    function prepareLayerCategoriesForSend(smartTableStructure){
        var structure = angular.copy(smartTableStructure, structure)
        structure.forEach(function(rowObj){
            if(rowObj.key == 'categories'){
                console.log(rowObj);
                var parsedCategories = [];
                rowObj.value.forEach(function(valueObj){
                    valueObj.category.forEach(function(categoryObj){
                        var category = {
                            id: categoryObj.id,
                            name: categoryObj.name,
                            parent: {
                                id: valueObj.parent_category[0].id,
                                name: valueObj.parent_category[0].name
                            }
                        }
                        parsedCategories.push(category)
                    })
                })
                rowObj.value = parsedCategories;
            }
        });
        return structure;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditRefinementLayerCtrl.$inject = ["$scope", "$timeout", "$state", "$stateParams", "EditTableStructure", "Core", "editRefinementLayerService", "storageService"];
    angular.module('zAdmin.pages.edit.layers.refinement')
        .controller('EditRefinementLayerCtrl', EditRefinementLayerCtrl);

    /** @ngInject */
    function EditRefinementLayerCtrl($scope, $timeout, $state, $stateParams, EditTableStructure, Core,editRefinementLayerService, storageService) {
        var vm = this;
        vm.back = back;
        vm.upsert = upsert;
        vm.manage = manage;
        vm.edit = edit;
        vm.chooseCategory = chooseCategory;
        vm.manageRestrictions = manageRestrictions;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.getInnerSmartTableStructure = getInnerSmartTableStructure;

        // var layerType = storageService.getFromLocalStorage('layerType');
        //
        // updateTableDataAccordingToLayerType(layerType);

        Core.init(this,EditTableStructure,editRefinementLayerService);

        vm.smartTableStructure.forEach(function(obj){
            var value = editRefinementLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            var _parent = editRefinementLayerService.get('parent');
            var _parentId = angular.isArray(_parent) ? _parent[0].id : _parent.id
            $state.go('edit.layers.refinement.'+pageRoute,{parentId: _parentId});
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.refinement.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.refinement.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editRefinementLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                // $state.go("layers")
            })
        }

        function chooseCategory(){
            var _parent = editRefinementLayerService.get('parent');
            var _parentId = angular.isArray(_parent) ? _parent[0].id : _parent.id
            $state.go('edit.layers.refinement.categories.manage',{parentId: _parentId});
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editRefinementLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editRefinementLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.refinement.restrictions');
        }

        function getInnerSmartTableStructure(key){
            return editRefinementLayerService.getInnerSmartTableStructure(key);
        }

        function toggleItem(){

        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editExtensionLayerService.$inject = ["apiService", "Core", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.extension')
        .service('editExtensionLayerService', editExtensionLayerService);

    /** @ngInject */
    function editExtensionLayerService(apiService, Core, ENV_CONST) {
        /*apiService.sources.getSourceTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.extension.getEditLayerTableStructure().then(function (res){return res.data});
            },
            getLayerData: function(id){
                var _service = this;
                return apiService.edit.layers.extension.getLayerData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveLayerDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                service.clearData();
                return !bodyData.id ? apiService.edit.layers.extension.postLayerData(bodyData).then(function (res){return res.data}) :  apiService.edit.layers.extension.putLayerData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                return this.Data[key];
            },
            getInnerSmartTableStructure: function(key){
                return this.Data[key].tableStructure;
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;
                    
                }else{                    
                    this.Data[key][0] = obj;
                }
            },
            initStructureForCoarseningLayer: function(){
                var _service = this;
                return apiService.edit.layers.extension.getCoarseningLayerTableStructure().then(function (res){
                    return res.data
                });
            },
            initDataForExtensionLayer: function(){
                var parentLayer = service.Data;
                service.clearData();
                service.Data.parent = [parentLayer];
            },
            initDataForCoarseningLayer: function(){

            },
            initDataForRefinementLayer: function(){

            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    "name": "",
                    "description": "",
                    "id": "",
                    "parent": false,
                    "children": [],
                    "type": ENV_CONST.LAYER_TYPE.EXTENSION,
                    "tooltip": "",
                    "projects": [  ],
                    "categories": [],
                    "restrictions": [],
                    "created_by": {
                        "first_name":"",
                        "last_name":"",
                        "name":""
                    },
                    "is_active": true,
                    "created_at": "",
                    "updated_at": ""
                };
            }
        };
        return service;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditExtensionLayersCtrl.$inject = ["$scope", "$timeout", "$state", "EditTableStructure", "Core", "editExtensionLayerService", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.extension')
        .controller('EditExtensionLayersCtrl', EditExtensionLayersCtrl);

    /** @ngInject */
    function EditExtensionLayersCtrl($scope, $timeout, $state, EditTableStructure, Core,editExtensionLayerService,ENV_CONST) {
        var vm = this;
        vm.back = back;
        vm.upsert = upsert;
        vm.manage = manage;
        vm.edit = edit;
        vm.chooseCategory = chooseCategory;
        vm.manageRestrictions = manageRestrictions;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.getInnerSmartTableStructure = getInnerSmartTableStructure;

        // var layerType = storageService.getFromLocalStorage('layerType');
        //
        // updateTableDataAccordingToLayerType(layerType);

        Core.init(this,EditTableStructure,editExtensionLayerService);

        vm.smartTableStructure.forEach(function(obj){
            var value = editExtensionLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            $state.go('edit.layers.extension.'+pageRoute,{chosenItem : null, itemRowIndex: null});
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.extension.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.extension.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editExtensionLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                // $state.go("layers")
            })
        }

        function chooseCategory(){
            console.log("chooseCategory");
            $state.go('edit.layers.extension.categories.manage');
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editExtensionLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editExtensionLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.extension.restrictions',{chosenItem : null, itemRowIndex: null});
        }

        function getInnerSmartTableStructure(key){
            return editExtensionLayerService.getInnerSmartTableStructure(key);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editRootLayerService.$inject = ["apiService", "Core", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.root')
        .service('editRootLayerService', editRootLayerService);

    /** @ngInject */
    function editRootLayerService(apiService, Core, ENV_CONST) {
        /*apiService.sources.getSourceTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.root.getEditLayerTableStructure().then(function (res){return res.data});
            },
            getLayerData: function(id){
                var _service = this;
                return apiService.edit.layers.root.getLayerData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveLayerDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                service.clearData();
                return !bodyData.id ? apiService.edit.layers.root.postLayerData(bodyData).then(function (res){return res.data}) :  apiService.edit.layers.root.putLayerData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                return this.Data[key];
            },
            getInnerSmartTableStructure: function(key){
                return this.Data[key].tableStructure;
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;
                    
                }else{                    
                    this.Data[key][0] = obj;
                }
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    "name": "",
                    "description": "",
                    "id": "",
                    "parent": false,
                    "children": [],
                    "type": ENV_CONST.LAYER_TYPE.ROOT,
                    "tooltip": "",
                    "projects": [  ],
                    "categories": [],
                    "restrictions": [],
                    "created_by": {
                        "first_name":"",
                        "last_name":"",
                        "name":""
                    },
                    "is_active": true,
                    "created_at": "",
                    "updated_at": ""
                };
            }
        };
        return service;
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditRootLayerCtrl.$inject = ["$scope", "$timeout", "$state", "EditTableStructure", "Core", "editRootLayerService", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.root')
        .controller('EditRootLayerCtrl', EditRootLayerCtrl);

    /** @ngInject */
    function EditRootLayerCtrl($scope, $timeout, $state, EditTableStructure, Core,editRootLayerService,ENV_CONST) {
        var vm = this;
        vm.back = back;
        vm.upsert = upsert;
        vm.manage = manage;
        vm.edit = edit;
        vm.chooseCategory = chooseCategory;
        vm.manageRestrictions = manageRestrictions;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.getInnerSmartTableStructure = getInnerSmartTableStructure;

        // var layerType = storageService.getFromLocalStorage('layerType');
        //
        // updateTableDataAccordingToLayerType(layerType);

        Core.init(this,EditTableStructure,editRootLayerService);

        vm.smartTableStructure.forEach(function(obj){
            var value = editRootLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            $state.go('edit.layers.root.'+pageRoute,{chosenItem : null, itemRowIndex: null});
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.root.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.root.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editRootLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                console.log('err',err);
            })
        }

        function chooseCategory(){
            console.log("chooseCategory");
            $state.go('edit.layers.root.categories.manage');
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editRootLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editRootLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.root.restrictions',{chosenItem : null, itemRowIndex: null});
        }

        function getInnerSmartTableStructure(key){
            return editRootLayerService.getInnerSmartTableStructure(key);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editPassageProjectsService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.passages.projects')
        .service('editPassageProjectsService', editPassageProjectsService);

    /** @ngInject */
    function editPassageProjectsService(apiService) {

        var service = {
            tableData:[],
            getTasksTableStructure: function(){
                return apiService.edit.passages.projects.getTasksTableStructure().then(function (res){return res.data});
            },
            getTableData: function(passageID){
                return apiService.edit.passages.projects.getTasksTableData(passageID).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return  service.tableData;
                });
            }
        }
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditPassagesProjectsCtrl.$inject = ["$scope", "$state", "Core", "TableData", "TableStructure"];
    angular.module('zAdmin.pages.edit.passages.projects')
        .controller('EditPassagesProjectsCtrl', EditPassagesProjectsCtrl);

    /** @ngInject */
    function EditPassagesProjectsCtrl($scope, $state, Core, TableData, TableStructure) {
        var vm = this;
        vm.back= back;

        vm.smartTableData = TableData;
        Core.init(this,TableStructure);

        function back(){
            $state.go('edit.passages');
        }

    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editPassageSourcesService.$inject = ["apiService"];
  angular.module('zAdmin.pages.edit.passages.sources')
      .service('editPassageSourcesService', editPassageSourcesService);

  /** @ngInject */
  function editPassageSourcesService(apiService) {
    // apiService.edit.passages.sources.getSourceTableData().then(function (res){
    //   angular.copy(res.data.results, service.tableData);
    // });
    var service = {
        tableData:[],
        getEditTableStructure: function(){
          return apiService.edit.passages.sources.getEditSourceTableStructure().then(function (res){return res.data});
        },
        getTableData: function(searchTerms){
          return /*!!!searchTerms ? service.tableData : */apiService.edit.passages.sources.getSourceTableData(searchTerms).then(function (res){
            angular.copy(res.data.results, service.tableData);
            return service.tableData;
          });
        }
        
    }
    return service;
  }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditPassagesSourcesCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "editPassagesService", "editPassageSourcesService", "Core", "TableData"];
  angular.module('zAdmin.pages.edit.passages.sources')
      .controller('EditPassagesSourcesCtrl', EditPassagesSourcesCtrl);

  /** @ngInject */
  function EditPassagesSourcesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editPassagesService, editPassageSourcesService, Core, TableData) {
  	var vm = this;
    vm.edit = edit;
    vm.editRow = editRow;
    vm.chooseRow = chooseRow;
    vm.newSource = newSource;
    
    var parentCtrl = $scope.$parent.vm;
    
    vm.smartTableData = TableData;
    Core.init(this,EditTableStructure,editPassageSourcesService);

    function newSource (obj,index){
      console.log("editRow",obj);
      $state.go('edit.passages.sources.create',{from:'passages'})
      // $state.go('edit.passages.texts',{})
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.sources')
    }

    function chooseRow(obj,index){
      console.log("chooseRow "+index,obj);
      var sourceDetails = {
        "id":obj.id,
        "name":obj.name
      }
      editPassagesService.set("source",sourceDetails);
      parentCtrl.refreshData("source");
    }

  	function edit(obj){
  	  console.log("edit",obj);
  	}
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editPassageTasksService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.passages.tasks')
        .service('editPassageTasksService', editPassageTasksService);

    /** @ngInject */
    function editPassageTasksService(apiService) {

        var service = {
            tableData:[],
            getTasksTableStructure: function(){
                return apiService.edit.passages.tasks.getTasksTableStructure().then(function (res){return res.data});
            },
            getTableData: function(passageID){
                return apiService.edit.passages.tasks.getTasksTableData(passageID).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return  service.tableData;
                });
            }
        }
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditPassagesTasksCtrl.$inject = ["$scope", "$state", "Core", "TableData", "TableStructure"];
    angular.module('zAdmin.pages.edit.passages.texts')
        .controller('EditPassagesTasksCtrl', EditPassagesTasksCtrl);

    /** @ngInject */
    function EditPassagesTasksCtrl($scope, $state, Core, TableData, TableStructure) {
        var vm = this;
        vm.back= back;

        vm.smartTableData = TableData;
        Core.init(this,TableStructure);

        function back(){
            $state.go('edit.passages');
        }

    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  editPassagesTextService.$inject = ["apiService"];
  angular.module('zAdmin.pages.edit.passages.texts')
      .service('editPassagesTextService', editPassagesTextService);

  /** @ngInject */
  function editPassagesTextService(apiService) {
    /*apiService.passages.getPassageTableData().then(function (res){
      service.tableData = res.data
    });*/
    var service = {
        tableData:[]
    }
    return service;
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  EditPassagesTextsCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "editPassagesTextService", "Core", "editPassagesService"];
  angular.module('zAdmin.pages.edit.passages.texts')
      .controller('EditPassagesTextsCtrl', EditPassagesTextsCtrl);

  /** @ngInject */
  function EditPassagesTextsCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editPassagesTextService, Core, editPassagesService) {
  	var vm = this;
    vm.edit = edit;
    vm.readTextFromFile = readTextFromFile;

    var parentCtrl = $scope.$parent.vm;

    function edit(obj){
  	  console.log("edit",obj);
      vm.textFrom == 'Input' ? editPassagesService.set("text",vm.text) : editPassagesService.set("text",vm.textFromFile);
      parentCtrl.refreshData("text");
  	}

    function readTextFromFile(event){
      var input = event;

      var reader = new FileReader();
      reader.onload = function(){
        vm.textFromFile = reader.result;
      };
      reader.readAsText(input.files[0]);
    }
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editProjectLayerService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.projects.layers')
        .service('editProjectLayerService', editProjectLayerService);

    /** @ngInject */
    function editProjectLayerService(apiService) {

        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.projects.layer.getSelectTableStructure().then(function (res){return res.data});
            },
            getTableData: function(){
                return apiService.edit.projects.layer.getLayersTableData().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            },
            getLayersTableData: function(){
                var _service = this;
                return apiService.edit.projects.layer.getLayersTableData().then(function (res){
                    angular.copy(res.data.results, _service.tableData);
                    return _service.tableData;
                });
            }
        }
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditProjectsLayersCtrl.$inject = ["$scope", "$rootScope", "$filter", "$state", "editableOptions", "editableThemes", "$uibModal", "EditTableStructure", "editProjectsService", "editProjectLayerService", "Core", "LayersTableData"];
    angular.module('zAdmin.pages.edit.projects.layers')
        .controller('EditProjectsLayersCtrl', EditProjectsLayersCtrl);

    /** @ngInject */
    function EditProjectsLayersCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editProjectsService, editProjectLayerService, Core, LayersTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = LayersTableData;

        Core.init(this,EditTableStructure,editProjectLayerService);



        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.projects.layers.create',{})
            // $state.go('edit.projects.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers',{id:obj.id})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var layerDetails = {
                "id":obj.id,
                "name":obj.name,
                "type":obj.type
            }
            var replaceInArray = true;
            editProjectsService.set("layer",obj,replaceInArray);
            parentCtrl.refreshData("layer");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editAnnotationTasksService.$inject = ["apiService", "Core", "ENV_CONST", "$state"];
    angular.module('zAdmin.pages.edit.tasks.annotation')
        .service('editAnnotationTasksService', editAnnotationTasksService);

    /** @ngInject */
    function editAnnotationTasksService(apiService, Core, ENV_CONST, $state) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.annotation.getAnnotationTaskEditTableStructure().then(function (res){return res.data});
            },
            getTaskData: function(id){
                var _service = this;
                return apiService.edit.tasks.getTaskData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            getTasksTableData: function(){
                return apiService.tasks.getTasksTableData().then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            saveTaskDetails: function(smartTableStructure){
                var structure = prepareTaskForSend(smartTableStructure,$state.params.projectId);
                var bodyData = Core.extractDataFromStructure(structure);
                bodyData.passage = bodyData.passage[0];
                bodyData.user = bodyData.user[0];
                bodyData.type = ENV_CONST.TASK_TYPE.ANNOTATION;
                bodyData.parent = {id: !!bodyData.parent.length ? bodyData.parent : $state.params.parentTaskId};
                service.clearData();
                return !bodyData.id ? apiService.edit.tasks.postTaskData(bodyData).then(function (res){return res.data}) :  apiService.edit.tasks.putTaskData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key])){
                    if(key=='status'){
                        return {id: ENV_CONST.TASK_STATUS_ID[this.Data[key]],label:this.Data[key]}
                    }
                    if(typeof this.Data[key] == "string" || typeof this.Data[key] == "boolean" || typeof this.Data[key] == "number"){
                        return this.Data[key];
                    }
                    return [this.Data[key]]
                }
                return this.Data[key];
            },
            set:function(key,obj,shouldReplace){
                if(angular.isArray(this.Data[key])){
                    shouldReplace ? this.Data[key][0] = obj : this.Data[key].push(obj);
                    
                }else{
                    this.Data[key] = obj;
                }
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    manager_comment:"",
                    status:"",
                    passage: [],
                    parent:[],
                    user:[],
                    is_active:true,
                    is_demo:false
                };
            }
        }
        return service;
    }

    function prepareTaskForSend(smartTableStructure,projectId){
        var structure = angular.copy(smartTableStructure, structure)
        structure.forEach(function(obj){
            if(obj.key == 'status'){
                obj.value = obj.value.label; // the api call expect the 'status' to be string
            }
            if(obj.key == 'project'){
                obj.value = {
                    id:projectId
                }
            }
        })
        return structure
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditAnnotationTasksCtrl.$inject = ["$scope", "$state", "$timeout", "EditTableStructure", "Core", "editAnnotationTasksService"];
    angular.module('zAdmin.pages.edit.tasks.annotation')
        .controller('EditAnnotationTasksCtrl', EditAnnotationTasksCtrl);

    /** @ngInject */
    function EditAnnotationTasksCtrl($scope,$state, $timeout, EditTableStructure, Core,editAnnotationTasksService) {
        var vm = this;
        vm.upsert = upsert;
        vm.back = back;
        vm.choosePassage = choosePassage;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.chooseAnnotator = chooseAnnotator;
        vm.manage = manage;

        Core.init(this,EditTableStructure,editAnnotationTasksService);

        vm.smartTableStructure.forEach(function(obj){
            if(obj.dontBindToService != true){
                obj.value = editAnnotationTasksService.get(obj.key);
            }
        });

        function upsert(obj){
            console.log("edit",obj);
            editAnnotationTasksService.saveTaskDetails(obj).then(function(response){
                $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            },function(err){
                // $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            })
        }

        function back(){
            var projectId = $state.params.projectId;
            $state.go('projectTasks',{id:projectId,layerType:$state.params.projectLayerType});
        }

        function manage (pageRoute){
            $state.go('edit.tasks.annotation.'+pageRoute+'.manage');
        }

        function choosePassage(){
            $state.go('edit.tasks.annotation.passages.manage');
        }

        function chooseAnnotator(){
            $state.go('edit.tasks.annotation.annotator.manage');
        }

        function deleteItemInData(key,index){
            editAnnotationTasksService.deleteItemInData(key,index);
        }


        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editAnnotationTasksService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editTaskPassagesService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.tasks.passages')
        .service('editTaskPassagesService', editTaskPassagesService);

    /** @ngInject */
    function editTaskPassagesService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.passages.getPassagesTableStructure().then(function (res){return res.data});
            },
            getTableData: function(){
                return service.Data;
            },
            getPassagesTableData: function(id){
                apiService.passages.getPassagesTableData(id).then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            }
        }
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditTaskPassagesCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editTaskPassagesService", "editTasksService", "Core"];
    angular.module('zAdmin.pages.edit.tasks.passages')
        .controller('EditTaskPassagesCtrl', EditTaskPassagesCtrl);

    /** @ngInject */
    function EditTaskPassagesCtrl($scope,$state, EditTableStructure, editTaskPassagesService, editTasksService, Core) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = editTaskPassagesService.getTableData();
        Core.init(this,EditTableStructure,editTaskPassagesService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTaskPassagesService.get(obj.key);
        });

        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.passages.sources.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.tasks.passages.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var sourceDetails = {
                "id":obj.id,
                "name":obj.name
            }
            editTasksService.set("passages",sourceDetails);
            parentCtrl.refreshData("passages");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editTokenizationTasksService.$inject = ["apiService", "Core", "ENV_CONST", "$state"];
    angular.module('zAdmin.pages.edit.tasks.tokenization')
        .service('editTokenizationTasksService', editTokenizationTasksService);

    /** @ngInject */
    function editTokenizationTasksService(apiService, Core, ENV_CONST, $state) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.tokenization.getTokenizationTaskEditTableStructure().then(function (res){return res.data});
            },
            getTaskData: function(id){
                var _service = this;
                return apiService.edit.tasks.getTaskData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            getTasksTableData: function(){
                return apiService.tasks.getTasksTableData().then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            saveTaskDetails: function(smartTableStructure){
                var structure = prepareTaskForSend(smartTableStructure,$state.params.projectId);
                var bodyData = Core.extractDataFromStructure(structure);
                bodyData.passage = bodyData.passage[0];
                bodyData.user = bodyData.user[0];
                bodyData.type = ENV_CONST.TASK_TYPE.TOKENIZATION;
                service.clearData();
                return !bodyData.id ? apiService.edit.tasks.postTaskData(bodyData).then(function (res){return res.data}) :  apiService.edit.tasks.putTaskData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key])){
                    if(key=='status'){
                        return {id: ENV_CONST.TASK_STATUS_ID[this.Data[key]],label:this.Data[key]}
                    }
                    if(typeof this.Data[key] == "string" || typeof this.Data[key] == "boolean" || typeof this.Data[key] == "number"){
                        return this.Data[key];
                    }
                    return [this.Data[key]]
                }
                return this.Data[key];
            },
            set:function(key,obj,shouldReplace){
                if(angular.isArray(this.Data[key])){
                    shouldReplace ? this.Data[key][0] = obj : this.Data[key].push(obj);
                    
                }else{
                    this.Data[key] = obj;
                }
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    manager_comment:"",
                    status:"",
                    passage: [],
                    parent:[],
                    user:[],
                    is_active:true,
                    is_demo:false
                };
            }
        }
        return service;
    }

    function prepareTaskForSend(smartTableStructure,projectId){
        var structure = angular.copy(smartTableStructure, structure)
        structure.forEach(function(obj){
            if(obj.key == 'status'){
                obj.value = obj.value.label; // the api call expect the 'status' to be string
            }
            if(obj.key == 'project'){
                obj.value = {
                    id:projectId
                }
            }
        })
        return structure
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditTokenizationTasksCtrl.$inject = ["$scope", "$state", "$timeout", "EditTableStructure", "Core", "editTokenizationTasksService"];
    angular.module('zAdmin.pages.edit.tasks.tokenization')
        .controller('EditTokenizationTasksCtrl', EditTokenizationTasksCtrl);

    /** @ngInject */
    function EditTokenizationTasksCtrl($scope,$state, $timeout, EditTableStructure, Core,editTokenizationTasksService) {
        var vm = this;
        vm.upsert = upsert;
        vm.back = back;
        vm.choosePassage = choosePassage;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.chooseAnnotator = chooseAnnotator;
        vm.manage = manage;

        Core.init(this,EditTableStructure,editTokenizationTasksService);

        vm.smartTableStructure.forEach(function(obj){
            if(obj.dontBindToService != true){
                obj.value = editTokenizationTasksService.get(obj.key);
            }
        });

        function upsert(obj){
            console.log("edit",obj);
            editTokenizationTasksService.saveTaskDetails(obj).then(function(response){
                $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            },function(err){
                // $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            })
        }

        function back(){
            var projectId = $state.params.projectId;
            $state.go('projectTasks',{id:projectId,layerType:$state.params.projectLayerType});
        }

        function manage (pageRoute){
            $state.go('edit.tasks.tokenization.'+pageRoute+'.manage');
        }

        function choosePassage(){
            $state.go('edit.tasks.tokenization.passages.manage');
        }

        function chooseAnnotator(){
            $state.go('edit.tasks.tokenization.annotator.manage');
        }

        function deleteItemInData(key,index){
            editTokenizationTasksService.deleteItemInData(key,index);
        }


        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editTokenizationTasksService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editReviewTasksService.$inject = ["apiService", "Core", "ENV_CONST", "$state"];
    angular.module('zAdmin.pages.edit.tasks.review')
        .service('editReviewTasksService', editReviewTasksService);

    /** @ngInject */
    function editReviewTasksService(apiService, Core, ENV_CONST, $state) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.review.getReviewTaskEditTableStructure().then(function (res){return res.data});
            },
            getTaskData: function(id){
                var _service = this;
                return apiService.edit.tasks.getTaskData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            getTasksTableData: function(){
                return apiService.tasks.getTasksTableData().then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            saveTaskDetails: function(smartTableStructure){
                var structure = prepareTaskForSend(smartTableStructure,$state.params.projectId);
                var bodyData = Core.extractDataFromStructure(structure);
                bodyData.passage = bodyData.passage[0];
                bodyData.user = bodyData.user[0];
                bodyData.type = ENV_CONST.TASK_TYPE.REVIEW;
                bodyData.parent = {id:$state.params.parentTaskId};
                service.clearData();
                return !bodyData.id ? apiService.edit.tasks.postTaskData(bodyData).then(function (res){return res.data}) :  apiService.edit.tasks.putTaskData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key])){
                    if(key=='status'){
                        return {id: ENV_CONST.TASK_STATUS_ID[this.Data[key]],label:this.Data[key]}
                    }
                    if(typeof this.Data[key] == "string" || typeof this.Data[key] == "boolean" || typeof this.Data[key] == "number"){
                        return this.Data[key];
                    }
                    return [this.Data[key]]
                }
                return this.Data[key];
            },
            set:function(key,obj,shouldReplace){
                if(angular.isArray(this.Data[key])){
                    shouldReplace ? this.Data[key][0] = obj : this.Data[key].push(obj);
                    
                }else{
                    this.Data[key] = obj;
                }
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    manager_comment:"",
                    status:"",
                    passage: [],
                    parent:[],
                    user:[],
                    is_active:true,
                    is_demo:false
                };
            }
        }
        return service;
    }

    function prepareTaskForSend(smartTableStructure,projectId){
        var structure = angular.copy(smartTableStructure, structure)
        structure.forEach(function(obj){
            if(obj.key == 'status'){
                obj.value = obj.value.label; // the api call expect the 'status' to be string
            }
            if(obj.key == 'project'){
                obj.value = {
                    id:projectId
                }
            }
        })
        return structure
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditReviewTasksCtrl.$inject = ["$scope", "$state", "$timeout", "EditTableStructure", "Core", "editReviewTasksService"];
    angular.module('zAdmin.pages.edit.tasks.review')
        .controller('EditReviewTasksCtrl', EditReviewTasksCtrl);

    /** @ngInject */
    function EditReviewTasksCtrl($scope,$state, $timeout, EditTableStructure, Core,editReviewTasksService) {
        var vm = this;
        vm.upsert = upsert;
        vm.back = back;
        vm.choosePassage = choosePassage;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.chooseAnnotator = chooseAnnotator;
        vm.manage = manage;

        Core.init(this,EditTableStructure,editReviewTasksService);

        vm.smartTableStructure.forEach(function(obj){
            if(obj.dontBindToService != true){
                obj.value = editReviewTasksService.get(obj.key);
            }
        });

        function upsert(obj){
            console.log("edit",obj);
            editReviewTasksService.saveTaskDetails(obj).then(function(response){
                $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            },function(err){
                // $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            })
        }

        function back(){
            var projectId = $state.params.projectId;
            $state.go('projectTasks',{id:projectId,layerType:$state.params.projectLayerType});
        }

        function manage (pageRoute){
            $state.go('edit.tasks.review.'+pageRoute+'.manage');
        }

        function choosePassage(){
            $state.go('edit.tasks.review.passages.manage');
        }

        function chooseAnnotator(){
            $state.go('edit.tasks.review.annotator.manage');
        }

        function deleteItemInData(key,index){
            editReviewTasksService.deleteItemInData(key,index);
        }


        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editReviewTasksService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  NotificationsCtrl.$inject = ["$scope", "toastr"];
  angular.module('zAdmin.pages.ui.modals')
      .controller('NotificationsCtrl', NotificationsCtrl);

  /** @ngInject */
  function NotificationsCtrl($scope, toastr) {
    $scope.showSuccessMsg = function() {
      toastr.success('Your information has been saved successfully!');
    };

    $scope.showInfoMsg = function() {
      toastr.info("You've got a new email!", 'Information');
    };

    $scope.showErrorMsg = function() {
      toastr.error("Your information hasn't been saved!", 'Error');
    };

    $scope.showWarningMsg = function() {
      toastr.warning('Your computer is about to explode!', 'Warning');
    };
  }

})();

/* Minified js for jQuery BackTop */
!function(o){o.fn.backTop=function(e){var n=this,i=o.extend({position:400,speed:500,color:"white"},e),t=i.position,c=i.speed,d=i.color;n.addClass("white"==d?"white":"red"==d?"red":"green"==d?"green":"black"),n.css({right:40,bottom:40,position:"fixed"}),o(document).scroll(function(){var e=o(window).scrollTop();e>=t?n.fadeIn(c):n.fadeOut(c)}),n.click(function(){o("html, body").animate({scrollTop:0},{duration:1200})})}}(jQuery);

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  fieldDirective.$inject = ["$timeout"];
  angular.module('zAdmin.pages.form')
      .directive('field', fieldDirective);

  /** @ngInject */
  function fieldDirective($timeout) {
    return {
      restrict: 'E',
      replace: true,
      remove:true,
      transclude: true,
      templateUrl:'app/pages/form/inputs/widgets/field/field.html',
      link: function(scope,element,attr){

      }
    };
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.form')
      .controller('SelectpickerPanelCtrl', SelectpickerPanelCtrl);

  /** @ngInject */
  function SelectpickerPanelCtrl() {
    var vm = this;

    vm.standardSelectItems = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
      { label: 'Option 3', value: 3 },
      { label: 'Option 4', value: 4 },
    ];

    vm.selectWithSearchItems = [
      { label: 'Hot Dog, Fries and a Soda', value: 1 },
      { label: 'Burger, Shake and a Smile', value: 2 },
      { label: 'Sugar, Spice and all things nice', value: 3 },
      { label: 'Baby Back Ribs', value: 4 },
    ];

    vm.groupedSelectItems = [
      { label: 'Group 1 - Option 1', value: 1, group: 'Group 1' },
      { label: 'Group 2 - Option 2', value: 2, group: 'Group 2' },
      { label: 'Group 1 - Option 3', value: 3, group: 'Group 1' },
      { label: 'Group 2 - Option 4', value: 4, group: 'Group 2' },
    ];

  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.form')
      .directive('selectpicker', selectpicker);

  /** @ngInject */
  function selectpicker() {
    return {
      restrict: 'A',
      require: '?ngOptions',
      priority: 1500, // make priority bigger than ngOptions and ngRepeat
      link: {
        pre: function(scope, elem, attrs) {
          elem.append('<option data-hidden="true" disabled value="">' + (attrs.title || 'Select something') + '</option>')
        },
        post: function(scope, elem, attrs) {
          function refresh() {
            elem.selectpicker('refresh');
          }

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, refresh);
          }

          if (attrs.ngDisabled) {
            scope.$watch(attrs.ngDisabled, refresh);
          }

          elem.selectpicker({ dropupAuto: false, hideDisabled: true});
        }
      }
    };
  }


})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.form')
      .directive('tagInput', tagInput);

  /** @ngInject */
  function tagInput() {
    return {
      restrict: 'A',
      link: function( $scope, elem, attr) {
        $(elem).tagsinput({
          tagClass:  'label label-' + attr.tagInput
        });
      }
    };
  }
})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.form')
      .controller('SwitchPanelCtrl', SwitchPanelCtrl);

  /** @ngInject */
  function SwitchPanelCtrl() {
    var vm = this;

    vm.switcherValues = {
      primary: true,
      warning: true,
      danger: true,
      info: true,
      success: true
    };
  }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  switchDirective.$inject = ["$timeout"];
  angular.module('zAdmin.pages.form')
      .directive('switch', switchDirective);

  /** @ngInject */
  function switchDirective($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        ngModel: '='
      },
      template: function(el, attrs) {
        return '<div class="switch-container ' + (attrs.color || '') + '"><input type="checkbox" ng-model="ngModel"></div>';
      },
      link: function (scope, elem, attr) {
        $timeout(function(){
          var input = $(elem).find('input');
          input.bootstrapSwitch({
            size: 'small',
            onColor: attr.color
          });
          input.on('switchChange.bootstrapSwitch', function(event, state) {
            scope.ngModel = state;
            scope.$apply();
          });

        });
      }
    };
  }
})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editCoarseningLayerCategoriesService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.layers.coarsening.categories')
        .service('editCoarseningLayerCategoriesService', editCoarseningLayerCategoriesService);

    /** @ngInject */
    function editCoarseningLayerCategoriesService(apiService) {
        apiService.edit.layers.coarsening.categories.getCategoryTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.coarsening.categories.getEditCategoriesTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.coarsening.categories.getEditCategoriesTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(searchTerms){
                return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            },
            getParentCategoriesTableData:function(searchTerms){
                return apiService.edit.layers.coarsening.categories.getParentCategoriesTableData(searchTerms).then(function (res){
                    return res.data.results[0].categories
                });
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditCoarseningLayerCategoriesCtrl.$inject = ["$scope", "$state", "$timeout", "EditTableStructure", "editCoarseningLayerService", "editCoarseningLayerCategoriesService", "Core", "EditTableData", "$uibModal", "parentCategoriesSmartTableData"];
    angular.module('zAdmin.pages.edit.layers.coarsening.categories')
        .controller('EditCoarseningLayerCategoriesCtrl', EditCoarseningLayerCategoriesCtrl);

    /** @ngInject */
    function EditCoarseningLayerCategoriesCtrl($scope,$state, $timeout, EditTableStructure, editCoarseningLayerService, editCoarseningLayerCategoriesService, Core, EditTableData, $uibModal, parentCategoriesSmartTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.toggleItem = toggleItem;
        vm.back = back;
        vm.save = save;

        var parentController = $scope.$parent.$parent.vm;

        vm.parentCategoriesSmartTableData = parentCategoriesSmartTableData;
        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure,editCoarseningLayerCategoriesService);

        var parentCategories = [];
        var newMergedCategories = [];

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.coarsening.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var LayerDetails = {
                "id":obj.id,
                "name":obj.name,
                "shortcut_key": obj.shortcut_key,
                "abbreviation":obj.abbreviation

            };
            var itemNotAlreadySelected = Core.findItemInArrayById(LayerDetails.id,editCoarseningLayerService.get('categories'));
            if(itemNotAlreadySelected){
                promptHotKeySelectionModal(obj,LayerDetails,parentController);
            }
        }

        function promptHotKeySelectionModal(obj,LayerDetails,parentCtrl){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/edit/layers/select.hotkey.modal.html',
                size: 'md',
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                controller: ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
                    $scope.categoryHotKey = null;

                    $scope.save = function() {
                        if($scope.categoryHotKey != null && $scope.categoryHotKey != ''){
                            obj.selected = true;
                            LayerDetails.shortcut_key = $scope.categoryHotKey;
                            editCoarseningLayerService.set("categories",LayerDetails);
                            parentCtrl.refreshData("categories");
                            $uibModalInstance.dismiss('cancel');
                        }
                    };

                    $scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });
        }
        function showCategoryInfo(obj,index){
            var pagelink = pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html';
            var size = size || 'lg';
            $uibModal.open({
                animation: true,
                templateUrl: pagelink,
                size: size,
                controller: ["$scope", function ($scope) {
                    $scope.name = obj.name;
                    $scope.description = obj.description;
                }]
            });
        }

        function edit(obj){
            console.log("edit",obj);
        }

        function toggleItem(categoryName,category,categoryValue){
            var itemNotAlreadySelected = true;
            if( categoryName == 'parent'){
                var categoryObj = {
                    "id":category.id,
                    "name":category.name
                };
                itemNotAlreadySelected = Core.findItemInArrayById(categoryObj.id,parentCategories);
                if(itemNotAlreadySelected){
                    parentCategories.push(categoryObj);
                    category.selected = true;
                }
            }else{
                var categoryObj = [{
                    "id":categoryName.id,
                    "name":categoryName.name
                }];
                itemNotAlreadySelected = Core.findItemInArrayById(categoryObj.id,newMergedCategories);
                if(itemNotAlreadySelected){
                    $('#categories-table .selected').removeClass('selected');
                    if(newMergedCategories.length > 0){
                        var objectPositionInCategoriesArray = Core.findItemPositionInArrayById(newMergedCategories[0].id,vm.smartTableData);
                        vm.smartTableData[objectPositionInCategoriesArray].selected = false;
                    }
                    newMergedCategories = categoryObj;

                    categoryName.selected = true;

                    $timeout(function(){
                        $scope.$apply();
                    })


                }
            }
        }

        function save(){
            if(parentCategories.length > 0 && newMergedCategories.length > 0){
                var categoryDetails = {
                    'parent_category': parentCategories,
                    'category': newMergedCategories
                };

                editCoarseningLayerService.set("categories",categoryDetails);
                parentController.refreshData("categories");
            }
            $state.go('edit.layers.coarsening')
        }

        function back(){
            $state.go('edit.layers.coarsening')
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editRefinementLayerCategoriesService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.layers.refinement.categories')
        .service('editRefinementLayerCategoriesService', editRefinementLayerCategoriesService);

    /** @ngInject */
    function editRefinementLayerCategoriesService(apiService) {
        apiService.edit.layers.refinement.categories.getCategoryTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.refinement.categories.getEditCategoriesTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.refinement.categories.getEditCategoriesTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(searchTerms){
                return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            },
            getParentCategoriesTableData:function(searchTerms){
                return apiService.edit.layers.refinement.categories.getParentCategoriesTableData(searchTerms).then(function (res){
                    return res.data.results[0].categories;
                });
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditRefinementLayerCategoriesCtrl.$inject = ["$scope", "$state", "$timeout", "EditTableStructure", "editRefinementLayerService", "editRefinementLayerCategoriesService", "Core", "EditTableData", "$uibModal", "parentCategoriesSmartTableData"];
    angular.module('zAdmin.pages.edit.layers.refinement.categories')
        .controller('EditRefinementLayerCategoriesCtrl', EditRefinementLayerCategoriesCtrl);

    /** @ngInject */
    function EditRefinementLayerCategoriesCtrl($scope,$state, $timeout, EditTableStructure, editRefinementLayerService, editRefinementLayerCategoriesService, Core, EditTableData, $uibModal, parentCategoriesSmartTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.toggleItem = toggleItem;
        vm.back = back;
        vm.save = save;

        var parentController = $scope.$parent.$parent.vm;

        vm.parentCategoriesSmartTableData = parentCategoriesSmartTableData;
        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure,editRefinementLayerCategoriesService);

        var parentCategories = [];
        var newMergedCategories = [];

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.refinement.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var LayerDetails = {
                "id":obj.id,
                "name":obj.name,
                "shortcut_key": obj.shortcut_key,
                "abbreviation":obj.abbreviation

            };
            var itemNotAlreadySelected = Core.findItemInArrayById(LayerDetails.id,editRefinementLayerService.get('categories'));
            if(itemNotAlreadySelected){
                promptHotKeySelectionModal(obj,LayerDetails,parentController);
            }
        }

        function promptHotKeySelectionModal(obj,LayerDetails,parentCtrl){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/edit/layers/select.hotkey.modal.html',
                size: 'md',
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                controller: ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
                    $scope.categoryHotKey = null;

                    $scope.save = function() {
                        if($scope.categoryHotKey != null && $scope.categoryHotKey != ''){
                            obj.selected = true;
                            LayerDetails.shortcut_key = $scope.categoryHotKey;
                            editRefinementLayerService.set("categories",LayerDetails);
                            parentCtrl.refreshData("categories");
                            $uibModalInstance.dismiss('cancel');
                        }
                    };

                    $scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }]
            });
        }
        function showCategoryInfo(obj,index){
            console.log("showCategoryInfo");
            var pagelink = pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html';
            var size = size || 'lg';
            $uibModal.open({
                animation: true,
                templateUrl: pagelink,
                size: size,
                controller: ["$scope", function ($scope) {
                    $scope.name = obj.name;
                    $scope.description = obj.description;
                }]
            });
        }

        function edit(obj){
            console.log("edit",obj);
        }

        function toggleItem(categoryName,category,categoryValue){
            var itemNotAlreadySelected = true;
            if( categoryName == 'parent'){
                var categoryObj = [{
                    "id":category.id,
                    "name":category.name
                }];
                itemNotAlreadySelected = Core.findItemInArrayById(categoryObj.id,parentCategories);
                if(itemNotAlreadySelected){
                    $('#categories-table .selected').removeClass('selected');
                    if(parentCategories.length > 0){
                        var objectPositionInCategoriesArray = Core.findItemPositionInArrayById(parentCategories[0].id,vm.parentCategoriesSmartTableData);
                        vm.parentCategoriesSmartTableData[objectPositionInCategoriesArray].selected = false;
                    }
                    parentCategories = categoryObj;

                    category.selected = true;

                    $timeout(function(){
                        $scope.$apply();
                    })


                }
            }else{
                var categoryObj = {
                    "id":categoryName.id,
                    "name":categoryName.name
                };
                itemNotAlreadySelected = Core.findItemInArrayById(categoryObj.id,newMergedCategories);
                if(itemNotAlreadySelected){
                    newMergedCategories.push(categoryObj);
                    categoryName.selected = true;
                }
            }
        }

        function save(){
            if(parentCategories.length > 0 && newMergedCategories.length > 0){
                var categoryDetails = {
                    'parent_category': parentCategories,
                    'category': newMergedCategories
                };

                editRefinementLayerService.set("categories",categoryDetails);
                parentController.refreshData("categories");
            }
            $state.go('edit.layers.refinement')
        }

        function back(){
            $state.go('edit.layers.refinement')
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editRefinementLayerRestrictionsService.$inject = ["apiService", "editRefinementLayerService"];
    angular.module('zAdmin.pages.edit.layers.refinement.restrictions')
        .service('editRefinementLayerRestrictionsService', editRefinementLayerRestrictionsService);

    /** @ngInject */
    function editRefinementLayerRestrictionsService(apiService,editRefinementLayerService) {
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.refinement.restrictions.getEditRestrictionsTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.refinement.restrictions.getEditRestrictionsTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(){
                return editRefinementLayerService.Data.restrictions;
            },
            get: function(key){
                return tableData[key];
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditRefinementLayerRestrictionsCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editRefinementLayerService", "Core", "EditTableData", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.extension.restrictions')
        .controller('EditRefinementLayerRestrictionsCtrl', EditRefinementLayerRestrictionsCtrl);

    /** @ngInject */
    function EditRefinementLayerRestrictionsCtrl($scope,$state, EditTableStructure, editRefinementLayerService, Core, EditTableData, ENV_CONST) {
        var vm = this;
        vm.toggleInCategoryToGroupOne = toggleInCategoryToGroupOne;
        vm.toggleInCategoryToGroupTwo = toggleInCategoryToGroupTwo;
        vm.save = save;
        vm.back = back;
        vm.toggleItem = toggleItem;
        vm.pageName = 'layers.restrictions';

        var parentCtrl = $scope.$parent.vm;

        var defaultType =ENV_CONST.RESTRICTIONS_TYPE[0];

        vm.restrictionsTypes = ENV_CONST.RESTRICTIONS_TYPE;
        vm.restrictionType = $state.params.chosenItem != null ? $state.params.chosenItem.type : defaultType;

        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure);

        if($state.params.id && $state.params.chosenItem){
            // init restrictiopn from db - from string to array
            $state.params.chosenItem.categories_1 = JSON.parse($state.params.chosenItem.categories_1.replace(/'/g,'"'));
            $state.params.chosenItem.categories_2 = JSON.parse($state.params.chosenItem.categories_2.replace(/'/g,'"'));
        }

        vm.smartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_1.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        vm.affectedSmartTableData = angular.copy(vm.smartTableData);


        vm.affectedSmartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_2.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        var categoryOneArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_1): [];
        var categoryTwoArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_2) : [];


        function back(){
            $state.go('edit.layers.refinement');
        }

        function toggleItem(categoryName, category,categoryValue){
             if(categoryName =='category_1'){
                vm.toggleInCategoryToGroupOne(category,categoryValue);
            }else{
                vm.toggleInCategoryToGroupTwo(category,categoryValue);
            }
        }
        function toggleInCategoryToGroupOne(category,categoryValue){
            if(categoryValue){
                categoryOneArray.push(category);
            }else{
                var categoryIndexInArray = categoryOneArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                categoryOneArray.splice(categoryIndexInArray,1)
            }
        }

        function toggleInCategoryToGroupTwo(category,categoryValue){
            if(categoryValue){
                categoryTwoArray.push(category);
            }else{
                var categoryIndexInArray = categoryTwoArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                categoryTwoArray.splice(categoryIndexInArray,1)
            }
        }

        function save(){
            if(categoryOneArray.length > 0 && categoryTwoArray.length > 0){
                
                var restriction = Core.generateRestrictionObject(categoryOneArray,vm.restrictionType,categoryTwoArray);

                editRefinementLayerService.set("restrictions",restriction, $state.params.itemRowIndex);
                parentCtrl.refreshData("restriction");
                
                back();
            }


        }

    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editExtensionLayerCategoriesService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.layers.extension.categories')
        .service('editExtensionLayerCategoriesService', editExtensionLayerCategoriesService);

    /** @ngInject */
    function editExtensionLayerCategoriesService(apiService) {
        apiService.edit.layers.extension.categories.getCategoryTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.extension.categories.getEditCategoriesTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.extension.categories.getEditCategoriesTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(searchTerms){
                return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditExtensionLayerCategoriesCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editExtensionLayerService", "editExtensionLayerCategoriesService", "Core", "EditTableData", "$uibModal"];
    angular.module('zAdmin.pages.edit.layers.extension.categories')
        .controller('EditExtensionLayerCategoriesCtrl', EditExtensionLayerCategoriesCtrl);

    /** @ngInject */
    function EditExtensionLayerCategoriesCtrl($scope,$state, EditTableStructure, editExtensionLayerService, editExtensionLayerCategoriesService, Core, EditTableData, $uibModal) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.smartTableData = EditTableData;
        Core.init(this,EditTableStructure,editExtensionLayerCategoriesService);

        var parentCtrl = $scope.$parent.$parent.vm;
        var editLayerCtrl = $scope.$parent.$parent.$parent.vmEditLayerCtrl;

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function toggleCategory(categoryRow){
            console.log(categoryRow);
        }


        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }

        function chooseRow(obj,index){
            return editLayerCtrl.chooseRow(obj,index,editExtensionLayerService,parentCtrl)
        }


        function showCategoryInfo(obj,index){
            var pagelink = pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html';
            var size = size || 'lg';
            $uibModal.open({
                animation: true,
                templateUrl: pagelink,
                size: size,
                controller: ["$scope", function ($scope) {
                    $scope.name = obj.name;
                    $scope.description = obj.description;
                }]
            });
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editExtensionLayerRestrictionsService.$inject = ["apiService", "editExtensionLayerService"];
    angular.module('zAdmin.pages.edit.layers.extension.restrictions')
        .service('editExtensionLayerRestrictionsService', editExtensionLayerRestrictionsService);

    /** @ngInject */
    function editExtensionLayerRestrictionsService(apiService,editExtensionLayerService) {
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.extension.restrictions.getEditRestrictionsTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.extension.restrictions.getEditRestrictionsTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(){
                return editExtensionLayerService.Data.restrictions;
            },
            get: function(key){
                return tableData[key];
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditExtensionLayerRestrictionsCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editExtensionLayerService", "Core", "EditTableData", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.extension.restrictions')
        .controller('EditExtensionLayerRestrictionsCtrl', EditExtensionLayerRestrictionsCtrl);

    /** @ngInject */
    function EditExtensionLayerRestrictionsCtrl($scope,$state, EditTableStructure, editExtensionLayerService, Core, EditTableData, ENV_CONST) {
        var vm = this;
        vm.toggleInCategoryToGroupOne = toggleInCategoryToGroupOne;
        vm.toggleInCategoryToGroupTwo = toggleInCategoryToGroupTwo;
        vm.save = save;
        vm.back = back;
        vm.toggleItem = toggleItem;
        vm.pageName = 'layers.restrictions';

        var parentCtrl = $scope.$parent.vm;

        var defaultType =ENV_CONST.RESTRICTIONS_TYPE[0];

        vm.restrictionsTypes = ENV_CONST.RESTRICTIONS_TYPE;
        vm.restrictionType = $state.params.chosenItem != null ? $state.params.chosenItem.type : defaultType;

        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure);

        // init restrictiopn from db - from string to array
        if(!!$state.params.id && !!$state.params.chosenItem){
            if(typeof $state.params.chosenItem.categories_1 == 'string'){
                $state.params.chosenItem.categories_1 = Core.initCategoriesStringToArray($state.params.chosenItem.categories_1)
            }
            if(typeof $state.params.chosenItem.categories_2 == 'string'){
                $state.params.chosenItem.categories_2 = Core.initCategoriesStringToArray($state.params.chosenItem.categories_2)
            }
        }

        vm.smartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_1.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        vm.affectedSmartTableData = angular.copy(vm.smartTableData);


        vm.affectedSmartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_2.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        var categoryOneArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_1): [];
        var categoryTwoArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_2) : [];


        function back(){
            $state.go('edit.layers.extension');
        }

        function toggleItem(categoryName, category,categoryValue){
             if(categoryName =='category_1'){
                vm.toggleInCategoryToGroupOne(category,categoryValue);
            }else{
                vm.toggleInCategoryToGroupTwo(category,categoryValue);
            }
        }
        function toggleInCategoryToGroupOne(category,categoryValue){
            if(categoryValue){
                categoryOneArray.push(category);
            }else{
                var categoryIndexInArray = categoryOneArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                categoryOneArray.splice(categoryIndexInArray,1)
            }
        }

        function toggleInCategoryToGroupTwo(category,categoryValue){
            if(categoryValue){
                categoryTwoArray.push(category);
            }else{
                var categoryIndexInArray = categoryTwoArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                categoryTwoArray.splice(categoryIndexInArray,1)
            }
        }

        function save(){
            if(categoryOneArray.length > 0 && categoryTwoArray.length > 0){
                
                var restriction = Core.generateRestrictionObject(categoryOneArray,vm.restrictionType,categoryTwoArray);

                editExtensionLayerService.set("restrictions",restriction, $state.params.itemRowIndex);
                parentCtrl.refreshData("restriction");
                back();
            }


        }

    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editRootLayerCategoriesService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.layers.root.categories')
        .service('editRootLayerCategoriesService', editRootLayerCategoriesService);

    /** @ngInject */
    function editRootLayerCategoriesService(apiService) {
        apiService.edit.layers.root.categories.getCategoryTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.root.categories.getEditCategoriesTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.root.categories.getEditCategoriesTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(searchTerms){
                return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditRootLayerCategoriesCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editRootLayerService", "editRootLayerCategoriesService", "Core", "EditTableData", "$uibModal", "editCategoriesService"];
    angular.module('zAdmin.pages.edit.layers.root.categories')
        .controller('EditRootLayerCategoriesCtrl', EditRootLayerCategoriesCtrl);

    /** @ngInject */
    function EditRootLayerCategoriesCtrl($scope,$state, EditTableStructure, editRootLayerService, editRootLayerCategoriesService, Core, EditTableData, $uibModal, editCategoriesService) {
        var vm = this;
        vm.edit = edit;
        vm.upsert = upsert;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.smartTableData = EditTableData;
        Core.init(this,EditTableStructure,editRootLayerCategoriesService);

        var parentCtrl = $scope.$parent.$parent.vm;
        var editLayerCtrl = $scope.$parent.$parent.$parent.vmEditLayerCtrl;

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.root.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function toggleCategory(categoryRow){
            console.log(categoryRow);
        }

        function upsert(obj){
            console.log("edit",obj);
            editCategoriesService.saveCategoryDetails(obj).then(function(response){
                if($state.current.name.indexOf(".categories.create") > -1){
                      var goToState = $state.current.name.replace("create","manage");
                      $state.go(goToState,{},{reload:true});
                }else{
                    history.back();
                }
            })
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }
        function chooseRow(obj,index){
            return editLayerCtrl.chooseRow(obj,index,editRootLayerService,parentCtrl)
        }
        
        function showCategoryInfo(obj,index){
            var pagelink = pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html';
            var size = size || 'lg';
            $uibModal.open({
                animation: true,
                templateUrl: pagelink,
                size: size,
                controller: ["$scope", function ($scope) {
                    $scope.name = obj.name;
                    $scope.description = obj.description;
                }]
            });
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editRootLayerRestrictionsService.$inject = ["apiService", "editRootLayerService"];
    angular.module('zAdmin.pages.edit.layers.root.restrictions')
        .service('editRootLayerRestrictionsService', editRootLayerRestrictionsService);

    /** @ngInject */
    function editRootLayerRestrictionsService(apiService,editRootLayerService) {
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.root.restrictions.getEditRestrictionsTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.root.restrictions.getEditRestrictionsTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(){
                return editRootLayerService.Data.restrictions;
            },
            get: function(key){
                return tableData[key];
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditRootLayerRestrictionsCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editRootLayerService", "Core", "EditTableData", "ENV_CONST"];
    angular.module('zAdmin.pages.edit.layers.root.restrictions')
        .controller('EditRootLayerRestrictionsCtrl', EditRootLayerRestrictionsCtrl);

    /** @ngInject */
    function EditRootLayerRestrictionsCtrl($scope,$state, EditTableStructure, editRootLayerService, Core, EditTableData, ENV_CONST) {
        var vm = this;
        vm.toggleInCategoryToGroupOne = toggleInCategoryToGroupOne;
        vm.toggleInCategoryToGroupTwo = toggleInCategoryToGroupTwo;
        vm.save = save;
        vm.back = back;
        vm.toggleItem = toggleItem;
        vm.pageName = 'layers.restrictions';

        var defaultType =ENV_CONST.RESTRICTIONS_TYPE[0];
        var parentCtrl = $scope.$parent.vm;

        vm.restrictionsTypes = ENV_CONST.RESTRICTIONS_TYPE;
        vm.restrictionType = $state.params.chosenItem != null ? $state.params.chosenItem.type : defaultType;

        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure);

        // init restrictiopn from db - from string to array
        if(!!$state.params.id && !!$state.params.chosenItem){
            if(typeof $state.params.chosenItem.categories_1 == 'string'){
                $state.params.chosenItem.categories_1 = Core.initCategoriesStringToArray($state.params.chosenItem.categories_1)
            }
            if(typeof $state.params.chosenItem.categories_2 == 'string'){
                $state.params.chosenItem.categories_2 = Core.initCategoriesStringToArray($state.params.chosenItem.categories_2)
            }
        }
        

        vm.smartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_1.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        vm.affectedSmartTableData = angular.copy(vm.smartTableData);


        vm.affectedSmartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_2.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        var categoryOneArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_1): [];
        var categoryTwoArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_2) : [];


        function back(){
            $state.go('edit.layers.root');
        }

        function toggleItem(categoryName, category,categoryValue){
             if(categoryName =='category_1'){
                vm.toggleInCategoryToGroupOne(category,categoryValue);
            }else{
                vm.toggleInCategoryToGroupTwo(category,categoryValue);
            }
        }
        function toggleInCategoryToGroupOne(category,categoryValue){
            if(categoryValue){
                categoryOneArray.push(category);
            }else{
                var categoryIndexInArray = categoryOneArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                categoryOneArray.splice(categoryIndexInArray,1)
            }
        }

        function toggleInCategoryToGroupTwo(category,categoryValue){
            if(vm.restrictionType.key !== "FORBID_ANY_CHILD"){
                if(categoryValue){
                    categoryTwoArray.push(category);
                }else{
                    var categoryIndexInArray = categoryTwoArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                    categoryTwoArray.splice(categoryIndexInArray,1)
                }
            }else{
                if(categoryValue){
                    Core.showNotification('error','"forbid any child" accept only one category set.')
                }
            }
        }
        
        function save(){
            if(categoryOneArray.length > 0){
                if(vm.restrictionType.key == "FORBID_ANY_CHILD" || categoryTwoArray.length > 0){
                    categoryTwoArray = vm.restrictionType.key == "FORBID_ANY_CHILD" ? [] : categoryTwoArray;
                    var restriction = Core.generateRestrictionObject(categoryOneArray,vm.restrictionType,categoryTwoArray);

                    editRootLayerService.set("restrictions",restriction, $state.params.itemRowIndex);
                    parentCtrl.refreshData("restriction");

                    back();
                }
            }
        }

        


    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editAnnotationTaskAnnotatorService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.tasks.annotation.annotator')
        .service('editAnnotationTaskAnnotatorService', editAnnotationTaskAnnotatorService);

    /** @ngInject */
    function editAnnotationTaskAnnotatorService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.annotation.annotator.getAnnotatorsTableStructure().then(function (res){return res.data});
            },
            getTableData: function(id){
                var _service = this;
                return apiService.users.getUsersTableData(id).then(function (res){
                    angular.copy(res.data.results, _service.Data);
                    return _service.Data;
                });
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditAnnotationTaskAnnotatorCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editAnnotationTaskAnnotatorService", "editAnnotationTasksService", "Core", "UserTableData"];
    angular.module('zAdmin.pages.edit.tasks.annotation.annotator')
        .controller('EditAnnotationTaskAnnotatorCtrl', EditAnnotationTaskAnnotatorCtrl);

    /** @ngInject */
    function EditAnnotationTaskAnnotatorCtrl($scope,$state, EditTableStructure, editAnnotationTaskAnnotatorService, editAnnotationTasksService, Core, UserTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = UserTableData;
        Core.init(this,EditTableStructure,editAnnotationTaskAnnotatorService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editAnnotationTaskAnnotatorService.get(obj.key);
        });

        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.passages.sources.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.tasks.passages.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var sourceDetails = {
                "id":obj.id,
                "first_name":obj.first_name,
                "last_name":obj.last_name
            }
            editAnnotationTasksService.set("user",sourceDetails,true);
            parentCtrl.refreshData("user");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editTokenizationTaskAnnotatorService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.tasks.tokenization.annotator')
        .service('editTokenizationTaskAnnotatorService', editTokenizationTaskAnnotatorService);

    /** @ngInject */
    function editTokenizationTaskAnnotatorService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.tokenization.annotator.getAnnotatorsTableStructure().then(function (res){return res.data});
            },
            getTableData: function(id){
                var _service = this;
                return apiService.users.getUsersTableData(id).then(function (res){
                    angular.copy(res.data.results, _service.Data);
                    return _service.Data;
                });
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditTokenizationTaskAnnotatorCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editTokenizationTaskAnnotatorService", "editTokenizationTasksService", "Core", "UserTableData"];
    angular.module('zAdmin.pages.edit.tasks.tokenization.annotator')
        .controller('EditTokenizationTaskAnnotatorCtrl', EditTokenizationTaskAnnotatorCtrl);

    /** @ngInject */
    function EditTokenizationTaskAnnotatorCtrl($scope,$state, EditTableStructure, editTokenizationTaskAnnotatorService, editTokenizationTasksService, Core, UserTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = UserTableData;
        Core.init(this,EditTableStructure,editTokenizationTaskAnnotatorService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTokenizationTaskAnnotatorService.get(obj.key);
        });

        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.passages.sources.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.tasks.passages.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var sourceDetails = {
                "id":obj.id,
                "first_name":obj.first_name,
                "last_name":obj.last_name
            }
            editTokenizationTasksService.set("user",sourceDetails,true);
            parentCtrl.refreshData("user");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editTokenizationTaskPassagesService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.tasks.passages')
        .service('editTokenizationTaskPassagesService', editTokenizationTaskPassagesService);

    /** @ngInject */
    function editTokenizationTaskPassagesService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.tokenization.passages.getPassagesTableStructure().then(function (res){return res.data});
            },
            getTableData: function(id){
                var _service = this;
                return apiService.passages.getPassagesTableData(id).then(function (res){
                    angular.copy(res.data.results, _service.Data);
                    return _service.Data
                });
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditTokenizationTaskPassagesCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editTokenizationTaskPassagesService", "editTokenizationTasksService", "Core", "PassagesTableData"];
    angular.module('zAdmin.pages.edit.tasks.passages')
        .controller('EditTokenizationTaskPassagesCtrl', EditTokenizationTaskPassagesCtrl);

    /** @ngInject */
    function EditTokenizationTaskPassagesCtrl($scope,$state, EditTableStructure, editTokenizationTaskPassagesService, editTokenizationTasksService, Core, PassagesTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = PassagesTableData;
        Core.init(this,EditTableStructure,editTokenizationTaskPassagesService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTokenizationTaskPassagesService.get(obj.key);
        });

        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.passages.sources.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.tasks.passages.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var sourceDetails = {
                "id":obj.id,
                "short_text":obj.text,
                "type":obj.type
            }
            editTokenizationTasksService.set("passage",sourceDetails,true);
            parentCtrl.refreshData("passage");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();


/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    editReviewTaskAnnotatorService.$inject = ["apiService"];
    angular.module('zAdmin.pages.edit.tasks.review.annotator')
        .service('editReviewTaskAnnotatorService', editReviewTaskAnnotatorService);

    /** @ngInject */
    function editReviewTaskAnnotatorService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.review.annotator.getAnnotatorsTableStructure().then(function (res){return res.data});
            },
            getTableData: function(id){
                var _service = this;
                return apiService.users.getUsersTableData(id).then(function (res){
                    angular.copy(res.data.results, _service.Data);
                    return _service.Data;
                });
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            }
        };
        return service;
    }

})();

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    EditReviewTaskAnnotatorCtrl.$inject = ["$scope", "$state", "EditTableStructure", "editReviewTaskAnnotatorService", "editReviewTasksService", "Core", "UserTableData"];
    angular.module('zAdmin.pages.edit.tasks.review.annotator')
        .controller('EditReviewTaskAnnotatorCtrl', EditReviewTaskAnnotatorCtrl);

    /** @ngInject */
    function EditReviewTaskAnnotatorCtrl($scope,$state, EditTableStructure, editReviewTaskAnnotatorService, editReviewTasksService, Core, UserTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = UserTableData;
        Core.init(this,EditTableStructure,editReviewTaskAnnotatorService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editReviewTaskAnnotatorService.get(obj.key);
        });

        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.passages.sources.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.tasks.passages.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var sourceDetails = {
                "id":obj.id,
                "first_name":obj.first_name,
                "last_name":obj.last_name
            }
            editReviewTasksService.set("user",sourceDetails,true);
            parentCtrl.refreshData("user");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();

angular.module("zAdmin").run(["$templateCache", function($templateCache) {$templateCache.put("app/pages/annotation/annotation-page.html","<div class=\"annotation-page-container\"><div class=\"col-xs-2 side-bar\" keep-on-top=\"\"><div class=\"categories-container\"><categories-directive ng-repeat=\"category in vm.categories track by $index\" definition-details=\"category\" definition-id=\"$index\"></categories-directive></div><div class=\"utility-buttons-container\"><utility-buttons-directive ng-repeat=\"definition in vm.definitions track by $index\" definition-details=\"definition\" definition-id=\"$index\"></utility-buttons-directive></div></div><div class=\"col-xs-10 main-body\"><div class=\"nav-bar-container\"><nav-bar-item ng-repeat=\"item in vm.navBarItems track by $index\" tool-tip=\"item.tooltip\"></nav-bar-item><div class=\"available-font-sizes\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-primary\" uib-dropdown-toggle=\"\">Font Size <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li ng-repeat=\"fz in vm.fontSizes\" ng-click=\"vm.setFontSize(fz)\"><a href=\"\">{{::fz.preview}}</a></li></ul></div></div></div><div class=\"col-xs-12 manager-comment-container alert bg-info closeable\" ng-show=\"!vm.showManagerComment\"><div class=\"title-and-close-container\"><span class=\"title manager_comment\">{{vm.tokenizationTask.manager_comment}}</span> <i class=\"ion-close-round\" id=\"hide-manager-comment\" ng-click=\"vm.showManagerComment = !vm.showManagerComment\"></i></div></div><annotation-units class=\"has-elements\" unit=\"vm.dataTree\" tokens=\"vm.annotationTokens\" annotation-unit-tree-id=\"0\"></annotation-units></div></div>");
$templateCache.put("app/pages/categories/categories.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\" permission=\"\" permission-only=\"[\'ADMIN\',\'PROJECT_MANAGER\']\">Add New category</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Categories Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/auth/auth.html","<div class=\"\"><div class=\"row ucca-reg-header\"><div class=\"col-md-6\"><a href=\"http://www.cs.huji.ac.il/\" target=\"_blank\"><img src=\"http://www.cs.huji.ac.il/imagesl/cse_banner.jpg\" style=\"max-width: 100%;\" align=\"left\"></a></div><div class=\"col-md-6 visible-lg-*\"><div class=\"visible-lg-*\"><a href=\"http://new.huji.ac.il/en\" target=\"_blank\"><img src=\"http://www.cs.huji.ac.il/imagesl/huji_banner.png\" style=\"padding-top:7px\" align=\"right\"></a></div></div></div><div class=\"container\"><div class=\"row auth-main\" style=\"min-height: 400px;\"><div class=\"auth-block\"><h1>Sign in to UCCA App</h1><a ui-sref=\"reg\" class=\"auth-link\">New to UCCA App? Sign up!</a><form class=\"form-horizontal\" id=\"login-form\" name=\"vm.loginDetails\" novalidate=\"\"><div class=\"form-group\" ng-class=\"{\'has-error\': vm.loginDetails.email.$invalid && (vm.loginDetails.email.$dirty || vm.loginDetails.$submitted)}\" style=\"\"><label for=\"exampleInputEmail1\" class=\"col-sm-2 control-label\">Email</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" name=\"email\" placeholder=\"Email\" ng-model=\"vm.personalInfo.email\" ng-init=\"vm.personalInfo.email=\'\'\" required=\"\" style=\"\"> <span class=\"help-block error-block basic-block\">Proper email required</span></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': vm.loginDetails.password.$invalid && (vm.loginDetails.password.$dirty || vm.loginDetails.$submitted)}\" style=\"\"><label for=\"exampleInputEmail1\" class=\"col-sm-2 control-label\">Password</label><div class=\"col-sm-10\"><input type=\"password\" class=\"form-control\" id=\"inputPassword3\" name=\"password\" placeholder=\"Password\" ng-model=\"vm.personalInfo.password\" ng-init=\"vm.personalInfo.password=\'\'\" required=\"\" style=\"\"> <span class=\"help-block error-block basic-block\">Proper email required</span></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-default btn-auth\" ng-click=\"vm.login();\">Sign in</button> <a href=\"\" class=\"forgot-pass\" ng-click=\"vm.forgotPassword()\">Forgot password?</a></div></div></form></div></div><div class=\"row details\" style=\"line-height: 30px;font-size:20px;\"><div class=\"col-md-12\"><div><p>UCCAApp is an open-source, flexible web-application for syntactic and semantic phrase-based annotation in general, and for UCCA annotation in particular. UCCAApp supports a variety of formal properties that have proven useful for syntactic and semantic representation, such as discontiguous phrases, multiple parents and empty elements, making it useful to a variety of other annotation schemes with similar formal properties. UCCAApp’s user interface is intuitive and simple, so as to support annotation by users with no background in linguistics or formal representation. Indeed, a pilot version of the application has been successfully used in the compilation of the UCCA Wikipedia treebank by annotators with no previous linguistic training.</p><ul style=\"color: orange;\"><li>UCCAApp is undergoing final stages of development. A stable, pilot version of the application (albeit a more stable one) can be found <a href=\"http://ucca.cs.huji.ac.il\" target=\"_blank\">here</a>. Sign in with user: guest and password tseug.</li><li>All UCCA\'s resources are available <a href=\"http://www.cs.huji.ac.il/~oabend/ucca.html\" title=\"resources\" target=\"_blank\">here</a>‏.</li><li>The code repository can be found <a href=\"https://github.com/omriabnd/UCCA-App\" target=\"_blank\">here</a>.</li></ul></div><div><br><h2>About UCCA</h2><br><p>UCCA (Universal Conceptual Cognitive Annotation) (Abend and Rappoport, 2013) is a cross-linguistically applicable scheme for semantic annotation. Formally, an UCCA structure is a directed acyclic graph (DAG), whose leaves correspond to the words of the text. The graph&rsquo;s nodes, called units, are either terminals or several elements jointly viewed as a single entity according to some semantic or cognitive consideration. Edges bear a category, indicating the role of the sub-unit in the structure the unit represents. UCCA&rsquo;s basic inventory of distinctions (its foundational layer) focuses on argument structures (adjectival, nominal, verbal and others) and relations between them. The most basic notion is the Scene, which describes a movement, an action or a state which persists in time. Each Scene contains one main relation and zero or more participants.</p><p>For example, the sentence &ldquo;After graduation, Tom moved to America&rdquo; (see figure) contains two Scenes, whose main relations are &ldquo;graduation&rdquo; and &ldquo;moved&rdquo;. The participant &ldquo;Tom&rdquo; is a part of both Scenes, while &ldquo;America&rdquo; only of the latter. Further categories account for inter-scene relations and the sub-structures of participants and relations.</p><p>UCCA is supported by extensive typological cross-linguistic evidence and accords with the leading Cognitive Linguistics theories. We build primarily on Basic Linguistic Theory (BLT) (Dixon, 2005; 2010a; 2010b; 2012), a typological approach to grammar successfully used for the description of a wide variety of languages. BLT uses semantic similarity as its main criterion for categorizing constructions both within and across languages. UCCA takes a similar approach, thereby creating a set of distinctions that is motivated cross-linguistically.</p><p></p><h3>References</h3><ul><li>Omri Abend and Ari Rappoport. 2013. Universal conceptual cognitive annotation (UCCA). In ACL 2013, pages 228&ndash;238.</li><li>Robert M. W. Dixon. 2005. A Semantic Approach To English Grammar. Oxford University Press.</li><li>Robert M. W. Dixon. 2010a. Basic Linguistic Theory: Methodology, volume 1. Oxford University Press.</li><li>Robert M. W. Dixon. 2010b. Basic Linguistic Theory: Grammatical Topics, volume 2. Oxford University Press.</li><li>Robert M. W. Dixon. 2012. Basic Linguistic Theory: Further Grammatical Topics, volume 3. Oxford University Press.</li></ul><p></p></div><div><br><h2>Contact Us</h2><br><p>With any questions, please contact:</p><p><a href=\"http://www.cs.huji.ac.il/~oabend/\" target=\"_blank\">Omri Abend</a><br>School of Computer Science and Engineering<br>The Hebrew University of Jerusalem<br>e-mail: oabend at cs dot huji dot ac dot</p></div></div></div></div></div>");
$templateCache.put("app/pages/edit/edit.html","<div class=\"row\"><div class=\"edit-container col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable && (vmEditCtrl.editAssetMode || (vmEditCtrl.addNewAssetMode && formElem.hideInAddNewAssetMode != true) )\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"edit-container col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/layers/layers.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({\'type\':\'Root\'})\" permission=\"\" permission-only=\"[\'ADMIN\',\'PROJECT_MANAGER\']\">Add New Root Layer</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Layers Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/maps/maps.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-12\" ui-view=\"\"></div></div></div>");
$templateCache.put("app/pages/passages/passages.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New Passage</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Passages Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/profile/profile.html","<div ba-panel=\"\" ba-panel-class=\"profile-page\"><div class=\"panel-content\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group row clearfix\"><label for=\"inputEmail\" class=\"col-sm-3 control-label\">Email</label><div class=\"col-sm-9\"><input type=\"text\" class=\"form-control\" id=\"inputEmail\" placeholder=\"\" value=\"\" ng-model=\"vm.profileDetails.email\"></div></div><div class=\"form-group row clearfix\"><label for=\"inputId\" class=\"col-sm-3 control-label\">Id</label><div class=\"col-sm-9\"><input type=\"text\" class=\"form-control\" id=\"inputId\" placeholder=\"\" value=\"\" ng-model=\"vm.profileDetails.id\" disabled=\"\"></div></div><div class=\"form-group row clearfix\"><label for=\"inputFirstName\" class=\"col-sm-3 control-label\">First Name</label><div class=\"col-sm-9\"><input type=\"text\" class=\"form-control\" id=\"inputFirstName\" placeholder=\"\" value=\"\" ng-model=\"vm.profileDetails.first_name\"></div></div><div class=\"form-group row clearfix\"><label for=\"inputLastName\" class=\"col-sm-3 control-label\">Last Name</label><div class=\"col-sm-9\"><input type=\"text\" class=\"form-control\" id=\"inputLastName\" placeholder=\"\" value=\"\" ng-model=\"vm.profileDetails.last_name\"></div></div><div class=\"form-group row clearfix\"><label for=\"inputOrganization\" class=\"col-sm-3 control-label\">Organization</label><div class=\"col-sm-9\"><input type=\"text\" class=\"form-control\" id=\"inputOrganization\" placeholder=\"\" value=\"\" ng-model=\"vm.profileDetails.organization\"></div></div><div class=\"form-group row clearfix\"><label for=\"inputAffiliation\" class=\"col-sm-3 control-label\">Affiliation</label><div class=\"col-sm-9\"><input type=\"text\" class=\"form-control\" id=\"inputAffiliation\" placeholder=\"\" value=\"\" ng-model=\"vm.profileDetails.affiliation\"></div></div></div></div><div class=\"row\"><div class=\"col-md-6\"><button type=\"button\" class=\"btn btn-primary btn-with-icon save-profile\" ng-click=\"vm.saveProfileData()\"><i class=\"ion-android-checkmark-circle\"></i>Save</button></div></div><h3 class=\"with-line\">Change Password</h3><div class=\"row\"><div class=\"col-md-6\"><form name=\"vm.passwordDetails\" novalidate=\"\" id=\"password-change-form\"><div class=\"form-group row clearfix\" ng-class=\"{\'has-error\': vm.passwordDetails.new_password == null && (vm.passwordDetails.$dirty || vm.passwordDetails.$submitted)}\"><label for=\"inputNewPassword\" class=\"col-sm-3 control-label\">New Password</label><div class=\"col-sm-9\"><input type=\"password\" class=\"form-control\" id=\"inputNewPassword\" placeholder=\"New password\" value=\"\" ng-model=\"vm.passwordDetails.new_password\" required=\"\"> <span class=\"help-block error-block basic-block\">Required</span></div></div><div class=\"form-group row clearfix\" ng-class=\"{\'has-error\': !vm.newPassEquals && vm.passwordDetails.new_password_again }\"><label for=\"inputPasswordAgain\" class=\"col-sm-3 control-label\">New Password Again</label><div class=\"col-sm-9\"><input type=\"password\" class=\"form-control\" id=\"inputPasswordAgain\" placeholder=\"New password again\" value=\"\" ng-model=\"vm.passwordDetails.new_password_again\" required=\"\"> <span class=\"help-block error-block basic-block\">Passwords should match</span></div></div><div class=\"row\"><div class=\"col-md-12\"><button type=\"button\" class=\"btn btn-primary btn-with-icon exit-profile-page\" ng-click=\"vm.cancle()\"><i class=\"ion-android-checkmark-circle\"></i>Cancel</button> <button type=\"submit\" class=\"btn btn-primary btn-with-icon save-new-pass\" ng-click=\"vm.updatePassword()\"><i class=\"ion-android-checkmark-circle\"></i>Save</button></div></div></form></div></div></div></div>");
$templateCache.put("app/pages/profile/profileModal.html","<div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-label=\"Close\"><em class=\"ion-ios-close-empty sn-link-close\"></em></button><h4 class=\"modal-title\" id=\"myModalLabel\">Add Account</h4></div><form name=\"linkForm\"><div class=\"modal-body\"><p>Paste a link to your profile into the box below</p><div class=\"form-group\"><input type=\"text\" class=\"form-control\" placeholder=\"Link to Profile\" ng-model=\"link\"></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"ok(link)\">Save changes</button></div></form></div>");
$templateCache.put("app/pages/project_tasks/project.tasks.html","<div ba-panel=\"\" ba-panel-title=\"Search Form {{vm.currentProject.name}} ({{ vm.projectId }})\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\" ng-if=\"vm.projectRootLayerType\">New Tokenization Task</button> <button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\" ng-if=\"vm.projectDerivedLayerType\">New Annotation Task</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Project {{vm.currentProject.name}} ({{ vm.projectId }}) Task Table\" ba-panel-class=\"with-scroll\"><button class=\"btn btn-primary filter-demo-tasks-button\" ng-click=\"vm.search([{\'key\':\'project\',\'value\':vm.projectId},{\'key\':\'is_demo\',\'value\':true}])\">Demo Tasks Only</button><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/projects/projects.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\" permission=\"\" permission-only=\"[\'ADMIN\',\'PROJECT_MANAGER\']\">Create New Project</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Projects Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/reg/reg.html","<main class=\"auth-main\"><div class=\"auth-block\"><h1>Sign up to UCCA App</h1><a ui-sref=\"auth\" class=\"auth-link\">Already have a UCCA App account? Sign in!</a><form class=\"form-horizontal\"><div class=\"form-group\"><label for=\"inputEmail3\" class=\"col-sm-12 control-label\">Email :</label><div class=\"col-sm-12\"><input type=\"email\" class=\"form-control\" id=\"inputEmail3\" placeholder=\"Email\" ng-model=\"vm.GuestUserDetailes.email\"></div></div><div class=\"form-group\"><label for=\"inputFisrtName3\" class=\"col-sm-12 control-label\">First Name :</label><div class=\"col-sm-12\"><input type=\"text\" class=\"form-control\" id=\"inputFisrtName3\" placeholder=\"First name\" ng-model=\"vm.GuestUserDetailes.first_name\"></div></div><div class=\"form-group\"><label for=\"inputLastName3\" class=\"col-sm-12 control-label\">Last Name :</label><div class=\"col-sm-12\"><input type=\"text\" class=\"form-control\" id=\"inputLastName3\" placeholder=\"Last Name\" ng-model=\"vm.GuestUserDetailes.last_name\"></div></div><div class=\"form-group\"><label for=\"inputAfflliation3\" class=\"col-sm-12 control-label\">Affiliation :</label><div class=\"col-sm-12\"><input type=\"text\" class=\"form-control\" id=\"inputAfflliation3\" placeholder=\"Affiliation\" ng-model=\"vm.GuestUserDetailes.affiliation\"></div></div><div class=\"form-group\"><label for=\"inputOrganization3\" class=\"col-sm-12 control-label\">Organization :</label><div class=\"col-sm-12\"><input type=\"text\" class=\"form-control\" id=\"inputOrganization3\" placeholder=\"Organization\" ng-model=\"vm.GuestUserDetailes.organization\"></div></div><div class=\"form-group\"><div class=\"col-sm-12 sign-up-btn-container\"><button type=\"submit\" class=\"btn btn-default btn-auth\" ng-click=\"vm.register();\">Sign up</button></div></div></form><div class=\"auth-sep\"><span><span>or Sign up with one click</span></span></div><div class=\"al-share-auth\"><ul class=\"al-share clearfix\"><li><i class=\"socicon socicon-facebook\" title=\"Share on Facebook\"></i></li><li><i class=\"socicon socicon-twitter\" title=\"Share on Twitter\"></i></li><li><i class=\"socicon socicon-google\" title=\"Share on Google Plus\"></i></li></ul></div></div></main>");
$templateCache.put("app/pages/sources/sources.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New source</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Sources Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/tasks/tasks.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Tasks Table\" ba-panel-class=\"with-scroll\"><button class=\"btn btn-primary filter-demo-tasks-button\" ng-click=\"vm.search([{\'key\':\'project\',\'value\':vm.projectId},{\'key\':\'is_demo\',\'value\':true}])\">Demo Tasks Only</button><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/tokenization/tokenization-page.html","<div class=\"tokenization-page row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"\" ba-panel-class=\"medium-large-panel light-text\"><div class=\"panel-heading clearfix tokenization-panel-header\"><div class=\"button-container\"><button type=\"button\" class=\"btn btn-default btn-raised\" ng-click=\"vm.submitTask()\">Submit</button> <button type=\"button\" class=\"btn btn-default btn-raised\" ng-click=\"vm.saveChanges()\">Save</button> <button type=\"button\" class=\"btn btn-default btn-raised\" ng-click=\"vm.initText()\">Discard</button></div></div><div ucca-tokenizer=\"\" passage-text=\"vm.passageText\" tokenized-text=\"vm.tokenizedText\" text-tokens=\"vm.textTokens\" class=\"panel-body text-container\"><div highlight-original-token=\"\" original-text=\"vm.originalText\" saved-tokens=\"vm.textTokens\" placeholder=\"Default Input\" class=\"large-panel form-control tokenization-text\" id=\"textarea-tokenizer\" contenteditable=\"true\" restrict-keys-tokenizer=\"\">{{vm.tokenizedText}}</div></div></div><div class=\"col-xs-6 panel-body\"><h5>textTokens json</h5><h6>Models of tokens</h6><div>The model is created by the gui and it is duplicating the python code. The property of require_annotation will be added by the python code upon saving since js can\'t handle it well.</div><pre>{{vm.textTokens | json}}</pre></div><div class=\"col-xs-6 panel-body\"><h5>Sent</h5><h6>Object of task</h6><div>This model represent the task object that is sent to the server.</div><pre>{{vm.tokenizationTask | json}}</pre></div></div></div>");
$templateCache.put("app/pages/tokenization-v2/tokenization-page.html","<div class=\"tokenization-page row\"><div class=\"col-md-12\"><div class=\"medium-large-panel light-text\"><div class=\"panel medium-large-panel light-text animated zoomIn\"><div class=\"panel-heading clearfix tokenization-panel-header\"><div class=\"button-container\"><button type=\"button\" class=\"btn btn-default btn-raised\" ng-click=\"submitTask()\">Submit</button> <button type=\"button\" class=\"btn btn-default btn-raised\" ng-click=\"saveChanges()\">Save</button></div></div><textarea autofocus=\"\" class=\"panel-body text-container-v2\" ng-model=\"tokenizedText\" tokenizer-behaviour=\"\"></textarea></div></div><br><div class=\"col-xs-6 hidden\"><div class=\"well\"><span class=\"label label-info\">Original Text:</span> {{originalText}}</div><div class=\"panel panel-default\"><div class=\"panel-heading\">Saved tokens</div><div class=\"panel-body\"><pre>{{savedTokens | json}}</pre></div></div></div><div class=\"col-xs-6 hidden\"><h3>A view of the original char map just for testing</h3><div ng-repeat=\"char in originalText track by $index\">{{$index}} :: {{char}}</div></div></div></div>");
$templateCache.put("app/pages/users/users.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div class=\"add-asset-btn-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\" permission=\"\" permission-only=\"[\'ADMIN\']\">Add New User</button></div><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Users Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/annotation/templates/categoryInfo.html","<div class=\"modal-content category-info\"><div class=\"modal-header bg-info\"><i class=\"ion-flame modal-icon\"></i><span>{{name}}</span></div><div class=\"modal-body\"><div ng-bind-html=\"description\"></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-info\" ng-click=\"$dismiss()\">OK</button></div></div>");
$templateCache.put("app/pages/annotation/templates/commentOnUnitModal.html","<div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-label=\"Close\"><em class=\"ion-ios-close-empty sn-link-close\"></em></button><h4 class=\"modal-title\">Please add a comment</h4></div><div class=\"row modal-body unit-comment\"><textarea class=\"col-xs-12 unit-comment-text\" ng-model=\"comment\"></textarea></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"saveComment();$dismiss()\">Save changes</button></div></div>");
$templateCache.put("app/pages/annotation/templates/deleteAllRemoteModal.html","<div class=\"modal-content\"><div class=\"modal-header bg-danger\"><i class=\"ion-flame modal-icon\"></i><span>Error</span></div><div class=\"modal-body text-center\">This unit appears {{message}} times as a remote unit, by deleting this unit, all remote instance of this unit will be deleted.</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-danger\" ng-click=\"$dismiss();deleteAllRemoteInstanceOfThisUnit();\">OK</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"$dismiss()\">Abort</button></div></div>");
$templateCache.put("app/pages/annotation/templates/errorModal.html","<div class=\"modal-content\"><div class=\"modal-header bg-danger\"><i class=\"ion-flame modal-icon\"></i><span>Error</span></div><div class=\"modal-body text-center\">{{message}}</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-danger\" ng-click=\"$dismiss()\">OK</button></div></div>");
$templateCache.put("app/pages/edit/categories/edit.categories.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/layers/select.hotkey.modal.html","<div class=\"modal-content\" id=\"set-category-hot-key\"><div class=\"modal-header bg-info\"><i class=\"ion-information-circled modal-icon\"></i> <span>Please enter a HotKey to the selected category</span></div><div class=\"modal-body text-center\">Every selected category must have an HotKey</div><div class=\"form-group row clearfix\"><div class=\"col-sm-12\"><input type=\"text\" class=\"form-control\" id=\"inputHotKey\" focus-me=\"\" placeholder=\"\" value=\"\" ng-model=\"categoryHotKey\"></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-info\" ng-click=\"save()\">{{!!categoryHotKey ? \'Ok\' : \'Continue without hotkey\'}}</button> <button type=\"button\" class=\"btn btn-info\" ng-click=\"$dismiss()\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/passages/edit.passages.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/edit/sources/edit.sources.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/tasks/edit.tasks.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/projects/edit.projects.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/users/edit.users.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/form/inputs/inputs.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Standard Fields\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/standardFields.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Tags Input\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/tagsInput/tagsInput.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Input Groups\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/inputGroups.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Checkboxes & Radios\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/checkboxesRadios.html\'\"></div></div></div><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Validation States\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/validationStates.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Selects\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/select/select.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"On/Off Switches\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/inputs/widgets/switch/switch.html\'\"></div></div></div></div></div>");
$templateCache.put("app/pages/form/layouts/layouts.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\" ba-panel-title=\"Inline Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/inlineForm.html\'\"></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Basic Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/basicForm.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Horizontal Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/horizontalForm.html\'\"></div></div></div><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Form Without Labels\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/formWithoutLabels.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Block Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/blockForm.html\'\"></div></div></div></div></div>");
$templateCache.put("app/pages/form/wizard/wizard.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Form Wizard\" ba-panel-class=\"with-scroll\"><ba-wizard><ba-wizard-step title=\"Personal info\" form=\"vm.personalInfoForm\"><form name=\"vm.personalInfoForm\" novalidate=\"\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group has-feedback\" ng-class=\"{\'has-error\': vm.personalInfoForm.username.$invalid && (vm.personalInfoForm.username.$dirty || vm.personalInfoForm.$submitted)}\"><label for=\"exampleUsername1\">Username</label> <input type=\"text\" class=\"form-control\" id=\"exampleUsername1\" name=\"username\" placeholder=\"Username\" ng-model=\"vm.personalInfo.username\" required=\"\"> <span class=\"help-block error-block basic-block\">Required</span></div><div class=\"form-group\" ng-class=\"{\'has-error\': vm.personalInfoForm.email.$invalid && (vm.personalInfoForm.email.$dirty || vm.personalInfoForm.$submitted)}\"><label for=\"exampleInputEmail1\">Email address</label> <input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" name=\"email\" placeholder=\"Email\" ng-model=\"vm.personalInfo.email\" required=\"\"> <span class=\"help-block error-block basic-block\">Proper email required</span></div></div><div class=\"col-md-6\"><div class=\"form-group\" ng-class=\"{\'has-error\': vm.personalInfoForm.password.$invalid && (vm.personalInfoForm.password.$dirty || vm.personalInfoForm.$submitted)}\"><label for=\"exampleInputPassword1\">Password</label> <input type=\"password\" class=\"form-control\" id=\"exampleInputPassword1\" name=\"password\" placeholder=\"Password\" ng-model=\"vm.personalInfo.password\" required=\"\"> <span class=\"help-block error-block basic-block\">Required</span></div><div class=\"form-group\" ng-class=\"{\'has-error\': !vm.arePersonalInfoPasswordsEqual() && (vm.personalInfoForm.confirmPassword.$dirty || vm.personalInfoForm.$submitted)}\"><label for=\"exampleInputConfirmPassword1\">Confirm Password</label> <input type=\"password\" class=\"form-control\" id=\"exampleInputConfirmPassword1\" name=\"confirmPassword\" placeholder=\"Confirm Password\" ng-model=\"vm.personalInfo.confirmPassword\" required=\"\"> <span class=\"help-block error-block basic-block\">Passwords should match</span></div></div></div></form></ba-wizard-step><ba-wizard-step title=\"Product Info\" form=\"vm.productInfoForm\"><form name=\"vm.productInfoForm\" novalidate=\"\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group has-feedback\" ng-class=\"{\'has-error\': vm.productInfoForm.productName.$invalid && (vm.productInfoForm.productName.$dirty || vm.productInfoForm.$submitted)}\"><label for=\"productName\">Product name</label> <input type=\"text\" class=\"form-control\" id=\"productName\" name=\"productName\" placeholder=\"Product name\" ng-model=\"vm.productInfo.productName\" required=\"\"> <span class=\"help-block error-block basic-block\">Required</span></div><div class=\"form-group\" ng-class=\"{\'has-error\': vm.productInfoForm.productId.$invalid && (vm.productInfoForm.productId.$dirty || vm.productInfoForm.$submitted)}\"><label for=\"productId\">Product id</label> <input type=\"text\" class=\"form-control\" id=\"productId\" name=\"productId\" placeholder=\"productId\" ng-model=\"vm.productInfo.productId\" required=\"\"> <span class=\"help-block error-block basic-block\">Required</span></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label for=\"productName\">Category</label><select class=\"form-control\" title=\"Category\" selectpicker=\"\"><option selected=\"\">Electronics</option><option>Toys</option><option>Accessories</option></select></div></div></div></form></ba-wizard-step><ba-wizard-step title=\"Shipment\" form=\"vm.addressForm\"><form name=\"vm.addressForm\" novalidate=\"\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group has-feedback\" ng-class=\"{\'has-error\': vm.addressForm.address.$invalid && (vm.addressForm.address.$dirty || vm.addressForm.$submitted)}\"><label for=\"productName\">Shipment address</label> <input type=\"text\" class=\"form-control\" id=\"address\" name=\"address\" placeholder=\"Shipment address\" ng-model=\"vm.shipment.address\" required=\"\"> <span class=\"help-block error-block basic-block\">Required</span></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label for=\"productName\">Shipment method</label><select class=\"form-control\" title=\"Category\" selectpicker=\"\"><option selected=\"\">Fast & expensive</option><option>Cheap & free</option></select></div></div></div><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\"> <span>Save shipment info</span></label></div></form></ba-wizard-step><ba-wizard-step title=\"Finish\"><form class=\"form-horizontal\" name=\"vm.finishForm\" novalidate=\"\">Congratulations! You have successfully filled the form!</form></ba-wizard-step></ba-wizard></div></div></div></div>");
$templateCache.put("app/pages/maps/google-maps/google-maps.html","<div ba-panel=\"\" ba-panel-title=\"Google Maps\" class=\"viewport100\"><div id=\"google-maps\"></div></div>");
$templateCache.put("app/pages/maps/leaflet/leaflet.html","<div ba-panel=\"\" ba-panel-title=\"Leaflet\" class=\"viewport100\"><div id=\"leaflet-map\"></div></div>");
$templateCache.put("app/pages/maps/map-bubbles/map-bubbles.html","<div ba-panel=\"\" ba-panel-title=\"Map with Bubbles\" class=\"viewport100\"><div id=\"map-bubbles\"></div></div>");
$templateCache.put("app/pages/maps/map-lines/map-lines.html","<div ba-panel=\"\" ba-panel-title=\"Line Map\" class=\"viewport100\"><div id=\"map-lines\"></div></div>");
$templateCache.put("app/pages/tables/basic/tables.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-lg-6 col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Hover Rows\" ba-panel-class=\"with-scroll table-panel\"><div include-with-scope=\"app/pages/tables/widgets/hoverRows.html\"></div></div></div><div class=\"col-lg-6 col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Bordered Table\" ba-panel-class=\"with-scroll table-panel\"><div include-with-scope=\"app/pages/tables/widgets/borderedTable.html\"></div></div></div></div><div class=\"row\"><div class=\"col-lg-6 col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Condensed Table\" ba-panel-class=\"with-scroll table-panel\"><div include-with-scope=\"app/pages/tables/widgets/condensedTable.html\"></div></div></div><div class=\"col-lg-6 col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Striped Rows\" ba-panel-class=\"with-scroll table-panel\"><div include-with-scope=\"app/pages/tables/widgets/stripedRows.html\"></div></div></div></div><div class=\"row\"><div class=\"col-lg-6 col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Contextual Table\" ba-panel-class=\"with-scroll table-panel\"><div include-with-scope=\"app/pages/tables/widgets/contextualTable.html\"></div></div></div><div class=\"col-lg-6 col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Responsive Table\" ba-panel-class=\"with-scroll table-panel\"><div include-with-scope=\"app/pages/tables/widgets/responsiveTable.html\"></div></div></div></div></div>");
$templateCache.put("app/pages/tables/widgets/basicTable.html","<div class=\"horizontal-scroll\"><table class=\"table\"><thead><tr><th class=\"browser-icons\"></th><th>Browser</th><th class=\"align-right\">Visits</th><th class=\"table-arr\"></th><th class=\"align-right\">Downloads</th><th class=\"table-arr\"></th><th class=\"align-right\">Purchases</th><th class=\"table-arr\"></th><th class=\"align-right\">DAU</th><th class=\"table-arr\"></th><th class=\"align-right\">MAU</th><th class=\"table-arr\"></th><th class=\"align-right\">LTV</th><th class=\"table-arr\"></th><th class=\"align-right\">Users %</th><th class=\"table-arr\"></th></tr></thead><tbody><tr><td><img src=\"img/chrome.svg\" width=\"20\" height=\"20\"></td><td class=\"nowrap\">Google Chrome</td><td class=\"align-right\">10,392</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">3,822</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">4,214</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">899</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">7,098</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">178</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">45%</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td></tr><tr><td><img src=\"img/firefox.svg\" width=\"20\" height=\"20\"></td><td class=\"nowrap\">Mozilla Firefox</td><td class=\"align-right\">7,873</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">6,003</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">3,031</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">897</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">8,997</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">102</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">28%</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td></tr><tr><td><img src=\"img/ie.svg\" width=\"20\" height=\"20\"></td><td class=\"nowrap\">Internet Explorer</td><td class=\"align-right\">5,890</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">3,492</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">2,102</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">27</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">4,039</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">99</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">17%</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td></tr><tr><td><img src=\"img/safari.svg\" width=\"20\" height=\"20\"></td><td class=\"nowrap\">Safari</td><td class=\"align-right\">4,001</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">2,039</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">1,001</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">104</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">3,983</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">209</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">14%</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td></tr><tr><td><img src=\"img/opera.svg\" width=\"20\" height=\"20\"></td><td class=\"nowrap\">Opera</td><td class=\"align-right\">1,833</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">983</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">83</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">19</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">1,099</td><td class=\"table-arr\"><i class=\"icon-down\"></i></td><td class=\"align-right\">103</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td><td class=\"align-right\">5%</td><td class=\"table-arr\"><i class=\"icon-up\"></i></td></tr></tbody></table></div>");
$templateCache.put("app/pages/tables/widgets/borderedTable.html","<div class=\"horizontal-scroll\"><table class=\"table table-bordered\"><thead><tr><th class=\"browser-icons\"></th><th>Browser</th><th class=\"align-right\">Visits</th><th class=\"align-right\">Purchases</th><th class=\"align-right\">%</th></tr></thead><tbody><tr ng-repeat=\"item in metricsTableData\"><td><img ng-src=\"{{::( item.image | appImage )}}\" width=\"20\" height=\"20\"></td><td ng-class=\"nowrap\">{{item.browser}}</td><td class=\"align-right\">{{item.visits}}</td><td class=\"align-right\">{{item.purchases}}</td><td class=\"align-right\">{{item.percent}}</td></tr></tbody></table></div>");
$templateCache.put("app/pages/tables/widgets/condensedTable.html","<div class=\"horizontal-scroll\"><table class=\"table table-condensed\"><thead><tr><th class=\"table-id\">#</th><th>First Name</th><th>Last Name</th><th>Username</th><th>Email</th><th>Status</th></tr></thead><tbody><tr ng-repeat=\"item in peopleTableData\"><td class=\"table-id\">{{item.id}}</td><td>{{item.firstName}}</td><td>{{item.lastName}}</td><td>{{item.username}}</td><td><a class=\"email-link\" ng-href=\"mailto:{{item.email}}\">{{item.email}}</a></td><td><button class=\"status-button btn btn-xs btn-{{item.status}}\">{{item.status}}</button></td></tr></tbody></table></div>");
$templateCache.put("app/pages/tables/widgets/contextualTable.html","<table class=\"table\"><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Username</th><th>Email</th><th>Age</th></tr><tr class=\"primary\"><td>1</td><td>Mark</td><td>Otto</td><td>@mdo</td><td><a class=\"email-link\" ng-href=\"mailto:mdo@gmail.com\" href=\"mailto:mdo@gmail.com\">mdo@gmail.com</a></td><td>28</td></tr><tr class=\"success\"><td>2</td><td>Jacob</td><td>Thornton</td><td>@fat</td><td><a class=\"email-link\" ng-href=\"mailto:fat@yandex.ru\" href=\"mailto:fat@yandex.ru\">fat@yandex.ru</a></td><td>45</td></tr><tr class=\"warning\"><td>3</td><td>Larry</td><td>Bird</td><td>@twitter</td><td><a class=\"email-link\" ng-href=\"mailto:twitter@outlook.com\" href=\"mailto:twitter@outlook.com\">twitter@outlook.com</a></td><td>18</td></tr><tr class=\"danger\"><td>4</td><td>John</td><td>Snow</td><td>@snow</td><td><a class=\"email-link\" ng-href=\"mailto:snow@gmail.com\" href=\"mailto:snow@gmail.com\">snow@gmail.com</a></td><td>20</td></tr><tr class=\"info\"><td>5</td><td>Jack</td><td>Sparrow</td><td>@jack</td><td><a class=\"email-link\" ng-href=\"mailto:jack@yandex.ru\" href=\"mailto:jack@yandex.ru\">jack@yandex.ru</a></td><td>30</td></tr></table>");
$templateCache.put("app/pages/tables/widgets/editableRowTable.html","<div class=\"add-row-editable-table\"><button class=\"btn btn-primary\" ng-click=\"addUser()\">Add row</button></div><table class=\"table table-bordered table-hover table-condensed\"><tr><td></td><td>Name</td><td>Status</td><td>Group</td><td>Actions</td></tr><tr ng-repeat=\"user in users\" class=\"editable-row\"><td>{{$index}}</td><td><span editable-text=\"user.name\" e-name=\"name\" e-form=\"rowform\" e-required=\"\">{{ user.name || \'empty\' }}</span></td><td class=\"select-td\"><span editable-select=\"user.status\" e-name=\"status\" e-form=\"rowform\" e-selectpicker=\"\" e-ng-options=\"s.value as s.text for s in statuses\">{{ showStatus(user) }}</span></td><td class=\"select-td\"><span editable-select=\"user.group\" e-name=\"group\" onshow=\"loadGroups()\" e-form=\"rowform\" e-selectpicker=\"\" e-ng-options=\"g.id as g.text for g in groups\">{{ showGroup(user) }}</span></td><td><form editable-form=\"\" name=\"rowform\" ng-show=\"rowform.$visible\" class=\"form-buttons form-inline\" shown=\"inserted == user\"><button type=\"submit\" ng-disabled=\"rowform.$waiting\" class=\"btn btn-primary editable-table-button btn-xs\">Save</button> <button type=\"button\" ng-disabled=\"rowform.$waiting\" ng-click=\"rowform.$cancel()\" class=\"btn btn-default editable-table-button btn-xs\">Cancel</button></form><div class=\"buttons\" ng-show=\"!rowform.$visible\"><button class=\"btn btn-primary editable-table-button btn-xs\" ng-click=\"rowform.$show()\">Edit</button> <button class=\"btn btn-danger editable-table-button btn-xs\" ng-click=\"removeUser($index)\">Delete</button></div></td></tr></table>");
$templateCache.put("app/pages/tables/widgets/editableTable.html","<div class=\"horizontal-scroll\"><table class=\"table table-hover\" st-table=\"editableTableData\"><thead><tr class=\"sortable\"><th class=\"table-id\" st-sort=\"id\" st-sort-default=\"true\">#</th><th st-sort=\"firstName\">First Name</th><th st-sort=\"lastName\">Last Name</th><th st-sort=\"username\">Username</th><th st-sort=\"email\">Email</th><th st-sort=\"age\">Age</th></tr></thead><tbody><tr ng-repeat=\"item in editableTableData\" class=\"editable-tr-wrap\"><td class=\"table-id\">{{item.id}}</td><td><span editable-text=\"item.firstName\" z=\"cancel\">{{item.firstName}}</span></td><td><span editable-text=\"item.lastName\" z=\"cancel\">{{item.lastName}}</span></td><td><span editable-text=\"item.username\" z=\"cancel\">{{item.username}}</span></td><td><a class=\"email-link\" ng-href=\"mailto:{{item.email}}\">{{item.email}}</a></td><td><span editable-text=\"item.age\" z=\"cancel\">{{item.age}}</span></td></tr></tbody><tfoot><tr><td colspan=\"6\" class=\"text-center\"><div st-pagination=\"\" st-items-by-page=\"12\" st-displayed-pages=\"5\"></div></td></tr></tfoot></table></div>");
$templateCache.put("app/pages/tables/widgets/hoverRows.html","<div class=\"horizontal-scroll\"><table class=\"table table-hover\"><thead><tr class=\"black-muted-bg\"><th class=\"browser-icons\"></th><th>Browser</th><th class=\"align-right\">Visits</th><th class=\"table-arr\"></th><th class=\"align-right\">Purchases</th><th class=\"table-arr\"></th><th class=\"align-right\">%</th><th class=\"table-arr\"></th></tr></thead><tbody><tr ng-repeat=\"item in metricsTableData\" class=\"no-top-border\"><td><img ng-src=\"{{::( item.image | appImage )}}\" width=\"20\" height=\"20\"></td><td ng-class=\"nowrap\">{{item.browser}}</td><td class=\"align-right\">{{item.visits}}</td><td class=\"table-arr\"><i ng-class=\"{\'icon-up\': item.isVisitsUp, \'icon-down\': !item.isVisitsUp }\"></i></td><td class=\"align-right\">{{item.purchases}}</td><td class=\"table-arr\"><i ng-class=\"{\'icon-up\': item.isPurchasesUp, \'icon-down\': !item.isPurchasesUp }\"></i></td><td class=\"align-right\">{{item.percent}}</td><td class=\"table-arr\"><i ng-class=\"{\'icon-up\': item.isPercentUp, \'icon-down\': !item.isPercentUp }\"></i></td></tr></tbody></table></div>");
$templateCache.put("app/pages/tables/widgets/pagination.custom.html","<nav ng-if=\"numPages && pages.length >= 2\"><ul class=\"pagination no-user-selection\"><li><a ng-click=\"selectPage(currentPage - 1)\" data-ng-show=\"currentPage!=1\">&lt;</a></li><li ng-repeat=\"page in pages\" ng-class=\"{active: page==currentPage}\"><a href=\"javascript: void(0);\" ng-click=\"selectPage(page)\">{{page}}</a></li><li><a ng-click=\"$parent.$parent.vm.goNext(currentPage)\">&gt;</a></li></ul></nav>");
$templateCache.put("app/pages/tables/widgets/responsiveTable.html","<div class=\"table-responsive\"><table class=\"table\"><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Username</th><th>Email</th><th>Age</th></tr><tr><td>1</td><td>Mark</td><td>Otto</td><td>@mdo</td><td><a class=\"email-link\" ng-href=\"mailto:mdo@gmail.com\" href=\"mailto:mdo@gmail.com\">mdo@gmail.com</a></td><td>28</td></tr><tr><td>2</td><td>Jacob</td><td>Thornton</td><td>@fat</td><td><a class=\"email-link\" ng-href=\"mailto:fat@yandex.ru\" href=\"mailto:fat@yandex.ru\">fat@yandex.ru</a></td><td>45</td></tr><tr><td>3</td><td>Larry</td><td>Bird</td><td>@twitter</td><td><a class=\"email-link\" ng-href=\"mailto:twitter@outlook.com\" href=\"mailto:twitter@outlook.com\">twitter@outlook.com</a></td><td>18</td></tr><tr><td>4</td><td>John</td><td>Snow</td><td>@snow</td><td><a class=\"email-link\" ng-href=\"mailto:snow@gmail.com\" href=\"mailto:snow@gmail.com\">snow@gmail.com</a></td><td>20</td></tr><tr><td>5</td><td>Jack</td><td>Sparrow</td><td>@jack</td><td><a class=\"email-link\" ng-href=\"mailto:jack@yandex.ru\" href=\"mailto:jack@yandex.ru\">jack@yandex.ru</a></td><td>30</td></tr></table></div>");
$templateCache.put("app/pages/tables/widgets/smartInnerTable.html","<div><div class=\"manage-button-container\"><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.manage({})\" ng-if=\"::(viewOnly != true && vm.viewOnlyRuleOk()===false)\">Choose</button></div><div ba-panel=\"\" ba-panel-title=\"Selected {{pageName}}\" ba-panel-class=\"with-scroll\"><div class=\"horizontal-scroll\"><table class=\"table\" st-table=\"vm.smartTableData\" ng-class=\"{\'table-striped\': viewOnly == true}\"><thead><tr ng-if=\"!isSortable\" class=\"sortable\"><th st-sort=\"{{header.key}}\" ng-repeat=\"header in vm.smartTableStructure track by $index\" ng-if=\"header.showInTable\">{{::header.name}}</th></tr><tr ng-if=\"isSortable\" class=\"\"><th ng-repeat=\"header in vm.smartTableStructure track by $index\" ng-if=\"header.showInTable\">{{::header.name}}</th></tr></thead><tbody ui-sortable=\"\" is-sortable=\"isSortable\" ng-model=\"vm.smartTableData\"><tr ng-model=\"vm.smartTableData\" ng-repeat=\"itemRow in vm.smartTableData\"><td ng-repeat=\"(key,value) in vm.smartTableStructure track by $index\" language-align=\"{{::itemRow[value[\'key\']]}}\" ng-class=\"{\'table-id\':$index==0,\'table-object\':itemRow[value[\'key\']].name}\" ng-click=\"!!itemRow[value[\'key\']].name && vm.runFunction(\'showMore\',itemRow[value[\'key\']]);\" ng-if=\"value.showInTable && value.key != \'actions\'\">{{::vm.runFunction(\'parseSmartTableColumnData\',itemRow,value)}}</td><td ng-if=\"vm.smartTableStructure[vm.smartTableStructure.length-1].buttons\"><span data-ng-switch=\"\" on=\"vm.smartTableStructure[vm.smartTableStructure.length-1].buttons.length<4\"><span data-ng-switch-when=\"true\"><input ng-repeat=\"action in vm.smartTableStructure[vm.smartTableStructure.length-1].buttons track by $index\" bs-switch=\"\" ng-if=\"action.showAs == \'switch\'\" ng-model=\"itemRow.selected\" switch-size=\"mini\" ng-change=\"vm.toggleItem(itemRow,itemRow.selected)\" type=\"checkbox\"> <button ng-if=\"::(!action.showAs && vm.viewOnlyRuleOk()===false)\" ng-repeat=\"action in vm.smartTableStructure[vm.smartTableStructure.length-1].buttons track by $index\" class=\"btn editable-table-button btn-xs {{action.class}}\" ng-click=\"vm.runFunction(action.functionName,itemRow,$parent.$parent.$index);\">{{::action.name}}</button></span><div data-ng-switch-when=\"false\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-primary\">Actions</button> <button type=\"button\" class=\"btn btn-primary\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\" ng-repeat=\"action in vm.smartTableStructure[vm.smartTableStructure.length-1].buttons track by $index\" ng-click=\"vm.runFunction(action.functionName,itemRow,$parent.$index)\">{{::action.name}}</a></li></ul></div></div></span></td></tr></tbody></table></div></div></div>");
$templateCache.put("app/pages/tables/widgets/smartTable.html","<div class=\"horizontal-scroll\"><div class=\"form-group select-page-size-wrap\"><label><select class=\"form-control selectpicker show-tick\" title=\"Rows on page\" selectpicker=\"\" ng-model=\"vm.smartTablePageSize\" ng-options=\"i for i in [5,10,15,20,25]\"></select></label></div><span class=\"total-results\" ng-if=\"vm.$totalResults\">Total Results: {{vm.$totalResults}}<sup ng-if=\"vm.smartTableDataSafe.length < vm.$totalResults\" title=\"There is more than 100 assets\">*</sup></span><table class=\"table\" st-table=\"vm.smartTableData\" st-safe-src=\"vm.smartTableDataSafe\"><thead><tr class=\"sortable\"><th st-sort=\"{{header.key}}\" ng-repeat=\"header in vm.smartTableStructure track by $index\" ng-if=\"header.showInTable\">{{::header.name}}</th></tr><tr><th ng-repeat=\"header in vm.smartTableStructure\" ng-if=\"header.filter\"><input st-search=\"{{header.key}}\" placeholder=\"{{header.name}}\" class=\"input-sm form-control search-input\" type=\"search\"></th></tr></thead><tbody><tr ng-repeat=\"itemRow in vm.smartTableData\" id=\"smart-table-row-{{$index}}\" ng-class=\"{\'selected\': itemRow.selected}\"><td ng-repeat=\"(key,value) in vm.smartTableStructure track by $index\" html-string-to-content=\"\" elem-value=\"itemRow[value[\'key\']]\" language-align=\"{{::itemRow[value[\'key\']]}}\" ng-class=\"{\'table-id\':$index==0,\'table-object\': (!!itemRow[value[\'key\']].name || !!itemRow[value[\'key\']][0].name || !!itemRow[value[\'key\']].id || !!itemRow[value[\'key\']][0].id) }\" ng-click=\"(!!itemRow[value[\'key\']].name || !!itemRow[value[\'key\']][0].name || !!itemRow[value[\'key\']].id || !!itemRow[value[\'key\']][0].id) && vm.showMore(itemRow[value[\'key\']]);\" ng-if=\"value.showInTable && value.key != \'actions\'\">{{::vm.parseSmartTableColumnData(itemRow,value)}}</td><td ng-if=\"vm.smartTableStructure[vm.smartTableStructure.length-1].buttons\"><span data-ng-switch=\"\" on=\"vm.smartTableStructure[vm.smartTableStructure.length-1].buttons.length<3\"><button data-ng-switch-when=\"true\" ng-repeat=\"action in vm.smartTableStructure[vm.smartTableStructure.length-1].buttons track by $index\" class=\"btn editable-table-button btn-xs {{action.class}}\" ng-show=\"::vm.smartTableCanUseAction(action.functionName,action.roles,itemRow.type,action.types,{\'status\':itemRow.status,\'accepteds\':action.statuses})\" ng-click=\"vm[action.functionName](itemRow,$parent.$index)\">{{::action.name}}</button><div data-ng-switch-when=\"false\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-primary\">Actions</button> <button type=\"button\" class=\"btn btn-primary\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\" ng-repeat=\"action in vm.smartTableStructure[vm.smartTableStructure.length-1].buttons track by $index\" ng-show=\"::vm.smartTableCanUseAction(action.functionName,action.roles,itemRow.type,action.types,{\'status\':itemRow.status,\'accepteds\':action.statuses})\" ng-click=\"vm[action.functionName](itemRow,$parent.$index)\">{{::action.name}}</a></li></ul></div></div></span></td></tr></tbody><tfoot><tr><td colspan=\"13\" class=\"text-center\"><div st-pagination=\"\" st-items-by-page=\"vm.smartTablePageSize\" st-displayed-pages=\"5\" st-template=\"app/pages/tables/widgets/pagination.custom.html\"></div></td></tr></tfoot></table></div>");
$templateCache.put("app/pages/tables/widgets/stripedRows.html","<div class=\"vertical-scroll\"><table class=\"table table-striped\"><thead><tr><th class=\"table-id\">#</th><th>First Name</th><th>Last Name</th><th>Username</th><th>Email</th><th>Age</th></tr></thead><tbody><tr ng-repeat=\"item in smartTableData\"><td class=\"table-id\">{{item.id}}</td><td>{{item.firstName}}</td><td>{{item.lastName}}</td><td>{{item.username}}</td><td><a class=\"email-link\" ng-href=\"mailto:{{item.email}}\">{{item.email}}</a></td><td>{{item.age}}</td></tr></tbody></table></div>");
$templateCache.put("app/pages/tables/smart/tables.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Editable Rows\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/editableRowTable.html\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Editable Cells\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/editableTable.html\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Smart Table With Filtering, Sorting And Pagination\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div></div>");
$templateCache.put("app/pages/ui/alerts/alerts.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\" ba-panel-title=\"Basic\" ba-panel-class=\"with-scroll\"><div><div class=\"alert bg-success\"><strong>Well done!</strong> You successfully read this important alert message.</div><div class=\"alert bg-info\"><strong>Heads up!</strong> This alert needs your attention, but it\'s not super important.</div><div class=\"alert bg-warning\"><strong>Warning!</strong> Better check yourself, you\'re not looking too good.</div><div class=\"alert bg-danger\"><strong>Oh snap!</strong> Change a few things up and try submitting again.</div></div></div><div class=\"col-md-6\" ba-panel=\"\" ba-panel-title=\"Dismissible alerts\" ba-panel-class=\"with-scroll\"><div><div class=\"alert bg-success closeable\" role=\"alert\"><button type=\"button\" class=\"close\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <strong>Well done!</strong> You successfully read this important alert message.</div><div class=\"alert bg-info closeable\" role=\"alert\"><button type=\"button\" class=\"close\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <strong>Heads up!</strong> This alert needs your attention, but it\'s not super important.</div><div class=\"alert bg-warning closeable\" role=\"alert\"><button type=\"button\" class=\"close\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <strong>Warning!</strong> Better check yourself, you\'re not looking too good.</div><div class=\"alert bg-danger closeable\" role=\"alert\"><button type=\"button\" class=\"close\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <strong>Oh snap!</strong> Change a few things up and try submitting again.</div></div></div></div><div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\" ba-panel-title=\"Links in alerts\" ba-panel-class=\"with-scroll\"><div><div class=\"alert bg-success\"><strong>Well done!</strong> You successfully read <a href=\"\" class=\"alert-link\">this important alert message</a>.</div><div class=\"alert bg-info\"><strong>Heads up!</strong> This <a href=\"\" class=\"alert-link\">alert needs your attention</a>, but it\'s not super important.</div><div class=\"alert bg-warning\"><strong>Warning!</strong> Better check yourself, you\'re <a href=\"\" class=\"alert-link\">not looking too good</a>.</div><div class=\"alert bg-danger\"><strong>Oh snap!</strong> <a href=\"\" class=\"alert-link\">Change a few things up</a> and try submitting again.</div></div></div><div class=\"col-md-6\" ba-panel=\"\" ba-panel-title=\"Composite alerts\" ba-panel-class=\"with-scroll\"><div><div class=\"alert bg-warning\"><h4>Warning!</h4><strong>Pay attention.</strong> Change a few things up and try submitting again.<div class=\"control-alert\"><button type=\"button\" class=\"btn btn-danger\">Pay Attention</button> <button type=\"button\" class=\"btn btn-primary\">Ignore</button></div></div></div></div></div></div>");
$templateCache.put("app/pages/ui/icons/icons.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Kameleon SVG Icons\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/ui/icons/widgets/kameleon.html\"></div></div><div ba-panel=\"\" ba-panel-title=\"Socicon\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/ui/icons/widgets/socicon.html\"></div></div></div><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Icons With Rounded Background\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/ui/icons/widgets/kameleonRounded.html\"></div></div><div ba-panel=\"\" ba-panel-title=\"ionicons\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/ui/icons/widgets/ionicons.html\"></div></div><div ba-panel=\"\" ba-panel-title=\"Font Awesome Icons\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/ui/icons/widgets/fontAwesomeIcons.html\"></div></div></div></div></div>");
$templateCache.put("app/pages/ui/grid/baseGrid.html","<h4 class=\"grid-h\">Stacked to horizontal</h4><div class=\"row show-grid\"><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div><div class=\"col-md-1\"><div>.col-md-1</div></div></div><div class=\"row show-grid\"><div class=\"col-md-8\"><div>.col-md-8</div></div><div class=\"col-md-4\"><div>.col-md-4</div></div></div><div class=\"row show-grid\"><div class=\"col-md-4\"><div>.col-md-4</div></div><div class=\"col-md-4\"><div>.col-md-4</div></div><div class=\"col-md-4\"><div>.col-md-4</div></div></div><div class=\"row show-grid\"><div class=\"col-md-6\"><div>.col-md-6</div></div><div class=\"col-md-6\"><div>.col-md-6</div></div></div><h4 class=\"grid-h\">Mobile and desktop</h4><div class=\"row show-grid\"><div class=\"col-xs-12 col-md-8\"><div>xs-12 .col-md-8</div></div><div class=\"col-xs-6 col-md-4\"><div>xs-6 .col-md-4</div></div></div><div class=\"row show-grid\"><div class=\"col-xs-6 col-md-4\"><div>xs-6 .col-md-4</div></div><div class=\"col-xs-6 col-md-4\"><div>xs-6 .col-md-4</div></div><div class=\"col-xs-6 col-md-4\"><div>xs-6 .col-md-4</div></div></div><div class=\"row show-grid\"><div class=\"col-xs-6\"><div>.col-xs-6</div></div><div class=\"col-xs-6\"><div>.col-xs-6</div></div></div><h4 class=\"grid-h\">Mobile, tablet, desktop</h4><div class=\"row show-grid\"><div class=\"col-xs-12 col-sm-6 col-md-8\"><div>.col-xs-12 .col-sm-6 .col-md-8</div></div><div class=\"col-xs-6 col-md-4\"><div>.col-xs-6 .col-md-4</div></div></div><div class=\"row show-grid\"><div class=\"col-xs-6 col-sm-4\"><div>.col-xs-6 .col-sm-4</div></div><div class=\"col-xs-6 col-sm-4\"><div>.col-xs-6 .col-sm-4</div></div><div class=\"clearfix visible-xs-block\"></div><div class=\"col-xs-6 col-sm-4\"><div>.col-xs-6 .col-sm-4</div></div></div><h4 class=\"grid-h\">Column wrapping</h4><div class=\"row show-grid\"><div class=\"col-xs-9\"><div>.col-xs-9</div></div><div class=\"col-xs-4\"><div>.col-xs-4<br>Since 9 + 4 = 13 &gt; 12, this 4-column-wide div gets wrapped onto a new line as one contiguous unit.</div></div><div class=\"col-xs-6\"><div>.col-xs-6<br>Subsequent columns continue along the new line.</div></div></div><h4 class=\"grid-h\">Responsive column resets</h4><div class=\"row show-grid\"><div class=\"col-xs-6 col-sm-3\"><div>.col-xs-6 .col-sm-3<p>Resize your viewport or check it out on your phone for an example.</p></div></div><div class=\"col-xs-6 col-sm-3\"><div>.col-xs-6 .col-sm-3</div></div><div class=\"clearfix visible-xs-block\"></div><div class=\"col-xs-6 col-sm-3\"><div>.col-xs-6 .col-sm-3</div></div><div class=\"col-xs-6 col-sm-3\"><div>.col-xs-6 .col-sm-3</div></div></div><h4 class=\"grid-h\">Offsetting columns</h4><div class=\"row show-grid\"><div class=\"col-md-4\"><div>.col-md-4</div></div><div class=\"col-md-4 col-md-offset-4\"><div>.col-md-4 .col-md-offset-4</div></div></div><div class=\"row show-grid\"><div class=\"col-md-3 col-md-offset-3\"><div>.col-md-3 .col-md-offset-3</div></div><div class=\"col-md-3 col-md-offset-3\"><div>.col-md-3 .col-md-offset-3</div></div></div><div class=\"row show-grid\"><div class=\"col-md-6 col-md-offset-3\"><div>.col-md-6 .col-md-offset-3</div></div></div><h4 class=\"grid-h\">Grid options</h4><div class=\"table-responsive\"><table class=\"table table-bordered table-striped\"><thead><tr><th></th><th>Extra small devices <small>Phones (&lt;768px)</small></th><th>Small devices <small>Tablets (≥768px)</small></th><th>Medium devices <small>Desktops (≥992px)</small></th><th>Large devices <small>Desktops (≥1200px)</small></th></tr></thead><tbody><tr><th class=\"text-nowrap\" scope=\"row\">Grid behavior</th><td>Horizontal at all times</td><td colspan=\"3\">Collapsed to start, horizontal above breakpoints</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Container width</th><td>None (auto)</td><td>750px</td><td>970px</td><td>1170px</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Class prefix</th><td><code>.col-xs-</code></td><td><code>.col-sm-</code></td><td><code>.col-md-</code></td><td><code>.col-lg-</code></td></tr><tr><th class=\"text-nowrap\" scope=\"row\"># of columns</th><td colspan=\"4\">12</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Column width</th><td class=\"text-muted\">Auto</td><td>~62px</td><td>~81px</td><td>~97px</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Gutter width</th><td colspan=\"4\">30px (15px on each side of a column)</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Nestable</th><td colspan=\"4\">Yes</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Offsets</th><td colspan=\"4\">Yes</td></tr><tr><th class=\"text-nowrap\" scope=\"row\">Column ordering</th><td colspan=\"4\">Yes</td></tr></tbody></table></div>");
$templateCache.put("app/pages/ui/grid/grid.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\" ba-panel-title=\"Inline Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/grid/baseGrid.html\'\"></div></div></div></div>");
$templateCache.put("app/pages/ui/modals/modals.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\" ba-panel-title=\"Modals\" ba-panel-class=\"with-scroll\"><div class=\"modal-buttons clearfix\"><button type=\"button\" class=\"btn btn-primary\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/basicModal.html\', \'md\')\">Default modal</button> <button type=\"button\" class=\"btn btn-success\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/largeModal.html\', \'lg\')\">Large modal</button> <button type=\"button\" class=\"btn btn-warning\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/smallModal.html\', \'sm\')\">Small modal</button></div></div></div><div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\" ba-panel-title=\"Message Modals\" ba-panel-class=\"with-scroll\"><div class=\"modal-buttons same-width clearfix\"><button type=\"button\" class=\"btn btn-success\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/successModal.html\')\">Success Message</button> <button type=\"button\" class=\"btn btn-info\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/infoModal.html\')\">Info Message</button> <button type=\"button\" class=\"btn btn-warning\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/warningModal.html\')\">Warning Message</button> <button type=\"button\" class=\"btn btn-danger\" data-toggle=\"modal\" ng-click=\"open(\'app/pages/ui/modals/modalTemplates/dangerModal.html\')\">Danger Message</button></div></div><div class=\"col-md-6\" ba-panel=\"\" ba-panel-title=\"Notifications\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/modals/notifications/notifications.html\'\"></div></div></div></div>");
$templateCache.put("app/pages/ui/buttons/buttons.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-3\" ba-panel=\"\" ba-panel-title=\"Flat Buttons\" ba-panel-class=\"with-scroll button-panel\"><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-default\">Default</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-primary\">Primary</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-success\">Success</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-info\">Info</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-warning\">Warning</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-danger\">Danger</button></div></div><div class=\"col-md-3\" ba-panel=\"\" ba-panel-title=\"Raised Buttons\" ba-panel-class=\"with-scroll button-panel\"><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-default btn-raised\">Default</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-primary btn-raised\">Primary</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-success btn-raised\">Success</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-info btn-raised\">Info</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-warning btn-raised\">Warning</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-danger btn-raised\">Danger</button></div></div><div class=\"col-md-3\" ba-panel=\"\" ba-panel-title=\"Different sizes\" ba-panel-class=\"with-scroll button-panel df-size-button-panel\"><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-default btn-xs\">Default</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-primary btn-sm\">Primary</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-success btn-mm\">Success</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-info btn-md\">Info</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-warning btn-xm\">Warning</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-danger btn-lg\">Danger</button></div></div><div class=\"col-md-3\" ba-panel=\"\" ba-panel-title=\"Disabled\" ba-panel-class=\"with-scroll button-panel\"><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-default\" disabled=\"disabled\">Default</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-primary\" disabled=\"disabled\">Primary</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-success\" disabled=\"disabled\">Success</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-info\" disabled=\"disabled\">Info</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-warning\" disabled=\"disabled\">Warning</button></div><div class=\"button-wrapper\"><button type=\"button\" class=\"btn btn-danger\" disabled=\"disabled\">Danger</button></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Icon Buttons\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/buttons/widgets/iconButtons.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Large Buttons\" ba-panel-class=\"with-scroll large-buttons-panel\"><div ng-include=\"\'app/pages/ui/buttons/widgets/largeButtons.html\'\"></div></div></div><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Button Dropdowns\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/buttons/widgets/dropdowns.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Button Groups\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/buttons/widgets/buttonGroups.html\'\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\" ba-panel-title=\"Progress Buttons\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/buttons/widgets/progressButtons.html\'\"></div></div></div></div>");
$templateCache.put("app/pages/ui/notifications/notifications.html","<div ba-panel=\"\" ba-panel-class=\"with-scroll notification-panel\"><div class=\"row\"><div class=\"col-md-3 col-sm-4\"><div class=\"control\"><label for=\"title\">Title</label> <input ng-model=\"options.title\" type=\"text\" class=\"form-control\" id=\"title\" placeholder=\"Enter a title ...\"></div><div class=\"control\"><label for=\"message\">Message</label> <textarea ng-model=\"options.msg\" class=\"form-control\" id=\"message\" rows=\"3\" placeholder=\"Enter a message ...\"></textarea></div><div class=\"control-group\"><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.closeButton\" type=\"checkbox\" id=\"closeButton\"> <span>Close Button</span></label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.allowHtml\" type=\"checkbox\" id=\"html\"> <span>Allow html</span></label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.progressBar\" type=\"checkbox\" id=\"progressBar\"> <span>Progress bar</span></label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.preventDuplicates\" type=\"checkbox\" id=\"preventDuplicates\"> <span>Prevent duplicates</span></label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.preventOpenDuplicates\" type=\"checkbox\" id=\"preventOpenDuplicates\"> <span>Prevent open duplicates</span></label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.tapToDismiss\" type=\"checkbox\" id=\"tapToDismiss\"> <span>Tap to dismiss</span></label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.newestOnTop\" type=\"checkbox\" id=\"newestOnTop\"> <span>Newest on top</span></label></div></div></div><div class=\"col-md-2 col-sm-3 toastr-radio-setup\"><div id=\"toastTypeGroup\"><div class=\"controls radio-controls\"><label class=\"radio-header\">Toast Type</label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.type\" name=\"toasts\" value=\"success\"><span>Success</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.type\" name=\"toasts\" value=\"info\"><span>Info</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.type\" name=\"toasts\" value=\"warning\"><span>Warning</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.type\" name=\"toasts\" value=\"error\"><span>Error</span></label></div></div><div id=\"positionGroup\"><div class=\"controls radio-controls\"><label class=\"radio-header position-header\">Position</label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-top-right\"> <span>Top Right</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-bottom-right\"> <span>Bottom Right</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-bottom-left\"> <span>Bottom Left</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-top-left\"> <span>Top Left</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-top-full-width\"> <span>Top Full Width</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-bottom-full-width\"> <span>Bottom Full Width</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-top-center\"> <span>Top Center</span></label> <label class=\"radio custom-radio\"><input type=\"radio\" ng-model=\"options.positionClass\" name=\"positions\" value=\"toast-bottom-center\"> <span>Bottom Center</span></label></div></div></div><div class=\"col-md-2 col-sm-3\"><div class=\"control\"><label for=\"timeOut\">Time out</label> <input type=\"text\" class=\"form-control\" id=\"timeOut\" ng-model=\"options.timeOut\" placeholder=\"ms\"> <label class=\"sub-label\" for=\"timeOut\">If you set it to 0, it will stick</label></div><div class=\"control\"><label for=\"extendedTimeOut\">Extended time out</label> <input type=\"text\" class=\"form-control\" id=\"extendedTimeOut\" ng-model=\"options.extendedTimeOut\" placeholder=\"ms\"></div><div class=\"control\"><label for=\"maxOpened\">Maximum number of toasts</label> <input type=\"text\" class=\"form-control\" id=\"maxOpened\" ng-model=\"options.maxOpened\" value=\"0\"> <label for=\"maxOpened\" class=\"sub-label\">0 means no limit</label></div><div class=\"control\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input ng-model=\"options.autoDismiss\" type=\"checkbox\" id=\"autoDismiss\"> <span>Auto dismiss</span></label></div></div><div class=\"col-md-5 col-sm-12\"><label>Result:</label><pre class=\"result-toastr\" id=\"toastrOptions\">{{optionsStr}}</pre></div></div><div class=\"row\"><div class=\"col-md-12 button-row\"><button ng-click=\"openToast()\" class=\"btn btn-primary\">Open Toast</button> <button ng-click=\"openRandomToast()\" class=\"btn btn-primary\">Random Toast</button> <button ng-click=\"clearToasts()\" class=\"btn btn-danger\">Clear Toasts</button> <button ng-click=\"clearLastToast()\" class=\"btn btn-danger\">Clear Last Toast</button></div></div></div>");
$templateCache.put("app/pages/ui/panels/panels.html","<h2>Default panels</h2><div class=\"row\"><div class=\"col-md-12 col-lg-4\"><div ba-panel=\"\" ba-panel-class=\"xsmall-panel light-text\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ac mi erat. Phasellus placerat, elit a laoreet semper, enim ipsum ultricies orci, ac tincidunt tellus massa eu est. Nam non porta purus, sed facilisis justo. Nam pulvinar sagittis quam.</div></div><div class=\"col-md-12 col-lg-4\"><div ba-panel=\"\" ba-panel-title=\"Panel with header\" ba-panel-class=\"xsmall-panel light-text\">Phasellus maximus venenatis augue, et vestibulum neque aliquam ut. Morbi mattis libero vitae vulputate dignissim. Praesent placerat, sem non dapibus cursus, lacus nisi blandit quam, vitae porttitor lectus lacus non turpis. Donec suscipit consequat tellus.</div></div><div class=\"col-md-12 col-lg-4\"><div ba-panel=\"\" ba-panel-title=\"Panel with header & scroll\" ba-panel-class=\"xsmall-panel with-scroll light-text\"><p>Suspendisse nec tellus urna. Sed id est metus. Nullam sit amet dolor nec ipsum dictum suscipit. Mauris sed nisi mauris. Nulla iaculis nisl ut velit ornare imperdiet. Suspendisse potenti. In tempor leo sed sem malesuada pellentesque. Maecenas faucibus metus lacus, ac egestas diam vulputate vitae.</p><p>Sed dapibus, purus vel hendrerit consectetur, lectus orci gravida massa, sed bibendum dui mauris et eros. Nulla dolor massa, posuere et dictum sit amet, dignissim quis odio. Fusce mollis finibus dignissim. Integer sodales augue erat. Pellentesque laoreet vestibulum urna at iaculis. Nulla libero augue, euismod at diam eget, aliquam condimentum ligula. Donec a leo eu est molestie lacinia hendrerit sed lorem. Duis id diam eu metus sodales consequat vel eu elit. Praesent dolor nibh, convallis eleifend feugiat a, finibus porttitor nibh. Ut non libero vel velit pulvinar scelerisque non vel lorem. Integer porta tempor nulla. Sed nibh erat, ultrices vel lorem eu, rutrum vehicula sem.</p><p>Donec nec tellus urna. Sed id est metus. Nullam sit amet dolor nec ipsum dictum suscipit. Mauris sed nisi mauris. Nulla iaculis nisl ut velit ornare imperdiet. Suspendisse potenti. In tempor leo sed sem malesuada pellentesque. Maecenas faucibus metus lacus, ac egestas diam vulputate vitae.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque fermentum nec ligula egestas rhoncus. Sed dignissim, augue vel scelerisque vulputate, nisi ante posuere lorem, quis iaculis eros dolor eu nisl. Etiam sagittis, ipsum ac tempor iaculis, justo neque mattis ante, ac maximus sapien risus eu sapien. Morbi erat urna, varius et lectus vel, porta dictum orci. Duis bibendum euismod elit, et lobortis purus venenatis in. Mauris eget lacus enim. Cras quis sem et magna fringilla convallis. Proin hendrerit nulla vel gravida mollis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vestibulum consectetur quis purus vel aliquam.</p></div></div></div><h2>Bootstrap panels</h2><div class=\"row\"><div class=\"col-md-12 col-lg-4\"><div class=\"panel panel-default bootstrap-panel xsmall-panel\"><div class=\"panel-body\"><p>A panel in bootstrap is a bordered box with some padding around its content.</p><p class=\"p-with-code\">Panels are created with the <code>.panel</code> class, and content inside the panel has a <code>.panel-body</code> class. The <code>.panel-default .panel-primary .panel-danger</code> and other classes are used to style the color of the panel. See the next example on this page for more contextual classes.</p></div></div></div><div class=\"col-md-12 col-lg-4\"><div class=\"panel panel-default bootstrap-panel xsmall-panel\"><div class=\"panel-heading\">Panel Heading</div><div class=\"panel-body\"><p class=\"p-with-code\">The <code>.panel-heading</code> class adds a heading to the panel.Easily add a heading container to your panel with .panel-heading. You may also include any <code>h1-h6</code> with a <code>.panel-title</code> class to add a pre-styled heading.</p></div></div></div><div class=\"col-md-12 col-lg-4\"><div class=\"panel panel-default bootstrap-panel\"><div class=\"panel-body footer-panel\"><p class=\"p-with-code\">Wrap buttons or secondary text in <code>.panel-footer</code>. Note that panel footers do not inherit colors and borders when using contextual variations as they are not meant to be in the foreground.</p></div><div class=\"panel-footer\">Panel Footer</div></div></div></div><h2>Panels with Contextual Classes</h2><div class=\"row\"><div class=\"col-md-6 col-lg-4\"><div class=\"panel panel-default contextual-example-panel bootstrap-panel\"><div class=\"panel-heading\">Panel with panel-default class</div><div class=\"panel-body\">To color the panel, use contextual classes. This is sample <code>.panel-default</code> panel</div></div></div><div class=\"col-md-6 col-lg-4\"><div class=\"panel panel-primary contextual-example-panel bootstrap-panel\"><div class=\"panel-heading\">Panel with panel-primary class</div><div class=\"panel-body\">Sample <code>.panel-primary</code> panel</div></div></div><div class=\"col-md-6 col-lg-4\"><div class=\"panel panel-success contextual-example-panel bootstrap-panel\"><div class=\"panel-heading\">Panel with panel-success class</div><div class=\"panel-body\">Sample <code>.panel-success</code> panel</div></div></div><div class=\"col-md-6 col-lg-4\"><div class=\"panel panel-info contextual-example-panel bootstrap-panel\"><div class=\"panel-heading\">Panel with panel-info class</div><div class=\"panel-body\">Sample <code>.panel-info</code> panel</div></div></div><div class=\"col-md-6 col-lg-4\"><div class=\"panel panel-warning contextual-example-panel bootstrap-panel\"><div class=\"panel-heading\">Panel with panel-warning class</div><div class=\"panel-body\">Sample <code>.panel-warning</code> panel</div></div></div><div class=\"col-md-6 col-lg-4\"><div class=\"panel panel-danger contextual-example-panel bootstrap-panel\"><div class=\"panel-heading\">Panel with panel-danger class</div><div class=\"panel-body\">Sample <code>.panel-danger</code> panel</div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><h2>Panel Group</h2><div class=\"panel-group\"><div class=\"panel panel-default bootstrap-panel\"><div class=\"panel-heading\">Panel group 1</div><div class=\"panel-body\"><p>To group many panels together, wrap a <code>&lt;div&gt;</code> with class <code>\r\n            .panel-group</code> around them.</p></div></div><div class=\"panel panel-default bootstrap-panel\"><div class=\"panel-heading\">Panel group 2</div><div class=\"panel-body\"><p>The <code>.panel-group</code> class clears the bottom-margin of each panel.</p></div></div></div></div></div>");
$templateCache.put("app/pages/ui/progressBars/progressBars.html","<div class=\"widgets\"><div class=\"row\"><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"Basic\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/progressBars/widgets/basic.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Striped\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/progressBars/widgets/striped.html\'\"></div></div></div><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-title=\"With label\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/progressBars/widgets/label.html\'\"></div></div><div ba-panel=\"\" ba-panel-title=\"Animated\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/progressBars/widgets/animated.html\'\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\" ba-panel-title=\"Stacked\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/ui/progressBars/widgets/stacked.html\'\"></div></div></div></div>");
$templateCache.put("app/pages/ui/slider/slider.html","<div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Ion Range Slider\" ba-panel-class=\"with-scroll\"><div class=\"slider-box\"><h5>Basic</h5><ion-slider type=\"single\" grid=\"false\" min=\"0\" max=\"100\" from=\"45\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>With prefix</h5><ion-slider type=\"single\" grid=\"true\" min=\"100\" max=\"1200\" prefix=\"$\" from=\"420\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>With postfix</h5><ion-slider type=\"single\" grid=\"true\" min=\"-90\" max=\"90\" postfix=\"°\" from=\"36\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>Two way range</h5><ion-slider type=\"double\" grid=\"true\" min=\"100\" max=\"1200\" from=\"420\" to=\"900\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>With Steps</h5><ion-slider type=\"single\" grid=\"true\" min=\"0\" max=\"1000\" from=\"300\" step=\"50\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>Decorating numbers</h5><ion-slider type=\"single\" grid=\"true\" min=\"0\" max=\"1000000\" from=\"300000\" step=\"1000\" prettify-separator=\".\" prettify=\"true\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>Using custom values array</h5><ion-slider type=\"single\" grid=\"true\" from=\"5\" step=\"1000\" values=\"[\'January\', \'February\', \'March\', \'April\', \'May\', \'June\', \'July\', \'August\', \'September\', \'October\', \'November\', \'December\']\" disable=\"false\"></ion-slider></div><div class=\"slider-box\"><h5>Disabled</h5><ion-slider type=\"single\" grid=\"false\" min=\"0\" max=\"100\" from=\"45\" disable=\"true\"></ion-slider></div></div></div></div>");
$templateCache.put("app/pages/ui/tabs/contextualAccordion.html","<uib-accordion><uib-accordion-group heading=\"Primary\" panel-class=\"panel-primary bootstrap-panel accordion-panel\">Primary <i class=\"ion-heart\"></i></uib-accordion-group><uib-accordion-group heading=\"Success\" panel-class=\"panel-success bootstrap-panel accordion-panel\">Success <i class=\"ion-checkmark-round\"></i></uib-accordion-group><uib-accordion-group heading=\"Info\" panel-class=\"panel-info bootstrap-panel accordion-panel\">Info <i class=\"ion-information-circled\"></i></uib-accordion-group><uib-accordion-group heading=\"Warning\" panel-class=\"panel-warning bootstrap-panel accordion-panel\">Warning <i class=\"ion-alert\"></i></uib-accordion-group><uib-accordion-group heading=\"Danger\" panel-class=\"panel-danger bootstrap-panel accordion-panel\">Danger <i class=\"ion-nuclear\"></i></uib-accordion-group></uib-accordion>");
$templateCache.put("app/pages/ui/tabs/mainTabs.html","<uib-tabset active=\"$tabSetStatus.activeTab\"><uib-tab heading=\"Start\"><p>Take up one idea. Make that one idea your life--think of it, dream of it, live on that idea. Let the brain, muscles, nerves, every part of your body, be full of that idea, and just leave every other idea alone. This is the way to success.</p><p>People who succeed have momentum. The more they succeed, the more they want to succeed, and the more they find a way to succeed. Similarly, when someone is failing, the tendency is to get on a downward spiral that can even become a self-fulfilling prophecy.</p><div class=\"text-center\"><div class=\"kameleon-icon with-round-bg primary inline-icon\"><img ng-src=\"{{::( \'Shop\' | kameleonImg )}}\"></div><div class=\"kameleon-icon with-round-bg primary inline-icon\"><img ng-src=\"{{::( \'Programming\' | kameleonImg )}}\"></div><div class=\"kameleon-icon with-round-bg primary inline-icon\"><img ng-src=\"{{::( \'Dna\' | kameleonImg )}}\"></div></div><p>The reason most people never reach their goals is that they don\'t define them, or ever seriously consider them as believable or achievable. Winners can tell you where they are going, what they plan to do along the way, and who will be sharing the adventure with them.</p></uib-tab><uib-tab heading=\"Getting Done\"><p>You can\'t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something--your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life.</p><p>The reason most people never reach their goals is that they don\'t define them, or ever seriously consider them as believable or achievable. Winners can tell you where they are going, what they plan to do along the way, and who will be sharing the adventure with them.</p></uib-tab><uib-tab ng-init=\"$dropdownTabActive = 1\" class=\"with-dropdown\"><uib-tab-heading uib-dropdown=\"\"><a uib-dropdown-toggle=\"\" ng-click=\"$event.stopPropagation()\">Dropdown tab <i class=\"caret\"></i></a><ul class=\"dropdown-menu\" uib-dropdown-menu=\"\"><li><a ng-click=\"$dropdownTabActive = 1; $tabSetStatus.activeTab = 3\">Tab 1</a></li><li><a ng-click=\"$dropdownTabActive = 2; $tabSetStatus.activeTab = 3\">Tab 2</a></li></ul></uib-tab-heading><div ng-show=\"$dropdownTabActive == 1\"><p>Success is ... knowing your purpose in life, growing to reach your maximum potential, and sowing seeds that benefit others.</p><p>Failure is the condiment that gives success its flavor.</p></div><div ng-show=\"$dropdownTabActive == 2\"><p class=\"text-center\"><button class=\"btn btn-danger\">I\'m just a dummy button</button></p></div></uib-tab></uib-tabset>");
$templateCache.put("app/pages/ui/tabs/sampleAccordion.html","<uib-accordion><uib-accordion-group is-open=\"true\" heading=\"Static Header, initially expanded\" panel-class=\"bootstrap-panel accordion-panel panel-default\">This content is straight in the template.</uib-accordion-group><uib-accordion-group heading=\"Dynamic Body Content\" panel-class=\"bootstrap-panel accordion-panel panel-default\"><p>The body of the uib-accordion group grows to fit the contents</p><button type=\"button\" class=\"btn btn-primary btn-sm\">Add Item</button></uib-accordion-group><uib-accordion-group heading=\"Custom template\" panel-class=\"bootstrap-panel accordion-panel panel-default\">Hello</uib-accordion-group><uib-accordion-group panel-class=\"bootstrap-panel accordion-panel panel-default\"><uib-accordion-heading>I can have markup, too! <i class=\"fa pull-right ion-settings\"></i></uib-accordion-heading>This is just some content to illustrate fancy headings.</uib-accordion-group></uib-accordion>");
$templateCache.put("app/pages/ui/tabs/sideTabs.html","<div ba-panel=\"\" ba-panel-class=\"tabs-panel xsmall-panel with-scroll\"><uib-tabset class=\"tabs-left\"><uib-tab heading=\"Start\"><p class=\"text-center\">Take up one idea.</p><div class=\"kameleon-icon-tabs kameleon-icon with-round-bg danger\"><img ng-src=\"{{::( \'Key\' | kameleonImg )}}\"></div><p>People who succeed have momentum. The more they succeed, the more they want to succeed, and the more they find a way to succeed.</p></uib-tab><uib-tab heading=\"Get it done\"><p>You can\'t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something--your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life.</p><p>The reason most people never reach their goals is that they don\'t define them, or ever seriously consider them as believable or achievable. Winners can tell you where they are going, what they plan to do along the way, and who will be sharing the adventure with them.</p></uib-tab><uib-tab heading=\"Achieve\"><p>Success is ... knowing your purpose in life, growing to reach your maximum potential, and sowing seeds that benefit others.</p><p>Failure is the condiment that gives success its flavor.</p></uib-tab></uib-tabset></div><div ba-panel=\"\" ba-panel-class=\"tabs-panel xsmall-panel with-scroll\"><uib-tabset class=\"tabs-right\"><uib-tab heading=\"Start\"><p class=\"text-center\">Take up one idea.</p><div class=\"kameleon-icon-tabs kameleon-icon with-round-bg warning\"><img ng-src=\"{{::( \'Phone-Booth\' | kameleonImg )}}\"></div><p>People who succeed have momentum. The more they succeed, the more they want to succeed, and the more they find a way to succeed.</p></uib-tab><uib-tab heading=\"Get it done\"><p>You can\'t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something--your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life.</p><p>The reason most people never reach their goals is that they don\'t define them, or ever seriously consider them as believable or achievable. Winners can tell you where they are going, what they plan to do along the way, and who will be sharing the adventure with them.</p></uib-tab><uib-tab heading=\"Achieve\"><p>Success is ... knowing your purpose in life, growing to reach your maximum potential, and sowing seeds that benefit others.</p><p>Failure is the condiment that gives success its flavor.</p></uib-tab></uib-tabset></div>");
$templateCache.put("app/pages/ui/tabs/tabs.html","<div><div class=\"row\"><div class=\"col-md-6\"><div ba-panel=\"\" ba-panel-class=\"with-scroll horizontal-tabs tabs-panel medium-panel\"><div ng-include=\"\'app/pages/ui/tabs/mainTabs.html\'\"></div></div></div><div class=\"col-md-6 tabset-group\" ng-include=\"\'app/pages/ui/tabs/sideTabs.html\'\"></div></div><div class=\"row accordions-row\"><div class=\"col-md-6\" ng-include=\"\'app/pages/ui/tabs/sampleAccordion.html\'\"></div><div class=\"col-md-6\" ng-include=\"\'app/pages/ui/tabs/contextualAccordion.html\'\"></div></div></div>");
$templateCache.put("app/pages/ui/typography/typography.html","<div class=\"typography-document-samples row-fluid\"><div class=\"col-xlg-3 col-lg-6 col-md-6 col-sm-6 col-xs-12 typography-widget\"><div ba-panel=\"\" ba-panel-class=\"with-scroll heading-widget\" ba-panel-title=\"Text Size\"><div class=\"section-block\"><h1>H1. Heading 1</h1><p>Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar, lacinia scelerisque pharetra, placerat vestibulum eleifend pellentesque.</p></div><div class=\"section-block\"><h2>H2. Heading 2</h2><p>Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar, lacinia scelerisque pharetra, placerat vestibulum eleifend pellentesque.</p></div><div class=\"section-block\"><h3>H3. Heading 3</h3><p>Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar, lacinia scelerisque pharetra, placerat vestibulum eleifend pellentesque.</p></div><div class=\"section-block\"><h4>H4. Heading 4</h4><p>Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar, lacinia scelerisque pharetra,.</p></div><div class=\"section-block\"><h5>H5. Heading 5</h5><p>Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar, lacinia scelerisque pharetra.</p></div></div></div><div class=\"col-xlg-3 col-lg-6 col-md-6 col-sm-6 col-xs-12 typography-widget\"><div ba-panel=\"\" ba-panel-class=\"with-scroll more-text-widget\" ba-panel-title=\"Some more text\"><div class=\"section-block light-text\"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales at. Nulla tellus elit, varius non commodo eget, mattis vel eros. In sed ornare nulla. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis.</p></div><div class=\"section-block regular-text\"><p>Curabitur bibendum ornare dolor, quis ullamcorper ligula dfgz`zzsodales at. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id.</p></div><div class=\"section-block upper-text bold-text\"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales at. Nulla tellus elit, varius non commodo eget, mattis vel eros. In sed ornare nulla.</p></div><div class=\"section-block bold-text\"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullam-corper ligula sodales at. Nulla tellus elit, varius non commodo eget, mattis vel eros. In sed ornare nulla.</p></div><div class=\"section-block small-text\"><p>Secondary text. Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar,</p><p>lacinia scelerisque pharetra, placerat vestibulum eleifend</p><p>pellentesque, mi nam.</p></div></div></div><div class=\"col-xlg-3 col-lg-6 col-md-6 col-sm-6 col-xs-12 typography-widget\"><div ba-panel=\"\" ba-panel-class=\"with-scroll lists-widget\" ba-panel-title=\"Lists\"><div class=\"section-block\"><h5 class=\"list-header\">Unordered list:</h5><ul class=\"z\"><li>Lorem ipsum dolor sit amet</li><li>Сlacinia scelerisque pharetra<ul><li>Dui rhoncus quisque integer lorem<ul><li>Libero iaculis vestibulum eu vitae</li></ul></li></ul></li><li>Nisl lectus nibh habitasse suspendisse ut</li><li><span>Posuere cursus hac, vestibulum wisi nulla bibendum</span></li></ul><h5 class=\"list-header\">Ordered Lists:</h5><ol class=\"z\"><li><span>Eu non nec cursus quis mollis, amet quam nec</span></li><li><span>Et suspendisse, adipiscing fringilla ornare sit ligula sed</span><ol><li><span>Interdum et justo nulla</span><ol><li><span>Magna amet, suscipit suscipit non amet</span></li></ol></li></ol></li><li><span>Metus duis eu non eu ridiculus turpis</span></li><li><span>Neque egestas id fringilla consectetuer justo curabitur, wisi magna neque commodo volutpat</span></li></ol><div class=\"accent\">Important text fragment. Lorem ipsum dolor sit amet, id mollis iaculis mi nisl pulvinar, lacinia scelerisque pharetra.</div></div></div></div><div class=\"col-xlg-3 col-lg-6 col-md-6 col-sm-6 col-xs-12 typography-widget\"><div ba-panel=\"\" ba-panel-class=\"with-scroll color-widget\" ba-panel-title=\"Text Color\"><div class=\"section-block red-text\"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales at. Nulla tellus elit, varius non commodo eget, mattis vel eros. In sed ornare nulla. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p></div><div class=\"section-block yellow-text\"><p>Curabitur bibendum ornare dolor, quis ullamcorper ligula dfgz`zzsodales at. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. In sed ornare nulla.</p></div><div class=\"section-block links\"><p>Lorem ipsum <a href=\"\">dolor</a> sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis <a href=\"\">ullamcorper</a> ligula sodales at. Nulla tellus elit, varius non commodo eget, <a href=\"\">mattis</a> vel eros. In sed ornare nulla.</p></div><div class=\"section-block links\"><p><a href=\"\">Active link — #209e91</a></p><p class=\"hovered\"><a href=\"\">Hover link — #17857a</a></p></div></div></div></div><div class=\"row-fluid\"><div class=\"col-lg-12 col-sm-12 col-xs-12\"><div ba-panel=\"\" ba-panel-class=\"banner-column-panel\"><div class=\"banner\"><div class=\"large-banner-wrapper\"><img ng-src=\"{{::( \'app/typography/banner.png\' | appImage )}}\" alt=\"\"></div><div class=\"banner-text-wrapper\"><div class=\"banner-text\"><h1>Simple Banner Text</h1><p>Lorem ipsum dolor sit amet</p><p>Odio amet viverra rutrum</p></div></div></div><div class=\"section\"><h2>Columns</h2><div class=\"row\"><div class=\"col-sm-6\"><div class=\"img-wrapper\"><img ng-src=\"{{::( \'app/typography/typo03.png\' | appImage )}}\" alt=\"\" title=\"\"></div><p>Vel elit, eros elementum, id lacinia, duis non ut ut tortor blandit. Mauris <a href=\"\">dapibus</a> magna rutrum. Ornare neque suspendisse <a href=\"\">phasellus wisi</a>, quam cras pede rutrum suspendisse, <a href=\"\">felis amet eu</a>. Congue magna elit quisque quia, nullam justo sagittis, ante erat libero placerat, proin condimentum consectetuer lacus. Velit condimentum velit, sed penatibus arcu nulla.</p></div><div class=\"col-sm-6\"><div class=\"img-wrapper\"><img ng-src=\"{{::( \'app/typography/typo01.png\' | appImage )}}\" alt=\"\" title=\"\"></div><p>Et suspendisse, adipiscing fringilla ornare sit ligula sed, vel nam. Interdum et justo nulla, fermentum lobortis purus ut eu, duis nibh dolor massa tristique elementum, nibh iste potenti risus fusce aliquet fusce, ullamcorper debitis primis arcu tellus vestibulum ac.</p></div></div><div class=\"separator\"></div><div class=\"row\"><div class=\"col-sm-4\"><h4>Column heading example</h4><div class=\"img-wrapper\"><img ng-src=\"{{::( \'app/typography/typo04.png\' | appImage )}}\" alt=\"\"></div><p>Eget augue, lacus erat ante egestas scelerisque aliquam, metus molestie leo in habitasse magna maecenas</p><a href=\"\" class=\"learn-more\">Lean more</a></div><div class=\"col-sm-4\"><h4>Yet another column heading example</h4><div class=\"img-wrapper\"><img ng-src=\"{{::( \'app/typography/typo05.png\' | appImage )}}\" alt=\"\"></div><p>Augue massa et parturient, suspendisse orci nec scelerisque sit, integer nam mauris pede consequat in velit</p><a href=\"\" class=\"learn-more\">Lean more</a></div><div class=\"col-sm-4\"><h4>Third column heading example</h4><div class=\"img-wrapper\"><img ng-src=\"{{::( \'app/typography/typo06.png\' | appImage )}}\" alt=\"\"></div><p>Eget turpis, tortor lobortis porttitor, vestibulum nullam vehicula aliquam</p><a href=\"\" class=\"learn-more\">Lean more</a></div></div><div class=\"separator\"></div></div></div></div></div>");
$templateCache.put("app/theme/components/backTop/backTop.html","<i class=\"fa fa-angle-up back-top\" id=\"backTop\" title=\"Back to Top\"></i>");
$templateCache.put("app/theme/components/baSidebar/ba-sidebar.html","<aside class=\"al-sidebar\" ng-swipe-right=\"$baSidebarService.setMenuCollapsed(false)\" ng-swipe-left=\"$baSidebarService.setMenuCollapsed(true)\" ng-mouseleave=\"hoverElemTop=selectElemTop\"><ul class=\"al-sidebar-list\" slimscroll=\"{height: \'{{menuHeight}}px\'}\" slimscroll-watch=\"menuHeight\"><li ng-repeat=\"item in ::menuItems\" class=\"al-sidebar-list-item\" ng-class=\"::{\'with-sub-menu\': item.subMenu}\" ui-sref-active=\"selected\" ba-sidebar-toggling-item=\"item\"><a ng-mouseenter=\"hoverItem($event, item)\" ui-state=\"item.stateRef || \'\'\" ng-href=\"{{::(item.fixedHref ? item.fixedHref: \'\')}}\" ng-if=\"::!item.subMenu && item.showOnSideBar\" class=\"al-sidebar-list-link\"><i class=\"{{ ::item.icon }}\"></i><span>{{ ::item.title }}</span></a> <a ng-mouseenter=\"hoverItem($event, item)\" ng-if=\"::item.subMenu && item.showOnSideBar\" class=\"al-sidebar-list-link\" ba-ui-sref-toggler=\"\"><i class=\"{{ ::item.icon }}\"></i><span>{{ ::item.title }}</span> <b class=\"fa fa-angle-down\" ui-sref-active=\"fa-angle-up\" ng-if=\"::item.subMenu\"></b></a><ul ng-if=\"::item.subMenu\" class=\"al-sidebar-sublist\" ng-class=\"{\'slide-right\': item.slideRight}\" ba-ui-sref-toggling-submenu=\"\"><li ng-repeat=\"subitem in ::item.subMenu\" ng-class=\"::{\'with-sub-menu\': subitem.subMenu}\" ui-sref-active=\"selected\" ba-sidebar-toggling-item=\"subitem\" class=\"ba-sidebar-sublist-item\"><a ng-mouseenter=\"hoverItem($event, item)\" ng-if=\"::subitem.subMenu\" ba-ui-sref-toggler=\"\" class=\"al-sidebar-list-link subitem-submenu-link\"><span>{{ ::subitem.title }}</span> <b class=\"fa\" ng-class=\"{\'fa-angle-up\': subitem.expanded, \'fa-angle-down\': !subitem.expanded}\" ng-if=\"::subitem.subMenu\"></b></a><ul ng-if=\"::subitem.subMenu\" class=\"al-sidebar-sublist subitem-submenu-list\" ng-class=\"{expanded: subitem.expanded, \'slide-right\': subitem.slideRight}\" ba-ui-sref-toggling-submenu=\"\"><li ng-mouseenter=\"hoverItem($event, item)\" ng-repeat=\"subSubitem in ::subitem.subMenu\" ui-sref-active=\"selected\"><a ng-mouseenter=\"hoverItem($event, item)\" href=\"\" ng-if=\"::subSubitem.disabled\" class=\"al-sidebar-list-link\">{{ ::subSubitem.title }}</a> <a ng-mouseenter=\"hoverItem($event, item)\" ui-state=\"subSubitem.stateRef || \'\'\" ng-if=\"::!subSubitem.disabled\" ng-href=\"{{::(subSubitem.fixedHref ? subSubitem.fixedHref: \'\')}}\">{{::subSubitem.title }}</a></li></ul><a ng-mouseenter=\"hoverItem($event, item)\" href=\"\" ng-if=\"::(!subitem.subMenu && subitem.disabled)\" class=\"al-sidebar-list-link\">{{ ::subitem.title }}</a> <a ng-mouseenter=\"hoverItem($event, item)\" target=\"{{::(subitem.blank ? \'_blank\' : \'_self\')}}\" ng-if=\"::(!subitem.subMenu && !subitem.disabled)\" ui-state=\"subitem.stateRef || \'\'\" ng-href=\"{{::(subitem.fixedHref ? subitem.fixedHref: \'\')}}\">{{ ::subitem.title}}</a></li></ul></li></ul><div class=\"sidebar-hover-elem\" ng-style=\"{top: hoverElemTop + \'px\', height: hoverElemHeight + \'px\'}\" ng-class=\"{\'show-hover-elem\': showHoverElem }\"></div></aside>");
$templateCache.put("app/theme/components/baWizard/baWizard.html","<div class=\"ba-wizard\"><div class=\"ba-wizard-navigation-container\"><div ng-repeat=\"t in $baWizardController.tabs\" class=\"ba-wizard-navigation {{$baWizardController.tabNum == $index ? \'active\' : \'\'}}\" ng-click=\"$baWizardController.selectTab($index)\">{{t.title}}</div></div><div class=\"progress ba-wizard-progress\"><div class=\"progress-bar progress-bar-danger active\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\" ng-style=\"{width: $baWizardController.progress + \'%\'}\"></div></div><div class=\"steps\" ng-transclude=\"\"></div><nav><ul class=\"pager ba-wizard-pager\"><li class=\"previous\"><button ng-disabled=\"$baWizardController.isFirstTab()\" ng-click=\"$baWizardController.previousTab()\" type=\"button\" class=\"btn btn-primary\"><span aria-hidden=\"true\">&larr;</span> previous</button></li><li class=\"next\"><button ng-disabled=\"$baWizardController.isLastTab()\" ng-click=\"$baWizardController.nextTab()\" type=\"button\" class=\"btn btn-primary\">next <span aria-hidden=\"true\">&rarr;</span></button></li></ul></nav></div>");
$templateCache.put("app/theme/components/baWizard/baWizardStep.html","<section ng-show=\"selected\" class=\"step\" ng-transclude=\"\"></section>");
$templateCache.put("app/theme/components/contentTop/contentTop.html","<div class=\"content-top clearfix\"><h1 class=\"al-title\">{{ activePageTitle }}</h1><ul class=\"breadcrumb al-breadcrumb\"><li><a href=\"#/dashboard\">Home</a></li><li>{{ activePageTitle }}</li></ul></div>");
$templateCache.put("app/theme/components/msgCenter/msgCenter.html","<ul class=\"al-msg-center clearfix\"><li uib-dropdown=\"\"><a href=\"\" uib-dropdown-toggle=\"\"><i class=\"fa fa-bell-o\"></i><span>5</span><div class=\"notification-ring\"></div></a><div uib-dropdown-menu=\"\" class=\"top-dropdown-menu\"><i class=\"dropdown-arr\"></i><div class=\"header clearfix\"><strong>Notifications</strong> <a href=\"\">Mark All as Read</a> <a href=\"\">Settings</a></div><div class=\"msg-list\"><a href=\"\" class=\"clearfix\" ng-repeat=\"msg in notifications\"><div class=\"img-area\"><img ng-class=\"{\'photo-msg-item\' : !msg.image}\" ng-src=\"{{::( msg.image || (users[msg.userId].name | profilePicture) )}}\"></div><div class=\"msg-area\"><div ng-bind-html=\"getMessage(msg)\"></div><span>{{ msg.time }}</span></div></a></div><a href=\"\">See all notifications</a></div></li><li uib-dropdown=\"\"><a href=\"\" class=\"msg\" uib-dropdown-toggle=\"\"><i class=\"fa fa-envelope-o\"></i><span>5</span><div class=\"notification-ring\"></div></a><div uib-dropdown-menu=\"\" class=\"top-dropdown-menu\"><i class=\"dropdown-arr\"></i><div class=\"header clearfix\"><strong>Messages</strong> <a href=\"\">Mark All as Read</a> <a href=\"\">Settings</a></div><div class=\"msg-list\"><a href=\"\" class=\"clearfix\" ng-repeat=\"msg in messages\"><div class=\"img-area\"><img class=\"photo-msg-item\" ng-src=\"{{::( users[msg.userId].name | profilePicture )}}\"></div><div class=\"msg-area\"><div>{{ msg.text }}</div><span>{{ msg.time }}</span></div></a></div><a href=\"\">See all messages</a></div></li></ul>");
$templateCache.put("app/theme/components/pageTop/pageTop.html","<div class=\"page-top clearfix\" scroll-position=\"scrolled\" max-height=\"50\" ng-class=\"{\'scrolled\': scrolled}\"><a href=\"#/tasks\" class=\"al-logo clearfix\"><span>UCCA</span>App</a> <span ng-if=\"!$hideSideBar\"><a href=\"\" class=\"collapse-menu-link ion-navicon\" ba-sidebar-toggle-menu=\"\"></a></span><div class=\"user-profile clearfix\"><div class=\"al-user-profile\" uib-dropdown=\"\"><a uib-dropdown-toggle=\"\" class=\"profile-toggle-link\"><img ng-src=\"{{::( \'Nasta\' | profilePicture )}}\"></a><ul class=\"top-dropdown-menu profile-dropdown\" uib-dropdown-menu=\"\"><li><i class=\"dropdown-arr\"></i></li><li ng-if=\"!$hideSideBar\"><a href=\"#/profile\"><i class=\"fa fa-user\"></i>Profile</a></li><li><a href=\"\" ng-click=\"vm.logout();\" class=\"signout\"><i class=\"fa fa-power-off\"></i>Sign out</a></li></ul></div></div></div>");
$templateCache.put("app/theme/components/widgets/widgets.html","<div class=\"widgets\"><div ng-repeat=\"widgetBlock in ngModel\" ng-class=\"{\'row\': widgetBlock.widgets.length > 1}\"><div ng-repeat=\"widgetCol in widgetBlock.widgets\" ng-class=\"{\'col-md-6\': widgetBlock.widgets.length === 2}\" ng-model=\"widgetCol\" class=\"widgets-block\"><div ba-panel=\"\" ba-panel-title=\"{{::widget.title}}\" ng-repeat=\"widget in widgetCol\" ba-panel-class=\"with-scroll {{widget.panelClass}}\"><div ng-include=\"widget.url\"></div></div></div></div></div>");
$templateCache.put("app/pages/annotation/directives/annotationUnits/annotationUnits.html","<div class=\"directive-container\" ng-class=\"{\'remote-unit\':vm.dataBlock.unitType == \'REMOTE\' || vm.dataBlock.unitType == \'IMPLICIT\',\'selected-unit\': dirCtrl.annotationUnitTreeId == \'0\' || vm.unitIsSelected(vm)}\" id=\"unit-{{dirCtrl.annotationUnitTreeId}}\" ng-mousedown=\"vm.toggleMouseUpDown()\" ng-mouseup=\"vm.toggleMouseUpDown()\" ng-click=\"vm.unitClicked(vm,dirCtrl.annotationUnitTreeId)\"><div ng-show=\"vm.dataBlock.annotation_unit_tree_id !== \'0\' && vm.dataBlock.AnnotationUnits.length\" class=\"expand-btn\" ng-click=\"vm.toggleAnnotationUnitView(vm);\" ng-if=\"vm.dataBlock.unitType === \'REGULAR\'\"><i ng-class=\"{\'minus-round\':vm.dataBlock.gui_status==\'OPEN\', \'plus-round\':vm.dataBlock.gui_status==\'COLLAPSE\'}\"></i></div><span class=\"unit-id\" ng-if=\"vm.dataBlock.annotation_unit_tree_id !== \'0\'\">{{dirCtrl.annotationUnitTreeId}}</span><unit-category ng-repeat=\"category in vm.unit.categories\" color=\"category.backgroundColor\" category-id=\"category.id\" abbreviation=\"category.abbreviation\"></unit-category><unit-cursor unit-id=\"dirCtrl.annotationUnitTreeId\"></unit-cursor><div class=\"row control-buttons-container\" ng-show=\"dirCtrl.annotationUnitTreeId != 0\"><a data-toggle=\"tooltip\" data-placement=\"top\" class=\"unit-control-btn\" title=\"Delete\"><i class=\"fa fa-times delete-btn unit-buttons\" aria-hidden=\"true\" ng-click=\"vm.deleteUnit(dirCtrl.annotationUnitTreeId,vm)\"></i></a> <span ng-if=\"vm.dataBlock.unitType == \'REGULAR\'\"><a data-toggle=\"tooltip\" data-placement=\"top\" class=\"unit-control-btn\" title=\"Finish\" ng-click=\"vm.checkRestrictionForCurrentUnit(dirCtrl.annotationUnitTreeId,$event)\"><b class=\"unit-buttons\">F</b></a> <a data-toggle=\"tooltip\" data-placement=\"top\" class=\"unit-control-btn\" title=\"Comment\" ng-click=\"vm.addCommentToUnit(dirCtrl.annotationUnitTreeId,vm);\"><i class=\"socicon unit-buttons\">}</i> <span class=\"comment-notification\" ng-if=\"dirCtrl.dataBlock.comment !=\'\'\">!</span></a> <a data-toggle=\"tooltip\" data-placement=\"top\" class=\"unit-control-btn\" title=\"Add Remote Unit\"><i class=\"ion-plus-round unit-buttons\" ng-click=\"vm.switchToRemoteMode(vm,$event)\"></i></a></span></div><annotation-token parent-id=\"{{dirCtrl.annotationUnitTreeId}}\" token=\"token\" ng-repeat=\"token in dirCtrl.tokens track by $index\"></annotation-token></div><div ng-repeat=\"unit in vm.dataBlock.AnnotationUnits\" ng-if=\"vm.dataBlock.AnnotationUnits.length > 0\"><annotation-units class=\"has-elements\" ng-class=\"{\'hidden-unit\':vm.isUnitHidden(unit),\'unit-collapse\':vm.isUnitCollaped(vm),\'child-unit\' :unit != \'0\'}\" unit=\"unit\" tokens=\"unit.tokens\" annotation-unit-tree-id=\"unit.annotation_unit_tree_id\"></annotation-units></div>");
$templateCache.put("app/pages/annotation/directives/annotationUnits/dataTreeRow.html","<div class=\"categorized-word\" ng-repeat=\"lineObj in selCtrl.dataBlock.AnnotationUnits\" ng-class=\"{\'hidden\':lineObj.gui_status==\'HIDDEN\',\'closed-annotation-unit\':lineObj.gui_status==\'COLLAPSE\'}\"><div ng-show=\"lineObj.AnnotationUnits.length\" class=\"expand-btn\" ng-click=\"selCtrl.toggleAnnotationUnitView($event);\" ng-if=\"lineObj.unitType == \'REGULAR\'\"><i ng-class=\"{\'minus-round\':lineObj.gui_status==\'OPEN\', \'plus-round\':lineObj.gui_status==\'COLLAPSE\'}\"></i></div><annotation-units class=\"has-elements\" ng-class=\"{\'has-elements\': selCtrl.dataBlock.AnnotationUnits.numOfAnnotationUnits > 0, \'remote-unit\':lineObj.unitType == \'REMOTE\' || lineObj.unitType == \'IMPLICIT\', \'highlight-unit\':lineObj.unitType == \'REMOTE\' || lineObj.unitType == \'IMPLICIT\', \'hidden\':lineObj.gui_status==\'HIDDEN\' }\" preview-line=\"lineObj.text\" categories=\"lineObj.categories\" control=\"selCtrl.keyController\" tokens=\"lineObj.children_tokens_hash\" line-id=\"lineObj.annotation_unit_tree_id\"></annotation-units></div>");
$templateCache.put("app/pages/annotation/directives/categories/categories.html","<div class=\"row annotation-type btn-raised\" title=\"{{defCtrl.definitionDetails.tooltip}}\" ng-class=\"{ \'disabled\':defCtrl.definitionDetails.fromParentLayer, \'childCategory\':defCtrl.definitionDetails.parent != null }\"><span class=\"definition-color\" id=\"definition-color-{{defCtrl.definitionId}}\"></span> <button class=\"text-wrapper\" ng-disabled=\"defCtrl.definitionDetails.fromParentLayer\" ng-click=\"defCtrl.highLightSelectedWords(defCtrl.definitionDetails.backgroundColor)\"><span class=\"text\">{{defCtrl.definitionDetails.name}} ({{defCtrl.definitionDetails.abbreviation}})</span></button> <span class=\"category-info\" ng-click=\"defCtrl.showCategoryInfo($index)\"><i class=\"ion-information\"></i></span></div>");
$templateCache.put("app/pages/annotation/directives/token/token.html","<span class=\"token-wrapper\" ng-class=\"{\'clicked\': vm.tokenInSelectionList(vm) && vm.tokenUnitIsSelected(vm)}\" border-paint=\"\" style=\"{{vm.token.borderStyle}}\" ng-init=\"vm.initToken(vm,$index)\" ng-dblclick=\"vm.tokenDbClick(vm)\"><span class=\"token\" ng-class=\"{\'clicked\': vm.tokenInSelectionList(vm) && vm.tokenUnitIsSelected(vm)}\" ng-mouseover=\"vm.addOnHover(vm)\" ng-click=\"vm.tokenClicked(vm)\">{{vm.token.text}}</span> <span class=\"three-dot-separator\" ng-if=\"vm.token.nextTokenNotAdjacent\">...</span></span>");
$templateCache.put("app/pages/annotation/directives/nav-bar-item/navBarItem.html","<div class=\"item-container\" ng-click=\"vm.itemClicked(this.$parent.item.executeFunction)\"><a type=\"button\" class=\"btn btn-primary\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"{{::vm.toolTip}}\">{{::this.$parent.item.name}}</a></div>");
$templateCache.put("app/pages/annotation/directives/unitCategory/unitCategory.html","<div class=\"category-square\" ng-if=\"categoryId != 9999\" ng-style=\"{\'background-color\': color}\">{{abbreviation}}</div>");
$templateCache.put("app/pages/annotation/directives/utility-buttons/restrictions.html","<div class=\"row annotation-type btn-raised\" id=\"utility-button-{{defCtrl.definitionDetails.id}}\"><div class=\"text-wrapper\" ng-click=\"defCtrl[defCtrl.definitionDetails[\'functionToExecute\']]()\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"{{::defCtrl.definitionDetails.tooltip}}\"><span class=\"text\">{{defCtrl.definitionDetails.name}}</span></div></div>");
$templateCache.put("app/pages/edit/passages/projects/edit.passages.projects.html","<div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Passage\'s Projects Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div><div class=\"button-container\"><button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div></div></div></div>");
$templateCache.put("app/pages/edit/passages/sources/edit.passages.sources.create.html","<div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/passages/sources/edit.passages.sources.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.newSource()\">Add New source</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Sources Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/passages/tasks/edit.passages.tasks.html","<div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Passage\'s Tasks Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div><div class=\"button-container\"><button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div></div></div></div>");
$templateCache.put("app/pages/edit/passages/texts/edit.passages.texts.html","<div class=\"row\" ba-panel=\"\"><div class=\"col-md-12\"><div class=\"input-demo radio-demo row\"><div class=\"col-md-12\"><i>* You may add a \"&lt;DELIMITER>\" inside the text in order to split it and create multiple passages at once</i><br><br><label class=\"radio-inline custom-radio nowrap col-md-12\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio2\" value=\"File\" ng-model=\"vm.textFrom\"> <span class=\"form-group\"><label for=\"input01\">Text</label> <input type=\"file\" class=\"form-control\" id=\"input01\" placeholder=\"Upload\" onchange=\"angular.element(this).scope().vm.readTextFromFile(this)\" ng-focus=\"vm.textFrom = \'File\'\"></span></label></div><div class=\"col-md-12\"><br><label class=\"radio-inline custom-radio nowrap col-md-12\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio1\" value=\"Input\" ng-model=\"vm.textFrom\"> <span class=\"form-group\"><label for=\"textarea01\">Textarea</label> <textarea placeholder=\"Default Input\" class=\"form-control\" id=\"textarea01\" ng-model=\"vm.text\" ng-focus=\"vm.textFrom = \'Input\'\"></textarea></span></label></div></div><br><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit();\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/tasks/annotation/edit.tasks.annotation.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/tasks/passages/edit.tasks.passages.create.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/edit/tasks/passages/edit.tasks.passages.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New Passage</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Passages Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/tasks/review/edit.tasks.review.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/tasks/tokenization/edit.tasks.tokenization.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/projects/layers/edit.projects.layers.html","<div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Layers Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/form/inputs/widgets/checkboxesRadios.html","<div class=\"checkbox-demo-row\"><div class=\"input-demo checkbox-demo row\"><div class=\"col-md-4\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input type=\"checkbox\" id=\"inlineCheckbox01\" value=\"option1\"> <span>Check 1</span></label></div><div class=\"col-md-4\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input type=\"checkbox\" id=\"inlineCheckbox02\" value=\"option2\"> <span>Check 2</span></label></div><div class=\"col-md-4\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input type=\"checkbox\" id=\"inlineCheckbox03\" value=\"option3\"> <span>Check 3</span></label></div></div><div class=\"input-demo radio-demo row\"><div class=\"col-md-4\"><label class=\"radio-inline custom-radio nowrap\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio1\" value=\"option1\"> <span>Option 1</span></label></div><div class=\"col-md-4\"><label class=\"radio-inline custom-radio nowrap\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio2\" value=\"option2\"> <span>Option 2</span></label></div><div class=\"col-md-4\"><label class=\"radio-inline custom-radio nowrap\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio3\" value=\"option3\"> <span>Option3</span></label></div></div></div><div><div class=\"checkbox disabled\"><label class=\"custom-checkbox nowrap\"><input type=\"checkbox\" value=\"\" disabled=\"\"> <span>Checkbox is disabled</span></label></div><div class=\"radio disabled\"><label class=\"custom-radio nowrap\"><input type=\"radio\" name=\"optionsRadios\" id=\"optionsRadios3\" value=\"option3\" disabled=\"\"> <span>Disabled option</span></label></div></div>");
$templateCache.put("app/pages/form/inputs/widgets/inputGroups.html","<div class=\"input-group\"><span class=\"input-group-addon input-group-addon-primary addon-left\" id=\"basic-addon1\">@</span> <input type=\"text\" class=\"form-control with-primary-addon\" placeholder=\"Username\" aria-describedby=\"basic-addon1\"></div><div class=\"input-group\"><input type=\"text\" class=\"form-control with-warning-addon\" placeholder=\"Recipient\'s username\" aria-describedby=\"basic-addon2\"> <span class=\"input-group-addon input-group-addon-warning addon-right\" id=\"basic-addon2\">@example.com</span></div><div class=\"input-group\"><span class=\"input-group-addon addon-left input-group-addon-success\">$</span> <input type=\"text\" class=\"form-control with-success-addon\" aria-label=\"Amount (to the nearest dollar)\"> <span class=\"input-group-addon addon-right input-group-addon-success\">.00</span></div><div class=\"input-group\"><input type=\"text\" class=\"form-control with-danger-addon\" placeholder=\"Search for...\"> <span class=\"input-group-btn\"><button class=\"btn btn-danger\" type=\"button\">Go!</button></span></div>");
$templateCache.put("app/pages/form/inputs/widgets/standardFields.html","<form><div class=\"form-group\"><label for=\"input01\">Text</label> <input type=\"text\" class=\"form-control\" id=\"input01\" placeholder=\"Text\"></div><div class=\"form-group\"><label for=\"input02\">Password</label> <input type=\"password\" class=\"form-control\" id=\"input02\" placeholder=\"Password\"></div><div class=\"form-group\"><label for=\"input03\">Rounded Corners</label> <input type=\"text\" class=\"form-control form-control-rounded\" id=\"input03\" placeholder=\"Rounded Corners\"></div><div class=\"form-group\"><label for=\"input04\">With help</label> <input type=\"text\" class=\"form-control\" id=\"input04\" placeholder=\"With help\"> <span class=\"help-block sub-little-text\">A block of help text that breaks onto a new line and may extend beyond one line.</span></div><div class=\"form-group\"><label for=\"input05\">Disabled Input</label> <input type=\"text\" class=\"form-control\" id=\"input05\" placeholder=\"Disabled Input\" disabled=\"\"></div><div class=\"form-group\"><label for=\"textarea01\">Textarea</label> <textarea placeholder=\"Default Input\" class=\"form-control\" id=\"textarea01\"></textarea></div><div class=\"form-group\"><input type=\"text\" class=\"form-control input-sm\" id=\"input2\" placeholder=\"Small Input\"></div><div class=\"form-group\"><input type=\"text\" class=\"form-control input-lg\" id=\"input4\" placeholder=\"Large Input\"></div></form>");
$templateCache.put("app/pages/form/inputs/widgets/validationStates.html","<div class=\"form-group has-success\"><label class=\"control-label\" for=\"inputSuccess1\">Input with success</label> <input type=\"text\" class=\"form-control\" id=\"inputSuccess1\"></div><div class=\"form-group has-warning\"><label class=\"control-label\" for=\"inputWarning1\">Input with warning</label> <input type=\"text\" class=\"form-control\" id=\"inputWarning1\"></div><div class=\"form-group has-error\"><label class=\"control-label\" for=\"inputError1\">Input with error</label> <input type=\"text\" class=\"form-control\" id=\"inputError1\"></div><div class=\"has-success\"><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\" id=\"checkboxSuccess\" value=\"option1\"> <span>Checkbox with success</span></label></div></div><div class=\"has-warning\"><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\" id=\"checkboxWarning\" value=\"option1\"> <span>Checkbox with warning</span></label></div></div><div class=\"has-error\"><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\" id=\"checkboxError\" value=\"option1\"> <span>Checkbox with error</span></label></div></div><div class=\"form-group has-success has-feedback\"><label class=\"control-label\" for=\"inputSuccess2\">Input with success</label> <input type=\"text\" class=\"form-control\" id=\"inputSuccess2\" aria-describedby=\"inputSuccess2Status\"> <i class=\"ion-checkmark-circled form-control-feedback\" aria-hidden=\"true\"></i> <span id=\"inputSuccess2Status\" class=\"sr-only\">(success)</span></div><div class=\"form-group has-warning has-feedback\"><label class=\"control-label\" for=\"inputWarning2\">Input with warning</label> <input type=\"text\" class=\"form-control\" id=\"inputWarning2\" aria-describedby=\"inputWarning2Status\"> <i class=\"ion-alert-circled form-control-feedback\" aria-hidden=\"true\"></i> <span id=\"inputWarning2Status\" class=\"sr-only\">(warning)</span></div><div class=\"form-group has-error has-feedback\"><label class=\"control-label\" for=\"inputError2\">Input with error</label> <input type=\"text\" class=\"form-control\" id=\"inputError2\" aria-describedby=\"inputError2Status\"> <i class=\"ion-android-cancel form-control-feedback\" aria-hidden=\"true\"></i> <span id=\"inputError2Status\" class=\"sr-only\">(error)</span></div><div class=\"form-group has-success has-feedback\"><label class=\"control-label\" for=\"inputGroupSuccess1\">Input group with success</label><div class=\"input-group\"><span class=\"input-group-addon addon-left\">@</span> <input type=\"text\" class=\"form-control\" id=\"inputGroupSuccess1\" aria-describedby=\"inputGroupSuccess1Status\"></div><i class=\"ion-checkmark-circled form-control-feedback\" aria-hidden=\"true\"></i> <span id=\"inputGroupSuccess1Status\" class=\"sr-only\">(success)</span></div>");
$templateCache.put("app/pages/form/layouts/widgets/basicForm.html","<form><div class=\"form-group\"><label for=\"exampleInputEmail1\">Email address</label> <input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" placeholder=\"Email\"></div><div class=\"form-group\"><label for=\"exampleInputPassword1\">Password</label> <input type=\"password\" class=\"form-control\" id=\"exampleInputPassword1\" placeholder=\"Password\"></div><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\"> <span>Check me out</span></label></div><button type=\"submit\" class=\"btn btn-danger\">Submit</button></form>");
$templateCache.put("app/pages/form/layouts/widgets/blockForm.html","<div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><label for=\"inputFirstName\">First Name</label> <input type=\"text\" class=\"form-control\" id=\"inputFirstName\" placeholder=\"First Name\"></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label for=\"inputLastName\">Last Name</label> <input type=\"text\" class=\"form-control\" id=\"inputLastName\" placeholder=\"Last Name\"></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><label for=\"inputFirstName\">Email</label> <input type=\"email\" class=\"form-control\" id=\"inputEmail\" placeholder=\"Email\"></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label for=\"inputWebsite\">Website</label> <input type=\"text\" class=\"form-control\" id=\"inputWebsite\" placeholder=\"Website\"></div></div></div><button type=\"submit\" class=\"btn btn-primary\">Submit</button>");
$templateCache.put("app/pages/form/layouts/widgets/formWithoutLabels.html","<form><div class=\"form-group\"><input type=\"text\" class=\"form-control\" placeholder=\"Recipients\"></div><div class=\"form-group\"><input type=\"text\" class=\"form-control\" placeholder=\"Subject\"></div><div class=\"form-group\"><textarea class=\"form-control\" placeholder=\"Message\"></textarea></div><button type=\"submit\" class=\"btn btn-success\">Send</button></form>");
$templateCache.put("app/pages/form/layouts/widgets/horizontalForm.html","<form class=\"form-horizontal\"><div class=\"form-group\"><label for=\"inputEmail3\" class=\"col-sm-2 control-label\">Email</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"inputEmail3\" placeholder=\"Email\"></div></div><div class=\"form-group\"><label for=\"inputPassword3\" class=\"col-sm-2 control-label\">Password</label><div class=\"col-sm-10\"><input type=\"password\" class=\"form-control\" id=\"inputPassword3\" placeholder=\"Password\"></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\"> <span>Remember me</span></label></div></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-warning\">Sign in</button></div></div></form>");
$templateCache.put("app/pages/form/layouts/widgets/inlineForm.html","<form class=\"row form-inline\"><div class=\"form-group col-sm-3 col-xs-6\"><input type=\"text\" class=\"form-control\" id=\"exampleInputName2\" placeholder=\"Name\"></div><div class=\"form-group col-sm-3 col-xs-6\"><input type=\"email\" class=\"form-control\" id=\"exampleInputEmail2\" placeholder=\"Email\"></div><div class=\"checkbox\"><label class=\"custom-checkbox\"><input type=\"checkbox\"> <span>Remember me</span></label></div><button type=\"submit\" class=\"btn btn-primary\">Send invitation</button></form>");
$templateCache.put("app/pages/form/layouts/widgets/search.html","<div class=\"row\"><field class=\"form-field\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.search\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.search(vm.smartTableStructure,vm.searchTable);\">Search</button>");
$templateCache.put("app/pages/ui/icons/widgets/fontAwesomeIcons.html","<div class=\"row icons-list success awesomeIcons\"><div class=\"col-xs-2\" ng-repeat=\"icon in icons.fontAwesomeIcons\"><i class=\"fa {{icon}}\"></i></div></div><a href=\"http://fortawesome.github.io/Font-Awesome/icons/\" target=\"_blank\" class=\"see-all-icons\">See all Font Awesome icons</a>");
$templateCache.put("app/pages/ui/icons/widgets/ionicons.html","<div class=\"row icons-list primary\"><div class=\"col-xs-2\" ng-repeat=\"icon in icons.ionicons\"><i class=\"{{icon}}\"></i></div></div><a href=\"http://ionicons.com/\" target=\"_blank\" class=\"see-all-icons\">See all ionicons icons</a>");
$templateCache.put("app/pages/ui/icons/widgets/kameleon.html","<div class=\"row clearfix\"><div class=\"kameleon-row\" ng-repeat=\"icon in icons.kameleonIcons\"><div class=\"kameleon-icon\"><img ng-src=\"{{:: (icon.img | kameleonImg )}}\"><span>{{icon.name}}</span></div></div></div><a href=\"http://www.kameleon.pics/\" target=\"_blank\" class=\"see-all-icons\">See all Kamaleon icons</a>");
$templateCache.put("app/pages/ui/icons/widgets/kameleonRounded.html","<div class=\"row clearfix\"><div class=\"kameleon-row\" ng-repeat=\"icon in icons.kameleonRoundedIcons\"><div class=\"kameleon-icon with-round-bg {{icon.color}}\"><img ng-src=\"{{::( icon.img | kameleonImg )}}\"><span>{{ icon.name }}</span></div></div></div><a href=\"http://www.kameleon.pics/\" target=\"_blank\" class=\"see-all-icons\">See all Kamaleon icons</a>");
$templateCache.put("app/pages/ui/icons/widgets/socicon.html","<div class=\"row icons-list danger\"><div class=\"col-xs-2\" ng-repeat=\"icon in icons.socicon\"><i class=\"socicon\">{{ icon }}</i></div></div><a href=\"http://www.socicon.com/chart.php\" target=\"_blank\" class=\"see-all-icons\">See all Socicon icons</a>");
$templateCache.put("app/pages/ui/modals/modalTemplates/basicModal.html","<div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-label=\"Close\"><em class=\"ion-ios-close-empty sn-link-close\"></em></button><h4 class=\"modal-title\" id=\"myModalLabel\">Modal title</h4></div><div class=\"modal-body\">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"$dismiss()\">Save changes</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/dangerModal.html","<div class=\"modal-content\"><div class=\"modal-header bg-danger\"><i class=\"ion-flame modal-icon\"></i><span>Pay Attention!</span></div><div class=\"modal-body text-center\">{{message}}</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"$close(true)\">OK</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"$dismiss(false)\">Cancel</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/htmlContentModal.html","<div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-label=\"Close\"><em class=\"ion-ios-close-empty sn-link-close\"></em></button><h4 class=\"modal-title\">{{name}}</h4></div><div class=\"modal-body\"><div ng-bind-html=\"htmlContent\"></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"$dismiss()\">Ok</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/infoModal.html","<div class=\"modal-content\"><div class=\"modal-header bg-info\"><i class=\"ion-information-circled modal-icon\"></i><span>Information</span></div><div class=\"modal-body text-center\">You\'ve got a new email!</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-info\" ng-click=\"$dismiss()\">OK</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/largeModal.html","<div class=\"modal-content\" id=\"html-content-modal\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-label=\"Close\"><em class=\"ion-ios-close-empty sn-link-close\"></em></button><h4 class=\"modal-title\" ng-if=\"!!name\">{{::name}}</h4></div><div class=\"modal-body\"><span ng-if=\"!!description\" ng-bind-html=\"description\"></span><pre ng-if=\"!!jsonString\">{{::jsonString}}</pre></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"$dismiss()\">Ok</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/smallModal.html","<div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-label=\"Close\"><em class=\"ion-ios-close-empty sn-link-close\"></em></button><h4 class=\"modal-title\">Modal title</h4></div><div class=\"modal-body\">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"$dismiss()\">Save changes</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/successModal.html","<div class=\"modal-content\"><div class=\"modal-header bg-success\"><i class=\"ion-checkmark modal-icon\"></i><span>Success</span></div><div class=\"modal-body text-center\">Your information has been saved successfully</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-success\" ng-click=\"$dismiss()\">OK</button></div></div>");
$templateCache.put("app/pages/ui/modals/modalTemplates/warningModal.html","<div class=\"modal-content\"><div class=\"modal-header bg-warning\"><i class=\"ion-android-warning modal-icon\"></i><span>Warning</span></div><div class=\"modal-body text-center\">Your computer is about to explode!</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-warning\" ng-click=\"$dismiss()\">OK</button></div></div>");
$templateCache.put("app/pages/ui/modals/notifications/notifications.html","<div class=\"modal-buttons same-width clearfix\" ng-controller=\"NotificationsCtrl\"><button type=\"button\" class=\"btn btn-success\" ng-click=\"showSuccessMsg()\">Success Notification</button> <button type=\"button\" class=\"btn btn-info\" ng-click=\"showInfoMsg()\">Info Notification</button> <button type=\"button\" class=\"btn btn-warning\" ng-click=\"showWarningMsg()\">Warning Notification</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"showErrorMsg()\">Danger Notification</button></div>");
$templateCache.put("app/pages/ui/buttons/widgets/buttonGroups.html","<div class=\"btn-group-example\"><div class=\"btn-group\" role=\"group\" aria-label=\"Basic example\"><button type=\"button\" class=\"btn btn-danger\">Left</button> <button type=\"button\" class=\"btn btn-danger\">Middle</button> <button type=\"button\" class=\"btn btn-danger\">Right</button></div></div><div class=\"btn-toolbar-example\"><div class=\"btn-toolbar\" role=\"toolbar\" aria-label=\"Toolbar with button groups\"><div class=\"btn-group\" role=\"group\" aria-label=\"First group\"><button type=\"button\" class=\"btn btn-primary\">1</button> <button type=\"button\" class=\"btn btn-primary\">2</button> <button type=\"button\" class=\"btn btn-primary\">3</button> <button type=\"button\" class=\"btn btn-primary\">4</button></div><div class=\"btn-group\" role=\"group\" aria-label=\"Second group\"><button type=\"button\" class=\"btn btn-primary\">5</button> <button type=\"button\" class=\"btn btn-primary\">6</button> <button type=\"button\" class=\"btn btn-primary\">7</button></div><div class=\"btn-group\" role=\"group\" aria-label=\"Third group\"><button type=\"button\" class=\"btn btn-primary\">8</button></div></div></div>");
$templateCache.put("app/pages/ui/buttons/widgets/buttons.html","<div class=\"basic-btns\"><div class=\"row\"><div class=\"col-md-2\"><h5>Default button</h5></div><div class=\"col-md-10\"><div class=\"row btns-row btns-same-width-md\"><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-primary\">Primary</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-default\">Default</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-success\">Success</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-info\">Info</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-warning\">Warning</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-danger\">Danger</button></div></div></div></div><div class=\"row\"><div class=\"col-md-2\"><h5 class=\"row-sm\">Small button</h5></div><div class=\"col-md-10\"><div class=\"row btns-row btns-same-width-md\"><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-primary btn-sm\">Primary</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-default btn-sm\">Default</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-success btn-sm\">Success</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-info btn-sm\">Info</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-warning btn-sm\">Warning</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-danger btn-sm\">Danger</button></div></div></div></div><div class=\"row\"><div class=\"col-md-2\"><h5 class=\"row-xs\">Extra small button</h5></div><div class=\"col-md-10\"><div class=\"row btns-row btns-same-width-md\"><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-primary btn-xs\">Primary</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-default btn-xs\">Default</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-success btn-xs\">Success</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-info btn-xs\">Info</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-warning btn-xs\">Warning</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-danger btn-xs\">Danger</button></div></div></div></div><div class=\"row\"><div class=\"col-md-2\"><h5>Disabled button</h5></div><div class=\"col-md-10\"><div class=\"row btns-row btns-same-width-md\"><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-primary\" disabled=\"disabled\">Primary</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-default\" disabled=\"disabled\">Default</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-success\" disabled=\"disabled\">Success</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-info\" disabled=\"disabled\">Info</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-warning\" disabled=\"disabled\">Warning</button></div><div class=\"col-sm-2 col-xs-4\"><button type=\"button\" class=\"btn btn-danger\" disabled=\"disabled\">Danger</button></div></div></div></div></div>");
$templateCache.put("app/pages/ui/buttons/widgets/dropdowns.html","<div class=\"row btns-row\"><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-primary\" uib-dropdown-toggle=\"\">Primary <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-success\" uib-dropdown-toggle=\"\">Success <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-info\" uib-dropdown-toggle=\"\">Info <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-default\" uib-dropdown-toggle=\"\">Default <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-warning\" uib-dropdown-toggle=\"\">Warning <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-danger\" uib-dropdown-toggle=\"\">Danger <span class=\"caret\"></span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div></div><h5 class=\"panel-subtitle\">Split button dropdowns</h5><div class=\"row btns-row\"><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-primary\">Primary</button> <button type=\"button\" class=\"btn btn-primary\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-success\">Success</button> <button type=\"button\" class=\"btn btn-success\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-info\">Info</button> <button type=\"button\" class=\"btn btn-info\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-default\">Default</button> <button type=\"button\" class=\"btn btn-default\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-warning\">Warning</button> <button type=\"button\" class=\"btn btn-warning\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div><div class=\"col-sm-4 col-xs-6\"><div class=\"btn-group\" uib-dropdown=\"\" dropdown-append-to-body=\"\"><button type=\"button\" class=\"btn btn-danger\">Danger</button> <button type=\"button\" class=\"btn btn-danger\" uib-dropdown-toggle=\"\"><span class=\"caret\"></span> <span class=\"sr-only\">Toggle Dropdown</span></button><ul uib-dropdown-menu=\"\"><li><a href=\"\">Action</a></li><li><a href=\"\">Another action</a></li><li><a href=\"\">Something else here</a></li><li role=\"separator\" class=\"divider\"></li><li><a href=\"\">Separated link</a></li></ul></div></div></div>");
$templateCache.put("app/pages/ui/buttons/widgets/iconButtons.html","<ul class=\"btn-list clearfix\"><li><button type=\"button\" class=\"btn btn-primary btn-icon\"><i class=\"ion-android-download\"></i></button></li><li><button type=\"button\" class=\"btn btn-default btn-icon\"><i class=\"ion-stats-bars\"></i></button></li><li><button type=\"button\" class=\"btn btn-success btn-icon\"><i class=\"ion-android-checkmark-circle\"></i></button></li><li><button type=\"button\" class=\"btn btn-info btn-icon\"><i class=\"ion-information\"></i></button></li><li><button type=\"button\" class=\"btn btn-warning btn-icon\"><i class=\"ion-android-warning\"></i></button></li><li><button type=\"button\" class=\"btn btn-danger btn-icon\"><i class=\"ion-nuclear\"></i></button></li></ul><h5 class=\"panel-subtitle\">Buttons with icons</h5><ul class=\"btn-list clearfix\"><li><button type=\"button\" class=\"btn btn-primary btn-with-icon\"><i class=\"ion-android-download\"></i>Primary</button></li><li><button type=\"button\" class=\"btn btn-default btn-with-icon\"><i class=\"ion-stats-bars\"></i>Default</button></li><li><button type=\"button\" class=\"btn btn-success btn-with-icon\"><i class=\"ion-android-checkmark-circle\"></i>Success</button></li><li><button type=\"button\" class=\"btn btn-info btn-with-icon\"><i class=\"ion-information\"></i>Info</button></li><li><button type=\"button\" class=\"btn btn-warning btn-with-icon\"><i class=\"ion-android-warning\"></i>Warning</button></li><li><button type=\"button\" class=\"btn btn-danger btn-with-icon\"><i class=\"ion-nuclear\"></i>Danger</button></li></ul>");
$templateCache.put("app/pages/ui/buttons/widgets/largeButtons.html","<div class=\"row btns-row btns-same-width-lg\"><div class=\"col-sm-4 col-xs-6\"><button type=\"button\" class=\"btn btn-primary btn-lg\">Primary</button></div><div class=\"col-sm-4 col-xs-6\"><button type=\"button\" class=\"btn btn-success btn-lg\">Success</button></div><div class=\"col-sm-4 col-xs-6\"><button type=\"button\" class=\"btn btn-info btn-lg\">Info</button></div><div class=\"col-sm-4 col-xs-6\"><button type=\"button\" class=\"btn btn-default btn-lg\">Default</button></div><div class=\"col-sm-4 col-xs-6\"><button type=\"button\" class=\"btn btn-warning btn-lg\">Warning</button></div><div class=\"col-sm-4 col-xs-6\"><button type=\"button\" class=\"btn btn-danger btn-lg\">Danger</button></div></div>");
$templateCache.put("app/pages/ui/buttons/widgets/progressButtons.html","<div class=\"progress-buttons-container text-center default-text\"><div class=\"row\"><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">fill horizontal</span> <button progress-button=\"progressFunction()\" class=\"btn btn-success\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">fill vertical</span> <button progress-button=\"progressFunction()\" pb-direction=\"vertical\" class=\"btn btn-danger\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">shrink horizontal</span> <button progress-button=\"progressFunction()\" pb-style=\"shrink\" class=\"btn btn-warning\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">shrink vertical</span> <button progress-button=\"progressFunction()\" pb-style=\"shrink\" pb-direction=\"vertical\" class=\"btn btn-info\">Submit</button></section></div><div class=\"row\"><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-angle-bottom<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-angle-bottom\" class=\"btn btn-success\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-angle-top<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-angle-top\" class=\"btn btn-danger\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-angle-left<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-angle-left\" class=\"btn btn-warning\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-angle-right<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-angle-right\" class=\"btn btn-info\">Submit</button></section></div><div class=\"row\"><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-side-down<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-side-down\" class=\"btn btn-success\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-side-up<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-side-up\" class=\"btn btn-danger\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-side-left<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-side-left\" class=\"btn btn-warning\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-side-right<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-side-right\" class=\"btn btn-info\">Submit</button></section></div><div class=\"row\"><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">rotate-back<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"rotate-back\" class=\"btn btn-success\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">flip-open<br>perspective</span> <button progress-button=\"progressFunction()\" pb-style=\"flip-open\" class=\"btn btn-danger\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">slide-down<br>horizontal</span> <button progress-button=\"progressFunction()\" pb-style=\"slide-down\" class=\"btn btn-warning\">Submit</button></section><section class=\"col-md-6 col-lg-3\"><span class=\"button-title\">move-up<br>horizontal</span> <button progress-button=\"progressFunction()\" pb-style=\"move-up\" class=\"btn btn-info\">Submit</button></section></div><div class=\"row\"><section class=\"col-md-6\"><span class=\"button-title\">top-line<br>horizontal</span> <button progress-button=\"progressFunction()\" pb-style=\"top-line\" class=\"btn btn-success\">Submit</button></section><section class=\"col-md-6\"><span class=\"button-title\">lateral-lines<br>vertical</span> <button progress-button=\"progressFunction()\" pb-style=\"lateral-lines\" class=\"btn btn-info\">Submit</button></section></div></div>");
$templateCache.put("app/pages/ui/progressBars/widgets/animated.html","<div class=\"progress\"><div class=\"progress-bar progress-bar-success progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"40\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 40%\"><span class=\"sr-only\">40% Complete (success)</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-info progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"><span class=\"sr-only\">60% Complete (warning)</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (danger)</span></div></div>");
$templateCache.put("app/pages/ui/progressBars/widgets/basic.html","<div class=\"progress\"><div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"40\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 40%\"><span class=\"sr-only\">40% Complete (success)</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"><span class=\"sr-only\">60% Complete (warning)</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (danger)</span></div></div>");
$templateCache.put("app/pages/ui/progressBars/widgets/label.html","<div class=\"progress\"><div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"40\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 40%\">40% Complete (success)</div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\">20% Complete</div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\">60% Complete (warning)</div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\">80% Complete (danger)</div></div>");
$templateCache.put("app/pages/ui/progressBars/widgets/stacked.html","<div class=\"progress\"><div class=\"progress-bar progress-bar-success\" style=\"width: 35%\"><span class=\"sr-only\">35% Complete (success)</span></div><div class=\"progress-bar progress-bar-warning progress-bar-striped\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete (warning)</span></div><div class=\"progress-bar progress-bar-danger\" style=\"width: 10%\"><span class=\"sr-only\">10% Complete (danger)</span></div><div class=\"progress-bar progress-bar-info progress-bar-striped active\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete (warning)</span></div></div>");
$templateCache.put("app/pages/ui/progressBars/widgets/striped.html","<div class=\"progress\"><div class=\"progress-bar progress-bar-success progress-bar-striped\" role=\"progressbar\" aria-valuenow=\"40\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 40%\"><span class=\"sr-only\">40% Complete (success)</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-info progress-bar-striped\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning progress-bar-striped\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"><span class=\"sr-only\">60% Complete (warning)</span></div></div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger progress-bar-striped\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (danger)</span></div></div>");
$templateCache.put("app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.create.html","<div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.newCategory()\">Add New Category</button></div><smart-inner-table table-data=\"vm.parentCategoriesSmartTableData\" category-name=\"parent\" ctrl-module=\"vm\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\" id=\"categories-table\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"join the categories into\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.save();\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div>");
$templateCache.put("app/pages/edit/layers/extension/categories/edit.layers.extension.categories.create.html","<div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ui-sref=\"edit.layers.extension\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/layers/extension/categories/edit.layers.extension.categories.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.newCategory()\">Add New Category</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Categories Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/layers/extension/restrictions/edit.layers.extension.restrictions.create.html","");
$templateCache.put("app/pages/edit/layers/extension/restrictions/edit.layers.extension.restrictions.html","<div class=\"row\"><div class=\"col-md-12 nissim\"><div ba-panel=\"\" ba-panel-title=\"Restrictions Table\" ba-panel-class=\"with-scroll\"><smart-inner-table table-data=\"vm.smartTableData\" ctrl-module=\"vm\" category-name=\"category_1\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div><span>Restriction Type:</span> <label for=\"inputLastName\">{{::formElem.name}}</label><select class=\"form-control selectpicker\" selectpicker=\"\" ng-disabled=\"formElem.disabled\" ng-model=\"vm.restrictionType\" ng-options=\"item as item.name for item in vm.restrictionsTypes track by item.value\"></select></div><smart-inner-table table-data=\"vm.affectedSmartTableData\" ctrl-module=\"vm\" category-name=\"category_2\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.save();\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div></div></div></div>");
$templateCache.put("app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.create.html","<div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ui-sref=\"edit.layers.refinement\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.newCategory()\">Add New Category</button></div><smart-inner-table table-data=\"vm.parentCategoriesSmartTableData\" category-name=\"parent\" ctrl-module=\"vm\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\" id=\"categories-table\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Categories Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.save();\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div>");
$templateCache.put("app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.create.html","");
$templateCache.put("app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.html","<div class=\"row\"><div class=\"col-md-12 nissim\"><div ba-panel=\"\" ba-panel-title=\"Restrictions Table\" ba-panel-class=\"with-scroll\"><smart-inner-table table-data=\"vm.smartTableData\" ctrl-module=\"vm\" category-name=\"category_1\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div><span>Restriction Type:</span> <label for=\"inputLastName\">{{::formElem.name}}</label><select class=\"form-control selectpicker\" selectpicker=\"\" ng-disabled=\"formElem.disabled\" ng-model=\"vm.restrictionType\" ng-options=\"item as item.name for item in vm.restrictionsTypes track by item.value\"></select></div><smart-inner-table table-data=\"vm.affectedSmartTableData\" ctrl-module=\"vm\" category-name=\"category_2\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.save();\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div></div></div></div>");
$templateCache.put("app/pages/edit/layers/root/categories/edit.layers.root.categories.create.html","<div class=\"row\"><div class=\"col-md-12\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\" ng-if=\"formElem.showInTable\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.upsert(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vmEditCtrl.back();\">Cancel</button></div></div>");
$templateCache.put("app/pages/edit/layers/root/categories/edit.layers.root.categories.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.newCategory()\">Add New Category</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Categories Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/layers/root/restrictions/edit.layers.root.restrictions.create.html","");
$templateCache.put("app/pages/edit/layers/root/restrictions/edit.layers.root.restrictions.html","<div class=\"row\"><div class=\"col-md-12 nissim\"><div ba-panel=\"\" ba-panel-title=\"Restrictions Table\" ba-panel-class=\"with-scroll\"><smart-inner-table table-data=\"vm.smartTableData\" ctrl-module=\"vm\" category-name=\"category_1\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div><span>Restriction Type:</span> <label for=\"inputLastName\">{{::formElem.name}}</label><select class=\"form-control selectpicker\" selectpicker=\"\" ng-disabled=\"formElem.disabled\" ng-model=\"vm.restrictionType\" ng-options=\"item as item.name for item in vm.restrictionsTypes track by item.value\"></select></div><smart-inner-table table-data=\"vm.affectedSmartTableData\" ctrl-module=\"vm\" category-name=\"category_2\" page-name=\"vm.pageName\" load-select-data-structure=\"true\" view-only=\"true\"></smart-inner-table><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.save();\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div></div></div></div>");
$templateCache.put("app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.create.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/edit/tasks/annotation/annotator/edit.tasks.annotation.annotator.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New Passage</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Users Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.create.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/edit/tasks/review/annotator/edit.tasks.review.annotator.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New Passage</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Users Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.create.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New Passage</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Users Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.create.html","<div class=\"row\"><div class=\"col-md-6\" ba-panel=\"\"><div class=\"row\"><field class=\"form-field col-md-12\" ng-repeat=\"formElem in vm.smartTableStructure | orderBy:\'order\' track by $index\"></field></div><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.edit(vm.smartTableStructure);\">Submit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.back();\">Cancel</button></div><div class=\"col-md-6\"><ui-view></ui-view></div></div>");
$templateCache.put("app/pages/edit/tasks/tokenization/passages/edit.tasks.tokenization.passages.html","<div><button type=\"button\" class=\"btn btn-sm btn-primary\" ng-click=\"vm.editRow({})\">Add New Passage</button></div><div ba-panel=\"\" ba-panel-title=\"Search Form\" ba-panel-class=\"with-scroll\"><div ng-include=\"\'app/pages/form/layouts/widgets/search.html\'\"></div></div><div class=\"row\"><div class=\"col-md-12\"><div ba-panel=\"\" ba-panel-title=\"Passages Table\" ba-panel-class=\"with-scroll\"><div include-with-scope=\"app/pages/tables/widgets/smartTable.html\"></div></div></div></div>");
$templateCache.put("app/pages/form/inputs/widgets/field/field.html","<div ng-switch=\"formElem.type\" class=\"col-sm-2\"><div ng-switch-when=\"text\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label> <input type=\"text\" ng-disabled=\"formElem.disabled\" ng-model=\"formElem.value\" class=\"form-control\" placeholder=\"{{::formElem.placeholder}}\"></div><div ng-switch-when=\"textInObject\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label> <input extract-object-name=\"\" field-elem=\"formElem.value\" type=\"text\" ng-disabled=\"formElem.disabled\" ng-model=\"formElem.value\" class=\"form-control\" placeholder=\"{{::formElem.placeholder}}\"></div><div ng-switch-when=\"email\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label> <input type=\"email\" ng-disabled=\"formElem.disabled\" ng-model=\"formElem.value\" class=\"form-control\" placeholder=\"{{::formElem.placeholder}}\"></div><div ng-switch-when=\"number\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label> <input type=\"number\" ng-disabled=\"formElem.disabled\" ng-model=\"formElem.value\" class=\"form-control\" placeholder=\"{{::formElem.placeholder}}\"></div><div ng-switch-when=\"select\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label><select class=\"form-control selectpicker\" selectpicker=\"\" ng-disabled=\"formElem.disabled\" ng-model=\"formElem.value\" ng-options=\"item as item.label for item in formElem.options track by item.id\"></select></div><div ng-switch-when=\"checkbox\" class=\"form-group\"><label class=\"checkbox-inline custom-checkbox nowrap\"><input type=\"checkbox\" ng-disabled=\"formElem.disabled\" ng-model=\"formElem.value\"> <span>{{::formElem.name}}</span></label></div><div ng-switch-when=\"button\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label> <button class=\"btn btn-xs {{formElem.class}}\" ng-click=\"vm[formElem.functionName](formElem);\">{{::formElem.placeholder}}</button><pre ng-if=\"formElem.value\" language-align=\"{{::formElem.value}}\">\r\n			<span>{{formElem.value}}</span>\r\n		</pre></div><div ng-switch-when=\"table\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label> <button class=\"btn btn-xs {{formElem.class}}\" ng-click=\"vm[formElem.functionName](formElem);\" ng-disabled=\"::(formElem.viewOnlyRule && vm.viewOnlyRuleOk(formElem.viewOnlyRule))\" ng-if=\"formElem.value.length == 0\">{{::formElem.placeholder}}</button><smart-inner-table ng-if=\"formElem.value.length > 0\" table-data=\"formElem.value\" ctrl-module=\"vm\" page-name=\"formElem.key\" manage-page-route=\"formElem.managePageRoute\" view-only=\"formElem.viewOnly\" view-only-rule=\"formElem.viewOnlyRule\" is-sortable=\"formElem.isSortable\"></smart-inner-table></div><div ng-switch-when=\"editor\" class=\"form-group\"><label for=\"inputLastName\">{{::formElem.name}}</label><text-angular ng-model=\"formElem.value\" ta-toolbar=\"[[\'h1\',\'h2\',\'h3\',\'h4\',\'h5\',\'h6\',\'p\',\'pre\',\'quote\',\'bold\',\'italics\',\'underline\',\'strikeThrough\'], [\'ul\',\'ol\',\'undo\',\'redo\',\'clear\'], [\'justifyLeft\',\'justifyCenter\',\'justifyRight\',\'justifyFull\', \'indent\',\'outdent\',\'insertLink\']]\"></text-angular></div></div>");
$templateCache.put("app/pages/form/inputs/widgets/select/select.html","<div ng-controller=\"SelectpickerPanelCtrl as selectpickerVm\"><div class=\"form-group\"><select class=\"form-control selectpicker\" selectpicker=\"\" title=\"Standard Select\" ng-model=\"selectpickerVm.standardSelected\" ng-options=\"item as item.label for item in selectpickerVm.standardSelectItems\"></select></div><div class=\"form-group\"><select class=\"form-control selectpicker with-search\" data-live-search=\"true\" title=\"Select With Search\" selectpicker=\"\" ng-model=\"selectpickerVm.searchSelectedItem\" ng-options=\"item as item.label for item in selectpickerVm.selectWithSearchItems\"></select></div><div class=\"form-group\"><select class=\"form-control selectpicker\" title=\"Option Types\" selectpicker=\"\"><option>Standard option</option><option data-subtext=\"option subtext\">Option with subtext</option><option disabled=\"\">Disabled Option</option><option data-icon=\"glyphicon-heart\">Option with cion</option></select></div><div class=\"form-group\"><select class=\"form-control selectpicker\" disabled=\"\" title=\"Disabled Select\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" title=\"Select with Option Groups\" selectpicker=\"\" ng-model=\"selectpickerVm.groupedSelectedItem\" ng-options=\"item as item.label group by item.group for item in selectpickerVm.groupedSelectItems\"></select></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" title=\"Select with Divider\" selectpicker=\"\"><option>Group 1 - Option 1</option><option>Group 1 - Option 2</option><option data-divider=\"true\"></option><option>Group 2 - Option 1</option><option>Group 2 - Option 2</option></select></div></div></div><div class=\"form-group\"><select class=\"form-control\" title=\"Multiple Select\" multiple=\"\" selectpicker=\"\" ng-model=\"selectpickerVm.multipleSelectedItems\" ng-options=\"item as item.label for item in selectpickerVm.standardSelectItems\"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select></div><div class=\"form-group\"><select class=\"form-control\" title=\"Multiple Select with Limit\" multiple=\"\" data-max-options=\"2\" selectpicker=\"\" ng-model=\"selectpickerVm.multipleSelectedItems2\" ng-options=\"item as item.label for item in selectpickerVm.standardSelectItems\"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" title=\"Primary Select\" data-style=\"btn-primary\" data-container=\"body\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div><div class=\"form-group\"><select class=\"form-control\" title=\"Success Select\" data-style=\"btn-success\" data-container=\"body\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div><div class=\"form-group\"><select class=\"form-control\" title=\"Warning Select\" data-style=\"btn-warning\" data-container=\"body\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" title=\"Info Select\" data-style=\"btn-info\" data-container=\"body\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div><div class=\"form-group\"><select class=\"form-control\" title=\"Danger Select\" data-style=\"btn-danger\" data-container=\"body\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div><div class=\"form-group\"><select class=\"form-control\" title=\"Inverse Select\" data-style=\"btn-inverse\" data-container=\"body\" selectpicker=\"\"><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div></div></div></div>");
$templateCache.put("app/pages/form/inputs/widgets/tagsInput/tagsInput.html","<div class=\"form-group\"><div class=\"form-group\"><input type=\"text\" tag-input=\"primary\" value=\"Amsterdam,Washington,Sydney,Beijing,Cairo\" data-role=\"tagsinput\" placeholder=\"Add Tag\"></div><div class=\"form-group\"><input type=\"text\" tag-input=\"warning\" value=\"Minsk,Prague,Vilnius,Warsaw\" data-role=\"tagsinput\" placeholder=\"Add Tag\"></div><div class=\"form-group\"><input type=\"text\" tag-input=\"danger\" value=\"London,Berlin,Paris,Rome,Munich\" data-role=\"tagsinput\" placeholder=\"Add Tag\"></div></div>");
$templateCache.put("app/pages/form/inputs/widgets/switch/switch.html","<div ng-controller=\"SwitchPanelCtrl as switchPanelVm\" class=\"switches clearfix\"><switch color=\"primary\" ng-model=\"switchPanelVm.switcherValues.primary\"></switch><switch color=\"warning\" ng-model=\"switchPanelVm.switcherValues.warning\"></switch><switch color=\"danger\" ng-model=\"switchPanelVm.switcherValues.danger\"></switch><switch color=\"info\" ng-model=\"switchPanelVm.switcherValues.info\"></switch><switch color=\"success\" ng-model=\"switchPanelVm.switcherValues.success\"></switch></div>");}]);
//# sourceMappingURL=../maps/scripts/app-a6ed512ead.js.map
