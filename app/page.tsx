"use client";

import { useEffect } from "react";
import { BingoGame } from "./components/BingoGame";
import sdk from "@farcaster/frame-sdk";

export default function App() {
  useEffect( () => {
    if (document.readyState === "complete") {
       sdk.actions.ready();
    } else {
      const onLoad = () => { sdk.actions.ready(); };
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return (
    <div>
    
      <BingoGame />
    </div>
  );
}
