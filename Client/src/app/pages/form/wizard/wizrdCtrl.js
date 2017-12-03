/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

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

