/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  future: {
    v2_normalizeFormMethod: true,
    v2_errorBoundary: true,
    v2_routeConvention: true,
    v2_meta: true,
  },
  serverModuleFormat: 'esm',
  serverPlatform: 'node',
  // Enable React compiler
  compiler: {
    transform: 'react-refresh',
  },
}
