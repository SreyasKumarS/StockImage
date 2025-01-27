// import React, { useState, useEffect } from "react";
// import api from "../axios";
// import { Modal, Button, Form } from "react-bootstrap";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { useSelector } from "react-redux";
// import { FaEdit, FaTrash, FaUndo, FaRedo, FaUpload } from "react-icons/fa";

// const HomeScreen = () => {
//   const [images, setImages] = useState([]);
//   const [bulkImages, setBulkImages] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingImage, setEditingImage] = useState(null);
//   const [title, setTitle] = useState("");
//   const user = useSelector((state) => state.auth.user?.id);

//   useEffect(() => {
//     fetchImages(); 
//   }, [user]);


// const fetchImages = async () => {
//   try {
//     const { data } = await api.get(`/users/getImage/${user}`);
//     const initialImages = data.images.map((image) => ({ ...image, rotate: 0 }));
//     setImages(initialImages);
//     // setModifiedImages(initialImages); 
//   } catch (error) {
//     console.error("Error fetching images:", error.message);
//   }
// };





//   const handleBulkUpload = async () => {
//     const formData = new FormData();
//     const titles = [];
//     bulkImages.forEach((image) => {
//       formData.append("images", image.file);
//       const title = image.title || image.file.name.split(".")[0];
//       titles.push(title);
//     });
//     formData.append("titles", JSON.stringify(titles));
//     try {
//       const { data } = await api.post(`/users/uploadImage/${user}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setImages(data.images.map((image) => ({ ...image, rotate: 0 })));
//       setBulkImages([]);
//       fetchImages();
//     } catch (error) {
//       console.error("Error uploading images:", error.response?.data || error.message);
//     }
//   };

//   const handleDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reorderedImages = Array.from(images);
//     const [movedImage] = reorderedImages.splice(result.source.index, 1);
//     reorderedImages.splice(result.destination.index, 0, movedImage);
//     setImages(reorderedImages);
//     try {
//       await api.put("/api/images/reorder", { images: reorderedImages });
//     } catch (error) {
//       console.error("Error saving image order:", error.message);
//     }
//   };

//   const openEditModal = (image) => {
//     setEditingImage(image);
//     setTitle(image.title);
//     setShowModal(true);
//   };


//   const handleEditImage = async () => {
//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       const { data } = await api.put(`/users/editImage/${editingImage._id}`, formData);
//       await fetchImages(); 
//       setShowModal(false); 
//     } catch (error) {
//       console.error("Error editing image:", error.message);
//     }
//   };
  


//   const handleDeleteImage = async (id) => {
//     try {
//       const { data } = await api.delete(`/users/deleteImage/${id}`);
//       await fetchImages(); 
//     } catch (error) {
//       console.error("Error deleting image:", error.message);
//     }
//   };



//   const handleReplaceImage = async (id, file) => {
//     try {
//       if (!file || !file.type.startsWith("image/")) {
//         throw new Error("Please upload a valid image file.");
//       }
//       const formData = new FormData();
//       formData.append("image", file); // Append the single image file
  
//       // Debugging the FormData (by iterating to confirm appended values)
//       for (let pair of formData.entries()) {
//       }
  
//       const { data } = await api.put(`/users/replaceImage/${id}`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data", // Ensure multipart is set
//         },
//       });
//       await fetchImages(); // Refresh images if required
//     } catch (error) {
//       console.error("Error replacing image:", error.response?.data || error.message);
//     }
//   };
  
  
  

//   const handleRotateImage = async (id, direction) => {
//     try {
//       await api.put(`/users/rotate/${id}`, { direction });
//       await fetchImages(); 
//     } catch (error) {
//       console.error("Error rotating image:", error.message);
//     }
//   };
  


//   const handleDownload = async () => {
//     try {
//       // Send a POST request to the backend to download images
//       const response = await api.post('/users/download-images', {}, {
//         responseType: 'blob', // Important for downloading files
//       });
      
//       // Create a URL for the downloaded blob
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'modified-images.zip'); // Zip file name

//       // Append the link to the document, click it, and then remove it
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       // Revoke the object URL to release memory
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error downloading images:', error);
//     }
//   };




//   return (
//     <div className="container mt-5">
//       <h1 className="text-center mb-4">Manage Your Images</h1>

//       {/* Bulk Upload Section */}
//       <div className="card p-4 mb-4">
//         <h3>Upload Images</h3>
//         <Form.Group controlId="bulkUpload">
//           <Form.Label>Upload Images</Form.Label>
//           <Form.Control
//             type="file"
//             multiple
//             onChange={(e) =>
//               setBulkImages(
//                 Array.from(e.target.files).map((file) => ({ file, title: "" }))
//               )
//             }
//           />
//         </Form.Group>
//         <Button variant="primary" onClick={handleBulkUpload} className="mt-3">
//           Upload
//         </Button>
//       </div>

