const Azure = require('./modules/AzureAutomation.js')
const AzureAssets = require('./modules/AzureAutomationAssets.js')
const AzureJobs = require('./modules/AzureAutomationJobs.js')
const vscode = require('vscode')
const runbookOutput = vscode.window.createOutputChannel('RunbookOutput')
const runbookOutputWarning = vscode.window.createOutputChannel('RunbookOutputWarning')
const runbookOutputError = vscode.window.createOutputChannel('RunbookOutputError')
const runbookOutputs = {output: runbookOutput, warnings: runbookOutputWarning, errors: runbookOutputError}

const saveDraft = function (next) {
  vscode.window.activeTextEditor.document.save()
  Azure.saveAsDraft(function (status) {
    // If the runbook does not exist, create it and save again.
    if (status.success === false) {
      Azure.createAzureRunbook(function () {
        vscode.window.showInformationMessage('Couldn\'t find your Runbook in Azure, so created it for you.')
        // Try and save again.
        Azure.saveAsDraft(function () {
          setTimeout(function () {
            vscode.commands.executeCommand('azureatuomation.updateRunbookProvider')
          }, 2000)
          return next()
        })
      })
    } else {
      return next()
    }
  })
}

const createNewRunbook = function () {
  vscode.window.showInputBox({prompt: 'Name of your Runbook. (Without the .ps1 extension)'})
  .then(runbookName => {
    if(runbookName != undefined) {
      Azure.doesRunbookExist(runbookName, function (runbookExist) {
        if (!runbookExist) {
          Azure.createLocalRunbook(runbookName, undefined, undefined, function () {
            Azure.createAzureRunbook(function () {
              Azure.saveAsDraft(function () {
                setTimeout(function () {
                  vscode.commands.executeCommand('azureautomation.updateRunbookProvider')
                }, 2000)
              })
            })
          })
        } else {
          vscode.window.showErrorMessage('The provided Runbook name already exists in Azure Cloud')
        }
      })
    }
  })
}

const openRunbookFromAzure = function () {
  Azure.getListOfRunbooks( function (runbookList) {
    vscode.window.showQuickPick(runbookList)
    .then(runbookName => {
      Azure.doesRunbookExist(runbookName, function (runbookExist) {
        if(runbookExist) {
          Azure.getRunbookInfo(runbookName)
          .then(rbInfo => {
            if(rbInfo.properties.state == 'New') {
              Azure.createLocalRunbook(runbookName, true, false, function() {
                setTimeout(function () {
                  vscode.commands.executeCommand('azureautomation.updateRunbookProvider')
                }, 2000)
              })
            } else {
              vscode.window.showQuickPick(['Published', 'Draft'])
              .then(pick => {
                let draft = pick == 'Draft' ? true : false
                Azure.createLocalRunbook(runbookName, true, draft, function () {
                  setTimeout(function () {
                    vscode.commands.executeCommand('azureautomation.updateRunbookProvider')
                  }, 2000)
                })
              })
            }
          })
        }
      })
    })
  })
}

const openSpecificRunbook = function (runbookName, published) {
  Azure.doesRunbookExist(runbookName, function (runbookExist) {
    if(runbookExist) {
      Azure.createLocalRunbook(runbookName, true, published, function () {
      })
    }
  })
}

const insertNewVariable = function () {
  Azure.getOauthToken(function (token) {
    AzureAssets.newAssetVariable(token.value)
  })
}

const insertNewCredential = function () {
  Azure.getOauthToken(function (token) {
    AzureAssets.newAssetCredential(token.value)
  })
}

const selectAssetVariable = function () {
  Azure.getOauthToken(function (token) {
    AzureAssets.selectAssetVariable(token.value)
  })
}

const selectAssetCredential = function () {
  Azure.getOauthToken(function (token) {
    AzureAssets.selectAssetCredential(token.value)
  })
}

const startPublishedRunbook = function () {
  Azure.getOauthToken(function (token) {
    Azure.startPublishedRunbook(token.value, function (guid) {
      runbookOutputs.output.clear()
      runbookOutputs.output.hide()
      runbookOutputs.errors.clear()
      runbookOutputs.errors.hide()
      runbookOutputs.warnings.clear()
      runbookOutputs.warnings.hide()
      AzureJobs.showJobOutput(token.value, guid, runbookOutputs)
    })
  })
}

module.exports = {
  saveDraft: saveDraft,
  createNewRunbook: createNewRunbook,
  insertNewVariable: insertNewVariable,
  insertNewCredential: insertNewCredential,
  selectAssetVariable: selectAssetVariable,
  startPublishedRunbook: startPublishedRunbook,
  selectAssetCredential: selectAssetCredential,
  openRunbookFromAzure: openRunbookFromAzure,
  openSpecificRunbook: openSpecificRunbook
}
