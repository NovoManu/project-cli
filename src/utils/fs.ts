import * as fs from 'fs'
import { Dirent } from 'fs'
import filePrefixes from './prefixes'
import * as nunjucks from 'nunjucks'
import { tempDirName } from './constants'

const { GITHUB_TEMPLATES_PATH } = process.env

nunjucks.configure({ autoescape: false })

export const checkOrCreateDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export const removeFileOrDirectoryWithContent = (path: string): void => {
  fs.rmSync(path, { recursive: true, force: true })
}

export const getTemplatesDir = () => `${process.cwd()}/${tempDirName}`

export const getListOfTemplates = (): Array<string> => {
  const tempDir = `${getTemplatesDir()}/${GITHUB_TEMPLATES_PATH}`
  const templates = []
  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir, { withFileTypes: true }).forEach((file: Dirent) => {
      // Show only directories in the templates repository and exclude hidden ones (e.t. .git)
      if (file.isDirectory() && !file.name.startsWith('.')) {
        templates.push(file.name)
      }
    })
  }
  return templates
}

export const removePrefixFromFileName = (fileName: string) => {
  const prefixes = filePrefixes.map(({ prefix }) => prefix)
  prefixes.forEach((prefix) => {
    fileName = fileName.replace(prefix, '')
  })
  return fileName
}

/*
  Nunjuck is template engine which replace strings in files.
  For example:
  We have settingsFile = { myProperty: 'Hello World' }
  if in a file nunjuck meets string {{ myProperty }} (double curly braces are mandatory) it will replace it with value: Hello World.
  More info see in the documentation: https://mozilla.github.io/nunjucks/
*/
export const setDynamicDataInFile = (fileName: string, settings) => {
  return nunjucks.render(fileName, settings)
}
