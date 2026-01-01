// AI Agent Analytics Example (Autonomous Agents, Copilots, AI Assistants)
// This demonstrates how the channel-agnostic schema works for AI agent interactions

class AgentAnalytics {
    constructor(apiEndpoint, agentVersion) {
        this.apiEndpoint = apiEndpoint;
        this.agentVersion = agentVersion;
        this.taskSessions = new Map();
    }

    getOrCreateSessionId(taskId) {
        if (!this.taskSessions.has(taskId)) {
            const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            this.taskSessions.set(taskId, sessionId);
        }
        return this.taskSessions.get(taskId);
    }

    async sendEvent(taskId, userId, eventType, interactionTarget = null, metadata = {}, eventCategory = 'user_action') {
        const event = {
            // Channel information
            channel: 'agent',
            platform: metadata.agent_platform || 'copilot', // 'copilot', 'custom-agent', 'langchain', 'autogen', etc.
            
            // Event classification
            event_type: eventType,
            event_category: eventCategory,
            
            // Context information (task/tool-based for agents)
            resource_id: taskId || metadata.tool_name || 'unknown',
            resource_title: metadata.task_description || metadata.tool_name,
            interaction_target: interactionTarget,
            
            // Session and user tracking
            session_id: this.getOrCreateSessionId(taskId),
            device_id: metadata.device_id || null,
            user_id: userId,
            
            // Technical metadata
            user_agent: `AIAgent/${this.agentVersion} (${metadata.agent_platform || 'copilot'})`,
            client_version: this.agentVersion,
            
            // Interaction-specific data
            interaction_text: metadata.prompt || metadata.command || null,
            interaction_value: metadata.confidence_score || metadata.execution_time || null,
            
            // Timestamp
            timestamp: new Date().toISOString(),
            
            // Additional context
            metadata: metadata
        };

        try {
            const response = await fetch(`${this.apiEndpoint}/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });

            if (response.ok) {
                console.log('Agent analytics event sent successfully');
            }
        } catch (error) {
            console.error('Error sending agent analytics event:', error);
        }
    }

    // Agent-specific tracking methods
    trackTaskStart(taskId, userId, taskDescription, taskType, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'session', 'task_start', {
            task_description: taskDescription,
            task_type: taskType, // 'code_generation', 'debugging', 'research', 'automation', etc.
            agent_platform: platform
        }, 'system_event');
    }

    trackTaskComplete(taskId, userId, taskDescription, duration, success, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'session', 'task_complete', {
            task_description: taskDescription,
            task_duration: duration,
            success: success,
            agent_platform: platform
        }, 'system_event');
    }

    trackPrompt(taskId, userId, prompt, promptType, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'prompt', 'user_prompt', {
            prompt: prompt,
            prompt_type: promptType, // 'instruction', 'question', 'refinement', etc.
            prompt_length: prompt.length,
            agent_platform: platform
        }, 'engagement');
    }

    trackToolUsage(taskId, userId, toolName, toolAction, parameters, executionTime, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'tool', toolName, {
            tool_name: toolName,
            tool_action: toolAction,
            parameters: parameters,
            execution_time: executionTime,
            agent_platform: platform
        }, 'system_event');
    }

    trackCodeGeneration(taskId, userId, language, linesOfCode, tokensGenerated, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'generation', 'code', {
            language: language,
            lines_of_code: linesOfCode,
            tokens_generated: tokensGenerated,
            generation_type: 'code',
            agent_platform: platform
        }, 'engagement');
    }

    trackContextRetrieval(taskId, userId, contextType, contextSource, relevanceScore, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'context', contextType, {
            context_type: contextType, // 'file', 'documentation', 'workspace', 'web', etc.
            context_source: contextSource,
            relevance_score: relevanceScore,
            agent_platform: platform
        }, 'system_event');
    }

    trackModelInference(taskId, userId, modelName, inputTokens, outputTokens, latency, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'inference', modelName, {
            model_name: modelName,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            latency: latency,
            agent_platform: platform
        }, 'system_event');
    }

    trackAgentDecision(taskId, userId, decision, reasoning, confidenceScore, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'decision', decision, {
            decision: decision,
            reasoning: reasoning,
            confidence_score: confidenceScore,
            agent_platform: platform
        }, 'system_event');
    }

    trackUserFeedback(taskId, userId, feedbackType, rating, comment, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'feedback', feedbackType, {
            feedback_type: feedbackType, // 'positive', 'negative', 'correction'
            rating: rating,
            comment: comment,
            agent_platform: platform
        }, 'engagement');
    }

    trackError(taskId, userId, errorType, errorMessage, errorContext, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'error', errorType, {
            error_type: errorType,
            error_message: errorMessage,
            error_context: errorContext,
            agent_platform: platform
        }, 'error');
    }

    trackAgentThought(taskId, userId, thought, stepNumber, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'thought', `step_${stepNumber}`, {
            thought: thought,
            step_number: stepNumber,
            agent_platform: platform
        }, 'system_event');
    }

    trackResourceUsage(taskId, userId, cpuUsage, memoryUsage, apiCalls, platform = 'copilot') {
        this.sendEvent(taskId, userId, 'resource', 'usage', {
            cpu_usage: cpuUsage,
            memory_usage: memoryUsage,
            api_calls: apiCalls,
            agent_platform: platform
        }, 'system_event');
    }
}

// Usage example
const analytics = new AgentAnalytics('http://localhost:3001', '1.0.0');

// Track task start
analytics.trackTaskStart('task-001', 'user-123', 
    'Implement user authentication feature', 'code_generation', 'copilot');

// Track user prompt
analytics.trackPrompt('task-001', 'user-123', 
    'Create a login page with email and password fields', 'instruction', 'copilot');

// Track context retrieval
analytics.trackContextRetrieval('task-001', 'user-123', 
    'file', 'src/components/Auth.jsx', 0.85, 'copilot');

// Track tool usage
analytics.trackToolUsage('task-001', 'user-123', 
    'create_file', 'write', { path: 'src/pages/Login.jsx' }, 250, 'copilot');

// Track code generation
analytics.trackCodeGeneration('task-001', 'user-123', 
    'javascript', 75, 1200, 'copilot');

// Track model inference
analytics.trackModelInference('task-001', 'user-123', 
    'gpt-4', 500, 800, 1200, 'copilot');

// Track agent decision
analytics.trackAgentDecision('task-001', 'user-123', 
    'use_react_hooks', 'Modern React best practices recommend hooks over class components', 
    0.92, 'copilot');

// Track user feedback
analytics.trackUserFeedback('task-001', 'user-123', 
    'positive', 5, 'Great implementation!', 'copilot');

// Track task completion
analytics.trackTaskComplete('task-001', 'user-123', 
    'Implement user authentication feature', 45000, true, 'copilot');

export default AgentAnalytics;
