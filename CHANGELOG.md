# Change Log
All notable changes to the "azureautomation" extension will be documented in this file.

## [0.6.3] - 2018-05-21
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
