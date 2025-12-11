import asyncio
import os
import shutil
import logging
from typing import Dict, Any, List, Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# We need a robust way to manage multiple server connections
# Each server runs as a separate subprocess

logger = logging.getLogger("MCPClient")

class MCPBridge:
    """
    Bridge between Squadron Brain and MCP Servers.
    """
    def __init__(self):
        self.sessions: Dict[str, ClientSession] = {}
        self.tools_registry: Dict[str, Any] = {} # tool_name -> {server_name, tool_def}

    async def connect_server(self, name: str, config: Dict[str, Any]):
        """
        Connect to an MCP server using stdio.
        Config example: {'command': 'npx', 'args': ['-y', '@modelcontextprotocol/server-filesystem']}
        """
        command = config.get("command")
        args = config.get("args", [])
        env = config.get("env", None)

        if not shutil.which(command):
            logger.error(f"Command not found: {command}")
            return

        server_params = StdioServerParameters(
            command=command,
            args=args,
            env={**os.environ, **(env or {})}
        )

        try:
            # We need to maintain the connection context.
            # In a real app, we'd manage the context manager lifecycle properly.
            # For this MVP, we might need a dedicated Task or running loop.
            # However, mcp.client.stdio_client is an async context manager.
            # We will store the context manager to keep it alive? No, we need to enter it.
            
            # TODO: Refactor for long-lived connections.
            # For now, we will perform "Just-In-Time" connections for tool listing and execution
            # OR we spawn a background task to hold the connection.
            # Let's try JIT for simplicity first, but that's slow.
            # Let's try to hold them.
            pass

        except Exception as e:
            logger.error(f"Failed to connect to {name}: {e}")

    async def list_tools(self, name: str, config: Dict[str, Any]) -> List[Dict]:
        """
        Connects briefly to list tools.
        """
        tools = []
        command = config.get("command")
        args = config.get("args", [])
        env = config.get("env", None)
        
        server_params = StdioServerParameters(command=command, args=args, env={**os.environ, **(env or {})})

        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    result = await session.list_tools()
                    for tool in result.tools:
                        # Prefix tool name to avoid collisions: "filesystem_read_file"
                        tool_name = f"{name}_{tool.name}" 
                        self.tools_registry[tool_name] = {
                            "server_name": name,
                            "original_name": tool.name,
                            "config": config,
                            "description": tool.description,
                            "inputSchema": tool.inputSchema
                        }
                        tools.append(self.tools_registry[tool_name])
                    logger.info(f"Loaded {len(result.tools)} tools from {name}")
        except Exception as e:
            logger.error(f"Error listing tools from {name}: {e}")
        
        return tools

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """
        Executes a tool by reconnecting to the server.
        """
        tool_info = self.tools_registry.get(tool_name)
        if not tool_info:
            raise ValueError(f"Tool {tool_name} not found")

        config = tool_info["config"]
        original_name = tool_info["original_name"]
        
        server_params = StdioServerParameters(
            command=config.get("command"),
            args=config.get("args", []),
            env={**os.environ, **(config.get("env") or {})}
        )

        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(original_name, arguments=arguments)
                return result
