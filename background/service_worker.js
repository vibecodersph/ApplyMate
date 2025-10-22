// background/service_worker.js
// Handles AI-powered lead extraction using Chrome's built-in Gemini Nano

async function extractLeadWithAI(pageContent, selectedText) {
  try {
    // Check if LanguageModel API is available (Chrome's built-in AI)
    if (typeof LanguageModel === 'undefined') {
      throw new Error('Chrome AI (Gemini Nano) is not available. Please check chrome://flags: enable "Prompt API for Gemini Nano" and "Optimization Guide On Device Model". Then download the model from chrome://components.');
    }

    console.log('[Lead Extractor] LanguageModel found, creating session...');

    // Create AI session directly (capabilities check is optional)
    // The Mail-Bot reference doesn't check capabilities, just creates the session
    const session = await LanguageModel.create({
      systemPrompt: `You are a job application information extraction assistant. Extract structured job and contact information from web pages.
Your task is to identify and extract:
- Job Title (the specific job title or position being advertised)
- Job Description (detailed description of the role, responsibilities, requirements, etc.)
- Job Description Summary (a concise 2-3 sentence summary of the key points)
- Contact Name (full name of the recruiter, HR contact, or hiring manager if available)
- Contact Email (email address for applications or inquiries)
- Contact Phone (phone number if available)
- Company (company or organization name)

Return ONLY a valid JSON object in this exact format:
{
  "job_title": "extracted job title or null",
  "job_description": "extracted full job description or null",
  "job_description_summary": "concise summary of job description or null",
  "contactName": "extracted contact name or null",
  "contactEmail": "extracted contact email or null",
  "contactPhone": "extracted contact phone or null",
  "company": "extracted company name or null"
}

If a field cannot be found, use null. Do not include any explanation, just the JSON object. All fields must be plain text strings (not objects, arrays, or nested structures). Use the provided variable names, do not change.`
    });

    // Build extraction prompt
    const prompt = `Extract job and contact information from this content:

${selectedText ? `Selected text: ${selectedText}\n\n` : ''}
Page content: ${pageContent}

Return only the JSON object with job title, job description, job description summary, contact details, and company fields.`;

    // Generate response
    const result = await session.prompt(prompt);

    // Clean up session
    session.destroy();

    console.log('[Lead Extractor] AI Response:', result);

    // Parse JSON response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const leadData = JSON.parse(jsonMatch[0]);
        console.log('[Lead Extractor] Parsed lead data:', leadData);
        
        // Validate that we have at least some data
        const hasData = leadData.job_title || leadData.job_description;
        if (!hasData) {
          console.warn('[Lead Extractor] No meaningful data extracted');
          return {
            success: false,
            error: 'No meaningful job or contact information found on this page'
          };
        }
        
        return {
          success: true,
          data: leadData
        };
      } catch (parseError) {
        console.error('[Lead Extractor] JSON Parse Error:', parseError);
        console.error('[Lead Extractor] Raw response:', result);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      console.error('[Lead Extractor] No JSON found in response:', result);
      throw new Error('Failed to extract structured data - no JSON found in response');
    }

  } catch (error) {
    console.error('[Lead Extractor] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Message listener for handling extraction requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message and sender
  if (!message || !sender) {
    sendResponse({
      success: false,
      error: 'Invalid message or sender'
    });
    return true;
  }

  // Only require sender.tab for content script messages (extractLead action)
  if (message.action === 'extractLead' && !sender.tab) {
    sendResponse({
      success: false,
      error: 'Invalid message or sender'
    });
    return true;
  }

  if (message.action === 'extractLead') {
    extractLeadWithAI(message.pageContent, message.selectedText)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('[Lead Extractor] Background error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true; // Async response
  }

  if (message.action === 'getStoredLeads') {
    chrome.storage.local.get(['leads'], (result) => {
      sendResponse({
        success: true,
        leads: result.leads || []
      });
    });

    return true; // Async response
  }

  if (message.action === 'saveLead') {
    if (!message.lead) {
      sendResponse({
        success: false,
        error: 'No lead data provided'
      });
      return true;
    }

    chrome.storage.local.get(['leads'], (result) => {
      const leads = result.leads || [];
      leads.unshift({
        ...message.lead,
        timestamp: Date.now(),
        url: message.url
      });

      chrome.storage.local.set({ leads }, () => {
        sendResponse({
          success: true,
          totalLeads: leads.length
        });
      });
    });

    return true; // Async response
  }

  if (message.action === 'clearLeads') {
    chrome.storage.local.set({ leads: [] }, () => {
      sendResponse({ success: true });
    });

    return true; // Async response
  }

  // Unknown action
  sendResponse({
    success: false,
    error: 'Unknown action'
  });
  return true;
});

console.log('[Lead Extractor] Service worker activated');
