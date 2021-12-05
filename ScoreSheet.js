var homeTeam = [];
var awayTeam = [];
var sstimes = [];
// sspoints * 61 - points per rider per heat
//           [0] - number of heats ridden
var sspoints = [];
var sssubs = [];
var sssubsrsn = [];
var clonex = "";

for (let index = 0; index < 62; index++) {
  sspoints[index] = 0;
  sssubs[index] = 0;
  sssubsrsn[index] = "";
};
for (let index = 0; index < 17; index++) {
  sstimes[index] = 0;    
};

let htot = 0;
let atot = 0;
let rowcount = 1;
let points = 3;
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

nav();
genSetup();
loadSS();
genTeamTable("homeTeam");
genTeamTable("awayTeam");
genSubs();
buildSS();

// navigation
function nav() {
  hamburger.addEventListener("click", mobileMenu);
  const navLink = document.querySelectorAll(".nav-link");
  navLink.forEach(n => n.addEventListener("click", closeMenu));
  // get all elements with class "sect" and hide
  var allsect = document.getElementsByClassName('sect');
  for (var i=0, len=allsect.length|0; i<len; i=i+1|0) {
      allsect[i].style.display = 'none';
  }
  allsect[1].style.display = 'block';
}

function buildSS() {
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var newdate = new Date (sstimes[0]);
  document.getElementById("mtgTitle").innerHTML = 
    newdate.toLocaleDateString("default", options);
  
  var source = document.getElementById("source");
  var destination = document.getElementById("destination");
  let clone = source.outerHTML;
  let cloney = "";
  rowcount = 1;
  loadSS();
  var html = "";
  for (let index = 1; index < 16; index++) {
    html += '<button class="pushable"' + 
      '" onclick="heat(' + index + ')"><span class="front" id="heatn' + index + '">' + index + '</span></button>';
  }
  document.getElementById("heatbtns").innerHTML = html;
  for (let index = 1; index < 16; index++) { 
    let hscr = 0;
    let ascr = 0;
    clonex = clone.replace(' id="source"', "");
    clonex = clonex.replace('{htno}', index);
    let rdrx = ( sssubs[rowcount] > 0 ) ? sssubs[rowcount] : getRider(rowcount);   
    for (let rn = 1; rn < 5; rn++) {
      xxx = "{rn" + rn + "}";
      let rdrxx = ( sssubs[rowcount] > 0 ) ? sssubs[rowcount] : getRider(rowcount); 
      clonex = clonex.replace(xxx, rdrxx);
      xxx = "{rdr" + rn + "}";
      if (rn < 3) {clonex = clonex.replace(xxx, homeTeam[rdrxx]); }
      else {clonex = clonex.replace(xxx, awayTeam[rdrxx]); }
      xxx = "{gt" + rn + "}";
      console.log('sssubs ' + sssubs[0])
      clonex = clonex.replace(xxx, getGate(sssubs[0], rowcount));
      xxx = "{pts" + rn + "}";
      if (index <= Number(sspoints[0])) {
        document.getElementById("heatn" + index).style.backgroundColor = 
          "lightgrey";        
        clonex = clonex.replace(xxx, sspoints[rowcount]); 
        let teamx = (rn < 3) ? "homeTeam" : "awayTeam";  
        let cell = Number(document.getElementById(teamx).rows[rdrxx].cells[11].innerHTML) + 2;
        document.getElementById(teamx).rows[rdrxx].cells[cell].innerHTML = sspoints[rowcount];
        cell = cell - 1;
        document.getElementById(teamx).rows[rdrxx].cells[11].innerHTML = cell;
        let ptstot = Number(document.getElementById(teamx).rows[rdrxx].cells[9].innerHTML) + Number(sspoints[rowcount]);
        document.getElementById(teamx).rows[rdrxx].cells[9].innerHTML = ptstot;
        let bonus = bonuspts(rn, rowcount);
        document.getElementById(teamx).rows[rdrxx].cells[10].innerHTML = 
          Number(document.getElementById(teamx).rows[rdrxx].cells[10].innerHTML) + bonus;
        if (bonus == 1) {
          document.getElementById(teamx).rows[rdrxx].cells[cell + 1].style.backgroundColor = "lightgreen"
        };
        if (rn < 3) {hscr += Number(sspoints[rowcount])}
        else        {ascr += Number(sspoints[rowcount])}
      }
      else {
        clonex = clonex.replace(xxx, '');              
      };
      rowcount++;
    }; 
    if (index <= Number(sspoints[0])) {
      clonex = clonex.replace('{hscr}', hscr);
      clonex = clonex.replace('{ascr}', ascr);
      htot += hscr;
      atot += ascr;
      clonex = clonex.replace('{htot}', htot);
      clonex = clonex.replace('{atot}', atot);
      clonex = clonex.replace('{httime}', sstimes[index]);
    }
    else {
      clonex = clonex.replace('{hscr}', '');
      clonex = clonex.replace('{ascr}', '');
      clonex = clonex.replace('{htot}', '');
      clonex = clonex.replace('{atot}', '');
      clonex = clonex.replace('{httime}', 'time');
    }
    cloney += clonex;
  }
  destination.innerHTML = cloney;
  document.getElementById("mtgTitle2").innerHTML =
    homeTeam[0] + ' (' + htot + ') v ' +
    awayTeam[0] + ' (' + atot + ')';
}  

