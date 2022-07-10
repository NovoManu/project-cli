import { fetchTemplates, removeTemplates } from '../../utils/github'
import { getTemplatesDir, getListOfTemplates } from '../../utils/fs'
import * as fs from 'fs'
const chalk = require('chalk')

const printListOfTemplates = async (): Promise<void> => {
  if (!fs.existsSync(getTemplatesDir())) {
    await fetchTemplates()
  }
  const templates = getListOfTemplates()
  templates.forEach((template, index) => {
    console.log(chalk.inverse(`${++index}: ${template}`))
  })
  await removeTemplates()
}

export default printListOfTemplates
