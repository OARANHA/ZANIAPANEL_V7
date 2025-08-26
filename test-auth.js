#!/usr/bin/env node

/**
 * Script para testar a autenticação do superadmin
 */

const fetch = require('node-fetch');

async function testAuth() {
  console.log('🧪 Testando autenticação do superadmin...');
  
  try {
    // Testar login
    const loginResponse = await fetch('http://localhost:3000/admin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'superadmin@zanai.com', 
        password: 'test123', 
        userType: 'admin' 
      }),
    });

    const loginData = await loginResponse.json();
    
    console.log('📧 Resposta do login:', {
      status: loginResponse.status,
      success: loginResponse.ok,
      user: loginData.user?.email,
      role: loginData.user?.role
    });

    if (loginResponse.ok) {
      console.log('✅ Login realizado com sucesso!');
      console.log('🎯 Role:', loginData.user.role);
      console.log('📧 Email:', loginData.user.email);
      console.log('🆔 ID:', loginData.user.id);
      
      // Testar acesso ao painel admin
      const adminResponse = await fetch('http://localhost:3000/admin', {
        headers: {
          'Cookie': `isAuthenticated=true; userRole=${loginData.user.role}; userEmail=${encodeURIComponent(loginData.user.email)}; userName=${encodeURIComponent(loginData.user.name)}; userId=${loginData.user.id}`
        }
      });
      
      console.log('🔐 Acesso ao /admin:', adminResponse.status);
      
      if (adminResponse.ok) {
        console.log('✅ Acesso ao painel admin concedido!');
      } else {
        console.log('❌ Acesso ao painel admin negado!');
      }
    } else {
      console.log('❌ Falha no login:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testAuth();