#!/usr/bin/env node

/**
 * 🚀 Monitor de Performance em Tempo Real - ZANAI Painel V6.3
 * Monitora performance das páginas principais
 */

console.log('🎯 Monitor de Performance ZANAI - Tempo Real');
console.log('=' .repeat(60));

const pages = [
  { name: 'Homepage', url: 'http://localhost:3000' },
  { name: 'Admin Studio', url: 'http://localhost:3000/admin/studio' },
  { name: 'Admin Agents', url: 'http://localhost:3000/admin/agents' },
  { name: 'Admin Learning', url: 'http://localhost:3000/admin/learning' }
];

async function testPagePerformance(page) {
  try {
    const { execSync } = require('child_process');
    
    const result = execSync(
      `curl -w "%{http_code},%{time_total},%{time_connect},%{time_starttransfer}" -s -o /dev/null -L "${page.url}"`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    const [httpCode, timeTotal, timeConnect, timeStartTransfer] = result.trim().split(',');
    
    const totalMs = parseFloat(timeTotal) * 1000;
    const connectMs = parseFloat(timeConnect) * 1000;
    const transferMs = parseFloat(timeStartTransfer) * 1000;
    
    const status = httpCode === '200' ? '✅' : httpCode === '307' ? '🔄' : '❌';
    const speedStatus = totalMs < 1000 ? '🚀' : totalMs < 3000 ? '⚡' : totalMs < 5000 ? '⚠️' : '🐌';
    
    console.log(`${status} ${speedStatus} ${page.name.padEnd(15)} | ${totalMs.toFixed(0).padStart(5)}ms | HTTP ${httpCode}`);
    
    return {
      name: page.name,
      httpCode: parseInt(httpCode),
      totalTime: totalMs,
      connectTime: connectMs,
      transferTime: transferMs,
      status: httpCode === '200' ? 'success' : 'redirect'
    };
  } catch (error) {
    console.log(`❌ ${page.name.padEnd(15)} | ERROR | ${error.message.slice(0, 30)}...`);
    return {
      name: page.name,
      error: error.message,
      status: 'error'
    };
  }
}

async function runPerformanceMonitor() {
  console.log('\n📊 Testando performance das páginas principais...\n');
  console.log('Status | Speed | Página          | Tempo  | HTTP Code');
  console.log('-'.repeat(60));
  
  const results = [];
  
  for (const page of pages) {
    const result = await testPagePerformance(page);
    results.push(result);
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('-'.repeat(60));
  
  // Análise dos resultados
  const successfulPages = results.filter(r => r.status === 'success');
  const averageTime = successfulPages.reduce((acc, r) => acc + (r.totalTime || 0), 0) / successfulPages.length;
  
  console.log('\n📈 RESUMO DE PERFORMANCE:');
  console.log(`✅ Páginas funcionando: ${successfulPages.length}/${pages.length}`);
  
  if (successfulPages.length > 0) {
    console.log(`⚡ Tempo médio de resposta: ${averageTime.toFixed(0)}ms`);
    
    if (averageTime < 1000) {
      console.log('🚀 EXCELENTE! Aplicação muito rápida.');
    } else if (averageTime < 3000) {
      console.log('⚡ BOM! Performance aceitável.');
    } else if (averageTime < 5000) {
      console.log('⚠️ MODERADO. Pode ser otimizado.');
    } else {
      console.log('🐌 LENTO. Necessita otimização urgente.');
    }
  }
  
  console.log('\n💡 OTIMIZAÇÕES IMPLEMENTADAS:');
  console.log('✅ Lazy loading em componentes pesados');
  console.log('✅ Webpack optimizations para dev/prod');
  console.log('✅ Next.js 15 configurações atualizadas');
  console.log('✅ Code splitting automático');
  console.log('✅ Cache otimizado');
  
  console.log('\n🎯 Para continuar monitorando, execute: node performance-monitor.js');
}

if (require.main === module) {
  runPerformanceMonitor().catch(console.error);
}

module.exports = { runPerformanceMonitor };