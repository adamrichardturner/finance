/**
 * Server utility to manage environment variables for demo user
 */
export function getDemoUserEnv() {
  // Get environment variables for demo user
  const demoUserIdRaw = process.env.DEMO_USER_ID
  const passwordHashEnv = process.env.DEMO_PASSWORD_HASH

  // Verify required environment variables
  if (!demoUserIdRaw) {
    throw new Error('DEMO_USER_ID environment variable is required but not set')
  }

  if (!passwordHashEnv) {
    throw new Error(
      'DEMO_PASSWORD_HASH environment variable is required but not set'
    )
  }

  // Convert demo user ID to integer if it's a numeric string
  const demoUserId: string | number = /^\d+$/.test(demoUserIdRaw)
    ? parseInt(demoUserIdRaw, 10)
    : demoUserIdRaw

  // Process the password hash
  let passwordHash = passwordHashEnv

  // Remove quotes if present (Docker might add them)
  passwordHash = passwordHash.replace(/^['"]|['"]$/g, '')

  // Unescape the password hash if needed (replace \$ with $)
  passwordHash = passwordHash.replace(/\\\$/g, '$')

  return {
    demoUserId,
    demoUserPasswordHash: passwordHash,
  }
}
