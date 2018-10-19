var Web3 = require("web3");
var ROPSTEN_WSS = "wss://ropsten.infura.io/ws";
var provider = new Web3.providers.WebsocketProvider(ROPSTEN_WSS);
var web3 = new Web3(provider);



// here goes the DB connection
var db = "";

var MoatRopstenAddress = "0x833C47625383F657A7e2ef64a889F9179E8c0E52";


provider.on("error", e => {
    console.error("WS Infura Error", e);
});

provider.on("end", e => {
    console.log("WS closed");
    console.log("Attempting to reconnect...");
    provider = new Web3.providers.WebsocketProvider(ROPSTEN_WSS);
    provider.on("connect", function () {
        console.log("WSS Reconnected");
    });
    web3.setProvider(provider);
});

var myContract = new web3.eth.Contract([{
    "anonymous": false,
    "inputs": [
        {
            "indexed": false,
            "name": "ManagerAddr",
            "type": "address"
        },
        {
            "indexed": false,
            "name": "Investor",
            "type": "address"
        },
        {
            "indexed": false,
            "name": "FundName",
            "type": "string"
        },
        {
            "indexed": false,
            "name": "ManagerName",
            "type": "string"
        },
        {
            "indexed": false,
            "name": "UnitAddress",
            "type": "address"
        },
        {
            "indexed": false,
            "name": "UnitsIssued",
            "type": "uint256"
        }
    ],
    "name": "eInvest",
    "type": "event"
}], MoatRopstenAddress);

// checking the block number till where the events has been read.
// optimised this process.
setInterval(function() {
    if (db) {
        db.ref("moatgovern/block").once("value").then((data) => {
            var data = data.val() || 0;
            web3.eth.getBlockNumber().then((blockNumber) => {
                db.ref("moatgovern/block").set(blockNumber);
            });
            getEvents(data);
        }).catch((err) => {
            console.error(err);
        });
    } else {
        getEvents(0);
    }
}, 15 * 1000);

// reading past events from stated block to latest block
function getEvents(block) {
    myContract.getPastEvents("eInvest", {
        filter: {myIndexedParam: [20,23]},
        fromBlock: block,
        toBlock: "latest"
    }, function(error, events) {
        if (error) {
            console.error(error);
            // push.note({
            //     title: "[ERROR] eInvest Event",
            //     note: String(error)
            // });
        } else {
            for (var i = 0; i < events.length; i++) {
                AddNewInvest(events[i]);
            }
        }
    });
}

// storing in db
function AddNewInvest(event) {
    console.log(event);
    // add the event data to our central database
}
