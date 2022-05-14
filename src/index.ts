import { Command } from 'commander'
import project from './commands/project'

const program = new Command()

project(program)

program.parse()
