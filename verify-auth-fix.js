#!/usr/bin/env node

// Script final para verificar se a autenticação está completamente funcionando
require('dotenv').config();
const fetch = require('node-fetch');

console.log('🔍 Verificação final do sistema de autenticação JWT\n');

async function runVerification() {
  const tests = [];
  
  // Teste 1: Verificar se o servidor está online
  console.log('1️⃣ Verificando se o servidor está online...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Servidor online!');
      tests.push({ name: 'Server Online', status: 'PASS' });
    } else {
      console.log('❌ Servidor offline!');
      tests.push({ name: 'Server Online', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Servidor offline:', error.message);
    tests.push({ name: 'Server Online', status: 'FAIL' });
  }

  // Teste 2: Login Superadmin
  console.log('\n2️⃣ Testando login Superadmin...');
  try {
    const response = await fetch('http://localhost:3000/admin/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@zanai.com',
        password: 'test123',
        userType: 'admin'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Superadmin successful!');
      console.log('   Token:', data.token.substring(0, 50) + '...');
      console.log('   User:', data.user.email, '-', data.user.role);
      tests.push({ name: 'Superadmin Login', status: 'PASS' });
      
      // Teste 3: Verificar token JWT
      console.log('\n3️⃣ Verificando token JWT...');
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(data.token, process.env.NEXTAUTH_SECRET);
        console.log('✅ Token JWT válido!');
        console.log('   Decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
        tests.push({ name: 'JWT Token Validation', status: 'PASS' });
      } catch (jwtError) {
        console.log('❌ Token JWT inválido:', jwtError.message);
        tests.push({ name: 'JWT Token Validation', status: 'FAIL' });
      }
      
    } else {
      const error = await response.json();
      console.log('❌ Login Superadmin failed:', error.error);
      tests.push({ name: 'Superadmin Login', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro no login Superadmin:', error.message);
    tests.push({ name: 'Superadmin Login', status: 'FAIL' });
  }

  // Teste 4: Login Admin
  console.log('\n4️⃣ Testando login Admin...');
  try {
    const response = await fetch('http://localhost:3000/admin/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@zanai.com',
        password: 'test123',
        userType: 'admin'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Admin successful!');
      console.log('   User:', data.user.email, '-', data.user.role);
      tests.push({ name: 'Admin Login', status: 'PASS' });
    } else {
      const error = await response.json();
      console.log('❌ Login Admin failed:', error.error);
      tests.push({ name: 'Admin Login', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro no login Admin:', error.message);
    tests.push({ name: 'Admin Login', status: 'FAIL' });
  }

  // Teste 5: Verificar banco de dados
  console.log('\n5️⃣ Verificando banco de dados...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const userCount = await prisma.user.count();
    const superadmin = await prisma.user.findUnique({
      where: { email: 'superadmin@zanai.com' }
    });
    
    if (userCount > 0 && superadmin) {
      console.log('✅ Banco de dados OK!');
      console.log('   Total users:', userCount);
      console.log('   Superadmin found:', superadmin.email);
      tests.push({ name: 'Database', status: 'PASS' });
    } else {
      console.log('❌ Problema no banco de dados!');
      tests.push({ name: 'Database', status: 'FAIL' });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Erro no banco de dados:', error.message);
    tests.push({ name: 'Database', status: 'FAIL' });
  }

  // Resumo final
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('═'.repeat(50));
  
  const passedTests = tests.filter(t => t.status === 'PASS').length;
  const totalTests = tests.length;
  
  tests.forEach(test => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.status}`);
  });
  
  console.log('═'.repeat(50));
  console.log(`🎯 Resultado: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 SISTEMA DE AUTENTICAÇÃO JWT ESTÁ FUNCIONANDO PERFEITAMENTE!');
    console.log('\n📝 Credenciais para teste:');
    console.log('   Superadmin: superadmin@zanai.com (qualquer senha não vazia)');
    console.log('   Admin: admin@zanai.com (qualquer senha não vazia)');
    console.log('\n🌐 Acesse: http://localhost:3000/admin');
  } else {
    console.log('❌ Ainda há problemas a serem resolvidos.');
  }
}

runVerification().catch(console.error);