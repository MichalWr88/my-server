module.exports = {
  apps: [
    {
      name: "my-server",
      script: "./build/index.js",
      exec_mode: "cluster",
      instances: 2,
      max_memory_restart: "200M",
    },
  ],
};
