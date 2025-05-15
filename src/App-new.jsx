import React, { useState, useEffect, useRef } from "react";
import * as AgoraRTM from "agora-rtm-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./index.css";
const AudioCall = () => {
  const [joined, setJoined] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [spicker, setSpicker] = useState(true);

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
  const ringingAudioRef = useRef(null);

  const appId = "740baf604340463486afea8a267cc8e8";
  const channel = channel11;
  const token = null;

  const handleJoinCall = async () => {
    if (joined) {
      console.log("Already joined the call.");
      return;
    }
    // if (callType === "receiver") {
    //   window.ReactNativeWebView?.postMessage(
    //     JSON.stringify({ type: "TOGGLE_RINGTONEOF" })
    //   );
    // }

    if (callType === "receiver") {
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "TOGGLE_RINGTONE" })
      );
    }

    try {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
      clientRef.current.on("user-published", handleUserPublished);
      clientRef.current.on("user-left", handleUserLeft);
      clientRef.current.on("network-quality", handleNetworkQuality);

      // clientRef.current.setAudioProfile("speech_low_quality", "speaker_forced");

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
    } catch (error) {
      console.error("Error joining the channel:", error);
    }
  };

  useEffect(() => {}, []);

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

      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
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
    }, 30000);

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

        // clientRef.current.setAudioProfile(
        //   "speech_low_quality",
        //   "speaker_forced"
        // );

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

          if (callType === "caller") {
            // Start playing ringtone
            ringingAudioRef.current
              ?.play()
              .catch((err) => console.warn("Autoplay failed:", err));
          }
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
  useEffect(() => {
    const textElement = document.getElementById("call-status");
    let dotCount = 0;

    setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      textElement.innerText = "Connecting" + ".".repeat(dotCount);
    }, 500);
  }, []);

  // ----- mute & unmute -----------
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

  // ---------  loude and spicker -----------------

  // function turnOnSpeaker(values) {
  //   // window.ReactNativeWebView?.postMessage(
  //   //   JSON.stringify({ type: "TOGGLE_SPEAKER" })
  //   // );
  //   setSpicker(true);
  // }
  // function turnOffSpeaker() {
  //   // window.ReactNativeWebView?.postMessage(
  //   //   JSON.stringify({ type: "TOGGLE_SPEAKER" })
  //   // );

  //   setSpicker(!spicker);
  // }

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     turnOnSpeaker();
  //   }, 1000); // wait 1s
  //   return () => clearTimeout(delay);
  // }, []);

  // const toggleSpeaker = (enable) => {
  //   if (window.Android && window.Android.toggleSpeaker) {
  //     window.Android.toggleSpeaker(enable);
  //     setSpicker(true);
  //   } else {
  //     setSpicker(false);

  //     console.warn("Android interface not found.");
  //   }
  // };

  // --------------- ring ----------
  // useEffect(() => {
  //   if (callType === "caller" && !callAnswered) {
  //     ringAudio.current = new Audio("./callingring.mp3");
  //     ringAudio.current.loop = true;
  //     ringAudio.current.play().catch((e) => console.log("Autoplay error:", e));
  //   }

  //   if (callAnswered && ringAudio.current) {
  //     ringAudio.current.pause();
  //     ringAudio.current.currentTime = 0;
  //   }

  //   return () => {
  //     if (ringAudio.current) {
  //       ringAudio.current.pause();
  //       ringAudio.current.currentTime = 0;
  //     }
  //   };
  // }, [callType, callAnswered]);

  // const [speakerOn, setSpeakerOn] = useState(false);

  // const toggleSpeaker = () => {
  //   const newSpeakerState = !speakerOn;
  //   setSpeakerOn(newSpeakerState);

  //   try {
  //     if (
  //       window.AndroidAudio &&
  //       typeof window.AndroidAudio.setSpeakerMode === "function"
  //     ) {
  //       window.AndroidAudio.setSpeakerMode(newSpeakerState);
  //       console.log("Speaker mode set to:", newSpeakerState);
  //     } else {
  //       console.warn("AndroidAudio interface not found");
  //     }
  //   } catch (err) {
  //     console.error("Error toggling speaker mode:", err);
  //   }
  // };

  return (
    <>
      <div class="call-screen">
        <div class="caller-info">
          <div class="caller-name">{username}</div>
          {!joined ? (
            <div class="call-status" id="call-status">
              Connecting
            </div>
          ) : (
            <div>{formatDuration(callDuration)}</div>
          )}
        </div>

        <div class="logo">
          <img
            src="https://rich143.com/images/newfavicon.svg"
            class="profile-img"
            alt="Profilesdfsdfs"
          />
        </div>

        <div class="control-buttons">
          {isMuted ? (
            <button className={`btn btn-dark `} onClick={handleMuteUnmute}>
              <i class="fa-solid fa-microphone-slash "></i>
            </button>
          ) : (
            <button className={`btn btn-dark `} onClick={handleMuteUnmute}>
              <i class="fa-solid fa-microphone"></i>
            </button>
          )}
          {/* <div
            className={`btn btn-dark `}
            onClick={() => {
              window.ReactNativeWebView?.postMessage(
                JSON.stringify({ type: "TOGGLE_SPEAKER" })
              );
              // setSpicker(!spicker);
            }}
          ></div> */}
          {/* <button class="btn btn-danger"><i class="fas fa-phone-slash"></i></button> */}
          {!joined &&
          (notificationId === "false" || notificationId === "null") ? (
            <button class="btn btn-success" onClick={handleJoinCall}>
              <i class="fas fa-phone"></i>
            </button>
          ) : (
            <button class="btn btn-danger" onClick={handleLeaveCall}>
              <i class="fas fa-phone-slash"></i>
            </button>
          )}

          {/* <button onClick={toggleSpeaker}>
            <i class="fa-solid fa-microphone-slash "></i>
          </button> */}
        </div>
      </div>
    </>
  );
};

export default AudioCall;
