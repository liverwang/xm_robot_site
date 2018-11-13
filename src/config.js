const BUILD_ENV = process.env.BUILD_ENV

let baseUrl = ''
if (process.env.NODE_ENV === 'production') {
  baseUrl = ''
  if (BUILD_ENV === 'DEV') {}
}

export {
  baseUrl
}
