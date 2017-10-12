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
    Azure.doesRunbookExist(runbookName, function (runbookExist) {
      if (!runbookExist) {
        Azure.createLocalRunbook(runbookName, function () {
          Azure.createAzureRunbook(function () {
            Azure.saveAsDraft(function () {
            })
          })
        })
      } else {
        vscode.window.showErrorMessage('The provided Runbook name already exists in Azure Cloud')
      }
    })
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
  selectAssetCredential: selectAssetCredential
}