// Mobile menu
function mobileMenu() {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}
// Close navigation menu
function closeMenu() {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}
// display required section
function menu(reqsect) {
  var allsect = document.getElementsByClassName('sect');
  for (var i=0, len=allsect.length|0; i<len; i=i+1|0) {
    allsect[i].style.display = 'none';
  }
  document.getElementById(reqsect).style.display = "block";
}  
// Update team and riders
function newMeeting() {
  // Clear arrays
  homeTeam.length = 0;
  awayTeam.length = 0;
  for (let index = 0; index < 62; index++) {
    sspoints[index] = 0;
    sssubs[index] = 0;
    sssubsrsn[index] = "";
  };
  for (let index = 0; index < 17; index++) {
    sstimes[index] = 0;    
  };
  sstimes[0] = document.getElementById("matchdt").value;
  console.log("Date - " + sstimes[0]);
  sspoints[0] = 0;;
  for (let index = 0; index < 8; index++) {
    homeTeam[index] = document.getElementById("frmhx" + index).value;
    awayTeam[index] = document.getElementById("frmax" + index).value;    
  };  
  saveSS();
  location.reload();
  menu('meeting');
}
// Heat riders
function getRider(num) {
  var htRdrsx = [0,
    1,2,1,2,
    6,7,6,7,
    3,4,3,4,
    5,7,5,7,
    3,4,1,2,
    1,2,5,6,
    5,6,3,4,
    2,7,2,7,
    3,4,5,6,
    1,2,3,4,
    5,6,1,2,
    3,7,3,6,
    1,5,1,5,
    4,6,4,7,
    0,0,0,0
  ];
  return htRdrsx[num];
}
// Save in Local Storage
function saveSS() {
  localStorage.clear();
  localStorage.setItem("homeTeam", JSON.stringify(homeTeam));
  localStorage.setItem("awayTeam", JSON.stringify(awayTeam));
  localStorage.setItem("times", JSON.stringify(sstimes));
  localStorage.setItem("points", JSON.stringify(sspoints));
  localStorage.setItem("subs", JSON.stringify(sssubs));
  localStorage.setItem("rsn", JSON.stringify(sssubsrsn));
  localStorage.setItem('theme', currentTheme);
  console.log("Saved"); 
}
// Load from Local Storage
function loadSS() {
  if (localStorage.getItem("homeTeam") == null) {
    console.log("Empty storage"); 
    menu('setup')
    return;
  }
  homeTeam = JSON.parse(localStorage.getItem("homeTeam"));
  for (let index = 0; index < 8; index++) {
  }

  awayTeam = JSON.parse(localStorage.getItem("awayTeam"));
  for (let index = 0; index < 8; index++) {
  }
 sstimes   = JSON.parse(localStorage.getItem("times"));
 sspoints  = JSON.parse(localStorage.getItem("points"));
 sssubs    = JSON.parse(localStorage.getItem("subs"));
 sssubsrsn = JSON.parse(localStorage.getItem("rsn"));
 console.log("Loaded"); 
}

