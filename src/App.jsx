import React, { useState, useEffect, useRef } from "react";
import * as AgoraRTM from "agora-rtm-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";

const AudioCall = () => {
  const [joined, setJoined] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userDisconnect, setUserDisconnect] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [aaaaaa, setAaaaaa] = useState(false);
  const [ddddd, setAaaaaaadddd] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const channel11 = queryParams.get("chanel");
  const username = queryParams.get("username");
  const callId = queryParams.get("callId");
  const userType = queryParams.get("userType");
  const callType = queryParams.get("callType");
  const notificationId = queryParams.get("notificationId");

  const localAudioTrackRef = useRef(null);
  const clientRef = useRef(null);
  const rtmClientRef = useRef(null);
  const rtmChannelRef = useRef(null);

  const appId = "740baf604340463486afea8a267cc8e8";
  const channel = channel11;
  const token = null;

  const handleJoinCall = async () => {
    if (joined) {
      console.log("Already joined the call.");
      return;
    }

    try {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
      clientRef.current.on("user-published", handleUserPublished);
      clientRef.current.on("user-left", handleUserLeft);
      clientRef.current.on("network-quality", handleNetworkQuality);

      await clientRef.current.join(appId, channel, token, null);
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;

      await clientRef.current.publish([localAudioTrack]);

      setJoined(true);
    } catch (error) {
      console.error("Error joining the channel:", error);
    }
  };

  useEffect(() => {
    if (remoteUser) {
      setCallStartTime(new Date());
    }
  }, [remoteUser]);

  const handleUserPublished = async (user, mediaType) => {
    if (mediaType === "audio") {
      await clientRef.current.subscribe(user, "audio");
      user.audioTrack.play();
      setRemoteUser(user);
      setCallAnswered(true);
      setCallStartTime(new Date());
      console.log("Remote user joined:", user);
    }
  };

  const handleUserLeft = async (user) => {
    setCallAnswered(false);

    if (remoteUser && remoteUser.uid === user.uid) {
      setRemoteUser(null);
    }

    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }

    if (clientRef.current) {
      await clientRef.current.leave();
    }

    window.location.href = "myapp://endcall";
  };

  const handleNetworkQuality = (stats) => {
    console.log("Network Quality:", stats);
  };

  const handleLeaveCall = async () => {
    window.location.href = "myapp://endcall";
    setRemoteUser(null);
    setCallAnswered(false);
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }

    if (clientRef.current) {
      await clientRef.current.leave();
    }

    setJoined(false);
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
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

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.off("user-published", handleUserPublished);
        clientRef.current.off("user-left", handleUserLeft);
        clientRef.current.off("network-quality", handleNetworkQuality);
      }
    };
  }, []);

  useEffect(() => {
    if (userDisconnect) {
      window.location.href = "myapp://endcall";
    }
  }, [userDisconnect]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!callAnswered) {
        handleLeaveCall();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [callAnswered]);

  useEffect(() => {
    const initAgora = async () => {
      try {
        clientRef.current = AgoraRTC.createClient({
          mode: "rtc",
          codec: "h264",
        });
        clientRef.current.on("user-published", handleUserPublished);
        clientRef.current.on("user-left", handleLeaveCalluser);
        await clientRef.current.join(appId, channel, token, null);

        if (callType === "caller") {
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

          await localAudioTrack.setEnabled(false);

          localAudioTrackRef.current = localAudioTrack;
          await clientRef.current.publish([localAudioTrack]);
        }

        const rtmClient = AgoraRTM.createInstance(appId);
        await rtmClient.login({
          uid: `${username}-${Math.floor(Math.random() * 10000)}`,
        });

        const rtmChannel = await rtmClient.createChannel(channel);
        await rtmChannel.join();

        rtmChannel.on("ChannelMessage", ({ text }) => {
          if (text === "call-ended") {
            setUserDisconnect(true);
          }
        });

        rtmClientRef.current = rtmClient;
        rtmChannelRef.current = rtmChannel;
      } catch (err) {
        console.error("Agora Init Failed:", err);
      }
    };

    initAgora();

    return () => {
      clientRef.current?.off("user-published", handleUserPublished);
      clientRef.current?.off("user-left", handleLeaveCalluser);
    };
  }, []);

  const handleLeaveCalluser = async () => {
    setCallAnswered(false);

    window.location.href = "myapp://endcall";
    setRemoteUser(null);

    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }

    if (clientRef.current) {
      await clientRef.current.leave();
    }

    setJoined(false);
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
  };

  const handleLeaveCallReciever = async () => {
    setCallAnswered(false);

    window.location.href = "myapp://endcall";
    setRemoteUser(null);

    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }

    if (clientRef.current) {
      await clientRef.current.leave();
    }

    setJoined(false);
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
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
          <div className="username">{username}</div>
          <div className="status">
            callType-{callType} , &nbsp; fakecalltype - {ddddd}
          </div>
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

      <span className="text-center d-flex justify-content-center">
        If the receiver doesn't pick up, the call will auto-end after 10
        seconds.
      </span>
      <div className="d-flex justify-content-center gap-5 margin-buttons">
        <button
          onClick={handleJoinCall}
          className="btn btn-success d-flex align-items-center justify-content-center call-button red-pulse mx-5"
        >
          <i className="fas fa-phone"></i>
        </button>

        <button
          onClick={handleLeaveCall}
          className={` btn btn-danger d-flex align-items-center justify-content-center call-button mx-5`}
        >
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>
    </>
  );
};

export default AudioCall;
