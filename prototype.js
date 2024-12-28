// -------------- HOW THE FRONTEND DEVELOPER CAN USE NOTIFICATION ENDPOINT ---------------- |

// 1. Install the socket.io-client package [npm install socket.io-client]

// import { useEffect } from "react";
// import { io } from "socket.io-client";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css"; 

// const Dashboard = () => {
//   const socket = io("http://backend-url"); // Replace with the backend URL

//   useEffect(() => {
//     // Listen for low-stock notifications
//     socket.on("lowStockNotification", (data) => {
//       // Display a toast notification
//       toast.warn(`${data.message}: ${data.data.map((p) => p.name).join(", ")}`, {
//         position: "top-right",
//         autoClose: 5000, // 5 seconds
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <div>
//       <h1>Seller Dashboard</h1>
//       <ToastContainer />
//     </div>
//   );
// };

// export default Dashboard;
// ---------------------------------------------------------------------- |