// Get Gate number
function getGate(nngate,num) {
  var gatesx = {
    0: [0,
      3, 1, 4, 2,
      2,4,1,3,
      3,1,2,4,
      3,1,4,2,
      2,4,3,1,
      1,3,2,4,
      2,4,1,3,
      4,2,3,1,
      4,2,1,3,
      4,2,3,1,
      1,3,2,4,
      1,3,4,2,
      2,4,1,3,
      3,1,2,4,
      2,4,1,3
    ],
    1: [0,
      4,2,3,1,
      1,3,2,4,
      4,2,1,3,
      4,2,3,1,
      1,3,4,2,
      2,4,1,3,
      1,3,2,4,
      3,1,4,2,
      3,1,2,4,
      3,1,4,2,
      2,4,1,3,
      2,4,3,1,
      1,3,2,4,
      4,2,1,3,
      1,3,2,4
    ]
  }
  return gatesx[nngate][num];
}
// Heat setup
function heat(htno) {
  sspoints[0] = htno;
  document.getElementById("heatnumber").innerHTML = htno;
  var rowno = (htno * 4) - 3;
  for (let index = 1; index < 5; index++) {
    var ridernum = getRider(rowno);
    document.getElementById("htnr" + index).innerHTML =  ridernum;
    if (index < 3)  {rdr = homeTeam[ridernum]}
    else            {rdr = awayTeam[ridernum]}
    document.getElementById("htrdr" + index).innerHTML =  rdr;
    rowno += 1;
  };
  document.getElementById("hthscr").innerHTML =  0;
  document.getElementById("htascr").innerHTML =  0;
  document.getElementById("hthtot").innerHTML =  htot;
  document.getElementById("htatot").innerHTML =  atot;
  points = 3;  
  menu("menuheat");
}
// Heat result
function htscore(rider) {
  console.log(" points " + points);
  if (rider < 3)  {scr = "hthscr"; tot = "hthtot"}
  else            {scr = "htascr"; tot = "htatot"}
  document.getElementById("htpts" + rider).innerHTML =  points;
  hscr = Number(document.getElementById(scr).innerHTML) + points;
  document.getElementById(scr).innerHTML = hscr;
  hscr = Number(document.getElementById(tot).innerHTML) + points;
  document.getElementById(tot).innerHTML = hscr;
  document.getElementById("id-button" + rider).style.opacity = 0.2;
  points = points - 1;
}
function storeHeat() {
  let nn = Number(sspoints[0]) * 4 - 3;
  for (let index = 1; index < 5; index++) {
    sspoints[nn] = document.getElementById("htpts" + index).innerHTML;
    nn++;
  };  
  localStorage.setItem("points", JSON.stringify(sspoints));
  var htt = document.getElementById("httime");
  sstimes[sspoints[0]] = htt.elements[0].value;
  localStorage.setItem("times", JSON.stringify(sstimes));
  localStorage.setItem("subs", JSON.stringify(sssubs));
  localStorage.setItem("rsn", JSON.stringify(sssubsrsn));
  buildSS();
  location.reload();
}
function canHeat() {  
  location.reload();
}
// Generate team table
function genTeamTable(team) {
  if (team.substr(0,4) == "home") {
    tmx = homeTeam[0]      
  }
  else {
    tmx = awayTeam[0]
  }
  var html = "<tr>\n";
  html += '<td class="col-small bold"></td>\n';
  html += '<td class="col-large bold" id="sshtm">' + tmx + '</td>\n';
  for (let index = 0; index < 7; index++) {
    var ii = index + 1;
    html += '<td class="col-small bold">' + ii + '</td>\n';
  };  
  html += '<td class="col-small bold">Pts</td>\n';
  html += '<td class="col-small bold">B</td>\n';
  html += '<td class="col-small">Rds</td>\n';
  html += "</tr>";
  for (let rider = 1; rider < 8; rider++) {
    html += "<tr>\n";
    html += '<td class="center">' + rider + '</td>\n';
    if (team.substr(0,4) == "home") {
      ridername = homeTeam[rider]      
    }
    else {
      ridername = awayTeam[rider]
    }
    html += '<td>' + ridername + ' </td>\n';
    for (let index = 0; index < 7; index++) {
      html += '<td class="center"></td>\n';
    }
    html += '<td class="center bold">0</td>\n';
    html += '<td class="center">0</td>\n'
    html += '<td class="center">0</td>\n'
    html += "</tr>";
  }
  document.getElementById(team).innerHTML = html;
}

