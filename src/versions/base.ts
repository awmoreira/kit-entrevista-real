import { DomainError, type CreateOrder } from '../domain.js';

// Estado anterior ao PR: o serviço já permite consultar pedidos históricos.
export const createOrder: CreateOrder = async () => {
  throw new DomainError(501, 'creation_not_available');
};
