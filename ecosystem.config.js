module.exports = {
  apps: [{
    name: 'docnhanh-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/docnhanh',
    user: 'docnhanh',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      REACT_APP_API_URL: 'https://your-api-domain.com',
      REACT_APP_BASE_URL: 'https://your-domain.com'
    },
    error_file: '/var/log/pm2/docnhanh-error.log',
    out_file: '/var/log/pm2/docnhanh-out.log',
    log_file: '/var/log/pm2/docnhanh.log',
    time: true
  }]
};
