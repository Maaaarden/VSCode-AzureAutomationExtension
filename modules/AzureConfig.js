const Config = function () {
  const vscode = require('vscode')
  const fs = require('fs')
  const packagejson = require('./../package.json')

  const extensionPath = vscode.extensions.getExtension(`${packagejson.publisher}.${packagejson.name}`).extensionPath
  const extPathConfigFile = extensionPath + '\\azureconfig.json'
  const extPathFileExists = fs.existsSync(extPathConfigFile)

  const workspaceConfigFile = vscode.workspace.rootPath + '\\azureconfig.json'
  const workspaceFileExists = fs.existsSync(workspaceConfigFile)

  if (workspaceFileExists) {
    this.configFile = require(workspaceConfigFile).AzureConfig
    this.personalInfo = require(workspaceConfigFile).PersonalInfo
    this.filePath = workspaceConfigFile
  } else if (extPathFileExists) {
    this.configFile = require(extPathConfigFile).AzureConfig
    this.personalInfo = require(extPathConfigFile).PersonalInfo
    this.filePath = extPathConfigFile
  } else {
    vscode.window.showErrorMessage('Could not find config file. This is like.. really an issue.')
  }
}

module.exports = Config
