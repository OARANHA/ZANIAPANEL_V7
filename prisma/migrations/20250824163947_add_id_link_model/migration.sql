-- CreateTable
CREATE TABLE "id_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zanaiId" TEXT NOT NULL,
    "flowiseId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "id_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPServer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "command" TEXT,
    "args" TEXT,
    "url" TEXT,
    "env" TEXT,
    "headers" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastConnected" DATETIME,
    "workspaceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPServer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPTool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputSchema" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MCPTool_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "toolId" TEXT,
    "agentId" TEXT,
    "config" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPConnection_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MCPConnection_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "MCPTool" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MCPConnection_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "flowise_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flowiseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "flowData" TEXT NOT NULL,
    "deployed" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT DEFAULT 'general',
    "workspaceId" TEXT,
    "chatbotConfig" TEXT,
    "apiConfig" TEXT,
    "complexityScore" INTEGER NOT NULL DEFAULT 0,
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "edgeCount" INTEGER NOT NULL DEFAULT 0,
    "maxDepth" INTEGER NOT NULL DEFAULT 0,
    "criticalPath" TEXT,
    "bottlenecks" TEXT,
    "optimizationSuggestions" TEXT,
    "nodes" TEXT,
    "connections" TEXT,
    "capabilities" TEXT,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "flowise_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flowiseExecutionId" TEXT NOT NULL,
    "flowiseWorkflowId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "executionData" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "action" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" DATETIME NOT NULL,
    "updatedDate" DATETIME NOT NULL,
    "stoppedDate" DATETIME,
    "duration" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "resultSummary" TEXT,
    "metrics" TEXT,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "flowise_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "flowise_workflows" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "flowiseId" TEXT,
    "resourceId" TEXT,
    "resourceType" TEXT,
    "details" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_logs_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "flowise_workflows" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "export_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "workflowName" TEXT,
    "canvasId" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "studio_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CHATFLOW',
    "flowData" TEXT NOT NULL,
    "config" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source" TEXT,
    "originalId" TEXT,
    "complexityScore" INTEGER NOT NULL DEFAULT 0,
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "edgeCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "studio_workflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "studio_workflows_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "learned_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceWorkflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "patterns" TEXT NOT NULL,
    "zanaiConfig" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "knowledge" TEXT,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "chatflowUrl" TEXT,
    "flowiseId" TEXT,
    "exportedToFlowise" BOOLEAN NOT NULL DEFAULT false,
    "exportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Agent" ("config", "createdAt", "description", "id", "knowledge", "name", "slug", "status", "templateId", "type", "updatedAt", "userId", "workspaceId") SELECT "config", "createdAt", "description", "id", "knowledge", "name", "slug", "status", "templateId", "type", "updatedAt", "userId", "workspaceId" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE UNIQUE INDEX "Agent_slug_key" ON "Agent"("slug");
CREATE INDEX "Agent_workspaceId_idx" ON "Agent"("workspaceId");
CREATE INDEX "Agent_userId_idx" ON "Agent"("userId");
CREATE TABLE "new_clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "clientType" TEXT NOT NULL DEFAULT 'individual',
    "registrationType" TEXT NOT NULL DEFAULT 'basic',
    "cpf" TEXT,
    "cnpj" TEXT,
    "rg" TEXT,
    "ie" TEXT,
    "birthDate" DATETIME,
    "foundingDate" DATETIME,
    "address" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "addressProof" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "sector" TEXT,
    "companySize" TEXT,
    "employees" INTEGER,
    "mainProducts" TEXT,
    "targetAudience" TEXT,
    "operationRegion" TEXT,
    "mainProblems" TEXT,
    "aiObjectives" TEXT,
    "digitalMaturity" TEXT,
    "currentTools" TEXT,
    "dataVolume" TEXT,
    "dataType" TEXT,
    "updateFrequency" TEXT,
    "paymentMethod" TEXT,
    "commercialConditions" TEXT,
    "lgpdConsent" BOOLEAN NOT NULL DEFAULT false,
    "lgpdConsentDate" DATETIME,
    "legalResponsible" TEXT,
    "acquisitionChannel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'lead',
    "interactionHistory" TEXT,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_clients" ("address", "birthDate", "city", "cpf", "createdAt", "email", "id", "name", "phone", "state", "status", "updatedAt", "userId", "zipCode") SELECT "address", "birthDate", "city", "cpf", "createdAt", "email", "id", "name", "phone", "state", "status", "updatedAt", "userId", "zipCode" FROM "clients";
DROP TABLE "clients";
ALTER TABLE "new_clients" RENAME TO "clients";
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "id_links_userId_idx" ON "id_links"("userId");

-- CreateIndex
CREATE INDEX "id_links_resourceType_idx" ON "id_links"("resourceType");

