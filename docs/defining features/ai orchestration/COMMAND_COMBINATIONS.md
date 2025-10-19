# AI Orchestrator Command Combinations

This file contains all possible command combinations for the AI Orchestrator, combining navigation, note processing, and general question capabilities.

## Navigation Commands

### Basic Navigation
- `"open offices"` - Navigate to offices list
- `"show offices"` - Navigate to offices list
- `"go to offices"` - Navigate to offices list
- `"view offices"` - Navigate to offices list
- `"list offices"` - Navigate to offices list

- `"open projects"` - Navigate to projects list
- `"show projects"` - Navigate to projects list
- `"go to projects"` - Navigate to projects list
- `"view projects"` - Navigate to projects list
- `"list projects"` - Navigate to projects list

- `"open regulatory"` - Navigate to regulatory records
- `"show regulatory"` - Navigate to regulatory records
- `"go to regulatory"` - Navigate to regulatory records
- `"view regulatory"` - Navigate to regulatory records
- `"list regulatory"` - Navigate to regulatory records

### Navigation with Context
- `"open office list"` - Navigate to offices list
- `"show project list"` - Navigate to projects list
- `"go to regulatory list"` - Navigate to regulatory records
- `"view office details"` - Navigate to offices list
- `"show project details"` - Navigate to projects list

### Back Navigation
- `"go back"` - Navigate back to previous view
- `"return"` - Navigate back to previous view
- `"back"` - Navigate back to previous view
- `"previous"` - Navigate back to previous view
- `"return to main"` - Go back to Cross UI

## Note Processing Commands

### Basic Note Addition
- `"add note: [text]"` - Process and create entities from text
- `"create note: [text]"` - Process and create entities from text
- `"process note: [text]"` - Process and create entities from text
- `"add: [text]"` - Process and create entities from text
- `"note: [text]"` - Process and create entities from text

### Office Notes
- `"add note: New office Zaha Hadid in London"` - Create office entity
- `"add note: Office in downtown Manhattan with 50 employees"` - Create office entity
- `"add note: Architecture firm in Dubai specializing in skyscrapers"` - Create office entity
- `"add note: Small practice in Barcelona focused on sustainable design"` - Create office entity

### Project Notes
- `"add note: New project Burj Khalifa 2 in Dubai"` - Create project entity
- `"add note: Residential complex in Singapore with 200 units"` - Create project entity
- `"add note: Museum design competition in Paris"` - Create project entity
- `"add note: Office building renovation in New York"` - Create project entity

### Regulatory Notes
- `"add note: New building code regulation for earthquake safety"` - Create regulation entity
- `"add note: Environmental regulation for green building certification"` - Create regulation entity
- `"add note: Fire safety code update for high-rise buildings"` - Create regulation entity
- `"add note: Accessibility regulation for public buildings"` - Create regulation entity

## Web Search Commands

### General Web Search
- `"search for [topic]"` - Search the web for any topic
- `"find information about [topic]"` - Search for specific information
- `"look up [topic]"` - Look up information on the web
- `"web search [query]"` - Perform a web search
- `"search the web for [query]"` - Search the web

### Architecture-Specific Search
- `"search architecture [topic]"` - Search for architecture-related information
- `"find architecture firms in [location]"` - Search for architecture firms
- `"search for [topic] architecture"` - Search for specific architecture topics
- `"look up architectural [topic]"` - Look up architectural information
- `"find [topic] architects"` - Search for architects by specialization

### Regulatory Search
- `"search building codes"` - Search for building code information
- `"find regulations for [topic]"` - Search for specific regulations
- `"look up [jurisdiction] building codes"` - Search for jurisdiction-specific codes
- `"search regulatory [topic]"` - Search for regulatory information
- `"find compliance requirements"` - Search for compliance information

## General Questions

### Date and Time
- `"what date is today"` - Get current date
- `"what time is it"` - Get current time
- `"what's today's date"` - Get current date
- `"current date"` - Get current date
- `"today's date"` - Get current date

### System Information
- `"what can you do"` - List available capabilities
- `"help"` - Show help information
- `"what commands are available"` - List available commands
- `"how do I use this"` - Show usage instructions
- `"what are my options"` - List available options

### General Conversation
- `"how are you"` - General greeting response
- `"hello"` - Greeting response
- `"hi"` - Greeting response
- `"good morning"` - Time-based greeting
- `"good afternoon"` - Time-based greeting
- `"good evening"` - Time-based greeting

## Combined Commands

### Navigation + Context
- `"open offices and show me the list"` - Navigate to offices
- `"go to projects and display them"` - Navigate to projects
- `"show regulatory records now"` - Navigate to regulatory