// Generate substitutes
function genSubs() {
  let rsns = ["", "redrsn", "bluersn", "whitersn", "yellrsn"];
  for (let index = 1; index < 5; index++) {
    genSub1(index);    
    document.getElementById(rsns[index]).selectedIndex = 0;
  }  
}
////////////////////////////////////////////////////////////////////////////////
// Generate one substitute list
function genSub1(gateno) {
  let colr = ["rgb(255, 86, 86)","cyan","white","yellow"];
  let sdiv = "sr" + gateno;
  let subid = "subid" + gateno;
  var selectList = document.createElement("select");
  selectList.id = subid;
  document.getElementById(sdiv).prepend(selectList);
  for (let index = 0; index < homeTeam.length; index++) {
    let rider = "None"
    if (index > 0) {
      rider = (gateno < 3) ? homeTeam[index] : awayTeam[index];
    }
    var option = document.createElement("option");
    option.value = rider;
    option.text = rider;
    option.backgroundColor = colr[gateno];
    selectList.appendChild(option);    
  }
  document.getElementById(subid).style.backgroundColor = colr[gateno - 1];
  document.getElementById(subid).classList.add("col-large");
}

function subs() {
  let reason = ["", "redrsn", "bluersn", "whitersn", "yellrsn" ];  
  for (let index = 1; index < 5; index++) {
    let subid = "subid" + index;
    document.getElementById(subid).selectedIndex = "0";
    document.getElementById(reason[index]).selectedIndex = "0";    
  }  
  menu('subs');
}


function updatesubs() {
  var colr = ["subid1","subid2","subid3","subid4"];
  var rsn = ["redrsn","bluersn","whitersn","yellrsn"];
  let xx = Number(sspoints[0]) * 4 - 3;
  for (let index = 0; index < 4; index++) {
    var rider = document.getElementById(colr[index]).value;
    var rnum = document.getElementById(colr[index]).selectedIndex;
    var reason = document.getElementById(rsn[index]).value; 
    if (rnum > 0) {
      console.log("Subs " + xx);
      sssubs[xx] = rnum;
      sssubsrsn[xx] = reason;
      let nn = "htnr" + (index + 1);
      document.getElementById(nn).innerHTML = rnum;
      nn = "htrdr" + (index + 1);
      let mm = homeTeam[rnum] + " (sub)";
      if (index > 1) {
        mm = awayTeam[rnum] + " (sub)";
      }
      document.getElementById(nn).innerHTML = mm;
    }
     xx++;
  };
  menu("menuheat");
};
// Bonus points
function bonuspts(index, row) {
  var bonus = 0;
  
  if ((index == 1) & ((sspoints[row]) > 0)) {
    if ((sspoints[row + 1] - sspoints[row]) == 1) {bonus = 1}
  }
  if ((index == 2) & ((sspoints[row]) > 0)) {
    if ((sspoints[row - 1] - sspoints[row]) == 1) {bonus = 1}
  }
  if ((index == 3) & ((sspoints[row]) > 0)) {
    if ((sspoints[row + 1] - sspoints[row]) == 1) {bonus = 1}
  }
  if ((index == 4) & ((sspoints[row]) > 0)) {
    if ((sspoints[row - 1] - sspoints[row]) == 1) {bonus = 1}
  }
  return bonus;
}

