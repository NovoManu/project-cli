const chalk = require('chalk')
import { getTemplates, getRepositoryTarArchive } from '../../utils/github'
import { IInstallationSettings } from '../../types'
import { getInstallationSettings } from '../../utils/settings'
import installProject from '../../utils/projectInstall'

const installCallback = async ({
  template: templateName,
  name: projectName
}) => {
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
}

export default installCallback
