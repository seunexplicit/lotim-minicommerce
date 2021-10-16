module.exports = {
     apps: [{
          name: "development",
          script: "src/index.ts",
          /*script:"./node_modules/.bin/ts-node -r ./node_modules/tsconfig-paths/register src/index.ts",*/
          watch: ['src'],
          ignore_watch: ['src/public'],
          interpreter: 'node',
          interpreter_args: '--require ./node_modules/ts-node/register --require .//node_modules/tsconfig-paths/register',
          env_development: {
               "NODE_ENV": "development"
          },
          env_production: {
               "NODE_ENV": "production"
          }
     },
     {
          name: "production",
          script: "dist/index.js",
          /*script:"./node_modules/.bin/ts-node -r ./node_modules/tsconfig-paths/register src/index.ts",*/
          watch: ['dist'],
          ignore_watch:['dist/public'],
          /*interpreter: 'node',
          interpreter_args: '--require ./node_modules/ts-node/register --require .//node_modules/tsconfig-paths/register',*/
          env_production: {
               "NODE_ENV": "production"
          },
          env_development: {
               "NODE_ENV": "development"
          }
     }
     ],

     deploy: {
          production: {
               user: 'SSH_USERNAME',
               host: 'SSH_HOSTMACHINE',
               ref: 'origin/main',
               repo: 'https://github.com/seunexplicit',
               path: '/lotim-minicommerce',
               'pre-deploy-local': '',
               'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production --ext ts,json',
               'pre-setup': ''
          }
     }
};
