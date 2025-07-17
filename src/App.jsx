import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import * as handpose from "@tensorflow-models/handpose";
import { drawRect, drawHands } from "./utilities.js";

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRef1 = useRef(null);
  const canvasRef1 = useRef(null);
  const [cameraMode, setCameraMode] = useState("user"); // Rear by default

  const runCoco = async () => {
    await tf.setBackend("webgl");
    await tf.ready();
    const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      video.width = videoWidth;
      video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const obj = await net.detect(video);
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  const runHandPose = async () => {
    await tf.setBackend("webgl");
    await tf.ready();
    console.log("Loading handpose model...");
    const net = await handpose.load();
    console.log("Handpose model loaded ✅");
    setInterval(() => {
      detect1(net);
    }, 100);
  };

  const detect1 = async (net) => {
    try {
      if (
        webcamRef1.current &&
        webcamRef1.current.video &&
        webcamRef1.current.video.readyState === 4
      ) {
        const video = webcamRef1.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;
        canvasRef1.current.width = videoWidth;
        canvasRef1.current.height = videoHeight;

        const hands = await net.estimateHands(video);
        console.log(hands)
        const ctx = canvasRef1.current.getContext("2d");
        drawHands(hands, ctx);
      }
    } catch (err) {
      console.error("Hand detection error:", err);
    }
  };

  useEffect(() => {
    // runCoco();
    runHandPose();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        TensorFlow.js Hand Detection
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* COCO SSD Section */}
        {/* <div className="relative w-[320px] md:w-[640px] h-[240px] md:h-[480px] bg-black rounded-lg overflow-hidden shadow-lg">
          <Webcam
            ref={webcamRef}
            muted
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 10,
              objectFit: "cover",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 9,
            }}
          />
        </div> */}

        {/* Handpose Section */}
        <div className="relative w-[320px] md:w-[640px] h-[240px] md:h-[480px] bg-black rounded-lg overflow-hidden shadow-lg">
          <Webcam
            ref={webcamRef1}
            muted
            videoConstraints={{
              facingMode:
                cameraMode && cameraMode === "user"
                  ? cameraMode
                  : { exact: cameraMode },
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 10,
              objectFit: "cover",
            }}
          />
          <canvas
            ref={canvasRef1}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 12,
            }}
          />
        </div>
      </div>

      <button
        onClick={() =>
          setCameraMode((prev) => (prev === "user" ? "environment" : "user"))
        }
        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
      >
        Toggle Camera ({cameraMode === "user" ? "Front" : "Rear"})
      </button>
    </div>
  );
};

export default App;
