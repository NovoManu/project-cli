import {
  createSettingsFile,
  getSettings,
  readSettingsFromTemplate
} from './settings'
import { fetchTemplates, removeTemplates } from '../../utils/github'
import { select } from '../../utils/inquirer'
import {
  getListOfTemplates,
  checkOrCreateDirectory,
  getTemplatesDir
} from '../../utils/fs'
import deepMerge from '../../utils/deep-merge'
import processFilesInTemplate from '../../utils/files-processor'
import composeTemplate from '../../utils/compose-template'
const chalk = require('chalk')

const { GITHUB_TEMPLATES_PATH } = process.env

/*
  Project installation
*/
export default async () => {
  // Remove existing templates if they are exists
  await removeTemplates()

  // Fetching templates from gitlab
  await fetchTemplates()

  // Getting base settings
  let settings: any = await getSettings()

  // Get template name
  const templates = getListOfTemplates().map((template: string) => ({
    value: template
  }))
  settings.templateId = await select(chalk.white('Select template'), templates)

  // Getting template settings
  const templateSettings = await readSettingsFromTemplate(settings.templateId)

  // Merge global and template settings
  settings = deepMerge(settings, templateSettings)

  // Check if template is composable (it must include modules property)
  if (settings.modules) {
    console.log(chalk.white('Found composable template'))
    await composeTemplate(settings)
  }

  // Create destination directory
  checkOrCreateDirectory(settings.folderName)

  // Process and copy files in template
  const tempDir = `${getTemplatesDir()}/${GITHUB_TEMPLATES_PATH}/${
    settings.templateId
  }`
  const destDir = `${process.cwd()}/${settings.folderName}`
  await processFilesInTemplate(tempDir, destDir, settings)

  // Create settings mucli.json file
  const folderName = settings.folderName // store this name since it will be removed during settings file creation
  createSettingsFile(settings)

  // Clean-up and remove .tmp directory
  await removeTemplates()

  // Congrats message
  console.log(
    chalk.white(`You successfully installed ${settings.templateId} project`)
  )
  console.log(chalk.white('*************************'))
  console.log(chalk.white(`$ cd ${folderName}`))
  console.log(chalk.white('$ npm install'))
}
