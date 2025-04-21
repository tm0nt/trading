/**
 * Serviço de WebSocket para conectar à API da Binance
 * e receber atualizações de preços em tempo real
 */

/**
 * INTEGRAÇÃO COM BANCO DE DADOS DE PRODUÇÃO
 *
 * Este serviço precisaria ser modificado para:
 * 1. Conectar-se a APIs de mercado reais com tratamento adequado de limites de taxa
 * 2. Implementar reconexão robusta e tratamento de erros
 * 3. Implementar cache de dados para reduzir chamadas à API
 * 4. Registrar métricas de uso e desempenho
 *
 * Pontos de integração:
 * - Implementar sistema de cache para dados de mercado
 * - Adicionar logging de erros e métricas para monitoramento
 * - Implementar estratégias de throttling para respeitar limites de API
 */

// Tipo para os dados recebidos do WebSocket da Binance
export interface BinanceTickerData {
  e: string; // Tipo de evento
  E: number; // Timestamp do evento
  s: string; // Símbolo do par
  p: string; // Mudança absoluta de preço nas últimas 24h
  P: string; // Mudança percentual nas últimas 24h
  w: string; // Preço médio ponderado por volume nas 24h
  x: string; // Preço de fechamento anterior
  c: string; // Preço atual (último)
  Q: string; // Quantidade da última negociação
  b: string; // Melhor preço de compra
  B: string; // Quantidade da melhor compra
  a: string; // Melhor preço de venda
  A: string; // Quantidade da melhor venda
  o: string; // Preço de abertura das 24h
  h: string; // Preço mais alto das 24h
  l: string; // Preço mais baixo das 24h
  v: string; // Volume total nas últimas 24h
  q: string; // Volume em USDT
  O: number; // Timestamp de abertura das 24h
  C: number; // Timestamp atual
  F: number; // Primeiro ID de trade das 24h
  L: number; // Último ID de trade das 24h
  n: number; // Número de trades nas 24h
}

// Mapa para armazenar as conexões WebSocket ativas
const activeConnections: Map<string, WebSocket> = new Map();

// Mapa para armazenar os callbacks de atualização de preço
const priceUpdateCallbacks: Map<
  string,
  Set<(price: number) => void>
> = new Map();

// Adicionar uma função para buscar o preço atual via API REST
import { fetchCurrentPrice } from "@/lib/api";

// Modificar a função connectToTickerStream para silenciar erros
export function connectToTickerStream(symbol: string): void {
  // Verificar se já existe uma conexão para este símbolo
  if (activeConnections.has(symbol)) {
    return;
  }

  // A API pública de WebSocket da Binance não requer autenticação
  const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;

  const ws = new WebSocket(wsUrl);

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 segundos

  // INTEGRAÇÃO DB: Implementar sistema de cache para dados de mercado
  // Armazenar o último preço recebido para cada símbolo
  const lastPrices: Record<string, number> = {};

  // Configurar handlers de eventos
  ws.onopen = () => {
    reconnectAttempts = 0; // Resetar tentativas de reconexão quando conectar com sucesso
    // INTEGRAÇÃO DB: Registrar evento de conexão bem-sucedida
    // Exemplo: metricsService.recordEvent('websocket_connected', {symbol})
  };

  ws.onmessage = (event) => {
    try {
      // INTEGRAÇÃO DB: Processar dados reais da API de mercado
      const data: BinanceTickerData = JSON.parse(event.data);
      const currentPrice = Number.parseFloat(data.c);

      // INTEGRAÇÃO DB: Implementar cache e debounce para reduzir atualizações
      // Verificar se o preço mudou significativamente (pelo menos 0.0001 de diferença)
      // para evitar atualizações desnecessárias
      if (
        !lastPrices[symbol] ||
        Math.abs(currentPrice - lastPrices[symbol]) >= 0.0001
      ) {
        lastPrices[symbol] = currentPrice;

        // INTEGRAÇÃO DB: Atualizar cache de preços no banco de dados
        // Exemplo: await cacheService.updatePrice(symbol, currentPrice)

        // Notificar todos os callbacks registrados para este símbolo
        const callbacks = priceUpdateCallbacks.get(symbol);
        if (callbacks) {
          callbacks.forEach((callback) => callback(currentPrice));
        }
      }
    } catch (error) {
      // INTEGRAÇÃO DB: Registrar erro no sistema de logs
      // Exemplo: await logService.recordError('websocket_message_processing', error, {symbol})
      console.error("Erro ao processar mensagem do WebSocket:", error);
    }
  };

  ws.onclose = () => {
    // INTEGRAÇÃO DB: Registrar evento de desconexão
    // Exemplo: metricsService.recordEvent('websocket_disconnected', {symbol})

    // Remover a conexão do mapa
    activeConnections.delete(symbol);

    // INTEGRAÇÃO DB: Implementar estratégia de reconexão robusta
    // Tentar reconectar se não excedeu o número máximo de tentativas
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;

      setTimeout(() => {
        if (
          priceUpdateCallbacks.has(symbol) &&
          priceUpdateCallbacks.get(symbol)!.size > 0
        ) {
          connectToTickerStream(symbol);
        }
      }, reconnectDelay * reconnectAttempts); // Aumentar o delay a cada tentativa
    } else {
      // INTEGRAÇÃO DB: Registrar falha de reconexão
      // Exemplo: metricsService.recordEvent('websocket_reconnect_failed', {symbol, attempts: reconnectAttempts})
      useFallbackApi(symbol);
    }
  };

  // Armazenar a conexão no mapa
  activeConnections.set(symbol, ws);
}

