# Prerequisites
Create github [token](https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication)

Before usage, you should specify the repository with your templates.
Repository structure has some requirements (see below).

Include env variables

For zsh
```
echo 'export GITHUB_TOKEN={your_token}' >> ~/.zshenv
echo 'export GITHUB_OWNER={repository_templates_owner}' >> ~/.zshenv
echo 'export GITHUB_TEMPLATES_REPOSITORY={repository_name}' >> ~/.zshenv
echo 'export GITHUB_TEMPLATES_PATH={path_to_templates_in_repository}' >> ~/.zshenv
source ~/.zshenv
```

For bash
```
echo 'export GITHUB_TOKEN={your_token}' >> ~/.bash_profile
echo 'export GITHUB_OWNER={repository_templates_owner}' >> ~/.bash_profile
echo 'export GITHUB_TEMPLATES_REPOSITORY={repository_name}' >> ~/.bash_profile
echo 'export GITHUB_TEMPLATES_PATH={path_to_templates_in_repository}' >> ~/.bash_profile
source ~/.bash_profile
```

Example for this repository https://github.com/NovoManu/cli-templates

```
GITHUB_OWNER=NovoManu
GITHUB_TEMPLATES_REPOSITORY=cli-templates
GITHUB_TEMPLATES_PATH=templates
```

# Package usage

You can use the package without additional installation using

```
$ npm init @novomanu/project-cli
```

Or install the package globally
```
$ npm install -g @novomanu/project-cli
```

It will give you global command `mucli`
```
$ mucli
```

After running the command `npm init @novomanu/project-cli` or `mucli` it will initiate a wizard with questions about what would you like to do with your templates.

# Templates creation
It is possible to specify your own templates: install and sync.

Before writing your templates you should create a git repository (Github is only supported at the moment).

After the repository creation, you could populate environment variables:

GITHUB_OWNER - owner of the github repository

GITHUB_TEMPLATES_REPOSITORY - name of the repository

Inside the repository, you should create any folder where you will keep your templates. The name is not important but should be added as an environment variable GITHUB_TEMPLATES_PATH.

## Settings
Each template can have its own settings file - `settings.js` or `settings.ts`.
This file should expose one function `getInstallationSettings`.
The function takes one parameter `<Object>` with functions to interact with users.
At the moment, three interaction functions are supported.

### confirm

`confirm(message, default): Promise<boolean>`

* `message` `<String>` - your question to confirm
* `default` `<Boolean>` `optional` - default value

### input

`confirm(message, default, transform, validate): Promise<string>`

* `message` `<String>` - your question to input
* `default` `<String>` `optional` - default value
* `transform` `<Function>` `optional` - receive the user input, answers hash and option flags, and return a transformed value to display to the user. The transformation only impacts what is shown while editing. It does not modify the answers hash.
* `validate` `<Function>` `optional` - receive the user input and answers hash. Should return true if the value is valid, and an error message (String) otherwise. If false is returned, a default error message is provided.

### select

`confirm(message, choices, pageSize): Promise<string>`

* `message` `<String>` - your question to select
* `choices` `<Array<Choice>>` - list of possible choices. Each choice is an `Object` and can have next properties:
  * `value` `<String>`
  * `name` `<String>` `optional`
  * `description` `<String>` `optional`
  * `disabled` `<Boolean>` `optional`
* `pageSize` `<Number>` - number of choices per page

## Dynamic properties
The package allows using of dynamic properties which will be replaced in files during the processing.

We are using nunjucks template engine for processing dynamic properties.
All properties should be stored in the settings file.

The package allows using of dynamic properties which will be replaced in files during the processing.

We are using nunjucks template engine for processing dynamic properties.
All properties should be stored in the settings file.

For example:
We have settingsFile
```javascript
{ myProperty: 'Hello World' }
```
if in a file nunjuck meets string `{{ myProperty }}` (double curly braces are mandatory) it will replace it with value: Hello World.
If we have the next file in a template
```javascript
const prop = {{myProperty}}
```
It will be transformed after the processing into
```javascript
const prop = 'Hello World'
```

More info see in the documentation: https://mozilla.github.io/nunjucks/

## Files prefixes

One of the core features of this package is using different prefixes for files.

### [[b]] - bootstrap

The file with the prefix `[[b]]` will be added ONLY during the initial installation.
It could be removed from the existing project and will be never added to the project after the synchronization.
This prefix is useful for files that you want to add as demo files and do not keep in your project.

### [[s]] - sync
The file with the prefix `[[s]]` will be added during the project installation.
It could be changed inside the project and won't be modified. The file will be added in case of removal from the project.
This prefix is useful for core files that must be in the project.

### [[m]] - merge
The file from the template with the prefix `[[m]]` will be merged with the file in the project (only .json files are supported at the moment).
This prefix is useful for files that should be merged. The best example is `package.json`.
Sync will overwrite properties from the template but keep all other custom properties.

### [[d]] - delete
The file from the template with the prefix `[[m]]` will be removed from the existing template.
This prefix is useful for files you would like to remove softly from the existing project.

Example of template structure:
```
[[b]]example.js - this file could be removed after the installation and will not be added again after sync.
[[s]]index.js - this file will be added during the installation and could be modified. If the file has been removed, it will be added back after sync.
[[m]]package.json - this file will be merged with the existing package.json.
[[d]]outdated.js - this file will be removed from the existing project after sync.
```

## Composable templates
This package is supporting two types of templates: composable and non-composable.

Non-composable templates are the simple number of files in them.

The more interesting thing is composable templates. The composable template will be composed of different modules inside it.

Modules for composable templates should be stored in the `modules` property in the settings file.
```javascript
const settings = {
	modules: {
		base: true,
        module1: true,
        module2: true,
    }
}
```
During the processing of the composable template, the package will check if folders with names in the module's property exist.
For the example settings file the package will check the `base`, `module1`, and `module2` folders inside the template's root.

All found folders will be merged one into another. It will help to create flexible templates.

See the example of the composable template here: https://github.com/NovoManu/cli-templates/tree/main/templates/test-composable
