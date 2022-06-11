const confirm = require('@inquirer/confirm')
const input = require('@inquirer/input')
import { IInstallationSettings } from '../types'

export const getInstallationSettings =
  async (): Promise<IInstallationSettings> => {
    const settings: IInstallationSettings = {
      devPort: 8080
    }
    // const devPort = await input({
    //   message: 'Enter development port',
    //   default: 8080,
    //   validate: (value) =>
    //     new Promise((resolve) => {
    //       setTimeout(
    //         () =>
    //           resolve(
    //             Number.isInteger(Number(value)) || 'You must provide a number'
    //           ),
    //         3000
    //       )
    //     })
    // })
    // settings.devPort = Number(devPort)
    return settings
  }
