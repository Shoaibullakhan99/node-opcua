const express = require('express');
const cors = require('cors');
const { OPCUAClient, AttributeIds, CreateSessionRequest, AccessRestrictionsFlag, AttributeOperand, UserIdentityToken } = require('node-opcua');
const async = require('async')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();


app.use(cors());

const endpointUrl = 'opc.tcp://ip:address:4840';
const client = OPCUAClient.create({
  endpointMustExist: false,
  certificateExpired: false,
  keepSessionAlive: true, 
  logLevel: 'debug'
});

//Initializing and declaring session name
let the_session;

client.on('backoff', (retry, delay) => {
  console.log(`try to connect to ${endpointUrl}, retry ${retry} next attempt in ${delay / 1000} sec`);
});

client.on('connection_lost', (err) => {
  console.error('Client lost connection to the OPC UA server:', err.message);
});

client.on('socket_error', (err) => {
  console.error('Client socket error:', err.message);
});

let sessionCount = 0;
const maxSessions = 15;

function createSession(callback) {
  if (sessionCount >= maxSessions) {
    console.log('Max number of sessions reached');
    callback();
    return;
  }

  if (the_session) {
    console.log('Using existing session...');
    sessionCount++;
    callback();
  } else {
    client.createSession((err, session) => {
      if (err) {
        console.error('Failed to create OPC UA session:', err.message);
        callback(err);
      } else {
        the_session = session;
        console.log('Session created');
        sessionCount++;
        callback();
      }
    });
  }
}

function closeSession(callback) {
  if (the_session) {
    console.log('Closing session...');
    the_session.close((err) => {
      if (err) {
        console.error('Error closing session:', err.message);
        callback(err);
      } else {
        console.log('Session closed');
        the_session = null;
        sessionCount--;
        callback();
      }
    });
  } else {
    console.log('No session to close');
    callback();
  }
}

