module.exports = {
     apps: [{
          script: "dist/index.js",
          /*script:"./node_modules/.bin/ts-node -r ./node_modules/tsconfig-paths/register src/index.ts",*/
          watch: true,
          instances:"max",
          /*
          interpreter: 'node',
          interpreter_args: '--require ./node_modules/ts-node/register --require .//node_modules/tsconfig-paths/register',*/
          env: {
               "NODE_ENV": "development"
          },
          env_production:{
               "NODE_ENV": "production"
          }
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/main',
            repo: 'https://github.com/seunexplicit',
            path: '/lotim-minicommerce',
      'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production --ext ts,json',
      'pre-setup': ''
       }
  }
};
