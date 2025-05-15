import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useLocation } from "react-router";
import { FOR_POST_REQUEST } from "./api.service";

const AudioCall = () => {
  // const { search } = useLocation();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const channel = queryParams.get("chanel");
  const username = queryParams.get("username");
  const callId = queryParams.get("callId");

  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [Testing, setTesting] = useState("false");
  const [hasJoined, setHasJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userDisconnect, setuserDisconnect] = useState(false);

  console.log("remoteUsers" ,remoteUsers);

  const localAudioTrackRef = useRef(null);
  const clientRef = useRef(null);

  const appId = "740baf604340463486afea8a267cc8e8";
  // const channel = channelName;
  const token = null;

  const joinAgoraChannel = async () => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current.setClientRole("host");

    // Enable audio profile
    clientRef.current.setAudioProfile("high_quality_stereo");
    await client.join(appId, channel, null, null);

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

    await client.publish([localAudioTrack]);

    // console.log("Joined and published mic successfully", localAudioTrack);
  };

  // Automatically request microphone permission on load
  const handleJoinCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // console.log("Mic access granted");
      joinAgoraChannel(); // Call Agora join logic after permission

      // let payload = { callId: "680f1872cece1f7817f63771" };
      let payload = { callId: callId };

      let response = await FOR_POST_REQUEST("call/accept", payload);

      console.log("Response from API:", response);
    } catch (err) {
      // alert(
      //   "Microphone access failed. Please check permissions or close other apps using the mic."
      // );
      console.error("Mic permission error:", err);
    }

    if (joined) {
      // console.log("Already joined the call.");
      return;
    }

    try {
      // Create Agora client
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

      // Add listeners
      clientRef.current.on("user-published", handleUserPublished);
      clientRef.current.on("user-left", handleUserLeft);
      clientRef.current.on("network-quality", handleNetworkQuality);

      // Join channel
      await clientRef.current.join(appId, channel, token, null);

      // ✅ Check mic access before creating track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;

      // Publish local audio
      await clientRef.current.publish([localAudioTrack]);

      setJoined(true);
      setCallStartTime(new Date());
    } catch (error) {
      console.error("Error joining the channel:", error);
      // console.log(
      //   "Microphone access failed. Please check your permissions or close other apps using the mic."
      // // );
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    if (mediaType === "audio") {
      await clientRef.current.subscribe(user, "audio");
      user.audioTrack.play();

      setRemoteUsers((prevUsers) => {
        const exists = prevUsers.some((u) => u.uid === user.uid);
        return exists ? prevUsers : [...prevUsers, user];
      });
    }
  };

  const handleUserLeft = async (user) => {
    setuserDisconnect(true);
    // Ensure audio track is properly stopped
    if (user.audioTrack) {
      user.audioTrack.stop(); // Stop audio track
      user.audioTrack.close(); // Close the audio track
    }
    // Unsubscribe from the user
    await clientRef.current.unsubscribe(user, "audio");

    // Trigger deep link to redirect app
    const deepLink = "myapp://endcall"; // Deep link URL
    // Use WebView to trigger deep link
    window.location.href = deepLink;

    if (u.uid !== user.uid) {
      const deepLink = "myapp://endcall";
      window.location.href = deepLink;
    }

    log;

    // Remove user from remote users list
    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  };

  // const handleUserLeft = async (user) => {
  //   client.on("user-left", (user) => {
  //     console.log(`User left: ${user.uid}`);

  //     // Here you can execute your custom logic when a user leaves
  //     // For example, ending the call, cleaning up resources, etc.

  //     // If it's the last user, you might want to end the call or navigate away
  //     // handleUserLeft(user);
  //   });

  //   setuserDisconnect(true);

  //   const deepLink = "myapp://endcall"; // Deep link URL

  //   // Trigger deep link (this will redirect to the deep link)
  //   window.location.href = deepLink;

  //   await clientRef.current.unsubscribe(user, "audio");
  //   user.audioTrack.stop();

  //   // let payload = { callId: callId };

  //   // let response = await FOR_POST_REQUEST("call/end", payload);

  //   setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  // };

  const handleNetworkQuality = (stats) => {
    // console.log("Network Quality:", stats);
  };

  const handleMuteUnmute = async () => {
    if (localAudioTrackRef.current) {
      if (isMuted) {
        await localAudioTrackRef.current.setEnabled(true); // Unmute
      } else {
        await localAudioTrackRef.current.setEnabled(false); // Mute
      }
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

    // let payload = { callId: "680f1872cece1f7817f63771" };
    let payload = { callId: callId };

    // let response = await FOR_POST_REQUEST("call/end", payload);

    // console.log("Response from API:", response);

    const deepLink = "myapp://endcall"; // Deep link URL

    // Trigger deep link (this will redirect to the deep link)
    window.location.href = deepLink;

    handleUserLeft();
    setRemoteUsers([]);
    setJoined(false);
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
  };

  // useEffect(() => {
  //   if (username && !hasJoined) {
  //     // console.log("usernamegafnaafas");

  //     setTesting("true");
  //     handleJoinCall();
  //     setHasJoined(true);
  //   }
  // }, [username, hasJoined]);

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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });



  
  return (
    <>
      {/* <div className="mb-4">
          {joined ? (
            <p className="text-green-600">You're in the call!</p>
          ) : (
            <button
              onClick={handleJoinCall}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Join Call
            </button>
          )}
        </div> */}
      {/* <div className="mb-4">
          {remoteUsers.length > 0 ? (
            remoteUsers.map((user) => (
              <div key={user.uid}>
                <p>Remote user {user.uid}</p>
              </div>
            ))
          ) : (
            <p>No remote users yet.</p>
          )}
        </div> */}
      {/* {joined && (
        <div className="space-y-2">
          <p>Call Duration: {formatDuration(callDuration)}</p>
          <button
            onClick={handleMuteUnmute}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={handleLeaveCall}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            End Call
          </button>
        </div>
      )} */}
      <div className="header">
        <img
          src="https://rich143.com/images/newfavicon.svg"
          className="profile-img"
          alt="Profile"
        />
        <div>
          <div className="username">{username}</div>
          <div className="status"> Online</div>
        </div>
      </div>
      <h6> has user dissconnect -{userDisconnect.toString()}</h6>
      <div className="logo">
        <img
          src="https://rich143.com/static/media/updatedlogo.778bb66b8ac72949874f0c8180098037.svg"
          className="img-fluid w-75"
          alt="Profile"
        />
      </div>
      <div className="timer mt-5 text-bold username h1">
        {formatDuration(callDuration)}
      </div>
      <div className="login-btn ">
        {joined ? (
          <>
            <button
              className="btn btn-danger btn-sm w-100 rounded-4 py-3"
              onClick={handleLeaveCall}
            >
              End Call
            </button>
            {/* <a href="myapp://endcall">End Call</a> */}
          </>
        ) : (
          // ""
          <button
            onClick={handleJoinCall}
            className="btn btn-success btn-sm w-100 py-3 rounded-3"
          >
            Join Call
          </button>
        )}
      </div>
    </>
  );
};

export default AudioCall;