// Função para usar a API REST como fallback
function useFallbackApi(symbol: string) {
  // Configurar um intervalo para buscar preços via API REST
  let intervalId: NodeJS.Timeout | null = null;

  const startFallback = () => {
    intervalId = setInterval(() => {
      if (
        !priceUpdateCallbacks.has(symbol) ||
        priceUpdateCallbacks.get(symbol)!.size === 0
      ) {
        clearInterval(intervalId!);
        intervalId = null;
        return;
      }

      fetchCurrentPrice(symbol)
        .then((price) => {
          const callbacks = priceUpdateCallbacks.get(symbol);
          if (callbacks) {
            callbacks.forEach((callback) => callback(price));
          }
        })
        .catch(() => {
          // Silenciar erros de API
        });
    }, 5000); // Atualizar a cada 5 segundos
  };

  // Se já houver um intervalo rodando, não inicie outro
  if (!intervalId) {
    startFallback();
  }
}

/**
 * Desconecta do WebSocket da Binance para um símbolo específico
 * @param symbol Símbolo do par de trading (ex: BTCUSDT)
 */
export function disconnectFromTickerStream(symbol: string): void {
  const ws = activeConnections.get(symbol);
  if (ws) {
    ws.close();
    activeConnections.delete(symbol);
  }
}

/**
 * Registra um callback para receber atualizações de preço para um símbolo específico
 * @param symbol Símbolo do par de trading (ex: BTCUSDT)
 * @param callback Função a ser chamada quando o preço for atualizado
 */
export function subscribeToPriceUpdates(
  symbol: string,
  callback: (price: number) => void,
): void {
  // Obter ou criar o conjunto de callbacks para este símbolo
  if (!priceUpdateCallbacks.has(symbol)) {
    priceUpdateCallbacks.set(symbol, new Set());
  }

  const callbacks = priceUpdateCallbacks.get(symbol)!;
  callbacks.add(callback);

  // Conectar ao WebSocket se ainda não estiver conectado
  if (!activeConnections.has(symbol)) {
    connectToTickerStream(symbol);
  }
}

/**
 * Cancela o registro de um callback para atualizações de preço
 * @param symbol Símbolo do par de trading (ex: BTCUSDT)
 * @param callback Função a ser removida
 */
export function unsubscribeFromPriceUpdates(
  symbol: string,
  callback: (price: number) => void,
): void {
  const callbacks = priceUpdateCallbacks.get(symbol);
  if (callbacks) {
    callbacks.delete(callback);

    // Se não houver mais callbacks, desconectar do WebSocket
    if (callbacks.size === 0) {
      priceUpdateCallbacks.delete(symbol);
      disconnectFromTickerStream(symbol);
    }
  }
}

/**
 * Desconecta de todos os WebSockets ativos
 */
export function disconnectAllWebSockets(): void {
  activeConnections.forEach((ws, symbol) => {
    ws.close();
  });

  activeConnections.clear();
  priceUpdateCallbacks.clear();
}
