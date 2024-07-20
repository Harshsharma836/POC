const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

const accessToken = process.env.token;

const app = express();
app.use(express.json());

let secret = "";

app.post("/receiveWebhook", (req, res) => {
  try{
    if (req.headers["x-hook-secret"]) {
      secret = req.headers["x-hook-secret"];
      res.setHeader("X-Hook-Secret", secret);
      res.sendStatus(200);

    } else if (req.headers["x-hook-signature"]) {
      const computedSignature = crypto
        .createHmac("SHA256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (
        !crypto.timingSafeEqual(
          Buffer.from(req.headers["x-hook-signature"]),
          Buffer.from(computedSignature)
        )
      ) {
        res.sendStatus(401);
      } else {
        res.sendStatus(200);
        console.log(`Events on ${Date()}:`);
        console.log(req.body.events);
        req.body.events.forEach((event) => {
          fetchTask(event.resource.gid);
        });
      }
    } else {
      console.error("Something went wrong!");
    }
  }
  catch(error){
    res.json({
      msg : error
    })
  }
});

async function fetchTask(taskId) {
  const url = `https://app.asana.com/api/1.0/${taskId}`;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  try {
    const response = await axios.get(url, { headers });
    console.log(response?.data?.data);
  } catch (err) {
    console.log(err.message);
  }
}

app.listen(8080, () => {
  console.log(`Server started on port 8080`);
});