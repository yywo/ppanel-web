const config = [
  {
    requestLibPath: "import request from '@/utils/request';",
    schemaPath: 'https://docs.ppanel.dev/swagger/common.json',
    serversPath: './services',
    projectName: 'common',
  },
  {
    requestLibPath: "import request from '@/utils/request';",
    schemaPath: 'https://docs.ppanel.dev/swagger/admin.json',
    serversPath: './services',
    projectName: 'admin',
  },
];

export default config;
