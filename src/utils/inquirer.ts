// npmjs.com/package/@inquirer/confirm
const inquirerConfirm = require('@inquirer/confirm')
// npmjs.com/package/@inquirer/input
const inquirerInput = require('@inquirer/input')
// npmjs.com/package/@inquirer/select
const inquirerSelect = require('@inquirer/select')

export const confirm = async (
  message: string,
  def: boolean = null
): Promise<boolean> => {
  const options: { message: string; default?: boolean } = { message }
  if (def !== null) options.default = def
  return await inquirerConfirm(options)
}

export const input = async (
  message: string,
  def: string = null,
  transform: (str: string, isFinal: boolean) => string = null,
  validate: (str: string) => boolean | string | Promise<boolean | string> = null
) => {
  const options: {
    message: string
    default?: string
    transform?: (str: string, isFinal: boolean) => string
    validate?: (str: string) => boolean | string | Promise<boolean | string>
  } = { message }
  if (def !== null) options.default = def
  if (transform !== null) options.transform = transform
  if (validate !== null) options.validate = validate
  return await inquirerInput(options)
}

interface IChoice {
  value: string
  name?: string
  description?: string
  disabled?: boolean
}

export const select = async (
  message: string,
  choices: Array<IChoice>,
  pageSize: number = null
): Promise<string> => {
  const options: {
    message: string
    choices: Array<IChoice>
    pageSize?: number
  } = { message, choices }
  if (pageSize !== null) options.pageSize = pageSize
  return await inquirerSelect(options)
}
