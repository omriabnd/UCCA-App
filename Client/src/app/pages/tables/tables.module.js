
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

//   angular.module('zAdmin.pages').filter('customFilter', ['$parse', function($parse) {
//     return function(items, filters) {
//     	console.log("### custom filter")
//         var itemsLeft = items.slice();
//
//         Object.keys(filters).forEach(function(model) {
//             var value = filters[model],
//                 getter = $parse(model);
//
//             itemsLeft = itemsLeft.filter(function(item) {
//                 return getter(item) === value;
//             });
//         });
//
//         return itemsLeft;
//     };
// }])

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
