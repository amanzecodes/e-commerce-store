import { Server } from "socket.io";
import http from "http";
import express from 'express'
const app = express();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3500", // frontend URL
    methods: ["GET", "POST"],
  },
});