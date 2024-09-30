//function 1 solution for Call Type 2: Resend Packet
// Run this code node server.js but before this run the required server node main.js

const net = require("net");

const HOST = "127.0.0.1";
const PORT = 3000;

const createPayload = (callType, resendSeq = 0) => {
  const buffer = Buffer.alloc(2);
  buffer.writeInt8(callType, 0);
  buffer.writeInt8(resendSeq, 1);
  return buffer;
};

const client = net.createConnection(PORT, HOST, () => {
  console.log("Connected to BetaCrew server.");

  const sequenceToResend = 1;
  const payload = createPayload(2, sequenceToResend);
  client.write(payload);
});

client.on("data", (data) => {
  handleResponse(data);
});

const handleResponse = (data) => {
  const PACKET_SIZE = 17;
  let offset = 0;

  while (offset + PACKET_SIZE <= data.length) {
    const packet = data.slice(offset, offset + PACKET_SIZE);
    const parsedPacket = parsePacket(packet);
    console.log(parsedPacket);
    offset += PACKET_SIZE;
  }
};

const parsePacket = (packet) => {
  const symbol = packet.toString("ascii", 0, 4);
  const buySellIndicator = packet.toString("ascii", 4, 5);
  const quantity = packet.readInt32BE(5);
  const price = packet.readInt32BE(9);
  const packetSequence = packet.readInt32BE(13);

  return { symbol, buySellIndicator, quantity, price, packetSequence };
};

client.on("error", (err) => {
  console.error(`Error: ${err.message}`);
});

client.on("end", () => {
  console.log("Disconnected from the server.");
});
