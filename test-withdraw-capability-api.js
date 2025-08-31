const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1; // Change this to test with different users
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with actual JWT token

// Test the withdraw capability check API
async function testWithdrawCapability() {
  try {
    console.log('🧪 Testing Withdraw Capability Check API');
    console.log('=====================================');
    
    const response = await axios.get(
      `${BASE_URL}/api/transactions/withdraw-capability/${TEST_USER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API Call Successful');
    console.log('📊 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Analyze the response
    const { data } = response.data;
    
    console.log('\n📋 Analysis:');
    console.log(`- Can Withdraw: ${data.canWithdraw ? '✅ YES' : '❌ NO'}`);
    console.log(`- Current Balance: ${data.currentBalance}`);
    console.log(`- Min Required: ${data.minWithdrawableBalance}`);
    console.log(`- Sufficient Balance: ${data.hasSufficientBalance ? '✅ YES' : '❌ NO'}`);
    console.log(`- Pending Turnover: ${data.hasPendingTurnover ? '❌ YES' : '✅ NO'}`);
    
    if (!data.canWithdraw && data.withdrawReason) {
      console.log(`- Withdraw Reason: ${data.withdrawReason}`);
    }
    
    if (data.pendingTurnover.length > 0) {
      console.log('\n⚠️  Pending Turnover Details:');
      data.pendingTurnover.forEach((turnover, index) => {
        console.log(`  ${index + 1}. ID: ${turnover.id}`);
        console.log(`     Type: ${turnover.type}`);
        console.log(`     Remaining: ${turnover.remainingTurnover}`);
        console.log(`     Target: ${turnover.targetTurnover}`);
        console.log(`     Status: ${turnover.status}`);
      });
    }
    
    console.log('\n💰 Balance Breakdown:');
    console.log(`- Total Deposits: ${data.balanceBreakdown.totalDeposits}`);
    console.log(`- Total Wins: ${data.balanceBreakdown.totalWins}`);
    console.log(`- Total Withdrawals: ${data.balanceBreakdown.totalWithdrawals}`);
    console.log(`- Total Losses: ${data.balanceBreakdown.totalLosses}`);
    
  } catch (error) {
    console.error('❌ API Call Failed');
    
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', error.response.data);
    } else if (error.request) {
      console.error('🌐 No response received:', error.message);
    } else {
      console.error('💥 Error:', error.message);
    }
  }
}

// Test scenarios
async function runTestScenarios() {
  console.log('🚀 Starting Withdraw Capability API Tests\n');
  
  // Test 1: Basic functionality
  await testWithdrawCapability();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Test Scenarios to Try:');
  console.log('1. Test with different user IDs');
  console.log('2. Test with users having pending turnover');
  console.log('3. Test with users below minimum balance');
  console.log('4. Test with users above minimum balance');
  console.log('5. Test with invalid user ID');
  console.log('6. Test without authentication token');
  
  console.log('\n💡 To test different scenarios:');
  console.log('- Change TEST_USER_ID in the script');
  console.log('- Use different JWT tokens for different users');
  console.log('- Check database for users with different balance/turnover states');
}

// Run the tests
if (require.main === module) {
  runTestScenarios();
}

module.exports = { testWithdrawCapability };
