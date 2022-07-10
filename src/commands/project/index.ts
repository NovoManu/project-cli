import { Command } from 'commander'
import { select } from '../../utils/inquirer'
import installProject from './install'
import syncProject from './sync'
const chalk = require('chalk')

enum initChoices {
  INSTALL = 'install',
  SYNC = 'sync'
}

export default (command: Command) => {
  /*
    Install or sync project
  */
  const project = command
    .description('Project initialization')
    .action(async () => {
      const installationChoices = [
        {
          value: initChoices.INSTALL,
          name: 'Create new project'
        },
        {
          value: initChoices.SYNC,
          name: 'Sync current project'
        }
      ]
      const choice = await select(
        chalk.white('What would you like to do?'),
        installationChoices
      )
      if (choice === initChoices.INSTALL) {
        await installProject()
      }
      if (choice === initChoices.SYNC) {
        await syncProject()
      }
    })
}
