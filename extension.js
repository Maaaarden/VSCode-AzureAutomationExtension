// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode')

function activateCommands (context) {
  var Azure = require('./modules/AzureAutomation.js')
  var Controller = require('./controller.js')
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  var insertNewVariable = vscode.commands.registerCommand(
    'extension.insertNewVariable', function () {
      Controller.insertNewVariable()
    }
  )
  context.subscriptions.push(insertNewVariable)

  var insertNewCredential = vscode.commands.registerCommand(
    'extension.insertNewCredential', function () {
      Controller.insertNewCredential()
    }
  )
  context.subscriptions.push(insertNewCredential)

  var selectAssetVariable = vscode.commands.registerCommand(
    'extension.selectAssetVariable', function () {
      Controller.selectAssetVariable()
    }
  )
  context.subscriptions.push(selectAssetVariable)

  var selectAssetCredential = vscode.commands.registerCommand(
    'extension.selectAssetCredential', function () {
      Controller.selectAssetCredential()
    }
  )
  context.subscriptions.push(selectAssetCredential)

  var startPublishedRunbook = vscode.commands.registerCommand(
    'extension.startPublishedRunbook', function () {
      Controller.startPublishedRunbook()
    }
  )
  context.subscriptions.push(startPublishedRunbook)

  var saveDraftDisposable = vscode.commands.registerCommand(
      'extension.saveDraft', function () {
        Controller.saveDraft(() => {})
      }
  )
  context.subscriptions.push(saveDraftDisposable)

  var createNewRunbookDisposable = vscode.commands.registerCommand(
    'extension.createNewRunbook', function () {
      Controller.createNewRunbook()
    }
  )
  context.subscriptions.push(createNewRunbookDisposable)

  var publishRunbookDisposable = vscode.commands.registerCommand(
    'extension.publishRunbook', function () {
      Controller.saveDraft(() => {
        Azure.publishRunbook(() => { })
      })
    }
  )
  context.subscriptions.push(publishRunbookDisposable)

  var updatePersonalInfoDisposable = vscode.commands.registerCommand(
    'extension.updatePersonalInfo', function () {
      Controller.updatePersonalInfo()
    }
  )
  context.subscriptions.push(updatePersonalInfoDisposable)

  var savePublishRunDisposable = vscode.commands.registerCommand(
    'extension.savePublishAndRun', function () {
      Controller.saveDraft(() => {
        Azure.publishRunbook(() => {
          Controller.startPublishedRunbook()
        })
      })
    }
  )
  context.subscriptions.push(savePublishRunDisposable)

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate (context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  activateCommands(context)

  console.log('Congratulations, your extension azureautomation is now active!')
}

exports.activate = activate

// this method is called when your extension is deactivated
function deactivate () {
}
exports.deactivate = deactivate
