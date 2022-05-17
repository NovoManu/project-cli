import { IInstallationSettings } from '../types'

const chalk = require('chalk')
require('dotenv').config()
import { Command } from 'commander'
import { getTemplates, getRepositoryTarArchive } from '../utils/github'
import { copyTemplateFiles, syncProject } from '../utils/fs'
import { getInstallationSettings } from '../utils/settings'

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
    .action(async () => {
      try {
        console.log(chalk.inverse('Getting templates'))
        const templates = await getTemplates()
        if (templates) {
          console.log('Next templates are found:')
          templates.forEach(({ name }, i) => {
            console.log(`${++i}: ${name}`)
          })
        } else {
          console.log('No Templates found')
        }
      } catch (e) {
        console.log(chalk.red('Not possible to get templates'))
        console.log(e)
      }
    })

  /*
    Install project from a template
  */
  project
    .command('install')
    .description('Install a new project from a template')
    .option('-t, --template <template>', 'Template name')
    .option('-n, --name <name>', 'Project name')
    .action(async ({ template: templateName, name: projectName }) => {
      const installationSettings: IInstallationSettings =
        await getInstallationSettings()
      console.log(chalk.blue('Checking available templates'))
      const templates = await getTemplates()
      if (templates) {
        const template = templates.find(({ name }) => name === templateName)
        console.log(chalk.blue(`Finding template ${templateName}`))
        if (template) {
          // Note: get repo archive
          const res = await getRepositoryTarArchive()
          console.log(chalk.blue(`Copying files from template ${templateName}`))
          await copyTemplateFiles(
            // @ts-ignore
            res.data,
            templateName,
            projectName,
            installationSettings
          )
        } else {
          console.log(
            chalk.red(`Template with name ${templateName} does not exist`)
          )
        }
      } else {
        console.log('No Templates found')
      }
    })
  /*
    Project sync with a template
 */
  project
    .command('sync')
    .description('Sync a project with a template')
    .action(() => {
      syncProject()
    })
}
