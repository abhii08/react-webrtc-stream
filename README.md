# PeerCast 🎥  
A minimal WebRTC peer-to-peer video streaming app built with **React** (frontend) and **Node.js + WebSocket** (signaling server).

This project demonstrates how two browsers can directly connect and stream video between each other using **WebRTC**, with a simple **WebSocket signaling** mechanism.

---

## 🚀 Features

- 📡 Real-time peer-to-peer video connection using WebRTC  
- 🌐 WebSocket-based signaling server for exchanging offers, answers, and ICE candidates  
- 🧠 Simple architecture — clear separation between signaling and media  
- ⚛️ React frontend with **Sender** and **Receiver** roles  
- 🧩 Educational example for understanding WebRTC handshake flow

---

## 🧱 Project Structure

**/backend** → Node.js WebSocket signaling server    
**/frontend** → React app with Sender and Receiver components   

---

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, WebRTC APIs  
**Backend:** Node.js, WebSocket (`ws` package)

---

## 🧩 Connecting the Two Sides

The steps to create a WebRTC connection between two browsers include:

1. Browser 1 creates an `RTCPeerConnection`  
2. Browser 1 creates an `offer`  
3. Browser 1 sets the  `local description` to the offer  
4. Browser 1 sends the offer to the other side through the `signaling server` 
5. Browser 2 receives the `offer` from the `signaling server`  
6. Browser 2 sets the `remote description` to the `offer`  
7. Browser 2 creates an `answer` 
8. Browser 2 sets the `local description` to the `answer`  
9. Browser 2 sends the `answer` back through the `signaling server`  
10. Browser 1 receives the `answer` and sets the `remote description`  

> 🧠 This process only establishes the P2P connection between the two browsers.  
> Once connected, the media (audio/video) flows directly — not through the server.

---

## ⚙️ Implementation Details

We use **Node.js** for the signaling server and **React** on the frontend.  

### 🖥️ Signaling Server
The server handles three types of WebSocket messages:
- `createOffer`
- `createAnswer`
- `iceCandidate`

Each message type corresponds to a specific part of the WebRTC handshake process.

### 💻 Frontend
The React app includes two components:
- **Sender** – captures video using `getUserMedia()` and sends it to the peer  
- **Receiver** – receives the remote stream and displays it in a `<video>` element  

Both connect to the signaling server over WebSocket and exchange SDP and ICE messages.

---

## 🏗️ Setup & Run

### 1️⃣ Start the backend server
```bash
cd backend
npm install
node index.js
