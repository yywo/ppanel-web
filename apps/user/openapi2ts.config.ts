const config = [
  {
    requestLibPath: "import request from '@/utils/request';",
    schemaPath: 'https://docs.ppanel.dev/swagger/common.json',
    serversPath: './services',
    projectName: 'common',
  },
  {
    requestLibPath: "import request from '@/utils/request';",
    schemaPath: 'https://docs.ppanel.dev/swagger/user.json',
    serversPath: './services',
    projectName: 'user',
  },
];

export default config;
