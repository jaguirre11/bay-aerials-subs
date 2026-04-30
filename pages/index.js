import { useState, useMemo, useEffect, useCallback } from "react";

const C = {
  bg:"#ffffff",bg2:"#f9fafb",bg3:"#f3f4f6",
  blue:"#eff6ff",blueText:"#1d4ed8",blueBorder:"#93c5fd",
  green:"#f0fdf4",greenText:"#166534",greenBorder:"#86efac",
  yellow:"#fffbeb",yellowText:"#92400e",yellowBorder:"#fcd34d",
  red:"#fef2f2",redText:"#991b1b",redBorder:"#fca5a5",
  border:"#e5e7eb",border2:"#d1d5db",
  text:"#111827",text2:"#6b7280",text3:"#9ca3af",
  radius:"8px",radiusSm:"6px",
};

const card={background:C.bg,borderRadius:C.radius,border:`1px solid ${C.border}`,padding:"1rem 1.25rem"};
const pill=(bg,color,border)=>({background:bg,color,border:`1px solid ${border}`,fontSize:11,padding:"2px 8px",borderRadius:C.radiusSm,fontWeight:600,whiteSpace:"nowrap",display:"inline-block"});
const inp={width:"100%",marginTop:4,padding:"7px 10px",borderRadius:C.radiusSm,border:`1px solid ${C.border2}`,fontSize:13,background:C.bg,color:C.text,boxSizing:"border-box"};

const DAY_ORDER=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT={Sunday:"Sun",Monday:"Mon",Tuesday:"Tue",Wednesday:"Wed",Thursday:"Thu",Friday:"Fri",Saturday:"Sat"};

const STAFF_CONTACTS={
  "Bryan, Julia":{phone:"4083244023",email:"julia@bayaerials.com"},
  "Cox, Monica":{phone:"4158065663",email:"monicacox@bayaerials.com"},
  "Dacoco, Jenna":{phone:"6692613215",email:"jennadacoco@gmail.com"},
  "Daza, Lessly":{phone:"5599944173",email:"lesslypdaza21@gmail.com"},
  "Dorwelo, Ian Don":{phone:"4082755110",email:"idorwelo618@gmail.com"},
  "Douden, Grace":{phone:"5306807716",email:"gdouden11@gmail.com"},
  "Esquivas, Mariana":{phone:"5105655227",email:"marianaesquivias37@gmail.com"},
  "Geronimo, Miguel":{phone:"5102581723",email:"msgeronimo15@gmail.com"},
  "Gould, Miriam":{phone:"5103960104",email:"miriamgould@gmail.com"},
  "Le, Nick":{phone:"5103209799",email:"teck.nickle@gmail.com"},
  "Legrande, Lawrence":{phone:"4085081817",email:"Legrandelarry@icloud.com"},
  "Leung, Tiffany":{phone:"4158289168",email:"tiffanyleung3508@gmail.com"},
  "Martinez, Shella":{phone:"4082041588",email:"shellamartinez@yahoo.com"},
  "Medina, Michael":{phone:"4082205187",email:"michaeljesse1111@gmail.com"},
  "Mehndiratta, Bhavika":{phone:"5102574481",email:"bhavi@edustrong.com"},
  "Miller, Sierra":{phone:"6502811470",email:"sierra@bayaerials.com"},
  "Nandanwar, Sahana":{phone:"5106965936",email:"sahananandanwar77@gmail.com"},
  "Nelms, Justine":{phone:"5103649670",email:"justineeynelms@icloud.com"},
  "Ong, Alicia":{phone:"4154122355",email:"aradia@gmail.com"},
  "Pacheco, Jenevieve":{phone:"5107500926",email:"pachecojenevieve@gmail.com"},
  "Phair, Anika":{phone:"5109800821",email:"anikaphair@gmail.com"},
  "Pichardo, Jocelin":{phone:"5109432533",email:"jocepic111@gmail.com"},
  "Porter, Ashley":{phone:"4083347257",email:"ashleyzlporter@gmail.com"},
  "Salas, Briana":{phone:"8589253002",email:"brianssalas333@outlook.com"},
  "Saxena, Ashir":{phone:"5104949488",email:"ashirsax@gmail.com"},
  "Templeton, Sophia":{phone:"5107378434",email:"freckles.templeton@icloud.com"},
  "Valdovinos, Andrea":{phone:"4086617932",email:"andreavaldovinos.cm@gmail.com"},
  "Valdovinos, Cristian":{phone:"4086309128",email:"cvgiantz@gmail.com"},
  "Yanez, Kalina":{phone:"5109990581",email:"yankalina8@gmail.com"},
  "Yee, Jasmine":{phone:"5108949370",email:"jasmine.m.yee950@gmail.com"},
  "Zamarripa, Liliana":{phone:"5104029564",email:"ririana922@gmail.com"},
};