function exportSS() {
  document.getElementById("export-text").innerHTML = homeTeam.toString()
    + "? " + awayTeam.toString()
    + "? " + sspoints.toString()
    + "? " + sstimes.toString()
    + "? " + sssubs.toString()
    + "? " + sssubsrsn.toString();
  menu("save");  
}
// Import
function importSS() {
  var storage = document.getElementById("import-text").value;
  var storagespl = storage.split("? ");
  homeTeam = storagespl[0].split(",");
  awayTeam = storagespl[1].split(",");
  sspoints = storagespl[2].split(",");
  sspoints = sspoints.map(Number);
  sstimes = storagespl[3].split(",");
  sssubs = storagespl[4].split(",");
  sssubsrsn = storagespl[5].split(",");
  saveSS();
  location.reload();
}
// Select all, copy to clipboard
function copyClip() {
  let copyText = document.getElementById("export-text");
  copyText.select();
  document.execCommand("copy");
}
function printss() {
  genTeamTable("homeTeam1");
  genTeamTable("awayTeam1");
  // Get the source & destination elements
  var source = document.getElementById("prsource");
  var dest1 = document.getElementById("dest1");
  var dest2 = document.getElementById("dest2");
  // Build Scoresheet rows 
  let clone = source.outerHTML;
  let cloney1 = "";
  let cloney2 = "";
  rowcount = 1;
  let htot = 0;
  let atot = 0;
  for (let index = 1; index < 16; index++) {
    let hscr = 0;
    let ascr = 0;
    clonex = clone.replace(' id="prsource"', "");
    clonex = clonex.replace('{htno}', index);
    for (let rn = 1; rn < 5; rn++) {
      x = "{rn" + rn + "}";
      clonex = clonex.replace(x, getRider(rowcount));
      x = "{gt" + rn + "}";
      clonex = clonex.replace(x, getGate(1, rowcount));
      x = "{nf" + rn + "}";
      clonex = clonex.replace(x, '');
      x = "{rdr" + rn + "}";
      if (rn < 3) {clonex = clonex.replace(x, homeTeam[getRider(rowcount)]); }
      else {clonex = clonex.replace(x, awayTeam[getRider(rowcount)]); };
      x1 = "{ns" + rn + "}";
      x2 = "{subnum" + rn + "}";
      x3 = "{sub" + rn + "}";
      if ( sssubs[rowcount] > 0 ) {        
        clonex = clonex.replace(x1, sssubsrsn[rowcount]);
        clonex = clonex.replace(x2, sssubs[rowcount]);
        if (rn < 3) {clonex = clonex.replace(x3, homeTeam[sssubs[rowcount]]);}
        else        {clonex = clonex.replace(x3, awayTeam[sssubs[rowcount]]);}         
      }
      else {
        clonex = clonex.replace(x1, '');
        clonex = clonex.replace(x2, '');
        clonex = clonex.replace(x3, '');
      };
      x = "{pts" + rn + "}";
      if (index <= Number(sspoints[0])) {
        clonex = clonex.replace(x, sspoints[rowcount]); 
        let rdrxx = ( sssubs[rowcount] > 0 ) ? sssubs[rowcount] : getRider(rowcount);
        let teamx = (rn < 3) ? "homeTeam1" : "awayTeam1";  
        let cell = Number(document.getElementById(teamx).rows[rdrxx].cells[11].innerHTML) + 2;
        document.getElementById(teamx).rows[rdrxx].cells[cell].innerHTML = sspoints[rowcount];
        cell = cell - 1;
        document.getElementById(teamx).rows[rdrxx].cells[11].innerHTML = cell;
        let ptstot = 
          Number(document.getElementById(teamx).rows[rdrxx].cells[9].innerHTML) + 
          Number(sspoints[rowcount]);
        document.getElementById(teamx).rows[rdrxx].cells[9].innerHTML = ptstot;
        let bonus = bonuspts(rn, rowcount);
        document.getElementById(teamx).rows[rdrxx].cells[10].innerHTML = 
          Number(document.getElementById(teamx).rows[rdrxx].cells[10].innerHTML) + bonus;
        if (bonus == 1) {
          document.getElementById(teamx).rows[rdrxx].cells[cell + 1].style.backgroundColor = "lightgreen"
        };
      }
      else {clonex = clonex.replace(x, '')}
      if (rn < 3) {hscr += Number(sspoints[rowcount])}
      else        {ascr += Number(sspoints[rowcount])}
      rowcount++;
    };
    if (index <= Number(sspoints[0])) {
      clonex = clonex.replace('{hscr}', hscr);
      clonex = clonex.replace('{ascr}', ascr);
      htot += hscr;
      atot += ascr;
      clonex = clonex.replace('{htot}', htot);
      clonex = clonex.replace('{atot}', atot);
      clonex = clonex.replace('{httime}', sstimes[index]);
    }
    else {
      clonex = clonex.replace('{hscr}', '');
      clonex = clonex.replace('{ascr}', '');
      clonex = clonex.replace('{htot}', '');
      clonex = clonex.replace('{atot}', '');
      clonex = clonex.replace('{httime}', '');
    };
    if  (index < 9) {cloney1 += clonex;}
    else            {cloney2 += clonex;};
  }
  dest1.innerHTML = cloney1;
  dest2.innerHTML = cloney2;
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var newdate = new Date (sstimes[0]);
  document.getElementById('pr-title').innerHTML = 
    homeTeam[0] + ' (' + htot + ') v ' +
    awayTeam[0] + ' (' + atot + ')  -  ' +
    newdate.toLocaleDateString("default", options);
  menu('print');
};

