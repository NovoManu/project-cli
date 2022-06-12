import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'

const input = require('@inquirer/input')
import { IInstallationSettings, IProjectSettings } from '../types'
import { settingsFileName } from './constants'

export const getInstallationSettings =
  async (): Promise<IInstallationSettings> => {
    const settings: IInstallationSettings = {
      devPort: 8080
    }
    const devPort = await input({
      message: 'Enter development port',
      default: 8080,
      validate: (value) =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve(
                Number.isInteger(Number(value)) || 'You must provide a number'
              ),
            3000
          )
        })
    })
    settings.devPort = Number(devPort)
    return settings
  }

export const createSettingsFile = (
  templateName: string,
  installationSettings: IInstallationSettings,
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
