// Catálogo canônico de modalidades. Cada esporte (ver js/sports.js) reúne uma ou
// mais modalidades, e cada modalidade agrupa os seus tipos de evento (ver
// js/eventtypes.js). Toda competição deve estar atrelada a um esporte, uma
// modalidade e um tipo de evento.
//
// entityType: o tipo de entidade que disputa a modalidade — "atleta" (atletas
// individuais), "equipe" (clubes/equipes) ou "mista" (atletas e equipes no mesmo
// campeonato, ex.: automobilismo). Deve ser compatível com o entityType do
// esporte (js/sports.js): esporte "atleta"/"equipe" fixa a categoria; esporte
// "mista" aceita qualquer uma. É o que o gerador usa para saber que tipo de
// entidade criar para cada modalidade.
export default [
  // Esportes Aquáticos (sport_aquatics)
  { id: "modality_swimming", sportId: "sport_aquatics", name: "Natação", entityType: "atleta" },
  { id: "modality_marathon_swimming", sportId: "sport_aquatics", name: "Maratona Aquática", entityType: "atleta" },
  { id: "modality_diving", sportId: "sport_aquatics", name: "Saltos Ornamentais", entityType: "atleta" },
  { id: "modality_water_polo", sportId: "sport_aquatics", name: "Polo Aquático", entityType: "equipe" },
  { id: "modality_artistic_swimming", sportId: "sport_aquatics", name: "Natação Artística", entityType: "atleta" },

  // Tiro com Arco (sport_archery)
  { id: "modality_archery", sportId: "sport_archery", name: "Tiro com Arco", entityType: "atleta" },

  // Atletismo (sport_athletics)
  { id: "modality_athletics", sportId: "sport_athletics", name: "Atletismo", entityType: "atleta" },

  // Badminton (sport_badminton)
  { id: "modality_badminton", sportId: "sport_badminton", name: "Badminton", entityType: "atleta" },

  // Beisebol e Softbol (sport_baseball_softball)
  { id: "modality_baseball", sportId: "sport_baseball_softball", name: "Beisebol", entityType: "equipe" },
  { id: "modality_softball", sportId: "sport_baseball_softball", name: "Softbol", entityType: "equipe" },

  // Basquete (sport_basketball)
  { id: "modality_basketball_5x5", sportId: "sport_basketball", name: "Basquete 5x5", entityType: "equipe" },
  { id: "modality_basketball_3x3", sportId: "sport_basketball", name: "Basquete 3x3", entityType: "equipe" },

  // Boxe (sport_boxing)
  { id: "modality_boxing", sportId: "sport_boxing", name: "Boxe", entityType: "atleta" },

  // Canoagem (sport_canoeing)
  { id: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Canoagem Velocidade", entityType: "atleta" },
  { id: "modality_canoe_slalom", sportId: "sport_canoeing", name: "Canoagem Slalom", entityType: "atleta" },

  // Críquete (sport_cricket)
  { id: "modality_cricket_t20", sportId: "sport_cricket", name: "Críquete T20", entityType: "equipe" },

  // Ciclismo (sport_cycling)
  { id: "modality_cycling_road", sportId: "sport_cycling", name: "Ciclismo de Estrada", entityType: "atleta" },
  { id: "modality_cycling_track", sportId: "sport_cycling", name: "Ciclismo de Pista", entityType: "atleta" },
  { id: "modality_cycling_mountain_bike", sportId: "sport_cycling", name: "Ciclismo Mountain Bike", entityType: "atleta" },
  { id: "modality_cycling_bmx_racing", sportId: "sport_cycling", name: "Ciclismo BMX Racing", entityType: "atleta" },
  { id: "modality_cycling_bmx_freestyle", sportId: "sport_cycling", name: "Ciclismo BMX Freestyle", entityType: "atleta" },

  // Hipismo (sport_equestrian)
  { id: "modality_equestrian_dressage", sportId: "sport_equestrian", name: "Adestramento", entityType: "atleta" },
  { id: "modality_equestrian_eventing", sportId: "sport_equestrian", name: "Concurso Completo de Equitação (CCE)", entityType: "atleta" },
  { id: "modality_equestrian_jumping", sportId: "sport_equestrian", name: "Salto", entityType: "atleta" },

  // Esgrima (sport_fencing)
  { id: "modality_fencing", sportId: "sport_fencing", name: "Esgrima", entityType: "atleta" },

  // Hóquei sobre Grama (sport_field_hockey)
  { id: "modality_field_hockey", sportId: "sport_field_hockey", name: "Hóquei sobre Grama", entityType: "equipe" },

  // Flag Football (sport_flag_football)
  { id: "modality_flag_football", sportId: "sport_flag_football", name: "Flag Football", entityType: "equipe" },

  // Futebol (sport_football)
  { id: "modality_football", sportId: "sport_football", name: "Futebol", entityType: "equipe" },

  // Golfe (sport_golf)
  { id: "modality_golf", sportId: "sport_golf", name: "Golfe", entityType: "atleta" },

  // Ginástica (sport_gymnastics)
  { id: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Ginástica Artística", entityType: "atleta" },
  { id: "modality_rhythmic_gymnastics", sportId: "sport_gymnastics", name: "Ginástica Rítmica", entityType: "atleta" },
  { id: "modality_trampoline_gymnastics", sportId: "sport_gymnastics", name: "Ginástica de Trampolim", entityType: "atleta" },

  // Handebol (sport_handball)
  { id: "modality_handball", sportId: "sport_handball", name: "Handebol", entityType: "equipe" },

  // Judô (sport_judo)
  { id: "modality_judo", sportId: "sport_judo", name: "Judô", entityType: "atleta" },

  // Lacrosse (sport_lacrosse)
  { id: "modality_lacrosse_sixes", sportId: "sport_lacrosse", name: "Lacrosse Sixes", entityType: "equipe" },

  // Pentatlo Moderno (sport_modern_pentathlon)
  { id: "modality_modern_pentathlon", sportId: "sport_modern_pentathlon", name: "Pentatlo Moderno", entityType: "atleta" },

  // Remo (sport_rowing)
  { id: "modality_rowing", sportId: "sport_rowing", name: "Remo", entityType: "atleta" },

  // Rugby (sport_rugby)
  { id: "modality_rugby_sevens", sportId: "sport_rugby", name: "Rugby Sevens", entityType: "equipe" },

  // Vela (sport_sailing)
  { id: "modality_sailing", sportId: "sport_sailing", name: "Vela", entityType: "atleta" },

  // Tiro Esportivo (sport_shooting)
  { id: "modality_shooting", sportId: "sport_shooting", name: "Tiro Esportivo", entityType: "atleta" },

  // Skate (sport_skateboarding)
  { id: "modality_skateboarding_street", sportId: "sport_skateboarding", name: "Skate Street", entityType: "atleta" },
  { id: "modality_skateboarding_park", sportId: "sport_skateboarding", name: "Skate Park", entityType: "atleta" },

  // Escalada Esportiva (sport_sport_climbing)
  { id: "modality_sport_climbing", sportId: "sport_sport_climbing", name: "Escalada Esportiva", entityType: "atleta" },

  // Squash (sport_squash)
  { id: "modality_squash", sportId: "sport_squash", name: "Squash", entityType: "atleta" },

  // Surfe (sport_surfing)
  { id: "modality_surfing", sportId: "sport_surfing", name: "Surfe", entityType: "atleta" },

  // Tênis de Mesa (sport_table_tennis)
  { id: "modality_table_tennis", sportId: "sport_table_tennis", name: "Tênis de Mesa", entityType: "atleta" },

  // Taekwondo (sport_taekwondo)
  { id: "modality_taekwondo", sportId: "sport_taekwondo", name: "Taekwondo", entityType: "atleta" },

  // Tênis (sport_tennis)
  { id: "modality_tennis", sportId: "sport_tennis", name: "Tênis", entityType: "atleta" },

  // Triatlo (sport_triathlon)
  { id: "modality_triathlon", sportId: "sport_triathlon", name: "Triatlo", entityType: "atleta" },

  // Vôlei (sport_volleyball)
  { id: "modality_volleyball_indoor", sportId: "sport_volleyball", name: "Vôlei de Quadra", entityType: "equipe" },
  { id: "modality_volleyball_beach", sportId: "sport_volleyball", name: "Vôlei de Praia", entityType: "equipe" },

  // Levantamento de Peso (sport_weightlifting)
  { id: "modality_weightlifting", sportId: "sport_weightlifting", name: "Levantamento de Peso", entityType: "atleta" },

  // Luta Olímpica (sport_wrestling)
  { id: "modality_wrestling_freestyle", sportId: "sport_wrestling", name: "Luta Livre", entityType: "atleta" },
  { id: "modality_wrestling_greco_roman", sportId: "sport_wrestling", name: "Luta Greco-Romana", entityType: "atleta" },

  // Automobilismo (sport_motorsport). Open Wheel reúne as categorias de monoposto
  // (Fórmula 1/2/3 e Regionais); GT, Endurance e Rally completam as famílias.
  // Todas mistas: pilotos (atletas) e equipes disputam o mesmo campeonato.
  { id: "modality_motorsport_open_wheel", sportId: "sport_motorsport", name: "Open Wheel", entityType: "mista" },
  { id: "modality_motorsport_gt", sportId: "sport_motorsport", name: "GT", entityType: "mista" },
  { id: "modality_motorsport_endurance", sportId: "sport_motorsport", name: "Endurance", entityType: "mista" },
  { id: "modality_motorsport_rally", sportId: "sport_motorsport", name: "Rally", entityType: "mista" },
];