function setGates() {
  var ele = document.getElementsByName('gates');    
  for(i = 0; i < ele.length; i++) {
    if(ele[i].checked) {
      sssubs[0] = ele[i].value;
      console.log('gates ' + ele[i].value)
    }
  }
  localStorage.setItem("subs", JSON.stringify(sssubs));
  location.reload();
}

function selectTeam(ha) {
  if (ha == "home") {
    var x = document.getElementById("hometeamx").value; 
    for (let index = 0; index < 8; index++) {
      document.getElementById("frmhx" + index).value = tmdecl[x][index];  
    }
  }
  else {
    var x = document.getElementById("awayteamx").value; 
    for (let index = 0; index < 8; index++) {
      document.getElementById("frmax" + index).value = tmdecl[x][index];  
    }
  };
};

function genSetup() {
  var selecth = document.getElementById("hometeamx"); 
  var selecta = document.getElementById("awayteamx");

  for(var i = 0; i < tmdecl.length; i++) {
    var opt = tmdecl[i][0];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = i;
    selecth.appendChild(el);
  };
  selectTeam('home');

  for(var i = 0; i < tmdecl.length; i++) {
    var opt = tmdecl[i][0];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = i;
    selecta.appendChild(el);
  };
  selectTeam('away');
}

function sendEmail() {
  var email = "barrymdent@gmail.com";
  var subject = "Scoresheet";
  var emailBody = document.getElementById("export-text").innerHTML;
  document.location = "mailto:"+email+"?subject="+subject+"&body="+emailBody;
}

function switchTheme(e) {
  if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark'); //add this
  }
  else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light'); //add this
  }    
}



toggleSwitch.addEventListener('change', switchTheme, false);