const BASE_URL = "https://www3.vvs.de/mngvvs/XML_DM_REQUEST?";
const fs  = require('fs');
const apiUrl = retrieveStationData(6503,0)

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Hier können Sie die Daten aus der API-Antwort verarbeiten
    
    fs.writeFile('./test.json',JSON.stringify(data),()=>{})
    let daata = new UBahnInfo(data);
    daata.getDepartureTimes('91');
    console.log(daata.getDepartureTimes('U2'))
    console.log(daata.getDepartureTimes('U29'))
    console.log(daata.getDepartureTimes('91'))
    ausgabe();
  })
  .catch(error => {
    console.error('Fehler bei der Anfrage:', error);
  });



 function ausgabe(){
    console.log("U2:   ");
 }



class UBahnInfo {
    constructor(data) {
        this.data = data;
    }

    // Extract departure times for a given vehicle name
    getDepartureTimes(vehicleName) {
        const stopEvents = this.data.stopEvents || [];
        const departureTimes = [];

        for (let event of stopEvents) {
            const transportationName = event.transportation && event.transportation.disassembledName;
            if (transportationName === vehicleName) {
                departureTimes.push(event.departureTimePlanned);
            }
        }

        return departureTimes.map(d=>new Date(d) );
    }
}



function retrieveStationData(stationId, offset) {
    
    var url = BASE_URL +
        `limit=40&`+
        `mode=direct&`+
        `name_dm=${stationId}&`+
        `outputFormat=rapidJSON&`+ //`outputFormat=JSON&`
        `type_dm=any&`+
        `useRealtime=1`;

    if (offset != undefined) {
        var d = new Date();
        d.setMinutes(d.getMinutes() + offset);
        url += `&itdDateYear=` + d.getFullYear().toString();
        url += `&itdDateMonth=` + (d.getMonth() + 1).toString();
        url += `&itdDateDay=` + d.getDate().toString();
        url += `&itdTimeHour=` + d.getHours().toString();
        url += `&itdTimeMinute=` + d.getMinutes().toString();
         
    }
    return url;
    
}