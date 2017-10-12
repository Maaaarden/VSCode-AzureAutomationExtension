var newAssetVariable = function (token) {
  var vscode = require('vscode')
  var stringSnip = ''

  var assetName = ''
  var assetValue = ''
  var assetDescription = ''
  vscode.window.showInputBox({
    prompt: 'What should be the name of your variable?',
    ignoreFocusOut: true
  })
  .then(val => {
    assetName = val
    vscode.window.showInputBox({
      prompt: 'What should be the value of your variable?',
      ignoreFocusOut: true
    })
    .then(val2 => {
      assetValue = val2
      vscode.window.showInputBox({
        prompt: 'Please describe this asset for future references.',
        ignoreFocusOut: true
      })
      .then(val3 => {
        assetDescription = val3
        createAzureVariable(assetName, assetValue, assetDescription, token, function () {
          stringSnip = '\\$containerVariable = Get-AutomationVariable -Name \'' + assetName + '\'\n'
          stringSnip += '\\$${1:var} = Get-AutomationVariable -Name \\$containerVariable\n'
          stringSnip += '\n'
          stringSnip += '${0:}'
          vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(stringSnip))
        })
      })
    })
  })
}

var newAssetCredential = function (token) {
  var vscode = require('vscode')
  var stringSnip = ''

  var assetName = ''
  var assetUserName = ''
  var assetPassword = ''
  var assetDescription = ''
  vscode.window.showInputBox({
    prompt: 'What should be the name of your credential?',
    ignoreFocusOut: true
  })
  .then(val => {
    assetName = val
    vscode.window.showInputBox({
      prompt: 'Please input the username of your credential.',
      ignoreFocusOut: true
    })
    .then(val2 => {
      assetUserName = val2
      vscode.window.showInputBox({
        prompt: 'Please input the password for the credential.',
        ignoreFocusOut: true,
        password: true
      })
      .then(val3 => {
        assetPassword = val3
        vscode.window.showInputBox({
          prompt: 'Please describe this credential for future references.',
          ignoreFocusOut: true
        })
        .then(val4 => {
          assetDescription = val4
          createAzureCredential(assetName, assetUserName, assetPassword, assetDescription, token, function () {
            stringSnip = '\\$containerVariable = Get-AutomationVariable -Name \'' + assetName + '\'\n'
            stringSnip += '\\$${1:cred} = Get-AutomationPSCredential -Name \\$containerVariable\n'
            stringSnip += '\n'
            stringSnip += '${0:}'
            vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(stringSnip))
          })
        })
      })
    })
  })
}

var selectAssetVariable = function (token) {
  var request = require('request')
  var vscode = require('vscode')
  var _ = require('lodash')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var hest = ''
  getAssets(token, function (assets) {
    vscode.window.showQuickPick(assets)
    .then(val => hest = val)
    .then(function (hest) {
      var assetName = (hest.label).replace('Variable: ', '')

      let stringSnip = '\\$containerVariable = Get-AutomationVariable -Name \'' + assetName + '\'\n'
      stringSnip += '\\$${1:var} = Get-AutomationVariable -Name \\$containerVariable\n'
      stringSnip += '\n'
      stringSnip += '${0:}'
      vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(stringSnip))
      // console.log('Asset: ' + (hest.label).replace('Variable: ', '') + ' - value: ' + (hest.detail).replace('Value: ', ''))
    })
  })
}

function getAssets (token, next) {
  var request = require('request')
  var vscode = require('vscode')
  var _ = require('lodash')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/variables?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error) {

    } else if (response.statusCode === 200) {
      var bodyParsed = JSON.parse(body)
      var returnAssets = []
      _.forEach(bodyParsed.value, function (value) {
        var reg = '[a-zA-Z]*_[0-9]{8}'
        var pattern = new RegExp(reg, 'g')
        if (!pattern.test(value.name)) {
          if (!value.properties.isEncrypted === true) {
            var vals = value.properties.value
            vals = vals.substring(1, vals.length - 1)
            var asset = _.filter(bodyParsed.value, {'name': vals})
            if (asset[0]) {
              var assetValue = ''
              if (asset[0].properties.isEncrypted === true) {
                assetValue = 'Enctrypted value'
              } else {
                assetValue = (asset[0].properties.value).substring(1, (asset[0].properties.value).length - 1)
              }
              var test = {
                'description': asset[0].properties.description,
                // 'description': value.description,
                'detail': 'Value: ' + assetValue,
                'label': 'Variable: ' + value.name
              }
              returnAssets.push(test)
            }
            // returnValues.push((asset[0].properties.value).substring(1, (asset[0].properties.value).length - 1))
            // returnAssets[value.name] = (asset[0].properties.value).substring(1, (asset[0].properties.value).length - 1)
            // console.log('Assetname: ' + value.name)
            // console.log('Asset value: ' + (asset[0].properties.value).substring(1, (asset[0].properties.value).length - 1))
          }
        }
      })
    }
    next(returnAssets)
  })
}

