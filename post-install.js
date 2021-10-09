const { config  }= require("dotenv");
const { exec } = require("child_process");
const path = require("path");

let configDir = "";
process.env.NODE_ENV == 'production' ? configDir = path.resolve(__dirname, "./.env.production") : configDir = path.resolve(__dirname, "./.env.development")
config({
     path: configDir
});

console.log(process.env);
for (let key in process.env) {
     exec(`heroku config set ${key}=${process.env[key]}`, (error, stdout, stderr) => {
          console.log(error, stdout, stderr )
     });
}
