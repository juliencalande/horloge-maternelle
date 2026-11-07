# Horloge de la classe — mode d'emploi

Une horloge visuelle pour la classe de maternelle : à gauche, une grande horloge dont le cadran est découpé en moments de la journée (avec leurs photos) ; à droite, le moment en cours en grand. Elle fonctionne **sans internet et sans serveur**, n'émet **aucun son** et peut rester allumée des jours entiers : elle passe toute seule au jour suivant à minuit.

## Contenu du dossier

| Élément | Rôle |
|---|---|
| `index.html` | **L'application** : c'est ce fichier qu'on ouvre. |
| `images/` | Les photos des moments. Les images fournies sont provisoires. |
| `config-exemple.js` | La journée type d'exemple, chargée au premier démarrage. |
| `exemple-configuration.json` | La même configuration, à importer si besoin. |
| `app.js`, `style.css` | Le fonctionnement et l'apparence (inutile d'y toucher). |

Copiez **tout le dossier** (sur l'ordinateur du tableau, une clé USB…), jamais `index.html` seul.

## 1. Ouvrir l'horloge en plein écran sur le tableau

1. Double-cliquez sur `index.html`. Utilisez de préférence **Google Chrome** ou **Microsoft Edge** (clic droit → *Ouvrir avec*).
2. Passez en plein écran :
   - avec un clavier : touche **F11** (pour sortir : F11 ou Échap) ;
   - sans clavier : ouvrez les paramètres (voir plus bas) → onglet **Affichage** → **⛶ Plein écran**.
3. Pour que l'écran ne s'éteigne pas : dans Windows, *Paramètres → Système → Alimentation* → mise en veille de l'écran sur **Jamais** pendant les heures de classe. L'horloge demande aussi au navigateur de garder l'écran allumé quand c'est possible.

**Option « borne »** (plein écran direct, sans barre du navigateur) : créez un raccourci sur le bureau avec comme cible :

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk "C:\chemin\vers\Horloge-Maternelle\index.html"
```

(Avec Edge : `msedge.exe --kiosk "…\index.html" --edge-kiosk-type=fullscreen`.) Pour quitter ce mode : **Alt + F4**.

## 2. Ouvrir les paramètres (geste discret)

Faites un **appui long de 2 secondes dans le coin en haut à droite** de l'écran. Un petit cercle se remplit, puis les paramètres s'ouvrent. Un appui court ne fait rien : les enfants ne les ouvrent pas par accident.
Avec un clavier : **Ctrl + Alt + P**. Pour fermer : bouton **Fermer ✕** (ou Échap).

Tout est **enregistré automatiquement** dans le navigateur.

| Onglet | Ce qu'on y fait |
|---|---|
| **Moments** | La bibliothèque : nom, couleur (pastilles prêtes à l'emploi) et image de chaque moment. « À la maison » ne peut pas être supprimé. |
| **Semaine** | L'horaire type du lundi au vendredi : moment, heure de début, heure de fin. Le bouton « Copier l'horaire de… » permet de partir d'un autre jour. |
| **Exceptions** | Une journée particulière à une date précise (sortie, fête…). Elle remplace l'horaire type ce jour-là. Une liste vide = journée entière « À la maison ». |
| **Affichage** | Aiguille des minutes (masquée par défaut), barre de temps écoulé, « Ensuite : … », date, plein écran, et **aperçu** à une autre date/heure pour vérifier un horaire. |
| **Sauvegarde** | Exporter / importer la configuration (fichier `.json`) et revenir à l'exemple. |

**À la maison** : tout ce qui n'est pas dans l'horaire du jour est automatiquement « À la maison » : avant 8h30, après 15h30, le mercredi après-midi, le samedi et le dimanche.

## 3. Mettre les photos de la classe

1. Copiez vos photos dans le dossier `images` (JPG, PNG… de préférence carrées, environ 600 × 600 pixels).
2. Deux possibilités :
   - **donner le même nom** que l'image provisoire, par exemple `recreation.jpg`, puis indiquer ce nom dans l'onglet **Moments** (l'extension compte : `.jpg` ≠ `.svg`) ;
   - ou, dans l'onglet **Moments**, toucher **🖼 Choisir** et sélectionner la photo **dans le dossier `images`**.
3. L'année suivante, il suffit de remplacer les fichiers du dossier `images` en gardant les mêmes noms : rien d'autre à changer.

## 4. Sauvegarder ou changer d'ordinateur

Les réglages sont propres au navigateur et à l'ordinateur. Pensez à faire **Sauvegarde → Exporter la configuration** après chaque modification importante. Sur un autre ordinateur (ou après un nettoyage du navigateur) : **Importer un fichier** et choisir ce fichier `.json`. N'oubliez pas de copier aussi le dossier `images`.

> ⚠ Effacer les données de navigation du navigateur efface aussi les réglages : gardez toujours un export à jour.
