// English version. Only the texts live here; links, years, hues and ids are taken from content.es.js.
// Arrays keep the same order as the Spanish file.

export const profile = {
  role: 'AI agents and software development',
  headline: 'I design AI agents that automate processes and know when to hand control to a person.',
};

export const about = {
  title: 'AI agents you can trust',
  paragraphs: [
    'I hold a degree in Information Technology Engineering from Universidad Nacional de Chimborazo. Today I design AI agents that automate incident management in banking, at Tata Consultancy Services.',
    'I care about trustworthy AI: answers grounded in a knowledge base, a confidence score and human review when needed.',
  ],
  facts: [
    { term: 'Now', detail: 'AI agents at Tata Consultancy Services' },
    { term: 'Education', detail: 'IT Engineering, UNACH' },
    { term: 'Location', detail: 'Quito, Ecuador' },
  ],
};

export const journey = [
  {
    focus: 'AI agents for the banking sector',
    period: 'Mar 2026 - present',
    points: [
      'AI agents that automate incident management: they classify, escalate and recommend a resolution.',
      'RAG solutions on Azure (AI Search, OpenAI, Logic Apps) integrated with ServiceNow and Microsoft Teams.',
      'Agents with MCP architecture, and evaluation of RAG, CAG, GraphRAG and Azure AI Foundry by cost, control and scalability.',
      'Guardrails: answers grounded in the knowledge base, a confidence score and human review.',
      'Agentic AI demos for executive teams and the whole TCS Ecuador organization.',
    ],
  },
  {
    org: 'Quality Management Office, Universidad Nacional de Chimborazo',
    focus: 'Documentation, automation and internal audit',
    period: 'Apr 2025 - Jul 2025',
    points: [
      'Survey, review and update of process documentation: forms, records and evidence.',
      'Process automation and publication on a website:',
      'Support for the internal audit of every university department, processing and interpreting the data collected.',
    ],
  },
  {
    focus: 'Technical support and web development',
    period: 'Oct 2024 - Feb 2025',
    points: [
      'User technical support: installation, configuration and troubleshooting of equipment and software.',
      'Development of the parish website to share its information:',
    ],
  },
  {
    focus: 'Graduate in Information Technology Engineering',
    period: '2022 - 2026',
    points: [
      'Degree project: a mobile and web prototype to manage availability and alert intrusions with facial authentication in the parking lots of the "Señor del Buen Suceso" Cooperative. I presented it at a congress.',
      'Winner of the university contest for the best technology project, with a prototype that translates natural language into sign language and back.',
    ],
    tags: ['Microsoft AZ-900', 'Microsoft IA-901', 'Microsoft GH-300', 'Microsoft DP-900', 'Databricks Generative AI', 'English B1'],
  },
];

export const projects = [
  { title: 'Capstone project', description: 'A full capstone application, with interface, logic and tests.', stack: ['Web app', 'Testing'] },
  { title: 'Agents v2', description: 'Experiments with language-model agents and multi-step flows.', stack: ['Generative AI', 'Agents'] },
  { title: 'MCP UI components', description: 'Interface components designed to plug into MCP servers.', stack: ['Components', 'MCP'] },
  { title: 'Wakka Tattoes', description: 'Website for a tattoo studio, focused on visuals and contact.', stack: ['Website', 'Design'] },
  { title: 'QA example', description: 'Practice repository with test cases and quality assurance examples.', stack: ['QA', 'Test cases'] },
];

export const skills = [
  { note: 'Programming language.', summary: 'My base language since university, now for AI agents and automation.', used: ['IT Engineering studies at UNACH', 'Agents and data flows at Tata Consultancy Services'] },
  { note: 'Data query language.', summary: 'Querying and analyzing data, from academic training to working with data.', used: ['Database training at UNACH', 'Processing internal audit data'] },
  { note: 'Programming language for the web.', summary: 'Web interface development, including this Three.js portfolio.', used: ['Website of the GAD Municipal de Puela', 'This 3D portfolio'] },
  { name: 'Git and GitHub', note: 'Version control. I also use GitHub Copilot.', summary: 'Version control and project publishing, with GitHub Copilot support.', used: ['Personal project repositories', 'Deploying this site with GitHub Actions'] },
  { note: 'AI Foundry, AI Search, Logic Apps and Functions.', summary: 'The platform where I build AI solutions for banking.', used: ['Azure AI Search and Azure AI Foundry', 'Logic Apps and Functions for integrations'] },
  { note: 'Databricks Generative AI Fundamentals accreditation.', summary: 'Generative AI fundamentals on the data platform, accredited in March 2026.', used: ['Databricks Generative AI Fundamentals accreditation'] },
  { note: 'Integrated with AI agents for incident management.', summary: 'Incident management connected to AI agents.', used: ['Agents that classify, escalate and recommend a resolution', 'Integration with Microsoft Teams'] },
  { note: 'Integration between services and tools.', summary: 'Connecting services, tools and agents.', used: ['Integrations between ServiceNow, Teams and Azure', 'Process automation at UNACH'] },
  { note: 'GPT-4o models in RAG solutions and agents.', summary: 'GPT-4o models as the engine of the RAG solutions and agents.', used: ['RAG solutions with Azure AI Search', 'Incident management agents'] },
  { note: 'Solutions on Azure AI Search and OpenAI, integrated with ServiceNow and Teams.', summary: 'Answers grounded in a knowledge base, evaluated against CAG and GraphRAG.', used: ['Solutions on Azure AI Search and OpenAI', 'Integration with ServiceNow and Microsoft Teams'] },
  { name: 'Agents', note: 'With tool use and guardrails to automate incidents in banking.', summary: 'Agents with tools, guardrails and human review for the banking sector.', used: ['Incident automation in banking', 'Demos for TCS Ecuador executive teams'] },
  { note: 'Agents with MCP architecture to automate data flows and reports.', summary: 'MCP architecture to connect agents with data and generate reports.', used: ['MCP agents for data flows and reports'] },
  { note: 'Framework for applications with language models.', summary: 'Framework to build applications with language models.', used: ['Agent prototypes and tool chains'] },
  { note: 'Framework for agent workflows.', summary: 'Stateful agent workflows with explicit control.', used: ['Agent workflow prototypes'] },
  { note: 'Microsoft SDK to orchestrate language models.', summary: 'Microsoft SDK to orchestrate language models.', used: ['Orchestration evaluation for agents on Azure'] },
];

export const certifications = [
  { issuer: 'Universidad Nacional de Chimborazo', title: 'Degree in Information Technology Engineering' },
  { issuer: 'Microsoft', title: 'Azure Fundamentals' },
  { issuer: 'Microsoft', title: 'Azure AI Fundamentals' },
  { issuer: 'Microsoft', title: 'GitHub Copilot' },
  { issuer: 'Microsoft', title: 'Azure Data Fundamentals' },
  { issuer: 'Databricks Academy', title: 'Databricks Generative AI Fundamentals' },
  { issuer: 'English language', title: 'English proficiency, level B1' },
  { issuer: 'Congress', title: 'Andean Congress of Engineering, Construction, Technology and Innovation' },
  { issuer: 'Contest', title: 'Innovasoft 2025: Technologies that connect, ideas that transform' },
];

export const sections = [
  { label: 'Home' },
  { label: 'About' },
  { label: 'Projects' },
  { label: 'Skills' },
  { label: 'Certifications' },
  { label: 'Career' },
  { label: 'Contact' },
];
