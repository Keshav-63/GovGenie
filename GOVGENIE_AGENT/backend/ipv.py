import os
import cv2
import face_recognition
import numpy as np
import base64
import io
import random
import easyocr
import cloudinary
import requests
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import (Image, UnidentifiedImageError)
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

reader = easyocr.Reader(['en'])


load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["govgenie"]
agents_collection = db["agentinfos"]
users_collection = db["users"]

# ----------------------------
# Endpoint: Get Aadhar Image
# ----------------------------
@app.route("/get-aadhar/<agent_id>", methods=["GET"])
def get_aadhar(agent_id):
    try:
        agent = agents_collection.find_one({"agentId": ObjectId(agent_id)})
        print(agent)
        if not agent or "aadharCard" not in agent:
            return jsonify({"message": "Aadhar image not found!"}), 404

        return jsonify({"aadharImage": agent["aadharCard"]})
    except Exception as e:
        return jsonify({"message": f"Error fetching Aadhar image: {e}"}), 500

# ----------------------------
# Endpoint: Generate OTP
# ----------------------------
@app.route("/generate-otp", methods=["POST"])

def generate_otp():
    data = request.json
    if not data or "agentId" not in data: 
        return jsonify({"message": "Agent ID is required"}), 400

    try:
        agent_id = ObjectId(data["agentId"])  # Ensure it's a valid ObjectId
        otp = "".join(random.choices("0123456789", k=4))
        agents_collection.update_one({"agentId": agent_id}, {"$set": {"ipvOtp": otp}}, upsert=True)
        return jsonify({"otp": otp})
    except Exception as e:
        return jsonify({"message": f"Error generating OTP: {e}"}), 500


def decode_base64_image(data):
    """Decodes Base64 image data into a PIL Image object."""
    try:
        print("🖼 Decoding Base64 image...")
        

        if not data.startswith("data:image"):
            raise ValueError("❌ Image data is not in correct format!")


        encoded = data.split(",")[-1]
        decoded = base64.b64decode(encoded)


        with open("debug_live_image.jpg", "wb") as f:
            f.write(decoded)
        print("✅ Saved debug image as debug_live_image.jpg!")


        image = Image.open(io.BytesIO(decoded)).convert("RGB")
        print("✅ Image successfully decoded!")
        return image

    except Exception as e:
        print(f"❌ Failed to decode image: {e}")
        raise ValueError(f"Unsupported image format: {e}")


@app.route("/verify_live", methods=["POST"])
def verify_live():
    try:
        print("✅ Received request at /verify_live")

        data = request.json
        print("📝 Data received:", data) 

        if not data or "image" not in data or "agentId" not in data:
            print("❌ Missing required data!")
            return jsonify({"message": "Missing required data!"}), 400

        agent_id = data["agentId"]
        print(f"🔍 Searching for agent with ID: {agent_id}")


        agent = agents_collection.find_one({"agentId": ObjectId(agent_id)})
        if not agent or "aadharCard" not in agent:
            print("❌ Aadhar image not found in database!")
            return jsonify({"message": "Aadhar image not found!"}), 404


        aadhar_url = agent["aadharCard"]
        print(f"🌐 Fetching Aadhar image from Cloudinary: {aadhar_url}")

        response = requests.get(aadhar_url, stream=True)
        if response.status_code != 200:
            print(f"❌ Failed to download Aadhar image! HTTP {response.status_code}")
            return jsonify({"message": "Failed to download Aadhar image!"}), 500

 
        aadhar_path = os.path.join(UPLOAD_FOLDER, f"aadhar_{agent_id}.jpg")
        with open(aadhar_path, "wb") as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        print(f"✅ Aadhar image saved at {aadhar_path}")

      
        live_image = decode_base64_image(data["image"])

     
        live_path = os.path.join(UPLOAD_FOLDER, f"live_{agent_id}.jpg")
        live_image.save(live_path, format="JPEG")

        print("🕵️‍♂️ Performing face verification...")
        face_match, face_error = verify_face(aadhar_path, live_path)

        if face_error:
            print(f"❌ {face_error}")
            return jsonify({"message": face_error}), 400

        print("🔍 Extracting handwritten code via OCR...")
        extracted_code = extract_handwritten_code(live_path)
        stored_otp = agent.get("ipvOtp")

        if extracted_code == stored_otp:
            print("✅ Verification successful!")
        
            agents_collection.update_one({"agentId": ObjectId(agent_id)}, {"$set": {"isIPV_Verified": True}})

            users_collection.update_one(
                {"_id": ObjectId(agent_id)}, {"$set": {"isAccountVerified": True}}
            )
            return jsonify({"message": "Verification successful!", "extracted_code": extracted_code}), 200
        else:
            print(f"❌ Handwritten code mismatch! Extracted: {extracted_code}, Expected: {stored_otp}")
            return jsonify({
                "message": f"You have written {extracted_code}, write generated OTP {stored_otp}",
                "extracted_code": extracted_code,
                "generated_otp": stored_otp
            }), 400

    except Exception as e:
        print(f"❌ Server error: {e}") 
        return jsonify({"message": f"Server error: {e}"}), 500



def verify_face(aadhar_image_path, live_image_path):
    try:
        uploaded_img = face_recognition.load_image_file(aadhar_image_path)
        live_img = face_recognition.load_image_file(live_image_path)

        uploaded_encoding = face_recognition.face_encodings(uploaded_img)
        live_encoding = face_recognition.face_encodings(live_img)

        if not uploaded_encoding:
            print("❌ No face found in Aadhar image")
            return False, "No face found in Aadhar image. Please upload a clear Aadhar image."
        
        if not live_encoding:
            print("❌ No face found in Live image")
            return False, "No face found in Live image. Please try again with a clear face."

        match_result = face_recognition.compare_faces([uploaded_encoding[0]], live_encoding[0])[0]
        
        return match_result, None  

    except Exception as e:
        print(f"❌ Face verification error: {e}")
        return False, f"Face verification error: {str(e)}"



# ----------------------------
# Helper: Extract Handwritten Code via OCR
# ----------------------------
def extract_handwritten_code(image_path):
    try:
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        _, img_thresh = cv2.threshold(img, 100, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        results = reader.readtext(img_thresh)
        return "".join(filter(str.isdigit, "".join([text[1] for text in results])))
    except:
        return ""

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
