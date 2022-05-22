## Installation

Install the package globally
```
npm install -g @novomanu/project-cli
```

Include env variables

For zsh
```
echo 'export GITHUB_TOKEN={your_token}' >> ~/.zshenv
echo 'export GITHUB_OWNER=NovoManu' >> ~/.zshenv
echo 'export GITHUB_TEMPLATES_REPOSITORY=cli-templates' >> ~/.zshenv
echo 'export GITHUB_TEMPLATES_PATH=templates' >> ~/.zshenv
source ~/.zshenv
```

For bash
```
echo 'export GITHUB_TOKEN={your_token}' >> ~/.bash_profile
echo 'export GITHUB_OWNER=NovoManu' >> ~/.bash_profile
echo 'export GITHUB_TEMPLATES_REPOSITORY=cli-templates' >> ~/.bash_profile
echo 'export GITHUB_TEMPLATES_PATH=templates' >> ~/.bash_profile
source ~/.bash_profile
```

## Usage

Get list of templates

```
mucli project templates
```

Install project
```
mucli project install -t {template_name} -n {project_name}
```

Project synchronization with the template
```
mucli project sync
```


## Development

Create github [token](https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication)

Fill the .env file (see .env.example)

Install dependencies
```
npm install
```

Check [prompt library](https://github.com/SBoudrias/Inquirer.js/tree/master/packages) documentation to include cli questions
