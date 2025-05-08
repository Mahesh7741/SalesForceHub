// filepath: c:\Users\MAHESH\Desktop\test\SalesForceCloudManageMentProject\src\utils\salesforceUtils.js

/**
 * Utility functions for Salesforce interactions
 */

/**
 * Checks if the Salesforce authentication data exists and is valid
 * @returns {Object|null} The auth data or null if invalid
 */
export const getSalesforceAuth = () => {
    try {
      const sfAuthData = localStorage.getItem("sfAuthData");
      if (!sfAuthData) return null;
      
      const authData = JSON.parse(sfAuthData);
      if (!authData.accessToken || !authData.instanceUrl) return null;
      
      // Check if token is expired (if we have expiry info)
      if (authData.issuedAt && authData.expiresIn) {
        const expiryTime = new Date(authData.issuedAt).getTime() + (authData.expiresIn * 1000);
        if (Date.now() > expiryTime) {
          console.warn("Salesforce token has expired");
          return null;
        }
      }
      
      return authData;
    } catch (error) {
      console.error("Error retrieving Salesforce auth data:", error);
      return null;
    }
  };
  
  /**
   * Formats Salesforce feed item content for display
   * @param {string} content The raw content
   * @returns {string} The formatted content
   */
  export const formatChatterContent = (content) => {
    if (!content) return '';
    
    // Replace @mentions with styled mentions
    let formatted = content.replace(/@\[([^\]]+)\]/g, '<span class="text-blue-600">@$1</span>');
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formatted = formatted.replace(urlRegex, url => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
    });
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };
  
  /**
   * Parses rich text content from Salesforce Chatter
   * @param {Object} messageSegments Array of message segments from Salesforce
   * @returns {string} Rendered HTML content
   */
  export const parseRichTextContent = (messageSegments) => {
    if (!messageSegments || !Array.isArray(messageSegments)) return '';
    
    return messageSegments.map(segment => {
      switch (segment.type) {
        case 'Text':
          return segment.text;
        case 'Mention':
          return `<span class="text-blue-600">@${segment.user?.name || segment.text}</span>`;
        case 'Link':
          return `<a href="${segment.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${segment.text || segment.url}</a>`;
        case 'Hashtag':
          return `<span class="text-blue-600">#${segment.text}</span>`;
        default:
          return segment.text || '';
      }
    }).join('');
  };
  
  /**
   * Creates a new Chatter post
   * @param {string} text The post text
   * @param {string} subjectId Optional record ID to associate with the post
   * @returns {Promise<Object>} The created post data
   */
  export const createChatterPost = async (text, subjectId = null) => {
    const authData = getSalesforceAuth();
    if (!authData) {
      throw new Error("Missing or invalid Salesforce authentication");
    }
    
    const { accessToken, instanceUrl } = authData;
    
    const response = await fetch("/api/salesforceChatter", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        accessToken, 
        instanceUrl, 
        postText: text,
        subjectId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create Chatter post");
    }
    
    return await response.json();
  };
  
  /**
   * Fetches Chatter posts with optional filters
   * @param {Object} options Filter options
   * @returns {Promise<Object>} Chatter data including posts and user info
   */
  export const fetchChatterPosts = async (options = {}) => {
    const authData = getSalesforceAuth();
    if (!authData) {
      throw new Error("Missing or invalid Salesforce authentication");
    }
    
    const { accessToken, instanceUrl } = authData;
    
    const response = await fetch("/api/salesforceChatter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        accessToken, 
        instanceUrl,
        ...options 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch Chatter posts");
    }
    
    return await response.json();
  };