//       {/* Image Gallery */}
//       <div className="card p-4">
//         <h3>Your Images</h3>
//         <DragDropContext onDragEnd={handleDragEnd}>
//   <Droppable droppableId="images">
//     {(provided) => (
//       <div
//         {...provided.droppableProps}
//         ref={provided.innerRef}
//         className="d-flex flex-wrap gap-3 justify-content-center"
//       >
//         {images.map((image, index) => (
//           <Draggable key={image._id} draggableId={image._id} index={index}>
//             {(provided) => (
//               <div
//                 className="card shadow-sm d-flex flex-column"
//                 ref={provided.innerRef}
//                 {...provided.draggableProps}
//                 {...provided.dragHandleProps}
//                 style={{
//                   width: "200px",
//                   borderRadius: "8px",
//                   ...provided.draggableProps.style,
//                 }}
//               >
//                 {/* Image Section */}
//                 <div style={{ padding: "10px" }}>
//                   <img
//                     src={`${import.meta.env.VITE_BACKEND_URL}${image.url}`}
//                     alt={image.title || "Image"}
//                     className="rounded"
//                     style={{
//                       width: "100%",
//                       height: "150px",
//                       objectFit: "cover",
//                       transform: `rotate(${image.rotation}deg)`,
//                     }}
//                   />
//                 </div>

//                 {/* Title Section */}
//                 <div
//                   style={{
//                     padding: "10px",
//                     textAlign: "center",
//                     minHeight: "40px",
//                   }}
//                 >
//                   <p className="fw-bold mb-0">{image.title}</p>
//                 </div>

//                 {/* Button Section */}
//                 <div
//                   className="mt-auto d-flex justify-content-between"
//                   style={{
//                     padding: "10px",
//                     borderTop: "1px solid #e9ecef",
//                   }}
//                 >
//                   <Button
//                     variant="outline-primary"
//                     size="sm"
//                     onClick={() => openEditModal(image)}
//                   >
//                     <FaEdit />
//                   </Button>
//                   <Button
//                     variant="outline-warning"
//                     size="sm"
//                     onClick={() => handleRotateImage(image._id, "left")}
//                   >
//                     <FaUndo />
//                   </Button>
//                   <Button
//                     variant="outline-warning"
//                     size="sm"
//                     onClick={() => handleRotateImage(image._id, "right")}
//                   >
//                     <FaRedo />
//                   </Button>


                  
//                   <label>
//                     <FaUpload
//                       style={{ cursor: "pointer", color: "#0d6efd" }}
//                     />
//                  <input
//                       type="file"
//                       style={{ display: "none" }}
//                       onChange={(e) => {
//                         handleReplaceImage(image._id, e.target.files[0]);
//                       }}
//                     />
//                   </label>




//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => handleDeleteImage(image._id)}
//                   >
//                     <FaTrash />
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </Draggable>
//         ))}
//         {provided.placeholder}
//       </div>
//     )}
//   </Droppable>
// </DragDropContext>

// <button
//   onClick={handleDownload}  // Call the handleDownload function correctly
//   className="btn btn-primary"
//   style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '5px' }}
// >
//   Save Changes
// </button>


//       </div>

//       {/* Edit Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Image</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group controlId="editTitle">
//             <Form.Label>Title</Form.Label>
//             <Form.Control
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleEditImage}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default HomeScreen;






import React, { useState, useEffect } from "react";
import api from "../axios";
import { Modal, Button, Form } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash, FaUndo, FaRedo, FaUpload } from "react-icons/fa";

const HomeScreen = () => {
  const [images, setImages] = useState([]);
  const [bulkImages, setBulkImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [title, setTitle] = useState("");
  const user = useSelector((state) => state.auth.user?.id);

  useEffect(() => {
    fetchImages();
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
      const response = await api.post("/users/download-images", {}, {
        responseType: "blob",
      });

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

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Manage Your Images</h1>

      {/* Bulk Upload Section */}
      <div className="card p-4 mb-4">
        <h3>Upload Images</h3>
        <Form.Group controlId="bulkUpload">
          <Form.Label>Upload Images</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={(e) =>
              setBulkImages(
                Array.from(e.target.files).map((file) => ({ file, title: "" }))
              )
            }
          />
        </Form.Group>
        <Button variant="primary" onClick={handleBulkUpload} className="mt-3">
          Upload
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="card p-4">
        <h3>Your Images</h3>




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
                    ...provided.draggableProps.style,
                  }}
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
                    }}
                  >
                    <p className="fw-bold mb-0">{image.title}</p>
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
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleRotateImage(image._id, "left")}
                    >
                      <FaUndo />
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleRotateImage(image._id, "right")}
                    >
                      <FaRedo />
                    </Button>
                    <label>
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



        <button
          onClick={handleDownload}
          className="btn btn-primary"
          style={{ padding: "10px 20px", fontSize: "16px", borderRadius: "5px" }}
        >
          Save Changes
        </button>
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
