export default {
  logging: [
    {
      name: 'main',
      level: 'ERROR',
      // streams: [{ path: "./logs/main.log", period: "1d", count: 7 }]
    },
    {
      name: 'httpLogger',
      level: 'ERROR',
      // streams: [{ path: "./logs/main_http.log", period: "1d", count: 7 }]
    },
  ],
}
