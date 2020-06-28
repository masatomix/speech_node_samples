export default {
  userinfo: {
    tenancyName: 'default',
    usernameOrEmailAddress: 'admin',
    password: 'xxxx',
    organizationUnit: 1,
  },
  serverinfo: {
    servername: 'https://orch.example1.xyz',
  },
  logging: [
    {
      name: 'main',
      level: 'debug',
      // streams: [{ path: "./logs/main.log", period: "1d", count: 7 }]
    },
    {
      name: 'httpLogger',
      level: 'debug',
      // streams: [{ path: "./logs/main_http.log", period: "1d", count: 7 }]
    },
  ],
}
