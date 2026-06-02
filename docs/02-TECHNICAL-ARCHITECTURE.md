# Trace - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Storybook │  │   VS Code    │  │   Figma Plugin   │   │
│  │  Embedded  │  │   Extension  │  │                  │   │
│  └─────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└────────┼─────────────────┼───────────────────┼──────────────┘
         │                 │                   │
         └─────────────────┼───────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │    React Chat Interface            │
         │   (InstantSearch Components)       │
         │  ┌──────────────────────────────┐  │
         │  │ • Message History            │  │
         │  │ • Multimodal Input           │  │
         │  │ • Component Previews         │  │
         │  │ • Code Playground            │  │
         │  │ • Citation Links             │  │
         │  └──────────────────────────────┘  │
         └─────────────────┬──────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │      Algolia Agent Studio          │
         │                                    │
         │  ┌────────────────────────────┐   │
         │  │   LLM Orchestration        │   │
         │  │   (GPT-4 via BYO-LLM)     │   │
         │  └────────────────────────────┘   │
         │                                    │
         │  ┌────────────────────────────┐   │
         │  │   Multi-Index Retrieval    │   │
         │  │   • Hybrid Search          │   │
         │  │   • Business Rules         │   │
         │  │   • Personalization        │   │
         │  └────────────────────────────┘   │
         │                                    │
         │  ┌────────────────────────────┐   │
         │  │   Session Memory           │   │
         │  │   • Context Tracking       │   │
         │  │   • User Preferences       │   │
         │  └────────────────────────────┘   │
         └─────────────────┬──────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │      7 Algolia Search Indices      │
         ├────────────────────────────────────┤
         │ 1. components_index                │
         │    (metadata, props, variants)     │
         ├────────────────────────────────────┤
         │ 2. code_implementations_index      │
         │    (GitHub source files)           │
         ├────────────────────────────────────┤
         │ 3. design_files_index              │
         │    (Figma components)              │
         ├────────────────────────────────────┤
         │ 4. accessibility_index             │
         │    (WCAG, ARIA patterns)           │
         ├────────────────────────────────────┤
         │ 5. design_tokens_index             │
         │    (colors, spacing, typography)   │
         ├────────────────────────────────────┤
         │ 6. usage_analytics_index           │
         │    (production usage data)         │
         ├────────────────────────────────────┤
         │ 7. team_knowledge_index            │
         │    (ADRs, decisions, patterns)     │
         └────────────────────────────────────┘
```

## Data Flow

### Query Processing Pipeline

```
1. USER INPUT
   ├─ Text: "show me accessible buttons"
   ├─ Screenshot: [uploaded image]
   ├─ Figma URL: https://figma.com/file/...
   └─ Code: <Button variant="primary">

2. INPUT PROCESSING
   ├─ Parse query intent
   ├─ Extract keywords
   ├─ Generate embeddings (if semantic search)
   └─ Identify relevant indices

3. AGENT STUDIO ORCHESTRATION
   ├─ Send to /completions endpoint
   ├─ System prompt with context
   ├─ User message with input
   └─ Available tools configuration

4. MULTI-INDEX RETRIEVAL
   ├─ Query relevant indices in parallel
   ├─ Apply business rules (team standards)
   ├─ Personalize results (user role)
   └─ Hybrid search (keyword + vector)

5. LLM SYNTHESIS
   ├─ Receive search results
   ├─ Generate response with citations
   ├─ Include code examples
   └─ Add accessibility guidance

6. RESPONSE ENRICHMENT
   ├─ Add component previews (images)
   ├─ Attach Figma links
   ├─ Include usage examples
   └─ Provide action buttons

7. UI RENDERING
   ├─ Display message in chat
   ├─ Render component previews
   ├─ Enable copy/paste actions
   └─ Show citation sources
```

## Agent Studio Configuration

### System Prompt Template

```markdown
You are Trace, an expert AI assistant for the Flo Labs design system. 
You help developers and designers find, understand, and implement components correctly.

# Your Capabilities
- Answer questions about components, design tokens, and patterns
- Generate production-ready code with proper accessibility
- Explain design decisions and best practices
- Find similar components across the design system
- Provide usage examples from real production code

