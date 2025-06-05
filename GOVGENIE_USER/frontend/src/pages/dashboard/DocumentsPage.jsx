"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.0.375/+esm`;
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useNotification } from "../../context/NotificationContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";

const getFileIcon = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();
  switch (extension) {
    case "pdf":
      return "pdf"; 
    case "doc":
    case "docx":
      return "📝"; 
    case "jpg":
    case "jpeg":
    case "png":
      return "🖼️";
    case "xls":
    case "xlsx":
      return "📊"; 
    default:
      return "📁"; 
  }
};

const DocumentsPage = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [documentType, setDocumentType] = useState("identity");
  const [isProtected, setIsProtected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const fileInputRef = useRef(null);
  const { addNotification } = useNotification();
const [fileSizes, setFileSizes] = useState({});
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get("http://localhost:5001/api/doc/list", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setDocuments(data);
      console.log("fetch document data", data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      addNotification({
        type: "error",
        message: "Failed to load documents. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !password) {
      toast.error("Please select a file and enter a password.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
     
      toast.error("File size should be less than 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    formData.append("filename", file.name); 
    
    for (let [key, value] of formData.entries()) {
      if (key === "file") {
        console.log(`${key}: ${value.name}`); 
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    setUploadLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://localhost:5001/api/doc/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document uploaded successfully!");
      fetchDocuments(); 
      setPassword("");
      setFile(null);
      addNotification({
              type: "success",
              message: "Document uploaded successfully.",
      });
    } catch (error) {
      toast.error("Failed to upload document.");
      console.error("Error uploading document:", error);
            addNotification({
              type: "error",
              message: "Failed to upload document. Please try again.",
            });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:5001/api/doc/delete/${id}`, {
        Authorization: `Bearer ${token}`,
      });
      toast.success("Document deleted successfully!");
      fetchDocuments(); 
      setDocuments(documents.filter((doc) => doc.id !== id));
      addNotification({
        type: "success",
        message: "Document deleted successfully.",
      });
    } catch (error) {
      toast.error("Failed to delete document");
      console.error("Error deleting document:", error);
      addNotification({
        type: "error",
        message: "Failed to delete document. Please try again.",
      });
    }
  };

  const handleViewDocument = async (id) => {
    setSelectedDocument(id);
    setShowViewModal(true);
    const enteredPassword = prompt("Enter the document password:");
    if (!enteredPassword) return;

    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        "http://localhost:5001/api/doc/view",
        { id, password: enteredPassword },
        { headers: { Authorization: token } }
      );

      setViewingDoc(data.url); // Show the document
    } catch (error) {
          setSelectedDocument(null);
          setShowViewModal(false);
      toast.error(error.response?.data?.error || "Failed to view document");
            addNotification({
              type: "error",
              message: "Incorrect password.",
            });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

function PdfPreview({ fileUrl }) {
  return (
   
      <Document file={{ url: fileUrl, crossOrigin: "anonymous" }}>
        <Page pageNumber={1} width={200} />
      </Document>

  );
}



async function getFileSizeFromUrl(fileUrl) {
  try {
    const response = await fetch(fileUrl, { method: "HEAD" });
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : "Unknown size";
  } catch (error) {
    console.error("Error fetching file size:", error);
    return "Error fetching size";
  }
}

useEffect(() => {
  const fetchFileSizes = async () => {
    const sizes = {};
    for (const doc of documents) {
      sizes[doc._id] = await getFileSizeFromUrl(doc.url);
    }
    setFileSizes(sizes);
  };

  if (documents.length > 0) fetchFileSizes();
}, [documents]);
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename
      ? doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Document Vault
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Securely store and manage your important documents
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Search Documents
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="input pl-10"
                placeholder="Search by document name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </Card>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading documents...
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No documents found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document._id}>
              <div className="flex flex-col h-full">
                {getFileIcon(document.filename) === "pdf" && (
                  <PdfPreview fileUrl={document.url} />
                )}
                <img
                  src={document.url || getFileIcon(document.filename)}
                  alt={getFileIcon(document.filename)}
                  className="rounded-md object-cover h-32 w-full mb-4 blur-sm"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {document.filename}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  Uploaded: {formatDate(document.createdAt)}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Size:{" "}
                  {formatFileSize(fileSizes[document._id]) || "Loading..."}
                </p>
                <div className="flex justify-between mt-auto">
                  <Button
                    onClick={() => handleViewDocument(document)}
                    size="small"
                    className="py-1 px-2"
                  >
                    View
                  </Button>
                  <div className="flex gap-2">
                  
                    <Button
                      onClick={() => handleDelete(document._id)}
                      size="small"
                      className="bg-red-700 py-1 px-2"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed  items-center inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upload Document
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Select a document to upload to the vault.
                </p>
              </div>
              <div className="mt-4">
                <input
                  className="input w-2/3 text-center border border-gray-300 focus:border-blue-500"
                  type="password"
                  value={password}
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <input
                  className="input m-3 w-3/4 text-center border border-gray-300 focus:border-blue-500"
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <br />
                <Button onClick={handleUpload}>Upload</Button>
              </div>
              <div className="items-center px-4 py-3">
                <Button color="gray" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
              </div>
              {uploadLoading && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-full h-full shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {selectedDocument.filename}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Document Type: {selectedDocument.filename}
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded: {formatDate(selectedDocument.createdAt)}
                </p>
                <p className="text-sm text-gray-500">
                  Size: {fileSizes[document._id] || "Loading..."}
                </p>
                <div className="relative w-full h-96 overflow-hidden">
                  <iframe
                    src={viewingDoc}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                    style={{ border: "none" }}
                  ></iframe>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <Button onClick={() => setShowViewModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
