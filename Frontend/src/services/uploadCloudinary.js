export const uploadToCloudinary = async (file) => {
  if (!file) {
    console.error("Không có file nào được chọn để upload.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ecareproject"); // ✅ Thay bằng preset thật của bạn

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/ding6o1pz/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error("Upload thành công nhưng không có secure_url:", data);
      return null;
    }

  } catch (error) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
    return null;
  }
};

// Upload nhiều ảnh lên cloudinary
export const uploadMultipleImagesToCloudinary = async (files) => {
  if (!files || files.length === 0) {
    // console.error("Không có file nào được chọn để upload.");
    return [];
  }

  const uploadPromises = files.map(file => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecareproject");

    return fetch("https://api.cloudinary.com/v1_1/ding6o1pz/image/upload", {
      method: "POST",
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
      return res.json();
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    // Lọc các kết quả có secure_url
    return results
      .filter(data => data.secure_url)
      .map(data => data.secure_url);
  } catch (error) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
    return [];
  }
};
export const uploadMultipleFilesToCloudinary = async (files) => {
  if (!files || files.length === 0) {
    // console.error("Không có file nào được chọn để upload.");
    return [];
  }

  const endpoint = "https://api.cloudinary.com/v1_1/ding6o1pz/raw/upload";
  const uploadPreset = "ecareproject";

  const uploadPromises = files.map((file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    return fetch(endpoint, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
      return res.json();
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    return results
      .filter((data) => data.secure_url)
      .map((data) => data.secure_url);
  } catch (error) {
    console.error("Lỗi khi upload file lên Cloudinary:", error);
    return [];
  }
};
