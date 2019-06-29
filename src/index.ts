import csv from "csv-parser";
import express from "express";
import fs from "fs"

const app = express();
// const port = 8080; // default port to listen

// app.get('/public/hc', (req, res) => res.end('OK'));

let args = process.argv.slice(2);
let leadFile = args[0];
let agentFile = args[1];

/**
 * Reads a CSV file and returns an object
 *
 * @param  {String} fileName
 * @return {Object}
 */
async function readFile(csvData: any){
  return new Promise( await function(resolve,reject){
    var data = new Array();
    try{
      fs
      .createReadStream(csvData)
      .pipe(csv())
      .on('data', row => data.push(row))
      .on('end', () => resolve(data));
    }
    catch(err){
      reject(err)
    }
  });
}

/**
 * From list of Agent Objects, fetch the ones available and repeat by weight
 *
 * @param  {Array} agents
 * @return {Array}
 */
function getAvailableAgents(agents: any){
  let availableAgents: number[] = []

  for (let agent of agents) {
    if (agent['Status'] != 'Busy') {
      for (let i=0; i < agent['Weight']; i++) {
        availableAgents.push(agent['ID']);
      }
    }
  }

  return availableAgents;
}

/**
 * Assign leads based on available agents
 *
 */
async function getAssignedLeads(){
  let leads: any = await readFile(leadFile);
  let agents: any = await readFile(agentFile);
  let availableAgents: number[] = getAvailableAgents(agents);
  let agentCounter: number = 0

  for (let i=0; i < leads.length; i++){
    if (typeof availableAgents[agentCounter] == 'undefined'){
      agentCounter = 0
    }
    leads[i]['assignedToAgentId'] = availableAgents[agentCounter];
    agentCounter += 1;
  }

  console.log(leads);
  return leads;
}

getAssignedLeads()

// start the Express server
// app.listen( port, () => {
//     // tslint:disable-next-line:no-console
//     console.log( `server started at http://localhost:${ port }` );
// } );
