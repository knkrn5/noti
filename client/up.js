const fileInput = document.getElementById("fileInput");
const imgPreview = document.getElementById("image-preview");

async function getSignUrl({ key, method, contentType, download }) {
  const url = new URL("http://localhost:3000/signurl");
  url.searchParams.append("objectKey", key);
  url.searchParams.append("method", method);
  if (method === "PUT" && contentType) {
    url.searchParams.append("contentType", contentType);
  }
  if (method === "GET" && download) {
    url.searchParams.append("download", download.toString());
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to get signed URL: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("received signed url", data);

  return data;
}

function updateImgUrl(url) {
  imgPreview.src = url;
}

function downloadFile(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  console.log("uploading file", file);
  if (!file) return;

  const key = file.name;
  const contentType = file.type || "application/octet-stream";
  const download = false;
  const { url: puturl } = await getSignUrl({
    key,
    method: "PUT",
    contentType,
    download,
  });

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(puturl, {
      method: "PUT",
      // body: formData,
      headers: { "Content-Type": contentType },
      body: file,
    });

    if (response.ok) {
      console.log("File uploaded successfully", response);

      const { url: geturl } = await getSignUrl({
        key,
        method: "GET",
        contentType,
        download,
      });

      if (download) {
        downloadFile(geturl, key);
      } else {
        updateImgUrl(geturl);
      }
    } else {
      console.error("File upload failed", await response.text());
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
});