async.series([
  function(callback) {
    client.connect(endpointUrl, (err) => {
      if (err) {
        console.log(`cannot connect to endpoint: ${endpointUrl}`);
        callback(err);
      } else {
        console.log('connected!!');
      }
      callback();
    });
  },

  function(callback) {
    // client.createSession((err, session) => {
    //   if (err) {
    //     return callback(err);
    //   }
    //   the_session = session;
    //   console.log('session started');
    //   callback();
    // });
    createSession(callback);
  },

  function(callback) {
    setInterval(() => {
      // autoSS
      the_session.read({ nodeId:"", attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading autoSS:', err.message);
          return;
        }
        const autoSSResult = dataValue.value.value;
        console.log(`autoSS: ${autoSSResult}`);
        app.set('autoSS', autoSSResult);
      });

      // manualSS
      the_session.read({ nodeId:"", attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading manualSS:', err.message);
          return;
        }
        const manualSSResult = dataValue.value.value;
        console.log(`manualSS: ${manualSSResult}`);
        app.set('manualSS', manualSSResult);
      });

       //Control ON
       the_session.read({nodeId: "", attributeId: AttributeIds.Value}, (err, dataValue) => {
        if(err) {
          console.log(`Error reading COntrol ON`);
          return;
        }
        const controlOnResult = dataValue.value.value;
        console.log(`controlON: ${controlOnResult}`);
        app.set('controlON', controlOnResult);
      })

      //Vibratory Bowl
      the_session.read({ nodeId:"", attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading vibratory bowl:', err.message);
          return;
        }
        const vibratoryBowlResult = dataValue.value.value;
        console.log(`vibratoryBowl: ${vibratoryBowlResult ? 'ON' : 'OFF'}`);
        app.set('vibratoryBowl', vibratoryBowlResult);
      });

      // MachineStatus
      the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading machine status:', err.message);
          return;
        }
        const machineStatusResult = dataValue.value.value;
        console.log(`MachineStatus: ${machineStatusResult}`);
        app.set('machineStatus', machineStatusResult);
      });

      // ###################---VARIANT SELECTION---################### //

      //Variant 1
      the_session.read({nodeId:"", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err) {
          console.log('Error reading Variant 1', err.message);
          return;
        }
        const variantOneResult = dataValue.value.value;
        console.log(`variant1 : ${variantOneResult}`)
        app.set('variantOne', variantOneResult); 
      })

      // //Variant 2
      the_session.read({nodeId:"", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err) {
          console.log('Error reading Variant 2', err.message);
          return;
        }
        const variantTwoResult = dataValue.value.value;
        console.log(`variant2 : ${variantTwoResult}`)
        app.set('variantTwo', variantTwoResult); 
      })

      // //Vriant 3
      the_session.read({nodeId:"", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err) {
          console.log('Error reading Variant 3', err.message);
          return;
        }
          const variantThreeResult = dataValue.value.value;
        console.log(`variant3 : ${variantThreeResult}`)
        app.set('variantThree', variantThreeResult); 
      })

      // //Variant 4
      the_session.read({nodeId:"", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err) {
          console.log('Error reading Variant 4', err.message);
          return;
        }
        const variantFourResult = dataValue.value.value;
        console.log(`variant4 : ${variantFourResult}`)
        app.set('variantFour', variantFourResult); 
      })



      // Voltage
      the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading voltage:', err.message);
          return;
        }
        const voltageResult = dataValue.value.value;
        console.log(`Voltage: ${voltageResult}`);
        app.set('voltage', voltageResult);
    });

    // Current
    the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
      if (err) {
        console.error('Error reading current:', err.message);
        return;
      }
      const currentResult = dataValue.value.value;
      console.log(`Current: ${currentResult}`);
      app.set('current', currentResult);
    });
  
    // Frequency
    the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
      if (err) {
        console.error('Error reading frrequency:', err.message);
        return;
      }
      const frequencyResult = dataValue.value.value;
      console.log(`Frequency: ${frequencyResult}`);
      app.set('frequency', frequencyResult);
    });
  
    // Power
    the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
      if (err) {
        console.error('Error reading power:', err.message);
        return;
      }
      const powerResult = dataValue.value.value;
      console.log(`Power: ${powerResult}`);
      app.set('power', powerResult);
    });

    //RUNNING
    the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading running:', err.message);
          return;
        }
        const runningResult = dataValue.value.value;
        console.log(`running: ${runningResult}`);
        app.set('running', runningResult);
      });

      //ROBOT HEALTH
      the_session.read({nodeId: "", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err) {
          console.log('Error reading robot health', err.message);
          return;
        }
        const robotHealthResult = dataValue.value.value;
        console.log(`robotHealth : ${robotHealthResult}`);
        app.set('robotHealth', robotHealthResult);
      })

      //Moons Motor Selection
      the_session.read({nodeId: "", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err) {
          console.log('Error reading motor selection', err.message);
          return;
        }
        const motorSelectionResult = dataValue.value.value;
        console.log(`motorSelection : ${motorSelectionResult}`)
        app.set('motorSelection', motorSelectionResult);
      })

      //moons communication
      the_session.read({nodeId: "", attributeId: AttributeIds.Value}, (err, dataValue) => {
        if(err){
          console.log('Error reading moons communication');
          return;
        }
        const moonsCommunicationResult = dataValue.value.value;
        console.log(`moonsCommunication : ${moonsCommunicationResult}`);
        app.set('moonsCommunication', moonsCommunicationResult);
      })

      //227 moons motor running
      the_session.read({nodeId: "", attributeId: AttributeIds.Value}, (err, dataValue)=>{
        if(err){
          console.log(`Error reading motor running `, err.message);
          return;
        }
        const motorRunningResult = dataValue.value.value;
        console.log(`motorRunning : ${motorRunningResult}`);
        app.set('motorRunning', motorRunningResult);
      })

    //INDEXING SERV0
    the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading Indexing Servo:', err.message);
          return;
        }
        const indexingServoResult = dataValue.value.value;
        console.log(`indexingServo: ${indexingServoResult}`);
        app.set('indexingServo', indexingServoResult);
      });


    //ledOk
    the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading LED OK:', err.message);
          return;
        }
        const ledOkResult = dataValue.value.value;
        console.log(`ledOK: ${ledOkResult}`);
        app.set('ledOK', ledOkResult);
      });

      the_session.read({ nodeId: '', attributeId: AttributeIds.Value }, (err, dataValue) => {
        if (err) {
          console.error('Error reading LED NOT OK:', err.message);
          return;
        }
        const ledNotOkResult = dataValue.value.value;
        console.log(`ledNotOK: ${ledNotOkResult}`);
        app.set('ledNotOK', ledNotOkResult);
      });
      // console.log('########################----END----######################')
  }, 5000);
  callback();  
}
,

  // function(callback) {
  //   setInterval(() => {
  //     closeSession(callback);
  //   }, 7000)
  // }

] 
  , 
    (err) => {
    if (err) {
      console.error('Failed to create OPC UA session:', err.message);
      client.disconnect(() => console.log('Client disconnected'));
      return;
    }
  
    console.log('OPC UA session created successfully');
  
    process.on('SIGINT', async () => {
      try {
        console.log('Closing OPC UA session');
        await the_session.close();
        console.log('OPC UA session closed successfully');
      } catch (err) {
        console.error('Error closing OPC UA session:', err.message);
      } finally {
        client.disconnect(() => console.log('Client disconnected'));
        process.exit(0);
      }
    });
  }
  );

