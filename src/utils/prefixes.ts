interface IFilePrefix {
  id: string
  prefix: string
  description: string
}

const filePrefixes: IFilePrefix[] = [
  {
    prefix: '[[b]]',
    id: 'bootstrap',
    description: 'Bootstrap only. It will be added only during the installation'
  },
  {
    prefix: '[[s]]',
    id: 'sync',
    description: 'Sync only. It will be added only if file is not exists'
  }
]

export default filePrefixes
