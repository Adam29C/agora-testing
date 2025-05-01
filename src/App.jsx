import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useLocation } from "react-router";
import { FOR_POST_REQUEST } from "./api.service";

const AudioCall = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const channel = queryParams.get("chanel");
  const username = queryParams.get("username");
  const callId = queryParams.get("callId");
  const userType = queryParams.get("userType");

  const callType = queryParams.get("callType");
  const notificationId = queryParams.get("notificationId");

  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userDisconnect, setUserDisconnect] = useState(false);

  const localAudioTrackRef = useRef(null);
  const clientRef = useRef(null);

  const appId = "740baf604340463486afea8a267cc8e8";
  const token = null;

  const joinAgoraChannel = async () => {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
    clientRef.current.on("user-published", handleUserPublished);
    clientRef.current.on("user-left", handleUserLeft);

    await clientRef.current.join(appId, channel, token, null);

    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: {
        bitrate: 128,
        sampleRate: 48000,
        stereo: true,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localAudioTrackRef.current = localAudioTrack;
    await clientRef.current.publish([localAudioTrack]);
    setJoined(true);
    setCallStartTime(new Date());
  };

  const handleJoinCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await joinAgoraChannel();
      await FOR_POST_REQUEST("call/accept", { callId });
    } catch (err) {
      console.error("Error joining call:", err);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    if (mediaType === "audio") {
      await clientRef.current.subscribe(user, "audio");
      user.audioTrack.play();
      setRemoteUsers((prev) =>
        prev.some((u) => u.uid === user.uid) ? prev : [...prev, user]
      );
    }
  };

  const handleUserLeft = async (user) => {
    setUserDisconnect(true);
    if (user.audioTrack) {
      user.audioTrack.stop();
      user.audioTrack.close();
    }
    await clientRef.current.unsubscribe(user, "audio");
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    await FOR_POST_REQUEST("call/end", { callId });
  };

  const handleMuteUnmute = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleLeaveCall = async () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    await FOR_POST_REQUEST("call/end", { callId });
    window.location.href = "myapp://endcall";
  };

  useEffect(() => {
    let timer;
    if (callStartTime) {
      timer = setInterval(() => {
        setCallDuration(Math.floor((new Date() - callStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStartTime]);

  // useEffect(() => {
  //   if (userDisconnect) {
  //     if (window.confirm("Do you want to end the call?")) {
  //       window.location.href = "myapp://endcall";
  //     }
  //   }
  // }, [userDisconnect]);

  useEffect(() => {
    if (!userDisconnect) return;

    // const confirmEndCall = window.confirm("Do you want to end the call?");
    // if (confirmEndCall) {
    window.location.href = "myapp://endcall";
    // FOR_POST_REQUEST("call/end", { callId });

    // }
  }, [userDisconnect]);

  useEffect(() => {
    if (callType === "caller") handleJoinCall();
  }, []);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.off("user-published", handleUserPublished);
        clientRef.current.off("user-left", handleUserLeft);
      }
    };
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <>
      <div className="header">
        <img
          src="https://rich143.com/images/newfavicon.svg"
          className="profile-img"
          alt="Profile"
        />
        <div>
          <div className="username">
            {username} , notificationId- {notificationId}
          </div>
          <div className="status">Online</div>
        </div>
      </div>
      <div className="logo">
        <img
          src="https://rich143.com/static/media/updatedlogo.778bb66b8ac72949874f0c8180098037.svg"
          className="img-fluid w-75"
          alt="Logo"
        />
      </div>
      <div className="timer my-5 text-bold username h1">
        {formatDuration(callDuration)}
      </div>
      {/* <div className="login-btn">
        {joined ? (
          <button
            className="btn btn-danger btn-sm w-100 rounded-4 py-3"
            onClick={handleLeaveCall}
          >
            End Call
          </button>
        ) : (
          <button
            className="btn btn-success btn-sm w-100 py-3 rounded-3"
            onClick={handleJoinCall}
          >
            Join Call
          </button>
        )}
      </div> */}

      <div className="d-flex justify-content-center gap-5  margin-buttons">
        {callType !== "caller" && (
          <button
            onClick={handleJoinCall}
            className="btn btn-success d-flex align-items-center justify-content-center call-button red-pulse  mx-5"
          >
            <i className="fas fa-phone"></i>
          </button>
        )}
        <button
          onClick={handleLeaveCall}
          className="btn btn-danger d-flex align-items-center justify-content-center call-button  mx-5"
        >
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>
    </>
  );
};

export default AudioCall;
