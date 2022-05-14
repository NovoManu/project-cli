const chalk = require('chalk')
require('dotenv').config()
import { Command } from 'commander'
import octokit from '../utils/Octokit'
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'

export default (command: Command) => {
  const project = command
    .command('project')
    .description(
      'Projects initialization (see list of sub-commands with --help)'
    )

  project
    .command('templates')
    .description('Get available templates')
    .action(async () => {
      try {
        console.log(chalk.inverse('Getting templates'))
        const {
          GITHUB_OWNER,
          GITHUB_TEMPLATES_REPOSITORY,
          GITHUB_TEMPLATES_PATH
        } = process.env
        const res: GetResponseDataTypeFromEndpointMethod<any> =
          await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_OWNER,
            repo: GITHUB_TEMPLATES_REPOSITORY,
            path: GITHUB_TEMPLATES_PATH
          })
        const templates = res.data
        if (templates) {
          console.log('Next templates are found:')
          templates.forEach(({ name }, i) => {
            console.log(`${++i}: ${name}`)
          })
        } else {
          console.log('Templates not found')
        }
      } catch (e) {
        console.log(chalk.red('Not possible to get templates'))
        console.log(e)
      }
    })
}
