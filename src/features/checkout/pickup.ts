/**
 * Dirección y horario de la tienda para "recoger en tienda".
 * Debe coincidir con PICKUP_LOCATION del backend (modules/orders/domain/entities/order.entity.ts).
 */
export const PICKUP_LOCATION = {
  street: 'Av. Tecnológico',
  extNumber: '1500',
  neighborhood: 'La Michoacana',
  city: 'Metepec',
  state: 'Estado de México',
  postalCode: '52140',
  hours: 'Lun a Sáb 11:00–20:00',
};

export const PICKUP_ADDRESS_LINE =
  `${PICKUP_LOCATION.street} ${PICKUP_LOCATION.extNumber}, ${PICKUP_LOCATION.neighborhood}, ${PICKUP_LOCATION.city}, ${PICKUP_LOCATION.state}`;
