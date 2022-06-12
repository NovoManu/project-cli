const chalk = require('chalk')
import { getTemplates, getRepositoryTarArchive } from '../../utils/github'
import { IProjectSettings } from '../../types'
import { readSettingFile } from '../../utils/settings'
import syncProject from '../../utils/projectSync'

const syncCallback = async () => {
  console.log(chalk.blue('Checking available templates'))
  const templates = await getTemplates()
  if (templates) {
    const settings: IProjectSettings = readSettingFile()
    console.log(chalk.blue(`Finding template ${settings?.templateId}`))
    const template = templates.find(({ name }) => name === settings?.templateId)
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
}

export default syncCallback
