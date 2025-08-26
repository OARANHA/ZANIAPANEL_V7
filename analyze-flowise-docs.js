/**
 * Script para Análise Completa da Documentação Flowise
 * Criado para: Projeto ZanAI - Integração Bidirecional
 * Data: 2025-08-23
 * Objetivo: Analisar todas as URLs da documentação Flowise para preservar estrutura de dados
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs da documentação Flowise conforme solicitado
const FLOWISE_DOCS_URLS = [
    'https://docs.flowiseai.com/api-reference/assistants',
    'https://docs.flowiseai.com/api-reference/attachments',
    'https://docs.flowiseai.com/api-reference/document-store',
    'https://docs.flowiseai.com/api-reference/leads',
    'https://docs.flowiseai.com/api-reference/ping',
    'https://docs.flowiseai.com/api-reference/prediction',
    'https://docs.flowiseai.com/api-reference/tools',
    'https://docs.flowiseai.com/api-reference/upsert-history',
    'https://docs.flowiseai.com/api-reference/variables',
    'https://docs.flowiseai.com/api-reference/vector-upsert'
];

class FlowiseDocumentationAnalyzer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            analysis: {},
            recommendations: [],
            dataStructures: {},
            integrationPoints: {},
            errors: []
        };
    }

    async analyzeAllDocumentation() {
        console.log('🚀 Iniciando análise completa da documentação Flowise...');
        console.log(`📋 Analisando ${FLOWISE_DOCS_URLS.length} endpoints da API`);
        
        for (const url of FLOWISE_DOCS_URLS) {
            try {
                console.log(`📖 Analisando: ${url}`);
                const content = await this.fetchDocumentation(url);
                const analysis = this.analyzeEndpoint(url, content);
                
                const endpointName = this.extractEndpointName(url);
                this.results.analysis[endpointName] = analysis;
                
                console.log(`✅ Concluído: ${endpointName}`);
            } catch (error) {
                console.error(`❌ Erro ao analisar ${url}:`, error.message);
                this.results.errors.push({
                    url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        this.generateRecommendations();
        this.extractDataStructures();
        this.identifyIntegrationPoints();
        
        return this.results;
    }

    async fetchDocumentation(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, {
                headers: {
                    'User-Agent': 'ZanAI-Documentation-Analyzer/1.0.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            }, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    if (response.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    }
                });
            });
            
            request.on('error', (error) => {
                reject(error);
            });
            
            request.setTimeout(30000, () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    analyzeEndpoint(url, content) {
        const endpointName = this.extractEndpointName(url);
        
        // Extração de informações-chave da documentação
        const analysis = {
            url,
            endpoint: endpointName,
            methods: this.extractHttpMethods(content),
            dataStructures: this.extractDataStructuresFromContent(content),
            examples: this.extractExamples(content),
            parameters: this.extractParameters(content),
            responses: this.extractResponses(content),
            authentication: this.extractAuthInfo(content),
            rateLimits: this.extractRateLimits(content),
            businessLogic: this.extractBusinessLogic(content),
            zanaiIntegrationPotential: this.assessZanaiIntegration(endpointName, content)
        };

        return analysis;
    }

    extractEndpointName(url) {
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    extractHttpMethods(content) {
        const methods = [];
        const methodPatterns = [
            /POST\s+\/[^\s]+/gi,
            /GET\s+\/[^\s]+/gi,
            /PUT\s+\/[^\s]+/gi,
            /DELETE\s+\/[^\s]+/gi,
            /PATCH\s+\/[^\s]+/gi
        ];

        methodPatterns.forEach(pattern => {
            const matches = content.match(pattern) || [];
            methods.push(...matches);
        });

        return [...new Set(methods)];
    }

    extractDataStructuresFromContent(content) {
        const structures = {};
        
        // Buscar por estruturas JSON no conteúdo
        const jsonPattern = /\{[\s\S]*?\}/g;
        const jsonMatches = content.match(jsonPattern) || [];
        
        jsonMatches.forEach((json, index) => {
            try {
                const parsed = JSON.parse(json);
                structures[`structure_${index}`] = parsed;
            } catch (e) {
                // Ignorar JSONs inválidos
            }
        });

        // Buscar por definições de interface/tipo
        const interfacePattern = /interface\s+(\w+)\s*\{[\s\S]*?\}/g;
        const interfaceMatches = content.match(interfacePattern) || [];
        
        interfaceMatches.forEach(match => {
            const nameMatch = match.match(/interface\s+(\w+)/);
            if (nameMatch) {
                structures[nameMatch[1]] = match;
            }
        });

        return structures;
    }

    extractExamples(content) {
        const examples = [];
        
        // Buscar por blocos de código de exemplo
        const codeBlockPattern = /```[\s\S]*?```/g;
        const codeBlocks = content.match(codeBlockPattern) || [];
        
        codeBlocks.forEach((block, index) => {
            examples.push({
                id: `example_${index}`,
                code: block.replace(/```/g, '').trim(),
                language: this.detectLanguage(block)
            });
        });

        return examples;
    }

    detectLanguage(codeBlock) {
        const firstLine = codeBlock.split('\n')[0];
        if (firstLine.includes('typescript') || firstLine.includes('ts')) return 'typescript';
        if (firstLine.includes('javascript') || firstLine.includes('js')) return 'javascript';
        if (firstLine.includes('json')) return 'json';
        if (firstLine.includes('http')) return 'http';
        return 'unknown';
    }

    extractParameters(content) {
        const parameters = [];
        
        // Buscar por definições de parâmetros
        const paramPattern = /(\w+)\s*:\s*(\w+)(?:\s*\|\s*(\w+))*(?:\s*Required|Optional)?/g;
        let match;
        
        while ((match = paramPattern.exec(content)) !== null) {
            parameters.push({
                name: match[1],
                type: match[2],
                optional: match[3] || null,
                required: content.includes(`${match[1]}.*Required`)
            });
        }

        return parameters;
    }

    extractResponses(content) {
        const responses = [];
        
        // Buscar por códigos de resposta HTTP
        const responsePattern = /(\d{3})\s+([^{]*)/g;
        let match;
        
        while ((match = responsePattern.exec(content)) !== null) {
            responses.push({
                code: match[1],
                description: match[2].trim()
            });
        }

        return responses;
    }

    extractAuthInfo(content) {
        const authInfo = {
            required: content.includes('Authorization') || content.includes('Bearer'),
            type: 'Bearer Token',
            header: 'Authorization',
            description: 'API Key authentication required'
        };

        return authInfo;
    }

    extractRateLimits(content) {
        // Buscar por informações de rate limiting
        const rateLimitPattern = /rate\s+limit|throttle|requests?\s+per\s+\w+/gi;
        const matches = content.match(rateLimitPattern) || [];
        
        return {
            mentioned: matches.length > 0,
            details: matches
        };
    }

    extractBusinessLogic(content) {
        // Analisar a lógica de negócio baseada no conteúdo
        const businessRules = [];
        
        if (content.includes('assistant')) {
            businessRules.push('Gestão de assistentes virtuais especializados');
        }
        if (content.includes('workflow')) {
            businessRules.push('Execução de workflows complexos');
        }
        if (content.includes('chat')) {
            businessRules.push('Comunicação bidirecional via chat');
        }
        if (content.includes('document')) {
            businessRules.push('Processamento e armazenamento de documentos');
        }
        if (content.includes('vector')) {
            businessRules.push('Busca semântica com embeddings');
        }

        return businessRules;
    }

    assessZanaiIntegration(endpointName, content) {
        const integration = {
            priority: 'medium',
            useCase: '',
            dataFlow: '',
            benefits: [],
            implementation: ''
        };

        switch (endpointName) {
            case 'assistants':
                integration.priority = 'high';
                integration.useCase = 'Criar assistentes especializados para cada agente ZanAI';
                integration.dataFlow = 'ZanAI Agent → Flowise Assistant → Resposta → ZanAI Interface';
                integration.benefits = [
                    'Reutilização de agentes entre sistemas',
                    'Capacidades avançadas de IA',
                    'Processamento especializado'
                ];
                integration.implementation = 'Criar assistente para cada tipo de agente ZanAI';
                break;

            case 'prediction':
                integration.priority = 'high';
                integration.useCase = 'Processamento principal de mensagens e execução de workflows';
                integration.dataFlow = 'Input do usuário → Flowise Processing → Resultado → ZanAI Dashboard';
                integration.benefits = [
                    'Processamento inteligente de entrada',
                    'Geração de respostas contextuais',
                    'Capacidades de streaming'
                ];
                integration.implementation = 'Endpoint principal para execução de workflows';
                break;

            case 'tools':
                integration.priority = 'high';
                integration.useCase = 'Ferramentas especializadas para cada tipo de agente';
                integration.dataFlow = 'ZanAI Action → Flowise Tool → Resultado → ZanAI Stats';
                integration.benefits = [
                    'Extensibilidade de funcionalidades',
                    'Integração com APIs externas',
                    'Processamento especializado'
                ];
                integration.implementation = 'Mapear ações ZanAI para ferramentas Flowise';
                break;

            case 'document-store':
                integration.priority = 'medium';
                integration.useCase = 'Base de conhecimento para agentes';
                integration.dataFlow = 'Documentos ZanAI → Flowise Store → Busca → Contexto';
                integration.benefits = [
                    'Base de conhecimento centralizada',
                    'Busca semântica avançada',
                    'Contextualização de respostas'
                ];
                integration.implementation = 'Sincronizar documentação ZanAI com Flowise';
                break;

            case 'vector-upsert':
                integration.priority = 'medium';
                integration.useCase = 'Busca semântica e recomendações';
                integration.dataFlow = 'Conteúdo → Embeddings → Busca → Recomendações';
                integration.benefits = [
                    'Busca semântica avançada',
                    'Recomendações inteligentes',
                    'Análise de similaridade'
                ];
                integration.implementation = 'Indexar conteúdo ZanAI para busca semântica';
                break;
        }

        return integration;
    }

    generateRecommendations() {
        this.results.recommendations = [
            {
                title: 'Preservação da Estrutura de Dados',
                description: 'Manter estrutura completa dos workflows do Flowise para não perder contexto',
                priority: 'critical',
                implementation: 'Armazenar flowData completo em JSON, incluindo todas as propriedades de nós e conexões'
            },
            {
                title: 'Fluxo de Dados Bidirecional',
                description: 'Implementar comunicação completa ZanAI ↔ Flowise',
                priority: 'high',
                implementation: 'APIs para envio (export) e recebimento (stats/results) de dados'
            },
            {
                title: 'Mapeamento de Tipos de Nós',
                description: 'Mapear todos os tipos de nós Flowise para componentes ZanAI',
                priority: 'high',
                implementation: 'Criar catálogo completo de nós e suas configurações'
            },
            {
                title: 'Rastreamento de Estado',
                description: 'Rastrear execuções e estado dos workflows em tempo real',
                priority: 'medium',
                implementation: 'Sistema de webhooks e polling para atualizações'
            },
            {
                title: 'Cache Inteligente',
                description: 'Cache de estruturas de workflow para performance',
                priority: 'medium',
                implementation: 'Cache em memória com invalidação inteligente'
            }
        ];
    }

    extractDataStructures() {
        this.results.dataStructures = {
            assistant: {
                id: 'string',
                name: 'string',
                description: 'string',
                type: 'chat | tool | composed | knowledge',
                configuration: 'AssistantConfig',
                status: 'active | inactive | training',
                createdAt: 'string',
                updatedAt: 'string'
            },
            workflow: {
                id: 'string',
                name: 'string',
                nodes: 'Node[]',
                edges: 'Edge[]',
                configuration: 'WorkflowConfig',
                status: 'draft | active | archived',
                statistics: 'WorkflowStats'
            },
            node: {
                id: 'string',
                type: 'string',
                position: '{ x: number, y: number }',
                data: 'NodeData',
                inputs: 'NodeInput[]',
                outputs: 'NodeOutput[]'
            },
            execution: {
                id: 'string',
                workflowId: 'string',
                input: 'any',
                output: 'any',
                status: 'running | completed | failed',
                startTime: 'string',
                endTime: 'string',
                logs: 'ExecutionLog[]'
            }
        };
    }

    identifyIntegrationPoints() {
        this.results.integrationPoints = {
            export: {
                description: 'ZanAI → Flowise: Exportar agentes como workflows',
                endpoints: ['/api/v1/assistants', '/api/v1/tools'],
                dataPreservation: 'Manter estrutura completa de nós e configurações',
                implementation: 'Converter agentes ZanAI para formato Flowise nativo'
            },
            execution: {
                description: 'Executar workflows e obter resultados',
                endpoints: ['/api/v1/prediction'],
                dataFlow: 'Input → Processing → Output → Statistics',
                implementation: 'API de execução com streaming e callback'
            },
            monitoring: {
                description: 'Monitorar execuções e coletar métricas',
                endpoints: ['/api/v1/ping', '/api/v1/upsert-history'],
                dataCollection: 'Performance, sucesso, tempo de resposta, uso',
                implementation: 'Sistema de monitoramento em tempo real'
            },
            knowledge: {
                description: 'Sincronizar base de conhecimento',
                endpoints: ['/api/v1/document-store', '/api/v1/vector-upsert'],
                dataSync: 'Documentos, embeddings, busca semântica',
                implementation: 'Sincronização automática de documentação'
            }
        };
    }

    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `flowise-analysis-${timestamp}.json`;
        const filepath = path.join(__dirname, 'docs', filename);
        
        // Criar diretório se não existir
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
        
        console.log(`💾 Resultados salvos em: ${filepath}`);
        return filepath;
    }

    generateSummaryReport() {
        const summary = {
            title: '🔍 RELATÓRIO DE ANÁLISE - DOCUMENTAÇÃO FLOWISE',
            subtitle: 'Análise Completa para Integração Bidirecional ZanAI ↔ Flowise',
            timestamp: this.results.timestamp,
            totalEndpoints: Object.keys(this.results.analysis).length,
            criticalFindings: this.results.recommendations.filter(r => r.priority === 'critical').length,
            highPriorityItems: this.results.recommendations.filter(r => r.priority === 'high').length,
            errorCount: this.results.errors.length,
            keyRecommendations: this.results.recommendations.slice(0, 3),
            nextSteps: [
                'Implementar preservação completa da estrutura de dados',
                'Criar APIs bidirecionais para comunicação ZanAI ↔ Flowise',
                'Desenvolver sistema de monitoramento em tempo real',
                'Implementar cache inteligente para performance',
                'Criar documentação técnica detalhada'
            ]
        };

        return summary;
    }
}

// Executar análise
async function main() {
    console.log('🤖 ZanAI - Analisador de Documentação Flowise');
    console.log('================================================');
    
    const analyzer = new FlowiseDocumentationAnalyzer();
    
    try {
        const results = await analyzer.analyzeAllDocumentation();
        const filepath = await analyzer.saveResults();
        const summary = analyzer.generateSummaryReport();
        
        console.log('\n📊 RESUMO DA ANÁLISE');
        console.log('====================');
        console.log(`📋 Endpoints analisados: ${summary.totalEndpoints}`);
        console.log(`⚠️ Itens críticos: ${summary.criticalFindings}`);
        console.log(`🔥 Alta prioridade: ${summary.highPriorityItems}`);
        console.log(`❌ Erros encontrados: ${summary.errorCount}`);
        
        console.log('\n🎯 PRINCIPAIS RECOMENDAÇÕES:');
        summary.keyRecommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.title}`);
            console.log(`   ${rec.description}`);
        });
        
        console.log('\n🚀 PRÓXIMOS PASSOS:');
        summary.nextSteps.forEach((step, index) => {
            console.log(`${index + 1}. ${step}`);
        });
        
        console.log(`\n✅ Análise completa! Resultados salvos em: ${filepath}`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Erro durante a análise:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { FlowiseDocumentationAnalyzer, main };