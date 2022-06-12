import * as chalk from 'chalk'
import { tempDirName } from './constants'
import { copyTempFilesToDestination, removeFileOrDirectoryWithContent } from './fs'

const { GITHUB_TEMPLATES_PATH } = process.env

const composeTemplate = async (templateSettings, templateName) => {
  console.log(chalk.blue('Composing the template...'))
  const components = Object.keys(templateSettings)
  const selectedComponents = components.filter((key: string) => {
    return templateSettings[key]
  })
  const notSelectedComponents = components.filter((key: string) => {
    return !templateSettings[key]
  })
  const destinationDirectory = `${tempDirName}/${GITHUB_TEMPLATES_PATH}/${templateName}`
  // Copy files from selected components
  for (const component of selectedComponents) {
    const componentDirectory = `${destinationDirectory}/${component}`
    copyTempFilesToDestination(
      componentDirectory,
      destinationDirectory,
      templateName,
      {},
      true
    )
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
  removeFileOrDirectoryWithContent(`${destinationDirectory}/settings.js`)
}

export default composeTemplate
