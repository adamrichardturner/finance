module.exports = {
  apps: [
    {
      name: 'finance-docker',
      script: 'docker-compose',
      args: 'up',
      cwd: '/var/www/finance',
      interpreter: '/bin/bash',
      env: {
        NODE_ENV: 'production',
        PORT: '6000',
        DEMO_USER_ID: '1',
        DEMO_PASSWORD_HASH:
          '$2b$10$3euPcmQFCiblsZeEu5s7p.9WxiKIUx0M9MNT8sMrUvRTCRaJPAJCa',
        DB_USER: 'finance',
        DB_PASSWORD: 'UHHw@!.Di*bcJaz-a3LJ*Q8-',
        DB_NAME: 'finance',
      },
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 20000,
      wait_ready: false,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
}
