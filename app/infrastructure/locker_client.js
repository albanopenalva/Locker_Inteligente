//dependencies------------------------------------------------------------------
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require('path');

//paths to proto file
const PROTO_LOCKER = path.join(__dirname, "..", "..", "/services/prototipes/locker.proto");
//options needed for loading Proto file
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
//load prototipes
const pkgDefsLocker = protoLoader.loadSync(PROTO_LOCKER, options);
//load Definition into gRPC
const LockerService = grpc.loadPackageDefinition(pkgDefsLocker).locker.LOCKER;
//create clients
const clientLocker = new LockerService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

// Exporting variables and functions
module.exports = {clientLocker}