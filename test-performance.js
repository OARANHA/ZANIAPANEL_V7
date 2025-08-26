#!/usr/bin/env node

/**
 * 🚀 Teste de Performance - ZANAI Painel V6.3
 * Verifica se as otimizações implementadas melhoraram a velocidade
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Iniciando Teste de Performance');
console.log('=' .repeat(60));

const testResults = {
  timestamp: new Date().toISOString(),
  tests: []
};

// Função para medir tempo de build
function measureBuildTime() {
  console.log('📦 Testando tempo de build...');
  
  const startTime = Date.now();
  
  try {
    // Limpar cache do Next.js
    if (fs.existsSync('.next')) {
      execSync('rm -rf .next', { stdio: 'pipe' });
    }
    
    // Build de produção
    console.log('   Executando build de produção...');
    execSync('npm run build', { stdio: 'pipe' });
    
    const buildTime = Date.now() - startTime;
    console.log(`   ✅ Build concluído em ${(buildTime / 1000).toFixed(2)}s`);
    
    testResults.tests.push({
      name: 'Build Production',
      duration: buildTime,
      status: 'success',
      unit: 'ms'
    });
    
    return buildTime;
  } catch (error) {
    console.log(`   ❌ Build falhou: ${error.message}`);
    testResults.tests.push({
      name: 'Build Production',
      duration: null,
      status: 'failed',
      error: error.message
    });
    return null;
  }
}

// Função para medir tempo de start do dev server
async function measureDevStartTime() {
  console.log('🔧 Testando tempo de start do dev server...');
  
  const startTime = Date.now();
  
  try {
    // Verificar se o dev server já está rodando
    try {
      const response = execSync('curl -s http://localhost:3000', { stdio: 'pipe' });
      console.log('   ℹ️ Dev server já está rodando');
      return null;
    } catch {
      // Server não está rodando, continuar teste
    }
    
    console.log('   ⏳ Aguardando server estar pronto...');
    
    // Verificar se está rodando
    let attempts = 0;
    const maxAttempts = 30; // 30 segundos
    
    while (attempts < maxAttempts) {
      try {
        execSync('curl -s http://localhost:3000', { stdio: 'pipe' });
        const devStartTime = Date.now() - startTime;
        console.log(`   ✅ Dev server pronto em ${(devStartTime / 1000).toFixed(2)}s`);
        
        testResults.tests.push({
          name: 'Dev Server Start',
          duration: devStartTime,
          status: 'success',
          unit: 'ms'
        });
        
        return devStartTime;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }
    
    throw new Error('Dev server não ficou pronto em 30 segundos');
    
  } catch (error) {
    console.log(`   ❌ Dev server start falhou: ${error.message}`);
    testResults.tests.push({
      name: 'Dev Server Start',
      duration: null,
      status: 'failed',
      error: error.message
    });
    return null;
  }
}

// Função para testar tempo de resposta das páginas
async function measurePageResponseTimes() {
  console.log('📱 Testando tempo de resposta das páginas...');
  
  const pages = [
    { name: 'Homepage', url: 'http://localhost:3000' },
    { name: 'Admin Studio', url: 'http://localhost:3000/admin/studio' },
    { name: 'Admin Agents', url: 'http://localhost:3000/admin/agents' },
    { name: 'Admin Learning', url: 'http://localhost:3000/admin/learning' }
  ];
  
  for (const page of pages) {
    try {
      console.log(`   Testando ${page.name}...`);
      
      const startTime = Date.now();
      const result = execSync(`curl -w "%{http_code},%{time_total}" -s -o /dev/null ${page.url}`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const [httpCode, timeTotal] = result.trim().split(',');
      const responseTime = parseFloat(timeTotal) * 1000; // Convert to ms
      
      if (httpCode === '200') {
        console.log(`   ✅ ${page.name}: ${responseTime.toFixed(2)}ms`);
        testResults.tests.push({
          name: `Page Response - ${page.name}`,
          duration: responseTime,
          status: 'success',
          unit: 'ms',
          httpCode: parseInt(httpCode)
        });
      } else {
        console.log(`   ⚠️ ${page.name}: HTTP ${httpCode}`);
        testResults.tests.push({
          name: `Page Response - ${page.name}`,
          duration: responseTime,
          status: 'warning',
          unit: 'ms',
          httpCode: parseInt(httpCode)
        });
      }
    } catch (error) {
      console.log(`   ❌ ${page.name}: ${error.message}`);
      testResults.tests.push({
        name: `Page Response - ${page.name}`,
        duration: null,
        status: 'failed',
        error: error.message
      });
    }
  }
}

// Função principal
async function runPerformanceTests() {
  console.log('🎯 Iniciando testes de performance...\n');
  
  // 1. Teste de build
  measureBuildTime();
  console.log('');
  
  // 2. Teste de dev server (se estiver rodando)
  // measureDevStartTime();
  // console.log('');
  
  // 3. Teste de resposta das páginas
  await measurePageResponseTimes();
  console.log('');
  
  // Resultados finais
  console.log('=' .repeat(60));
  console.log('📊 RESULTADOS FINAIS');
  console.log('=' .repeat(60));
  
  const successfulTests = testResults.tests.filter(t => t.status === 'success');
  const failedTests = testResults.tests.filter(t => t.status === 'failed');
  const warningTests = testResults.tests.filter(t => t.status === 'warning');
  
  console.log(`✅ Testes bem-sucedidos: ${successfulTests.length}`);
  console.log(`⚠️ Testes com warning: ${warningTests.length}`);
  console.log(`❌ Testes falharam: ${failedTests.length}`);
  console.log('');
  
  // Exibir métricas de performance
  if (successfulTests.length > 0) {
    console.log('🚀 MÉTRICAS DE PERFORMANCE:');
    successfulTests.forEach(test => {
      if (test.duration) {
        const duration = test.duration < 1000 ? 
          `${test.duration.toFixed(2)}ms` : 
          `${(test.duration / 1000).toFixed(2)}s`;
        console.log(`   ${test.name}: ${duration}`);
      }
    });
    console.log('');
  }
  
  // Salvar resultados
  const reportFile = `performance-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(testResults, null, 2));
  console.log(`📁 Relatório salvo em: ${reportFile}`);
  
  // Recomendações
  console.log('');
  console.log('💡 RECOMENDAÇÕES:');
  
  const buildTest = testResults.tests.find(t => t.name === 'Build Production');
  if (buildTest && buildTest.duration) {
    if (buildTest.duration > 30000) { // > 30s
      console.log('   ⚠️ Build muito lento (>30s). Considere otimizar dependências.');
    } else if (buildTest.duration < 15000) { // < 15s
      console.log('   ✅ Build rápido! Otimizações funcionando bem.');
    }
  }
  
  const pageTests = testResults.tests.filter(t => t.name.startsWith('Page Response'));
  const avgResponseTime = pageTests.reduce((acc, test) => acc + (test.duration || 0), 0) / pageTests.length;
  
  if (avgResponseTime > 2000) { // > 2s
    console.log('   ⚠️ Páginas lentas (>2s). Verificar lazy loading e componentes pesados.');
  } else if (avgResponseTime < 500) { // < 500ms
    console.log('   ✅ Páginas rápidas! Lazy loading funcionando bem.');
  }
  
  console.log('   🔧 Usar lazy loading em componentes pesados (HybridWorkflowEditor, MCPManager)');
  console.log('   📦 Implementar code splitting para reduzir bundle size');
  console.log('   ⚡ Considerar usar Next.js Image para otimizar imagens');
  console.log('   🗄️ Implementar cache de dados para APIs lentas');
  
  console.log('');
  console.log('🎉 Teste de performance concluído!');
}

// Executar testes
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests, testResults };