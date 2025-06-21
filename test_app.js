const http = require('http');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`${description}: ${res.statusCode} ${res.statusMessage}`);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`${description}: ERROR - ${err.message}`);
      resolve(0);
    });
    
    req.setTimeout(5000, () => {
      console.log(`${description}: TIMEOUT`);
      req.abort();
      resolve(0);
    });
  });
}

async function runTests() {
  console.log('Testing PXV Pay Application...\n');
  
  await testEndpoint('http://localhost:3000', 'Homepage');
  await testEndpoint('http://localhost:3000/api/health', 'Health Check');
  await testEndpoint('http://localhost:3000/signin', 'Sign In Page');
  await testEndpoint('http://localhost:3000/users', 'Users Page (should redirect if not authenticated)');
  
  console.log('\nTest completed!');
}

runTests(); 