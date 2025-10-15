import { useEffect, useState, useRef } from "react";

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "sender",
                })
            );
        };
        return () => {
            socket.close();
            if (pcRef.current) {
                pcRef.current.close();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const initiateConn = async () => {
        console.log("inside conn.");
        if (!socket) {
            alert("Socket not found");
            return;
        }

        const newPC = new RTCPeerConnection();
        pcRef.current = newPC;

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await newPC.setRemoteDescription(message.sdp).catch(error => {
                    console.error('Error setting remote description:', error);
                });
            } else if (message.type === "iceCandidate") {
                newPC.addIceCandidate(message.candidate).catch((error) => {
                    console.error("Error adding ICE candidate:", error);
                });
            }
        };

        newPC.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(
                    JSON.stringify({
                        type: "iceCandidate",
                        candidate: event.candidate,
                    })
                );
            }
        };

        newPC.onnegotiationneeded = async () => {
            const offer = await newPC.createOffer();
            await newPC.setLocalDescription(offer);
            socket?.send(
                JSON.stringify({
                    type: "createOffer",
                    sdp: newPC.localDescription,
                })
            );
        };

        getCameraStreamAndSend(newPC);
    };

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch((error) => {
                        console.error("Autoplay failed:", error);
                    });
                }

                stream.getTracks().forEach((track) => {
                    pc.addTrack(track);
                });
            })
            .catch((error) => {
                console.error("Error accessing camera:", error);
                alert("Could not access camera. Please check permissions.");
            });
    };

    return (
        <div>
      <h2>Sender</h2>
      <button onClick={initiateConn}>Send data</button>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", maxWidth: "800px", marginTop: "20px" }}
      />
    </div>
    );
};
