//dependencies------------------------------------------------------------------
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require('path');

//paths to proto file
const PROTO_USERS = path.join(__dirname, "..", "..", "/services/prototipes/users.proto");
//options needed for loading Proto file
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
//load prototipes
const pkgDefsUsers = protoLoader.loadSync(PROTO_USERS, options);
//load Definition into gRPC
const UsersService = grpc.loadPackageDefinition(pkgDefsUsers).users.USERS;
//create clients
const clientUsers = new UsersService(
    "192.168.30.127:50052",
    grpc.credentials.createInsecure()
);

// Exporting variables and functions
module.exports = {clientUsers}