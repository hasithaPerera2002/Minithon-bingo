// app/api/nft-image/[cid]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { cid: string } },
) {
  const { cid } = params;
  console.log(`Fetching image for CID: ${cid}`);
  
  // upstream image URL (using Lighthouse gateway)
  const upstreamUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
  // fetch the raw image bytes
  console.log(`Fetching image from: ${upstreamUrl}`);
  
  const upstreamRes = await fetch(upstreamUrl);
  if (!upstreamRes.ok) {
    return NextResponse.error();
  }
  // grab the Content-Type so the browser knows it’s an image
  const contentType =
    upstreamRes.headers.get("Content-Type") || "application/octet-stream";
  // read it as ArrayBuffer (binary)
  const arrayBuffer = await upstreamRes.arrayBuffer();
  // return it inline with the proper header
  console.log(arrayBuffer);
  
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": contentType,
      // cache aggressively if you like:
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
