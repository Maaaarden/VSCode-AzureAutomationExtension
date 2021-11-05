var vscode = require('vscode')
const Azure = require('./AzureAutomation.js')
var _ = require('lodash')
var path = require('path')

class RunbookProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.tree = null

    //this.newJson()
    //.then((output) => { console.log(output) })

    
    this.refresh()
  }

  refresh() {
    Promise.all([
      this.newJson()
    ]).then((rbList) => {
      this.modifyPublishedState(rbList)
      .then(rbListModified => {
        this.parseTree(rbListModified)
        this._onDidChangeTreeData.fire()
      })
    })
  }

  parseTree(rbList) {
    this.tree = null
    this.tree = rbList
  }

  modifyPublishedState(rbList) {
    return new Promise((resolve, reject) => {
      _.forEach(rbList[0].Children, function(rb) {
        Azure.getRunbookInfo(rb.Name)
        .then(rbInfo => {
          rbList[0].Children.find(x => x == rb).Published = rbInfo.properties.state != 'New' ? true : false
        })
      })
      resolve(rbList)
    })
  }

  newJson() {
    return new Promise((resolve, reject) => {
      this.createJsonPayload()
      .then(jsonPayload => {
        _.forEach(jsonPayload.Children, function(jsonObj) {
          Azure.getRunbookInfo(jsonObj.Name)
          .then(rbInfo => {
            if(rbInfo.properties.state != 'New') {
              jsonPayload.Children.find(x => x == jsonObj).Children.unshift({"Name": "Published", "Level": 2, "Parent": jsonPayload.Children.find(x => x == jsonObj)})  
            }
            //jsonPayload.Children.find(x => x == jsonObj).unshift({"RunbookType": rbInfo.properties.runbookType})
            //jsonPayload.Children.find(x => x == jsonObj).Published = rbInfo.properties.state != 'New' ? true : false
            let tagsArray = Object.getOwnPropertyNames(rbInfo.tags)
            if(rbInfo.tags == null || tagsArray.length == 0) {
            } else {
              _.forEach(tagsArray, function(tag) {
                jsonPayload.Children.find(x => x == jsonObj).Children.Children = [
                  {
                    "Parent": jsonPayload.Children.find(x => x == jsonObj).Children,
                    "Level": 3,
                    "Name": [tag],
                    "Value": rbInfo.tags[tag]
                  }
                ]
              })
            }
          })
        })
        resolve(jsonPayload)
      })
    })
  }

  createJsonPayload() {
    return new Promise((resolve, reject) => {
      let jsonPayload = {
        "Name": "Runbooks",
        "Level": 0,
        "Children": []
      }

      Azure.getListOfRunbooks(function (runbookList) {
        let i = 0
        _.forEach(runbookList, function(runbookObject) {
          Azure.getRunbookInfo(runbookObject)
          .then(rbInfo => {
            jsonPayload.Children[i] = {
              "Name": runbookObject,
              "Level": 1,
              "Parent": jsonPayload,
              "Published": false,
              "RunbookType": rbInfo.properties.runbookType,
              "Children": [
                //{
                //  "Name": "Published",
                //  "Level": 2
                //},
                {
                  "Name": "Tags",
                  "Level": 2
                }
              ]
            }
            jsonPayload.Children[i].Children[0].Parent = jsonPayload.Children[i]
            //jsonPayload.Children[i].Children[1].Parent = jsonPayload.Children[i]
            i++
            if(i === runbookList.length - 1) resolve(jsonPayload)
          })
        })
        
      })
    })
  }

  getChildren(node) {
    if (node) {
      return this._getChildren(node)
    } else {
      if(this.tree) {
        return this.tree[0].Children
      } else {
        return []
      }
    }
  }

  _getChildren(node) {
    return node.Children
  }

  getTreeItem(node) {
    let hasChildren = node.Children ? true : false
    let treeItemName = node.Level == 3 ? '' + node.Name + ': ' + node.Value + '' : node.Name
    let treeItem = new vscode.TreeItem(treeItemName, hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)
    switch(node.Level) {
      case 1:
        treeItem.command = {
          command: 'azureautomation.openSpecificRunbook',
          title: '',
          arguments: [treeItem.label, node.RunbookType, false]
        }
        break;
      case 2:
        if(node.Name == 'Published' && node.Parent.Published == true) {
          treeItem.command = {
            command: 'azureautomation.openSpecificRunbook',
            title: '',
            arguments: [node.Parent.Name, node.RunbookType, node.Parent.Published]
          }
        } else if (node.Parent.published == false) {
          
        }
        break;
    }
	  return treeItem;
  }
}

module.exports = RunbookProvider