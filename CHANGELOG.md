# Change Log
All notable changes to the "azureautomation" extension will be documented in this file.

## [1.0.14] - 2021-12-15
### Fixed
 - Fixed the output channel for PS7 runbooks.

## [1.0.11] - 2021-11-25
### Removed
 - Removed the option to manualle override API version. This has caused some API call to fail.
   All API are updated with latest version as per MS Documentation.

## [1.0.8] - 2021-11-10
### Fixed
 - Fixed a hardcoded region for runbooks, causing issues for automation accounts not in westeurope.

### Added
 - Added support for runbook runtime versions. Support for both PowerShell and Pyhton.

## [1.0.0] - 2019-02-20
### Fixed
 - Fixed an error that surfaced, when writing to disk. Causing "open runbook" not to work.

## [0.9.0] - 2018-10-29
### Added
 - Added support for Python2 runbooks. Create, Save Draft, Publish and run.
   Variable/Credential insert commands not supported.

## [0.8.0] - 2018-09-10
### Fixed
 - Fixed an issue with the character '+' in clientSecret, causing user to not get an oAuth token.
 
## [0.7.2] - 2018-09-06
### Added
 - Added functionality to check for settings before each command, to ensure all relevant settings have been filled
 
### Fixed
 - Fixed an issue causing 'Open runbook' from view, not to work

## [0.7.1] - 2018-09-05
### Fixed
 - Fixed an issue causing nobody to be able to get oAuth tokens for login.

## [0.7.0] - 2018-07-25
### Added
 - Added a new view container to the side bar with a view of runbooks in your Automation Account
 - Added a 'Refresh' button to the view
 - Added a 'Create new runbook' button to the view

### Fixed
 - Fixed an issue when having more than 100 runbooks, the rest would not be shown in 'Open runbook from Azure' command

## [0.6.7] - 2018-06-13
### Fixed
 - Fixed and error still preventing job execution when no hybridworkers present

## [0.6.6] - 2018-06-12
### Added
 - Added 'Open runbook from azure' functionality

### Fixed
 - Fixed problem when executing runbook on Azure, with no HybridWorkers on automation account

## [0.6.5] - 2018-05-23
### Changed
 - Added support for 'Integer' and 'Boolean' variable types

## [0.6.4] - 2018-05-21
### Changed
 - Added configuration option for 'DualVars' notation
    Change the value of 'dualVars' under configuration to 'false', to make the extension only make use of 1 variable/credential
 - Added code to support for both dual and single var notation

## [0.6.2] - 2017-09-20
### Fixed
 - Fixed a bug, where creation of variables / credentials didn't work.

## [0.6.1] - 2017-08-31
### Changed
 - Removed usage of 'azureconfig.json' file with settings for connection to Azure.
 - Added use of settings in VS Code instead

### Removed
 - Removed use of name and mail properties to be able to create runbooks.

## [0.5.2] - 2017-08-31
### Added
 - Added info about job output to readme
