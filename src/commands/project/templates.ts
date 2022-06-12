const chalk = require('chalk')
import { getTemplates } from '../../utils/github'

const templatesCallback = async () => {
  try {
    console.log(chalk.inverse('Getting templates'))
    const templates = await getTemplates()
    if (templates) {
      console.log('Next templates are found:')
      templates.forEach(({ name }, i) => {
        console.log(`${++i}: ${name}`)
      })
    } else {
      console.log(chalk.red('No templates found'))
    }
  } catch (e) {
    console.log(chalk.red('Not possible to get templates'))
    console.log(e)
  }
}

export default templatesCallback
