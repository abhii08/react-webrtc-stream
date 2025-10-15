import { useEffect, useRef  } from "react";

export const Receiver = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };
    const cleanup = startReceiving(socket, videoRef.current);

    return () => {
      socket.close();
      cleanup();
    };
  }, []);

  function startReceiving(socket: WebSocket, video: HTMLVideoElement | null) {
    if (!video) return () => {};

    const pc = new RTCPeerConnection();
    const iceCandidateBuffer: RTCIceCandidateInit[] = [];
    let remoteDescriptionSet = false;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      video.srcObject = new MediaStream([event.track]);
      video.muted = true;
      video.play().catch((error) => {
        console.error("Autoplay failed:", error);
      });
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        try {
          await pc.setRemoteDescription(message.sdp);
          remoteDescriptionSet = true; 

          while (iceCandidateBuffer.length > 0) {
            const candidate = iceCandidateBuffer.shift();
            if (candidate) {
              await pc.addIceCandidate(candidate).catch((error) => {
                console.error("Error adding buffered ICE candidate:", error);
              });
            }
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.send(
            JSON.stringify({
              type: "createAnswer",
              sdp: answer,
            })
          );
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      } else if (message.type === "iceCandidate") {
        try {
          if (remoteDescriptionSet) {
            await pc.addIceCandidate(message.candidate);
          } else {
            iceCandidateBuffer.push(message.candidate);
          }
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };
    return () => {
      pc.close();
    };
  }

  return <div>
    <h2>Receiver</h2>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '800px' }} />
  </div>;
};
