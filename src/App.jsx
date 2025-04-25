// import React, { useState, useEffect, useRef } from "react";
// import AgoraRTC from "agora-rtc-sdk-ng";

// const AudioCall = () => {
//   const [joined, setJoined] = useState(false);
//   const [remoteUsers, setRemoteUsers] = useState([]);
//   const [callDuration, setCallDuration] = useState(0);
//   const [callStartTime, setCallStartTime] = useState(null);
//   const [isMuted, setIsMuted] = useState(false);

//   const localAudioTrackRef = useRef(null);
//   const clientRef = useRef(null);

//   const appId = "740baf604340463486afea8a267cc8e8"; // Replace with your Agora App ID
//   const channel = "audio-channel"; // Replace with your desired channel name
//   const token = null; // Replace with your token if needed

//   async function joinAgoraChannel() {
//     const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

//     await client.join(appId, channel, null, null);

//     const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//     await client.publish([localAudioTrack]);

//     console.log("Joined and published mic successfully");
//   }

//   const handleJoinCall = async () => {
//     try {
//       await navigator.mediaDevices.getUserMedia({ audio: true });
//       console.log("Mic access granted");
//       joinAgoraChannel(); // Call your agora join logic here
//     } catch (err) {
//       alert(
//         "Microphone access failed. Please check permissions or close other apps using the mic."
//       );
//       console.error("Mic permission error:", err);
//     }

//     if (joined) {
//       console.log("Already joined the call.");
//       return;
//     }

//     try {
//       // Create Agora client
//       clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

//       // Add listeners
//       clientRef.current.on("user-published", handleUserPublished);
//       clientRef.current.on("user-left", handleUserLeft);
//       clientRef.current.on("network-quality", handleNetworkQuality);

//       // Join channel
//       await clientRef.current.join(appId, channel, token, null);

//       // ✅ Check mic access before creating track
//       // await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Create audio track
//       const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//       localAudioTrackRef.current = localAudioTrack;

//       // Publish local audio
//       await clientRef.current.publish([localAudioTrack]);

//       setJoined(true);
//       setCallStartTime(new Date());
//     } catch (error) {
//       console.error("Error joining the channel:", error);
//       alert(
//         "Microphone access failed. Please check your permissions or close other apps using the mic."
//       );
//     }
//   };

//   const handleUserPublished = async (user, mediaType) => {
//     if (mediaType === "audio") {
//       await clientRef.current.subscribe(user, "audio");
//       user.audioTrack.play();

//       setRemoteUsers((prevUsers) => {
//         const exists = prevUsers.some((u) => u.uid === user.uid);
//         return exists ? prevUsers : [...prevUsers, user];
//       });
//     }
//   };

//   const handleUserLeft = (user) => {
//     setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
//   };

//   const handleNetworkQuality = (stats) => {
//     console.log("Network Quality:", stats);
//   };

//   const handleMuteUnmute = async () => {
//     if (localAudioTrackRef.current) {
//       if (isMuted) {
//         await localAudioTrackRef.current.setEnabled(true); // Unmute
//       } else {
//         await localAudioTrackRef.current.setEnabled(false); // Mute
//       }
//       setIsMuted(!isMuted);
//     }
//   };

//   navigator.mediaDevices.enumerateDevices().then((devices) => {
//     console.log(
//       "testing audio devices",
//       devices.filter((d) => d.kind === "audioinput")
//     );
//   });

//   const handleLeaveCall = async () => {
//     if (localAudioTrackRef.current) {
//       localAudioTrackRef.current.stop();
//       localAudioTrackRef.current.close();
//     }

//     if (clientRef.current) {
//       await clientRef.current.leave();
//     }

//     setRemoteUsers([]);
//     setJoined(false);
//     setCallDuration(0);
//     setCallStartTime(null);
//     setIsMuted(false);
//   };

//   useEffect(() => {
//     let timer;
//     if (callStartTime) {
//       timer = setInterval(() => {
//         setCallDuration(Math.floor((new Date() - callStartTime) / 1000));
//       }, 1000);
//     }

//     return () => clearInterval(timer);
//   }, [callStartTime]);

//   useEffect(() => {
//     // Clean up event listeners on unmount
//     return () => {
//       if (clientRef.current) {
//         clientRef.current.off("user-published", handleUserPublished);
//         clientRef.current.off("user-left", handleUserLeft);
//         clientRef.current.off("network-quality", handleNetworkQuality);
//       }
//     };
//   }, []);

//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}m ${secs}s`;
//   };

//   const clicbtn = (seconds) => {
//     document.body.contentEditable = "true"; // Make the page editable
//     document.designMode = "on"; // Enable design mode for editing
//     alert("Inspect mode activated. You can now edit the page.");
//   };

//   return (
//     <div className="bg-gray-100 p-4 rounded-lg shadow-lg w-[500px] mx-auto mt-10">
//       <h1 className="text-xl font-bold mb-4">Agora Audio Call</h1>

//       <div className="mb-4">
//         {joined ? (
//           <p className="text-green-600">You're in the call!</p>
//         ) : (
//           <button
//             onClick={handleJoinCall}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             Join Call
//           </button>
//         )}
//       </div>

//       <div className="mb-4">
//         <h3 className="font-semibold">Remote Users</h3>
//         {remoteUsers.length > 0 ? (
//           remoteUsers.map((user) => (
//             <div key={user.uid}>
//               <p>Remote user {user.uid}</p>
//             </div>
//           ))
//         ) : (
//           <p>No remote users yet.</p>
//         )}
//       </div>

//       {joined && (
//         <div className="space-y-2">
//           <p>Call Duration: {formatDuration(callDuration)}</p>
//           <button
//             onClick={handleMuteUnmute}
//             className="bg-yellow-500 text-white px-4 py-2 rounded"
//           >
//             {isMuted ? "Unmute" : "Mute"}
//           </button>
//           <button
//             onClick={handleLeaveCall}
//             className="bg-red-500 text-white px-4 py-2 rounded"
//           >
//             End Call
//           </button>
//         </div>
//       )}

//       <button onClick={clicbtn}>click</button>
//     </div>
//   );
// };

// export default AudioCall;



import React from 'react'

const App = () => {
  return (
    <div>App</div>
  )
}

export default App