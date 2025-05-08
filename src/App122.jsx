// import React, { useState, useEffect, useRef } from "react";
// import AgoraRTC from "agora-rtc-sdk-ng";
// import * as AgoraRTM from "agora-rtm-sdk";
// import { useLocation } from "react-router";
// import { io } from "socket.io-client";

// const AudioCall = () => {
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const channel = queryParams.get("chanel");
//   const username = queryParams.get("username");
//   const callId = queryParams.get("callId");
//   const userType = queryParams.get("userType");
//   const callType = queryParams.get("callType");
//   const notificationId = queryParams.get("notificationId");

//   const [joined, setJoined] = useState(false);
//   const [remoteUsers, setRemoteUsers] = useState([]);
//   const [callDuration, setCallDuration] = useState(0);
//   const [callStartTime, setCallStartTime] = useState(null);
//   const [userDisconnect, setUserDisconnect] = useState(false);
//   const [userDisconnect1212, setUserDisconnect12121] = useState("test");
//   const [abc, setabc] = useState(true);

//   const localAudioTrackRef = useRef(null);
//   const clientRef = useRef(null);
//   const rtmClientRef = useRef(null);
//   const rtmChannelRef = useRef(null);

//   const appId = "740baf604340463486afea8a267cc8e8";
//   const token = null;

//   const handleUserPublished = async (user, mediaType) => {
//     if (mediaType === "audio") {
//       await clientRef.current.subscribe(user, "audio");
//       user.audioTrack.play();
//       setRemoteUsers((prev) =>
//         prev.some((u) => u.uid === user.uid) ? prev : [...prev, user]
//       );
//     }
//   };

//   const handleUserLeft = async (user) => {
//     console.log("Remote user left:", user.uid);
//     setUserDisconnect(true);
//   };

//   const handleJoinCall = async () => {
//     try {
//       await navigator.mediaDevices.getUserMedia({ audio: true });
//       const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
//         encoderConfig: {
//           bitrate: 128,
//           sampleRate: 48000,
//           stereo: true,
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });

//       localAudioTrackRef.current = localAudioTrack;
//       await clientRef.current.publish([localAudioTrack]);

//       // Notify remote that receiver accepted
//       if (rtmChannelRef.current) {
//         await rtmChannelRef.current.sendMessage({ text: "call-accepted" });
//       }

//       setJoined(true);
//       setCallStartTime(new Date());
//     } catch (err) {
//       console.error("Error joining call:", err);
//     }
//   };

//   const handleLeaveCall = async () => {
//     setUserDisconnect(true);
//     try {
//       if (localAudioTrackRef.current) {
//         localAudioTrackRef.current.stop();
//         localAudioTrackRef.current.close();
//       }
//       if (clientRef.current) {
//         await clientRef.current.leave();
//       }

//       // Notify opposite user to leave too
//       if (rtmChannelRef.current) {
//         await rtmChannelRef.current.sendMessage({ text: "call-ended" });
//       }
//     } catch (err) {
//       console.error("Error leaving call:", err);
//     } finally {
//       window.location.href = "myapp://endcall";
//     }
//   };

//   useEffect(() => {
//     if (userDisconnect) {
//       window.location.href = "myapp://endcall";
//     }
//   }, [userDisconnect]);

//   useEffect(() => {
//     let timer;
//     if (joined) {
//       timer = setInterval(() => {
//         setCallDuration(Math.floor((new Date() - callStartTime) / 1000));
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [joined]);

//   // Agora RTC + RTM Init
//   useEffect(() => {
//     const initAgora = async () => {
//       try {
//         // RTC client setup
//         clientRef.current = AgoraRTC.createClient({
//           mode: "rtc",
//           codec: "h264",
//         });
//         clientRef.current.on("user-published", handleUserPublished);
//         clientRef.current.on("user-left", handleUserLeft);
//         await clientRef.current.join(appId, channel, token, null);

//         if (callType === "caller") {
//           const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
//             encoderConfig: {
//               bitrate: 128,
//               sampleRate: 48000,
//               stereo: true,
//               echoCancellation: true,
//               noiseSuppression: true,
//               autoGainControl: true,
//             },
//           });