//..............Application program interface...........
app.get('/data', (req, res) => {
const autoSS = app.get('autoSS');
const manualSS = app.get('manualSS');
const vibratoryBowl = app.get('vibratoryBowl')
const machineStatus = app.get('machineStatus');
const voltage = app.get('voltage');
const current = app.get('current');
const frequency = app.get('frequency');
const power = app.get('power');
const ledOK = app.get('ledOK');
const ledNotOK = app.get('ledNotOK');
const indexingServo = app.get('indexingServo');
const running = app.get('running');
const robotHealth = app.get('robotHealth');
const variantOne = app.get('variantOne');
const variantTwo = app.get('variantTwo');
const variantThree = app.get('variantThree');
const variantFour = app.get('variantFour');
const motorSelection = app.get('motorSelection')
const moonsCommunication = app.get('moonsCommunication');
const motorRunning = app.get('motorRunning');
const controlON = app.get('controlON')
const data = {
autoSS, 
manualSS, 
vibratoryBowl, 
machineStatus, 
voltage,
current, 
frequency, 
power, 
ledOK,
ledNotOK, 
indexingServo, 
running, 
robotHealth, 
variantOne, 
variantTwo, 
variantThree, 
variantFour, 
motorSelection, 
moonsCommunication,
motorRunning, 
controlON 
};
res.json(data);
});

app.listen(8080, () => {
console.log('Server LIVE and RUNNING on port 8080');
});


//MONGO_DB Database

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/my_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

const dataSchema = new mongoose.Schema({
  autoSS: Number,
  manualSS: Number,
  vibratoryBowl: Boolean,
  machineStatus: String,
  voltage: Number,
  time : { type : Date, default: Date.now }
});
const Data = mongoose.model('Data', dataSchema);
setInterval(() => {
  // Read OPC UA values and set app variables...

  const newData = new Data({
    autoSS: app.get('autoSS'),
    manualSS: app.get('manualSS'),
    vibratoryBowl: app.get('vibratoryBowl'),
    machineStatus: app.get('machineStatus'),
    voltage: app.get('voltage')
  });

  newData.save()
  .then(() => {
    console.log('Data saved to MongoDB');
  })
  .catch((error) => {
    console.error('Error saving data to MongoDB:', error.message);
  });

}, 5000);
