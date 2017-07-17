module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        {
            "name": "app",
            "script": "./node_modules/homebridge/bin/homebridge",
            "args": "-D -U /home/data -P /home/app",
            "node_args": process.env.NODE_ARGS,
            "watch": ["/home/data/config.json"],
            "merge_logs": true,
            "log_date_format": "",
            "env": {
                "NODE_ENV": "development"
            },
            "env_production": {
                "NODE_ENV": "production"
            }
        }
    ],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy: {
        production: {
            user: "node",
            host: "212.83.163.1",
            ref: "origin/master",
            repo: "git@github.com:repo.git",
            path: "/var/www/production",
            "post-deploy": "npm install && pm2 startOrRestart ecosystem.json --env production"
        },
        dev: {
            user: "node",
            host: "212.83.163.1",
            ref: "origin/master",
            repo: "git@github.com:repo.git",
            path: "/var/www/development",
            "post-deploy": "npm install && pm2 startOrRestart ecosystem.json --env dev",
            env: {
                NODE_ENV: "dev"
            }
        }
    }
}