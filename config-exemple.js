/*
 * Configuration d'exemple : une journée type de 3e maternelle.
 * Elle est chargée au tout premier démarrage (ou via « Revenir à l'exemple »
 * dans les paramètres). Ensuite, c'est la configuration enregistrée dans le
 * navigateur qui est utilisée.
 *
 * Jours : 1 = lundi, 2 = mardi, 3 = mercredi, 4 = jeudi, 5 = vendredi.
 * Le moment « maison » est spécial : il couvre tout ce qui n'est pas dans l'horaire.
 */
window.CONFIG_EXEMPLE = {
  "version": 1,
  "moments": [
    { "id": "maison",        "nom": "À la maison",    "couleur": "#9AD0EC", "image": "maison.svg" },
    { "id": "accueil",       "nom": "Accueil",        "couleur": "#FFD166", "image": "accueil.svg" },
    { "id": "rassemblement", "nom": "Rassemblement",  "couleur": "#F4A261", "image": "rassemblement.svg" },
    { "id": "ateliers",      "nom": "Ateliers",       "couleur": "#90BE6D", "image": "ateliers.svg" },
    { "id": "collation",     "nom": "Collation",      "couleur": "#F9844A", "image": "collation.svg" },
    { "id": "recreation",    "nom": "Récréation",     "couleur": "#4D96FF", "image": "recreation.svg" },
    { "id": "gym",           "nom": "Gym",            "couleur": "#EF6F6C", "image": "gym.svg" },
    { "id": "diner",         "nom": "Dîner",          "couleur": "#C77DFF", "image": "diner.svg" },
    { "id": "calme",         "nom": "Moment calme",   "couleur": "#B8B8E8", "image": "calme.svg" },
    { "id": "musique",       "nom": "Musique",        "couleur": "#F28FB1", "image": "musique.svg" },
    { "id": "bibliotheque",  "nom": "Bibliothèque",   "couleur": "#43AA8B", "image": "bibliotheque.svg" },
    { "id": "peinture",      "nom": "Peinture",       "couleur": "#FF9F9F", "image": "peinture.svg" },
    { "id": "sortie",        "nom": "Sortie",         "couleur": "#2EC4B6", "image": "sortie.svg" },
    { "id": "aurevoir",      "nom": "Au revoir",      "couleur": "#FFB4A2", "image": "aurevoir.svg" }
  ],
  "semaine": {
    "1": [
      { "moment": "accueil",       "debut": "08:30", "fin": "08:50" },
      { "moment": "rassemblement", "debut": "08:50", "fin": "09:15" },
      { "moment": "ateliers",      "debut": "09:15", "fin": "10:10" },
      { "moment": "collation",     "debut": "10:10", "fin": "10:30" },
      { "moment": "recreation",    "debut": "10:30", "fin": "10:50" },
      { "moment": "gym",           "debut": "10:50", "fin": "11:50" },
      { "moment": "diner",         "debut": "11:50", "fin": "13:15" },
      { "moment": "calme",         "debut": "13:15", "fin": "13:45" },
      { "moment": "ateliers",      "debut": "13:45", "fin": "14:45" },
      { "moment": "recreation",    "debut": "14:45", "fin": "15:05" },
      { "moment": "aurevoir",      "debut": "15:05", "fin": "15:30" }
    ],
    "2": [
      { "moment": "accueil",       "debut": "08:30", "fin": "08:50" },
      { "moment": "rassemblement", "debut": "08:50", "fin": "09:15" },
      { "moment": "ateliers",      "debut": "09:15", "fin": "10:10" },
      { "moment": "collation",     "debut": "10:10", "fin": "10:30" },
      { "moment": "recreation",    "debut": "10:30", "fin": "10:50" },
      { "moment": "peinture",      "debut": "10:50", "fin": "11:50" },
      { "moment": "diner",         "debut": "11:50", "fin": "13:15" },
      { "moment": "calme",         "debut": "13:15", "fin": "13:45" },
      { "moment": "ateliers",      "debut": "13:45", "fin": "14:45" },
      { "moment": "recreation",    "debut": "14:45", "fin": "15:05" },
      { "moment": "aurevoir",      "debut": "15:05", "fin": "15:30" }
    ],
    "3": [
      { "moment": "accueil",       "debut": "08:30", "fin": "08:50" },
      { "moment": "rassemblement", "debut": "08:50", "fin": "09:15" },
      { "moment": "ateliers",      "debut": "09:15", "fin": "10:10" },
      { "moment": "collation",     "debut": "10:10", "fin": "10:30" },
      { "moment": "recreation",    "debut": "10:30", "fin": "10:50" },
      { "moment": "musique",       "debut": "10:50", "fin": "11:40" },
      { "moment": "aurevoir",      "debut": "11:40", "fin": "12:00" }
    ],
    "4": [
      { "moment": "accueil",       "debut": "08:30", "fin": "08:50" },
      { "moment": "rassemblement", "debut": "08:50", "fin": "09:15" },
      { "moment": "gym",           "debut": "09:15", "fin": "10:10" },
      { "moment": "collation",     "debut": "10:10", "fin": "10:30" },
      { "moment": "recreation",    "debut": "10:30", "fin": "10:50" },
      { "moment": "ateliers",      "debut": "10:50", "fin": "11:50" },
      { "moment": "diner",         "debut": "11:50", "fin": "13:15" },
      { "moment": "calme",         "debut": "13:15", "fin": "13:45" },
      { "moment": "musique",       "debut": "13:45", "fin": "14:45" },
      { "moment": "recreation",    "debut": "14:45", "fin": "15:05" },
      { "moment": "aurevoir",      "debut": "15:05", "fin": "15:30" }
    ],
    "5": [
      { "moment": "accueil",       "debut": "08:30", "fin": "08:50" },
      { "moment": "rassemblement", "debut": "08:50", "fin": "09:15" },
      { "moment": "ateliers",      "debut": "09:15", "fin": "10:10" },
      { "moment": "collation",     "debut": "10:10", "fin": "10:30" },
      { "moment": "recreation",    "debut": "10:30", "fin": "10:50" },
      { "moment": "bibliotheque",  "debut": "10:50", "fin": "11:50" },
      { "moment": "diner",         "debut": "11:50", "fin": "13:15" },
      { "moment": "calme",         "debut": "13:15", "fin": "13:45" },
      { "moment": "peinture",      "debut": "13:45", "fin": "14:45" },
      { "moment": "recreation",    "debut": "14:45", "fin": "15:05" },
      { "moment": "aurevoir",      "debut": "15:05", "fin": "15:30" }
    ]
  },
  "exceptions": [
    {
      "date": "2026-12-18",
      "titre": "Sortie au théâtre",
      "horaire": [
        { "moment": "accueil",    "debut": "08:30", "fin": "08:50" },
        { "moment": "sortie",     "debut": "08:50", "fin": "11:50" },
        { "moment": "diner",      "debut": "11:50", "fin": "13:15" },
        { "moment": "calme",      "debut": "13:15", "fin": "13:45" },
        { "moment": "ateliers",   "debut": "13:45", "fin": "14:45" },
        { "moment": "recreation", "debut": "14:45", "fin": "15:05" },
        { "moment": "aurevoir",   "debut": "15:05", "fin": "15:30" }
      ]
    }
  ],
  "options": {
    "aiguilleMinutes": false,
    "afficherSuite": true,
    "afficherProgression": true,
    "afficherDate": true
  }
};
