import * as chalk from 'chalk'
import { composeTemplateSettingsFile, tempDirName } from './constants'
import {
  copyFilesWithMerge,
  getTemplatesDir,
  removeFileOrDirectoryWithContent
} from './fs'

const { GITHUB_TEMPLATES_PATH } = process.env

const composeTemplate = async (settings) => {
  console.log(chalk.white('Composing the template...'))
  const components = Object.keys(settings.modules)
  const selectedComponents = components.filter((key: string) => {
    return settings.modules[key]
  })
  const notSelectedComponents = components.filter((key: string) => {
    return !settings.modules[key]
  })
  const destinationDirectory = `${getTemplatesDir()}/${GITHUB_TEMPLATES_PATH}/${
    settings.templateId
  }`
  // Copy files from selected components
  for (const component of selectedComponents) {
    const componentDirectory = `${destinationDirectory}/${component}`
    copyFilesWithMerge(componentDirectory, destinationDirectory)
    // Remove template component
    removeFileOrDirectoryWithContent(componentDirectory)
  }
  // Delete non selected components from template
  for (const component of notSelectedComponents) {
    const componentDirectory = `${destinationDirectory}/${component}`
    // Remove template component
    removeFileOrDirectoryWithContent(componentDirectory)
  }
  // Remove template settings file
  removeFileOrDirectoryWithContent(
    `${destinationDirectory}/${composeTemplateSettingsFile}`
  )
}

export default composeTemplate
