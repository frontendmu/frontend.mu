interface WebMCPTool {
  name: string
  description: string
  inputSchema?: Record<string, any>
  handler: (inputs: any) => Promise<any>
}

export function useWebMCP() {
  const isSupported = computed(() => {
    if (import.meta.server) return false
    return 'modelContext' in navigator
  })

  function registerTool(tool: WebMCPTool) {
    if (!isSupported.value) return

    const mc = (navigator as any).modelContext
    // Unregister first to avoid duplicate name errors on HMR / re-navigation
    try { mc.unregisterTool(tool.name) } catch {}

    // The native WebMCP API uses `execute` (not `handler`) and expects
    // { content: [{ type: 'text', text: '...' }] } as the return format
    try {
      mc.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        async execute(inputs: any) {
          const result = await tool.handler(inputs)
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
          }
        },
      })
      console.log(`[WebMCP] Registered tool: ${tool.name}`)
    }
    catch (e) {
      console.error(`[WebMCP] Failed to register tool "${tool.name}":`, e)
    }
  }

  function unregisterTool(name: string) {
    if (!isSupported.value) return

    try {
      ;(navigator as any).modelContext.unregisterTool(name)
    } catch {}
  }

  return { isSupported, registerTool, unregisterTool }
}
