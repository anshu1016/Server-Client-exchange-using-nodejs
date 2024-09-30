//function 1 solution for Call Type 1: Stream All Packets
// Run this code node index.js but before this run the required server node main.js
const net = require("net");

const HOST = "127.0.0.1";
const PORT = 3000;

// Create request payloads
const createPayload = (callType, resendSeq = 0) => {
  const buffer = Buffer.alloc(2);
  buffer.writeInt8(callType, 0);
  buffer.writeInt8(resendSeq, 1);
  return buffer;
};

const parsePacket = (packet) => {
  if (packet.length !== 17) {
    console.error("Invalid packet length:", packet.length);
    return null;
  }

  const symbol = packet.toString("ascii", 0, 4).trim();
  const buySellIndicator = packet.toString("ascii", 4, 5);
  const quantity = packet.readInt32BE(5);
  const price = packet.readInt32BE(9);
  const packetSequence = packet.readInt32BE(13);

  return { symbol, buySellIndicator, quantity, price, packetSequence };
};

const handleResponse = (data) => {
  const PACKET_SIZE = 17;
  let offset = 0;

  while (offset + PACKET_SIZE <= data.length) {
    const packet = data.slice(offset, offset + PACKET_SIZE);
    const parsedPacket = parsePacket(packet);

    if (parsedPacket) {
      console.log(parsedPacket);
    } else {
      console.error("Failed to parse packet:", packet);
    }

    offset += PACKET_SIZE;
  }
};

const client = net.createConnection(PORT, HOST, () => {
  console.log("Connected to BetaCrew server.");

  const payload = createPayload(1);

  client.write(payload);
});

client.on("data", (data) => {
  handleResponse(data);
});

client.on("error", (err) => {
  console.error(`Error: ${err.message}`);
});

client.on("end", () => {
  console.log("Disconnected from the server. Reconnect to server to fetch again");
  client.end();
});
