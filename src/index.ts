import { Command } from 'commander'
import { project } from './commands'

const program = new Command()

project(program)

program.parse()
