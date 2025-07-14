import axios from 'axios';

const API_URL = 'http://T530-IP:3000/logs';

export async function sendLog(action: string, userId: string, reason?: string) {
  try {
    await axios.post(API_URL, { action, userId, reason });
    console.log(`✅ Sent log: ${action} -> ${userId}`);
  } catch (error) {
    console.error('❌ Failed to send log:', error);
  }
}