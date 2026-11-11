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
| `manifest.webmanifest`, `sw.js`, `icones/` | Permettent d'installer l'horloge comme une application et de l'utiliser hors ligne. |

Copiez **tout le dossier** (sur l'ordinateur du tableau, une clé USB…), jamais `index.html` seul.

## 1. Sur l'écran Promethean (ActivPanel)

Les écrans Promethean ActivPanel fonctionnent sous Android et ont leur propre navigateur (Chromium/Chrome). Le plus simple est d'utiliser la version en ligne de l'horloge :

1. Sur l'écran, ouvrez le navigateur et allez à l'adresse **https://horloge.calande.eu/**.
2. **Installez-la comme une application** : menu du navigateur **⋮** → **Installer l'application** (ou **Ajouter à l'écran d'accueil**). Une icône « Horloge » apparaît ; elle ouvre l'horloge **en plein écran, sans barre de navigateur**.
3. Une fois ouverte une première fois, l'horloge **continue de fonctionner sans internet** : elle garde une copie d'elle-même. Quand internet est disponible, elle récupère automatiquement les mises à jour.
4. **Mise en veille** : dans les paramètres de l'écran (*Paramètres → Énergie* / *Économie d'énergie*, selon le modèle), désactivez la mise en veille ou l'extinction automatique pendant les heures de classe. Vous pouvez aussi y programmer l'allumage le matin et l'extinction le soir. L'horloge demande elle-même à l'écran de rester allumé quand le navigateur le permet.
5. **Photos** : touchez **🖼 Choisir une photo** dans l'onglet *Moments* et prenez la photo dans la galerie de l'écran ou sur une **clé USB**. Voir la section 3.

> Si le menu flottant Promethean (les flèches sur les bords de l'écran) gêne, il peut être masqué ou déplacé dans les réglages de l'écran. Le coin secret des paramètres (en haut à droite) n'est pas concerné.

Si l'écran est relié à un **ordinateur Windows** (ou s'il contient un module PC « OPS »), vous pouvez aussi utiliser la version locale décrite ci-dessous.

## 1 bis. Sur un ordinateur : ouvrir l'horloge en plein écran

1. Double-cliquez sur `index.html`. Utilisez de préférence **Google Chrome** ou **Microsoft Edge** (clic droit → *Ouvrir avec*). La version en ligne (adresse ci-dessus) fonctionne aussi et peut être installée de la même façon (icône ⊕ dans la barre d'adresse).
2. Passez en plein écran :
   - avec un clavier : touche **F11** (pour sortir : F11 ou Échap) ;
   - sans clavier : ouvrez les paramètres (voir plus bas) → onglet **Affichage** → **⛶ Plein écran**.
3. Pour que l'écran ne s'éteigne pas : dans Windows, *Paramètres → Système → Alimentation* → mise en veille de l'écran sur **Jamais** pendant les heures de classe.

**Option « borne »** (plein écran direct, sans barre du navigateur) : créez un raccourci sur le bureau avec comme cible :

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk "https://horloge.calande.eu/"
```

(Avec Edge : `msedge.exe --kiosk "https://horloge.calande.eu/" --edge-kiosk-type=fullscreen`.) Pour quitter ce mode : **Alt + F4**.

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

**Méthode conseillée (fonctionne partout, y compris sur l'écran Promethean)** : dans l'onglet **Moments**, touchez **🖼 Choisir une photo** à côté du moment et choisissez l'image (galerie, clé USB, dossier de l'ordinateur…). La photo est automatiquement réduite et **enregistrée dans l'horloge elle-même** : elle n'est pas publiée sur internet et fait partie de l'export de sauvegarde.

**Autre méthode (version locale sur ordinateur uniquement)** : copiez la photo dans le dossier `images` et tapez son nom (par exemple `recreation.jpg`) dans le champ « Image ». L'extension compte : `.jpg` ≠ `.svg`.

> 🔒 Les photos de la classe ne doivent pas être ajoutées au dossier `images` du dépôt GitHub : tout ce qui s'y trouve est visible publiquement sur internet. Utilisez « Choisir une photo » : elles restent sur l'écran de la classe.

## 4. Sauvegarder ou changer d'ordinateur

Les réglages (et les photos choisies avec « Choisir une photo ») sont propres au navigateur et à l'appareil. Pensez à faire **Sauvegarde → Exporter la configuration** après chaque modification importante. Sur un autre ordinateur (ou après un nettoyage du navigateur) : **Importer un fichier** et choisir ce fichier `.json`. Les photos choisies avec « Choisir une photo » sont incluses dans le fichier ; seules celles tapées par nom de fichier nécessitent de copier aussi le dossier `images`.

> ⚠ Effacer les données de navigation du navigateur efface aussi les réglages : gardez toujours un export à jour.
