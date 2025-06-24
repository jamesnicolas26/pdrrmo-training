module.exports = {
  apps: [
    {
      name: "server",
      script: "./server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
        PORT: 5000,
        MONGO_URI: "mongodb+srv://jamesnicolas26:Guccigucci123@cluster0.jaip7.mongodb.net/pdrrmo-training?retryWrites=true&w=majority",
      },
      out_file: "/dev/stdout", // Standard output logs to console
      error_file: "/dev/stderr", // Error logs to console
      time: true,               // Add timestamps to logs
    },
  ],
};
