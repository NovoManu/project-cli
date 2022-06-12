import * as path from 'path'
require('dotenv').config({
  path: `${path.join(__dirname, '..', '..', '..')}/.env`
})
import templatesCallback from './templates'
import installCallback from './install'
import syncCallback from './sync'
import { Command } from 'commander'

export default (command: Command) => {
  const project = command
    .command('project')
    .description(
      'Projects initialization (see list of sub-commands with --help)'
    )

  /*
    Get list of available templates
  */
  project
    .command('templates')
    .description('Get available templates')
    .action(templatesCallback)

  /*
    Install project from a template
  */
  project
    .command('install')
    .description('Install a new project from a template')
    .option('-t, --template <template>', 'Template name')
    .option('-n, --name <name>', 'Project name')
    .action(installCallback)
  /*
    Project sync with a template
 */
  project
    .command('sync')
    .description('Sync a project with a template')
    .action(syncCallback)
}
