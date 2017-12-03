
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

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
