import axios from 'axios';

const API_URL = "http://localhost:8080/api/notifications";

// Token'ı localStorage'dan alıp Header'a ekler
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { headers: { Authorization: `Bearer ${user.token}` } };
    }
    return {};
};

export const notificationService = {
    // Tüm bildirimleri çek
    getAll: async () => {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    },

    // Hepsini okundu yap
    markAllRead: async () => {
        await axios.put(`${API_URL}/mark-all-read`, {}, getAuthHeader());
    },

    // Tek bir bildirimi sil
    delete: async (id) => {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    },

    // Tümünü temizle
    deleteAll: async () => {
        await axios.delete(`${API_URL}/delete-all`, getAuthHeader());
    }
};