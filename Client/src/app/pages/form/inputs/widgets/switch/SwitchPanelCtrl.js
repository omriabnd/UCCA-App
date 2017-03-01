
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
