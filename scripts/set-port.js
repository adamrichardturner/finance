#!/usr/bin/env node

/**
 * Set the PORT environment variable based on NODE_ENV
 * Used by Docker and other deployment scripts
 */

const nodeEnv = process.env.NODE_ENV || 'development'
const port = nodeEnv === 'production' ? 6000 : 6001

// Set the PORT environment variable for the current process
process.env.PORT = port.toString()

console.log(`Setting PORT=${port} for NODE_ENV=${nodeEnv}`)

// Export the port for programmatic usage
export default port
