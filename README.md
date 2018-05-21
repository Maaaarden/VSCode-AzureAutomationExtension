# VSCode-AzureAutomationExtension
This extension will make you capable of working in Azure Automation without leaving Visual Studio Code.

## Before use
Before use, please follow the guide in the link below, to create an application in your Azure AD, to be used as access for this extension.
https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal

Make sure the application is added to your Automation Account as 'Contributor'

NEW: Make sure to update all the settings under 'Azure Automation configuration' by copying to your custom settings.


## Functions
 - Create Runbook (Using a template/or from scratch)
 - Save Draft
 - Publish
 - Publish and Run
 - Run
 - Create new Azure variable asset
 - Create new Azure credential asset
 - Insert Azure variable asset
 - Insert Azure credential asset

## Job outout
The extension makes use of output consoles in VS Code. When running a runbook in Azure (or any of your hybridworker groups), all outputs are shown inside VS Code.

Error output is automatically highlighted if any. 

## Background
This extension was made with specific use inside my organisation for eye. A few of the functions have been designed specifically for this.

Feedback on this functionality is more than welcome - as is changes to this, to support a broader usecase.
Below is a list of the functions, and a description of the usecase and way it has been coded.

### Create Runbook
Create a new runbook in your defined Azure Automation account.
Support for a template is possible. Under 'User Settings' just input the name of your template runbook, and any new runbook created through this extension, will be prefilled with the same content as that template runbook.
If you leave the name blank, a blank runbook will be created.

### Create new Azure variable / credential asset
Create a new variable or credential asset.
Based on the 'DualVars' setting, this will either create 1 or 2 assets. Insterting code into your runbook automatically

### Insert Azure variable / credential asset
Insert an existing variable or credential asset.
Based on the 'DualVars' setting, this will either use 1 or 2 assets. Insterting code into your runbook automatically