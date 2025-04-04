// Simple script to run seeds directly without using the Knex CLI
import knex from 'knex'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import database configuration from knexfile
import config from '../knexfile.js'

// Create database connection with the production config
const db = knex(config.production)

async function runSeeds() {
  try {
    console.log('Running seeds directly without using Knex CLI...')

    // Get seed files
    const seedDir = path.join(__dirname, '../db/seeds')
    const seedFiles = fs.readdirSync(seedDir).sort()

    for (const file of seedFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        console.log(`Running seed: ${file}`)

        try {
          // For TypeScript files that might use ESM-specific features, use ts-node in a separate process
          if (file.endsWith('.ts')) {
            const seedFilePath = path.join(seedDir, file)

            // Run the seed file in its own process
            console.log(`Running TypeScript seed file with ts-node: ${file}`)

            // Create a temporary runner file for this specific seed
            const tempRunnerPath = path.join(
              __dirname,
              `temp-runner-${Date.now()}.js`
            )

            const runnerContent = `
                          import knex from 'knex';
                          import { fileURLToPath } from 'url';
                          import { dirname } from 'path';
                          import config from '../knexfile.js';
                          
                          // Create database connection
                          const db = knex(config.production);
                          
                          async function runSeed() {
                            try {
                              // Import and run the seed file
                              const seedModule = await import('${seedFilePath.replace(/\\/g, '\\\\')}');
                              await seedModule.seed(db);
                              console.log('✅ Seed completed successfully');
                            } catch (error) {
                              console.error('Error running seed:', error);
                              process.exit(1);
                            } finally {
                              await db.destroy();
                              process.exit(0);
                            }
                          }
                          
                          runSeed();
                        `

            fs.writeFileSync(tempRunnerPath, runnerContent)

            try {
              // Execute the temporary runner with ts-node
              execSync(`node --loader ts-node/esm ${tempRunnerPath}`, {
                stdio: 'inherit',
                env: { ...process.env, NODE_ENV: 'production' },
              })

              console.log(`✅ Seed ${file} completed successfully`)
            } finally {
              // Clean up the temporary runner file
              fs.unlinkSync(tempRunnerPath)
            }
          } else {
            // For JavaScript files, import and run directly
            const seedModule = await import(path.join(seedDir, file))

            if (typeof seedModule.seed === 'function') {
              await seedModule.seed(db)
              console.log(`✅ Seed ${file} completed successfully`)
            } else {
              console.warn(`⚠️ Seed ${file} has no seed function, skipping`)
            }
          }
        } catch (err) {
          console.error(`❌ Error running seed ${file}:`, err)
        }
      }
    }

    console.log('All seeds completed!')
  } catch (error) {
    console.error('Error running seeds:', error)
    process.exit(1)
  } finally {
    await db.destroy()
  }
}

runSeeds()
