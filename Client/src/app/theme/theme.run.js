
(function () {
  'use strict';

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

    $q.all(whatToWait).then(function () {
      $rootScope.$pageFinishedLoading = true;
    });

    $timeout(function () {
      if (!$rootScope.$pageFinishedLoading) {
        $rootScope.$pageFinishedLoading = true;
      }
    }, 7000);

    $rootScope.$baSidebarService = baSidebarService;
  }

})();