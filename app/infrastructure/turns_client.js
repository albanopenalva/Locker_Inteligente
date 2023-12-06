//dependencies------------------------------------------------------------------
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require('path');

//paths to proto file
const PROTO_TURNS = path.join(__dirname, "..", "..", "/services/prototipes/turns.proto");
//options needed for loading Proto file
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
//load prototipes
const pkgDefsTurns = protoLoader.loadSync(PROTO_TURNS, options);
//load Definition into gRPC
const TurnsService = grpc.loadPackageDefinition(pkgDefsTurns).turns.TURNS;
//create clients
const clientTurns = new TurnsService(
    "192.168.30.127:50053",
    grpc.credentials.createInsecure()
);

// Exporting variables and functions
module.exports = {clientTurns}
