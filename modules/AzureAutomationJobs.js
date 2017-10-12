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
        getJobStreams(token, guid, function (streamBody) {
          _.forEach(streamBody.value, function (streamObject) {
            var summary = streamObject.properties.summary
            var streamId = streamObject.properties.jobStreamId
            var streamIdNumber = streamId.substring(streamId.length - 20, streamId.length)
            if (lastStreamNumber < parseInt(streamIdNumber)) {
              switch (streamObject.properties.streamType) {
                case 'Output':
                  runbookOutputs.output.appendLine(summary)
                  break
                case 'Warning':
                  runbookOutputs.warnings.appendLine(summary)
                  runbookOutputs.warnings.show()
                  break
                case 'Error':
                  runbookOutputs.errors.appendLine(summary)
                  runbookOutputs.errors.show()
                  break
                default:
                  break
              }
              lastStreamNumber = parseInt(streamIdNumber)
            }
            // console.log(streamObject.properties.summary)
          })
        })
        if (status === 'Running') {
          console.log(status)
          vscode.window.setStatusBarMessage('Job status: ' + status, 3100)
        } else if (status === 'Completed') {
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
    }
    )
  }, 3000)
  // When job is running do stuff

  // When job is done / failed, do stuff again
}

/**
 *
 * @param {*} token
 * @param {*} guid
 * @param {*} next
 */
function getJobStreams (token, guid, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}/streams?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    // console.log('Body of jobstreams: ' + body)

    return next(JSON.parse(body))
  })
}

/**
 *
 * @param {*} token
 * @param {*} guid
 * @param {*} next
 */
function getJobInfo (token, guid, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error) {
    }
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
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/hybridRunbookWorkerGroups?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error) {

    } else if (response.statusCode === 200) {
      bodyParsed = JSON.parse(body)
      if ((bodyParsed.value).length === 0) {
        // console.log('No hybridworkers')
        vscode.window.showInformationMessage('No HybridWorkers found, running job in Azure')
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
