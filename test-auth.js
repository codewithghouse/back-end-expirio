const axios = require('axios');

const testAuth = async () => {
    const baseURL = 'http://localhost:5000/api/auth';
    const testUser = {
        name: 'Test Connectivity',
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    console.log('🧪 Starting Authentication Test...');

    try {
        // 1. Register
        console.log('📝 Testing Registration...');
        const regRes = await axios.post(`${baseURL}/register`, testUser);
        console.log('✅ Registration Success:', regRes.data.userId);

        // 2. Login
        console.log('🔑 Testing Login...');
        const loginRes = await axios.post(`${baseURL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login Success. Token received.');

        console.log('🎉 All authentication tests passed!');
    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
};

testAuth();
