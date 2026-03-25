export interface AgentRoleConfig {
  id: string;          // e.g., 'wukong', 'senior-dev'
  name: string;        // e.g., 'Researcher', 'Developer'
  persona: string;     // System prompt for this role
  defaultModel?: string; // Optional specific model for this role
}

export interface SwarmTemplate {
  id: string;          // e.g., 'journey-to-the-west', 'software-team'
  name: string;
  description: string;
  orchestratorName: string; // e.g., 'Tang Monk', 'Project Manager'
  orchestratorPersona: string;
  roles: AgentRoleConfig[];
}
