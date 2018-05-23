# VSCode-AzureAutomationExtension
This extension will make you capable of working in Azure Automation without leaving Visual Studio Code.

## Before use
Before use, please follow the guide in the link below, to create an application in your Azure AD, to be used as access for this extension.
https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal

Make sure the application is added to your Automation Account as 'Contributor'

NEW: Make sure to update all the settings under 'Azure Automation configuration' by copying to your custom settings.

## Functions
A list of the functionality available in this extension

 - Create Runbook (Using a template/or from scratch)
 - Save Draft
 - Publish
 - Publish and Run
 - Run
 - Create new Azure variable asset
 - Create new Azure credential asset
 - Insert Azure variable asset
 - Insert Azure credential asset

### Create Runbook
Create a new runbook in your defined Azure Automation account.
Support for a template is possible. Under 'User Settings' just input the name of your template runbook, and any new runbook created through this extension, will be prefilled with the same content as that template runbook.
If you leave the name blank, a blank runbook will be created.

### Save draf
Save a draft copy to the automation account

### Publish
Publish the runbook, will save a draft of the current editor content and then publish

### Publish and Run
Will do the same as the above, but afterwards it will execute the runbook for you to test functionality

### Run
Will execute the published version of runbook open in editor

### Create new Azure variable / credential asset
Create a new variable or credential asset.
Based on the 'DualVars' setting, this will either create 1 or 2 assets. Insterting code into your runbook automatically

### Insert Azure variable / credential asset
Insert an existing variable or credential asset.
Based on the 'DualVars' setting, this will either use 1 or 2 assets. Insterting code into your runbook automatically

## Settings
The following settings are available in 'User Settings'

  // API Version used by Azure REST API
  "azureautomation.apiVersion": "2018-01-15",

  // Name of the automation account you're working against
  "azureautomation.automationAccount": "",

  // Client ID for your AAD App
  "azureautomation.clientId": "",

  // Client secret for your AAD App
  "azureautomation.clientSecret": "",

  // Make use of double variable+credential notation as early versions, or single variable notation (If set to 'false' only one variable or credential is used)
  "azureautomation.dualVars": true,

  // Name of the resource group your automation account resides in.
  "azureautomation.resourceGroup": "",

  // ID of your subscription.
  "azureautomation.subscriptionId": "",

  // Name of your template in the automation account (Leave blank if you don't use a template)
  "azureautomation.templateName": ""

Remember to update these, accordingly to your AAD application, created for access to the Azure ARM API

## Job output
The extension makes use of output consoles in VS Code. When using it to execute a runbook in Azure (or any of your hybridworker groups), all outputs are shown inside VS Code.

Error output is automatically highlighted if any. 

## Background
This extension was made with specific use inside my organisation for eye. A few of the functions have been designed specifically for this.
Since version 0.6.4, it has been posible to turn off these functionalities. Trying to make this a generic usable as posible.

Feedback on this functionality is more than welcome - as is changes to this, to support a broader usecase.