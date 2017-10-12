# VSCode-AzureAutomationExtension
This extension will make you capable of working in Azure Automation without leaving Visual Studio Code.

## Before use
Before use, please follow the guide in the link below, to create an application in your Azure AD, to be used as access for this extension.
https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal

Make sure the application is added to your Automation Account as 'Contributor'

NEW: Make sure to update all the settings under 'Azure Automation configuration' by copying to your custom settings.


## Functions
 - Create Runbook (Using a template)
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

### Update Personal Information
This is made to ensure that we get mail and name of person creating a runbook. We add these as tags to the runbook on creation.

### Create Runbook
We make use of a predefined runbook template, and thus this is made to fetch the content of this, to put as content when you create new runbook.
Name of the runbook is defined in the 'azureconfig.json' file inside the extension folder.

### Create new Azure variable / credential asset
We make use of a 2-part setup for our variables. Thus creating 2 variables in Azure, with the use of these functions.
Inserting code to runbook with support for this.

### Insert Azure variable / credential asset
Again, making use of the 2-part setup for variables. Inserting code to support for this.