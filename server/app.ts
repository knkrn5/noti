import expres from "express";
import webpush from "web-push";
import { AwsService } from "./aws";

// import dns from 'node:dns'
// dns.setDefaultResultOrder('ipv4first')

const app = expres();

app.get("/", (req, res) => {
  res.send("Hello World");
});

let subscriptions: any = [];
console.log("subscriptions", subscriptions);

// const vapidKeys = webpush.generateVAPIDKeys();
// console.log("vapidkeys", vapidKeys);

const publicKey = "test";
const privateKey = "test two";

// webpush.setVapidDetails("mailto:example@yourdomain.org", publicKey, privateKey);

app.use(expres.json());
app.use(expres.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const protocol = req.protocol;
  const host = req.get("host");
  const origin = `${protocol}://${host}`;
  const fullUrl = `${origin}${req.originalUrl}`;
  console.log("full url", fullUrl);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

async function sendWithRetry(subscription, payload, retries = 2) {
  try {
    return await webpush.sendNotification(subscription, payload);
  } catch (err) {
    if (retries > 0 && err.code === "ECONNRESET") {
      await new Promise((r) => setTimeout(r, 500));
      return sendWithRetry(subscription, payload, retries - 1);
    }
    throw err;
  }
}

// Save a subscription for a user
app.post("/subscriber", (req, res) => {
  const { id, subscription } = req.body;

  if (!id || !subscription) {
    res.status(400).json({ message: "subscriptionid are required" });
    return;
  }

  const existingIndex = subscriptions.findIndex(
    (item: any) => item.subscription.endpoint === subscription.endpoint,
  );

  const subscriber = { id, subscription };
  if (existingIndex >= 0) {
    subscriptions[existingIndex] = subscriber;
  } else {
    subscriptions.push(subscriber);
  }

  console.log("subscription from client", subscriber);
  res.status(201).json({ message: "Subscribed" });
});

// Send notification to all
app.post("/send", (req, res) => {
  const { userid, title, body } = req.body;

  if (!userid || !title || !body) {
    res.status(400).json({ message: "User ID, title, and body are required" });
    return;
  }

  const data = JSON.stringify({
    title,
    body,
  });

  /* subscriptions.forEach((subscriber: any) => {
    webpush.sendNotification(subscriber.subscription, data).catch((err) => {
      console.error("Error sending notification", err);
    });
  }); */

  const receiver = subscriptions.find((sub: any) => sub.id === userid);
  if (receiver) {
    sendWithRetry(receiver.subscription, data).catch((err) => {
      console.error("Error sending notification", err);
    });
  } else {
    console.log(`No subscription found for user ID: ${userid}`);
  }

  console.log("Total subscriptions:", subscriptions, subscriptions.length);
  res.json({ message: "Notifications sent!" });
});

app.get("/pub", async (req, res) => {
  const payload = JSON.stringify({
    title: "Order update Alert!",
    body: "Your order has been updated!",
    icon: "/icons/notification.png",
    badge: "/icons/badge.png",
    url: "https://youtube.com/watch?v=example",
    data: {
      videoId: "12345",
    },
  });

  for (const subscriber of subscriptions) {
    await sendWithRetry(subscriber.subscription, payload).catch((err) => {
      console.error("Error sending notification", err);
    });
  }

  console.log("Total subscriptions:", subscriptions.length);
  res.json({ message: "Notifications sent!" });
});

app.get("/signurl", async (req, res) => {
  const objectKey = req.query.objectKey as string;
  const method = req.query.method as string;
  const contentType = req.query.contentType as string;
  const download = req.query.download === "true";

  if (!objectKey) {
    res.status(400).json({ message: "objectKey query parameter is required" });
    return;
  }
  if (!method) {
    res.status(400).json({ message: "method query parameter is required" });
    return;
  }

  if (method === "PUT" && !contentType) {
    res
      .status(400)
      .json({
        message: "contentType query parameter is required for PUT method",
      });
    return;
  }

  /* if (method === "GET" && !download) {
    res
      .status(400)
      .json({
        message:
          "download query parameter is required for GET method",
      });
    return;
  } */

  console.log(
    "objectKey",
    objectKey,
    "method",
    method,
    "contentType",
    contentType,
  );

  try {
    let url;
    if (method === "PUT") {
      url = await AwsService.createPutPresignedUrl(objectKey, contentType);
    } else if (method === "GET") {
      url = await AwsService.createGetPresignedUrl(objectKey, download);
    } else if (method === "DELETE") {
      url = await AwsService.createDeletePresignedUrl(objectKey);
    } else {
      res
        .status(400)
        .json({ message: "Invalid method. Use PUT, GET, or DELETE." });
      return;
    }
    res.json({ url });
  } catch (error) {
    console.error("Error generating presigned URL", error);
    res.status(500).json({ message: "Error generating presigned URL" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
