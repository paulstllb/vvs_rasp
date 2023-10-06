const BASE_URL = "https://www3.vvs.de/mngvvs/XML_DM_REQUEST?";
const fs  = require('fs');
const LCD = require('raspberrypi-liquid-crystal');
const lcd = new LCD( 1, 0x27, 16, 2 );
lcd.beginSync();
setInterval(()=>update(),1000*10);

function update(){
const apiUrl = retrieveStationData(6503,0)

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Hier können Sie die Daten aus der API-Antwort verarbeiten
    
    fs.writeFile('./test.json',JSON.stringify(data),()=>{})
    let daata = new UBahnInfo(data);
    let newArray = daata.getDepartureTimes('U2').concat(daata.getDepartureTimes('U29'),daata.getDepartureTimes('91'))
    let DatenArray = newArray.sort((a,b)=>a[1]-b[1]);
    lcd.clearSync();
    lcd.printSync(DatenArray[0][0].toString()+"  "+DatenArray[0][1].getHours().toString()+":"+DatenArray[0][1].getMinutes().toString()+"  "+DatenArray[0][2].toString());
    lcd.setCursorSync(0, 1);
    lcd.printSync(DatenArray[1][0].toString()+ "  "+DatenArray[1][1].getHours().toString()+":"+DatenArray[1][1].getMinutes().toString()+ "  "+ DatenArray[1][2].toString());
    return newArray.sort((a,b)=>a[1]-b[1])
  })
  .catch(error => {
    console.error('Fehler bei der Anfrage:', error);
  });
    
  

}
class UBahnInfo {
    constructor(data) {
        this.data = data;
    }



    // Extract departure times for a given vehicle name
    getDepartureTimes(vehicleName) {
        const stopEvents = this.data.stopEvents || [];
        const departureTimes = [];
        const departureEstimated=[]

        for (let event of stopEvents) {
            const transportationName = event.transportation && event.transportation.disassembledName;
            if (transportationName === vehicleName) {
                departureTimes.push([event.departureTimePlanned, event.departureTimeBaseTimetable]);
            }
        }

        return departureTimes.map(d=>[vehicleName,new Date(d[0]), new Date(d[0])-new Date(d[1]) ]);
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
