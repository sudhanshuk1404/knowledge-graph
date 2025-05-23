import express from "express";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

export default function () {
  const router = express.Router();

  router.get("/get-incomming-media", async (req, res) => {
    const user = req.query.selectedUser;
    try {
      const command = new ListObjectsV2Command({
        Bucket: "user-call-logs",
        Prefix: `calls/incoming/${user}/audio/`,
        Delimiter: "/",
      });
      const command2 = new ListObjectsV2Command({
        Bucket: "user-call-logs",
        Prefix: `calls/incoming/${user}/transcripts/`,
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      const response2 = await s3Client.send(command2);

      let calls = [];
      response.Contents.forEach((content) => {
        if (content.Key.endsWith(".mp3")) {
          const call = {
            key: content.Key,
            date: content.LastModified,
          };
          calls.push(call);
        }
      });
      let transcripts = [];
      response2.Contents.forEach((content) => {
        if (content.Key.endsWith(".txt")) {
          const transcript = {
            key: content.Key,
            date: content.LastModified,
          };
          transcripts.push(transcript);
        }
      });
      res.json({ calls: calls, transcripts: transcripts });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-outgoing-media", async (req, res) => {
    const user = req.query.selectedUser;
    const receiver = req.query.receiver;
    try {
      const command = new ListObjectsV2Command({
        Bucket: "user-call-logs",
        Prefix: `calls/outgoing/${user}/${receiver}/audio/`,
        Delimiter: "/",
      });
      const command2 = new ListObjectsV2Command({
        Bucket: "user-call-logs",
        Prefix: `calls/outgoing/${user}/${receiver}/transcripts/`,
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      const response2 = await s3Client.send(command2);

      let calls = [];
      if(response && response.Contents){
        response.Contents.forEach((content) => {
          if (content.Key.endsWith(".mp3")) {
            const call = {
              key: content.Key,
              date: content.LastModified,
            };
            calls.push(call);
          }
        });
      }
      
      let transcripts = [];
      if(response2 && response2.Contents){
        response2.Contents.forEach((content) => {
          if (content.Key.endsWith(".txt")) {
            const transcript = {
              key: content.Key,
              date: content.LastModified,
            };
            transcripts.push(transcript);
          }
        });
      }
      
      res.json({ calls: calls, transcripts: transcripts });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-users-list", async (req, res) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: "user-call-logs",
        Prefix: "calls/incoming/",
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      let users = [];
      for (let i = 0; i < response.CommonPrefixes.length; i++) {
        const user = response.CommonPrefixes[i].Prefix.split("/")[2];
        users.push(user);
      }

      res.json(users);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  });
  router.get("/get-outgoing-calls", async (req, res) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: "user-call-logs",
        Prefix: `calls/outgoing/${req.query.selectedUser}/`,
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      let recivers = [];
      if(response.CommonPrefixes==undefined){
        res.json(recivers);
        return;
      }
      for (let i = 0; i < response.CommonPrefixes.length; i++) {
        const user = response.CommonPrefixes[i].Prefix.split("/")[3];
        if(user=='audio' || user=='transcripts') continue;
        recivers.push(user);
      }
      res.json(recivers || []);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  });
  router.get("/get-call-recording", async (req, res) => {
    try {
      const command = new GetObjectCommand({
        Bucket: "user-call-logs",
        Key: req.query.key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });
      res.json({ url: signedUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-transcript", async (req, res) => {
    try {
      const command = new GetObjectCommand({
        Bucket: "user-call-logs",
        Key: req.query.key,
      });
      const response = await s3Client.send(command);
      const transcriptText = await streamToString(response.Body);
      res.json({ transcript: transcriptText });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-user-messages", async (req, res) => {
    try {
      const user = req.query.selectedUser;
      const command = new ListObjectsV2Command({
        Bucket: "user-phone-sms",
        Prefix: `messages/${user}/`,
      });
      const response = await s3Client.send(command);
      res.json(response.Contents || []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-message", async (req, res) => {
    try {
      const command = new GetObjectCommand({
        Bucket: "user-phone-sms",
        Key: req.query.key,
      });
      const response = await s3Client.send(command);
      const transcriptText = await streamToString(response.Body);
      res.json({ transcript: transcriptText });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });
  router.get("/get-docs", async (req, res) => {
    try {
      const user = req.query.selectedUser;
      const command = new ListObjectsV2Command({
        Bucket: "doc-helper-uploaded-docs",
        Prefix: `docs/${user}/`,
      });
      const response = await s3Client.send(command);
      res.json(response.Contents || []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });
  router.get("/get-doc", async (req, res) => {
    try {
      const key = req.query.key;
      const command = new GetObjectCommand({
        Bucket: "doc-helper-uploaded-docs",
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });

      res.redirect(signedUrl);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-incoming-kg", async (req, res) => {
    try {
      const user = req.query.selectedUser;
      const command = new ListObjectsV2Command({
        Bucket: "user-knowledge-graph",
        Prefix: `calls/incoming/${user}/`,
      });
      const response = await s3Client.send(command);
      let kg = []
      for(const content of response.Contents){
        if(content.Key.endsWith('knowledge_graph_memory.json')){
          kg.push(content)
        }
        else if(content.Key.endsWith('knowledge_graph_narrative.txt')){
          kg.push(content)
        }
      }
      res.json({kg:kg});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-kg", async (req, res) => {
    try {
      const command = new GetObjectCommand({
        Bucket: "user-knowledge-graph",
        Key: req.query.key,
      });
      if(req.query.key.endsWith('.txt')){
        const response = await s3Client.send(command);
        const narrattive = await streamToString(response.Body);
        res.json({ narrative: narrattive });
      }
      else if(req.query.key.endsWith('.json')){
        const response = await s3Client.send(command);
        const memory = await streamToString(response.Body);
        res.json({ memory: memory });
      }
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-outgoing-kg-recivers", async (req, res) => {
    const user = req.query.selectedUser;
    try {
      const command = new ListObjectsV2Command({
        Bucket: "user-knowledge-graph",
        Prefix: `calls/outgoing/${user}/`,
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      let users = [];
      if(response.CommonPrefixes==undefined){
        res.json({"kgRecivers":users || []});
        return;
      }
      for (let i = 0; i < response.CommonPrefixes.length; i++) {
        const user = response.CommonPrefixes[i].Prefix;
        users.push(user);
      }
      res.json({"kgRecivers":users || []});
      
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  });

  router.get("/get-outgoing-kg", async (req, res) => {
    try {
      const user = req.query.user;
      const command = new ListObjectsV2Command({
        Bucket: "user-knowledge-graph",
        Prefix: user,
      });

      const response = await s3Client.send(command);
      let kg = []
      for(const content of response.Contents){
        if(content.Key.endsWith('knowledge_graph_memory.json')){
          kg.push(content)
        }
        else if(content.Key.endsWith('knowledge_graph_narrative.txt')){
          kg.push(content)
        }
      }
      res.json({kg:kg});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  });
  
  

  return router;
}
