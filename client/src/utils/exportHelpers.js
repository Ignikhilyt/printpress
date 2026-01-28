/**
 * CSV Export Utility
 * Exports data to CSV format with proper formatting
 */

export function exportToCSV(data, filename = 'export') {
    if (!data || !data.length) {
        throw new Error('No data to export');
    }

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];

            // Handle values that might contain commas or quotes
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }

            // Handle dates
            if (value instanceof Date) {
                return value.toISOString();
            }

            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }

            return value;
        });
        csvRows.push(values.join(','));
    }

    // Create CSV string
    const csvString = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export to Excel (basic XLSX format)
 * For full Excel features, consider using a library like xlsx
 */
export function exportToExcel(data, filename = 'export') {
    if (!data || !data.length) {
        throw new Error('No data to export');
    }

    // For now, export as CSV with .xlsx extension
    // For production, integrate SheetJS (xlsx) library
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]));

    // Create table HTML
    const tableHTML = `
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row => `<tr>${row.map(cell => `<td>${cell || ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Format orders data for export
 */
export function formatOrdersForExport(orders) {
    return orders.map(order => ({
        'Order Number': order.orderNumber,
        'Customer Name': order.customer?.name || order.customerName,
        'Email': order.customer?.email || order.customerEmail,
        'Phone': order.customer?.phone || order.customerPhone,
        'Items Count': order.items?.length || 0,
        'Subtotal': order.pricing?.subtotal || 0,
        'Discount': order.pricing?.discount || 0,
        'Delivery Charge': order.pricing?.deliveryCharge || 0,
        'Total Amount': order.pricing?.total || 0,
        'Payment Method': order.payment?.method || 'N/A',
        'Payment Status': order.payment?.status || 'Pending',
        'Status': order.status,
        'Created At': new Date(order.createdAt).toLocaleDateString(),
        'Delivery Address': order.delivery?.address || 'N/A',
        'City': order.delivery?.city || 'N/A',
        'Pincode': order.delivery?.pincode || 'N/A',
    }));
}

/**
 * Format notes data for export
 */
export function formatNotesForExport(notes) {
    return notes.map(note => ({
        'Title': note.title,
        'Slug': note.slug,
        'Category': note.category,
        'Subject': note.subject || 'N/A',
        'Institute': note.institute?.name || 'N/A',
        'Total Pages': note.totalPages,
        'Price per Page': note.pricePerPage,
        'Total Price': note.totalPages * note.pricePerPage,
        'Is Active': note.isActive ? 'Yes' : 'No',
        'Is Featured': note.isFeatured ? 'Yes' : 'No',
        'Views': note.views || 0,
        'Created At': new Date(note.createdAt).toLocaleDateString(),
    }));
}

/**
 * Format analytics data for export
 */
export function formatAnalyticsForExport(analytics) {
    return analytics.map(item => ({
        'Date': item.date,
        'Revenue': item.revenue || 0,
        'Orders': item.orders || 0,
        'New Customers': item.newCustomers || 0,
        'Average Order Value': item.avgOrderValue || 0,
    }));
}

/**
 * Print function for invoices/orders
 */
export function printDocument(elementId) {
    const printContent = document.getElementById(elementId);

    if (!printContent) {
        console.error(`Element with id '${elementId}' not found`);
        return;
    }

    const windowUrl = 'about:blank';
    const windowName = 'Print';
    const printWindow = window.open(windowUrl, windowName, 'width=800,height=600');

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
}

/**
 * Download JSON data
 */
export function downloadJSON(data, filename = 'data') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
