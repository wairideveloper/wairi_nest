const dotenv = require("dotenv");

dotenv.config();
module.exports = {
    apps: [
        {
            name: 'API_DEV',
            script: './dist/src/main.js',
            watch: '.',
            env: {
                PORT:3000,
                DB_HOST: 'wairi.cd3o2k56nbte.ap-northeast-2.rds.amazonaws.com',
                DB_PORT: '3306',
                DB_USER: 'admin',
                DB_PASSWORD: 'wairisuccess^^77',
                DB_SCHEMA: 'wairi',
                NODE_ENV: "development"
                //환경변수 .env 파일로 관리

            }
        },
        {
            name: 'API_PROD',
            script: './dist/src/main.js',
            watch: '.',
            env_production: {
                PORT:4000,
                DB_HOST: '203.245.24.10',
                DB_PORT: '3306',
                DB_USER: 'wairi',
                DB_PASSWORD: 'wairi72@',
                DB_SCHEMA: 'wairi',
                NODE_ENV: "production"
            }
        },
    ],

    deploy: {
        production: {
            user: 'SSH_USERNAME',
            host: 'SSH_HOSTMACHINE',
            ref: 'origin/master',
            repo: 'GIT_REPOSITORY',
            path: 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};
