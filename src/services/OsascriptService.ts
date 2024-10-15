const { spawn } = require('child_process');

export interface IOsaScriptService {
    executeScript(JXA_script: string): Promise<string>;
}

export class OsaScriptService implements IOsaScriptService {
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