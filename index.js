/* This sorta works*/

const mcping = require("minecraft-pinger");
const net = require('net');
const { suspend, resume } = require('ntsuspend');
const { spawn } = require("child_process")
const options = require("./options.json")

console.log("Starting server...")
const McServerChild = spawn("java", ["-jar","-Xmx"+options.ramToServer, options.mcServerExecutablePath],{"cwd":options.mcWorkingDirectory})

let checkPlayersAndServerRunning = true

let freezeTimeout = false

const server = net.createServer();
server.on('connection', socket => {
	console.log('Connection attempted on port 25565');
	
	socket.on('data',(dataBuffer)=>{
		console.log("A player attempted to connect!")
		checkPlayersAndServerRunning = true;

		//child unfreeze
		resume(McServerChild.pid);
	})
});
server.listen({ port: 25566, family: 'IPv4', address: '127.0.0.1' });

McServerChild.on("spawn",()=>{
	setInterval(()=>{ //☺☺ username of pinger
		if(checkPlayersAndServerRunning){
			mcping.pingPromise('localhost', 25565)
			.then((mcInfo)=>{
				if(mcInfo.players.online==0){
					console.log("No Players Online")
					//if this is the second check it has been 0 players
					if(freezeTimeout){
						console.log("Second check, still no players, freezing process")
						checkPlayersAndServerRunning = false;
						//child freeze
						suspend(McServerChild.pid);
						freezeTimeout = false;
					}else{
						//otherwise mark this as the first check
						freezeTimeout = true;
					}
				}else{
					console.log(mcInfo.players.online+" Players Online")
					McServerChild.stdin.write("say hey\n")
					// there are players
					freezeTimeout = false;
				}
			}
			)
			.catch(()=>{/* dont care */})
		}
	}, options.SecondsInBetweenPlayerChecks)
})



/*
{
  description: { text: 'A Minecraft Server' },
  players: { max: 20, online: 0 },
  version: { name: '1.12.2', protocol: 340 },
  ping: 9
}
*/