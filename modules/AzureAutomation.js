
/**
 * This function gets the bearer token needed to communicate to Azure API
 * @param   {Function}  next  Callback function
 * @return  {Object}          Returns an object with the token.
 */
var getOauthToken = function (next) {
  var vscode = require('vscode')
  var request = require('request')
  var _ = require('lodash')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  //var clientSecret = _.replace(azureconfig.clientSecret, new RegExp('\\+','g'),'%2B')
  var clientSecret = azureconfig.clientSecret
  request({
    url: `https://login.microsoftonline.com/${azureconfig.tenantId}/oauth2/token?api-version=1.0`,
    body: `grant_type=client_credentials&resource=https%3A%2F%2Fmanagement.core.windows.net%2F&client_id=${encodeURIComponent(azureconfig.clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }, function (error, response, body) {
    if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
      console.log(body)
      return vscode.window.showErrorMessage('Could not get OAuth Token! Error:' + error)
    }
    var bodyParsed = JSON.parse(body)
    var token = bodyParsed.access_token
    return next({value: 'Bearer ' + token})
  })
}

var getRunbookInfo = function (runbookName) {
  return new Promise((resolve, reject) => {
    var vscode = require('vscode')
    var request = require('request')
    var azureconfig = vscode.workspace.getConfiguration("azureautomation")
    var _ = require('lodash')
    
    getOauthToken(function (token) {
      request.get({
        url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks/${runbookName}?api-version=${azureconfig.apiVersion}`,
        headers: {
          'Authorization': token.value,
          'content-type': 'application/json'
        }
      }, function (error, response, body) {
        if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
          console.log(body)
          return vscode.window.showErrorMessage('Could not get runbook info for ' + runbookName + '! Error: ' + error.message)
          console.log(response)
        }

        var bodyParsed = JSON.parse(body)

        resolve(bodyParsed)
      })
    })
  })
}

/**
 * Gets a list of all runbooks in Azure and returns an array containing
 * only the names without the .ps1 extension.
 * @param   {Function}  next    Callback function
 * @return  {Array}             Returns an array with runbook names.
 */
var getListOfRunbooks = function (next, skip = false, runbookNames = false) {
  var vscode = require('vscode')
  var request = require('request')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var _ = require('lodash')

  if(!skip) {
    skip = ''
  }
  if(!runbookNames) {
    runbookNames = []
  }

  getOauthToken(function (token) {
    request.get({
      url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks?api-version=${azureconfig.apiVersion}${skip}`,
      headers: {
        'Authorization': token.value,
        'content-type': 'application/json'
      }
    }, function (error, response, body) {
      var bodyParsed = JSON.parse(body)
      if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
        console.log(body)
        return vscode.window.showErrorMessage('Could not get list of Runbook from Azure Automation! Error: ' + bodyParsed.error.message)
      }
      
      var i = 0
      _.forEach(bodyParsed.value, function (runbookObject) {
        runbookNames.push(runbookObject.name)
        i++
      })
      if(bodyParsed.nextLink && i == bodyParsed.value.length) {
        skip = '&' + bodyParsed.nextLink.split('&').pop()
        getListOfRunbooks(next, skip, runbookNames)
      } else {
        return next(runbookNames)
      }
    })
  })
}

/**
 * Saves the focused runbook tab as a draft in Azure. It returns
 * an object wether the runbook exists or not. {success: true/false}
 * @param   {Function}  next    Callback function
 * @return  {Object}            Returns an object with property 'exists' true/false
 */
var saveAsDraft = function (next) {
  var vscode = require('vscode')
  var request = require('request')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var _ = require('lodash')
  var document = vscode.window.activeTextEditor.document

  if (document.isUntitled) {
    return vscode.window.showWarningMessage('Please save your runbook locally before saving to Azure.')
  }
  // First splits the string on '\', second takes the last value in the array, finally replaces '.ps1' with nothing (removes it).
  var rbPath = _.last(_.split(document.fileName, '\\'))
  var runbookName = rbPath.substr(0, rbPath.lastIndexOf('.'))
  /**if(runbookType == 'PowerShell') {
    var runbookName = _.replace(_.last(_.split(document.fileName, '\\')), '.ps1', '')
  } else if(runbookType == 'Python2') {
    var runbookName = _.replace(_.last(_.split(document.fileName, '\\')), '.py', '')
  }*/
  var fileText = document.getText()

  getOauthToken(function (token) {
    request.put({
      url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks/${runbookName}/draft/content?api-version=${azureconfig.apiVersion}`,
      headers: {
        'Authorization': token.value,
        'content-type': 'application/json'
      },
      body: fileText
    }, function (error, response, body) {
      
      if (response.statusCode === 202) {
        vscode.window.setStatusBarMessage('Draft saved successfully.', 3100)
        // vscode.window.showInformationMessage('Draft saved successfully.')
        return next({ success: true })
      } else if (response.statusCode === 404) {
        return next({ success: false, reason: 'Runbook does not exist in Azure' })
      } else if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
        console.log(response)
        console.log(body)
        return vscode.window.showErrorMessage('An error accoured while trying to save the draft in Azure Cloud.')
      } else {
        return vscode.window.showErrorMessage('An error accoured while trying to save the draft in Azure Cloud.')
      }
    })
  })
}

