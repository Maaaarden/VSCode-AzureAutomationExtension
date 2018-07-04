var vscode = require('vscode')
var json = require('jsonc-parser')
const Azure = require('./AzureAutomation.js')
var _ = require('lodash')

class RunbookProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.tree = null
    // console.log("fish")
    this.parseTree()
    this._onDidChangeTreeData.fire()
  }

  parseTree() {
    this.tree = null
    //this.tree = json.parseTree()
    this.getRunbookList(function(runbookList) {
      this.tree = json.parseTree(runbookList)
    })
    //this.tree = json.parseTree('{"Runbook1": "","Runbook2": "","Runbook3": ""}')
    //this.tree = '{"Runbook1": [{"Cloud": null}],"Runbook2": [{"Description": "Kan fiske 2 gange"}],"Runbook3": [{"Description": "Kan fiske 3 gange"}]}'
    
    // console.log("tree", this.tree)
  }

  getRunbookList(next) {
    var listOfRunbooks
    Azure.getListOfRunbooks(function(runbookList) {
      //console.log("runbooklist", runbookList)

      listOfRunbooks = '{'
      
      _.forEach(runbookList, function (runbookObject) {
        listOfRunbooks += '"' + runbookObject + '": "",'
      })
      listOfRunbooks = listOfRunbooks.replace(/,(\s+)?$/, '')
      listOfRunbooks += '}'

      //var listOfRunbooks2 = JSON.parse(listOfRunbooks)

      //console.log(listOfRunbooks)
      return next(listOfRunbooks)
      //console.log(listOfRunbooks2)
    })
    
  }

  getChildren(node) {
    if (node) {
      return this._getChildren(node)
    } else {
      return this.tree ? this.tree.children : []
    }
  }

  _getChildren(node) {
    return node.parent.type === 'array' ? this.toArrayValueNode(node) : (node.type === 'array' ? node.children[0].children : node.children[1].children);
  }

  getTreeItem(node) {
    //console.log(node)
    let valueNode = node.parent.type == 'array' ? node : node.children[0]
    let hasChildren = (node.parent.type === 'array' && !node['arrayValue']) || valueNode.type === 'object' || valueNode.type === 'array'
    //console.log(valueNode)
    //console.log(hasChildren)
		let treeItem = new vscode.TreeItem(this.getLabel(node), hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)

		return treeItem;
  }

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

}

module.exports = RunbookProvider