//           localAudioTrackRef.current = localAudioTrack;
//           await clientRef.current.publish([localAudioTrack]);

//           setJoined(true);
//           setCallStartTime(new Date());
//         }

//         // RTM client setup
//         const rtmClient = AgoraRTM.createInstance(appId);
//         await rtmClient.login({
//           uid: `${username}-${Math.floor(Math.random() * 10000)}`,
//         });

//         const rtmChannel = await rtmClient.createChannel(channel);
//         await rtmChannel.join();

//         rtmChannel.on("ChannelMessage", ({ text }, senderId) => {
//           if (text === "call-ended") {
//             setUserDisconnect(true);
//           }
//         });

//         rtmClientRef.current = rtmClient;
//         rtmChannelRef.current = rtmChannel;
//       } catch (err) {
//         console.error("Agora Init Failed:", err);
//       }
//     };

//     initAgora();

//     return () => {
//       clientRef.current?.off("user-published", handleUserPublished);
//       clientRef.current?.off("user-left", handleUserLeft);
//     };
//   }, []);

//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}m ${secs}s`;
//   };

//   const handleCallerEndCall = async () => {
//     setUserDisconnect12121("riciever");
//     try {
//       if (localAudioTrackRef.current) {
//         localAudioTrackRef.current.stop();
//         localAudioTrackRef.current.close();
//       }
//       if (clientRef.current) {
//         await clientRef.current.leave();
//       }
//     } catch (err) {
//       console.error("Caller Error leaving call:", err);
//     } finally {
//       // await FOR_POST_REQUEST("call/end", { callId });
//       window.location.href = "myapp://endcall";
//     }
//   };

//   const handleReceiverEndCall = async () => {
//     setUserDisconnect12121("caller");

//     try {
//       if (localAudioTrackRef.current) {
//         localAudioTrackRef.current.stop();
//         localAudioTrackRef.current.close();
//       }
//       if (clientRef.current) {
//         await clientRef.current.leave();
//       }
//     } catch (err) {
//       console.error("Receiver Error leaving call:", err);
//     } finally {
//       // await FOR_POST_REQUEST("call/end", { callId });
//       window.location.href = "myapp://endcall";
//     }
//   };


//   useEffect(() => {
//     if (userDisconnect1212 === "caller" && abc == true) {
//      setabc(false);

//       handleCallerEndCall();
//       return;
//     }
//     if (userDisconnect1212 === "riciever" && abc == true) {
//       setabc(false);

//       handleReceiverEndCall();
//       return;
//     }
//     // setabc(false);
//   }, [userDisconnect1212  , abc]);





//   return (
//     <>
//       <div className="header">
//         <img
//           src="https://rich143.com/images/newfavicon.svg"
//           className="profile-img"
//           alt="Profile"
//         />
//         <div>
//           <div className="username">
//             {username} , notificationId- {notificationId}
//           </div>
//           <div className="status">
//             Online--- {userDisconnect1212 && userDisconnect1212}
//             Numbwer--- {abc.toString()}
//           </div>
//         </div>
//       </div>

//       <div className="logo">
//         <img
//           src="https://rich143.com/static/media/updatedlogo.778bb66b8ac72949874f0c8180098037.svg"
//           className="img-fluid w-75"
//           alt="Logo"
//         />
//       </div>

//       <div className="timer my-5 text-bold username h1">
//         {formatDuration(callDuration)}
//       </div>

//       <div className="d-flex justify-content-center gap-5 margin-buttons">
//         {callType !== "caller" && (
//           <button
//             onClick={handleJoinCall}
//             className="btn btn-success d-flex align-items-center justify-content-center call-button red-pulse mx-5"
//           >
//             <i className="fas fa-phone"></i>
//           </button>
//         )}
//         <button
//           onClick={
//             callType === "caller" ? handleCallerEndCall : handleReceiverEndCall
//           }
//           // onClick={handleLeaveCall}
//           className="btn btn-danger d-flex align-items-center justify-content-center call-button mx-5"
//         >
//           <i className="fas fa-phone-slash"></i>
//         </button>
//       </div>
//     </>
//   );
// };

// export default AudioCall;



