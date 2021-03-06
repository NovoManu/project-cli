import { input, select, confirm } from '../../utils/inquirer'
import { getTemplatesDir, removeFileOrDirectoryWithContent } from '../../utils/fs'
import * as fs from 'fs'
const chalk = require('chalk')

const { GITHUB_TEMPLATES_PATH } = process.env

const TEMPLATE_SETTINGS_FILE = `[[b]]settings`
const SETTING_STORAGE_FILE = 'mucli.json'

export interface ISettings {
  [key: string]: any
  folderName: string
  template: {
    id: string
  }
  modules?: Record<string, boolean>
}

export const settings: ISettings = {
  folderName: null,
  template: {
    id: null
  }
}

export const getSettings = async (): Promise<ISettings> => {
  settings.folderName = await input(
    chalk.white('Where would you like to install your project?'),
    'my-project'
  )
  return settings
}

export const readSettingsFromTemplate = async (
  templateId: string
): Promise<{ [key: string]: any }> => {
  // Check if settings.js or settings.ts are exist
  const templateSettingsBase = `${getTemplatesDir()}/${GITHUB_TEMPLATES_PATH}/${templateId}/${TEMPLATE_SETTINGS_FILE}`
  const templateSettingsFileTS = `${templateSettingsBase}.ts`
  const templateSettingsFileJS = `${templateSettingsBase}.js`
  let templateSettingsFile = null
  if (fs.existsSync(templateSettingsFileTS)) {
    templateSettingsFile = templateSettingsFileTS
  }
  if (fs.existsSync(templateSettingsFileJS)) {
    templateSettingsFile = templateSettingsFileJS
  }
  let settings: { [key: string]: any } = {}
  if (templateSettingsFile) {
    try {
      const getInstallationSettings = require(templateSettingsFile)
      settings = await getInstallationSettings({
        input,
        confirm,
        select
      })
    } catch (e) {
      console.error(e)
    }
  }
  // Remove settings file
  removeFileOrDirectoryWithContent(templateSettingsFile)
  return settings
}

export const createSettingsFile = (settings: any): void => {
  const settingsFileName = `${process.cwd()}/${
    settings.folderName
  }/${SETTING_STORAGE_FILE}`

  // Remove temporary properties
  delete settings.folderName

  // Write settings file
  fs.writeFileSync(settingsFileName, JSON.stringify(settings, null, 2), 'utf8')
}

export const readSettingsFile = () => {
  const settingsFileName = `${process.cwd()}/${SETTING_STORAGE_FILE}`
  let settings
  try {
    settings = fs.readFileSync(settingsFileName, 'utf-8')
  } catch (e) {
    throw new Error('Could not find or open settings file')
  }
  return JSON.parse(settings)
}