# Response Format
Always structure responses with:
1. Direct answer to the question
2. Code example (if relevant)
3. Accessibility considerations (if UI component)
4. Usage examples from production (if available)
5. Links to Figma components and documentation

# Guidelines
- Always cite your sources with [source_type] indicators
- Prioritize accessibility in all code examples
- Use team conventions (prefer ButtonPrimary over Button for CTAs)
- Mention related components when relevant
- Ask clarifying questions if the query is ambiguous

# Context
- User Role: {{user_role}}
- Current Project: {{current_project}}
- Recent Queries: {{conversation_history}}

# Design System Standards
- All interactive elements need keyboard support
- Minimum 3:1 contrast ratio for UI components
- Use semantic HTML elements when possible
- Follow team spacing conventions (multiples of 4px)
```

### Tools Configuration

```typescript
{
  "tools": [
    {
      "type": "algolia_search",
      "index": "components_index",
      "description": "Search component metadata, props, and variants"
    },
    {
      "type": "algolia_search", 
      "index": "code_implementations_index",
      "description": "Find real code examples from production"
    },
    {
      "type": "algolia_search",
      "index": "design_files_index", 
      "description": "Find Figma component links and design specs"
    },
    {
      "type": "algolia_search",
      "index": "accessibility_index",
      "description": "Get accessibility requirements and ARIA patterns"
    },
    {
      "type": "algolia_search",
      "index": "design_tokens_index",
      "description": "Look up color, spacing, and typography tokens"
    },
    {
      "type": "algolia_search",
      "index": "usage_analytics_index",
      "description": "Find where components are used in production"
    },
    {
      "type": "algolia_search",
      "index": "team_knowledge_index",
      "description": "Search ADRs, decisions, and team patterns"
    }
  ]
}
```

### Business Rules

```typescript
// Rules applied during retrieval
const businessRules = {
  // Enforce team conventions
  componentPreferences: {
    "cta": "ButtonPrimary", // Always use primary button for CTAs
    "destructive": "ButtonDestructive",
    "cancel": "ButtonSecondary"
  },
  
  // Accessibility requirements
  accessibilityRules: {
    interactive: ["keyboard support", "focus indicators"],
    images: ["alt text required"],
    forms: ["labels required", "error messages"]
  },
  
  // Code generation standards
  codeStandards: {
    quotes: "double", // Use double quotes
    semicolons: true,
    imports: "named", // Prefer named imports
    typescript: true // Always include TypeScript types
  },
  
  // Deprecation warnings
  deprecatedComponents: {
    "OldButton": "Use Button instead (deprecated in v2.0)",
    "LegacyCard": "Use Card instead (deprecated in v3.0)"
  }
};
```

## Frontend Architecture

### React Component Structure

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatContainer.tsx         # Main chat wrapper
│   │   ├── MessageList.tsx           # Message history display
│   │   ├── MessageBubble.tsx         # Individual message
│   │   ├── InputArea.tsx             # Multimodal input
│   │   └── ComponentPreview.tsx      # Visual component display
│   ├── CodeBlock/
│   │   ├── CodeBlock.tsx             # Syntax-highlighted code
│   │   ├── CopyButton.tsx            # Copy to clipboard
│   │   └── Playground.tsx            # Interactive code editor
│   ├── Citations/
│   │   ├── CitationLink.tsx          # Source links
│   │   └── CitationPopover.tsx       # Hover preview
│   └── Modals/
│       ├── ScreenshotUpload.tsx      # Image upload
│       └── FigmaUrlInput.tsx         # Figma link parser
├── hooks/
│   ├── useAgentStudio.ts             # Agent API integration
│   ├── useMultimodalInput.ts         # Handle different input types
│   └── useSessionMemory.ts           # Track conversation context
├── services/
│   ├── agentStudio.ts                # Agent Studio API client
│   ├── imageAnalysis.ts              # Screenshot processing
│   └── figmaParser.ts                # Figma URL parsing
├── types/
│   ├── message.ts                    # Message type definitions
│   ├── component.ts                  # Component metadata types
│   └── agent.ts                      # Agent response types
└── utils/
    ├── markdown.ts                   # Markdown rendering
    ├── syntax-highlight.ts           # Code highlighting
    └── accessibility.ts              # A11y utilities
```

