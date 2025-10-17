process.env.NODE_ENV = 'development';
require('ts-node').register({
  project: './tsconfig.main.json'
});
require('./main/main.ts');
