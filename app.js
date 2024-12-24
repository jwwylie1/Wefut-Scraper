const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");

var emptyUrl = "https://wefut.com/player/25/";

var cardsList = [];

/*4504 is the last 72
11613 is the first 64
12678 is the last 64
19155 is the first TOTW
19200-19225 is regular updates
19558-19589 is regular updates
20048-20084 is regular updates
20147 is the last card*/

// Async function which scrapes the data
async function scrapeData() {
    try {

var i=20148; //counter
var nullsites = [282,498,546,786,962,966,993,997,1051,1160,1353,1370,1388,1426,1517,1521,1672,1674,1677,1723,1896,1901,1942,2031,2040,2131,2143,2215,2225,2270,2294,
  2392,2438,2457,2522,2523,2544,2583,2616,2645,2656,2664,2709,2858,2939,3079,3083,3091,3113,3254,3265,3339,3342,3348,3495,3524,3603,3637,3643,3783,3790,3791,3871,
  4012,4020,4039,4056,4064,4185,4193,4223,4235,4239,4314,4340,4414,4444,11651,11681,11732,11809,11880,11881,11938,12015,12024,12076,12091,12094,12095,12149,12231,
  12292,12303,12418,12422,12426,12485,12486,12516,12522,12540,12555,12572,12650,12660,12661,12666,12673,19404];
var passes = 14050;
var NRB = [];

while (i<20195) {

    if (nullsites.includes(i)) {
        i++;
        passes += 1;
        continue;
    }
    url = emptyUrl + i;
      // Fetch HTML of the page we want to scrape

      const { data } = await axios.get(url);
      
      // Load HTML fetched in the previous line
      const $ = cheerio.load(data);
      // Select all the list items in plainlist class
      var rating = $(".rating").text();
      if (rating < 72 && rating != 64) {
        NRB.push(i);
        console.log(i + ': ' + rating + ' rated STOPPED');
        i++;
        passes += 1;
        continue;
      }

      var cardinfo = $("tr").text();
      var typeIndex = [cardinfo.search("Card type")+9,cardinfo.search("Card type")+17];
      var cardType = cardinfo.slice(typeIndex[0], typeIndex[1]);

      if (cardType == "Non-Rare" || cardType == "Rare Gol" || cardType == "Rare Sil" || cardType == "Rare Bro" || cardType == "Mode Mas" || cardType == "Rivals M"
        || cardType == "Champion" || cardType == "Squad Ba"
      ) {
        NRB.push(i);
        console.log(i + ': ' + cardType + ' STOPPED');
        i++;
        passes += 1;
        continue;
      }

      // Scrape site for the information
      var position = $(".position").text();
      var cardName = $(".marquee").text();
      // find where on webpage this information is
      var clubIndex = [cardinfo.search("Club")+4, cardinfo.search("League")];
      var leagueIndex = [cardinfo.search("League")+6, cardinfo.search("Nationality")];
      var nationalityIndex = [cardinfo.search("Nationality")+11, cardinfo.search("Weak foot")];
      var img;

      var fullName;

        if (cardinfo.search("Known as") == -1) { // real name is well known
            var firstIndex = [cardinfo.search("First name")+10, cardinfo.search("Last name")];
            var lastIndex = [cardinfo.search("Last name")+9, cardinfo.search("Date of")];
            fullName = cardinfo.slice(firstIndex[0], firstIndex[1]) + ' ' + cardinfo.slice(lastIndex[0], lastIndex[1]);
        }
        else { // real name is NOT well known
            var firstIndex = [cardinfo.search("Known as")+8, cardinfo.search("Date of")];
            fullName = cardinfo.slice(firstIndex[0], firstIndex[1]);
        }

      var club = cardinfo.slice(clubIndex[0], clubIndex[1]);
      var league = cardinfo.slice(leagueIndex[0], leagueIndex[1]);
      var nation = cardinfo.slice(nationalityIndex[0], nationalityIndex[1]);

      // Match Card Types Correctly
      if (cardType == "Icon\n   ") {cardType = "Icon"}
      else if (cardType == "Rare Gol") {cardType = "RG"}
      else if (cardType == "Rare Sil") {cardType = "RS"}
      else if (cardType == "Non-Rare" && rating >= 75) {cardType = "NRG"}
      else if (cardType == "Non-Rare" && rating <= 74 && rating >=70) {cardType = "NRS"}
      else if (cardType == "Rare Bro") {cardType = "RB"}
      else if (cardType == "Team of ") {cardType = "TOTW"}
      else if (cardType == "Prime He") {cardType = "Hero Prime"}
      else if (cardType == "Flashbac") {cardType = "Flashback"}
      else if (cardType == "Premier ") {cardType = "EPL POTM"}
      else if (cardType == "Squad Fo") {cardType = "Squad Foundations"}
      else if (cardType == "World To") {cardType = "Objectives"}
      else if (cardType == "FUT Hero") {cardType = "Hero"}
      else if (cardType == "UCL Road" || cardType == "UWCL Roa") {cardType = "UCLRTTK"}
      else if (cardType == "UEL Road") {cardType = "UELRTTK"}
      else if (cardType == "UECL Roa") {cardType = "UECLRTTK"}
      else if (cardType == "Premium ") {cardType = "EoaE"}
      else if (cardType == "La Liga ") {cardType = "LLPOTM"}
      else if (cardType == "Total Ru") {cardType = "Rush"}
      else if (cardType == "Trailbla") {cardType = "Trailblazer"}
      else if (cardType == "Player M") {cardType = "Moments"}
      else if (cardType == "FUT Cent") {cardType = "Centurions"}
      else if (cardType == "On This ") {cardType = "OTD Icon"}
      else if (cardType == "Liga F P") {cardType = "LFPOTM"}
      else if (cardType == "Ballon d") {cardType = "BdO"}
      else if (cardType == "Centurio") {cardType = "Cent Icon"}
      else if (cardType == "Bundesli") {cardType = "BUPOTM"}
      else if (cardType == "Track St") {cardType = "Track Stars"}
      else if (cardType == "Serie A ") {cardType = "SAPOTM"}
      else if (cardType == "FC Pro L") {cardType = "FC Pro"}
      else if (cardType == "Winter C") {cardType = "Winter Champs"}
      else if (cardType == "Thunders") {cardType = "Thunderstruck"}
      else if (cardType == "Ultimate" && league == 6) {cardType = "Succession Icon"}
      else if (cardType == "Ultimate") {cardType = "Succession"}
      else if (cardType == "Globetro") {cardType = "Globetrotters"}
      else if (cardType == "Beats") {cardType = "Cover Stars"}
      else if (cardType == "Winter W" && league == 6) {cardType = "WW Icon"}
      else if (cardType == "Winter W") {cardType = "WW"}
      else if (cardType == "Ligue 1 ") {cardType = "L1POTM"}
      /*else if (cardType == "") {cardType = ""}*/




      if (cardType == "Icon" || cardType == "RG" || cardType == "RS" || cardType == "RB" || cardType == "NRG" || cardType == "NRS" || cardType == "Hero") {
        img = "std";
      } else {
        img = "dyn";
      }


      // Match Nations Correctly
      if (nation == "Côte d'Ivoire") {nation = "Ivory Coast"}
      else if (nation == "Central African Republic") {nation = "CAR"}
      else if (nation == "Congo DR") {nation = "DR Congo"}
      else if (nation == "North Macedonia") {nation = "FYR Macedonia"}
      else if (nation == "United Arab Emirates") {nation = "UAE"}
      else if (nation == "Turkey") {nation = "Türkiye"}
      else if (nation == "Bosnia and Herzegovina") {nation = "Bosnia & Herzegovina"}
      else if (nation == "Curaçao") {nation = "Netherlands Antilles"}

      if (league == " HeroLeaguePremier League") {league = "Premier League"}
      // Match League Names Correctly
      const leagues = ['Premier League','LALIGA EA SPORTS','Serie A Enilive','Bundesliga',"Ligue 1 McDonald's",'Icons','1A Pro League','3. Liga','3F Superliga',
        'A-League','Allsvenskan','Bundesliga 2','CSL','CSSL ','Eredivisie','EFL Championship','EFL League One','EFL League Two','PKO BP Ekstraklasa','Eliteserien',
        'Finnliiga','Hellas Liga','ISL','K League 1','Primera División','LALIGA HYPERMOTION','Libertadores','Liga Azerbaijan','Liga Colombia','Liga Cyprus',
        'Liga Hrvatska','Liga Portugal','Ligue 2 BKT','MLS','Magyar Liga','SUPERLIGA','SSE Airtricity PD','ROSHN Saudi League','Scottish Prem','Serie BKT',
        'Sudamericana','Trendyol Süper Lig','United Emirates League','Ukrayina Liha','Ö. Bundesliga','Česká Liga','GPFBL','Barclays WSL','Arkema PL','NWSL',
        'Liga F','Liga Portugal Feminino','Nederland Vrouwen Liga','Ceska Liga Žen','Schweizer Damen Liga','Sverige Liga',"Scottish Women's League",'Calcio A Femminile'
      ]

      league = leagues.indexOf(league) + 1;

      // Match Clubs Names Correctly
      if (club == "Nott'm Forest") {club = "Nottm Forest"}
      else if (club == "M'gladbach") {club = "Mgladbach"}
      else if (club == "Man Utd") {club = "Manchester Utd"}
      else if (club == "Paris SG") {club = "PSG"}
      else if (club == "Hertha BSC") {club = "Hertha Berlin"}
      else if (club == "FK Bodø/Glimt") {club = "FK Bodø Glimt"}
      else if (club == "Newell's") {club = "Newells"}
      else if (club == "IDV") {club = "Independiente DV"}
      else if (club == "Brescia") {club = "Brisigonza"}
      else if (club == "Universitario" && league==41) {club = "Universitario de Vinto"}
      else if (club == "NJ/NY Gotham") {club = "Gotham FC"}
      else if (club == "Real Madrid CF") {club = "Real Madrid"}
      else if (club == "Roma") {club = "AS Roma"}
      else if (club == "Eredivisie Hero") {club = "Dutch League Hero"}
      else if (club == "Premier ") {club = "Premier League Hero"}

      var fakeDutch = ['AZ','Almelo','Almere','Deventer CF','Eindhoven Reds','FC North','Heerenveen','Goffert FC','Breda FC','CF Waalwijk','Rotterdam OG','Rotterdam South','SC Amsterdam','Sittard FC','Twente','Utrecht','FC Tilburg','Zwolle Blues'];
      var realDutch = ['AZ','Heracles Almelo','Almere City FC','Go Ahead Eagles','PSV','FC Groningen','sc Heerenveen','N.E.C. Nijmegen','NAC Breda','RKC Waalwijk','Sparta Rotterdam','Feyenoord','Ajax','Fortuna Sittard','FC Twente','FC Utrecht','Willem II','PEC Zwolle'];
      
      if (league == 15) {
        var dutchClubIndex = realDutch.indexOf(club);
        club = fakeDutch[dutchClubIndex];
      }

      if (league == 53) {club = "SC Rotterdam"}

      cardsList.push({
        cardName: cardName,
        type: cardType,
        img: img,
        ovr: rating,
        nation: nation,
        pos: position,
        lg: league,
        club: club,
        displayName: fullName,
        id: i-1-passes

      })

      i++;

      console.log(i + ': ' + fullName + ' - ' + rating + ' - ' + cardType + ' - ' + position + ' - ' + club);

}

      // Write countries array in countries.json file
      fs.writeFile("cardsList.json", JSON.stringify(cardsList), (err) => {
        if (err) {
          console.error(err);
          console.log(i);
          return;
        }
        console.log("Successfully written cards to cardsList.json");
      });
      fs.writeFile("NRBList.json", JSON.stringify(NRB), (err) => {
        if (err) {
          console.error(err);
          console.log(i);
          return;
        }
        console.log("Successfully written bronzes to NRBList.json");
      });
    } catch (err) {
      console.error(err);
      console.log(i);
    }
  }
  // Invoke the above function
  scrapeData();