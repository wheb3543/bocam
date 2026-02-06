/**
 * Facebook Conversion API Integration
 * Sends server-side conversion events to Facebook for better tracking
 */

interface ConversionEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    fn?: string; // first name (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  };
  event_source_url?: string;
}

interface FacebookConversionParams {
  eventName: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    clientIp?: string;
    userAgent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    contentName?: string;
    contentCategory?: string;
    value?: number;
    currency?: string;
  };
  eventSourceUrl?: string;
}

/**
 * Hash data using SHA256 (required by Facebook)
 */
async function hashData(data: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Send conversion event to Facebook Conversion API
 */
export async function sendConversionEvent(params: FacebookConversionParams): Promise<boolean> {
  try {
    const pixelId = process.env.META_PIXEL_ID || '2008380493273171';
    const accessToken = process.env.META_CONVERSION_API_TOKEN || 'EAAagyBN7YEIBP5HmtcuEZC2ndUhjDqCkaxWvZBalg6haX7UzDqV7eGR1NZBsc6ZATCBkMt88ZC5kGE9nyeQqgKP2BwZCU9XwCpabqMmyLEwErACQZAs7pwUAqDzrIZAkS1d6X5bwlKyZAuR5WZB9L2ZAymai9KVPiBQoMdXaIZAWwViy8jxwIYPZAmSusiX1WzRZAbCQZDZD';
    
    // Prepare user data with hashing
    const userData: any = {};
    
    if (params.userData.email) {
      userData.em = await hashData(params.userData.email);
    }
    
    if (params.userData.phone) {
      // Remove all non-numeric characters and hash
      const cleanPhone = params.userData.phone.replace(/\D/g, '');
      userData.ph = await hashData(cleanPhone);
    }
    
    if (params.userData.firstName) {
      userData.fn = await hashData(params.userData.firstName);
    }
    
    if (params.userData.clientIp) {
      userData.client_ip_address = params.userData.clientIp;
    }
    
    if (params.userData.userAgent) {
      userData.client_user_agent = params.userData.userAgent;
    }
    
    if (params.userData.fbc) {
      userData.fbc = params.userData.fbc;
    }
    
    if (params.userData.fbp) {
      userData.fbp = params.userData.fbp;
    }
    
    // Prepare event
    const event: ConversionEvent = {
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
    };
    
    if (params.customData) {
      event.custom_data = params.customData;
    }
    
    if (params.eventSourceUrl) {
      event.event_source_url = params.eventSourceUrl;
    }
    
    // Send to Facebook
    const url = `https://graph.facebook.com/v24.0/${pixelId}/events?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [event],
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('[Facebook Conversion API] Event sent successfully:', params.eventName);
      return true;
    } else {
      console.error('[Facebook Conversion API] Failed to send event:', result);
      return false;
    }
  } catch (error) {
    console.error('[Facebook Conversion API] Error:', error);
    return false;
  }
}

/**
 * Track Lead event
 */
export async function trackLead(params: {
  email?: string;
  phone?: string;
  firstName?: string;
  clientIp?: string;
  userAgent?: string;
  contentName?: string;
}) {
  return sendConversionEvent({
    eventName: 'Lead',
    userData: {
      email: params.email,
      phone: params.phone,
      firstName: params.firstName,
      clientIp: params.clientIp,
      userAgent: params.userAgent,
    },
    customData: {
      contentName: params.contentName,
      contentCategory: 'Healthcare',
    },
  });
}

/**
 * Track CompleteRegistration event
 */
export async function trackCompleteRegistration(params: {
  email?: string;
  phone?: string;
  firstName?: string;
  clientIp?: string;
  userAgent?: string;
  contentName?: string;
}) {
  return sendConversionEvent({
    eventName: 'CompleteRegistration',
    userData: {
      email: params.email,
      phone: params.phone,
      firstName: params.firstName,
      clientIp: params.clientIp,
      userAgent: params.userAgent,
    },
    customData: {
      contentName: params.contentName,
      contentCategory: 'Healthcare',
    },
  });
}
