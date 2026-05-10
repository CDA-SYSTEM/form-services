/**
 * Patrones de mensaje RabbitMQ (Nest @MessagePattern / ClientProxy.send).
 * client-service y vehicle-service deben usar los mismos strings.
 */
export const RMQ_PATTERNS = {
  /** Solicitud: { id: string } -> Respuesta: { exists: boolean } */
  CLIENT_EXISTS: 'cda.client.exists',
  /** Solicitud: { id: string } -> Respuesta: { exists: boolean } */
  VEHICLE_EXISTS: 'cda.vehicle.exists',
} as const;
