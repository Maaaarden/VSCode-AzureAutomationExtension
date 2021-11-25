var writeLog = function (logSource, logEntry) {
    var vscode = require('vscode')
    var fs = require('fs')
    var azureconfig = vscode.workspace.getConfiguration("azureautomation")
    try {
        var objToday = new Date()
        var hours = objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()
        var minutes = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes()
        var seconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds()
        var time = hours + ':' + minutes + ':' + seconds
        var logEntryText = JSON.stringify(logEntry)
        var replace = azureconfig.subscriptionId;
        var re = new RegExp(replace,"g");
        logEntryText = logEntryText.replace(re, '<subscriptionID>')
        fs.appendFile(getLogFilePath(), time + ' | Source: ' + logSource + '\n' + logEntryText + '\n\n-----------------------------------------------\n\n', function () {})   
    } catch (error) {
        console.log(error)
    }
}

var checkLogSettings = function () {
    var vscode = require('vscode')
    var azureconfig = vscode.workspace.getConfiguration("azureautomation")

    var debugEnabled = azureconfig.debugging
    var debugPath = azureconfig.debuggingPath
    if (debugEnabled) {
        checkPath(debugPath)
            .then(createLogFile())
    }
}

var createLogFile = function () {
    var vscode = require('vscode')
    var fs = require('fs')

    checkFilePath(getLogFilePath())
        .then(exists => {
            if(exists) {
                //vscode.window.showInformationMessage('Log file for today already exist.')
            } else {
                fs.writeFile(getLogFilePath, '', function () {})
            }
        })
}

var getLogFilePath = function () {
    var vscode = require('vscode')
    var azureconfig = vscode.workspace.getConfiguration("azureautomation")

    var today = new Date()
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()

    var filePath = azureconfig.debuggingPath + '/' + date + '.log'

    return filePath
}

var checkFilePath = function (filePath) {
    return new Promise((resolve, reject) => {
        var fs = require('fs')
        var vscode = require('vscode')
        if (fs.existsSync(filePath)) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

var checkPath = function (path) {
    return new Promise((resolve, reject) => {
        var fs = require('fs')
        var vscode = require('vscode')
        if (fs.existsSync(path)) {
            resolve(true)
        } else {
            reject(vscode.window.showErrorMessage('Debugging enabled, but path is not valid. Please go to Extension Settings and correct the path.'))
        }
    })
}

module.exports = {
    writeLog: writeLog,
    checkLogSettings: checkLogSettings
}