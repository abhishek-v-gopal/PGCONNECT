import axios from "axios";

const BASE_URL = "http://localhost:5000";



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
        const response = await axios.get(`${BASE_URL}/api/auth/user`);
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