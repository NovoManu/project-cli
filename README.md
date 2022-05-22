## Installation

Install the package globally
```
npm install -g @novomanu/project-cli
```

Include env variables
```
export GITHUB_TOKEN={your_token}
```
```
GITHUB_OWNER=NovoManu
```
```
GITHUB_TEMPLATES_REPOSITORY=cli-templates
```
```
GITHUB_TEMPLATES_PATH=templates
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
