const config = [
  {
    requestLibPath: "import request from '@/utils/request';",
    schemaPath: 'https://swagger.ppanel.dev/common.json',
    serversPath: './services',
    projectName: 'common',
  },
  {
    requestLibPath: "import request from '@/utils/request';",
    schemaPath: 'https://swagger.ppanel.dev/user.json',
    serversPath: './services',
    projectName: 'admin',
  },
];

export default config;
