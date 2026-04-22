const API_URL = `${import.meta.env.VITE_API_URL}/consumers`;

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
export const createConsumer = async (data: any) => {
  const cleanData = {
    ...data,
    mobile: data.mobile.trim(),
    ...(data.email ? { email: data.email } : {}),
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(cleanData),
  });

  const result = await response.json();

  // 🔥 THIS IS IMPORTANT
  if (!response.ok) {
    console.error("❌ Backend Error:", result); // see full error in console
    throw new Error(result.message || "Something went wrong");
  }

  return result;
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

