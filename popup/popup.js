// popup/popup.js
// Handles popup UI interactions and lead management

let leads = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadLeads();
  setupEventListeners();
});

// Load leads from storage
async function loadLeads() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getStoredLeads'
    });

    console.log('[Lead Extractor] Load leads response:', response);

    if (response.success) {
      leads = response.leads;
      console.log('[Lead Extractor] Loaded leads:', leads);
      updateUI();
    } else {
      console.error('[Lead Extractor] Failed to load leads:', response.error);
      showNotification('Failed to load leads: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Error loading leads:', error);
    showNotification('Failed to load leads', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('exportClipboard').addEventListener('click', exportToClipboard);
  document.getElementById('exportCSV').addEventListener('click', exportToCSV);
  document.getElementById('clearLeads').addEventListener('click', clearAllLeads);
}

// Update UI with leads
function updateUI() {
  // Update total count
  document.getElementById('totalLeads').textContent = leads.length;

  // Update leads list
  const leadsList = document.getElementById('leadsList');

  if (leads.length === 0) {
    leadsList.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="19" y1="8" x2="19" y2="14"></line>
          <line x1="22" y1="11" x2="16" y2="11"></line>
        </svg>
        <p>No leads extracted yet</p>
        <small>Visit any webpage and click "Extract Lead" button</small>
      </div>
    `;
    return;
  }

  leadsList.innerHTML = leads.map((lead, index) => `
    <div class="lead-card">
      <div class="lead-header">
        <div>
          <div class="lead-name">${escapeHtml(lead.job_title) || 'No Job Title'}</div>
          <div class="lead-role">${escapeHtml(lead.contact_details?.contact_person || lead.contact_details?.name || lead.contact_details?.company || lead.company || 'No Company')}</div>
          <div class="lead-salary">${escapeHtml(lead.salary || 'TBD')}</div>
        </div>
        <div class="lead-actions">
          <button class="icon-btn copy-btn" data-index="${index}" title="Copy job info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="icon-btn delete-btn" data-index="${index}" title="Delete job">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="lead-info">
        ${lead.job_description_summary ? `
          <div class="info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span class="info-label">Job Summary:</span>
            <span class="info-value">${escapeHtml(lead.job_description_summary)}</span>
          </div>
        ` : ''}
        ${lead.contactName ? `
          <div class="info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <span class="info-label">Contact:</span>
            <span class="info-value">${escapeHtml(lead.contactName)}</span>
          </div>
        ` : ''}
        ${lead.contactEmail ? `
          <div class="info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span class="info-label">Email:</span>
            <span class="info-value">${escapeHtml(lead.contactEmail)}</span>
          </div>
        ` : ''}
        ${lead.contactPhone ? `
          <div class="info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span class="info-label">Phone:</span>
            <span class="info-value">${escapeHtml(lead.contactPhone)}</span>
          </div>
        ` : ''}
      </div>
      <div class="lead-meta">
        <a href="${escapeHtml(lead.url)}" 
           class="lead-url" 
           title="${escapeHtml(lead.url)}"
           target="_blank"
           rel="noopener noreferrer">${escapeHtml(getHostname(lead.url))}</a>
        <span class="lead-date">${formatDate(lead.timestamp)}</span>
      </div>
    </div>
  `).join('');

  // Add event listeners after updating innerHTML
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      await deleteLead(index);
    });
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      copyLead(index);
    });
  });
}

// Export to clipboard
async function exportToClipboard() {
  if (leads.length === 0) {
    showNotification('No jobs to export', 'error');
    return;
  }

  try {
    const text = leads.map(lead => {
      return `Job Title: ${lead.job_title || 'N/A'}
Company: ${lead.company || 'N/A'}
Job Summary: ${lead.job_description_summary || 'N/A'}
Contact Name: ${lead.contactName || 'N/A'}
Contact Email: ${lead.contactEmail || 'N/A'}
Contact Phone: ${lead.contactPhone || 'N/A'}
URL: ${lead.url || 'N/A'}
---`;
    }).join('\n\n');

    await navigator.clipboard.writeText(text);
    showNotification(`Copied ${leads.length} jobs to clipboard`, 'success');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    showNotification('Failed to copy to clipboard', 'error');
  }
}

// Export to CSV
function exportToCSV() {
  try {
    // Convert leads data to CSV format
    const csvContent = leads.map(lead => {
      // Define the fields you want to export
      const rowData = [
        lead.job_title || '',
        lead.company?.name || lead.company || '',
        lead.job_description_summary || '',
        lead.contact_details?.contact_person || '',
        lead.contact_details?.email || '',
        lead.contact_details?.phone || '',
        lead.url || '',
        formatDate(lead.timestamp) || ''
      ];

      // Ensure all values are strings and properly escaped
      return rowData.map(cell => {
        const stringValue = String(cell || ''); // Convert to string, use empty string if null/undefined
        return `"${stringValue.replace(/"/g, '""')}"`;  // Escape quotes and wrap in quotes
      }).join(',');
    }).join('\n');

    // Add headers
    const headers = [
      'Job Title',
      'Company',
      'Summary',
      'Contact Person',
      'Email',
      'Phone',
      'URL',
      'Date'
    ].map(header => `"${header}"`).join(',');

    // Combine headers and content
    const fullCsv = `${headers}\n${csvContent}`;

    // Create and trigger download
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `job_leads_${formatDate(Date.now())}.csv`;
    link.click();

    showNotification('CSV exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    showNotification('Failed to export CSV', 'error');
  }
}

// Clear all leads
async function clearAllLeads() {
  if (leads.length === 0) return;

  if (!confirm(`Are you sure you want to delete all ${leads.length} leads?`)) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      action: 'clearLeads'
    });

    leads = [];
    updateUI();
    showNotification('All jobs cleared', 'success');
  } catch (error) {
    console.error('Error clearing leads:', error);
    showNotification('Failed to clear jobs', 'error');
  }
}

// Copy single lead
async function copyLead(index) {
  const lead = leads[index];
  const text = `Job Title: ${lead.job_title || 'N/A'}
Company: ${lead.company || 'N/A'}
Job Summary: ${lead.job_description_summary || 'N/A'}
Contact Name: ${lead.contactName || 'N/A'}
Contact Email: ${lead.contactEmail || 'N/A'}
Contact Phone: ${lead.contactPhone || 'N/A'}
URL: ${lead.url || 'N/A'}`;

  try {
    await navigator.clipboard.writeText(text);
    showNotification('Job copied to clipboard', 'success');
  } catch (error) {
    console.error('Error copying job:', error);
    showNotification('Failed to copy job', 'error');
  }
}

// Delete single lead
async function deleteLead(index) {
  if (!confirm('Delete this job?')) return;
  
  try {
    await chrome.runtime.sendMessage({
      action: 'deleteLead',
      index: index
    });
    
    await loadLeads();
    showNotification('Job deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting lead:', error);
    showNotification('Failed to delete job', 'error');
  }
}

// Utility functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Make functions globally accessible for inline onclick handlers
window.copyLead = copyLead;
window.deleteLead = deleteLead;
