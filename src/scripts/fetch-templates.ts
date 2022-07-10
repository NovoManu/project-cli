import { fetchTemplates } from '../utils/github'

fetchTemplates().then(() => {
  console.log('Templates are downloaded into .tmp directory')
})
