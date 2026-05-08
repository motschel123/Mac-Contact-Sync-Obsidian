import { Readable } from 'stream';

const { spawn } = require('child_process');

const SPAWN_OPTS = {
    stdio: ['ignore', 'pipe', 'inherit']
};

export class OsaScriptService {
    executeScriptStream(JXA_script: string): Readable {
        const osascript = spawn('osascript', ['-l', 'JavaScript', '-e', JXA_script], SPAWN_OPTS);
        if (!osascript.stdout) {
            throw new Error('Failed to start osascript process');
        }

        const out: Readable = osascript.stdout;
        out.setEncoding('utf-8');
        
        osascript.on('error', (err: Error) => {
            console.error('error executing JXA script:', err);
        });

        osascript.on("close", (code: number, signal: string) => {
            if (code && code !== 0) {
                console.error(`osascript process exited with code ${code} and signal ${signal}`);
                console.debug(`JXA Script:\n${JXA_script}`);
            }
        });

        return out;
    }

    async executeScript(JXA_script: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // Start JXA Script
            const osascript = spawn('osascript', ['-l', 'JavaScript', '-e', JXA_script]);
            
            let output: string = '';
			osascript.stdout.on('data', (data: Buffer) => {
				output += data.toString('utf-8');
			});
            osascript.stderr.on('data', (data: Buffer) => {
				const errorMsg = data.toString('utf-8');
				reject(new Error(`Error executing JXA script: \n${errorMsg}`));
			});
            osascript.on('close', (code: number) => {
                if (code === 0) {
                    // If parsing fails, return the raw output
                    resolve(output);
                } else {
                    reject(new Error(`Error executing JXA script: \n${output}`));
                }
            });
        });
    }
}