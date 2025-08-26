#!/usr/bin/env node

// Script para testar a correção da autenticação JWT
require('dotenv').config();
const fetch = require('node-fetch');

async function testAuth() {
  console.log('🧪 Testando autenticação JWT...\n');

  // Teste 1: Login com superadmin
  console.log('1️⃣ Testando login com superadmin@zanai.com...');
  try {
    const loginResponse = await fetch('http://localhost:3000/admin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@zanai.com',
        password: 'qualquercoisa',
        userType: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('📋 Token:', loginData.token.substring(0, 50) + '...');
      console.log('👤 User:', loginData.user.email, '-', loginData.user.role);
      
      // Teste 2: Acessar página admin com cookie
      console.log('\n2️⃣ Testando acesso à página admin...');
      const adminResponse = await fetch('http://localhost:3000/admin', {
        headers: {
          'Cookie': `isAuthenticated=true; userRole=${loginData.user.role}; userEmail=${encodeURIComponent(loginData.user.email)}; userId=${loginData.user.id}`
        }
      });
      
      if (adminResponse.status === 200 || adminResponse.status === 307) {
        console.log('✅ Página admin acessível!');
      } else {
        console.log('❌ Falha ao acessar página admin:', adminResponse.status);
      }
      
      // Teste 3: Verificar se o token é válido
      console.log('\n3️⃣ Verificando validade do token JWT...');
      const jwt = require('jsonwebtoken');
      
      try {
        const decoded = jwt.verify(loginData.token, process.env.NEXTAUTH_SECRET || 'fallback-secret-key');
        console.log('✅ Token JWT válido!');
        console.log('📋 Decoded:', {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        });
      } catch (jwtError) {
        console.log('❌ Token JWT inválido:', jwtError.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }

  // Teste 4: Login com admin
  console.log('\n4️⃣ Testando login com admin@zanai.com...');
  try {
    const loginResponse = await fetch('http://localhost:3000/admin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@zanai.com',
        password: 'qualquercoisa',
        userType: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('👤 User:', loginData.user.email, '-', loginData.user.role);
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }

  console.log('\n🎉 Testes concluídos!');
}

testAuth().catch(console.error);