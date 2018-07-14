var vscode = require('vscode')
var json = require('jsonc-parser')
const Azure = require('./AzureAutomation.js')
var _ = require('lodash')

class RunbookProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.tree = null
    this.parseTree()
    this.refresh()
    //var fish = '{"Runbooks":[{"Name":"AzureAutomationTutorial"},{"Name":"AzureAutomationTutorialPython2"},{"Name":"AzureAutomationTutorialScript"},{"Name":"AzureClassicAutomationTutorial"},{"Name":"AzureClassicAutomationTutorialScript"},{"Name":"BS-PowershellRunbookTemplate"},{"Name":"DisBeTestin"},{"Name":"First-Test"},{"Name":"Post-Runbook"},{"Name":"Pre-Runbook"},{"Name":"ttttttt"},{"Name":"verbosetest"}]}'
    //this.tree = JSON.parse(fish)
    //this.getRunbookList(function() {
      
    //})
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  parseTree(rbs) {
    this.tree = null
    //this.getRunbookList()
    //.then(result => this.tree = JSON.parse(result))
    //this.tree = runbookList
    //this.getRunbookList(function(rbl) {
    //  console.log('rbl', rbl)
    //  obj.tree = JSON.parse('{"Runbooks":[{"Name":"AzureAutomationTutorial"},{"Name":"AzureAutomationTutorialPython2"},{"Name":"AzureAutomationTutorialScript"},{"Name":"AzureClassicAutomationTutorial"},{"Name":"AzureClassicAutomationTutorialScript"},{"Name":"BS-PowershellRunbookTemplate"},{"Name":"DisBeTestin"},{"Name":"First-Test"},{"Name":"Post-Runbook"},{"Name":"Pre-Runbook"},{"Name":"ttttttt"},{"Name":"verbosetest"}]}') //rbl
    //})
    //this.tree = JSON.parse(rbs)
    this.tree = JSON.parse('{"Runbooks":[{"Name":"AzureAutomationTutorial"},{"Name":"AzureAutomationTutorialPython2"},{"Name":"AzureAutomationTutorialScript"},{"Name":"AzureClassicAutomationTutorial"},{"Name":"AzureClassicAutomationTutorialScript"},{"Name":"BS-PowershellRunbookTemplate"},{"Name":"DisBeTestin"},{"Name":"First-Test"},{"Name":"Post-Runbook"},{"Name":"Pre-Runbook"},{"Name":"ttttttt"},{"Name":"verbosetest"}]}')
  }

  getRunbookList(next) {
    var listOfRunbooks = ''
    Azure.getListOfRunbooks(function (runbookList) {
      listOfRunbooks = '{"Runbooks":['
      _.forEach(runbookList, function (runbookObject) {
        listOfRunbooks += '{"Name":"' + runbookObject + '"},'
      })
      listOfRunbooks = listOfRunbooks.replace(/,(\s+)?$/, '')
      listOfRunbooks += ']}'
      RunbookProvider.tree = listOfRunbooks
      return next()
      //return next(listOfRunbooks)
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
    //console.log(node)
    /*
    let valueNode
    if(node.parent.type == 'array') {
      valueNode = node
    } else {
      valueNode = node.children[0]
    }

    //let valueNode = node.parent.type == 'array' ? node : node.children[0]
    let hasChildren = false
    if(node.parent.type === 'array' && !node['arrayValue'] || valueNode.type === 'object' || valueNode.type === 'array') {
      hasChildren = true
    }

    //let hasChildren = (node.parent.type === 'array' && !node['arrayValue']) || valueNode.type === 'object' || valueNode.type === 'array'
    //console.log(valueNode)
    //console.log(hasChildren)
		let treeItem = new vscode.TreeItem(this.getLabel(node), hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)
    */
    let treeItem = new vscode.TreeItem(node.Name, vscode.TreeItemCollapsibleState.None)
   
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