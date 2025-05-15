
import axios from "axios";

// const base_url = "https://zuba.minidog.club/";
const base_url = "https://rchat.bhau777.com/";


// GET Request
export const FOR_GET_LIST = async (URL) => {
  try {
    const response = await axios.get(`${base_url}${URL}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return {
      status: "error",
      data: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// POST Request
export const FOR_POST_REQUEST = async (URL, sendData) => {
  try {
    const response = await axios.post(`${base_url}${URL}`, sendData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return {
      status: "error",
      data: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// DELETE Request
export const FOR_DELETE_REQUEST = async (URL, sendData) => {
  try {
    const response = await axios.delete(`${base_url}${URL}/${sendData}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return {
      status: "error",
      data: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// PATCH (UPDATE) Request
export const FOR_UPDATE_REQUEST = async (URL, sendData) => {
  try {
    const response = await axios.patch(`${base_url}${URL}`, sendData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return {
      status: "error",
      data: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// POST Request for File Upload
export const GET_UPLOAD_DOCUMENT_LINK = async (URL, sendData) => {
  try {
    const response = await axios.post(`${base_url}${URL}`, sendData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    return {
      status: "error",
      data: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};
