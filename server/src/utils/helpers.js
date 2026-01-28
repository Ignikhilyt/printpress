const crypto = require('crypto');

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PP-${year}-${random}`;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function paginate(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

module.exports = {
  generateOrderNumber,
  generateSlug,
  paginate,
};