const BASE_URL = "https://www3.vvs.de/mngvvs/XML_DM_REQUEST?";
const fs  = require('fs');
const apiUrl = retrieveStationData(6503,0) 
//6503 BOtnang
//5006118 HBF

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Hier können Sie die Daten aus der API-Antwort verarbeiten
    
    fs.writeFile('./test.json',JSON.stringify(data),()=>{})
    let daata = new UBahnInfo(data);
    let newArray = daata.getDepartureTimes('U2').concat(daata.getDepartureTimes('U29'),daata.getDepartureTimes('91'))
    console.log(newArray.sort((a,b)=>a[1]-b[1]))
    return newArray.sort((a,b)=>a[1]-b[1])
  })
  .catch(error => {
    console.error('Fehler bei der Anfrage:', error);
  });



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

        return departureTimes.map(d=>[vehicleName,new Date(d) ]);
    }
}


function retrieveStationData(stationId, offset) {
    
    var url = BASE_URL +
        `limit=40&`+
        `mode=direct&`+
        `name_dm=${stationId}&`+
        `outputFormat=rapidJSON&`+ //outputFormat=JSON&
        `type_dm=any&`+
        `useRealtime=1`;

    if (offset != undefined) {
        var d = new Date();
        d.setMinutes(d.getMinutes() + offset);
        url += `&itdDateYear=` + d.getFullYear().toString();
        url += `&itdDateMonth=` + (d.getMonth()+1).toString();
        
        url += `&itdDateDay=` + d.getDate().toString();
        url += `&itdTimeHour=` + d.getHours().toString();
        url += `&itdTimeMinute=` + d.getMinutes().toString();
         
    }
    return url;
}