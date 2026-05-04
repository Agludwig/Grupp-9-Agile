import { useState } from "react";

function ImageUpload() {
  const [file_img, setFile_img] = useState(null);
  const [preview_url, setPreview] = useState(null);

  const handleChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    // Check that it is an image
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Save file in state
    setFile_img(selectedFile);

    // Create preview
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
  };

  const handleUpload = async () => {
    if (!file_img) {
      alert("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file_img);

    await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    alert("Upload complete");
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />

      {preview_url && (
        <div>
          <img src={preview_url} alt="preview" width="200" />
        </div>
      )}

      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
}

export default ImageUpload;