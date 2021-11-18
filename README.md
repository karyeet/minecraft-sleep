# minecraft-sleep
Safely shutdown you minecraft server when there are no players online and start when someone tries to connect.

## To setup:
1. Install [node.js](https://nodejs.org/en/download/)
2. Download the & unzip files from this repository into their own folder
3. Configure options.json
4. Open command prompt and run `npm install` inside the folder containing files from this repository

## To Start:
1. Open command prompt and run `node .` inside the folder containing files from this repository

## To Stop:
1. If your minecraft server is running, shutdown your minecraft server using `stop` inside the GUI
2. Close the cmd window used to start or click the cmd and hit `ctrl+c` twice

## Notes:

* The server will immediately start when you start this app.
* If there are no players online, the app will check one more time before shutting down the server.
* If a player tries to connect, the app will immeditely start the server but will wait `SecondsToWaitForServerToStart` seconds before checking for players.
