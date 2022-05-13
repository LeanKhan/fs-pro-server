import { exec, spawn } from 'child_process';

export interface ProcessData {
    data: any;
    args: Record<string, any>;
}

const scripts = {
    "player_names": {
        path: "../scripts/python_names.bat"
    }
}

/**
 * RunScript - Python for now!
 *
 * @param script the name of the script
 * @param action the function to execute
 * @param data data you are passing to function
 * @returns
 */
export function runScript(script: string, action: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(`${scripts[script].path} ${data}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error}`);
                reject(error);
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            }

            console.log(`stdout: \n${stdout}`);
            resolve(stdout);
        });
    })
}

export function runSpawn(script: string, args: string[], data?: ProcessData) {
    return new Promise((resolve, reject) => {
        const path = require.resolve(`${scripts[script].path}`);
        
        const p = spawn(path, args);

        let dataString = '';
        let errorString = '';

        p.stdout.on('data', function (data) {
            dataString += data.toString();
        });

        p.stderr.on("data", function (err) {
            errorString += err.toString();
        });

        // THIS doesn't seem to be a different 'end' thatn stdout end...
        /**
         * NOTE:
         *
         * This was emitting false positives.
         * I thought there were errors even though
         * errorString would be empty. So instead, just
         * check if errorString actually has any content
         * before you reject the promise.
         *
         */
        // py.stderr.on("end", function () {
        //     if (errorString) {
        //     console.error(errorString);
        //     console.log(`ERROR FROM ${scripts[script].path} SCRIPT -> error ${errorString}` );
        //     return reject(errorString);
        //     }
        // });

        p.stdout.on('end', function () {
            // console.log('Processed data => ', dataString);

            if (errorString) {
                console.log(`ERROR FROM ${scripts[script].path} SCRIPT -> error ${errorString}`);
                return reject(errorString);
            }
            return resolve(dataString);
        });
        
        if(data){
            p.stdin.write(JSON.stringify(data), (err: Error) => {
            // NOTE: trying not to spam the stdout...

            // console.log('Done writing!');

            if (err) {
                console.log(err);
                reject(err.toString());
                return;
            }
        });
        }

        p.stdin.end();
    });
}
