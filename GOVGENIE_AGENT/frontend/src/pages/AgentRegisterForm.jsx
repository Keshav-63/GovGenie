
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  FileText,
  Award,
  Camera,
  Upload,
  CheckCircle,
  Loader,
  InfoIcon
} from "lucide-react";

const AgentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
    ipAddress: "",
    aboutUs: "",
  });

  const [files, setFiles] = useState({
    aadharCard: null,
    panCard: null,
    govCertificate: null,
    profilePhoto: null,
  });

  const [filePreview, setFilePreview] = useState({
    aadharCard: null,
    panCard: null,
    govCertificate: null,
    profilePhoto: null,
  });

  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formComplete, setFormComplete] = useState({
    personal: false,
    documents: false,
  });

  // Fetch Live Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => console.error("Error fetching location:", error)
    );
  }, []);

  // Fetch Public IP Address
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/ip-address/get-ip"
        );
        console.log("Fetched IP:", response.data.ip);
        setFormData((prev) => ({ ...prev, ipAddress: response.data.ip }));
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };
    fetchIP();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: files[0] }));

     
      const previewUrl = URL.createObjectURL(files[0]);
      setFilePreview((prev) => ({ ...prev, [name]: previewUrl }));
    }
  };

  const validatePersonalInfo = () => {
    const { firstName, lastName, phone, address } = formData;
    const isValid = firstName && lastName && phone && address;
    setFormComplete((prev) => ({ ...prev, personal: isValid }));
    if (isValid) setFormStep(2);
  };

  const validateDocuments = () => {
    const { aadharCard, panCard, profilePhoto } = files;
    const isValid = aadharCard && panCard && profilePhoto;
    setFormComplete((prev) => ({ ...prev, documents: isValid }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDocuments()) {
      alert("Please upload all required documents");
      return;
    }

    const token = localStorage.getItem("authToken");
    console.log("Token in localStorage:", token);

    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    Object.keys(files).forEach((key) => {
      if (files[key] && typeof files[key] === "object") {
        data.append(key, files[key]);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/agents/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Registration Successful:", response.data);
      alert("Registration successful! Redirecting...");
      navigate("/verifyipv");
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      alert(
        "Error registering agent: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="w-full max-w-4xl p-8 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-500 p-2 rounded-full mr-3">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Agent Registration</h2>
        </div>

     
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center w-full max-w-xs">
            <div
              className={`flex flex-col items-center ${
                formStep >= 1 ? "text-blue-400" : "text-slate-600"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  formStep >= 1
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-slate-600"
                }`}
              >
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Personal</span>
            </div>
            <div
              className={`flex-1 h-0.5 ${
                formStep >= 2 ? "bg-blue-400" : "bg-slate-600"
              }`}
            ></div>
            <div
              className={`flex flex-col items-center ${
                formStep >= 2 ? "text-blue-400" : "text-slate-600"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  formStep >= 2
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-slate-600"
                }`}
              >
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Documents</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg text-white placeholder-slate-400 outline-none transition-colors duration-200"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg text-white placeholder-slate-400 outline-none transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg text-white placeholder-slate-400 outline-none transition-colors duration-200"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg text-white placeholder-slate-400 outline-none transition-colors duration-200"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <InfoIcon className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  name="aboutUs"
                  placeholder="About Us"
                  value={formData.aboutUs}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg text-white placeholder-slate-400 outline-none transition-colors duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    placeholder="Latitude (Auto-filled)"
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    placeholder="Longitude (Auto-filled)"
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  placeholder="IP Address (Auto-filled)"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 outline-none cursor-not-allowed"
                />
              </div>

              <button
                type="button"
                onClick={validatePersonalInfo}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg transition duration-200 font-medium"
              >
                Continue to Documents
              </button>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">
                Document Upload
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      Aadhar Card <span className="text-blue-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="aadharCard"
                        accept=".pdf, .jpg, .png"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                        id="aadharCard"
                      />
                      <label
                        htmlFor="aadharCard"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          filePreview.aadharCard
                            ? "border-green-500 bg-green-500/10"
                            : "border-slate-500 hover:border-blue-500 bg-slate-800 hover:bg-slate-700"
                        } transition-colors duration-200`}
                      >
                        {filePreview.aadharCard ? (
                          <div className="relative w-full h-full">
                            <img
                              src={filePreview.aadharCard || "/placeholder.svg"}
                              alt="Aadhar Preview"
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-400 mb-2" />
                            <p className="text-sm text-slate-300">
                              Click to upload Aadhar Card
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      PAN Card <span className="text-blue-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="panCard"
                        accept=".pdf, .jpg, .png"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                        id="panCard"
                      />
                      <label
                        htmlFor="panCard"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          filePreview.panCard
                            ? "border-green-500 bg-green-500/10"
                            : "border-slate-500 hover:border-blue-500 bg-slate-800 hover:bg-slate-700"
                        } transition-colors duration-200`}
                      >
                        {filePreview.panCard ? (
                          <div className="relative w-full h-full">
                            <img
                              src={filePreview.panCard || "/placeholder.svg"}
                              alt="PAN Preview"
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-400 mb-2" />
                            <p className="text-sm text-slate-300">
                              Click to upload PAN Card
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Award className="h-4 w-4 text-blue-400" />
                      Government Certificate
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="govCertificate"
                        accept=".pdf, .jpg, .png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="govCertificate"
                      />
                      <label
                        htmlFor="govCertificate"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          filePreview.govCertificate
                            ? "border-green-500 bg-green-500/10"
                            : "border-slate-500 hover:border-blue-500 bg-slate-800 hover:bg-slate-700"
                        } transition-colors duration-200`}
                      >
                        {filePreview.govCertificate ? (
                          <div className="relative w-full h-full">
                            <img
                              src={
                                filePreview.govCertificate || "/placeholder.svg"
                              }
                              alt="Certificate Preview"
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-400 mb-2" />
                            <p className="text-sm text-slate-300">
                              Click to upload Certificate (Optional)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Camera className="h-4 w-4 text-blue-400" />
                      Profile Photo <span className="text-blue-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="profilePhoto"
                        accept=".jpg, .png"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                        id="profilePhoto"
                      />
                      <label
                        htmlFor="profilePhoto"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          filePreview.profilePhoto
                            ? "border-green-500 bg-green-500/10"
                            : "border-slate-500 hover:border-blue-500 bg-slate-800 hover:bg-slate-700"
                        } transition-colors duration-200`}
                      >
                        {filePreview.profilePhoto ? (
                          <div className="relative w-full h-full">
                            <img
                              src={
                                filePreview.profilePhoto || "/placeholder.svg"
                              }
                              alt="Profile Preview"
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-400 mb-2" />
                            <p className="text-sm text-slate-300">
                              Click to upload Profile Photo
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="w-1/3 py-3 bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg text-white transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg shadow-lg transition duration-200 font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Register Now</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

     
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AgentRegister;

