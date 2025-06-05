
"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Info,
  RefreshCw,
  Shield,
  Loader,
} from "lucide-react";

const VerifyAgent = () => {
  const [agentId, setAgentId] = useState(null);
  const [aadharImage, setAadharImage] = useState(null);
  const [otp, setOtp] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedCode, setExtractedCode] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [step, setStep] = useState(1); // Track verification steps
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setMessage("Authentication token is missing. Please log in again.");
      return;
    }
    const decodedToken = parseJwt(storedToken);
    if (decodedToken?.userId) {
      setAgentId(decodedToken.userId);
    } else {
      setMessage("Invalid session. Please log in again.");
    }
  }, []);

  useEffect(() => {
    if (!agentId) return;
    axios
      .get(`http://127.0.0.1:5001/get-aadhar/${agentId}`)
      .then((res) => {
        setAadharImage(res.data.aadharImage || "");
      })
      .catch(() => {
        setMessage("Failed to fetch Aadhar image.");
      });
  }, [agentId]);

  useEffect(() => {
    if (!agentId || otp) return;
    axios
      .post(
        `http://127.0.0.1:5001/generate-otp`,
        { agentId },
        { withCredentials: true }
      )
      .then((res) => {
        setOtp(res.data.otp || "");
      })
      .catch(() => {
        setMessage("OTP generation failed.");
      });
  }, [agentId, otp]);

  const captureImage = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc || !imageSrc.startsWith("data:image")) return;
    setCapturedImage(imageSrc);
    setStep(2);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setStep(1);
    setMessage("");
    setExtractedCode(null);
  };

  const verifyAgent = async () => {
    if (!capturedImage) {
      setMessage("Please capture an image first!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/verify_live",
        {
          agentId,
          image: capturedImage,
          verification_code: otp,
        },
        { withCredentials: true }
      );

      setMessage(response.data.message);
      setExtractedCode(response.data.extracted_code || "No code extracted.");

      if (response.data.message === "Verification successful!") {
        setVerificationSuccess(true);
        setStep(3); 
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Verification failed. Try again."
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white">
      {/* Header with blue accent */}
      <header className="w-full bg-slate-800 py-6 px-4 mb-8 border-b border-slate-700">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              In-Person Verification
            </h1>
          </div>
          <p className="text-slate-300 max-w-2xl text-center">
            This verification ensures the security of our platform. Please
            follow the steps below to complete your identity verification.
          </p>

     
          <div className="flex items-center justify-center mt-6 w-full max-w-md">
            <div
              className={`flex flex-col items-center ${
                step >= 1 ? "text-blue-400" : "text-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= 1
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-slate-600"
                }`}
              >
                <Camera className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Capture</span>
            </div>
            <div
              className={`w-16 h-0.5 ${
                step >= 2 ? "bg-blue-400" : "bg-slate-600"
              }`}
            ></div>
            <div
              className={`flex flex-col items-center ${
                step >= 2 ? "text-blue-400" : "text-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= 2
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-slate-600"
                }`}
              >
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Verify</span>
            </div>
            <div
              className={`w-16 h-0.5 ${
                step >= 3 ? "bg-blue-400" : "bg-slate-600"
              }`}
            ></div>
            <div
              className={`flex flex-col items-center ${
                step >= 3 ? "text-blue-400" : "text-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= 3
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-slate-600"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Complete</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 pb-16">
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
          <div className="flex flex-col">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl mb-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Verification Instructions
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-slate-300">
                <li>
                  Write the verification code shown below on a piece of paper
                </li>
                <li>Hold the paper next to your face</li>
                <li>Ensure both your face and the code are clearly visible</li>
                <li>Capture the image and verify</li>
              </ol>
            </div>

            {aadharImage && otp && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex flex-col items-center">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Write this code on paper:
                  </h3>
                  <div className="bg-slate-900 rounded-lg py-3 px-8 mb-6 border border-slate-700">
                    <p className="text-5xl font-bold tracking-wider text-blue-500">
                      {otp}
                    </p>
                  </div>

                  <div className="relative">
                    <img
                      src={aadharImage || "/placeholder.svg"}
                      alt="Aadhar"
                      className="rounded-lg border-2 border-slate-600 shadow-lg max-w-full h-auto"
                    />
                    <div className="absolute -top-2 -right-2 bg-slate-900 text-xs px-2 py-1 rounded-md border border-slate-700">
                      Your ID Card
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        
          <div className="flex flex-col">
            {step === 1 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl mb-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Capture Your Image
                </h2>
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-md mx-auto mb-4">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="rounded-lg border-2 border-slate-600 shadow-lg w-full h-auto aspect-video object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-red-500 h-3 w-3 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-slate-300 text-sm mb-4 text-center">
                    Make sure your face and the verification code are clearly
                    visible in the frame
                  </p>
                  <button
                    onClick={captureImage}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg transition duration-200 font-medium"
                  >
                    <Camera className="h-5 w-5" />
                    Capture Image
                  </button>
                </div>
              </div>
            )}

            {step >= 2 && capturedImage && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Captured Image
                  </h2>
                  {!verificationSuccess && (
                    <button
                      onClick={resetCapture}
                      className="text-sm text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retake
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-md mx-auto mb-4">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured"
                      className="rounded-lg border-2 border-slate-600 shadow-lg w-full h-auto"
                    />
                    {verificationSuccess && (
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white p-1 rounded-full border-2 border-slate-800">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verify Identity
                </h2>
                <div className="flex flex-col items-center">
                  <p className="text-slate-300 text-sm mb-4 text-center">
                    Click verify to confirm your identity with the captured
                    image and verification code
                  </p>
                  <button
                    onClick={verifyAgent}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg shadow-lg transition duration-200 font-medium w-full justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        Verify Identity
                      </>
                    )}
                  </button>

                  {message && (
                    <div
                      className={`mt-4 p-4 rounded-lg w-full text-center ${
                        verificationSuccess
                          ? "bg-green-500/20 border border-green-500/50"
                          : "bg-red-500/20 border border-red-500/50"
                      }`}
                    >
                      <p className="font-medium">{message}</p>
                      {extractedCode && (
                        <p className="text-sm mt-1">
                          Extracted Code:{" "}
                          <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">
                            {extractedCode}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && verificationSuccess && (
              <div className="bg-slate-800 rounded-xl p-6 border border-green-500/30 shadow-xl">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-500/20 p-4 rounded-full mb-4">
                    <CheckCircle className="h-16 w-16 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white">
                    Verification Successful!
                  </h2>
                  <p className="text-slate-300 mb-6">
                    Your identity has been verified successfully. You can now
                    proceed to the dashboard.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg transition duration-200 font-medium"
                  >
                    Continue to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyAgent;

