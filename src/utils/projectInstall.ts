import { Buffer } from 'buffer'
import { IInstallationSettings } from '../types'
import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
import { archiveDirPath } from './constants'
import saveArchive from './tar'
import composeTemplate from './composeTemplate'
import {
  checkOrCreateDirectory,
  getDefaultPackageName,
  copyTempFilesToDestination,
  cleanTempDirectory
} from './fs'
import { createSettingsFile } from './settings'

const { GITHUB_TEMPLATES_PATH } = process.env

const installProject = async (
  buffer: Buffer,
  templateName: string,
  projectName: string = null,
  settings: IInstallationSettings
) => {
  await saveArchive(buffer)
  // Check template settings file
  const templateInstallationSettingsFile = `${archiveDirPath}/${GITHUB_TEMPLATES_PATH}/${templateName}/settings.js`
  let templateInstallationSettings = {}
  if (fs.existsSync(templateInstallationSettingsFile)) {
    try {
      const getInstallationSettings = require(templateInstallationSettingsFile)
      templateInstallationSettings = await getInstallationSettings()
    } catch (e) {
      console.error(e)
      throw new Error('Cannot read template settings file')
    }
  }
  settings = {
    ...settings,
    ...templateInstallationSettings
  }
  const destinationDirectory =
    projectName || getDefaultPackageName(templateName)
  checkOrCreateDirectory(destinationDirectory)
  let tempDirectory = path.join(
    archiveDirPath,
    process.env.GITHUB_TEMPLATES_PATH,
    templateName
  )
  // Compose composable template
  if (settings.templates) {
    console.log(chalk.blue('Found composable template'))
    await composeTemplate(settings.templates, templateName)
  }
  copyTempFilesToDestination(
    tempDirectory,
    path.join(process.cwd(), destinationDirectory),
    templateName,
    settings
  )
  createSettingsFile(templateName, settings, destinationDirectory)
  cleanTempDirectory()
}

export default installProject
