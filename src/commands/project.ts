import { IInstallationSettings, IProjectSettings } from '../types'
import * as path from 'path'

const chalk = require('chalk')
require('dotenv').config({
  path: `${path.join(__dirname, '..', '..')}/.env`
})
import installProject from '../utils/projectInstall'
import syncProject from '../utils/projectSync'
import { Command } from 'commander'
import { getTemplates, getRepositoryTarArchive } from '../utils/github'
import { getInstallationSettings, readSettingFile } from '../utils/settings'

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
          console.log(chalk.red('No templates found'))
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
      console.log(chalk.blue('Checking available templates'))
      const templates = await getTemplates()
      if (templates) {
        console.log(chalk.blue(`Finding template ${templateName}`))
        const template = templates.find(({ name }) => name === templateName)
        if (template) {
          // Note: get repo archive
          const res = await getRepositoryTarArchive()
          console.log(chalk.blue(`Copying files from template ${templateName}`))
          const installationSettings: IInstallationSettings =
            await getInstallationSettings()
          await installProject(
            // @ts-ignore
            res.data,
            templateName,
            projectName,
            installationSettings
          )
        } else {
          console.log(
            chalk.red(
              `Template with name ${
                templateName || 'default-project'
              } does not exist`
            )
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
    .action(async () => {
      console.log(chalk.blue('Checking available templates'))
      const templates = await getTemplates()
      if (templates) {
        const settings: IProjectSettings = readSettingFile()
        console.log(chalk.blue(`Finding template ${settings?.templateId}`))
        const template = templates.find(
          ({ name }) => name === settings?.templateId
        )
        if (template) {
          // Note: get repo archive
          const res = await getRepositoryTarArchive()
          // @ts-ignore
          await syncProject(res.data, settings)
        } else {
          console.log(
            chalk.red(`Template with id ${settings.templateId} is not found`)
          )
        }
      }
    })
}
