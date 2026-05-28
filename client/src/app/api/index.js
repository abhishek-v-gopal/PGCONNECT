import axios from "axios";

const BASE_URL = "http://localhost:5000";

// send cookies (session) for authorized endpoints
axios.defaults.withCredentials = true;

const getCookieValue = (name) => {
    if (typeof document === "undefined") return "";
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const item of cookies) {
        const [k, ...rest] = item.trim().split("=");
        if (k === name) return decodeURIComponent(rest.join("="));
    }
    return "";
};

const getAuthHeaders = () => {
    const token =
        getCookieValue("token") ||
        getCookieValue("authToken") ||
        getCookieValue("jwt") ||
        "";

    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAuthConfig = () => ({
    withCredentials: true,
    headers: getAuthHeaders(),
});



//login
export const userLogin = async (userData) => {
    try {
        const url = `${BASE_URL}/api/auth/login`;
        console.log('[DEBUG] Login attempt:', { url, userData });
        
        const response = await axios.post(url, userData);
        console.log('Login successful:', response.data);
        return response.data;

    } catch (error) {
        console.error('[DEBUG] Login failed - Full error:', {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
            config: { url: error?.config?.url, method: error?.config?.method }
        });
        throw error;
    }
}
//register
export const userRegister = async (userData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
        console.log('Registration successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error during registration:', error);
        throw error;
    }
}
//logout
export const logout = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/logout`);
        console.log('Logout successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
}   
//get current user
export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/auth/me`);
        console.log('Current user:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
}
//update password
export const updatePassword = async (passwordData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/update-password`, passwordData);
        console.log('Password update successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
}

export const getAllProperties = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/properties`);
        console.log('All properties:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching properties:', error);
        throw error;
    }
}

export const getPropertyById = async (propertyId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/properties/${propertyId}`);
        console.log(`Property ${propertyId}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching property ${propertyId}:`, error);
        throw error;
    }   
}

export const saveProperty = async (propertyId) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/users/save/${propertyId}`, {}, getAuthConfig());
        console.log('[DEBUG] saveProperty response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[DEBUG] Error saving property:', error);
        throw error;
    }
}

export const createInquiry = async (inquiryData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/inquiries`, inquiryData, getAuthConfig());
        console.log('[DEBUG] createInquiry response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[DEBUG] Error creating inquiry:', error);
        throw error;
    }
}

export const getOwnerInquiries = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/inquiries/owner`, getAuthConfig());
        console.log('[DEBUG] getOwnerInquiries response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[DEBUG] Error fetching owner inquiries:', error);
        throw error;
    }
}