# VSCode-AzureAutomationExtension
This extension will make you capable of working in Azure Automation without leaving Visual Studio Code.

## Before use
Before use, please follow the guide in the link below, to create an application in your Azure AD, to be used as access for this extension.
https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal

Make sure the application is added to your Automation Account as 'Contributor'

NEW: Make sure to update all the settings under 'Azure Automation configuration' by copying to your custom settings.

## Runbook view container
In the side bar, a new view has been added to give an overview of your runbooks.

When clicking on a runbook it will automatically fetch your draft version and create as a file locally in you open folder.
However, if you have a published version available, it will show as a child - so expand the runbook item and click 'Published' to get you published version of the runbook, to edit.
Below is a quick view of how the tree structure is supposed to look for your runbooks.
 - 'runbookname'
   - 'Published' (only if a published version exists)
   - 'Tags' (Shows a view of current tags associated with your runbok)

## Functionality
A list of the functionality available in this extension

 - Create Runbook (Using a template or from scratch)
 - Open existing runbook
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

### Open existing runbook
It is now posible to open a runbook already in your Automation Account, and start working on it inside VS Code.

### Save draft
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

## Job output
The extension makes use of output consoles in VS Code. When using it to execute a runbook in Azure (or any of your hybridworker groups), all outputs are shown inside VS Code.

Error output is automatically highlighted if any. 

## Background
This extension was made with specific use inside my organisation for eye. A few of the functions have been designed specifically for this.
Since version 0.6.4, it has been posible to turn off these functionalities. Trying to make this a generic usable as posible.

## Feedback
Feedback on this functionality is more than welcome - as is changes to this, to support a broader usecase.

I would really appreciate if you could bring usecases for the following examples, and requests to how it should work:

 - Parameters
    - It is posible to pull the parameters from the API, and thus be able to build some kind of functionality around that to support entering parameters when trying to run a runbook
 - Draft / Published
    - I would like to hear about your usage of these 2 versions of the runbook. And to hear if you have any wishes to support that way of working.