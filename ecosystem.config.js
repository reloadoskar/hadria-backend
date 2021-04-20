module.exports = {
  apps : [{
    name: "HADRIA2",
    script: "./server_multi.js",
    instances: "max",
    // max_memory_restart: "256M",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    exec_mode: "cluster",
  }]
}