const DEFAULT_SCHEDULE=[
  {name:"Bryan, Julia",day:"Monday",time:"3:30PM - 4:20PM",cls:"Ninja Five"},
  {name:"Bryan, Julia",day:"Monday",time:"6:30PM - 7:20PM",cls:"Advanced Purple/Orange"},
  {name:"Bryan, Julia",day:"Monday",time:"4:30PM - 6:30PM",cls:"Future Team - Dragonflies"},
  {name:"Bryan, Julia",day:"Wednesday",time:"4:30PM - 6:30PM",cls:"Future Team - Dragonflies"},
  {name:"Bryan, Julia",day:"Friday",time:"4:30PM - 6:30PM",cls:"Future Team - Dragonflies"},
  {name:"Bryan, Julia",day:"Tuesday",time:"3:30PM - 4:00PM",cls:"Wee Peas"},
  {name:"Bryan, Julia",day:"Wednesday",time:"3:30PM - 4:20PM",cls:"Beginner Yellow"},
  {name:"Bryan, Julia",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Ninja Green"},
  {name:"Bryan, Julia",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Ninja Five"},
  {name:"Bryan, Julia",day:"Friday",time:"9:15AM - 9:45AM",cls:"Two Pea"},
  {name:"Bryan, Julia",day:"Friday",time:"10:30AM - 11:00AM",cls:"Wee Peas"},
  {name:"Bryan, Julia",day:"Friday",time:"11:15AM - 12:00PM",cls:"Three Pea"},
  {name:"Bryan, Julia",day:"Friday",time:"6:30PM - 7:20PM",cls:"Advanced Purple/Orange"},
  {name:"Bryan, Julia",day:"Saturday",time:"9:30AM - 10:20AM",cls:"Ninja Yellow"},
  {name:"Bryan, Julia",day:"Saturday",time:"10:30AM - 11:15AM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Bryan, Julia",day:"Saturday",time:"11:30AM - 12:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Cox, Monica",day:"Monday",time:"4:00PM - 6:00PM",cls:"Future Team - Fireflies"},
  {name:"Cox, Monica",day:"Thursday",time:"4:00PM - 6:00PM",cls:"Future Team - Fireflies"},
  {name:"Dacoco, Jenna",day:"Sunday",time:"9:30AM - 10:20AM",cls:"Advanced Purple/Orange"},
  {name:"Dacoco, Jenna",day:"Sunday",time:"10:30AM - 11:20AM",cls:"Beginner Yellow"},
  {name:"Dacoco, Jenna",day:"Sunday",time:"11:30AM - 12:20PM",cls:"Intermediate Blue"},
  {name:"Dacoco, Jenna",day:"Sunday",time:"12:30PM - 1:20PM",cls:"Beginner White"},
  {name:"Daza, Lessly",day:"Tuesday",time:"4:30PM - 5:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Daza, Lessly",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Ninja White"},
  {name:"Daza, Lessly",day:"Tuesday",time:"6:30PM - 7:20PM",cls:"Ninja Five"},
  {name:"Daza, Lessly",day:"Wednesday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Daza, Lessly",day:"Wednesday",time:"6:30PM - 7:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Daza, Lessly",day:"Friday",time:"4:30PM - 5:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Daza, Lessly",day:"Friday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Daza, Lessly",day:"Saturday",time:"9:30AM - 10:20AM",cls:"Ninja White"},
  {name:"Dorwelo, Ian Don",day:"Sunday",time:"8:50AM - 9:20AM",cls:"Two Pea"},
  {name:"Dorwelo, Ian Don",day:"Sunday",time:"9:30AM - 10:15AM",cls:"Four Pea"},
  {name:"Dorwelo, Ian Don",day:"Sunday",time:"10:30AM - 11:20AM",cls:"Ninja Five"},
  {name:"Dorwelo, Ian Don",day:"Sunday",time:"11:30AM - 12:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Dorwelo, Ian Don",day:"Sunday",time:"12:30PM - 1:20PM",cls:"Beginner Yellow"},
  {name:"Dorwelo, Ian Don",day:"Monday",time:"4:30PM - 5:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Dorwelo, Ian Don",day:"Monday",time:"6:30PM - 7:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Dorwelo, Ian Don",day:"Tuesday",time:"4:30PM - 5:15PM",cls:"Three Pea"},
  {name:"Dorwelo, Ian Don",day:"Tuesday",time:"5:30PM - 6:15PM",cls:"Four Pea"},
  {name:"Dorwelo, Ian Don",day:"Tuesday",time:"6:30PM - 7:00PM",cls:"Two Pea"},
  {name:"Dorwelo, Ian Don",day:"Wednesday",time:"4:30PM - 5:20PM",cls:"Five Pea"},
  {name:"Dorwelo, Ian Don",day:"Wednesday",time:"5:30PM - 6:20PM",cls:"Ninja White"},
  {name:"Dorwelo, Ian Don",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Beginner White"},
  {name:"Dorwelo, Ian Don",day:"Saturday",time:"9:30AM - 10:20AM",cls:"Five Pea"},
  {name:"Dorwelo, Ian Don",day:"Saturday",time:"10:30AM - 11:15AM",cls:"Four Pea"},
  {name:"Dorwelo, Ian Don",day:"Saturday",time:"11:30AM - 12:20PM",cls:"Ninja Five"},
  {name:"Dorwelo, Ian Don",day:"Saturday",time:"12:30PM - 1:20PM",cls:"Beginner White"},
  {name:"Douden, Grace",day:"Sunday",time:"9:30AM - 10:20AM",cls:"Intermediate Green"},
  {name:"Douden, Grace",day:"Sunday",time:"10:30AM - 11:20AM",cls:"Five Pea"},
  {name:"Douden, Grace",day:"Sunday",time:"11:30AM - 12:20PM",cls:"Ninja Five"},
  {name:"Douden, Grace",day:"Sunday",time:"12:30PM - 1:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Douden, Grace",day:"Tuesday",time:"4:00PM - 4:50PM",cls:"Intermediate Green"},
  {name:"Douden, Grace",day:"Tuesday",time:"5:00PM - 5:50PM",cls:"Advanced Purple/Orange"},
  {name:"Douden, Grace",day:"Tuesday",time:"6:00PM - 6:50PM",cls:"Tumbling and Trampoline"},
  {name:"Douden, Grace",day:"Friday",time:"3:30PM - 4:20PM",cls:"Beginner Yellow"},
  {name:"Douden, Grace",day:"Friday",time:"4:30PM - 5:15PM",cls:"Three Pea"},
  {name:"Douden, Grace",day:"Friday",time:"5:30PM - 6:20PM",cls:"Beginner Yellow"},
  {name:"Douden, Grace",day:"Friday",time:"6:30PM - 7:20PM",cls:"Intermediate Green"},
  {name:"Douden, Grace",day:"Friday",time:"7:30PM - 8:20PM",cls:"Tumbling and Trampoline"},
  {name:"Esquivas, Mariana",day:"Sunday",time:"9:30AM - 10:20AM",cls:"Ninja White"},
  {name:"Esquivas, Mariana",day:"Sunday",time:"10:30AM - 11:20AM",cls:"Beginner White"},
  {name:"Esquivas, Mariana",day:"Sunday",time:"11:30AM - 12:20PM",cls:"Beginner White"},
  {name:"Esquivas, Mariana",day:"Sunday",time:"12:30PM - 1:20PM",cls:"Beginner White"},
  {name:"Esquivas, Mariana",day:"Monday",time:"5:30PM - 6:20PM",cls:"Five Pea"},
  {name:"Esquivas, Mariana",day:"Monday",time:"6:30PM - 7:20PM",cls:"Beginner White"},
  {name:"Esquivas, Mariana",day:"Wednesday",time:"3:30PM - 4:20PM",cls:"Beginner White"},
  {name:"Esquivas, Mariana",day:"Wednesday",time:"4:30PM - 5:20PM",cls:"Beginner Yellow"},
  {name:"Esquivas, Mariana",day:"Wednesday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Esquivas, Mariana",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Beginner Yellow"},
  {name:"Esquivas, Mariana",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Ninja White"},
  {name:"Esquivas, Mariana",day:"Thursday",time:"4:30PM - 5:20PM",cls:"Ninja Five"},
  {name:"Esquivas, Mariana",day:"Thursday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Esquivas, Mariana",day:"Thursday",time:"6:30PM - 7:20PM",cls:"Five Pea"},
  {name:"Esquivas, Mariana",day:"Saturday",time:"9:45AM - 10:35AM",cls:"Beginner Yellow"},
  {name:"Esquivas, Mariana",day:"Saturday",time:"10:50AM - 11:35AM",cls:"Three Pea"},
  {name:"Esquivas, Mariana",day:"Saturday",time:"11:45AM - 12:35PM",cls:"Beginner White"},
  {name:"Geronimo, Miguel",day:"Monday",time:"3:30PM - 4:20PM",cls:"Beginner White"},
  {name:"Geronimo, Miguel",day:"Monday",time:"4:30PM - 5:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Monday",time:"5:30PM - 6:20PM",cls:"Ninja Five"},
  {name:"Geronimo, Miguel",day:"Monday",time:"6:30PM - 7:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Tuesday",time:"3:30PM - 4:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Ninja Blue"},
  {name:"Geronimo, Miguel",day:"Tuesday",time:"6:30PM - 7:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Geronimo, Miguel",day:"Wednesday",time:"4:30PM - 5:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Wednesday",time:"5:30PM - 6:20PM",cls:"Ninja Five"},
  {name:"Geronimo, Miguel",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Ninja Blue"},
  {name:"Geronimo, Miguel",day:"Thursday",time:"4:30PM - 5:20PM",cls:"Ninja Green"},
  {name:"Geronimo, Miguel",day:"Thursday",time:"5:30PM - 6:20PM",cls:"Ninja White"},
  {name:"Geronimo, Miguel",day:"Thursday",time:"6:30PM - 7:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Friday",time:"3:30PM - 4:20PM",cls:"Ninja Yellow"},
  {name:"Geronimo, Miguel",day:"Friday",time:"4:30PM - 5:20PM",cls:"Ninja White"},
  {name:"Geronimo, Miguel",day:"Friday",time:"5:30PM - 6:20PM",cls:"Ninja White"},
  {name:"Geronimo, Miguel",day:"Friday",time:"6:30PM - 7:20PM",cls:"Ninja Green"},
  {name:"Geronimo, Miguel",day:"Saturday",time:"9:30AM - 10:20AM",cls:"Ninja Five"},
  {name:"Geronimo, Miguel",day:"Saturday",time:"10:30AM - 11:20AM",cls:"Ninja White"},
  {name:"Geronimo, Miguel",day:"Saturday",time:"11:30AM - 12:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Gould, Miriam",day:"Monday",time:"3:30PM - 4:20PM",cls:"Aerial Silks Beginner White"},
  {name:"Gould, Miriam",day:"Monday",time:"4:30PM - 5:20PM",cls:"Aerial Silks Intermediate Yellow"},
  {name:"Gould, Miriam",day:"Monday",time:"5:30PM - 6:20PM",cls:"Aerial Silks Advanced Green"},
  {name:"Gould, Miriam",day:"Monday",time:"6:50PM - 7:50PM",cls:"Aerial Silks Performance"},
  {name:"Gould, Miriam",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Aerial Silks Advanced Green"},
  {name:"Gould, Miriam",day:"Wednesday",time:"7:30PM - 8:20PM",cls:"Aerial Silks Beginner White Adult"},
  {name:"Gould, Miriam",day:"Thursday",time:"6:00PM - 6:50PM",cls:"Aerial Silks Intermediate Yellow"},
  {name:"Le, Nick",day:"Sunday",time:"9:30AM - 10:15AM",cls:"Three Pea"},
  {name:"Le, Nick",day:"Sunday",time:"10:30AM - 11:15AM",cls:"Four Pea"},
  {name:"Le, Nick",day:"Sunday",time:"11:30AM - 12:20PM",cls:"Intermediate Green"},
  {name:"Le, Nick",day:"Sunday",time:"12:30PM - 1:20PM",cls:"Ninja White"},
  {name:"Le, Nick",day:"Saturday",time:"9:30AM - 10:20AM",cls:"Intermediate Green"},
  {name:"Le, Nick",day:"Saturday",time:"10:30AM - 11:20AM",cls:"Ninja Five"},
  {name:"Le, Nick",day:"Saturday",time:"11:30AM - 12:20PM",cls:"Ninja White"},
  {name:"Le, Nick",day:"Saturday",time:"12:30PM - 1:20PM",cls:"Intermediate Blue"},
  {name:"Legrande, Lawrence",day:"Monday",time:"3:30PM - 4:20PM",cls:"Beginner Yellow"},
  {name:"Legrande, Lawrence",day:"Monday",time:"4:30PM - 5:20PM",cls:"Ninja White"},
  {name:"Legrande, Lawrence",day:"Monday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Legrande, Lawrence",day:"Monday",time:"6:30PM - 7:00PM",cls:"Two Pea"},
  {name:"Legrande, Lawrence",day:"Wednesday",time:"3:30PM - 4:20PM",cls:"Beginner White"},
  {name:"Legrande, Lawrence",day:"Wednesday",time:"4:30PM - 5:20PM",cls:"Ninja White"},
  {name:"Legrande, Lawrence",day:"Wednesday",time:"5:30PM - 6:15PM",cls:"Four Pea"},
  {name:"Legrande, Lawrence",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Ninja White"},
  {name:"Legrande, Lawrence",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Beginner Yellow"},
  {name:"Legrande, Lawrence",day:"Thursday",time:"4:30PM - 5:20PM",cls:"Beginner White"},
  {name:"Legrande, Lawrence",day:"Thursday",time:"5:30PM - 6:00PM",cls:"Two Pea"},
  {name:"Legrande, Lawrence",day:"Thursday",time:"6:30PM - 7:20PM",cls:"Ninja White"},
  {name:"Legrande, Lawrence",day:"Friday",time:"4:30PM - 5:15PM",cls:"Four Pea"},
  {name:"Legrande, Lawrence",day:"Friday",time:"5:30PM - 6:20PM",cls:"Five Pea"},
  {name:"Legrande, Lawrence",day:"Friday",time:"6:30PM - 7:20PM",cls:"Ninja Yellow"},
  {name:"Legrande, Lawrence",day:"Saturday",time:"9:00AM - 9:30AM",cls:"One Pea"},
  {name:"Legrande, Lawrence",day:"Saturday",time:"10:00AM - 10:30AM",cls:"Two Pea"},
  {name:"Legrande, Lawrence",day:"Saturday",time:"10:30AM - 11:15AM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Legrande, Lawrence",day:"Saturday",time:"11:30AM - 12:20PM",cls:"Beginner Yellow"},
  {name:"Legrande, Lawrence",day:"Saturday",time:"12:30PM - 1:20PM",cls:"Ninja White"},
  {name:"Leung, Tiffany",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Beginner White"},
  {name:"Leung, Tiffany",day:"Thursday",time:"4:30PM - 5:15PM",cls:"Three Pea"},
  {name:"Leung, Tiffany",day:"Thursday",time:"5:30PM - 6:20PM",cls:"Intermediate Green"},
  {name:"Leung, Tiffany",day:"Thursday",time:"6:30PM - 7:20PM",cls:"Intermediate Green"},
  {name:"Leung, Tiffany",day:"Saturday",time:"9:30AM - 10:20AM",cls:"Beginner White"},
  {name:"Leung, Tiffany",day:"Saturday",time:"10:30AM - 11:20AM",cls:"Beginner Yellow"},
  {name:"Leung, Tiffany",day:"Saturday",time:"11:30AM - 12:15PM",cls:"Three Pea"},
  {name:"Leung, Tiffany",day:"Saturday",time:"12:30PM - 1:20PM",cls:"Beginner Yellow"},
  {name:"Martinez, Shella",day:"Monday",time:"4:00PM - 6:00PM",cls:"Future Team - Fireflies"},
  {name:"Martinez, Shella",day:"Thursday",time:"4:00PM - 6:00PM",cls:"Future Team - Fireflies"},
  {name:"Medina, Michael",day:"Sunday",time:"9:30AM - 10:20AM",cls:"Ninja Five"},
  {name:"Medina, Michael",day:"Sunday",time:"10:30AM - 11:15AM",cls:"Three Pea"},
  {name:"Medina, Michael",day:"Sunday",time:"11:30AM - 12:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Medina, Michael",day:"Sunday",time:"12:30PM - 1:20PM",cls:"Five Pea"},
  {name:"Medina, Michael",day:"Saturday",time:"9:45AM - 10:35AM",cls:"Ninja White"},
  {name:"Medina, Michael",day:"Saturday",time:"10:45AM - 11:35AM",cls:"Ninja Yellow"},
  {name:"Mehndiratta, Bhavika",day:"Monday",time:"4:30PM - 5:20PM",cls:"Beginner Yellow"},
  {name:"Mehndiratta, Bhavika",day:"Monday",time:"5:30PM - 6:20PM",cls:"Beginner Yellow"},
  {name:"Mehndiratta, Bhavika",day:"Monday",time:"6:30PM - 7:20PM",cls:"Intermediate Green"},
  {name:"Miller, Sierra",day:"Monday",time:"9:30AM - 10:00AM",cls:"Two Pea"},
  {name:"Miller, Sierra",day:"Monday",time:"10:15AM - 11:00AM",cls:"Three Pea"},
  {name:"Miller, Sierra",day:"Monday",time:"11:15AM - 12:00PM",cls:"Four Pea"},
  {name:"Miller, Sierra",day:"Monday",time:"4:30PM - 5:15PM",cls:"Three Pea"},
  {name:"Miller, Sierra",day:"Monday",time:"5:30PM - 6:15PM",cls:"Three Pea"},
  {name:"Miller, Sierra",day:"Tuesday",time:"3:30PM - 4:30PM",cls:"Future Team - Butterflies"},
  {name:"Miller, Sierra",day:"Tuesday",time:"4:30PM - 5:15PM",cls:"Four Pea"},
  {name:"Miller, Sierra",day:"Tuesday",time:"5:30PM - 6:15PM",cls:"Three Pea"},
  {name:"Miller, Sierra",day:"Wednesday",time:"6:30PM - 7:00PM",cls:"Two Pea"},
  {name:"Miller, Sierra",day:"Thursday",time:"3:30PM - 4:30PM",cls:"Future Team - Butterflies"},
  {name:"Miller, Sierra",day:"Thursday",time:"4:30PM - 5:20PM",cls:"Beginner Yellow"},
  {name:"Miller, Sierra",day:"Thursday",time:"5:30PM - 6:20PM",cls:"Five Pea"},
  {name:"Miller, Sierra",day:"Friday",time:"3:30PM - 4:20PM",cls:"Five Pea"},
  {name:"Miller, Sierra",day:"Friday",time:"4:30PM - 5:20PM",cls:"Beginner White"},
  {name:"Miller, Sierra",day:"Saturday",time:"8:30AM - 9:00AM",cls:"Two Pea"},
  {name:"Miller, Sierra",day:"Saturday",time:"9:00AM - 9:30AM",cls:"Wee Peas"},
  {name:"Miller, Sierra",day:"Saturday",time:"9:30AM - 10:15AM",cls:"Three Pea"},
  {name:"Miller, Sierra",day:"Saturday",time:"10:30AM - 11:00AM",cls:"Two Pea"},
  {name:"Miller, Sierra",day:"Saturday",time:"11:00AM - 11:30AM",cls:"Two Pea"},
  {name:"Nandanwar, Sahana",day:"Saturday",time:"9:50AM - 10:35AM",cls:"Three Pea"},
  {name:"Nandanwar, Sahana",day:"Saturday",time:"10:45AM - 11:35AM",cls:"Beginner White"},
  {name:"Nandanwar, Sahana",day:"Saturday",time:"11:45AM - 12:35PM",cls:"Intermediate Green"},
  {name:"Nandanwar, Sahana",day:"Saturday",time:"12:45PM - 1:35PM",cls:"Intermediate Green"},
  {name:"Nelms, Justine",day:"Monday",time:"4:30PM - 5:20PM",cls:"Five Pea"},
  {name:"Nelms, Justine",day:"Monday",time:"5:30PM - 6:20PM",cls:"Intermediate Green"},
  {name:"Nelms, Justine",day:"Wednesday",time:"4:30PM - 5:20PM",cls:"Beginner White"},
  {name:"Nelms, Justine",day:"Wednesday",time:"5:30PM - 6:20PM",cls:"Beginner Yellow"},
  {name:"Ong, Alicia",day:"Sunday",time:"9:30AM - 10:20AM",cls:"Aerial Silks Beginner White"},
  {name:"Ong, Alicia",day:"Sunday",time:"10:30AM - 11:20AM",cls:"Aerial Silks Beginner White"},
  {name:"Pacheco, Jenevieve",day:"Saturday",time:"9:30AM - 10:15AM",cls:"Four Pea"},
  {name:"Pacheco, Jenevieve",day:"Saturday",time:"10:30AM - 11:15AM",cls:"Three Pea"},
  {name:"Phair, Anika",day:"Friday",time:"4:30PM - 5:20PM",cls:"Aerial Silks Beginner White"},
  {name:"Pichardo, Jocelin",day:"Tuesday",time:"3:30PM - 4:20PM",cls:"Ninja White"},
  {name:"Pichardo, Jocelin",day:"Tuesday",time:"4:30PM - 5:20PM",cls:"Beginner Yellow"},
  {name:"Pichardo, Jocelin",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Beginner White"},
  {name:"Pichardo, Jocelin",day:"Tuesday",time:"6:30PM - 7:20PM",cls:"Beginner Yellow"},
  {name:"Pichardo, Jocelin",day:"Friday",time:"3:30PM - 4:20PM",cls:"Beginner White"},
  {name:"Pichardo, Jocelin",day:"Friday",time:"4:30PM - 5:20PM",cls:"Beginner Yellow"},
  {name:"Pichardo, Jocelin",day:"Friday",time:"5:30PM - 6:20PM",cls:"Beginner White"},
  {name:"Pichardo, Jocelin",day:"Friday",time:"6:30PM - 7:20PM",cls:"Beginner White"},
  {name:"Porter, Ashley",day:"Monday",time:"4:00PM - 6:00PM",cls:"Future Team - Fireflies"},
  {name:"Porter, Ashley",day:"Thursday",time:"4:00PM - 6:00PM",cls:"Future Team - Fireflies"},
  {name:"Porter, Ashley",day:"Monday",time:"4:30PM - 6:30PM",cls:"Future Team - Dragonflies"},
  {name:"Porter, Ashley",day:"Wednesday",time:"4:30PM - 6:30PM",cls:"Future Team - Dragonflies"},
  {name:"Porter, Ashley",day:"Friday",time:"4:30PM - 6:30PM",cls:"Future Team - Dragonflies"},
  {name:"Salas, Briana",day:"Monday",time:"3:30PM - 4:20PM",cls:"Aerial Silks Beginner White"},
  {name:"Salas, Briana",day:"Monday",time:"4:30PM - 5:15PM",cls:"Four Pea"},
  {name:"Salas, Briana",day:"Monday",time:"5:30PM - 6:15PM",cls:"Four Pea"},
  {name:"Salas, Briana",day:"Monday",time:"6:30PM - 7:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Salas, Briana",day:"Tuesday",time:"4:30PM - 5:20PM",cls:"Five Pea"},
  {name:"Salas, Briana",day:"Tuesday",time:"6:30PM - 7:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Salas, Briana",day:"Wednesday",time:"5:30PM - 6:20PM",cls:"Five Pea"},
  {name:"Salas, Briana",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Five Pea"},
  {name:"Salas, Briana",day:"Friday",time:"6:30PM - 7:15PM",cls:"Three Pea"},
  {name:"Salas, Briana",day:"Saturday",time:"10:30AM - 11:20AM",cls:"Five Pea"},
  {name:"Salas, Briana",day:"Saturday",time:"11:30AM - 12:15PM",cls:"Four Pea"},
  {name:"Saxena, Ashir",day:"Tuesday",time:"4:30PM - 5:20PM",cls:"Ninja White"},
  {name:"Saxena, Ashir",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Ninja Five"},
  {name:"Saxena, Ashir",day:"Tuesday",time:"6:30PM - 7:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Templeton, Sophia",day:"Monday",time:"3:30PM - 4:20PM",cls:"Intermediate Green"},
  {name:"Templeton, Sophia",day:"Monday",time:"4:30PM - 5:20PM",cls:"Beginner White"},
  {name:"Templeton, Sophia",day:"Monday",time:"5:30PM - 6:20PM",cls:"Beginner White"},
  {name:"Templeton, Sophia",day:"Tuesday",time:"3:30PM - 4:20PM",cls:"Intermediate Green"},
  {name:"Templeton, Sophia",day:"Tuesday",time:"4:30PM - 5:20PM",cls:"Intermediate Blue"},
  {name:"Templeton, Sophia",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Beginner Yellow"},
  {name:"Templeton, Sophia",day:"Tuesday",time:"6:30PM - 7:20PM",cls:"Intermediate Blue"},
  {name:"Templeton, Sophia",day:"Wednesday",time:"3:30PM - 4:20PM",cls:"Intermediate Green"},
  {name:"Templeton, Sophia",day:"Wednesday",time:"4:30PM - 5:20PM",cls:"Ninja Five"},
  {name:"Templeton, Sophia",day:"Wednesday",time:"5:30PM - 6:20PM",cls:"Beginner White"},
  {name:"Templeton, Sophia",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Intermediate Blue"},
  {name:"Templeton, Sophia",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Intermediate Blue"},
  {name:"Templeton, Sophia",day:"Thursday",time:"4:30PM - 5:20PM",cls:"Intermediate Green"},
  {name:"Templeton, Sophia",day:"Thursday",time:"5:30PM - 6:20PM",cls:"Beginner White"},
  {name:"Templeton, Sophia",day:"Friday",time:"3:30PM - 4:20PM",cls:"Beginner Yellow"},
  {name:"Templeton, Sophia",day:"Friday",time:"4:30PM - 5:20PM",cls:"Ninja Five"},
  {name:"Templeton, Sophia",day:"Friday",time:"5:30PM - 6:20PM",cls:"Intermediate Blue"},
  {name:"Templeton, Sophia",day:"Friday",time:"6:30PM - 7:20PM",cls:"Advanced Purple/Orange"},
  {name:"Templeton, Sophia",day:"Friday",time:"7:30PM - 8:20PM",cls:"Tumbling and Trampoline"},
  {name:"Valdovinos, Andrea",day:"Thursday",time:"4:30PM - 5:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Valdovinos, Andrea",day:"Thursday",time:"5:30PM - 6:20PM",cls:"Ninja Five"},
  {name:"Valdovinos, Andrea",day:"Thursday",time:"6:30PM - 7:15PM",cls:"Three Pea"},
  {name:"Valdovinos, Cristian",day:"Thursday",time:"3:30PM - 4:20PM",cls:"Five Pea"},
  {name:"Valdovinos, Cristian",day:"Thursday",time:"4:30PM - 5:15PM",cls:"Four Pea"},
  {name:"Valdovinos, Cristian",day:"Thursday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 3"},
  {name:"Valdovinos, Cristian",day:"Thursday",time:"6:30PM - 7:15PM",cls:"Four Pea"},
  {name:"Valdovinos, Cristian",day:"Friday",time:"3:30PM - 4:20PM",cls:"Ninja White"},
  {name:"Valdovinos, Cristian",day:"Friday",time:"4:30PM - 5:20PM",cls:"Five Pea"},
  {name:"Valdovinos, Cristian",day:"Friday",time:"5:30PM - 6:15PM",cls:"Ninja - Lil' Ninja 4"},
  {name:"Valdovinos, Cristian",day:"Friday",time:"6:30PM - 7:15PM",cls:"Four Pea"},
  {name:"Yanez, Kalina",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Beginner Yellow"},
  {name:"Yanez, Kalina",day:"Tuesday",time:"6:30PM - 7:20PM",cls:"Beginner White"},
  {name:"Yanez, Kalina",day:"Wednesday",time:"3:30PM - 4:20PM",cls:"Beginner Yellow"},
  {name:"Yanez, Kalina",day:"Wednesday",time:"4:30PM - 5:15PM",cls:"Four Pea"},
  {name:"Yanez, Kalina",day:"Wednesday",time:"5:30PM - 6:15PM",cls:"Three Pea"},
  {name:"Yanez, Kalina",day:"Wednesday",time:"6:30PM - 7:20PM",cls:"Intermediate Green"},
  {name:"Yee, Jasmine",day:"Tuesday",time:"4:30PM - 5:20PM",cls:"Beginner White"},
  {name:"Yee, Jasmine",day:"Tuesday",time:"5:30PM - 6:20PM",cls:"Beginner White"},
  {name:"Yee, Jasmine",day:"Tuesday",time:"6:30PM - 7:20PM",cls:"Intermediate Green"},
  {name:"Yee, Jasmine",day:"Friday",time:"5:30PM - 6:20PM",cls:"Intermediate Green"},
  {name:"Yee, Jasmine",day:"Friday",time:"6:30PM - 7:20PM",cls:"Beginner Yellow"},
  {name:"Zamarripa, Liliana",day:"Monday",time:"5:30PM - 6:20PM",cls:"Ninja White"},
  {name:"Zamarripa, Liliana",day:"Monday",time:"6:30PM - 7:20PM",cls:"Beginner Yellow"},
  {name:"Zamarripa, Liliana",day:"Thursday",time:"4:30PM - 5:20PM",cls:"Five Pea"},
  {name:"Zamarripa, Liliana",day:"Thursday",time:"5:30PM - 6:20PM",cls:"Beginner Yellow"},
  {name:"Zamarripa, Liliana",day:"Thursday",time:"6:30PM - 7:20PM",cls:"Beginner White"},
];

function fn(n){const p=n.split(", ");return p.length>1?p[1].split(" ")[0]:n;}
function ini(n){const p=n.split(", ");return(p[1]?.[0]||"")+(p[0]?.[0]||"");}
function sn(n){const p=n.split(", ");return p.length>1?`${p[1].split(" ")[0]} ${p[0][0]}.`:n;}
function fp(raw){if(!raw)return"";const d=raw.replace(/\D/g,"").slice(-10);return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:raw;}

function buildCoaches(data){
  const names=[...new Set(data.map(r=>r.name))].sort();
  const dm={},cm={};
  data.forEach(r=>{
    if(!dm[r.name])dm[r.name]=new Set();dm[r.name].add(r.day);
    if(!cm[r.name])cm[r.name]=new Set();cm[r.name].add(r.cls);
  });
  return names.map((name,i)=>({id:i+1,name,code:(fn(name).slice(0,3)+String(i+1).padStart(2,"0")).toUpperCase(),availability:[...(dm[name]||[])].sort((a,b)=>DAY_ORDER.indexOf(a)-DAY_ORDER.indexOf(b)),classes:[...(cm[name]||[])]}));
}

function Avatar({name,size=34}){
  const bgs=["#dbeafe","#dcfce7","#fef3c7","#fce7f3","#ede9fe"];
  const tcs=["#1d4ed8","#166534","#92400e","#9d174d","#5b21b6"];
  const i=(name.charCodeAt(0)+(name.charCodeAt(1)||0))%5;
  return <div style={{width:size,height:size,borderRadius:"50%",background:bgs[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:700,color:tcs[i],flexShrink:0}}>{ini(name)}</div>;
}

function SBadge({status}){
  if(status==="open")return <span style={pill(C.yellow,C.yellowText,C.yellowBorder)}>open</span>;
  if(status==="claimed")return <span style={pill(C.blue,C.blueText,C.blueBorder)}>claimed</span>;
  return <span style={pill(C.green,C.greenText,C.greenBorder)}>confirmed</span>;
}

function Logo(){
  return(
    <img src="/BayAerials.png" height="46" alt="Bay Aerials Gymnastics" style={{objectFit:"contain"}}/>
  );
}

// ── PART 2 CONTINUES BELOW ──
export default function App(){
  const [view,setView]=useState("coach");
  const [adminUnlocked,setAdminUnlocked]=useState(false);
  const [adminPass,setAdminPass]=useState("");
  const [adminErr,setAdminErr]=useState("");
  const [adminTab,setAdminTab]=useState("calendar");
  const [shifts,setShifts]=useState([]);
  const [smsLog,setSmsLog]=useState([]);
  const [weekOffset,setWeekOffset]=useState(0);
  const [coachCode,setCoachCode]=useState("");
  const [activeCoach,setActiveCoach]=useState(null);
  const [loginErr,setLoginErr]=useState("");
  const [coachTab,setCoachTab]=useState("open");
  const [printDay,setPrintDay]=useState(null);
  const [findSubShift,setFindSubShift]=useState(null);
  const [showPost,setShowPost]=useState(false);
  const [showProtocol,setShowProtocol]=useState(false);
  const [scheduleCoach,setScheduleCoach]=useState(null);
  const [form,setForm]=useState({instructorName:"",day:"",date:"",time:"",cls:"",notes:""});
  const [postWeekOffset,setPostWeekOffset]=useState(0);
  const [dbCoaches,setDbCoaches]=useState([]);
  const [showAddCoach,setShowAddCoach]=useState(false);
  const [editCoach,setEditCoach]=useState(null);
  const [coachForm,setCoachForm]=useState({name:"",phone:"",email:""});
  const [loadingCoaches,setLoadingCoaches]=useState(false);
  const [availability,setAvailability]=useState({});
  const [showCallout,setShowCallout]=useState(false);
  const [calloutDay,setCalloutDay]=useState("");
  const [calloutDate,setCalloutDate]=useState("");
  const [calloutWeekOffset,setCalloutWeekOffset]=useState(0);
  const [calloutClasses,setCalloutClasses]=useState([]);
  const [calloutNote,setCalloutNote]=useState("");
  const [calloutSent,setCalloutSent]=useState(false);
  const [schedule,setSchedule]=useState(DEFAULT_SCHEDULE);
  const [scheduleLoaded,setScheduleLoaded]=useState(false);

  const coaches=useMemo(()=>buildCoaches(schedule),[schedule]);

  // Default each coach to available every day; coaches can toggle days off in their portal
  useEffect(()=>{
    setAvailability(prev=>{
      const m={...prev};
      buildCoaches(schedule).forEach(c=>{if(!m[c.id])m[c.id]=[...DAY_ORDER];});
      return m;
    });
  },[schedule]);

  const ff=(k,v)=>setForm(p=>({...p,[k]:v}));

  const fetchSchedule=useCallback(async()=>{
    try{
      const res=await fetch("/api/schedule");
      const data=await res.json();
      if(res.ok&&Array.isArray(data)&&data.length>0){setSchedule(data);}
      else{setSchedule(DEFAULT_SCHEDULE);}
    }catch(e){setSchedule(DEFAULT_SCHEDULE);}
    finally{setScheduleLoaded(true);}
  },[]);

  const fetchDbCoaches=useCallback(async()=>{
    setLoadingCoaches(true);
    try{
      const res=await fetch("/api/coaches");
      const data=await res.json();
      if(res.ok&&Array.isArray(data))setDbCoaches(data);
    }catch(e){
      const fallback=Object.entries(STAFF_CONTACTS).map(([name,ct],i)=>({id:i+1,name,code:(fn(name).slice(0,3)+String(i+1).padStart(2,"0")).toUpperCase(),phone:ct.phone,email:ct.email,active:true}));
      setDbCoaches(fallback);
    }finally{setLoadingCoaches(false);}
  },[]);

  const fetchSmsLog=useCallback(async()=>{
    try{
      const res=await fetch("/api/sms-log");
      const data=await res.json();
      if(res.ok&&Array.isArray(data)){
        // Map DB rows into the same shape the UI expects
        setSmsLog(data.map(r=>({
          to:sn(r.to_name||""),
          phone:fp(r.to_phone||""),
          msg:r.message||"",
          time:r.sent_at?new Date(r.sent_at).toLocaleString():""
        })));
      }
    }catch(e){/* ignore */}
  },[]);

  const fetchShiftsFromDb=useCallback(async()=>{
    try{
      const res=await fetch("/api/shifts");
      const data=await res.json();
      if(res.ok&&Array.isArray(data)){
        // Map DB rows (snake_case) to frontend shape (camelCase)
        setShifts(data.map(r=>({
          id:r.id,
          instructorName:r.instructor_name,
          date:r.date,
          day:r.day,
          time:r.time,
          cls:r.cls,
          notes:r.notes,
          status:r.status,
          claimedBy:r.claimed_by_id,
          claimedByName:r.claimed_by_name
        })));
      }
    }catch(e){/* ignore */}
  },[]);

  useEffect(()=>{fetchDbCoaches();fetchSchedule();fetchShiftsFromDb();fetchSmsLog();},[fetchDbCoaches,fetchSchedule,fetchShiftsFromDb,fetchSmsLog]);

  const baseDate=useMemo(()=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+weekOffset*7);return d;},[weekOffset]);
  const weekDates=useMemo(()=>{const m={};DAY_ORDER.forEach((d,i)=>{const dt=new Date(baseDate);dt.setDate(baseDate.getDate()+i);m[d]=dt.toISOString().slice(0,10);});return m;},[baseDate]);
  const fmtRange=()=>{const e=new Date(baseDate);e.setDate(baseDate.getDate()+6);return`${baseDate.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${e.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;};

  const iSched=useMemo(()=>form.instructorName?schedule.filter(r=>r.name===form.instructorName):[],[form.instructorName,schedule]);
  const aDays=useMemo(()=>[...new Set(iSched.map(r=>r.day))].sort((a,b)=>DAY_ORDER.indexOf(a)-DAY_ORDER.indexOf(b)),[iSched]);
  const cOnDay=useMemo(()=>iSched.filter(r=>r.day===form.day).map(r=>({time:r.time,cls:r.cls})),[iSched,form.day]);

  const handleAdminLogin=async()=>{
    try{
      const res=await fetch("/api/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:adminPass})});
      if(res.ok){setAdminUnlocked(true);setView("admin");setAdminErr("");}
      else setAdminErr("Incorrect password. Try again.");
    }catch(e){setAdminErr("Connection error. Try again.");}
  };

  const [selectedClasses,setSelectedClasses]=useState([]);

  const toggleClass=(cls,time)=>{
    setSelectedClasses(p=>{
      const exists=p.find(c=>c.cls===cls&&c.time===time);
      if(exists)return p.filter(c=>!(c.cls===cls&&c.time===time));
      return [...p,{cls,time}];
    });
  };

  const postShift=async()=>{
    if(!form.instructorName||!form.date||selectedClasses.length===0)return;
    const date=form.date;

    // Find eligible coaches (free during ALL selected times that day)
    const eligible=coaches.filter(c=>{
      if(c.name===form.instructorName)return false;
      if(!(availability[c.id]||[]).includes(form.day))return false;
      return selectedClasses.every(({time})=>
        !schedule.some(r=>r.name===c.name&&r.day===form.day&&r.time===time)
      );
    });

    try{
      // 1. Save each selected class as a shift in the DB
      const created=[];
      for(const {cls,time} of selectedClasses){
        const res=await fetch("/api/shifts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({instructor_name:form.instructorName,date,day:form.day,time,cls,notes:form.notes})});
        if(res.ok){const data=await res.json();created.push(data);}
      }

      // 2. Notify eligible coaches in ONE batched text covering all the new shift IDs
      if(created.length>0&&eligible.length>0){
        // Enrich eligible coaches with phone/email/code from DB (or STAFF_CONTACTS fallback)
        const enriched=eligible.map(c=>{
          const dbCoach=dbCoaches.find(d=>d.name===c.name);
          const ct=STAFF_CONTACTS[c.name]||{};
          return{
            id:dbCoach?.id||c.id,
            name:c.name,
            phone:dbCoach?.phone||ct.phone||"",
            email:dbCoach?.email||ct.email||"",
            code:dbCoach?.code||c.code
          };
        }).filter(c=>c.phone);
        if(enriched.length>0){
          await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
            shift_ids:created.map(s=>s.id),
            coaches:enriched
          })});
        }
      }

      // 3. Refresh shifts and SMS log from DB
      await fetchShiftsFromDb();
      await fetchSmsLog();
    }catch(e){
      console.error("Post shift failed:",e);
      alert("Could not post shift. Check connection and try again.");
    }

    setShowPost(false);
    setForm({instructorName:"",day:"",date:"",time:"",cls:"",notes:""});
    setPostWeekOffset(0);
    setSelectedClasses([]);
  };

  const submitCallout=async()=>{
    if(!activeCoach||!calloutDay||!calloutDate||calloutClasses.length===0)return;
    const date=calloutDate;

    // Find eligible coaches — same logic as postShift
    const eligible=coaches.filter(c=>{
      if(c.name===activeCoach.name)return false;
      if(!(availability[c.id]||[]).includes(calloutDay))return false;
      return calloutClasses.every(({time})=>
        !schedule.some(r=>r.name===c.name&&r.day===calloutDay&&r.time===time)
      );
    });

    try{
      // 1. Save each called-out class as an open shift in the DB
      const created=[];
      for(const {cls,time} of calloutClasses){
        const res=await fetch("/api/shifts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({instructor_name:activeCoach.name,date,day:calloutDay,time,cls,notes:calloutNote})});
        if(res.ok){const data=await res.json();created.push(data);}
      }

      // 2. Notify eligible coaches with the standard sub-needed text
      if(created.length>0&&eligible.length>0){
        const enriched=eligible.map(c=>{
          const dbCoach=dbCoaches.find(d=>d.name===c.name);
          const ct=STAFF_CONTACTS[c.name]||{};
          return{
            id:dbCoach?.id||c.id,
            name:c.name,
            phone:dbCoach?.phone||ct.phone||"",
            email:dbCoach?.email||ct.email||"",
            code:dbCoach?.code||c.code
          };
        }).filter(c=>c.phone);
        if(enriched.length>0){
          await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
            shift_ids:created.map(s=>s.id),
            coaches:enriched
          })});
        }
      }

      // 3. Notify admin (Julia/Monica) that a call-out happened
      if(created.length>0){
        await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          shift_ids:created.map(s=>s.id),
          callout_admin:true,
          callout_coach_name:activeCoach.name,
          callout_note:calloutNote||""
        })});
      }

      // 4. Refresh local state
      await fetchShiftsFromDb();
      await fetchSmsLog();
    }catch(e){
      console.error("Call-out failed:",e);
      alert("Could not submit call-out. Check connection and try again.");
      return;
    }

    setCalloutSent(true);
  };

  const resetCallout=()=>{setShowCallout(false);setCalloutDay("");setCalloutDate("");setCalloutWeekOffset(0);setCalloutClasses([]);setCalloutNote("");setCalloutSent(false);};

  const claimShift=async(id)=>{
    setShifts(p=>p.map(s=>s.id===id?{...s,status:"claimed",claimedBy:activeCoach.id,claimedByName:activeCoach.name}:s));
    try{
      await fetch("/api/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({shift_id:id,action:"claim",coach_id:activeCoach.dbId||null,coach_name:activeCoach.name})});
      fetchSmsLog();
      fetchShiftsFromDb();
    }catch(e){console.error("Claim API failed:",e);}
  };
  const confirmShift=async(id)=>{
    setShifts(p=>p.map(s=>s.id===id?{...s,status:"confirmed"}:s));
    try{
      await fetch("/api/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({shift_id:id,action:"confirm"})});
      fetchSmsLog();
      fetchShiftsFromDb();
    }catch(e){console.error("Confirm API failed:",e);}
  };
  const removeShift=async(id)=>{
    setShifts(p=>p.filter(s=>s.id!==id));
    try{
      await fetch(`/api/shifts?id=${id}`,{method:"DELETE"});
      fetchSmsLog();
    }catch(e){console.error("Remove shift API failed:",e);}
  };
  const assignSub=async(shift,coach)=>{
    setShifts(p=>p.map(s=>s.id===shift.id?{...s,status:"claimed",claimedBy:coach.id,claimedByName:coach.name}:s));
    setFindSubShift(null);
    try{
      // Find the DB UUID for the coach
      const dbCoach=dbCoaches.find(d=>d.name===coach.name);
      // 1. Mark the shift as claimed in the DB (this also texts admin + the coach via /api/claim)
      await fetch("/api/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        shift_id:shift.id,
        action:"claim",
        coach_id:dbCoach?.id||null,
        coach_name:coach.name
      })});
      fetchSmsLog();
      fetchShiftsFromDb();
    }catch(e){console.error("Assign sub API failed:",e);}
  };
  const loginCoach=()=>{
    const code=coachCode.toUpperCase().trim();
    // First, try matching against the database (canonical codes)
    const dbMatch=dbCoaches.find(d=>d.code===code&&d.active!==false);
    if(dbMatch){
      // Find the matching schedule-derived coach record (for availability key, classes, etc.)
      const scheduleMatch=coaches.find(c=>c.name===dbMatch.name);
      const merged=scheduleMatch
        ?{...scheduleMatch,dbId:dbMatch.id,phone:dbMatch.phone,email:dbMatch.email,code:dbMatch.code}
        :{id:dbMatch.id,name:dbMatch.name,code:dbMatch.code,phone:dbMatch.phone,email:dbMatch.email,dbId:dbMatch.id,classes:[]};
      setActiveCoach(merged);
      setLoginErr("");
      return;
    }
    // Fallback: try matching against schedule-derived codes (for backwards compatibility)
    const c=coaches.find(x=>x.code===code);
    if(c){
      const dbCoach=dbCoaches.find(d=>d.name===c.name);
      const merged=dbCoach?{...c,dbId:dbCoach.id,phone:dbCoach.phone,email:dbCoach.email}:c;
      setActiveCoach(merged);
      setLoginErr("");
    }else setLoginErr("Code not found. Contact Johnny.");
  };
  const myShifts=activeCoach?shifts.filter(s=>s.claimedBy===activeCoach.dbId||s.claimedByName===activeCoach.name):[];
  const openForMe=activeCoach?shifts.filter(s=>s.status==="open"&&(availability[activeCoach.id]||[]).includes(s.day)):[];
  const toggleDay=d=>{if(!activeCoach)return;setAvailability(p=>{const c=p[activeCoach.id]||[];return{...p,[activeCoach.id]:c.includes(d)?c.filter(x=>x!==d):[...c,d]};});};

  const addCoach=async()=>{
    if(!coachForm.name)return;
    try{const res=await fetch("/api/coaches",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(coachForm)});if(res.ok){await fetchDbCoaches();setShowAddCoach(false);setCoachForm({name:"",phone:"",email:""}); }}
    catch(e){const prefix=coachForm.name.split(", ")[1]?.slice(0,3).toUpperCase()||coachForm.name.slice(0,3).toUpperCase();const code=`${prefix}${Math.floor(Math.random()*900)+100}`;setDbCoaches(p=>[...p,{id:Date.now(),...coachForm,code,active:true}]);setShowAddCoach(false);setCoachForm({name:"",phone:"",email:""});}
  };
  const updateCoach=async(id,updates)=>{
    try{await fetch("/api/coaches",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,...updates})});await fetchDbCoaches();}
    catch(e){setDbCoaches(p=>p.map(c=>c.id===id?{...c,...updates}:c));}
    setEditCoach(null);
  };
  const deleteCoach=async(id)=>{
    try{await fetch(`/api/coaches?id=${id}`,{method:"DELETE"});await fetchDbCoaches();}
    catch(e){setDbCoaches(p=>p.filter(c=>c.id!==id));}
  };

  const getPrintData=day=>{
    const date=weekDates[day];const dayShifts=shifts.filter(s=>s.day===day&&s.date===date);
    return schedule.filter(r=>r.day===day).map(r=>({time:r.time,cls:r.cls,instructorName:r.name,subShift:dayShifts.find(s=>s.instructorName===r.name)})).sort((a,b)=>a.time.localeCompare(b.time));
  };

  const Tab=({label,id})=>(
    <button onClick={()=>setAdminTab(id)} style={{background:adminTab===id?C.bg3:"transparent",color:adminTab===id?C.text:C.text2,border:`1px solid ${adminTab===id?C.border2:C.border}`,borderRadius:C.radiusSm,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:adminTab===id?600:400,whiteSpace:"nowrap"}}>{label}</button>
  );

  return(
    <div style={{padding:"1rem",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.bg2,minHeight:"100vh",boxSizing:"border-box"}}>

      {/* HEADER */}
      <div style={{background:C.bg,borderRadius:C.radius,border:`1px solid ${C.border}`,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Logo/>
          <div style={{fontSize:11,color:C.text2}}>Sub scheduler · {coaches.length} instructors</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setShowProtocol(true)} style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:C.radiusSm,padding:"5px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>📋 Protocol</button>
          {(view==="admin"||adminUnlocked)&&(
            <label style={{background:C.bg2,color:C.text2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"5px 10px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
              ↑ Import
              <input type="file" accept=".csv,.txt,.tsv" style={{display:"none"}} onChange={e=>{
                const file=e.target.files[0];if(!file)return;
                const reader=new FileReader();
                reader.onload=async ev=>{
                  try{
                    const text=ev.target.result.replace(/^\ufeff/,"");
                    const lines=text.trim().split("\n");
                    const parsed=[];let cur="";
                    const skipClasses=["clean up","clean up-tuesday","clean up-thursday/friday","hospitalty"];
                    // Parse quoted CSV: split by "," pattern
                    const parseCSVLine=(line)=>line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c=>c.replace(/^"|"$/g,"").trim());
                    for(let li=1;li<lines.length;li++){
                      const cols=parseCSVLine(lines[li]);
                      if(!cols[0]&&!cols[1]&&cols[7]&&cols[7].startsWith("Total"))continue;
                      if(!cols[0]&&!cols[1]&&cols[7]&&cols[7].startsWith("Grand"))continue;
                      if(cols[0]&&!cols[1]){cur=cols[0];continue;}
                      if(!cols[0]&&cols[1]&&cols[2]&&cols[3]&&cur){
                        if(skipClasses.some(sc=>cols[3].toLowerCase().startsWith(sc)))continue;
                        const days=cols[1].split(/\s+/).filter(d=>DAY_ORDER.includes(d));
                        const times=cols[2].split(/(?<=PM|AM)\s+(?=\d)/);
                        const cls=cols[3];
                        days.forEach((day,i)=>{if(cls)parsed.push({name:cur,day,time:times[i]||times[0]||cols[2],cls});});
                      }
                    }
                    if(parsed.length>0){
                      // Save to database
                      try{
                        const saveRes=await fetch("/api/schedule",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schedule:parsed})});
                        if(saveRes.ok){
                          setSchedule(parsed);
                          alert(`✓ Imported & saved ${parsed.length} classes from ${[...new Set(parsed.map(r=>r.name))].length} instructors.\n\n"Clean up" shifts excluded.\nSchedule saved — it will persist across sessions.`);
                        }else{
                          // DB save failed — still update local state
                          setSchedule(parsed);
                          alert(`✓ Imported ${parsed.length} classes (local only — database save failed). Try again or check Supabase.`);
                        }
                      }catch(saveErr){
                        setSchedule(parsed);
                        alert(`✓ Imported ${parsed.length} classes (local only — could not reach server).`);
                      }
                    }
                    else{alert("No data found. Export Staff Schedule as CSV from iClassPro.");}
                  }catch(err){alert("Could not parse file: "+err.message);}
                };
                reader.readAsText(file);e.target.value="";
              }}/>
            </label>
          )}
          <button onClick={()=>adminUnlocked?setView("admin"):setView("adminlogin")} style={{background:view==="admin"?C.bg3:"transparent",color:view==="admin"?C.text:C.text2,border:`1px solid ${view==="admin"?C.border2:C.border}`,borderRadius:C.radiusSm,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:view==="admin"?600:400}}>🔐 Admin</button>
          <button onClick={()=>setView("coach")} style={{background:view==="coach"?C.bg3:"transparent",color:view==="coach"?C.text:C.text2,border:`1px solid ${view==="coach"?C.border2:C.border}`,borderRadius:C.radiusSm,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:view==="coach"?600:400}}>Coach login</button>
        </div>
      </div>

      {/* ADMIN LOGIN */}
      {view==="adminlogin"&&(
        <div style={{maxWidth:300,margin:"0 auto",paddingTop:"1rem"}}>
          <div style={{...card,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:8}}>🔐</div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Admin Access</div>
            <div style={{fontSize:12,color:C.text2,marginBottom:14}}>Enter your admin password to continue.</div>
            <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password" onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()} style={{...inp,textAlign:"center",fontSize:15,marginBottom:8}}/>
            {adminErr&&<div style={{color:C.redText,fontSize:12,marginBottom:8}}>{adminErr}</div>}
            <button onClick={handleAdminLogin} style={{width:"100%",padding:8,background:"#2563eb",color:"#fff",border:"none",borderRadius:C.radiusSm,fontWeight:600,cursor:"pointer",fontSize:13,marginBottom:10}}>Unlock Admin</button>
            <button onClick={()=>setView("coach")} style={{background:"transparent",border:"none",color:C.text2,fontSize:12,cursor:"pointer"}}>← Back to Coach login</button>
          </div>
        </div>
      )}

      {/* ADMIN */}
      {view==="admin"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[["Open",shifts.filter(s=>s.status==="open").length,C.yellow,C.yellowText,C.yellowBorder],["Claimed",shifts.filter(s=>s.status==="claimed").length,C.blue,C.blueText,C.blueBorder],["Confirmed",shifts.filter(s=>s.status==="confirmed").length,C.green,C.greenText,C.greenBorder]].map(([l,v,bg,tc,bc])=>(
              <div key={l} style={{background:bg,border:`1px solid ${bc}`,borderRadius:C.radius,padding:10,textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:600,color:tc,textTransform:"uppercase"}}>{l}</div>
                <div style={{fontSize:24,fontWeight:700,color:tc}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <Tab label="📅 Calendar" id="calendar"/>
            <Tab label="📋 Shifts" id="shifts"/>
            <Tab label="👥 Roster" id="roster"/>
            <Tab label="👤 Manage" id="manage"/>
            <Tab label="💬 SMS" id="sms"/>
            <button onClick={()=>setShowPost(true)} style={{marginLeft:"auto",background:"#16a34a",color:"#fff",border:"none",borderRadius:C.radiusSm,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Post shift</button>
          </div>

          {/* CALENDAR */}
          {adminTab==="calendar"&&(
            <div style={{background:C.bg,borderRadius:C.radius,border:`1px solid ${C.border}`,padding:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <button onClick={()=>setWeekOffset(w=>w-1)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"3px 10px",cursor:"pointer",fontSize:15}}>‹</button>
                <div style={{flex:1,textAlign:"center",fontSize:12,fontWeight:600}}>{fmtRange()}</div>
                <button onClick={()=>setWeekOffset(w=>w+1)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"3px 10px",cursor:"pointer",fontSize:15}}>›</button>
                {weekOffset!==0&&<button onClick={()=>setWeekOffset(0)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"3px 8px",cursor:"pointer",fontSize:10}}>today</button>}
              </div>
              <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
                {DAY_ORDER.map(day=>(
                  <button key={day} onClick={()=>setPrintDay(printDay===day?null:day)} style={{background:printDay===day?C.blue:C.bg2,border:`1px solid ${printDay===day?C.blueBorder:C.border}`,color:printDay===day?C.blueText:C.text2,borderRadius:C.radiusSm,padding:"2px 8px",fontSize:10,cursor:"pointer"}}>🖨 {DAY_SHORT[day]}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>
                {DAY_ORDER.map(day=>{
                  const date=weekDates[day];const ds=shifts.filter(s=>s.day===day&&s.date===date);
                  return(
                    <div key={day} style={{minHeight:80}}>
                      <div style={{textAlign:"center",marginBottom:4}}>
                        <div style={{fontSize:9,fontWeight:600,color:C.text2,textTransform:"uppercase"}}>{DAY_SHORT[day]}</div>
                        <div style={{fontSize:13,fontWeight:700}}>{parseInt(date.split("-")[2])}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        {ds.length===0?<div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,fontSize:8,color:C.text3,textAlign:"center",minHeight:22,display:"flex",alignItems:"center",justifyContent:"center"}}>—</div>
                        :ds.map(s=>{
                          const[bg,tc,bc]=s.status==="confirmed"?[C.green,C.greenText,C.greenBorder]:s.status==="claimed"?[C.blue,C.blueText,C.blueBorder]:[C.yellow,C.yellowText,C.yellowBorder];
                          return(<div key={s.id} onClick={()=>s.status==="open"&&setFindSubShift(s)} style={{background:bg,border:`1px solid ${bc}`,borderRadius:C.radiusSm,padding:"2px 4px",cursor:s.status==="open"?"pointer":"default"}}>
                            <div style={{fontSize:8,fontWeight:600,color:tc}}>{s.time.split(" - ")[0]}</div>
                            <div style={{fontSize:8,color:tc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.cls}</div>
                            <div style={{fontSize:7,color:tc,opacity:0.8}}>{s.claimedByName?sn(s.claimedByName):"open"}</div>
                          </div>);
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:12,marginTop:10,fontSize:10,color:C.text2,flexWrap:"wrap"}}>
                {[["open",C.yellow,C.yellowBorder],["claimed",C.blue,C.blueBorder],["confirmed",C.green,C.greenBorder]].map(([l,bg,bc])=>(
                  <span key={l} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:9,height:9,borderRadius:2,background:bg,border:`1px solid ${bc}`,display:"inline-block"}}/>{l}</span>
                ))}
                <span>· tap open to find sub</span>
              </div>
              {printDay&&(()=>{
                const rows=getPrintData(printDay);const date=weekDates[printDay];
                const dateStr=new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
                const lines=[`BAY AERIALS — ${printDay.toUpperCase()} SCHEDULE`,dateStr,"─".repeat(56),...rows.map(r=>{const s=r.subShift;const sub=!s?"":s.status==="confirmed"&&s.claimedByName?`  ✓ SUB: ${sn(s.claimedByName)}`:s.status==="claimed"&&s.claimedByName?`  SUB CLAIMED: ${sn(s.claimedByName)}`:"  ⚠ OPEN";return`${r.time.padEnd(24)}${r.cls.padEnd(36)}${sn(r.instructorName).padEnd(18)}${sub}`;}), "─".repeat(56),`Bay Aerials · ${new Date().toLocaleString()}`].join("\n");
                return(
                  <div style={{marginTop:14,border:`1px solid ${C.blueBorder}`,borderRadius:C.radius,overflow:"hidden"}}>
                    <div style={{background:C.blue,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{fontWeight:600,fontSize:13,color:C.blueText}}>📋 {printDay} · {dateStr}</div>
                      <button onClick={()=>setPrintDay(null)} style={{background:"transparent",border:`1px solid ${C.blueBorder}`,borderRadius:C.radiusSm,padding:"3px 8px",fontSize:11,cursor:"pointer",color:C.blueText}}>✕</button>
                    </div>
                    <div style={{padding:10}}>
                      <div style={{fontSize:11,color:C.text2,marginBottom:6}}>Click inside → <strong>Cmd+A</strong> to select all, then copy.</div>
                      <textarea readOnly value={lines} onClick={e=>e.target.select()} style={{width:"100%",height:260,fontFamily:"monospace",fontSize:10,lineHeight:1.6,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:8,color:C.text,resize:"vertical",boxSizing:"border-box",whiteSpace:"pre"}}/>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SHIFTS */}
          {adminTab==="shifts"&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {shifts.length===0&&<div style={{...card,textAlign:"center",color:C.text2,padding:"2rem"}}>No shifts posted yet.</div>}
              {[...shifts].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).map(s=>(
                <div key={s.id} style={{...card,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"5px 8px",textAlign:"center",minWidth:75}}>
                    <div style={{fontSize:11,fontWeight:700}}>{s.day}</div>
                    <div style={{fontSize:10,color:C.text2}}>{s.date}</div>
                    <div style={{fontSize:10,color:C.text2}}>{s.time.split(" - ")[0]}</div>
                  </div>
                  <div style={{flex:1,minWidth:100}}>
                    <div style={{fontSize:13,fontWeight:600}}>{s.cls}</div>
                    <div style={{fontSize:11,color:C.text2}}>covering {sn(s.instructorName)}{s.notes?` · ${s.notes}`:""}</div>
                    {s.claimedByName&&<div style={{fontSize:11,color:C.blueText,fontWeight:500}}>→ {sn(s.claimedByName)}</div>}
                  </div>
                  <SBadge status={s.status}/>
                  {s.status==="claimed"&&<button onClick={()=>confirmShift(s.id)} style={{background:"#16a34a",color:"#fff",border:"none",borderRadius:C.radiusSm,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Confirm</button>}
                  {s.status==="open"&&<button onClick={()=>setFindSubShift(s)} style={{background:C.blue,color:C.blueText,border:`1px solid ${C.blueBorder}`,borderRadius:C.radiusSm,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Find sub</button>}
                  <button onClick={()=>removeShift(s.id)} style={{background:C.red,color:C.redText,border:`1px solid ${C.redBorder}`,borderRadius:C.radiusSm,padding:"4px 8px",fontSize:10,cursor:"pointer"}}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* ROSTER */}
          {adminTab==="roster"&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {coaches.map(c=>{const ct=STAFF_CONTACTS[c.name]||{};const phone=fp(ct.phone||"");return(
                <div key={c.id} style={card}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <Avatar name={c.name}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{sn(c.name)}</div>
                      <div style={{fontSize:10,color:C.text2}}>Code: <strong style={{color:C.blueText}}>{c.code}</strong></div>
                      {phone&&<a href={`tel:${phone}`} style={{fontSize:10,color:C.blueText,textDecoration:"none"}}>{phone}</a>}
                      {ct.email&&<div><a href={`mailto:${ct.email}`} style={{fontSize:10,color:C.blueText,textDecoration:"none"}}>{ct.email}</a></div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                      <button onClick={()=>setScheduleCoach(c)} style={{background:C.blue,color:C.blueText,border:`1px solid ${C.blueBorder}`,borderRadius:C.radiusSm,padding:"3px 8px",fontSize:10,cursor:"pointer",fontWeight:600}}>📅 Schedule</button>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"flex-end"}}>
                        {(availability[c.id]||c.availability).map(d=><span key={d} style={pill(C.blue,C.blueText,C.blueBorder)}>{DAY_SHORT[d]}</span>)}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                    {c.classes.slice(0,5).map(cl=><span key={cl} style={pill(C.bg2,C.text2,C.border)}>{cl}</span>)}
                    {c.classes.length>5&&<span style={pill(C.bg2,C.text2,C.border)}>+{c.classes.length-5} more</span>}
                  </div>
                </div>
              );})}
            </div>
          )}

          {/* MANAGE */}
          {adminTab==="manage"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:13,color:C.text2}}>{dbCoaches.length} coaches · {dbCoaches.filter(c=>c.active).length} active</div>
                <button onClick={()=>setShowAddCoach(true)} style={{background:"#16a34a",color:"#fff",border:"none",borderRadius:C.radiusSm,padding:"6px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Add Coach</button>
              </div>
              {loadingCoaches&&<div style={{textAlign:"center",color:C.text2,padding:"2rem"}}>Loading coaches...</div>}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {dbCoaches.map(c=>(
                  <div key={c.id} style={{...card,opacity:c.active?1:0.6}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <Avatar name={c.name}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <div style={{fontWeight:600,fontSize:14}}>{sn(c.name)}</div>
                          {!c.active&&<span style={pill(C.red,C.redText,C.redBorder)}>inactive</span>}
                        </div>
                        <div style={{fontSize:11,color:C.text2}}>Code: <strong style={{color:C.blueText}}>{c.code}</strong></div>
                        {c.phone&&<div style={{fontSize:11,color:C.text2}}>{fp(c.phone)}</div>}
                        {c.email&&<div style={{fontSize:11,color:C.text2}}>{c.email}</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setEditCoach(c);setCoachForm({name:c.name,phone:c.phone||"",email:c.email||""});}} style={{flex:1,background:C.blue,color:C.blueText,border:`1px solid ${C.blueBorder}`,borderRadius:C.radiusSm,padding:"6px 0",fontSize:12,cursor:"pointer",fontWeight:500}}>✏️ Edit</button>
                      <button onClick={()=>updateCoach(c.id,{active:!c.active})} style={{flex:1,background:c.active?C.yellow:C.green,color:c.active?C.yellowText:C.greenText,border:`1px solid ${c.active?C.yellowBorder:C.greenBorder}`,borderRadius:C.radiusSm,padding:"6px 0",fontSize:12,cursor:"pointer",fontWeight:500}}>{c.active?"🔒 Deactivate":"✅ Reactivate"}</button>
                      <button onClick={()=>deleteCoach(c.id)} style={{flex:1,background:C.red,color:C.redText,border:`1px solid ${C.redBorder}`,borderRadius:C.radiusSm,padding:"6px 0",fontSize:12,cursor:"pointer",fontWeight:500}}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SMS */}
          {adminTab==="sms"&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button onClick={fetchSmsLog} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"4px 10px",fontSize:11,cursor:"pointer",color:C.text2}}>↻ Refresh</button>
              </div>
              {smsLog.length===0&&<div style={{...card,textAlign:"center",color:C.text2,padding:"2rem"}}>No messages yet.</div>}
              {smsLog.map((m,i)=>(
                <div key={i} style={card}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontWeight:600,fontSize:13}}>{m.to}</span>
                    {m.phone&&<span style={{fontSize:11,color:C.text2}}>{m.phone}</span>}
                    <span style={pill(C.green,C.greenText,C.greenBorder)}>SMS</span>
                    <span style={{marginLeft:"auto",fontSize:11,color:C.text3}}>{m.time}</span>
                  </div>
                  <div style={{fontSize:11,color:C.text2,marginTop:4}}>{m.msg}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COACH PORTAL */}
      {view==="coach"&&!activeCoach&&(
        <div style={{maxWidth:300,margin:"0 auto",paddingTop:"1rem"}}>
          <div style={{...card,textAlign:"center"}}>
            <Logo/>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6,marginTop:8}}>Coach Portal</div>
            <div style={{fontSize:12,color:C.text2,marginBottom:14}}>Enter your code to view and claim open shifts.</div>
            <input value={coachCode} onChange={e=>setCoachCode(e.target.value)} placeholder="e.g. JUL01" onKeyDown={e=>e.key==="Enter"&&loginCoach()} style={{...inp,textTransform:"uppercase",textAlign:"center",fontSize:15,marginBottom:8}}/>
            {loginErr&&<div style={{color:C.redText,fontSize:12,marginBottom:8}}>{loginErr}</div>}
            <button onClick={loginCoach} style={{width:"100%",padding:8,background:"#2563eb",color:"#fff",border:"none",borderRadius:C.radiusSm,fontWeight:600,cursor:"pointer",fontSize:13}}>Log in</button>
            <div style={{marginTop:10,fontSize:10,color:C.text3}}>Contact Johnny if you need your code.</div>
          </div>
        </div>
      )}

      {view==="coach"&&activeCoach&&(
        <div>
          <div style={{...card,display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <Avatar name={activeCoach.name} size={38}/>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{sn(activeCoach.name)}</div><div style={{fontSize:11,color:C.text2}}>Coach portal</div></div>
            <button onClick={()=>{setActiveCoach(null);setCoachCode("");}} style={{background:C.bg2,color:C.text2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Log out</button>
          </div>
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
            {[["Open shifts","open",C.yellow,C.yellowText,C.yellowBorder],["My shifts","mine",C.blue,C.blueText,C.blueBorder],["Availability","avail",C.green,C.greenText,C.greenBorder]].map(([l,id,bg,tc,bc])=>(
              <button key={id} onClick={()=>setCoachTab(id)} style={{background:coachTab===id?bg:"transparent",color:coachTab===id?tc:C.text2,border:`1px solid ${coachTab===id?bc:C.border}`,borderRadius:C.radiusSm,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:coachTab===id?600:400}}>{l}</button>
            ))}
            <button onClick={()=>setScheduleCoach(coaches.find(c=>c.name===activeCoach.name)||activeCoach)} style={{background:"#ede9fe",color:"#5b21b6",border:"1px solid #c4b5fd",borderRadius:C.radiusSm,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>📅 My Schedule</button>
            <button onClick={()=>{setShowCallout(true);setCalloutSent(false);setCalloutDay("");setCalloutDate("");setCalloutWeekOffset(0);setCalloutClasses([]);setCalloutNote("");}} style={{background:C.red,color:C.redText,border:`1px solid ${C.redBorder}`,borderRadius:C.radiusSm,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>🚨 Call-Out</button>
          </div>
          {coachTab==="open"&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
            {openForMe.length===0&&<div style={{...card,textAlign:"center",color:C.text2,padding:"2rem"}}>No open shifts match your available days.</div>}
            {openForMe.map(s=>(<div key={s.id} style={card}>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{background:C.yellow,border:`1px solid ${C.yellowBorder}`,borderRadius:C.radiusSm,padding:"5px 10px",textAlign:"center",minWidth:75}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.yellowText}}>{s.day}</div>
                  <div style={{fontSize:9,color:C.yellowText}}>{s.time.split(" - ")[0]}</div>
                </div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{s.cls}</div><div style={{fontSize:11,color:C.text2}}>covering {sn(s.instructorName)}</div></div>
                <button onClick={()=>claimShift(s.id)} style={{background:"#16a34a",color:"#fff",border:"none",borderRadius:C.radiusSm,padding:"6px 16px",fontWeight:600,cursor:"pointer",fontSize:12}}>Claim</button>
              </div>
            </div>))}
          </div>)}
          {coachTab==="mine"&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
            {myShifts.length===0&&<div style={{...card,textAlign:"center",color:C.text2,padding:"2rem"}}>No shifts claimed yet.</div>}
            {myShifts.map(s=>(<div key={s.id} style={{...card,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{minWidth:75}}><div style={{fontSize:11,fontWeight:600}}>{s.day}</div><div style={{fontSize:10,color:C.text2}}>{s.time}</div></div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{s.cls}</div><div style={{fontSize:10,color:C.text2}}>covering {sn(s.instructorName)}</div></div>
              <SBadge status={s.status}/>
            </div>))}
          </div>)}
          {coachTab==="avail"&&(<div style={card}>
            <div style={{fontSize:12,color:C.text2,marginBottom:10}}>Tap days you're available.</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {DAY_ORDER.map(d=>{const on=(availability[activeCoach.id]||[]).includes(d);return<button key={d} onClick={()=>toggleDay(d)} style={{padding:"6px 12px",borderRadius:C.radiusSm,border:`1px solid ${on?C.blueBorder:C.border}`,background:on?C.blue:"transparent",color:on?C.blueText:C.text2,fontWeight:on?600:400,cursor:"pointer",fontSize:12}}>{DAY_SHORT[d]}</button>;})}
            </div>
          </div>)}
        </div>
      )}

      {/* CALL-OUT MODAL */}
      {showCallout&&activeCoach&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}>
          <div style={{...card,width:400,maxWidth:"92vw",maxHeight:"90vh",overflowY:"auto"}}>
            {calloutSent?(
              <div style={{textAlign:"center",padding:"1.5rem 1rem"}}>
                <div style={{fontSize:40,marginBottom:12}}>✅</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Call-Out Submitted</div>
                <div style={{fontSize:12,color:C.text2,marginBottom:6}}>Your call-out for <strong>{calloutDate?new Date(calloutDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"}):calloutDay}</strong> has been sent to management.</div>
                <div style={{fontSize:11,color:C.text2,background:C.bg2,borderRadius:C.radiusSm,padding:"8px 12px",marginBottom:16,textAlign:"left"}}>
                  {calloutClasses.map(({time,cls},i)=><div key={i}>• {time} – {cls}</div>)}
                  {calloutNote&&<div style={{marginTop:6,color:C.text3}}>Note: {calloutNote}</div>}
                </div>
                <div style={{fontSize:11,color:C.yellowText,background:C.yellow,border:`1px solid ${C.yellowBorder}`,borderRadius:C.radiusSm,padding:"7px 10px",marginBottom:16}}>Management will arrange a sub. You don't need to find one yourself.</div>
                <button onClick={resetCallout} style={{width:"100%",padding:9,background:"#2563eb",color:"#fff",border:"none",borderRadius:C.radiusSm,fontWeight:700,fontSize:13,cursor:"pointer"}}>Done</button>
              </div>
            ):(
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{background:C.red,border:`1px solid ${C.redBorder}`,borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🚨</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>Request Call-Out</div>
                    <div style={{fontSize:11,color:C.text2}}>{sn(activeCoach.name)} — select the classes you can't make</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div>
                    <label style={{fontSize:11,fontWeight:600,color:C.text2,display:"block",marginBottom:6}}>Select date</label>
                    {(()=>{
                      const coachDays=new Set(schedule.filter(r=>r.name===activeCoach.name).map(r=>r.day));
                      const today=new Date();today.setHours(0,0,0,0);
                      // Start of this week (Sunday)
                      const startOfWeek=new Date(today);startOfWeek.setDate(today.getDate()-today.getDay()+calloutWeekOffset*7);
                      const endOfWeek=new Date(startOfWeek);endOfWeek.setDate(startOfWeek.getDate()+6);
                      const weekLabel=`${startOfWeek.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${endOfWeek.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
                      const days=DAY_ORDER.map((dayName,i)=>{
                        const d=new Date(startOfWeek);d.setDate(startOfWeek.getDate()+i);
                        const iso=d.toISOString().slice(0,10);
                        const isPast=d<today;
                        const isToday=d.getTime()===today.getTime();
                        const hasClasses=coachDays.has(dayName);
                        const isSelected=calloutDate===iso;
                        return{dayName,d,iso,isPast,isToday,hasClasses,isSelected,num:d.getDate()};
                      });
                      return(
                        <div style={{background:C.bg2,borderRadius:C.radius,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderBottom:`1px solid ${C.border}`,background:C.bg}}>
                            <button onClick={()=>{if(calloutWeekOffset>0){setCalloutWeekOffset(w=>w-1);setCalloutDay("");setCalloutDate("");setCalloutClasses([]);}}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:C.radiusSm,width:26,height:26,cursor:calloutWeekOffset>0?"pointer":"default",fontSize:14,color:calloutWeekOffset>0?C.text:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                            <div style={{fontSize:11,fontWeight:600,color:C.text}}>{weekLabel}</div>
                            <button onClick={()=>{setCalloutWeekOffset(w=>w+1);setCalloutDay("");setCalloutDate("");setCalloutClasses([]);}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:C.radiusSm,width:26,height:26,cursor:"pointer",fontSize:14,color:C.text,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,padding:6}}>
                            {DAY_ORDER.map(d=>(
                              <div key={d} style={{textAlign:"center",fontSize:9,fontWeight:700,color:C.text3,textTransform:"uppercase",paddingBottom:2}}>{DAY_SHORT[d]}</div>
                            ))}
                            {days.map(({dayName,iso,isPast,isToday,hasClasses,isSelected,num})=>{
                              const selectable=!isPast&&hasClasses;
                              return(
                                <div key={iso} onClick={()=>{if(selectable){setCalloutDay(dayName);setCalloutDate(iso);setCalloutClasses([]);}}}
                                  style={{textAlign:"center",padding:"6px 2px",borderRadius:C.radiusSm,cursor:selectable?"pointer":"default",
                                    background:isSelected?"#dc2626":isToday&&!isSelected?"#eff6ff":"transparent",
                                    border:`1px solid ${isSelected?"#dc2626":isToday&&!isSelected?C.blueBorder:"transparent"}`,
                                    opacity:isPast?0.3:1,position:"relative"}}>
                                  <div style={{fontSize:12,fontWeight:isSelected||isToday?700:400,color:isSelected?"#fff":isToday?C.blueText:hasClasses&&!isPast?C.text:C.text3}}>{num}</div>
                                  {hasClasses&&!isPast&&<div style={{width:4,height:4,borderRadius:"50%",background:isSelected?"rgba(255,255,255,0.7)":"#dc2626",margin:"2px auto 0"}}/>}
                                </div>
                              );
                            })}
                          </div>
                          {calloutDate&&<div style={{padding:"6px 10px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.text2,background:C.bg}}>
                            📅 {new Date(calloutDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
                          </div>}
                          {!calloutDate&&<div style={{padding:"6px 10px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.text3,background:C.bg}}>
                            Tap a day with a red dot — those are your scheduled days.
                          </div>}
                        </div>
                      );
                    })()}
                  </div>
                  {calloutDay&&(()=>{
                    const dayClasses=schedule.filter(r=>r.name===activeCoach.name&&r.day===calloutDay).sort((a,b)=>a.time.localeCompare(b.time));
                    return(
                      <div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                          <label style={{fontSize:11,fontWeight:600,color:C.text2}}>Classes to call out of</label>
                          <button onClick={()=>calloutClasses.length===dayClasses.length?setCalloutClasses([]):setCalloutClasses(dayClasses.map(c=>({cls:c.cls,time:c.time})))} style={{background:calloutClasses.length===dayClasses.length?C.red:C.blue,color:calloutClasses.length===dayClasses.length?C.redText:C.blueText,border:`1px solid ${calloutClasses.length===dayClasses.length?C.redBorder:C.blueBorder}`,borderRadius:C.radiusSm,padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>
                            {calloutClasses.length===dayClasses.length?"Deselect all":"Select all"}
                          </button>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {dayClasses.map((c,i)=>{
                            const checked=calloutClasses.some(s=>s.cls===c.cls&&s.time===c.time);
                            return(
                              <div key={i} onClick={()=>setCalloutClasses(p=>{const exists=p.find(s=>s.cls===c.cls&&s.time===c.time);return exists?p.filter(s=>!(s.cls===c.cls&&s.time===c.time)):[...p,{cls:c.cls,time:c.time}];})} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:C.radiusSm,border:`1px solid ${checked?C.redBorder:C.border}`,background:checked?C.red:"transparent",cursor:"pointer"}}>
                                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${checked?C.redText:C.border2}`,background:checked?C.redText:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                  {checked&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                                </div>
                                <div>
                                  <div style={{fontSize:12,fontWeight:600,color:checked?C.redText:C.text}}>{c.cls}</div>
                                  <div style={{fontSize:10,color:checked?C.redText:C.text2}}>{c.time}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {calloutClasses.length>0&&<div style={{marginTop:8,fontSize:11,color:C.redText,background:C.red,border:`1px solid ${C.redBorder}`,borderRadius:C.radiusSm,padding:"6px 10px"}}>⚠ {calloutClasses.length} class{calloutClasses.length>1?"es":""} flagged</div>}
                      </div>
                    );
                  })()}
                  <div>
                    <label style={{fontSize:11,fontWeight:600,color:C.text2}}>Reason / note (optional)</label>
                    <input value={calloutNote} onChange={e=>setCalloutNote(e.target.value)} placeholder="e.g. sick, family emergency..." style={inp}/>
                  </div>
                  <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:C.radiusSm,padding:"8px 10px",fontSize:11,color:"#92400e"}}>
                    Management will be notified and will arrange a sub. You don't need to find one.
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}>
                  <button onClick={resetCallout} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:`1px solid ${C.border}`,background:C.bg2,cursor:"pointer",color:C.text2,fontSize:12}}>Cancel</button>
                  <button onClick={submitCallout} disabled={calloutClasses.length===0||!calloutDate} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:"none",background:calloutClasses.length>0&&calloutDate?"#dc2626":"#d1d5db",color:calloutClasses.length>0&&calloutDate?"#fff":"#9ca3af",fontWeight:600,cursor:calloutClasses.length>0&&calloutDate?"pointer":"default",fontSize:12}}>Submit Call-Out</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD COACH MODAL */}
      {showAddCoach&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{...card,width:360,maxWidth:"92vw"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Add New Coach</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><label style={{fontSize:12,fontWeight:600,color:C.text2}}>Full name (Last, First)</label><input value={coachForm.name} onChange={e=>setCoachForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Smith, Jane" style={inp}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:C.text2}}>Phone</label><input value={coachForm.phone} onChange={e=>setCoachForm(p=>({...p,phone:e.target.value}))} placeholder="e.g. 5105551234" style={inp}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:C.text2}}>Email</label><input value={coachForm.email} onChange={e=>setCoachForm(p=>({...p,email:e.target.value}))} placeholder="e.g. jane@gmail.com" style={inp}/></div>
              <div style={{fontSize:11,color:C.text2,background:C.bg2,borderRadius:C.radiusSm,padding:"7px 10px"}}>A unique login code will be auto-generated.</div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowAddCoach(false);setCoachForm({name:"",phone:"",email:""});}} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:`1px solid ${C.border}`,background:C.bg2,cursor:"pointer",color:C.text2,fontSize:12}}>Cancel</button>
              <button onClick={addCoach} disabled={!coachForm.name} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:"none",background:coachForm.name?"#16a34a":"#d1d5db",color:coachForm.name?"#fff":"#9ca3af",fontWeight:600,cursor:coachForm.name?"pointer":"default",fontSize:12}}>Add Coach</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COACH MODAL */}
      {editCoach&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{...card,width:360,maxWidth:"92vw"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Edit Coach</div>
            <div style={{background:C.bg2,borderRadius:C.radiusSm,padding:"7px 10px",marginBottom:12,fontSize:12,color:C.text2}}>Login code: <strong style={{color:C.blueText}}>{editCoach.code}</strong></div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><label style={{fontSize:12,fontWeight:600,color:C.text2}}>Phone</label><input value={coachForm.phone} onChange={e=>setCoachForm(p=>({...p,phone:e.target.value}))} style={inp}/></div>
              <div><label style={{fontSize:12,fontWeight:600,color:C.text2}}>Email</label><input value={coachForm.email} onChange={e=>setCoachForm(p=>({...p,email:e.target.value}))} style={inp}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}>
              <button onClick={()=>setEditCoach(null)} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:`1px solid ${C.border}`,background:C.bg2,cursor:"pointer",color:C.text2,fontSize:12}}>Cancel</button>
              <button onClick={()=>updateCoach(editCoach.id,{phone:coachForm.phone,email:coachForm.email})} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:"none",background:"#2563eb",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:12}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* COACH SCHEDULE MODAL */}
      {scheduleCoach&&(()=>{
        const ct=STAFF_CONTACTS[scheduleCoach.name]||{};const phone=fp(ct.phone||"");
        const byDay=DAY_ORDER.map(day=>({day,classes:schedule.filter(r=>r.name===scheduleCoach.name&&r.day===day).sort((a,b)=>a.time.localeCompare(b.time))})).filter(d=>d.classes.length>0);
        return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}}>
          <div style={{background:C.bg,borderRadius:C.radius,border:`1px solid ${C.border}`,width:440,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{background:C.blue,borderBottom:`1px solid ${C.blueBorder}`,padding:"14px 18px",borderRadius:`${C.radius} ${C.radius} 0 0`,display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={scheduleCoach.name} size={40}/>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:C.blueText}}>{sn(scheduleCoach.name)}</div><div style={{fontSize:10,color:C.blueText,opacity:0.8}}>{schedule.filter(r=>r.name===scheduleCoach.name).length} classes/week{phone?` · ${phone}`:""}</div></div>
              <button onClick={()=>setScheduleCoach(null)} style={{background:"transparent",border:`1px solid ${C.blueBorder}`,borderRadius:C.radiusSm,padding:"3px 8px",fontSize:11,cursor:"pointer",color:C.blueText}}>✕</button>
            </div>
            <div style={{padding:"14px 18px"}}>
              {byDay.map(({day,classes})=>(<div key={day} style={{marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:10,color:C.blueText,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5,paddingBottom:3,borderBottom:`1px solid ${C.border}`}}>{day}</div>
                {classes.map((r,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:i<classes.length-1?`1px solid ${C.bg3}`:"none"}}>
                  <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:C.radiusSm,padding:"3px 7px",fontSize:10,fontWeight:600,color:C.text,whiteSpace:"nowrap",minWidth:120,textAlign:"center"}}>{r.time}</div>
                  <div style={{fontSize:12,color:C.text,fontWeight:500}}>{r.cls}</div>
                </div>))}
              </div>))}
            </div>
          </div>
        </div>);
      })()}

      {/* FIND SUB MODAL */}
      {findSubShift&&(()=>{
        const s=findSubShift;
        const busy=new Set(schedule.filter(r=>r.day===s.day&&r.time===s.time).map(r=>r.name));
        const best=coaches.filter(c=>c.name!==s.instructorName&&!busy.has(c.name)&&c.classes.includes(s.cls)&&(availability[c.id]||[]).includes(s.day));
        const ok=coaches.filter(c=>c.name!==s.instructorName&&!busy.has(c.name)&&!c.classes.includes(s.cls)&&(availability[c.id]||[]).includes(s.day));
        const unavail=coaches.filter(c=>c.name!==s.instructorName&&!busy.has(c.name)&&!(availability[c.id]||[]).includes(s.day));
        const CR=({c,level})=>{
          const ct=STAFF_CONTACTS[c.name]||{};const phone=fp(ct.phone||"");
          const[bg,tc,bc,label]=level==="best"?[C.green,C.greenText,C.greenBorder,"✓ teaches this class"]:level==="ok"?[C.yellow,C.yellowText,C.yellowBorder,"available"]:[C.bg2,C.text3,C.border,"unavailable"];
          return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
            <Avatar name={c.name} size={28}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{sn(c.name)}</div><div style={{fontSize:10,color:C.text2}}>{(availability[c.id]||[]).map(d=>DAY_SHORT[d]).join(" · ")}</div>{phone&&<a href={`tel:${phone}`} style={{fontSize:10,color:C.blueText,textDecoration:"none"}}>{phone}</a>}</div>
            <span style={pill(bg,tc,bc)}>{label}</span>
            {level!=="unavail"&&<button onClick={()=>assignSub(s,c)} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:C.radiusSm,padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:500}}>Assign</button>}
          </div>);
        };
        return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...card,width:420,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Find a Sub</div>
            <div style={{fontSize:11,color:C.text2,marginBottom:12,background:C.bg2,borderRadius:C.radiusSm,padding:"5px 8px"}}>{s.day} · {s.time} · {s.cls} · covering {sn(s.instructorName)}</div>
            {best.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:C.greenText,marginBottom:5,textTransform:"uppercase"}}>Best matches</div>{best.map(c=><CR key={c.id} c={c} level="best"/>)}</div>}
            {ok.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:C.yellowText,marginBottom:5,textTransform:"uppercase"}}>Available — different class</div>{ok.map(c=><CR key={c.id} c={c} level="ok"/>)}</div>}
            {best.length===0&&ok.length===0&&<div style={{background:C.red,border:`1px solid ${C.redBorder}`,borderRadius:C.radiusSm,padding:"8px 12px",color:C.redText,fontSize:12,marginBottom:12}}>No available coaches for {s.day} at this time.</div>}
            {unavail.length>0&&<details><summary style={{fontSize:11,color:C.text2,cursor:"pointer"}}>Show {unavail.length} unavailable coaches</summary><div style={{marginTop:6}}>{unavail.slice(0,8).map(c=><CR key={c.id} c={c} level="unavail"/>)}</div></details>}
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><button onClick={()=>setFindSubShift(null)} style={{padding:"5px 14px",borderRadius:C.radiusSm,border:`1px solid ${C.border}`,background:C.bg2,cursor:"pointer",color:C.text2,fontSize:12}}>Close</button></div>
          </div>
        </div>);
      })()}

      {showPost&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...card,width:390,maxWidth:"92vw",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Post Substitute Shift</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><label style={{fontSize:11,fontWeight:600,color:C.text2}}>Instructor calling out</label>
                <select value={form.instructorName} onChange={e=>{ff("instructorName",e.target.value);ff("day","");ff("date","");setPostWeekOffset(0);setSelectedClasses([]);}} style={inp}>
                  <option value="">— select instructor —</option>
                  {coaches.map(c=><option key={c.name} value={c.name}>{sn(c.name)}</option>)}
                </select>
              </div>
              {form.instructorName&&<div>
                <label style={{fontSize:11,fontWeight:600,color:C.text2,display:"block",marginBottom:6}}>Select date</label>
                {(()=>{
                  const instrDays=new Set(schedule.filter(r=>r.name===form.instructorName).map(r=>r.day));
                  const today=new Date();today.setHours(0,0,0,0);
                  const startOfWeek=new Date(today);startOfWeek.setDate(today.getDate()-today.getDay()+postWeekOffset*7);
                  const endOfWeek=new Date(startOfWeek);endOfWeek.setDate(startOfWeek.getDate()+6);
                  const weekLabel=`${startOfWeek.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${endOfWeek.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
                  const days=DAY_ORDER.map((dayName,i)=>{
                    const d=new Date(startOfWeek);d.setDate(startOfWeek.getDate()+i);
                    const iso=d.toISOString().slice(0,10);
                    const isPast=d<today;
                    const isToday=d.getTime()===today.getTime();
                    const hasClasses=instrDays.has(dayName);
                    const isSelected=form.date===iso;
                    return{dayName,d,iso,isPast,isToday,hasClasses,isSelected,num:d.getDate()};
                  });
                  return(
                    <div style={{background:C.bg2,borderRadius:C.radius,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderBottom:`1px solid ${C.border}`,background:C.bg}}>
                        <button onClick={()=>{if(postWeekOffset>0){setPostWeekOffset(w=>w-1);ff("day","");ff("date","");setSelectedClasses([]);}}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:C.radiusSm,width:26,height:26,cursor:postWeekOffset>0?"pointer":"default",fontSize:14,color:postWeekOffset>0?C.text:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                        <div style={{fontSize:11,fontWeight:600,color:C.text}}>{weekLabel}</div>
                        <button onClick={()=>{setPostWeekOffset(w=>w+1);ff("day","");ff("date","");setSelectedClasses([]);}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:C.radiusSm,width:26,height:26,cursor:"pointer",fontSize:14,color:C.text,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,padding:6}}>
                        {DAY_ORDER.map(d=>(
                          <div key={d} style={{textAlign:"center",fontSize:9,fontWeight:700,color:C.text3,textTransform:"uppercase",paddingBottom:2}}>{DAY_SHORT[d]}</div>
                        ))}
                        {days.map(({dayName,iso,isPast,isToday,hasClasses,isSelected,num})=>{
                          const selectable=!isPast&&hasClasses;
                          return(
                            <div key={iso} onClick={()=>{if(selectable){ff("day",dayName);ff("date",iso);setSelectedClasses([]);}}}
                              style={{textAlign:"center",padding:"6px 2px",borderRadius:C.radiusSm,cursor:selectable?"pointer":"default",
                                background:isSelected?"#16a34a":isToday&&!isSelected?"#eff6ff":"transparent",
                                border:`1px solid ${isSelected?"#16a34a":isToday&&!isSelected?C.blueBorder:"transparent"}`,
                                opacity:isPast?0.3:1,position:"relative"}}>
                              <div style={{fontSize:12,fontWeight:isSelected||isToday?700:400,color:isSelected?"#fff":isToday?C.blueText:hasClasses&&!isPast?C.text:C.text3}}>{num}</div>
                              {hasClasses&&!isPast&&<div style={{width:4,height:4,borderRadius:"50%",background:isSelected?"rgba(255,255,255,0.7)":"#16a34a",margin:"2px auto 0"}}/>}
                            </div>
                          );
                        })}
                      </div>
                      {form.date&&<div style={{padding:"6px 10px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.text2,background:C.bg}}>
                        📅 {new Date(form.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} — {sn(form.instructorName)}
                      </div>}
                      {!form.date&&<div style={{padding:"6px 10px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.text3,background:C.bg}}>
                        Tap a day with a green dot — those are {sn(form.instructorName)}'s scheduled days.
                      </div>}
                    </div>
                  );
                })()}
              </div>}
              {form.day&&cOnDay.length>0&&(
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <label style={{fontSize:11,fontWeight:600,color:C.text2}}>Select classes to cover</label>
                    <button onClick={()=>selectedClasses.length===cOnDay.length?setSelectedClasses([]):setSelectedClasses(cOnDay.map(c=>({cls:c.cls,time:c.time})))} style={{background:selectedClasses.length===cOnDay.length?C.red:C.blue,color:selectedClasses.length===cOnDay.length?C.redText:C.blueText,border:`1px solid ${selectedClasses.length===cOnDay.length?C.redBorder:C.blueBorder}`,borderRadius:C.radiusSm,padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>
                      {selectedClasses.length===cOnDay.length?"Deselect all":"Select all"}
                    </button>
                  </div>
                  <div style={{fontSize:10,color:C.text2,marginBottom:6}}>Check all that apply — one text sent per coach.</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
                    {cOnDay.map((c,i)=>{
                      const checked=selectedClasses.some(s=>s.cls===c.cls&&s.time===c.time);
                      return(
                        <div key={i} onClick={()=>toggleClass(c.cls,c.time)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:C.radiusSm,border:`1px solid ${checked?C.blueBorder:C.border}`,background:checked?C.blue:"transparent",cursor:"pointer"}}>
                          <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${checked?C.blueText:C.border2}`,background:checked?C.blueText:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {checked&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:checked?C.blueText:C.text}}>{c.cls}</div>
                            <div style={{fontSize:10,color:checked?C.blueText:C.text2}}>{c.time}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedClasses.length>0&&(
                    <div style={{marginTop:8,fontSize:11,color:C.greenText,background:C.green,border:`1px solid ${C.greenBorder}`,borderRadius:C.radiusSm,padding:"6px 10px"}}>
                      ✓ {selectedClasses.length} class{selectedClasses.length>1?"es":""} selected — 1 text per coach
                    </div>
                  )}
                </div>
              )}
              <div><label style={{fontSize:11,fontWeight:600,color:C.text2}}>Notes (optional)</label><input value={form.notes} onChange={e=>ff("notes",e.target.value)} placeholder="e.g. Studio A" style={inp}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowPost(false);setSelectedClasses([]);setPostWeekOffset(0);setForm({instructorName:"",day:"",date:"",time:"",cls:"",notes:""});}} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:`1px solid ${C.border}`,background:C.bg2,cursor:"pointer",color:C.text2,fontSize:12}}>Cancel</button>
              <button onClick={postShift} disabled={selectedClasses.length===0||!form.date} style={{padding:"6px 14px",borderRadius:C.radiusSm,border:"none",background:selectedClasses.length>0&&form.date?"#16a34a":"#d1d5db",color:selectedClasses.length>0&&form.date?"#fff":"#9ca3af",fontWeight:600,cursor:selectedClasses.length>0&&form.date?"pointer":"default",fontSize:12}}>Post & notify coaches</button>
            </div>
          </div>
        </div>
      )}

      {/* PROTOCOL MODAL */}
      {showProtocol&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}}>
          <div style={{background:C.bg,borderRadius:C.radius,border:`1px solid ${C.border}`,width:460,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{background:"#7c3aed",padding:"18px 22px",borderRadius:`${C.radius} ${C.radius} 0 0`}}>
              <div style={{fontWeight:700,fontSize:17,color:"#fff",marginBottom:2}}>Sub Call-Out Protocol</div>
              <div style={{fontSize:11,color:"#c4b5fd"}}>Bay Aerials — Follow this process every time.</div>
            </div>
            <div style={{padding:"18px 22px"}}>
              {[{n:"01",t:"Coach texts manager/owner",d:"All call-outs route through the manager — not the group chat. Minimum notice: 2 hours before class."},
                {n:"02",t:"Manager marks call-out in app",d:"Open today's schedule, find the class, tap 'Mark Call-Out'. Class flips to red until covered."},
                {n:"03",t:"App surfaces available subs",d:"Only coaches NOT already teaching during that time slot are shown."},
                {n:"04",t:"Manager contacts subs in order",d:"Work down the list by seniority, certification match, and fairness. First confirmed sub gets it."},
                {n:"05",t:"Assign + confirm in app",d:"Tap coach's name → add note → Confirm Sub. Class flips to green."},
                {n:"06",t:"If uncovered",d:"Manager covers personally OR notify families 60+ min before class with credit/makeup option."},
                {n:"07",t:"Post-class",d:"Sub logs hours in iClassPro same as a normal shift. Manager notes swap for weekly payroll review."},
              ].map(s=>(<div key={s.n} style={{display:"flex",gap:12,marginBottom:14}}>
                <div style={{background:"#7c3aed",color:"#fff",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{s.n}</div>
                <div><div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{s.t}</div><div style={{fontSize:11,color:C.text2,lineHeight:1.6}}>{s.d}</div></div>
              </div>))}
              <div style={{background:"#faf5ff",border:"1px solid #e9d5ff",borderRadius:C.radiusSm,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:11,color:"#7c3aed",marginBottom:6,textTransform:"uppercase"}}>Key Rules</div>
                {["Coaches do NOT find their own subs — manager owns the process.","Every call-out gets logged, even if covered.","Same-day no-shows: document in the note field for HR follow-up."].map((r,i)=>(
                  <div key={i} style={{display:"flex",gap:6,marginBottom:i<2?5:0,fontSize:11,color:"#6d28d9"}}><span style={{fontWeight:700}}>→</span><span>{r}</span></div>
                ))}
              </div>
              <button onClick={()=>setShowProtocol(false)} style={{width:"100%",padding:9,background:"#7c3aed",color:"#fff",border:"none",borderRadius:C.radiusSm,fontWeight:700,fontSize:13,cursor:"pointer"}}>Got It</button>
              <div style={{textAlign:"center",fontSize:9,color:C.text3,marginTop:8}}>Bay Aerials Gymnastics — Sub Ops v1.0</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
