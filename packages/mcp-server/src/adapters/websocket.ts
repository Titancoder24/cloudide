/**
 * WebSocket adapter for real-time streaming.
 * Provides bidirectional communication for:
 *   - File change events (server → client)
 *   - Tool call streaming (server → client)
 *   - AI cursor position updates (server → client)
 *   - Human input events (client → server)
 */

export interface WebSocketMessage {
  type:
    | 'tool_call'
    | 'tool_result'
    | 'file_change'
    | 'cursor_update'
    | 'error_event'
    | 'process_output'
    | 'ping'
    | 'pong';
  id?: string;
  data: unknown;
  timestamp: string;
}

export interface CursorUpdate {
  agentId: string;
  label: string;
  color: string;
  file: string;
  line: number;
  column: number;
  status: 'idle' | 'reading' | 'writing' | 'executing';
}

export interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  oldPath?: string;
}

/**
 * Broadcast a message to all connected WebSocket clients.
 */
export function createBroadcaster(): {
  addClient: (ws: { send: (data: string) => void }) => () => void;
  broadcast: (message: WebSocketMessage) => void;
} {
  const clients = new Set<{ send: (data: string) => void }>();

  return {
    addClient(ws) {
      clients.add(ws);
      return () => clients.delete(ws);
    },
    broadcast(message) {
      const data = JSON.stringify(message);
      for (const client of clients) {
        try {
          client.send(data);
        } catch {
          clients.delete(client);
        }
      }
    },
  };
}
