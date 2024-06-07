/* global angular, Stripe */

(function () {
  'use strict'

  angular
    .module('angularjs-stripe-elements', [])
    .provider('StripeElements', StripeElementsProvider)
    .directive('stripeElementDecorator', stripeElementDecorator)
    .component('stripeElement', getStripeElementComponent())

  function StripeElementsProvider () {
    var provider = this

    provider.apiKey = null
    provider.defaultElementsOptions = {}

    provider.setAPIKey = function (apiKey) {
      provider.apiKey = apiKey
    }

    provider.setDefaultElementsOptions = function (opts) {
      provider.defaultElementsOptions = opts
    }

    provider.$get = function () {
      return function (opts) {
        return wrap(Stripe(provider.apiKey, opts))
      }
    }

    function wrap (stripe) {
      var proxy = new Proxy(stripe, {
        get: function (target, key) {
          if (key == 'elements') {
            return function (opts) {
              opts = angular.merge({}, provider.defaultElementsOptions, opts)
              return target.elements(opts)
            }
          } else {
            return target[key]
          }
        }
      })

      return proxy
    }
  }

  function stripeElementDecorator () {
    return {
      restrict: 'A',
      link: link
    }

    function link ($scope, $element, $attr) {
      var $ctrl = $scope.$ctrl

      $scope.$on('$destroy', function () {
        $ctrl.instance.destroy()
      })

      $ctrl.instance.mount($element[0])
    }
  }

  function getStripeElementComponent () {
    return {
      template: '<div stripe-element-decorator></div>',
      controller: function () {},
      bindings: {
        instance: '<'
      }
    }
  }
})();
