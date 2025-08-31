const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1; // Change this to test with different users
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with actual JWT token

// Test the withdraw API
async function testWithdraw() {
  try {
    console.log('🧪 Testing Withdraw API');
    console.log('========================');
    
    // Test different withdrawal types
    const testScenarios = [
      {
        name: "Bank Withdrawal",
        data: {
          userId: TEST_USER_ID,
          amount: 25000.00,
          currencyId: 1,
          notes: "Bank withdrawal test",
          attachment: "bank_statement.pdf",
          accountNumber: "1234567890",
          accountHolderName: "John Doe",
          bankName: "Test Bank",
          branchName: "Main Branch",
          branchAddress: "123 Test St, Test City",
          swiftCode: "TESTUS33",
          iban: "US64TEST1234567890123456"
        }
      },
      {
        name: "Crypto Withdrawal",
        data: {
          userId: TEST_USER_ID,
          amount: 15000.00,
          currencyId: 1,
          notes: "Bitcoin withdrawal test",
          attachment: "wallet_screenshot.png",
          walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          network: "Bitcoin"
        }
      },
      {
        name: "Basic Withdrawal",
        data: {
          userId: TEST_USER_ID,
          amount: 10000.00,
          currencyId: 1,
          notes: "Basic withdrawal test"
        }
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n📤 Testing: ${scenario.name}`);
      console.log('Request Data:');
      console.log(JSON.stringify(scenario.data, null, 2));
      
      const response = await axios.post(
        `${BASE_URL}/api/transactions/withdraw`,
        scenario.data,
        {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`\n✅ ${scenario.name} - API Call Successful`);
      console.log('Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Analyze the response
      const { data } = response.data;
      
      console.log(`\n📋 ${scenario.name} Analysis:`);
      console.log(`- Transaction ID: ${data.transactionId}`);
      console.log(`- Custom Transaction ID: ${data.customTransactionId}`);
      console.log(`- Amount: ${data.amount}`);
      console.log(`- Status: ${data.status}`);
      console.log(`- Current Balance: ${data.currentBalance}`);
      console.log(`- Remaining Balance: ${data.remainingBalance}`);
      
      // Wait a bit between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ API Call Failed');
    
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      // Analyze error response
      if (error.response.data.data) {
        const errorData = error.response.data.data;
        console.log('\n🔍 Error Analysis:');
        console.log(`- Can Withdraw: ${errorData.canWithdraw ? '✅ YES' : '❌ NO'}`);
        
        if (errorData.withdrawReason) {
          console.log(`- Reason: ${errorData.withdrawReason}`);
        }
        
        if (errorData.currentBalance !== undefined) {
          console.log(`- Current Balance: ${errorData.currentBalance}`);
          console.log(`- Min Required: ${errorData.minWithdrawableBalance}`);
        }
        
        if (errorData.requestedAmount !== undefined) {
          console.log(`- Requested Amount: ${errorData.requestedAmount}`);
          console.log(`- Available for Withdrawal: ${errorData.availableForWithdrawal}`);
        }
      }
    } else if (error.request) {
      console.error('🌐 No response received:', error.message);
    } else {
      console.error('💥 Error:', error.message);
    }
  }
}

// Test different scenarios
async function testWithdrawScenarios() {
  console.log('🚀 Starting Withdraw API Tests\n');
  
  // Test 1: Basic withdrawal
  await testWithdraw();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Test Scenarios to Try:');
  console.log('1. Test with different amounts');
  console.log('2. Test with users having insufficient balance');
  console.log('3. Test with users having pending turnover');
  console.log('4. Test with invalid user ID');
  console.log('5. Test with negative amounts');
  console.log('6. Test without authentication token');
  
  console.log('\n💡 To test different scenarios:');
  console.log('- Change TEST_USER_ID in the script');
  console.log('- Modify the amount in withdrawData');
  console.log('- Use different JWT tokens for different users');
  console.log('- Check database for users with different balance/turnover states');
  
  console.log('\n📝 Test Cases:');
  console.log('- Valid withdrawal (sufficient balance, no turnover)');
  console.log('- Insufficient balance (below minimum)');
  console.log('- Pending turnover (any active turnover)');
  console.log('- Amount exceeds current balance');
  console.log('- Invalid user ID');
  console.log('- Missing required fields');
}

// Run the tests
if (require.main === module) {
  testWithdrawScenarios();
}

module.exports = { testWithdraw };
