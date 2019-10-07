var openLocalRunbook = function (runbookName) {
    var vscode = require('vscode')
    var path = require('path')

    var rootPath = vscode.workspace.rootPath + path.sep + `${runbookName}.ps1`
    vscode.workspace.openTextDocument(rootPath).then(doc => {
        vscode.window.showTextDocument(doc)
    })
}

var checkIfLocalExist = function (runbookName, next) {
    var vscode = require('vscode')
    var path = require('path')

    var rootPath = vscode.workspace.rootPath + path.sep + `${runbookName}.ps1`

    if(rootPath) {
        next(true)
    } else {
        next(false)
    }
}

module.exports = {
    openLocalRunbook: openLocalRunbook,
    checkIfLocalExist: checkIfLocalExist
}
