module.exports = {
  apps: [
    {
      name: "notification-bot",
      script: "./dist/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
