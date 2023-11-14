module.exports = {
    apps: [
        {
            name: 'API_DEV',
            script: './dist/src/main.js',
            watch: false,
            env: {
                PORT:3000,
                DB_HOST: 'wairi.cd3o2k56nbte.ap-northeast-2.rds.amazonaws.com',
                DB_PORT: '3306',
                DB_USER: 'admin',
                DB_PASSWORD: 'wairisuccess^^77',
                DB_SCHEMA: 'wairi',
                NODE_ENV: "development",

                ENTITY_PATH:'dist/**/*.entity{.js}',
                JWT_SECRET:'wairi_jwt_secret',
                JWT_REFRESH_SECRET:'wairi_jwt_secret_refresh',
                JWT_EXPIRATION_TIME:'7d',
                JWT_EXPIRATION_REFRESH_TIME:'30d',

                AWS_REGION:'ap-northeast-2',
                AWS_BUCKET_NAME:'wairi',
                AWS_ACCESS_KEY:'AKIA4EHT2T5MKCVIA7HS',
                AWS_SECRET_KEY:'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',

                BOOTPAY_APPLICATION_ID:'6502477a00c78a001a44eedf',
                BOOTPAY_PRIVATE_KEY:'ZIV+z148QtYk16RBc7yk8WB61YMqTASiCQ+ucosCMPs=',

                MADEIN20_CLIENT_ID:'i598wjz8egN812iYLXBvSSwruE4qx0IQ',
                MADEIN20_CHANNEL_ID:'@wairi',

                FIREBASE_PROJECT_ID:'wairi-399502',
                FIREBASE_PRIVATE_KEY:'-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCjBaLDlQ4c7xVV\nX1TABxON3JEO3g5bWbqsGQ/cNc0M4++9kKXWR6g13leZSwHsrtODawM5JWo4qJ96\n6kVBFZC2dLeBbBKXkyk6IoctE4c0WRxl13aSVGkFyorAmgUIV9sbLU7I5EFRaT7K\nkc6kPgkONTLycTBHqYZ8diNZDvW9He0GTB/hY1bzbSznOIUAMv8yniOpLbnQNkvK\nljlFcWffV/fUvaowGmDjiDCpzkyw6TmDJX73qJ7IeWuMeBq9T8HNY1MWbRhEowZb\nZuGWUUyPvvLG2y4pNx/L0riyp5FNFDBQj+ndRONDjZ95sdTPGupqzqnG2jeRyW6e\nPRAqTJllAgMBAAECggEAA7ovLUEacZYUJbT4XgFGFMODATUZshl/BOHNeh0Jyz5n\n6WyQpMb+en19q73VCq65m82Fz+1CJzmlwdHwPkDKY6g6AjMbdAyTj/vLnZUkItHZ\nw3NVx5qModWubqERizi1BANObpXsxLoptch30iCv+iZEZq99/tl0/3dVBLuB6gO8\nibD8j0UcdZdtDEc5idDakfG52MN3t5bKnYPaKQ1VTaGcKmRwdeMBxVUeRN3pECYR\nJ5mg/wmrOFwMJFkJ0kArSxwgj/cJn/TwBAAcRZiifjpwSCsIkhEDu2w2Knhpo7cf\nKVywJusPIWD/Vu1Kd/ou6vqGF1j1lwgdOMZjPMGIMQKBgQDZQbprka3TdTZCkgcZ\nSue6T9adw9PM79OKX4q0uPvEI7BahYPEWfLD4FGxs5LWqqoPFRlJzGLZZHIt893u\nZn4URklYrVZ9L0ymqd/DRz072Sx75HpxfN3mVGumn9ouwRlWTFmzM1ygGHWT1PRO\nz3b+CLVJxsui2yjSeGq2Ye0OlQKBgQDAF/eAIXc6rXWFbU6cJo43x4V70VZBYQ+A\n/8l/hmjoYHrff4BBRPgFDq23L/Kp6LmVLkJSPdLumkw0oVsWaDf3B5sxyrl6lKaF\nHps3s4nDfDmt3VOkAvBuFXIag3ZkDF6XIfNaXea3aW5mWQTBiSHIynfXanF7yRYx\n3xKEEj87kQKBgBQmEmHzisl3r2aRIHNqDP+sc90B0lzJSTcmETkdhsvz+2EJzOSi\n6u7bmPgADXg3L7piXIwJlolO1YAJg+WeP8cllZvRx5moj1VNn+D+dGFejM+Yqvpn\neDTqU2mKnbOEWRM11YPXGZoHarAhKd89Qm3g5N9Ivo4GAU0zucHcZx3ZAn8Ywv4k\nhivYZIPBr1Vyy4WJqy6Jx3JW+ywEdPSEe88KJWWxab4eq8VM4ZeDBatCO72wfUYP\nU+jc2Qb5wdL8EHMmZNScloVSR9cvUcKwa3RWvqywvNcLTVWw2xLaWBfqza1jzfyQ\nqYoUGoMgrljumb7BI1hPbGk0i7dQtnCsla2RAoGATcOanvULB9adi/OxypQOdueo\nBeP0TLV28X3a0mVnzpTIYBVmNrqPIqgO7BdG7ZjJE3lAMJGNtjuEaLG54z/h0fcG\nzU5iIyYbVtFBXBxnrnQs4FaKPXxIzIBH4hfFv7sv0BSNOmgo+K8AT9xBm1jbHOsZ\ndGd6Pwfanf2hqOYVFUk=\n-----END PRIVATE KEY-----\n',
                FIREBASE_CLIENT_EMAIL:'firebase-adminsdk-a707w@wairi-399502.iam.gserviceaccount.com',
                FIREBASE_DATABASE_URL:'https://wairi-399502-default-rtdb.firebaseio.com/',
                //환경변수 .env 파일로 관리
            }
        },
        {
            name: 'API_PROD',
            script: './dist/src/main.js',
            watch: false,
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
