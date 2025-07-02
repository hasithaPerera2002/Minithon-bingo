import fs from "fs";

export const downloadFile = async (cid, path) => {
  fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`)
    .then((response) => {
      if (response.ok) return response.buffer();
      throw new Error("Network response was not ok.");
    })
    .then((buffer) => {
      fs.writeFile(path, buffer, () => {
        console.log(`File saved to ${path}`);
      });
    })
    .catch((error) => {
      console.error("Failed to save the file:", error);
    });
};
