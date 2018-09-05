// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode')
var Azure = require('./modules/AzureAutomation.js')

function activateCommands (context) {
  var Controller = require('./controller.js')
  var RunbookProvider = require('./modules/RunbookProvider.js')
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  
  var RunbookProviderObj = new RunbookProvider(context)
  vscode.window.registerTreeDataProvider('automation-runbooks', RunbookProviderObj)

  var updateRunbookProvider = vscode.commands.registerCommand(
    'azureautomation.updateRunbookProvider', function () {
      RunbookProviderObj.refresh()
    }
  )
  context.subscriptions.push(updateRunbookProvider)

  var insertNewVariable = vscode.commands.registerCommand(
    'azureautomation.insertNewVariable', function () {
      Controller.insertNewVariable()
    }
  )
  context.subscriptions.push(insertNewVariable)

  var insertNewCredential = vscode.commands.registerCommand(
    'azureautomation.insertNewCredential', function () {
      Controller.insertNewCredential()
    }
  )
  context.subscriptions.push(insertNewCredential)

  var selectAssetVariable = vscode.commands.registerCommand(
    'azureautomation.selectAssetVariable', function () {
      Controller.selectAssetVariable()
    }
  )
  context.subscriptions.push(selectAssetVariable)

  var selectAssetCredential = vscode.commands.registerCommand(
    'azureautomation.selectAssetCredential', function () {
      Controller.selectAssetCredential()
    }
  )
  context.subscriptions.push(selectAssetCredential)

  var startPublishedRunbook = vscode.commands.registerCommand(
    'azureautomation.startPublishedRunbook', function () {
      Controller.startPublishedRunbook()
    }
  )
  context.subscriptions.push(startPublishedRunbook)

  var saveDraftDisposable = vscode.commands.registerCommand(
      'azureautomation.saveDraft', function () {
        Controller.saveDraft(() => {})
      }
  )
  context.subscriptions.push(saveDraftDisposable)

  var createNewRunbookDisposable = vscode.commands.registerCommand(
    'azureautomation.createNewRunbook', function () {
      Controller.createNewRunbook()
    }
  )
  context.subscriptions.push(createNewRunbookDisposable)

  var publishRunbookDisposable = vscode.commands.registerCommand(
    'azureautomation.publishRunbook', function () {
      Controller.saveDraft(() => {
        Azure.publishRunbook(() => {
        })
      })
    }
  )
  context.subscriptions.push(publishRunbookDisposable)

  var updatePersonalInfoDisposable = vscode.commands.registerCommand(
    'azureautomation.updatePersonalInfo', function () {
      Controller.updatePersonalInfo()
    }
  )
  context.subscriptions.push(updatePersonalInfoDisposable)

  var savePublishRunDisposable = vscode.commands.registerCommand(
    'azureautomation.savePublishAndRun', function () {
      Controller.saveDraft(() => {
        Azure.publishRunbook(() => {
          Controller.startPublishedRunbook()
        })
      })
    }
  )
  context.subscriptions.push(savePublishRunDisposable)

  var openRunbookFromAzureDisposable = vscode.commands.registerCommand(
    'azureautomation.openRunbookFromAzure', function () {
      Controller.openRunbookFromAzure(() => {

      })
    }
  )
  context.subscriptions.push(openRunbookFromAzureDisposable)

  var openSpecificRunbookDisposable = vscode.commands.registerCommand(
    'azureautomation.openSpecificRunbook', function (runbookName, published) {
      Controller.openSpecificRunbook(runbookName, published, () => {

      })
    }
  )
  context.subscriptions.push(openSpecificRunbookDisposable)
  
  //var treeView = vscode.window.createTreeView('automation-runbooks', { treeDataProvider: RunbookProvider } )
}

function checkForWorkspace () {
  return new Promise((resolve, reject) => {
    var hasWorkspace = !!vscode.workspace.rootPath
    if (!hasWorkspace) {
      vscode.window.showErrorMessage('No workspace found. Please open a folder.')
      reject()
    } else {
      resolve()
    }
  })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate (context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  checkForWorkspace()
  .then(() => {
    activateCommands(context)
  })
  console.log('Congratulations, your extension azureautomation is now active!')
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate () {
}
exports.deactivate = deactivate

