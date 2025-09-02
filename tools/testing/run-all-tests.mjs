import { exec } from 'child_process';

const runTests = () => {
  exec('mocha', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing tests: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Test errors: ${stderr}`);
      return;
    }
    console.log(`Test results:\n${stdout}`);
  });
};

runTests();
