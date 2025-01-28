import React, { useState, useEffect } from "react";
import api from "../axios";
import { Modal, Button, Form } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash, FaUndo, FaRedo, FaUpload } from "react-icons/fa";
import { toast } from 'react-toastify';

const HomeScreen = () => {
  const [images, setImages] = useState([]);
  const [savedBatches, setSavedBatches] = useState([]);
  const [bulkImages, setBulkImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [title, setTitle] = useState("");
  const user = useSelector((state) => state.auth.user?.id);

  useEffect(() => {
    fetchImages();
    fetchBatches(); 
  }, [user]);

  const fetchImages = async () => {
    try {
      const { data } = await api.get(`/users/getImage/${user}`);
      const initialImages = data.images.map((image) => ({
        ...image,
        rotate: 0,
        _id: image._id.toString(), // Ensure `_id` is a string
      }));

      console.log("Fetched images:", initialImages);
      setImages(initialImages);
    } catch (error) {
      console.error("Error fetching images:", error.message);
    }
  };


  const fetchBatches = async () => {
    try {
      const { data } = await api.get("/users/batches"); // API endpoint for fetching batches
      console.log("Fetched saved batches:", data);
      setSavedBatches(data); // Assuming `setSavedBatches` is the state setter for batches
    } catch (error) {
      console.error("Error fetching batches:", error.message);
    }
  };


  const handleDragEnd = async (result) => {
    console.log("Drag result:", result); // Debug

    if (!result.destination) return;

    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, movedImage);

    console.log("Reordered images:", reorderedImages); // Debug

    // Ensure each image has the necessary properties like filename before sending it to the backend
    reorderedImages.forEach(image => {
        if (!image.filename) {
            console.error(`Filename missing for image with ID: ${image._id}`);
        }
    });

    // Update local state
    setImages(reorderedImages);

    // Make API call to update order in the backend
    try {
        const response = await api.put("/users/reorder", { images: reorderedImages });
        console.log("Response from backend:", response.data); // Debug
    } catch (error) {
        console.error("Error saving image order:", error.message); // Debug
    }
};



  const handleBulkUpload = async () => {
    const formData = new FormData();
    const titles = [];
    bulkImages.forEach((image) => {
      formData.append("images", image.file);
      const title = image.title || image.file.name.split(".")[0];
      titles.push(title);
    });
    formData.append("titles", JSON.stringify(titles));

    try {
      const { data } = await api.post(`/users/uploadImage/${user}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages(data.images.map((image) => ({ ...image, rotate: 0 })));
      setBulkImages([]);
      fetchImages();
    } catch (error) {
      console.error("Error uploading images:", error.response?.data || error.message);
    }
  };

  const openEditModal = (image) => {
    setEditingImage(image);
    setTitle(image.title);
    setShowModal(true);
  };

  const handleEditImage = async () => {
    try {
      await api.put(`/users/editImage/${editingImage._id}`, { title });
      await fetchImages();
      setShowModal(false);
    } catch (error) {
      console.error("Error editing image:", error.message);
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await api.delete(`/users/deleteImage/${id}`);
      await fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error.message);
    }
  };

  const handleReplaceImage = async (id, file) => {
    try {
      if (!file || !file.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file.");
      }
      const formData = new FormData();
      formData.append("image", file);

      await api.put(`/users/replaceImage/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchImages();
    } catch (error) {
      console.error("Error replacing image:", error.response?.data || error.message);
    }
  };

  const handleRotateImage = async (id, direction) => {
    try {
      await api.put(`/users/rotate/${id}`, { direction });
      await fetchImages();
    } catch (error) {
      console.error("Error rotating image:", error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.post("/users/download-images",{ userId: user },{
        responseType: "blob",
      });
      await fetchImages();
      await fetchBatches();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "modified-images.zip");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading images:", error);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    try {
      const response = await api.delete(`/users/deletebatches/${batchId}`); // Correct API call
  
      if (response.status === 200) {
        toast.success('Batch deleted successfully!');
        
        // Update the UI to remove the deleted batch
        setSavedBatches((prevBatches) =>
          prevBatches.filter((batch) => batch._id !== batchId)
        );
      } else {
        const { error } = response.data; // Handle error response
        toast.error('Batch deleted successfully!');
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("An error occurred while deleting the batch.");
    }
  };
  
  return (
    
<div className="container mt-5">
  <h1
    className="text-center mb-4 fw-bold"
    style={{ color: "#2C3E50", fontSize: "32px", fontFamily: "'Poppins', sans-serif" }}
  >
    Organize and Edit Your Images
  </h1>
  <p
    className="text-center mx-auto mb-5"
    style={{
      color: "#555",
      fontSize: "16px",
      fontFamily: "'Roboto', sans-serif",
      maxWidth: "600px",
      lineHeight: "1.6",
    }}
  >
    Welcome to your personalized image management hub. 
  </p>
    <div className="row">
      {/* About Section */}
      <div className="col-md-4 mb-4">
        <div
          className="card p-4 shadow-sm"
          style={{ backgroundColor: "#F9F9F9", borderRadius: "8px" }}
        >
          <h3 className="text-primary mb-3">About StockImage</h3>
          <p style={{ fontSize: "14px", color: "#555" }}>
            Welcome to StockImage, your easy-to-use partner for managing and
            editing images. Here, you can:
          </p>
          <ul style={{ fontSize: "14px", color: "#555" }}>
            <li>Edit and rotate your images effortlessly.</li>
            <li>Save batches with customized titles.</li>
            <li>Bulk upload multiple images at once.</li>
          </ul>
          <p style={{ fontSize: "14px", color: "#555" }}>
            Get started today and streamline your image management experience!
          </p>
        </div>
      </div>
  
      {/* Bulk Upload Section */}
      <div className="col-md-8">
        <div
          className="card p-4 shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderRadius: "8px" }}
        >
          <h3 className="text-secondary mb-3">Upload Images</h3>
          <Form.Group controlId="bulkUpload">
            <Form.Label style={{ fontWeight: "bold", color: "#333" }}>
              Select Images
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) =>
                setBulkImages(
                  Array.from(e.target.files).map((file) => ({ file, title: "" }))
                )
              }
              style={{
                border: "1px solid #CCC",
                borderRadius: "4px",
                padding: "8px",
              }}
            />
          </Form.Group>
          <Button
            onClick={handleBulkUpload}
            className="mt-3"
            style={{
              backgroundColor: "#6C757D",
              color: "#FFF",
              border: "none",
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "5px",
            }}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  

   {/* Image Gallery */}
<div className="card p-4">
  <h3 className="fw-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "#2C3E50" }}>
    Your Images
  </h3>
  <DragDropContext onDragEnd={handleDragEnd}>
    {images.length > 0 && (
      <Droppable droppableId="images">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="d-flex flex-wrap gap-3 justify-content-center"
          >
            {images.map((image, index) => (
              <Draggable key={image._id} draggableId={image._id} index={index}>
                {(provided) => (
                  <div
                    className="card shadow-sm d-flex flex-column"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      width: "200px",
                      borderRadius: "8px",
                      transition: "box-shadow 0.3s ease",
                      ...provided.draggableProps.style,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)")}
                  >
                    {/* Image Section */}
                    <div style={{ padding: "10px" }}>
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${image.url}`}
                        alt={image.title || "Image"}
                        className="rounded"
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          transform: `rotate(${image.rotation}deg)`,
                        }}
                      />
                    </div>
                    {/* Title Section */}
                    <div
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        minHeight: "40px",
                        fontFamily: "'Roboto', sans-serif",
                      }}
                    >
                      <p className="fw-bold mb-0 text-truncate">{image.title}</p>
                    </div>
                    {/* Button Section */}
                    <div
                      className="mt-auto d-flex justify-content-between"
                      style={{
                        padding: "10px",
                        borderTop: "1px solid #e9ecef",
                      }}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(image)}
                        title="Edit Title"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleRotateImage(image._id, "left")}
                        title="Rotate Left"
                      >
                        <FaUndo />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleRotateImage(image._id, "right")}
                        title="Rotate Right"
                      >
                        <FaRedo />
                      </Button>
                      <label
                        title="Replace Image"
                        style={{
                          display: "inline-block",
                          margin: 0,
                          cursor: "pointer",
                        }}
                      >
                        <FaUpload style={{ cursor: "pointer", color: "#0d6efd" }} />
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => handleReplaceImage(image._id, e.target.files[0])}
                        />
                      </label>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteImage(image._id)}
                        title="Delete Image"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    )}
  </DragDropContext>

  {/* Save Changes Button */}
  <button
    onClick={handleDownload}
    className="btn btn-success mt-4"
    style={{
      padding: "8px 16px",
      fontSize: "14px",
      borderRadius: "6px",
      backgroundColor: "#28a745",
      color: "#fff",
      fontFamily: "'Roboto', sans-serif",
      fontWeight: "500",
      border: "none",
      width: "fit-content",
      alignSelf: "center",
      display: "block",
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = "#218838")}
    onMouseLeave={(e) => (e.target.style.backgroundColor = "#28a745")}
  >
    Save Changes
  </button>
</div>




{/* Previous Modifications Section */}
<div className="card p-4 mt-5">
  <h3>Previously Saved Batches</h3>
  {savedBatches.length === 0 ? (
    <p>No previous modifications found.</p>
  ) : (
    <div className="d-flex flex-wrap gap-3">
      {savedBatches.map((batch, batchIndex) => (
        <div
          key={batch._id}
          className="card shadow-sm p-3 d-flex flex-column justify-content-between"
          style={{
            borderRadius: "8px",
            minWidth: "360px",
            maxWidth: "400px",
          }}
        >
          {/* Batch Header */}
          <h5 className="text-center mb-3 fw-bold text-primary">
            Batch {batchIndex + 1}
          </h5>

          {/* Batch Images (Horizontal Scrollable) */}
          <div
            className="d-flex"
            style={{
              overflowX: "auto", // Enable horizontal scrolling for multiple images
              gap: "12px", // Space between images
            }}
          >
            {batch.images.map((image) => (
              <div
                key={image._id}
                className="card shadow-sm"
                style={{
                  width: "200px", // Set consistent width for all image cards
                  borderRadius: "8px",
                  flexShrink: 0, // Prevent shrinking when scrolling
                  overflow: "hidden", // Prevent image overflow
                }}
              >
                {/* Image Section */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "150px", // Fixed height for image container
                  }}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${image.url}`}
                    alt={image.title || "Image"}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(${image.rotation || 0}deg)`,
                      transformOrigin: "center",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain", // Prevent cropping
                    }}
                  />
                </div>

                {/* Title Section */}
                <div
                  style={{
                    padding: "6px",
                    textAlign: "center",
                    minHeight: "40px", // Ensure consistent height for titles
                  }}
                >
                  <p className="fw-semibold mb-0" style={{ fontSize: "13px" }}>
                    {image.title || "Untitled"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons Section */}
          <div
            className="d-flex justify-content-between mt-3"
            style={{ gap: "8px" }}
          >

            {/* Delete Batch Button */}
            <button
              className="btn btn-danger"
              onClick={() => handleDeleteBatch(batch._id)}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                borderRadius: "4px",
                flex: "1",
                background: "#735DA5", // Added background color
                color: "#fff", // Ensure the text remains readable
                border: "none", // Optional: Remove the default border for a cleaner look
              }}
            >
              Delete Batch
            </button>

          </div>
        </div>
      ))}
    </div>
  )}
</div>


      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="editTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditImage}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomeScreen;
