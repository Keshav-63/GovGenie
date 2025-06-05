import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
const RoomPage = () => {
  const { orderId } = useParams(); 
  const { user } = useAuthStore();

  const Meeting = async () => {
    const appID = YOUR_APP_ID; // Replace with your Zego App ID
    const serverSecret = "YOUR_SERVER_SECRET"; 
    const roomID = orderId; 
    const userID = user._id; 
    const userName = user.name; 

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const element = document.getElementById("zego-container");
    const govZc = ZegoUIKitPrebuilt.create(kitToken);
    govZc.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "Copy Link",
          url: `${window.location.origin}/room/${orderId}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: true,
      videoResolutionList: [
        ZegoUIKitPrebuilt.VideoResolution_360P,
        ZegoUIKitPrebuilt.VideoResolution_180P,
        ZegoUIKitPrebuilt.VideoResolution_480P,
        ZegoUIKitPrebuilt.VideoResolution_720P,
      ],
      videoResolutionDefault: ZegoUIKitPrebuilt.VideoResolution_720P,
    });
  };
  useEffect(() => {
    Meeting();
  }, []);
  return (
    <div>
      <div id="zego-container" style={{ width: "100%", height: "100vh" }}></div>
    </div>
  );
};

export default RoomPage;
