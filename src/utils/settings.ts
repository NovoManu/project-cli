import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
import { IProjectSettings } from '../types'
import { settingsFileName } from './constants'

export const createSettingsFile = (
  templateName: string,
  installationSettings,
  destinationDirectory
) => {
  const destination = path.join(destinationDirectory, `/${settingsFileName}`)
  const settings: IProjectSettings = {
    templateId: templateName,
    ...installationSettings
  }
  fs.writeFile(destination, JSON.stringify(settings, null, 4), 'utf8', () => {
    console.log(chalk.blue('Settings file is created'))
  })
}

export const readSettingFile = (): IProjectSettings => {
  let settings
  try {
    settings = fs.readFileSync(settingsFileName, 'utf-8')
  } catch (e) {
    throw new Error('Could not find or open settings file')
  }
  return JSON.parse(settings)
}

export const getDefaultPackageName = (templateName: string): string => {
  return `my-project-${templateName}`
}
