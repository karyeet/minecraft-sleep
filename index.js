const mcping = require("minecraft-pinger");
const net = require('net');
const { spawn } = require("child_process")
const options = require("./options.json")

console.log("Started server")
// initial start of server
let McServerChild = spawn("java", ["-Xmx"+options.ramToServer, "-Xms"+options.ramToServer, "-jar", options.mcServerExecutablePath],{"cwd":options.mcWorkingDirectory})

let checkPlayersAndServerRunning = false

// set timeout to start checking for players again
setTimeout(()=>{ 
	checkPlayersAndServerRunning = true;
},options.SecondsToWaitForServerToStart*1000)

let shutdownTimeout = false

const server = net.createServer();
server.on('connection', socket => {
	console.log('Connection attempted on port 25565');
	
	//socket.write(Buffer.from('Hello World'));
	socket.on('data',(dataBuffer)=>{
		console.log("A player attempted to connect!")

		server.close();
		server.on("close",()=>{
			//start server
			McServerChild = spawn("java", ["-Xmx"+options.ramToServer, "-Xms"+options.ramToServer, "-jar", options.mcServerExecutablePath],{"cwd":options.mcWorkingDirectory})
			console.log("Started server")
			setTimeout(()=>{ // set timeout to start checking for players again
				checkPlayersAndServerRunning = true;
			},options.SecondsToWaitForServerToStart*1000)
		})
	})
});


setInterval(()=>{ //☺☺ username of pinger
	if(checkPlayersAndServerRunning){
		mcping.pingPromise('localhost', 25565)
		.then((mcInfo)=>{
			if(mcInfo.players.online==0){
				console.log("No Players Online")
				//if this is the second check it has been 0 players
				if(shutdownTimeout){
					console.log("Shutting down server")
					checkPlayersAndServerRunning = false;
					McServerChild.stdin.write("stop\n")
					shutdownTimeout = false;
					McServerChild.on("close",()=>{
						console.log("Server shutdown")
						server.listen({ port: 25566, family: 'IPv4', address: '127.0.0.1' });
					})
				}else{
					//otherwise mark this as the first check
					shutdownTimeout = true;
				}
			}else{
				console.log(mcInfo.players.online+" Players Online");
				// there are players
				shutdownTimeout = false;
			}
		}
		)
		.catch(()=>{/* dont care */})
	}
}, options.SecondsInBetweenPlayerChecks)

/*
{
  description: { text: 'A Minecraft Server' },
  players: { max: 20, online: 0 },
  version: { name: '1.12.2', protocol: 340 },
  ping: 9
}
*/