-- CreateIndex
CREATE UNIQUE INDEX "id_links_zanaiId_resourceType_key" ON "id_links"("zanaiId", "resourceType");

-- CreateIndex
CREATE UNIQUE INDEX "id_links_flowiseId_resourceType_key" ON "id_links"("flowiseId", "resourceType");

-- CreateIndex
CREATE INDEX "MCPServer_workspaceId_idx" ON "MCPServer"("workspaceId");

-- CreateIndex
CREATE INDEX "MCPServer_status_idx" ON "MCPServer"("status");

-- CreateIndex
CREATE INDEX "MCPTool_serverId_idx" ON "MCPTool"("serverId");

-- CreateIndex
CREATE INDEX "MCPTool_status_idx" ON "MCPTool"("status");

-- CreateIndex
CREATE INDEX "MCPConnection_serverId_idx" ON "MCPConnection"("serverId");

-- CreateIndex
CREATE INDEX "MCPConnection_agentId_idx" ON "MCPConnection"("agentId");

-- CreateIndex
CREATE INDEX "MCPConnection_status_idx" ON "MCPConnection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "flowise_workflows_flowiseId_key" ON "flowise_workflows"("flowiseId");

-- CreateIndex
CREATE INDEX "flowise_workflows_flowiseId_idx" ON "flowise_workflows"("flowiseId");

-- CreateIndex
CREATE INDEX "flowise_workflows_type_idx" ON "flowise_workflows"("type");

-- CreateIndex
CREATE INDEX "flowise_workflows_category_idx" ON "flowise_workflows"("category");

-- CreateIndex
CREATE INDEX "flowise_workflows_complexityScore_idx" ON "flowise_workflows"("complexityScore");

-- CreateIndex
CREATE INDEX "flowise_workflows_lastSyncAt_idx" ON "flowise_workflows"("lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "flowise_executions_flowiseExecutionId_key" ON "flowise_executions"("flowiseExecutionId");

-- CreateIndex
CREATE INDEX "flowise_executions_flowiseExecutionId_idx" ON "flowise_executions"("flowiseExecutionId");

-- CreateIndex
CREATE INDEX "flowise_executions_workflowId_idx" ON "flowise_executions"("workflowId");

-- CreateIndex
CREATE INDEX "flowise_executions_state_idx" ON "flowise_executions"("state");

-- CreateIndex
CREATE INDEX "flowise_executions_sessionId_idx" ON "flowise_executions"("sessionId");

-- CreateIndex
CREATE INDEX "flowise_executions_lastSyncAt_idx" ON "flowise_executions"("lastSyncAt");

-- CreateIndex
CREATE INDEX "sync_logs_action_idx" ON "sync_logs"("action");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- CreateIndex
CREATE INDEX "sync_logs_flowiseId_idx" ON "sync_logs"("flowiseId");

-- CreateIndex
CREATE INDEX "sync_logs_resourceId_idx" ON "sync_logs"("resourceId");

-- CreateIndex
CREATE INDEX "sync_logs_createdAt_idx" ON "sync_logs"("createdAt");

-- CreateIndex
CREATE INDEX "export_logs_workflowId_idx" ON "export_logs"("workflowId");

-- CreateIndex
CREATE INDEX "export_logs_canvasId_idx" ON "export_logs"("canvasId");

-- CreateIndex
CREATE INDEX "export_logs_action_idx" ON "export_logs"("action");

-- CreateIndex
CREATE INDEX "export_logs_status_idx" ON "export_logs"("status");

-- CreateIndex
CREATE INDEX "export_logs_createdAt_idx" ON "export_logs"("createdAt");

-- CreateIndex
CREATE INDEX "studio_workflows_userId_idx" ON "studio_workflows"("userId");

-- CreateIndex
CREATE INDEX "studio_workflows_workspaceId_idx" ON "studio_workflows"("workspaceId");

-- CreateIndex
CREATE INDEX "studio_workflows_type_idx" ON "studio_workflows"("type");

-- CreateIndex
CREATE INDEX "studio_workflows_status_idx" ON "studio_workflows"("status");

-- CreateIndex
CREATE INDEX "studio_workflows_source_idx" ON "studio_workflows"("source");

-- CreateIndex
CREATE INDEX "studio_workflows_complexityScore_idx" ON "studio_workflows"("complexityScore");

-- CreateIndex
CREATE INDEX "learned_templates_sourceWorkflowId_idx" ON "learned_templates"("sourceWorkflowId");

-- CreateIndex
CREATE INDEX "learned_templates_category_idx" ON "learned_templates"("category");

-- CreateIndex
CREATE INDEX "learned_templates_complexity_idx" ON "learned_templates"("complexity");

-- CreateIndex
CREATE INDEX "learned_templates_validated_idx" ON "learned_templates"("validated");
