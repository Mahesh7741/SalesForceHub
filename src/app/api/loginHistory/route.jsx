import jsforce from 'jsforce';

/**
 * Fetch login history records from Salesforce
 * @param {string} instanceUrl 
 * @param {string} accessToken 
 * @returns {Promise<Array>} Login history records
 */
export const fetchLoginHistory = async (instanceUrl, accessToken, limit = 10) => {
  const conn = new jsforce.Connection({ instanceUrl, accessToken });

  const query = `
    SELECT Id, UserId, LoginTime, SourceIp, LoginType, Status, Browser, LoginUrl
    FROM LoginHistory
    WHERE LoginTime >= 2023-01-01T00:00:00Z
    ORDER BY LoginTime DESC
    LIMIT ${limit}
  `;

  return conn.query(query).then(res => res.records);
};