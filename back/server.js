require('dotenv').config();
const fs = require('fs');
const express = require('express');
const mqtt = require('mqtt');
const { parse } = require('path');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const {
  MQTT_URL,
  MQTT_TOPIC,
  MQTT_CLIENT_ID,
  MQTT_QOS,
  MQTT_CA_PATH,
  MQTT_CLIENT_CERT_PATH,
  MQTT_CLIENT_KEY_PATH,
  HTTP_PORT
} = process.env;

// --- MQTT Options for mutual TLS ---
const mqttOptions = {
  clientId: MQTT_CLIENT_ID || `backend-${Math.random().toString(16).slice(2,8)}`,
  protocol: 'mqtts',
  rejectUnauthorized: true,
  ca: fs.readFileSync(MQTT_CA_PATH),
  cert: fs.readFileSync(MQTT_CLIENT_CERT_PATH),
  key: fs.readFileSync(MQTT_CLIENT_KEY_PATH),
  keepalive: 60,
  reconnectPeriod: 5000,
};

// --- In-memory message store ---
let messages = [];   // keep last 200 messages
const MAX_MESSAGES = 200;

// --- MQTT connection ---
console.log(`Connecting to MQTT broker ${MQTT_URL} using mTLS...`);
const mqttClient = mqtt.connect(MQTT_URL, mqttOptions);

mqttClient.on('connect', () => {
  console.log('✅ MQTT connected with mTLS');
  mqttClient.subscribe(MQTT_TOPIC, { qos: Number(MQTT_QOS || 0) }, (err, granted) => {
    if (err) console.error('Subscribe error:', err);
    else console.log('Subscribed:', granted.map(g => g.topic).join(', '));
  });
});

mqttClient.on('message', (topic, payloadBuffer) => {
  const payload = payloadBuffer.toString();
  let parsed;
  try { parsed = JSON.parse(payload); } catch {}

  messages.unshift({
    topic,
    payload: parsed,
    timestamp: Date.now()
  });
  console.log('Topic :', topic, ' | Payload :', parsed, ' | Timestamp :', messages.timestamp);

  if (messages.length > MAX_MESSAGES) messages.pop();
});

// --- Simple HTTP endpoint for the front ---
app.get('/messages', (req, res) => {
  res.json({
    count: messages.length,
    messages
  });
});

app.get('/health', (req, res) => res.json({ ok: true }));

// --- Start server ---
app.listen(HTTP_PORT || 3001, () => {
  console.log(`HTTP server running on port ${HTTP_PORT || 3001}`);
});
