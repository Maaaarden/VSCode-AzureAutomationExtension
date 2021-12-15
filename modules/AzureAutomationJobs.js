var showJobOutput = function (token, guid, runbookOutputs, lastStreamNumber = 0) {
  var _ = require('lodash')
  var vscode = require('vscode')
  runbookOutputs.output.show()

  // Get job info
  var getJobInfoInterval = setInterval(function () {
    getJobInfo(token, guid, function (status, exception = null) {
      if (status === 'NotStartedYet') {
        console.log(status)
        vscode.window.setStatusBarMessage('Job status: Queued', 3100)
      } else {
        if (status === 'Running') {
          console.log(status)
          vscode.window.setStatusBarMessage('Job status: ' + status, 3100)
        } else if (status === 'Completed') {
          jobhandler(token, guid, runbookOutputs)
          console.log('Stopped')
          vscode.window.setStatusBarMessage('Job status: ' + status, 60000)
          clearTimeout(getJobInfoInterval)
        } else if (status === 'Failed') {
          console.log('Stopped')
          runbookOutputs.errors.appendLine(exception)
          runbookOutputs.errors.show()
          vscode.window.setStatusBarMessage('Job status: ' + status, 60000)
          clearTimeout(getJobInfoInterval)
        }
      }
    })
  }, 3000)
  // When job is running do stuff

  // When job is done / failed, do stuff again
}

function jobhandler(token, guid, runbookOutputs) {
  var _ = require('lodash')

  getJobOutput(token, guid, function (streamBody) {
    runbookOutputs.output.append(streamBody)
  })

  getJobStreams(token, guid, function (streamBody) {
    _.forEach(streamBody.value, function (streamObject) {
        var streamId = streamObject.properties.jobStreamId
        getJobStream(token, guid, streamId, function (streamJobObj) {
          switch (streamJobObj.properties.streamType) {
            case 'Warning':
              var streamText = streamJobObj.properties.streamText
              streamText = streamText.split('\r\n')
              _.forEach(streamText, function (streamLine) {
                runbookOutputs.warnings.appendLine(streamLine)
              })
              runbookOutputs.warnings.show()
              break
            case 'Error':
              var streamText = streamJobObj.properties.streamText
              streamText = streamText.split('\r\n')
              _.forEach(streamText, function (streamLine) {
                runbookOutputs.errors.appendLine(streamLine)
              })
              runbookOutputs.errors.show()
              break
            default:
              break
          }
        })
    })
  })
}

/**
 *
 * @param {*} token
 * @param {*} guid
 * @param {*} next
 */
function getJobStream(token, guid, jobStreamId, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}/streams/${jobStreamId}?api-version=2017-05-15-preview`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    // console.log('Body of jobstreams: ' + body)
    if (error) {
      console.log(error);
    } else {
      return next(JSON.parse(body))
    }
  })
}

/**
 *
 * @param {*} token
 * @param {*} guid
 * @param {*} next
 */
 function getJobOutput(token, guid, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}/output?api-version=2017-05-15-preview`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if(error) {
      console.log(error)
    } else {
      //console.log(body)
      //return next(JSON.parse(body))
      return next(body)
    }
  })
}

/**
 *
 * @param {*} token
 * @param {*} guid
 * @param {*} next
 */
function getJobStreams(token, guid, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}/streams?api-version=2017-05-15-preview`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if(error) {
      console.log(error)
    } else {
      //console.log(body)
      return next(JSON.parse(body))
      //return next(body)
    }
  })
}

/**
 *
 * @param {*} token
 * @param {*} guid
 * @param {*} next
 */
function getJobInfo(token, guid, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}?api-version=2017-05-15-preview`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {}
    if (response.statusCode === 200) {
      body = JSON.parse(body)
      if (body.properties.status === 'Running') {
        return next(body.properties.status)
      } else if (body.properties.status === 'Failed') {
        return next(body.properties.status, body.properties.exception)
      } else if (body.properties.status === 'Completed' || body.properties.status === 'Stopped' || body.properties.status === 'Suspended') {
        return next(body.properties.status)
      } else {
        // console.log(body.properties.status)
        return next('NotStartedYet')
      }
    }
  })
}

var getHybridWorkerGroups = function (token, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var vscode = require('vscode')
  var _ = require('lodash')

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/hybridRunbookWorkerGroups?api-version=2015-10-31`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
      console.log(body)
      vscode.window.showErrorMessage('Error fetching hybrid worker groups.')
    } else if (response.statusCode === 200) {
      var bodyParsed = JSON.parse(body)
      if ((bodyParsed.value).length === 0) {
        // console.log('No hybridworkers')
        vscode.window.showInformationMessage('No HybridWorkers found, running job in Azure')
        next(false)
        // vscode.window.setStatusBarMessage('No HybridWorkers found, running job in Azure', 3100)
      } else {
        var returnArray = []
        _.forEach(bodyParsed.value, function (value) {
          var test = {
            'description': '',
            'detail': value.name,
            'label': value.name
          }
          returnArray.push(test)
        })
        var test = {
          'description': '',
          'detail': '',
          'label': 'Azure'
        }
        returnArray.push(test)
        next(returnArray)
      }
    }
  })
}



module.exports = {
  showJobOutput: showJobOutput,
  getHybridWorkerGroups: getHybridWorkerGroups
}