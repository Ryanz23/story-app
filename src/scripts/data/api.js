import CONFIG from '../config';

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  GET_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

// Auth functions
export async function registerUser(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return await response.json();
}

export async function loginUser(email, password, isDemo = false) {
  // Added isDemo parameter
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const responseJson = await response.json();

  // Only save auth data to localStorage if it's not a demo login
  if (!isDemo && !responseJson.error && responseJson.loginResult) {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: responseJson.loginResult.token,
        name: responseJson.loginResult.name,
        userId: responseJson.loginResult.userId,
      })
    );
  }

  return responseJson;
}

export function getToken() {
  const auth = localStorage.getItem('auth');
  if (auth) {
    return JSON.parse(auth).token;
  }
  return null;
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem('auth');
}

// Story functions
export async function getData(page = 1, size = 10, needLocation = 1) {
  try {
    let token = getToken();

    // If not logged in, attempt to login/register demo user to fetch data
    if (!token) {
      const demoLoginResponse = await loginUser(
        'demo@example.com',
        'password123',
        true
      ); // Pass true for isDemo
      if (demoLoginResponse.error) {
        // If demo login failed, try registering demo user and login again
        await registerUser('Demo User', 'demo@example.com', 'password123');
        const secondDemoLoginResponse = await loginUser(
          'demo@example.com',
          'password123',
          true
        ); // Pass true for isDemo
        if (!secondDemoLoginResponse.error) {
          token = secondDemoLoginResponse.loginResult.token;
        }
      } else {
        token = demoLoginResponse.loginResult.token;
      }
    }

    const url = `${ENDPOINTS.GET_STORIES}?page=${page}&size=${size}&location=${needLocation}`;
    const options = {
      headers: {}, // Start with empty headers
    };

    // Add Authorization header only if token exists (either user's or demo's)
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, options);
    const json = await response.json();

    console.log('API Response JSON:', json); // Log the entire response

    // Return both stories and pagination metadata with proper fallbacks
    if (json.listStory && Array.isArray(json.listStory)) {
      return {
        stories: json.listStory.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          photoUrl: item.photoUrl,
          createdAt: item.createdAt,
          lat: item.lat,
          lng: item.lon,
        })),
        pagination: {
          page: json.page || page,
          size: json.size || size,
          totalPages: json.totalPages || 1,
          hasMore: json.page < json.totalPages,
        },
      };
    }
    return {
      stories: [],
      pagination: { page, size, totalPages: 0, hasMore: false },
    };
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

export async function addStory(description, photoBlob, lat, lon) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoBlob);

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const token = getToken();
    const url = token ? ENDPOINTS.ADD_STORY : ENDPOINTS.ADD_STORY_GUEST;
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding story:', error);
    return { error: true, message: error.message };
  }
}

export async function getStoryDetail(id) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(ENDPOINTS.DETAIL_STORY(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (json.error) {
      throw new Error(json.message);
    }

    return json.story;
  } catch (error) {
    console.error('Error fetching story detail:', error);
    return null;
  }
}

// --- Push Notification (Web Push) ---

/**
 * Subscribe to web push notifications
 * @param {string} endpoint
 * @param {object} keys - { p256dh: string, auth: string }
 * @returns {Promise<object>}
 */
export async function subscribeWebPush({ endpoint, keys: { p256dh, auth } }) {
  const token = getToken();
  if (!token) throw new Error('Authentication required');

  const subscription = JSON.stringify({
    endpoint,
    keys: { p256dh, auth }
  })
  console.log('Web Push Subscription:', subscription);

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: subscription
  });
  return await response.json();
}

/**
 * Unsubscribe from web push notifications
 * @param {string} endpoint
 * @returns {Promise<object>}
 */
export async function unsubscribeWebPush(endpoint) {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
  return await response.json();
}