### Note + Navigation
- `"add note: New office in London and then show offices"` - Add note then navigate
- `"create note: Project in Dubai and go to projects"` - Add note then navigate
- `"process note: Regulation update and open regulatory"` - Add note then navigate

### Question + Action
- `"what date is today and then open offices"` - Answer question then navigate
- `"help me and then show projects"` - Show help then navigate
- `"what can you do and open regulatory"` - List capabilities then navigate

## Advanced Combinations

### Multi-step Workflows
- `"add note: New office in Paris, then open offices, then go back"` - Complete workflow
- `"show projects, add note: New project in Tokyo, then go back"` - Multi-step process
- `"what date is today, add note: Meeting scheduled, then open offices"` - Combined actions

### Context-aware Commands
- `"I need to add a new office in Berlin"` - Implied note addition
- `"Show me the offices and then I'll add a new one"` - Navigation with intent
- `"What's today's date? I need to schedule a meeting"` - Question with context

### Natural Language Variations
- `"Can you open the offices list?"` - Polite navigation
- `"Please show me the projects"` - Polite request
- `"I'd like to add a note about a new office"` - Polite note addition
- `"Could you tell me what date it is?"` - Polite question

## Error Handling Commands

### Retry Commands
- `"try again"` - Retry last command
- `"repeat"` - Repeat last action
- `"redo"` - Redo last command

### Clarification Commands
- `"what did you say"` - Repeat last response
- `"explain that"` - Explain last action
- `"show me what you did"` - Show last result

## System Commands

### State Management
- `"get current state"` - Get current application state
- `"refresh"` - Refresh current view
- `"reload"` - Reload current data
- `"update"` - Update current information

### Utility Commands
- `"clear"` - Clear current input/selection
- `"reset"` - Reset to initial state
- `"start over"` - Start fresh
- `"begin again"` - Restart process

## Examples by Use Case

### Office Management
- `"add note: New office Foster + Partners in London with 200 employees"`
- `"open offices"`
- `"show me the office in London"`
- `"go back to main"`

### Project Tracking
- `"add note: New project One World Trade Center renovation"`
- `"open projects"`
- `"show project details"`
- `"add note: Project completed on schedule"`

### Regulatory Compliance
- `"add note: New building code for earthquake safety in California"`
- `"open regulatory"`
- `"show regulatory records"`
- `"add note: Code compliance achieved"`

### General Assistance
- `"what date is today"`
- `"what can you help me with"`
- `"help me navigate the system"`
- `"show me what's available"`

## Command Patterns

### Pattern 1: Direct Action
- `[action] [target]` - e.g., "open offices", "show projects"

### Pattern 2: Note Addition
- `add note: [content]` - e.g., "add note: New office in Paris"

### Pattern 3: Question
- `[question]` - e.g., "what date is today", "how are you"

### Pattern 4: Web Search
- `search for [topic]` - e.g., "search for sustainable architecture"
- `find [information]` - e.g., "find architecture firms in London"
- `look up [topic]` - e.g., "look up building codes"

## Search and Navigation Workflows

### Search then Navigate
- `"search for sustainable architecture, then open projects"` - Search then navigate
- `"find building codes, then open regulatory records"` - Search then view regulations
- `"look up architecture firms, then create new office"` - Search then create
- `"search for green building standards, then add note"` - Search then process note
- `"find compliance requirements, then open regulatory list"` - Search then view compliance

### Multi-Search Operations
- `"search for modern architecture, then find building codes"` - Multiple searches
- `"look up sustainable design, then search for green materials"` - Related searches
- `"find architecture firms, then search for their projects"` - Connected searches

### Pattern 4: Combined
- `[action] [target] and [action] [target]` - e.g., "open offices and show projects"

### Pattern 5: Natural Language
- `I need to [action] [target]` - e.g., "I need to open offices"

## Tips for Users

1. **Be specific**: "open offices" is clearer than "show me stuff"
2. **Use natural language**: "I need to add a note about a new office"
3. **Combine commands**: "add note: New office and then show offices"
4. **Ask questions**: "what can you do" to discover capabilities
5. **Use context**: "show me the office I just added"

## Error Recovery

If a command fails:
1. Try rephrasing: "open offices" instead of "show me the office thing"
2. Use simpler language: "add note" instead of "create a new note entry"
3. Break down complex requests: "open offices" then "add note"
4. Ask for help: "what commands are available"

This comprehensive list covers all possible command combinations for the AI Orchestrator, providing users with maximum flexibility and natural interaction capabilities.
