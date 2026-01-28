// Use environment variable in production, fallback to relative path for development (uses Vite proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const NOTE_CATEGORIES = [
  { id: 'UPSC', name: 'UPSC', icon: '📚', color: 'primary' },
  { id: 'SSC', name: 'SSC', icon: '📝', color: 'success' },
  { id: 'STATE_PCS', name: 'State PCS', icon: '🏛️', color: 'purple' },
  { id: 'BANKING', name: 'Banking', icon: '🏦', color: 'warning' },
  { id: 'RAILWAY', name: 'Railway', icon: '🚂', color: 'danger' },
  { id: 'DEFENCE', name: 'Defence', icon: '🎖️', color: 'indigo' },
  { id: 'TEACHING', name: 'Teaching', icon: '👨‍🏫', color: 'pink' },
  { id: 'OTHER', name: 'Other', icon: '📄', color: 'default' },
];

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'warning' },
  CONFIRMED: { label: 'Confirmed', color: 'info' },
  PROCESSING: { label: 'Processing', color: 'primary' },
  PRINTING: { label: 'Printing', color: 'primary' },
  PRINTED: { label: 'Printed', color: 'info' },
  SHIPPED: { label: 'Shipped', color: 'purple' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'cyan' },
  DELIVERED: { label: 'Delivered', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'danger' },
  RETURNED: { label: 'Returned', color: 'danger' },
};

export const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', color: 'warning' },
  PAID: { label: 'Paid', color: 'success' },
  FAILED: { label: 'Failed', color: 'danger' },
  REFUNDED: { label: 'Refunded', color: 'secondary' },
};

export const PAPER_TYPES = [
  { id: 'GSM_70', name: '70 GSM (Standard)', description: 'Standard quality paper', price: 0 },
  { id: 'GSM_80', name: '80 GSM (Premium)', description: 'Premium quality, slightly thicker', price: 50 },
  { id: 'GSM_100', name: '100 GSM (Ultra)', description: 'Ultra thick, best quality', price: 100 },
];

export const PRINT_TYPES = [
  { id: 'BLACK_WHITE', name: 'Black & White', description: 'Standard B/W printing', price: 0 },
  { id: 'COLOR', name: 'Full Color', description: 'Full color printing', price: 200 },
];

export const BINDING_TYPES = [
  { id: 'NONE', name: 'No Binding', description: 'Loose sheets only', price: 0 },
  { id: 'STAPLE', name: 'Staple Binding', description: 'Simple staple binding', price: 10 },
  { id: 'SPIRAL', name: 'Spiral Binding', description: 'Professional spiral binding', price: 40 },
  { id: 'HARDCOVER', name: 'Hardcover', description: 'Premium hardcover binding', price: 150 },
];

export const DELIVERY_OPTIONS = [
  { id: 'STANDARD', name: 'Standard Delivery', duration: '5-7 days', price: 50 },
  { id: 'EXPRESS', name: 'Express Delivery', duration: '2-3 days', price: 100 },
  { id: 'SAME_DAY', name: 'Same Day Delivery', duration: 'Today', price: 200 },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
];