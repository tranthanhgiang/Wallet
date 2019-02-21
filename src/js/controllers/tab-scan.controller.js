'use strict';

(function () {

angular
  .module('copayApp.controllers')
  .controller('tabScanController', tabScanController);
  
  function tabScanController(
    gettextCatalog
    , popupService
    , qrReaderService
    , $scope
    , $log
    , $timeout
    , scannerService
    , incomingDataService
    , $state
    , $ionicHistory
    , $rootScope
    , $ionicNavBarDelegate
    ) {

    var scannerStates = {
      unauthorized: 'unauthorized',
      denied: 'denied',
      unavailable: 'unavailable',
      loading: 'loading',
      visible: 'visible'
    };

    $scope.onStart = onStart;
    $scope.scannerStates = scannerStates;

    function _updateCapabilities(){
      var capabilities = scannerService.getCapabilities();
      $scope.scannerIsAvailable = capabilities.isAvailable;
      $scope.scannerHasPermission = capabilities.hasPermission;
      $scope.scannerIsDenied = capabilities.isDenied;
      $scope.scannerIsRestricted = capabilities.isRestricted;
      $scope.canEnableLight = capabilities.canEnableLight;
      $scope.canChangeCamera = capabilities.canChangeCamera;
      $scope.canOpenSettings = capabilities.canOpenSettings;
    }

    function _handleCapabilities(){
      // always update the view
      /*
      $timeout(function(){
        if(!scannerService.isInitialized()){
          $scope.currentState = scannerStates.loading;
        } else if(!$scope.scannerIsAvailable){
          $scope.currentState = scannerStates.unavailable;
        } else if($scope.scannerIsDenied){
          $scope.currentState = scannerStates.denied;
        } else if($scope.scannerIsRestricted){
          $scope.currentState = scannerStates.denied;
        } else if(!$scope.scannerHasPermission){
          $scope.currentState = scannerStates.unauthorized;
        }
        $log.debug('Scan view state set to: ' + $scope.currentState);
      });
      */
    }

    function _refreshScanView(){
      _updateCapabilities();
      _handleCapabilities();
      if($scope.scannerHasPermission){
        activate();
      }
    }

    // This could be much cleaner with a Promise API
    // (needs a polyfill for some platforms)
    /*
    $rootScope.$on('scannerServiceInitialized', function(){
      $log.debug('Scanner initialization finished, reinitializing scan view...');
      _refreshScanView();
    });
    */

    $scope.$on("$ionicView.enter", function(event, data) {
      $ionicNavBarDelegate.showBar(true);
    });

    $scope.$on("$ionicView.afterEnter", function() {
      startReading();
      /*
      window.qrreader.startReading(
        function onSuccess(result) {
          console.log('qrreader startReading() result:', result);

          handleSuccessfulScan(result);
        },
        function onError(error) {
          console.error('qrreader startReading() error:', error);
        });
        */

      /*
      var capabilities = scannerService.getCapabilities();
      if (capabilities.hasPermission) {
        // try initializing and refreshing status any time the view is entered
        if(!scannerService.isInitialized()) {
          scannerService.gentleInitialize();
        } else {
          activate();
        }
      }
      */
    });

    function activate(){
      /*
      scannerService.activate(function(){
        _updateCapabilities();
        _handleCapabilities();
        $log.debug('Scanner activated, setting to visible...');
        $scope.currentState = scannerStates.visible;
          // pause to update the view
          $timeout(function(){
            scannerService.scan(function(err, contents){
            if(err){
              $log.debug('Scan canceled.');
            } else if ($state.params.passthroughMode) {
              $rootScope.scanResult = contents.result || contents;
              goBack();
            } else {
              handleSuccessfulScan(contents);
            }
            });
            // resume preview if paused
            scannerService.resumePreview();
          });
      });
      */
    }
    $scope.activate = activate;

    $scope.authorize = function(){
      /*
      scannerService.initialize(function(){
        _refreshScanView();
      });
      */
    };

    $scope.$on("$ionicView.beforeLeave", function() {
      //scannerService.deactivate();
      //window.qrreader.stopReading();
      qrReaderService.stopReading();
    });

    function handleSuccessfulScan(contents){
      
      $log.debug('Scan returned: "' + contents + '"');
      //scannerService.pausePreview();
      // Sometimes (testing in Chrome, when reading QR Code) data is an object
      // that has a string data.result.
      contents = contents.result || contents;
      incomingDataService.redir(contents, function onError(err) {
        if (err) {
          var title = gettextCatalog.getString('Scan Failed');
          popupService.showAlert(title, err.message, function onAlertShown() {
            // Enable another scan since we won't receive incomingDataMenu.menuHidden
            //activate();
          });
        } else {
          //scannerService.resumePreview();
        }
      });
      
    }

    $rootScope.$on('incomingDataMenu.menuHidden', function() {
      activate();
    });

    function onStart() {
      $scope.currentState = scannerStates.hasPermission;
    }

    $scope.openSettings = function(){
      //scannerService.openSettings();
      qrReaderService.openSettings().then(
        function onOpenSettingsResolved(contents) {
          handleSuccessfulScan(contents);
        },
        function onOpenSettingsRejected(reason) {
          $log.error('Failed to open settings. ' + reason);

          var newScannerState = scannerStates.unavailable;
          $scope.canOpenSettings = false;
          // TODO: Handle all the different types of errors
          //$scope.$apply(function onApply() {
            $scope.currentState = newScannerState;
          //});          
        });
    };

    $scope.reactivationCount = 0;
    $scope.attemptToReactivate = function(){
      /*
      scannerService.reinitialize(function(){
        $scope.reactivationCount++;
      });
      */
    };

    $scope.toggleLight = function(){
      /*
      scannerService.toggleLight(function(lightEnabled){
        $scope.lightActive = lightEnabled;
        $scope.$apply();
      });
      */
    };

    $scope.toggleCamera = function(){
      /*
      $scope.cameraToggleActive = true;
      scannerService.toggleCamera(function(status){
      // (a short delay for the user to see the visual feedback)
        $timeout(function(){
          $scope.cameraToggleActive = false;
          $scope.lightActive = false; // The light is off when we switch camera succesfully
          $log.debug('Camera toggle control deactivated.');
        }, 200);
      });
      */
    };

    $scope.canGoBack = function(){
      return $state.params.passthroughMode;
    };


    function goBack(){
      $ionicHistory.nextViewOptions({
        disableAnimate: true
      });
      $ionicHistory.backView().go();
    }
    $scope.goBack = goBack;

    function startReading() {
      $scope.currentState = scannerStates.visible;
      console.log('Starting qrreader.');

      qrReaderService.startReading().then(
        function onStartReadingResolved(contents) {
          handleSuccessfulScan(contents);
        },
        function onStartReadingRejected(reason) {
          $log.error('Failed to start reading QR code. ' + reason);

          var newScannerState = scannerStates.denied;
          $scope.canOpenSettings = true;
          // TODO: Handle all the different types of errors
          //$scope.$apply(function onApply() {
            $scope.currentState = newScannerState;
          //});          
        });
    }
  }
})();