/**
 * Creates a new runbook in Azure unpublished.
 * @param   {Function}  next    Callback function
 */
var createAzureRunbook = function (runbookType ,next) {
  var vscode = require('vscode')
  var request = require('request')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var _ = require('lodash')
  var document = vscode.window.activeTextEditor.document
  /**if(runbookType == 'PowerShell') {
    var runbookName = _.replace(_.last(_.split(document.fileName, '\\')), '.ps1', '')
  } else if(runbookType == 'Python2') {
    var runbookName = _.replace(_.last(_.split(document.fileName, '\\')), '.py', '')
  }*/
  var rbPath = _.last(_.split(document.fileName, '\\'))
  var runbookName = rbPath.substr(0, rbPath.lastIndexOf('.'))

  if (document.isUntitled) {
    return vscode.window.showErrorMessage('Please save your runbook locally before saving to Azure.')
  }
  doesRunbookExist(runbookName, function (runbookExists) {
    if (runbookExists) {
      vscode.window.showErrorMessage('Runbook name already exists.')
      return next()
    } else {
      getOauthToken(function (token) {
        var requestData = {
            'tags': {
              'CreatedFrom': 'VSCode Extension'
            },
            'properties': {
              'runbookType': runbookType,
              'draft': {
                'inEdit': false
              }
            },
            'location': 'westeurope'
          }
        request.put({
          url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks/${runbookName}?api-version=${azureconfig.apiVersion}`,
          headers: {
            'Authorization': token.value,
            'Content-Type': 'application/json'
          },
          json: requestData
        }, function (error, response, body) {
          if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
            console.log(body)
            return vscode.window.showErrorMessage('An error occured while trying to create the runbook in Azure Cloud. Error: ' + error.message)
          }
          if (response.statusCode === 201) {
            vscode.window.setStatusBarMessage('Runbook created in Azure Cloud.', 3100)
            //vscode.window.showInformationMessage('Runbook created in Azure Cloud.')
            return next()
          } else {
            console.log(body)
            return vscode.window.showErrorMessage('Could not create Runbook in Azure Cloud..')
          }
        })
      })
    }
  })
}

/**
 * This function creates a new local runbook. It downloads and adds the BS
 * custom Azure Runbook content to the newly created file.
 * @param   {String}    runbookName The name of the runbook you wish to create.
 * @param   {Function}  next        Callback function
 */
var createLocalRunbook = function (runbookName, runbookType, existing=false, published=false, next) {
  var vscode = require('vscode')
  var request = require('request')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var fs = require('fs')
  var Q = require('q')

  var hasWorkspace = !!vscode.workspace.rootPath
  if (!hasWorkspace) {
    return vscode.window.showErrorMessage('No workspace found. Please open a folder before creating a new Runbook.')
  }

  let publishedV = published == false ? 'draft/' : ''

  if (existing) {
    getOauthToken(function (token) {
      request.get({
        url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks/${runbookName}/${publishedV}content?api-version=${azureconfig.apiVersion}`,
        headers: {
          'Authorization': token.value
        }
      }, function (error, response, body) {
        if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
          console.log(body)
          return vscode.window.showErrorMessage('Could not get runbook from Azure Cloud. Error: ' + error.message)
        }
        if(runbookType == 'PowerShell') {
          var path = vscode.workspace.rootPath + `\\${runbookName}.ps1`
        } else if(runbookType == 'Python2') {
          var path = vscode.workspace.rootPath + `\\${runbookName}.py`
        }
        
        fs.writeFile(path, body, function() {
          vscode.workspace.openTextDocument(path).then(doc => {
            vscode.window.showTextDocument(doc)
            setTimeout(function () {
              next()
            }, 2000)
          })
        })
/*
        Q.fcall(function () {
          fs.writeFile(path, body)
        })
        .then(function () {
          vscode.workspace.openTextDocument(path).then(doc => {
            vscode.window.showTextDocument(doc)
            setTimeout(function () {
              next()
            }, 2000)
          })
        })
        .catch((err) => {
          console.log("Fejl 1")
          console.log(err)
        })*/
      })
    })
  }
  else if (azureconfig.templateName != "") {
    getOauthToken(function (token) {
      request.get({
        url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks/${azureconfig.templateName}/content?api-version=${azureconfig.apiVersion}`,
        headers: {
          'Authorization': token.value
        }
      }, function (error, response, body) {
        if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
          console.log(body)
          return vscode.window.showErrorMessage('Could not get template from Azure Cloud.')
        }
        if(runbookType == 'PowerShell') {
          var path = vscode.workspace.rootPath + `\\${runbookName}.ps1`
        } else if(runbookType == 'Python2') {
          var path = vscode.workspace.rootPath + `\\${runbookName}.py`
        }

        
        fs.writeFile(path, body, function() {
          vscode.workspace.openTextDocument(path).then(doc => {
            vscode.window.showTextDocument(doc)
            setTimeout(function () {
              next()
            }, 2000)
          })
        })
/*
        Q.fcall(function () {
          fs.writeFile(path, body)
        })
        .then(function () {
          vscode.workspace.openTextDocument(path).then(doc => {
            vscode.window.showTextDocument(doc)
            setTimeout(function () {
              next()
            }, 2000)
          })
        })
        .catch((err) => {
          console.log("Fejl 2")
          console.log(err)
        })*/
      })
    })
  } else {
    if(runbookType == 'PowerShell') {
      var path = vscode.workspace.rootPath + `\\${runbookName}.ps1`
    } else if(runbookType == 'Python2') {
      var path = vscode.workspace.rootPath + `\\${runbookName}.py`
    }

    fs.writeFile(path, "", function() {
      vscode.workspace.openTextDocument(path).then(doc => {
        vscode.window.showTextDocument(doc)
        setTimeout(function () {
          next()
        }, 2000)
      })
    })
/*
    Q.fcall(function () {
      fs.writeFile(path, "")
    })
    .then(function () {
      vscode.workspace.openTextDocument(path).then(doc => {
        vscode.window.showTextDocument(doc)
        setTimeout(function () {
          next()
        }, 2000)
      })
    })*/
  }
}

var publishRunbook = function (next) {
  var vscode = require('vscode')
  var request = require('request')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var _ = require('lodash')
  var document = vscode.window.activeTextEditor.document

  // First splits the string on '\', second takes the last value in the array, finally replaces '.ps1' with nothing (removes it).
  /**
  if(runbookType == 'PowerShell') {
    var runbookName = _.replace(_.last(_.split(document.fileName, '\\')), '.ps1', '')
  } else if(runbookType == 'Python2') {
    var runbookName = _.replace(_.last(_.split(document.fileName, '\\')), '.py', '')
  }*/
  var rbPath = _.last(_.split(document.fileName, '\\'))
  var runbookName = rbPath.substr(0, rbPath.lastIndexOf('.'))

  getOauthToken(function (token) {
    request.post({
      url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/runbooks/${runbookName}/draft/publish?api-version=${azureconfig.apiVersion}`,
      headers: {
        'Authorization': token.value
      }
    }, function (error, response, body) {
      if (error || response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202) {
        console.log(body)
        return vscode.window.showErrorMessage('An error accoured while trying to publish the runbook in Azure Cloud.')
      }
      if (response.statusCode === 202) {
        vscode.window.setStatusBarMessage('Runbook successfully published.', 3100)
        vscode.commands.executeCommand('azureautomation.updateRunbookProvider')
        return next()
      } else {
        return vscode.window.showErrorMessage('Could not publish the runbook.')
      }
    })
  })
}

/**
 *
 * @param {*} token
 * @param {*} next
 */
var startPublishedRunbook = function (token, next) {
  var vscode = require('vscode')
  var request = require('request')
  var jobs = require('./AzureAutomationJobs.js')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var guid = createGuid()
  var _ = require('lodash')

  //var runbookName = _.replace(_.last(_.split(vscode.window.activeTextEditor.document.fileName, '\\')), '.ps1', '')
  var rbPath = _.last(_.split(vscode.window.activeTextEditor.document.fileName, '\\'))
  var runbookName = rbPath.substr(0, rbPath.lastIndexOf('.'))
  jobs.getHybridWorkerGroups(token, function (hybridWorkers) {
    if (!hybridWorkers) {
      request.put({
        url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}?api-version=${azureconfig.apiVersion}`,
        headers: {
          'Authorization': token
        },
        json: {
          'properties': {
            'runbook': {
              'name': '' + runbookName + ''
            },
            'parameters': { // Parameters of current open runbook.
            }
          }
        }
      }, function (error, response, body) {
        if (response.statusCode === 404 || error) {
          console.log(response)
          vscode.window.showErrorMessage('Something went wrong, when trying to start the job.')
        }
        if (response.statusCode === 201) {
          // setTimeout(function () {
          return next(guid)
          // }, 10000)
        }
        if (response.statusCode === 200) {
          vscode.window.showInformationMessage('Job already running. Usually this means a mishap in the code.')
        }
      })
    } else {
      vscode.window.showQuickPick(hybridWorkers)
    .then(val => runOn = val)
    .then(function (runOn) {
      if(runOn.detail) {
        request.put({
          url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}?api-version=${azureconfig.apiVersion}`,
          headers: {
            'Authorization': token
          },
          json: {
            'properties': {
              'runbook': {
                'name': '' + runbookName + ''
              },
              'parameters': { // Parameters of current open runbook.
              },
              'runOn': runOn.detail
            }
          }
        }, function (error, response, body) {
          if (response.statusCode === 404 || error) {
            console.log(response)
            vscode.window.showErrorMessage('Something went wrong, when trying to start the job.')
          }
          if (response.statusCode === 201) {
            // setTimeout(function () {
            return next(guid)
            // }, 10000)
          }
          if (response.statusCode === 200) {
            vscode.window.showInformationMessage('Job already running. Usually this means a mishap in the code.')
          }
        })
      } else {
        request.put({
          url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroup}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/jobs/${guid}?api-version=${azureconfig.apiVersion}`,
          headers: {
            'Authorization': token
          },
          json: {
            'properties': {
              'runbook': {
                'name': '' + runbookName + ''
              },
              'parameters': { // Parameters of current open runbook.
              }
            }
          }
        }, function (error, response, body) {
          if (response.statusCode === 404 || error) {
            console.log(response)
            vscode.window.showErrorMessage('Something went wrong, when trying to start the job.')
          }
          if (response.statusCode === 201) {
            // setTimeout(function () {
            return next(guid)
            // }, 10000)
          }
          if (response.statusCode === 200) {
            vscode.window.showInformationMessage('Job already running. Usually this means a mishap in the code.')
          }
        })
      }
    })
    }
  })
}

var doesRunbookExist = function (runbookName, next) {
  var _ = require('lodash')
  getListOfRunbooks(function (runbookList) {
    if (_.includes(runbookList, runbookName)) {
      return next(true)
    } else {
      return next(false)
    }
  })
}

function createGuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

module.exports = {
  getOauthToken: getOauthToken,
  getListOfRunbooks: getListOfRunbooks,
  saveAsDraft: saveAsDraft,
  createAzureRunbook: createAzureRunbook,
  createLocalRunbook: createLocalRunbook,
  publishRunbook: publishRunbook,
  doesRunbookExist: doesRunbookExist,
  startPublishedRunbook: startPublishedRunbook,
  getRunbookInfo: getRunbookInfo
}
