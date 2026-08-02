// Catálogo canônico de modalidades. Cada esporte (ver js/sports.js) reúne uma ou
// mais modalidades, e cada modalidade agrupa os seus tipos de evento (ver
// js/eventtypes.js). Toda competição deve estar atrelada a um esporte, uma
// modalidade e um tipo de evento. Automobilismo entra num passo posterior.
export default [
  // Esportes Aquáticos (sport_aquatics)
  {
    id: "modality_swimming",
    sportId: "sport_aquatics",
    name: "Natação",
  },
  {
    id: "modality_marathon_swimming",
    sportId: "sport_aquatics",
    name: "Maratona Aquática",
  },
  {
    id: "modality_diving",
    sportId: "sport_aquatics",
    name: "Saltos Ornamentais",
  },
  {
    id: "modality_water_polo",
    sportId: "sport_aquatics",
    name: "Polo Aquático",
  },
  {
    id: "modality_artistic_swimming",
    sportId: "sport_aquatics",
    name: "Natação Artística",
  },

  // Tiro com Arco (sport_archery)
  {
    id: "modality_archery",
    sportId: "sport_archery",
    name: "Tiro com Arco",
  },

  // Atletismo (sport_athletics)
  {
    id: "modality_athletics",
    sportId: "sport_athletics",
    name: "Atletismo",
  },

  // Badminton (sport_badminton)
  {
    id: "modality_badminton",
    sportId: "sport_badminton",
    name: "Badminton",
  },

  // Beisebol e Softbol (sport_baseball_softball)
  {
    id: "modality_baseball",
    sportId: "sport_baseball_softball",
    name: "Beisebol",
  },
  {
    id: "modality_softball",
    sportId: "sport_baseball_softball",
    name: "Softbol",
  },

  // Basquete (sport_basketball)
  {
    id: "modality_basketball_5x5",
    sportId: "sport_basketball",
    name: "Basquete 5x5",
  },
  {
    id: "modality_basketball_3x3",
    sportId: "sport_basketball",
    name: "Basquete 3x3",
  },

  // Boxe (sport_boxing)
  {
    id: "modality_boxing",
    sportId: "sport_boxing",
    name: "Boxe",
  },

  // Canoagem (sport_canoeing)
  {
    id: "modality_canoe_sprint",
    sportId: "sport_canoeing",
    name: "Canoagem Velocidade",
  },
  {
    id: "modality_canoe_slalom",
    sportId: "sport_canoeing",
    name: "Canoagem Slalom",
  },

  // Críquete (sport_cricket)
  {
    id: "modality_cricket_t20",
    sportId: "sport_cricket",
    name: "Críquete T20",
  },

  // Ciclismo (sport_cycling)
  {
    id: "modality_cycling_road",
    sportId: "sport_cycling",
    name: "Ciclismo de Estrada",
  },
  {
    id: "modality_cycling_track",
    sportId: "sport_cycling",
    name: "Ciclismo de Pista",
  },
  {
    id: "modality_cycling_mountain_bike",
    sportId: "sport_cycling",
    name: "Ciclismo Mountain Bike",
  },
  {
    id: "modality_cycling_bmx_racing",
    sportId: "sport_cycling",
    name: "Ciclismo BMX Racing",
  },
  {
    id: "modality_cycling_bmx_freestyle",
    sportId: "sport_cycling",
    name: "Ciclismo BMX Freestyle",
  },

  // Hipismo (sport_equestrian)
  {
    id: "modality_equestrian_dressage",
    sportId: "sport_equestrian",
    name: "Adestramento",
  },
  {
    id: "modality_equestrian_eventing",
    sportId: "sport_equestrian",
    name: "Concurso Completo de Equitação (CCE)",
  },
  {
    id: "modality_equestrian_jumping",
    sportId: "sport_equestrian",
    name: "Salto",
  },

  // Esgrima (sport_fencing)
  {
    id: "modality_fencing",
    sportId: "sport_fencing",
    name: "Esgrima",
  },

  // Hóquei sobre Grama (sport_field_hockey)
  {
    id: "modality_field_hockey",
    sportId: "sport_field_hockey",
    name: "Hóquei sobre Grama",
  },

  // Flag Football (sport_flag_football)
  {
    id: "modality_flag_football",
    sportId: "sport_flag_football",
    name: "Flag Football",
  },

  // Futebol (sport_football)
  {
    id: "modality_football",
    sportId: "sport_football",
    name: "Futebol",
  },

  // Golfe (sport_golf)
  {
    id: "modality_golf",
    sportId: "sport_golf",
    name: "Golfe",
  },

  // Ginástica (sport_gymnastics)
  {
    id: "modality_artistic_gymnastics",
    sportId: "sport_gymnastics",
    name: "Ginástica Artística",
  },
  {
    id: "modality_rhythmic_gymnastics",
    sportId: "sport_gymnastics",
    name: "Ginástica Rítmica",
  },
  {
    id: "modality_trampoline_gymnastics",
    sportId: "sport_gymnastics",
    name: "Ginástica de Trampolim",
  },

  // Handebol (sport_handball)
  {
    id: "modality_handball",
    sportId: "sport_handball",
    name: "Handebol",
  },

  // Judô (sport_judo)
  {
    id: "modality_judo",
    sportId: "sport_judo",
    name: "Judô",
  },

  // Lacrosse (sport_lacrosse)
  {
    id: "modality_lacrosse_sixes",
    sportId: "sport_lacrosse",
    name: "Lacrosse Sixes",
  },

  // Pentatlo Moderno (sport_modern_pentathlon)
  {
    id: "modality_modern_pentathlon",
    sportId: "sport_modern_pentathlon",
    name: "Pentatlo Moderno",
  },

  // Remo (sport_rowing)
  {
    id: "modality_rowing",
    sportId: "sport_rowing",
    name: "Remo",
  },

  // Rugby (sport_rugby)
  {
    id: "modality_rugby_sevens",
    sportId: "sport_rugby",
    name: "Rugby Sevens",
  },

  // Vela (sport_sailing)
  {
    id: "modality_sailing",
    sportId: "sport_sailing",
    name: "Vela",
  },

  // Tiro Esportivo (sport_shooting)
  {
    id: "modality_shooting",
    sportId: "sport_shooting",
    name: "Tiro Esportivo",
  },

  // Skate (sport_skateboarding)
  {
    id: "modality_skateboarding_street",
    sportId: "sport_skateboarding",
    name: "Skate Street",
  },
  {
    id: "modality_skateboarding_park",
    sportId: "sport_skateboarding",
    name: "Skate Park",
  },

  // Escalada Esportiva (sport_sport_climbing)
  {
    id: "modality_sport_climbing",
    sportId: "sport_sport_climbing",
    name: "Escalada Esportiva",
  },

  // Squash (sport_squash)
  {
    id: "modality_squash",
    sportId: "sport_squash",
    name: "Squash",
  },

  // Surfe (sport_surfing)
  {
    id: "modality_surfing",
    sportId: "sport_surfing",
    name: "Surfe",
  },

  // Tênis de Mesa (sport_table_tennis)
  {
    id: "modality_table_tennis",
    sportId: "sport_table_tennis",
    name: "Tênis de Mesa",
  },

  // Taekwondo (sport_taekwondo)
  {
    id: "modality_taekwondo",
    sportId: "sport_taekwondo",
    name: "Taekwondo",
  },

  // Tênis (sport_tennis)
  {
    id: "modality_tennis",
    sportId: "sport_tennis",
    name: "Tênis",
  },

  // Triatlo (sport_triathlon)
  {
    id: "modality_triathlon",
    sportId: "sport_triathlon",
    name: "Triatlo",
  },

  // Vôlei (sport_volleyball)
  {
    id: "modality_volleyball_indoor",
    sportId: "sport_volleyball",
    name: "Vôlei de Quadra",
  },
  {
    id: "modality_volleyball_beach",
    sportId: "sport_volleyball",
    name: "Vôlei de Praia",
  },

  // Levantamento de Peso (sport_weightlifting)
  {
    id: "modality_weightlifting",
    sportId: "sport_weightlifting",
    name: "Levantamento de Peso",
  },

  // Luta Olímpica (sport_wrestling)
  {
    id: "modality_wrestling_freestyle",
    sportId: "sport_wrestling",
    name: "Luta Livre",
  },
  {
    id: "modality_wrestling_greco_roman",
    sportId: "sport_wrestling",
    name: "Luta Greco-Romana",
  },
];
