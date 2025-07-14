module.exports = {
  apps: [
    {
      name: "dc-bot",
      script: "npm",
      args: "run bot",
      cwd: "/home/naneek/dc-bot",
    },
    {
      name: "t530-service",
      script: "npm",
      args: "start",
      cwd: "/path/to/t530",
    },
    {
      name: "api-server",
      script: "npm",
      args: "start",
      cwd: "/path/to/api-server",
    },
    {
      name: "client",
      script: "npm",
      args: "start",
      cwd: "/path/to/client",
    },
  ],
};