module.exports = {
  apps : [{
    name: "HADRIA2",
    script: "./server_multi.js",
    instances: "max",
    // instances: "1",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    exec_mode: "cluster",
    max_memory_restart: "100M"
  }]
}