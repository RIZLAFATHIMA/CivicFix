// Test script for the registration API
// Run with: node test-api.js

const testRegistration = async () => {
  try {
    // Test user registration
    const registerResponse = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Registration Response:', registerData);

    // Test admin registration
    const adminResponse = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }),
    });

    const adminData = await adminResponse.json();
    console.log('Admin Registration Response:', adminData);

    // Test login
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    // Test get all users
    const usersResponse = await fetch('http://localhost:3000/api/users');
    const usersData = await usersResponse.json();

    console.log('Users List:', usersData);

  } catch (error) {
    console.error('Test error:', error);
  }
};

testRegistration();