// Test Dashboard API Endpoint
// Run with: node test-dashboard-api.js

const BASE_URL = 'http://localhost:3000';

// You'll need to replace this with a valid JWT token
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testDashboardAPI() {
  try {
    console.log('🧪 Testing Dashboard API...\n');
    
    // Test without authentication
    console.log('1. Testing without authentication (should fail):');
    const response1 = await fetch(`${BASE_URL}/api/dashboard`);
    console.log(`   Status: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`   Response: ${JSON.stringify(data1, null, 2)}\n`);
    
    // Test with authentication
    if (JWT_TOKEN !== 'YOUR_JWT_TOKEN_HERE') {
      console.log('2. Testing with authentication:');
      const response2 = await fetch(`${BASE_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`   Status: ${response2.status}`);
      const data2 = await response2.json();
      console.log(`   Response: ${JSON.stringify(data2, null, 2)}`);
      
      if (data2.success) {
        console.log('\n✅ Dashboard API is working correctly!');
        console.log('\n📊 Dashboard Statistics:');
        console.log(`   Main Balance: ${data2.data.mainBalance}`);
        console.log(`   Total Win: ${data2.data.totalWin}`);
        console.log(`   Total Players: ${data2.data.totalPlayers}`);
        console.log(`   Total Games: ${data2.data.totalGames}`);
      }
    } else {
      console.log('2. Skipping authenticated test - please set JWT_TOKEN');
      console.log('   To get a token, login through your authentication endpoint');
    }
    
  } catch (error) {
    console.error('❌ Error testing Dashboard API:', error.message);
  }
}

// Test the endpoint
testDashboardAPI();

console.log('\n📝 Usage Instructions:');
console.log('1. Make sure your server is running on port 3000');
console.log('2. Replace JWT_TOKEN with a valid token from your auth system');
console.log('3. Run: node test-dashboard-api.js');
console.log('4. Check the console output for results');
