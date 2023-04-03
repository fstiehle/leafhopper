# Leafhopper

Leafhopper is an implementation of the process channel approach: it transforms a BPMN choreography in a state channel network. 
Leafhopper is the research prototype to the paper _Process Channels: A New Layer for Process
Enactment Based on Blockchain State Channels_, submitteed to BPM 2023. See _Replicate the Case Studies_ below.

# Structure

Leafhopper uses [Chorpiler](https://github.com/fstiehle/chorpiler) for code generation and additionally implements the static trigger component capabilities, e.g., routing, signature verification etc. 
Leafhopper provides a set of automated script to assist in the deployment of the channel. It implements two case studies, for which correctness and gas cost benchmarks can be executed.

## Components

- The __channel trigger__ is a node.js server and holds the current state of the process and maintains a connection to each other trigger in the network.
It can receive requests from outside over the `/enact/:taskid` route to advance the state of the process. 
The triggers can be configured for different identities depending on the participants of the channel. 
Each trigger is run in a docker container and Leafhopper deploys them through Docker compose.
- The __channel contract__ is a solidty state channel smart contract generated by Chorpiler, Leafhopper assists in the configuration and deployment of it.


# Replicate the Case Studies

Here, we describe how to repliacte the evaluation section of _Process Channels: A New Layer for Process
Enactment Based on Blockchain State Channels_, submitteed to BPM 2023.

## Install

The project is built using node. For the correctness benchmark, additionally, Docker is required. Leafhopper has been developed for node version 19.6.

1. Install node.js.
2. Install Docker.
2. Clone the repository.
3. In the project directory run `npm install`.

## Run

To replicate the correctness benchmarks, make sure Docker is running and run `npm run case/0 correctness` for the incident management case 
and `npm run case/1 correctness` for the supply chain case in the project directory. The console output will also report interim results (Part of the process can take a while, for example, booting up the docker compose network). In the end, the script must report 
```
All conforming traces accepted! 
All non-conforming traces caught!
```
> If you force close out of the script, make sure to stop deployed docker containers and delete their images before starting another run. If the script runs through it will clean up by itself.


To replicate the gas cost benchmark run `npm run case/0 gas` for the incident management case 
and `npm run case/1 gas` for the supply chain case in the project directory. The console output will summarise the measured gas cost in a table and will also report on interim results. At the end of the run a table labelled _Total Case Cost_ is output to the console.

# Usage For Different Cases

:warning: This Section will be imporved in the future. Currently, Leafhopper is in prototype stage and not meant for production systems.

## Install

1. Install node.js.
2. Install Docker.
2. Clone the repository.
3. In the project directory run `npm install`.

## Configuration

The configuration is performed in the folder `src/configruation/'.
The BPMN model of the case should be placed in `src/config/model/case.bpmn'. Then it will be automatically picked up by the generate scripts.
Participants identities must be configured accordingly in `src/configruation/participants.config.ts.'

## Run Scripts

`npm run ...`

- `build`: Build the project and compile the contract. Requires a generate run before.
- `chain`: simulates Ethereum through ganache.
- `generate`: generates the enactment components from the config folder.
- `deploy`: deploys the channel contract to the in `src/configruation/deployment.config.ts` configured blockchain environment
- `case/0`: Run the incident management case study either with 'correctness' or 'gas'.
- `case/1`: Run the supply chain case study either with 'correctness' or 'gas'.
