// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controllers for the exploration graph.
 *
 * @author sll@google.com (Sean Lip)
 */

oppia.controller('ExplorationGraph', [
    '$scope', '$modal', 'editorContextService', 'warningsData',
    'explorationStatesService', 'editabilityService', 'validatorsService',
    'routerService', 'graphDataService',
    function($scope, $modal, editorContextService, warningsData,
             explorationStatesService, editabilityService, validatorsService,
             routerService, graphDataService) {

  $scope.getGraphData = graphDataService.getGraphData;

  $scope.isEditable = editabilityService.isEditable;

  $scope.isNewStateNameValid = function(newStateName) {
    return (
      validatorsService.isValidEntityName(newStateName) &&
      newStateName.toUpperCase() !== END_DEST &&
      !explorationStatesService.getState(newStateName));
  };

  $scope.newStateName = '';
  $scope.addState = function(newStateName) {
    explorationStatesService.addState(newStateName, function() {
      $scope.newStateName = '';
      routerService.navigateToMainTab(stateName);
    });
  };

  $scope.deleteState = function(deleteStateName) {
    explorationStatesService.deleteState(deleteStateName);
  };

  $scope.onClickStateInMinimap = function(stateName) {
    if (stateName !== END_DEST) {
      routerService.navigateToMainTab(stateName);
    }
  };

  $scope.getActiveStateName = function() {
    return editorContextService.getActiveStateName();
  };

  $scope.openStateGraphModal = function() {
    warningsData.clear();

    $modal.open({
      templateUrl: 'modals/stateGraph',
      backdrop: 'static',
      resolve: {},
      controller: [
        '$scope', '$modalInstance', 'editorContextService', 'graphDataService',
        function($scope, $modalInstance, editorContextService, graphDataService) {
          $scope.currentStateName = editorContextService.getActiveStateName();
          $scope.graphData = graphDataService.getGraphData();

          $scope.deleteState = function(stateName) {
            $modalInstance.close({
              action: 'delete',
              stateName: stateName
            });
          };

          $scope.selectState = function(stateName) {
            if (stateName !== END_DEST) {
              $modalInstance.close({
                action: 'navigate',
                stateName: stateName
              });
            }
          };

          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            warningsData.clear();
          };
        }
      ]
    }).result.then(function(closeDict) {
      if (closeDict.action === 'delete') {
        explorationStatesService.deleteState(closeDict.stateName);
      } else if (closeDict.action === 'navigate') {
        $scope.onClickStateInMinimap(closeDict.stateName);
      } else {
        console.error('Invalid closeDict action: ' + closeDict.action);
      }
    });
  };
}]);