var selectAssetCredential = function (token) {
  var request = require('request')
  var vscode = require('vscode')
  var _ = require('lodash')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var hest2 = ''
  getCredentials(token, function (returnCredentials) {
    vscode.window.showQuickPick(returnCredentials)
    .then(val => hest2 = val)
    .then(function (hest2) {
      var assetName = (hest2.label).replace('Credential: ', '')
      let stringSnip = '\\$containerVariable = Get-AutomationVariable -Name \'' + assetName + '\'\n'
      stringSnip += '\\$${1:var} = Get-AutomationPSCredential -Name \\$containerVariable\n'
      stringSnip += '\n'
      stringSnip += '${0:}'
      vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(stringSnip))
    })
  })
}

function getCredentials (token, next) {
  var request = require('request')
  var vscode = require('vscode')
  var _ = require('lodash')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/credentials?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error) {

    } else if (response.statusCode === 200) {
      var bodyParsed = JSON.parse(body)
      getCredentialInfo(token, next, bodyParsed)
    }
  })
}

function getCredentialInfo (token, next, credList) {
  var request = require('request')
  var vscode = require('vscode')
  var _ = require('lodash')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  var credArray = []
  _.forEach(credList.value, function (value) {
    credArray.push(value.name)
  })
  
  request.get({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/variables?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    }
  }, function (error, response, body) {
    if (error) {

    } else if (response.statusCode === 200) {
      var bodyParsed = JSON.parse(body)
      var returnCredentials = []
      _.forEach(bodyParsed.value, function (value) {
        if (!value.properties.isEncrypted === true) {
          var valueValue = (value.properties.value).substring(1, (value.properties.value).length - 1)
          if (credArray.includes(valueValue)) {
            var valindex = credArray.indexOf(valueValue)
            var userName = (credList.value[valindex]).properties.userName
            var test = {
              'description': (credList.value[valindex]).properties.description,
              // 'description': value.description,
              'detail': 'Username: ' + userName,
              'label': 'Credential: ' + value.name
            }
            returnCredentials.push(test)
          }
        }
      })
      next(returnCredentials)
    }
  })
}

function createAzureVariable (assetName, assetValue, assetDescription, token, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")
  

  var dateObj = new Date()
  var month = dateObj.getUTCMonth() + 1
  if (Number(month) < 10) {
    month = '0' + month
  }
  var date = dateObj.getUTCDate()
  if (Number(date) < 10) {
    date = '0' + date
  }
  var year = dateObj.getUTCFullYear()
  var assetNameDate = assetName + '_' + date + month + year

  request.put({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/variables/${assetName}?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    },
    json: {
      'properties': {
        'description': assetDescription,
        'isEncrypted': 0,
        'type': 'string',
        'value': '"' + assetNameDate + '"'
      }
    }
  }, function (error, response, body) {
    if (error) {
      vscode.window.showErrorMessage('Error creating your asset in Azure.')
    } else if (response.statusCode === 201) {
    }
  })

  request.put({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/variables/${assetNameDate}?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    },
    json: {
      'properties': {
        'description': '',
        'isEncrypted': 0,
        'type': 'string',
        'value': '"' + assetValue + '"'
      }
    }
  }, function (error, response, body) {
    if (error) {
      vscode.window.showErrorMessage('Error creating your asset in Azure.')
    } else if (response.statusCode === 201) {
      next()
    }
  })
}

function createAzureCredential (assetName, assetUserName, assetPassword, assetDescription, token, next) {
  var request = require('request')
  var vscode = require('vscode')
  var azureconfig = vscode.workspace.getConfiguration("azureautomation")

  var dateObj = new Date()
  var month = dateObj.getUTCMonth() + 1
  if (Number(month) < 10) {
    month = '0' + month
  }
  var date = dateObj.getUTCDate()
  if (Number(date) < 10) {
    date = '0' + date
  }
  var year = dateObj.getUTCFullYear()

  var assetNameDate = assetName + '_' + date + month + year

  request.put({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/variables/${assetName}?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    },
    json: {
      'properties': {
        'description': assetDescription,
        'isEncrypted': 0,
        'type': 'string',
        'value': '"' + assetNameDate + '"'
      }
    }
  }, function (error, response, body) {
    if (error) {
      vscode.window.showErrorMessage('Error creating your asset in Azure.')
    }
  })

  request.put({
    url: `https://management.azure.com/subscriptions/${azureconfig.subscriptionId}/resourceGroups/${azureconfig.resourceGroups}/providers/Microsoft.Automation/automationAccounts/${azureconfig.automationAccount}/credentials/${assetNameDate}?api-version=${azureconfig.apiVersion}`,
    headers: {
      'Authorization': token
    },
    json: {
      'properties': {
        'description': assetDescription,
        'username': assetUserName,
        'password': assetPassword
      }
    }
  }, function (error, response, body) {
    if (error) {
      vscode.window.showErrorMessage('Error creating your asset in Azure.')
    } else if (response.statusCode === 201) {
      next()
    }
  })
}

module.exports = {
  newAssetVariable: newAssetVariable,
  newAssetCredential: newAssetCredential,
  selectAssetVariable: selectAssetVariable,
  selectAssetCredential: selectAssetCredential
}
