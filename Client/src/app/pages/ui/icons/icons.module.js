
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

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
