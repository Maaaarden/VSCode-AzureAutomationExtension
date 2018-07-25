var openLocalRunbook = function (runbookName) {
    var vscode = require('vscode')

    var path = vscode.workspace.rootPath + `\\${runbookName}.ps1`
    vscode.workspace.openTextDocument(path).then(doc => {
        vscode.window.showTextDocument(doc)
    })
}

var checkIfLocalExist = function (runbookName, next) {
    var vscode = require('vscode')

    var path = vscode.workspace.rootPath + `\\${runbookName}.ps1`

    if(path) {
        next(true)
    } else {
        next(false)
    }
}

module.exports = {
    openLocalRunbook: openLocalRunbook,
    checkIfLocalExist: checkIfLocalExist
}