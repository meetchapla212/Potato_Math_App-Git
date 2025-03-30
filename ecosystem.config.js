module.exports = {
    apps : [{
      name: 'potatomath',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '3G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }],
  };
  