### Key React Components

#### ChatContainer Component
```typescript
interface ChatContainerProps {
  agentId: string;
  userRole: 'developer' | 'designer' | 'maintainer';
  currentProject?: string;
  embeddedIn: 'storybook' | 'vscode' | 'standalone';
}

export function ChatContainer({ 
  agentId, 
  userRole, 
  currentProject,
  embeddedIn 
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendMessage } = useAgentStudio(agentId);
  const { sessionId } = useSessionMemory();
  
  // Handle message submission
  const handleSubmit = async (input: MultimodalInput) => {
    // Process input (text, image, figma url, code)
    // Send to Agent Studio
    // Update UI with response
  };
  
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <InputArea onSubmit={handleSubmit} />
    </div>
  );
}
```

#### MessageBubble Component
```typescript
interface MessageBubbleProps {
  message: Message;
  role: 'user' | 'assistant';
}

export function MessageBubble({ message, role }: MessageBubbleProps) {
  return (
    <div className={`message-bubble ${role}`}>
      {/* Message content */}
      <MessageContent content={message.content} />
      
      {/* Code blocks with copy button */}
      {message.code && (
        <CodeBlock 
          code={message.code}
          language={message.language}
        />
      )}
      
      {/* Component preview */}
      {message.componentPreview && (
        <ComponentPreview component={message.componentPreview} />
      )}
      
      {/* Citations */}
      {message.citations && (
        <Citations sources={message.citations} />
      )}
      
      {/* Action buttons */}
      {message.actions && (
        <ActionButtons actions={message.actions} />
      )}
    </div>
  );
}
```

## API Integration

### Agent Studio Client

```typescript
// services/agentStudio.ts

interface AgentStudioConfig {
  apiKey: string;
  agentId: string;
  endpoint: string;
}

class AgentStudioClient {
  private config: AgentStudioConfig;
  
  constructor(config: AgentStudioConfig) {
    this.config = config;
  }
  
  async sendMessage(params: {
    message: string;
    context?: Record<string, any>;
    sessionId?: string;
  }) {
    const response = await fetch(
      `${this.config.endpoint}/v1/agents/${this.config.agentId}/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: params.message
            }
          ],
          context: {
            user_role: params.context?.userRole,
            project: params.context?.project,
            session_id: params.sessionId,
            ...params.context
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Agent Studio error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async uploadImage(image: File) {
    // Convert image to base64
    // Include in message content
  }
  
  async parseFigmaUrl(url: string) {
    // Extract file key and node ID
    // Include in context for retrieval
  }
}
```

## Deployment Architecture

### Development
```
Local Development:
- React app with Vite
- Algolia indices (test data)
- Agent Studio (development agent)
- Mock production usage data
```

### Demo/Hackathon Submission
```
Vercel Deployment:
- Static React app
- Environment variables for API keys
- Algolia production indices
- Agent Studio production agent
```

### Post-Hackathon (MVP)
```
Full Stack:
- Frontend: Vercel
- Backend: Node.js API (for auth, analytics)
- Database: PostgreSQL (user sessions, preferences)
- Algolia: Production indices with real-time sync
- Agent Studio: Production agent with monitoring
```

## Performance Targets

- **Query Response Time**: <2 seconds end-to-end
- **Search Latency**: <50ms (Algolia SLA)
- **LLM Response**: <1.5 seconds (GPT-4 streaming)
- **UI Render**: <100ms (React re-render)
- **Bundle Size**: <500KB (gzipped)

## Security Considerations

1. **API Key Management**: Environment variables, never in code
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Prevent abuse of Agent Studio
4. **CORS**: Restrict origins for embedded usage
5. **XSS Prevention**: Sanitize markdown rendering

## Monitoring & Observability

### Key Metrics to Track
- Query success rate
- Average response time
- Most common queries
- User satisfaction (thumbs up/down)
- Component coverage (which components get asked about)
- Citation click-through rate

### Agent Studio Built-in Observability
- Trace every interaction
- A/B testing capability
- Evaluation harness
- Why agent responded specific way

---

**Next**: Review data schemas for each Algolia index
