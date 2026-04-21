  const API_URL =` ${import.meta.env.VITE_API_URL}/consumers`;

  /* =================================
    Helper: Get Auth Header
  =================================*/
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };


  /* =================================
    /* =================================
   CREATE CONSUMER (Admin)
=================================*/
export const createConsumer = async (data: {
  name: string;
  mobile: string;        // ✅ REQUIRED
  email?: string;
  locationId?: string;
  meterId?: string;
  serialNumber?: string;
  blockId?: string;
}) => {
  const cleanData = {
    ...data,
    mobile: data.mobile.trim(), // ✅ prevent space issues 
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(cleanData),
  });

  return response.json();
};
  /* =================================
    GET ALL CONSUMERS (Admin)
  =================================*/
  export const getConsumers = async () => {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeader(),
    });

    return response.json();
    
  };


  /* =================================
    UPDATE CONSUMER (Admin)
  =================================*/
export const updateConsumer = async (
  id: string,
  data: any
) => {
  const cleanData = {
    ...data,
    mobile: data.mobile?.trim(),
  };

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(cleanData),
  });

  return response.json();
};


  /* =================================
    DELETE CONSUMER (Admin)
  =================================*/
  export const deleteConsumer = async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    return response.json();
  };

