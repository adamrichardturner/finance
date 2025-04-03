export function getDemoUserEnv() {
  const demoUserIdRaw = process.env.DEMO_USER_ID
  const passwordHashEnv = process.env.DEMO_PASSWORD_HASH

  if (!demoUserIdRaw) {
    throw new Error('DEMO_USER_ID environment variable is required but not set')
  }

  if (!passwordHashEnv) {
    throw new Error(
      'DEMO_PASSWORD_HASH environment variable is required but not set'
    )
  }

  const demoUserId: string | number = /^\d+$/.test(demoUserIdRaw)
    ? parseInt(demoUserIdRaw, 10)
    : demoUserIdRaw

  let passwordHash = passwordHashEnv

  passwordHash = passwordHash.replace(/^['"]|['"]$/g, '')

  passwordHash = passwordHash.replace(/\\\$/g, '$')

  return {
    demoUserId,
    demoUserPasswordHash: passwordHash,
  }
}
