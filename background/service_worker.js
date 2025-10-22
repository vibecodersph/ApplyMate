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
      systemPrompt: `You are a job information extraction assistant. Extract information in this exact format:

{
  "job_title": "exact position title",
  "job_description": "complete job description text",
  "job_description_summary": "brief 60-char summary of role and key requirements",
  "contact_details": {
    "contact_person": "full name of recruiter/contact",
    "email": "contact email address",
    "phone": "contact phone number"
  },
  "company": {
    "name": "company name",
    "member_since": "platform join date if available",
    "total_job_posts": "number of posts if available"
  },
  "salary": "salary range or rate if specified",
  "hours_per_week": "work hours if specified"
}

RULES:
1. Keep exact field names as shown
2. Use null for any missing information
3. Remove fields entirely if both parent and child objects are null
4. Maintain nested structure for contact_details and company
5. Keep job_description_summary under 60 characters
6. Extract only factual information, no interpretations

Return only the JSON object, exactly as specified above.`
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

  if (message.action === 'deleteLead') {
    chrome.storage.local.get(['leads'], (result) => {
      const leads = result.leads || [];
      leads.splice(message.index, 1);
      
      chrome.storage.local.set({ leads }, () => {
        sendResponse({
          success: true
        });
      });
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
