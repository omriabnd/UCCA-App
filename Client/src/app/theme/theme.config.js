
(function () {
  'use strict';

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
