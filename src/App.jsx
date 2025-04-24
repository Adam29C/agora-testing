// import React, { useState } from 'react';
// import { json, NavLink, useNavigate } from 'react-router-dom';

// import {
//   TextField,
//   IconButton,
//   Input,
//   InputLabel,
//   InputAdornment,
//   FormControl,
// } from '@mui/material';

// import { IoEyeSharp } from 'react-icons/io5';
// import { IoEyeOffSharp } from 'react-icons/io5';
// import { useFormik } from 'formik';
// import { loginSchema } from '../schemas/loginSchema';
// import { WrapperComponent } from '../layout/WrapperComponent';
// import { ToastContainer, toast } from 'react-toastify';

// import { useDispatch } from 'react-redux';
// import { setAuthUser } from '../Redux/features/user/userSlice';
// import { LOGIN_URI_API } from '../services/auth.service';
// const initialValues = {
//   username: '',
//   password: '',
// };
// const Login = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
//     useFormik({
//       initialValues,
//       validationSchema: loginSchema,
//       onSubmit: async (values) => {
//         setLoading(true);

//         const res = await LOGIN_URI_API(values);

//         console.log('====================================');
//         console.log("res" ,res);
//         console.log('====================================');
//         setLoading(false);
//         if (res.status === 0) {
//           toast.error(res.message, {
//             position: 'top-right',
//           });
//         } else {
//           console.log('res.data', res.data);

//           dispatch(
//             setAuthUser({
//               email: res.data.email,
//               _id: res.data._id,
//               role: res.data.role,
//               name: res.data.name,
//               mobile: res.data.mobile,
//             })
//           );

//           localStorage.setItem(
//             'info',
//             JSON.stringify({
//               email: res.data.email,
//               _id: res.data._id,
//               role: res.data.role,
//               name: res.data.name,
//               mobile: res.data.mobile,
//             })
//           );
//           navigate('/');

//           localStorage.setItem('token', res.yeLo);

//           toast.success('Login successfully', {
//             position: 'top-center',
//           });
//         }
//       },
//     });
//   const handleClickShowPassword = () => setShowPassword((show) => !show);

//   const handleMouseDownPassword = (event) => {
//     event.preventDefault();
//   };

//   return (
//     <>
//       {loading && (
//         <div className="w-full flex justify-center items-center  fixed top-5 z-40">
//           <span className="flex justify-center items-center gap-x-2  bg-slate-100 text-blue-700 shadow-md px-3 py-2 rounded-md">
//             <span className="loading loading-spinner"></span>
//             Loading...
//           </span>
//         </div>
//       )}
//       <div className="w-full h-auto md:h-dvh flex items-center justify-center bg-blue-100 ">
//         <div className="bg-white w-full md:w-10/12 lg:w-6/12 pt-12 md:pt-0 flex flex-col md:flex-row items-center rounded shadow-md ">
//           {/* ================== Login Input Fields ================== */}
//           <div className="p-4 px-8 flex flex-col">
//             <h3 className="text-2xl font-bold text-blue-900">Log in</h3>
//             <p className="text-sm text-gray-400">
//               Welcome user, please Log in to continue
//             </p>

//             <form
//               action=""
//               className="flex flex-col gap-y-1"
//               onSubmit={handleSubmit}
//             >
//               <div className="flex flex-col gap-y-1">
//                 <TextField
//                   id="standard-basic"
//                   label="Email"
//                   variant="standard"
//                   name="username"
//                   type="text"
//                   value={values.username}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                 />
//                 <span className="text-red-400 text-sm">
//                   {errors.username && touched.username ? errors.username : null}
//                 </span>
//               </div>

//               <div className="flex flex-col gap-y-1">
//                 <FormControl variant="standard">
//                   <InputLabel htmlFor="standard-adornment-password">
//                     Password
//                   </InputLabel>
//                   <Input
//                     id="standard-adornment-password"
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     value={values.password}
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     endAdornment={
//                       <InputAdornment position="end">
//                         <IconButton
//                           aria-label="toggle password visibility"
//                           onClick={handleClickShowPassword}
//                           onMouseDown={handleMouseDownPassword}
//                         >
//                           {showPassword ? (
//                             <IoEyeOffSharp className="text-base text-gray-400" />
//                           ) : (
//                             <IoEyeSharp className="text-base text-gray-400" />
//                           )}
//                         </IconButton>
//                       </InputAdornment>
//                     }
//                   />
//                 </FormControl>
//                 <span className="text-red-400 text-sm">
//                   {errors.password && touched.password ? errors.password : null}
//                 </span>
//               </div>
//               <span className="flex justify-end">
//                 <NavLink
//                   className={`text-right text-gray-500 text-sm underline `}
//                   to="/forgot_password"
//                 >
//                   Forgot password?
//                 </NavLink>
//               </span>
//               {loading ? (
//                 <button
//                   className="flex justify-center items-center gap-x-2 bg-blue-500 text-white py-1 rounded font-semibold  mt-3"
//                   type="button"
//                   disabled="disabled"
//                 >
//                   <span className="loading loading-spinner loading-xs"></span>
//                   Loading...
//                 </button>
//               ) : (
//                 <button
//                   className="bg-blue-500 text-white py-1 rounded font-bold hover:bg-blue-700 mt-3"
//                   type="submit"
//                 >
//                   Log in
//                 </button>
//               )}
//             </form>

//             <span className="text-gray-400 py-2 text-sm">
//               Doesn't have an account yet?{' '}
//               <NavLink to="/signup" className={`text-blue-600`}>
//                 Sign up
//               </NavLink>
//             </span>
//           </div>

//           {/* ================== Side picture ====================== */}
//           <div className="w-10/12 md:w-6/12 flex items-center ">
//             <div className="w-full">
//               <img src="./images/login.png" alt="login" className="w-full" />
//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer />
//     </>
//   );
// };

// export default WrapperComponent()(Login);

import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const AudioCall = () => {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const localAudioTrackRef = useRef(null);
  const clientRef = useRef(null);

  const appId = "740baf604340463486afea8a267cc8e8"; // Replace with your Agora App ID
  const channel = "audio-channel"; // Replace with your desired channel name
  const token = null; // Replace with your token if needed

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
      setCallStartTime(new Date());
    } catch (error) {
      console.error("Error joining the channel:", error);
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

  const handleUserLeft = (user) => {
    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  };

  const handleNetworkQuality = (stats) => {
    console.log("Network Quality:", stats);
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

    setRemoteUsers([]);
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      // console.log("Microphone access granted.", stream);
      // Do something with the stream
    })
    .catch((error) => {
      console.error("Microphone access denied:", error);
    });

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg w-[500px] mx-auto mt-10">
      <h1>Agora Audio Call</h1>

      <div>
        {joined ? (
          <p>You're in the call!</p>
        ) : (
          <button onClick={handleJoinCall}>Join Call</button>
        )}
      </div>

      <div>
        <h3>Remote Users</h3>
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <div key={user.uid}>
              <p>Remote user {user.uid}</p>
            </div>
          ))
        ) : (
          <p>No remote users yet.</p>
        )}
      </div>

      {joined && (
        <div>
          <p>Call Duration: {formatDuration(callDuration)}</p>
          <button onClick={handleMuteUnmute}>
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button onClick={handleLeaveCall}>End Call</button>
        </div>
      )}
    </div>
  );
};

export default AudioCall;
