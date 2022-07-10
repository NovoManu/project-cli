export default function flatten(obj) {
  let result = {}
  for (const i in obj) {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      const temp = flatten(obj[i])
      for (const j in temp) {
        result[j] = temp[j]
      }
    } else {
      result[i] = obj[i]
    }
  }
  return result
}
