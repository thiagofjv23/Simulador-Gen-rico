// Catálogo canônico de tipos de evento. Cada tipo de evento pertence a uma
// modalidade (js/modalities.js) e, por ela, a um esporte (js/sports.js). É o
// nível mais fino da hierarquia esporte → modalidade → tipo de evento; toda
// competição deve referenciar um tipo de evento daqui.
export default [
  // ==========================================
  // ESPORTES AQUÁTICOS (sport_aquatics)
  // ==========================================
  // Natação (modality_swimming)
  { id: "event_swimming_50m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "50m Livre" },
  { id: "event_swimming_100m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "100m Livre" },
  { id: "event_swimming_200m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "200m Livre" },
  { id: "event_swimming_400m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "400m Livre" },
  { id: "event_swimming_800m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "800m Livre" },
  { id: "event_swimming_1500m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "1500m Livre" },
  { id: "event_swimming_100m_backstroke", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "100m Costas" },
  { id: "event_swimming_200m_backstroke", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "200m Costas" },
  { id: "event_swimming_100m_breaststroke", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "100m Peito" },
  { id: "event_swimming_200m_breaststroke", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "200m Peito" },
  { id: "event_swimming_100m_butterfly", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "100m Borboleta" },
  { id: "event_swimming_200m_butterfly", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "200m Borboleta" },
  { id: "event_swimming_200m_individual_medley", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "200m Medley" },
  { id: "event_swimming_400m_individual_medley", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "400m Medley" },
  { id: "event_swimming_relay_4x100m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "Revezamento 4x100m Livre" },
  { id: "event_swimming_relay_4x200m_freestyle", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "Revezamento 4x200m Livre" },
  { id: "event_swimming_relay_4x100m_medley", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "Revezamento 4x100m Medley" },
  { id: "event_swimming_relay_4x100m_mixed_medley", modalityId: "modality_swimming", sportId: "sport_aquatics", name: "Revezamento 4x100m Medley Misto" },

  // Maratona Aquática (modality_marathon_swimming)
  { id: "event_marathon_swimming_10km", modalityId: "modality_marathon_swimming", sportId: "sport_aquatics", name: "Maratona Aquática 10km" },

  // Saltos Ornamentais (modality_diving)
  { id: "event_diving_3m_springboard", modalityId: "modality_diving", sportId: "sport_aquatics", name: "Trampolim 3m Individual" },
  { id: "event_diving_10m_platform", modalityId: "modality_diving", sportId: "sport_aquatics", name: "Plataforma 10m Individual" },
  { id: "event_diving_3m_synchronised", modalityId: "modality_diving", sportId: "sport_aquatics", name: "Trampolim 3m Sincronizado" },
  { id: "event_diving_10m_synchronised", modalityId: "modality_diving", sportId: "sport_aquatics", name: "Plataforma 10m Sincronizado" },

  // Polo Aquático (modality_water_polo)
  { id: "event_water_polo_tournament", modalityId: "modality_water_polo", sportId: "sport_aquatics", name: "Torneio Olímpico de Polo Aquático" },

  // Natação Artística (modality_artistic_swimming)
  { id: "event_artistic_swimming_duet", modalityId: "modality_artistic_swimming", sportId: "sport_aquatics", name: "Dueto" },
  { id: "event_artistic_swimming_team", modalityId: "modality_artistic_swimming", sportId: "sport_aquatics", name: "Equipe" },

  // ==========================================
  // TIRO COM ARCO (sport_archery)
  // ==========================================
  { id: "event_archery_individual", modalityId: "modality_archery", sportId: "sport_archery", name: "Tiro com Arco Individual" },
  { id: "event_archery_team", modalityId: "modality_archery", sportId: "sport_archery", name: "Tiro com Arco por Equipes" },
  { id: "event_archery_mixed_team", modalityId: "modality_archery", sportId: "sport_archery", name: "Tiro com Arco Equipe Mista" },

  // ==========================================
  // ATLETISMO (sport_athletics)
  // ==========================================
  { id: "event_athletics_100m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "100m Rasos" },
  { id: "event_athletics_200m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "200m Rasos" },
  { id: "event_athletics_400m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "400m Rasos" },
  { id: "event_athletics_800m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "800m" },
  { id: "event_athletics_1500m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "1500m" },
  { id: "event_athletics_5000m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "5000m" },
  { id: "event_athletics_10000m", modalityId: "modality_athletics", sportId: "sport_athletics", name: "10000m" },
  { id: "event_athletics_110m_hurdles", modalityId: "modality_athletics", sportId: "sport_athletics", name: "110m com Barreiras" },
  { id: "event_athletics_100m_hurdles", modalityId: "modality_athletics", sportId: "sport_athletics", name: "100m com Barreiras" },
  { id: "event_athletics_400m_hurdles", modalityId: "modality_athletics", sportId: "sport_athletics", name: "400m com Barreiras" },
  { id: "event_athletics_3000m_steeplechase", modalityId: "modality_athletics", sportId: "sport_athletics", name: "3000m com Obstáculos" },
  { id: "event_athletics_4x100m_relay", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Revezamento 4x100m" },
  { id: "event_athletics_4x400m_relay", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Revezamento 4x400m" },
  { id: "event_athletics_4x400m_mixed_relay", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Revezamento 4x400m Misto" },
  { id: "event_athletics_marathon", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Maratona" },
  { id: "event_athletics_20km_race_walk", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Marcha Atlética 20km" },
  { id: "event_athletics_mixed_marathon_race_walk_relay", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Marcha Atlética Revezamento Misto" },
  { id: "event_athletics_high_jump", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Salto em Altura" },
  { id: "event_athletics_pole_vault", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Salto com Vara" },
  { id: "event_athletics_long_jump", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Salto em Distância" },
  { id: "event_athletics_triple_jump", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Salto Triplo" },
  { id: "event_athletics_shot_put", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Arremesso de Peso" },
  { id: "event_athletics_discus_throw", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Lançamento de Disco" },
  { id: "event_athletics_hammer_throw", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Lançamento de Martelo" },
  { id: "event_athletics_javelin_throw", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Lançamento de Dardo" },
  { id: "event_athletics_decathlon", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Decatlo" },
  { id: "event_athletics_heptathlon", modalityId: "modality_athletics", sportId: "sport_athletics", name: "Heptatlo" },

  // ==========================================
  // BADMINTON (sport_badminton)
  // ==========================================
  { id: "event_badminton_singles", modalityId: "modality_badminton", sportId: "sport_badminton", name: "Badminton Simples" },
  { id: "event_badminton_doubles", modalityId: "modality_badminton", sportId: "sport_badminton", name: "Badminton Duplas" },
  { id: "event_badminton_mixed_doubles", modalityId: "modality_badminton", sportId: "sport_badminton", name: "Badminton Duplas Mistas" },

  // ==========================================
  // BEISEBOL E SOFTBOL (sport_baseball_softball)
  // ==========================================
  { id: "event_baseball_tournament", modalityId: "modality_baseball", sportId: "sport_baseball_softball", name: "Torneio de Beisebol" },
  { id: "event_softball_tournament", modalityId: "modality_softball", sportId: "sport_baseball_softball", name: "Torneio de Softbol" },

  // ==========================================
  // BASQUETE (sport_basketball)
  // ==========================================
  { id: "event_basketball_5x5_tournament", modalityId: "modality_basketball_5x5", sportId: "sport_basketball", name: "Torneio Basquete 5x5" },
  { id: "event_basketball_3x3_tournament", modalityId: "modality_basketball_3x3", sportId: "sport_basketball", name: "Torneio Basquete 3x3" },

  // ==========================================
  // BOXE (sport_boxing)
  // ==========================================
  { id: "event_boxing_flyweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Mosca" },
  { id: "event_boxing_featherweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Pena" },
  { id: "event_boxing_lightweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Leve" },
  { id: "event_boxing_welterweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Meio-Médio" },
  { id: "event_boxing_middleweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Médio" },
  { id: "event_boxing_light_heavyweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Meio-Pesado" },
  { id: "event_boxing_heavyweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Pesado" },
  { id: "event_boxing_super_heavyweight", modalityId: "modality_boxing", sportId: "sport_boxing", name: "Peso Superpesado" },

  // ==========================================
  // CANOAGEM (sport_canoeing)
  // ==========================================
  { id: "event_canoe_sprint_c1_200m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Canoa Individual (C-1) 200m" },
  { id: "event_canoe_sprint_c1_1000m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Canoa Individual (C-1) 1000m" },
  { id: "event_canoe_sprint_c2_500m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Canoa Dupla (C-2) 500m" },
  { id: "event_canoe_sprint_k1_500m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Caiaque Individual (K-1) 500m" },
  { id: "event_canoe_sprint_k1_1000m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Caiaque Individual (K-1) 1000m" },
  { id: "event_canoe_sprint_k2_500m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Caiaque Duplo (K-2) 500m" },
  { id: "event_canoe_sprint_k4_500m", modalityId: "modality_canoe_sprint", sportId: "sport_canoeing", name: "Caiaque Quádruplo (K-4) 500m" },
  { id: "event_canoe_slalom_c1", modalityId: "modality_canoe_slalom", sportId: "sport_canoeing", name: "Canoa Slalom Individual (C-1)" },
  { id: "event_canoe_slalom_k1", modalityId: "modality_canoe_slalom", sportId: "sport_canoeing", name: "Caiaque Slalom Individual (K-1)" },
  { id: "event_canoe_slalom_kayak_cross", modalityId: "modality_canoe_slalom", sportId: "sport_canoeing", name: "Caiaque Cross (KX-1)" },

  // ==========================================
  // CRÍQUETE (sport_cricket)
  // ==========================================
  { id: "event_cricket_t20_tournament", modalityId: "modality_cricket_t20", sportId: "sport_cricket", name: "Torneio de Críquete T20" },

  // ==========================================
  // CICLISMO (sport_cycling)
  // ==========================================
  { id: "event_cycling_road_race", modalityId: "modality_cycling_road", sportId: "sport_cycling", name: "Corrida em Estrada" },
  { id: "event_cycling_road_time_trial", modalityId: "modality_cycling_road", sportId: "sport_cycling", name: "Contrarrelógio Individual" },
  { id: "event_cycling_track_sprint", modalityId: "modality_cycling_track", sportId: "sport_cycling", name: "Velocidade Individual" },
  { id: "event_cycling_track_team_sprint", modalityId: "modality_cycling_track", sportId: "sport_cycling", name: "Velocidade por Equipes" },
  { id: "event_cycling_track_keirin", modalityId: "modality_cycling_track", sportId: "sport_cycling", name: "Keirin" },
  { id: "event_cycling_track_team_pursuit", modalityId: "modality_cycling_track", sportId: "sport_cycling", name: "Perseguição por Equipes" },
  { id: "event_cycling_track_omnium", modalityId: "modality_cycling_track", sportId: "sport_cycling", name: "Omnium" },
  { id: "event_cycling_track_madison", modalityId: "modality_cycling_track", sportId: "sport_cycling", name: "Madison" },
  { id: "event_cycling_mountain_bike_cross_country", modalityId: "modality_cycling_mountain_bike", sportId: "sport_cycling", name: "Mountain Bike Cross-country (XCO)" },
  { id: "event_cycling_bmx_racing_race", modalityId: "modality_cycling_bmx_racing", sportId: "sport_cycling", name: "BMX Racing" },
  { id: "event_cycling_bmx_freestyle_park", modalityId: "modality_cycling_bmx_freestyle", sportId: "sport_cycling", name: "BMX Freestyle Park" },

  // ==========================================
  // HIPISMO (sport_equestrian)
  // ==========================================
  { id: "event_equestrian_dressage_individual", modalityId: "modality_equestrian_dressage", sportId: "sport_equestrian", name: "Adestramento Individual" },
  { id: "event_equestrian_dressage_team", modalityId: "modality_equestrian_dressage", sportId: "sport_equestrian", name: "Adestramento por Equipes" },
  { id: "event_equestrian_eventing_individual", modalityId: "modality_equestrian_eventing", sportId: "sport_equestrian", name: "CCE Individual" },
  { id: "event_equestrian_eventing_team", modalityId: "modality_equestrian_eventing", sportId: "sport_equestrian", name: "CCE por Equipes" },
  { id: "event_equestrian_jumping_individual", modalityId: "modality_equestrian_jumping", sportId: "sport_equestrian", name: "Salto Individual" },
  { id: "event_equestrian_jumping_team", modalityId: "modality_equestrian_jumping", sportId: "sport_equestrian", name: "Salto por Equipes" },

  // ==========================================
  // ESGRIMA (sport_fencing)
  // ==========================================
  { id: "event_fencing_individual_epee", modalityId: "modality_fencing", sportId: "sport_fencing", name: "Espada Individual" },
  { id: "event_fencing_team_epee", modalityId: "modality_fencing", sportId: "sport_fencing", name: "Espada por Equipes" },
  { id: "event_fencing_individual_foil", modalityId: "modality_fencing", sportId: "sport_fencing", name: "Florete Individual" },
  { id: "event_fencing_team_foil", modalityId: "modality_fencing", sportId: "sport_fencing", name: "Florete por Equipes" },
  { id: "event_fencing_individual_sabre", modalityId: "modality_fencing", sportId: "sport_fencing", name: "Sabre Individual" },
  { id: "event_fencing_team_sabre", modalityId: "modality_fencing", sportId: "sport_fencing", name: "Sabre por Equipes" },

  // ==========================================
  // HÓQUEI SOBRE GRAMA (sport_field_hockey)
  // ==========================================
  { id: "event_field_hockey_tournament", modalityId: "modality_field_hockey", sportId: "sport_field_hockey", name: "Torneio de Hóquei sobre Grama" },

  // ==========================================
  // FLAG FOOTBALL (sport_flag_football)
  // ==========================================
  { id: "event_flag_football_tournament", modalityId: "modality_flag_football", sportId: "sport_flag_football", name: "Torneio de Flag Football" },

  // ==========================================
  // FUTEBOL (sport_football)
  // ==========================================
  { id: "event_football_tournament", modalityId: "modality_football", sportId: "sport_football", name: "Torneio de Futebol" },

  // ==========================================
  // GOLFE (sport_golf)
  // ==========================================
  { id: "event_golf_stroke_play", modalityId: "modality_golf", sportId: "sport_golf", name: "Stroke Play Individual" },

  // ==========================================
  // GINÁSTICA (sport_gymnastics)
  // ==========================================
  { id: "event_artistic_gymnastics_all_around", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Individual Geral" },
  { id: "event_artistic_gymnastics_team", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Equipes" },
  { id: "event_artistic_gymnastics_floor", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Solo" },
  { id: "event_artistic_gymnastics_vault", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Salto sobre a Mesa" },
  { id: "event_artistic_gymnastics_pommel_horse", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Cavalo com Alças" },
  { id: "event_artistic_gymnastics_rings", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Argolas" },
  { id: "event_artistic_gymnastics_parallel_bars", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Barras Paralelas" },
  { id: "event_artistic_gymnastics_horizontal_bar", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Barra Fixa" },
  { id: "event_artistic_gymnastics_balance_beam", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Trave de Equilíbrio" },
  { id: "event_artistic_gymnastics_uneven_bars", modalityId: "modality_artistic_gymnastics", sportId: "sport_gymnastics", name: "Barras Assimétricas" },
  { id: "event_rhythmic_gymnastics_individual", modalityId: "modality_rhythmic_gymnastics", sportId: "sport_gymnastics", name: "Individual Geral Rítmica" },
  { id: "event_rhythmic_gymnastics_group", modalityId: "modality_rhythmic_gymnastics", sportId: "sport_gymnastics", name: "Conjunto Geral Rítmica" },
  { id: "event_trampoline_individual", modalityId: "modality_trampoline_gymnastics", sportId: "sport_gymnastics", name: "Trampolim Individual" },

  // ==========================================
  // HANDEBOL (sport_handball)
  // ==========================================
  { id: "event_handball_tournament", modalityId: "modality_handball", sportId: "sport_handball", name: "Torneio de Handebol" },

  // ==========================================
  // JUDÔ (sport_judo)
  // ==========================================
  { id: "event_judo_extra_lightweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Ligeiro" },
  { id: "event_judo_half_lightweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Meio-Leve" },
  { id: "event_judo_lightweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Leve" },
  { id: "event_judo_half_middleweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Meio-Médio" },
  { id: "event_judo_middleweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Médio" },
  { id: "event_judo_half_heavyweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Meio-Pesado" },
  { id: "event_judo_heavyweight", modalityId: "modality_judo", sportId: "sport_judo", name: "Categoria Pesado" },
  { id: "event_judo_mixed_team", modalityId: "modality_judo", sportId: "sport_judo", name: "Equipes Mistas" },

  // ==========================================
  // LACROSSE (sport_lacrosse)
  // ==========================================
  { id: "event_lacrosse_sixes_tournament", modalityId: "modality_lacrosse_sixes", sportId: "sport_lacrosse", name: "Torneio Lacrosse Sixes" },

  // ==========================================
  // PENTATLO MODERNO (sport_modern_pentathlon)
  // ==========================================
  { id: "event_modern_pentathlon_individual", modalityId: "modality_modern_pentathlon", sportId: "sport_modern_pentathlon", name: "Pentatlo Moderno Individual" },

  // ==========================================
  // REMO (sport_rowing)
  // ==========================================
  { id: "event_rowing_single_sculls", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Single Sculls (1x)" },
  { id: "event_rowing_double_sculls", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Double Sculls (2x)" },
  { id: "event_rowing_quadruple_sculls", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Quadruple Sculls (4x)" },
  { id: "event_rowing_coxless_pair", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Dois Sem (2-)" },
  { id: "event_rowing_coxless_four", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Quatro Sem (4-)" },
  { id: "event_rowing_eight", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Oito Com (8+)" },
  { id: "event_rowing_lightweight_double_sculls", modalityId: "modality_rowing", sportId: "sport_rowing", name: "Double Sculls Peso Leve (2x)" },

  // ==========================================
  // RUGBY (sport_rugby)
  // ==========================================
  { id: "event_rugby_sevens_tournament", modalityId: "modality_rugby_sevens", sportId: "sport_rugby", name: "Torneio de Rugby Sevens" },

  // ==========================================
  // VELA (sport_sailing)
  // ==========================================
  { id: "event_sailing_dinghy", modalityId: "modality_sailing", sportId: "sport_sailing", name: "Bote Monotipo (ILCA)" },
  { id: "event_sailing_skiff", modalityId: "modality_sailing", sportId: "sport_sailing", name: "Skiff (49er / 49erFX)" },
  { id: "event_sailing_multihull", modalityId: "modality_sailing", sportId: "sport_sailing", name: "Catamarã Misto (Nacra 17)" },
  { id: "event_sailing_windsurfing", modalityId: "modality_sailing", sportId: "sport_sailing", name: "Prancha à Vela (iQFoil)" },
  { id: "event_sailing_kite", modalityId: "modality_sailing", sportId: "sport_sailing", name: "Formula Kite" },

  // ==========================================
  // TIRO ESPORTIVO (sport_shooting)
  // ==========================================
  { id: "event_shooting_10m_air_rifle", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Carabina de Ar 10m" },
  { id: "event_shooting_50m_rifle_3_positions", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Carabina 3 Posições 50m" },
  { id: "event_shooting_10m_air_pistol", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Pistola de Ar 10m" },
  { id: "event_shooting_25m_rapid_fire_pistol", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Pistola Tiro Rápido 25m" },
  { id: "event_shooting_trap", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Fossa Olímpica" },
  { id: "event_shooting_skeet", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Skeet" },
  { id: "event_shooting_mixed_team_air_rifle", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Carabina de Ar 10m Equipe Mista" },
  { id: "event_shooting_mixed_team_air_pistol", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Pistola de Ar 10m Equipe Mista" },
  { id: "event_shooting_mixed_team_skeet", modalityId: "modality_shooting", sportId: "sport_shooting", name: "Skeet Equipe Mista" },

  // ==========================================
  // SKATE (sport_skateboarding)
  // ==========================================
  { id: "event_skateboarding_street", modalityId: "modality_skateboarding_street", sportId: "sport_skateboarding", name: "Skate Street" },
  { id: "event_skateboarding_park", modalityId: "modality_skateboarding_park", sportId: "sport_skateboarding", name: "Skate Park" },

  // ==========================================
  // ESCALADA ESPORTIVA (sport_sport_climbing)
  // ==========================================
  { id: "event_sport_climbing_boulder_lead", modalityId: "modality_sport_climbing", sportId: "sport_sport_climbing", name: "Combinado Boulder & Lead" },
  { id: "event_sport_climbing_speed", modalityId: "modality_sport_climbing", sportId: "sport_sport_climbing", name: "Velocidade (Speed)" },

  // ==========================================
  // SQUASH (sport_squash)
  // ==========================================
  { id: "event_squash_singles", modalityId: "modality_squash", sportId: "sport_squash", name: "Squash Simples" },

  // ==========================================
  // SURFE (sport_surfing)
  // ==========================================
  { id: "event_surfing_shortboard", modalityId: "modality_surfing", sportId: "sport_surfing", name: "Surfe Shortboard" },

  // ==========================================
  // TÊNIS DE MESA (sport_table_tennis)
  // ==========================================
  { id: "event_table_tennis_singles", modalityId: "modality_table_tennis", sportId: "sport_table_tennis", name: "Tênis de Mesa Simples" },
  { id: "event_table_tennis_team", modalityId: "modality_table_tennis", sportId: "sport_table_tennis", name: "Tênis de Mesa Por Equipes" },
  { id: "event_table_tennis_mixed_doubles", modalityId: "modality_table_tennis", sportId: "sport_table_tennis", name: "Tênis de Mesa Duplas Mistas" },

  // ==========================================
  // TAEKWONDO (sport_taekwondo)
  // ==========================================
  { id: "event_taekwondo_flyweight", modalityId: "modality_taekwondo", sportId: "sport_taekwondo", name: "Categoria Peso Mosca" },
  { id: "event_taekwondo_featherweight", modalityId: "modality_taekwondo", sportId: "sport_taekwondo", name: "Categoria Peso Leve" },
  { id: "event_taekwondo_middleweight", modalityId: "modality_taekwondo", sportId: "sport_taekwondo", name: "Categoria Peso Médio" },
  { id: "event_taekwondo_heavyweight", modalityId: "modality_taekwondo", sportId: "sport_taekwondo", name: "Categoria Peso Pesado" },

  // ==========================================
  // TÊNIS (sport_tennis)
  // ==========================================
  { id: "event_tennis_singles", modalityId: "modality_tennis", sportId: "sport_tennis", name: "Tênis Simples" },
  { id: "event_tennis_doubles", modalityId: "modality_tennis", sportId: "sport_tennis", name: "Tênis Duplas" },
  { id: "event_tennis_mixed_doubles", modalityId: "modality_tennis", sportId: "sport_tennis", name: "Tênis Duplas Mistas" },

  // ==========================================
  // TRIATLO (sport_triathlon)
  // ==========================================
  { id: "event_triathlon_individual", modalityId: "modality_triathlon", sportId: "sport_triathlon", name: "Triatlo Individual" },
  { id: "event_triathlon_mixed_relay", modalityId: "modality_triathlon", sportId: "sport_triathlon", name: "Triatlo Revezamento Misto" },

  // ==========================================
  // VÔLEI (sport_volleyball)
  // ==========================================
  { id: "event_volleyball_indoor_tournament", modalityId: "modality_volleyball_indoor", sportId: "sport_volleyball", name: "Torneio de Vôlei de Quadra" },
  { id: "event_volleyball_beach_tournament", modalityId: "modality_volleyball_beach", sportId: "sport_volleyball", name: "Torneio de Vôlei de Praia" },

  // ==========================================
  // LEVANTAMENTO DE PESO (sport_weightlifting)
  // ==========================================
  { id: "event_weightlifting_lightweight", modalityId: "modality_weightlifting", sportId: "sport_weightlifting", name: "Categoria Peso Leve" },
  { id: "event_weightlifting_middleweight", modalityId: "modality_weightlifting", sportId: "sport_weightlifting", name: "Categoria Peso Médio" },
  { id: "event_weightlifting_heavyweight", modalityId: "modality_weightlifting", sportId: "sport_weightlifting", name: "Categoria Peso Pesado" },
  { id: "event_weightlifting_super_heavyweight", modalityId: "modality_weightlifting", sportId: "sport_weightlifting", name: "Categoria Peso Superpesado" },

  // ==========================================
  // LUTA OLÍMPICA (sport_wrestling)
  // ==========================================
  { id: "event_wrestling_freestyle_bantamweight", modalityId: "modality_wrestling_freestyle", sportId: "sport_wrestling", name: "Luta Livre - Categoria Leve" },
  { id: "event_wrestling_freestyle_welterweight", modalityId: "modality_wrestling_freestyle", sportId: "sport_wrestling", name: "Luta Livre - Categoria Médio" },
  { id: "event_wrestling_freestyle_heavyweight", modalityId: "modality_wrestling_freestyle", sportId: "sport_wrestling", name: "Luta Livre - Categoria Pesado" },
  { id: "event_wrestling_greco_roman_lightweight", modalityId: "modality_wrestling_greco_roman", sportId: "sport_wrestling", name: "Greco-Romana - Categoria Leve" },
  { id: "event_wrestling_greco_roman_middleweight", modalityId: "modality_wrestling_greco_roman", sportId: "sport_wrestling", name: "Greco-Romana - Categoria Médio" },
  { id: "event_wrestling_greco_roman_heavyweight", modalityId: "modality_wrestling_greco_roman", sportId: "sport_wrestling", name: "Greco-Romana - Categoria Pesado" },
];
