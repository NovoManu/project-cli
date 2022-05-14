import { Command } from 'commander'

export default (command: Command) => {
  const project = command
    .command('project')
    .description('Projects initialization (see list of sub-commands with --help)')

  project
    .command('templates')
    .description('Get available templates')
    .action(() => {
      console.log('Getting templates')
    })
}
