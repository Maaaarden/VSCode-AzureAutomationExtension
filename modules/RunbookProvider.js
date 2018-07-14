var vscode = require('vscode')
const Azure = require('./AzureAutomation.js')
var _ = require('lodash')
var path = require('path')

class RunbookProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.tree = null

    Promise.all([
      this.getRunbookList()
    ]).then((rbList) => {
      this.parseTree(JSON.parse(rbList))
      this.refresh()
    })
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  parseTree(rbList) {
    this.tree = null
    this.tree = rbList
  }

  getRunbookList() {
    return new Promise((resolve, reject) => {
      var listOfRunbooks = ''
      Azure.getListOfRunbooks(function (runbookList) {
        listOfRunbooks = '{"Runbooks":['
        _.forEach(runbookList, function (runbookObject) {
          listOfRunbooks += '{"Name":"' + runbookObject + '"},'
        })
        listOfRunbooks = listOfRunbooks.replace(/,(\s+)?$/, '')
        listOfRunbooks += ']}'
        if(listOfRunbooks === '') {
          reject('error getting runbooks')
        } else {
          resolve(listOfRunbooks)
        }
        //return next(listOfRunbooks)
      })
      
      //reject('error in rb list')
    })
  }

  getChildren(node) {
    if (node) {
      return this._getChildren(node)
    } else {
      if(this.tree) {
        //return this.tree.children
        return this.tree.Runbooks
      } else {
        return []
      }
      //return this.tree ? this.tree.children : []
    }
  }

  _getChildren(node) {
    if(node.parent.type === 'array') {
      return this.toArrayValueNode(node)
    } else if (node.type === 'array') {
      return node.children[0].children
    } else {
      return node.children[1].children
    }



    //return node.parent.type === 'array' ? this.toArrayValueNode(node) : (node.type === 'array' ? node.children[0].children : node.children[1].children);
  }

  getTreeItem(node) {
 
    let treeItem = new vscode.TreeItem(node.Name, vscode.TreeItemCollapsibleState.None)
    treeItem.command = {
			command: 'extension.openSpecificRunbook',
			title: '',
			arguments: [treeItem.label]
    }
	  return treeItem;
  }

/*
  getLabel(node) {
    //console.log("node", node)
		if (node.parent.type === 'array') {
			if (node['arrayValue']) {
				delete node['arrayValue']
				if (!node.children) {
					return node.value.toString()
				}
			} else {
        return node.children[0].children[0].value.toString()
				// return node.parent.children.indexOf(node).toString()
			}
    }
    
    const property = node.children[0].value.toString()
    if (node.children[1].type === 'object') {
			return '{ } ' + property;
		}
		if (node.children[1].type === 'array') {
			return '[ ] ' + property;
		}
    
    return property
  }
  
  toArrayValueNode(node) {
    if (node.type === 'array' || node.type === 'object') {
			return node.children;
		}
		node['arrayValue'] = true;
		return [node];
  }
*/
}

module.exports = RunbookProvider