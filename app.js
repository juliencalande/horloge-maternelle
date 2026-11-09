/* =====================================================================
 * Horloge de la classe — application autonome (aucun serveur, aucun son)
 * ===================================================================== */
(function () {
  'use strict';

  var CLE_STOCKAGE = 'horloge-classe-config-v1';
  var DOSSIER_IMAGES = 'images/';
  var ID_MAISON = 'maison';
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var JOURS_SEMAINE = [1, 2, 3, 4, 5];
  var PALETTE = ['#FFD166', '#F4A261', '#F9844A', '#EF6F6C', '#FF9F9F', '#F28FB1', '#C77DFF',
                 '#B8B8E8', '#4D96FF', '#9AD0EC', '#2EC4B6', '#43AA8B', '#90BE6D', '#FFB4A2'];

  // Géométrie du cadran (unités du viewBox SVG)
  var R_CADRAN = 470;      // rayon des parts de camembert
  var R_SAILLIE = 30;      // la part du moment en cours ressort de ce nombre d'unités
  var R_CENTRE = 160;      // rayon du petit cadran blanc central
  var R_AIGUILLE = 215;    // longueur de l'aiguille des heures (les photos commencent au-delà)
  var R_CHIFFRES = 118;    // rayon où sont posés les chiffres (dans le cadran central)

  var cfg = chargerConfig();
  var decalageApercu = 0;  // décalage (ms) utilisé par l'aperçu dans les paramètres
  var etat = { jour: null, cleMoment: null, cleCadran: null };

  // ------------------------------------------------------------------
  // Outils
  // ------------------------------------------------------------------
  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function maintenant() { return new Date(Date.now() + decalageApercu); }
  function deuxChiffres(n) { return (n < 10 ? '0' : '') + n; }
  function cleDate(d) { return d.getFullYear() + '-' + deuxChiffres(d.getMonth() + 1) + '-' + deuxChiffres(d.getDate()); }
  function enMinutes(hhmm) {
    var p = String(hhmm || '').split(':');
    var m = parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    return isNaN(m) ? null : m;
  }
  function enHeure(min) { min = ((Math.round(min) % 1440) + 1440) % 1440; return deuxChiffres(Math.floor(min / 60)) + ':' + deuxChiffres(min % 60); }
  function heureLisible(hhmm) { var m = enMinutes(hhmm); return Math.floor(m / 60) + 'h' + deuxChiffres(m % 60); }
  function echapper(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cheminImage(img) {
    if (!img) return '';
    if (/^(data:|blob:|https?:|file:|\.{0,2}\/)/i.test(img) || img.indexOf('/') >= 0) return img;
    return DOSSIER_IMAGES + img;
  }
  function $(sel, racine) { return (racine || document).querySelector(sel); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.minuteur); toast.minuteur = setTimeout(function () { t.hidden = true; }, 3500);
  }

  // ------------------------------------------------------------------
  // Configuration (localStorage)
  // ------------------------------------------------------------------
  function normaliser(c) {
    if (!c || !Array.isArray(c.moments)) throw new Error('Fichier de configuration invalide (moments manquants).');
    c.version = 1;
    c.semaine = c.semaine || {};
    JOURS_SEMAINE.forEach(function (j) { if (!Array.isArray(c.semaine[j])) c.semaine[j] = []; });
    c.exceptions = Array.isArray(c.exceptions) ? c.exceptions : [];
    c.options = Object.assign({ aiguilleMinutes: false, afficherSuite: true, afficherProgression: true, afficherDate: true }, c.options || {});
    if (!c.moments.some(function (m) { return m.id === ID_MAISON; })) {
      c.moments.unshift({ id: ID_MAISON, nom: 'À la maison', couleur: '#9AD0EC', image: 'maison.svg' });
    }
    return c;
  }
  function chargerConfig() {
    try {
      var brut = localStorage.getItem(CLE_STOCKAGE);
      if (brut) return normaliser(JSON.parse(brut));
    } catch (e) { console.warn('Configuration illisible, retour à l\'exemple.', e); }
    return normaliser(copie(window.CONFIG_EXEMPLE));
  }
  function enregistrer() {
    try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(cfg)); }
    catch (e) { toast('⚠ Impossible d\'enregistrer dans le navigateur.'); }
    etat.cleCadran = null; etat.cleMoment = null; // force le redessin
    rafraichir();
  }
  function moment(id) {
    for (var i = 0; i < cfg.moments.length; i++) if (cfg.moments[i].id === id) return cfg.moments[i];
    return { id: id, nom: '?', couleur: '#CCCCCC', image: '' };
  }

  // ------------------------------------------------------------------
  // Horaire du jour
  // ------------------------------------------------------------------
  function exceptionDu(d) {
    var k = cleDate(d);
    for (var i = 0; i < cfg.exceptions.length; i++) if (cfg.exceptions[i].date === k) return cfg.exceptions[i];
    return null;
  }
  /** Liste triée {moment, debut, fin} (en minutes) des moments d'école pour la date d. */
  function horaireDu(d) {
    var ex = exceptionDu(d);
    var liste = ex ? ex.horaire : (cfg.semaine[d.getDay()] || []);
    return (liste || []).map(function (e) {
      return { moment: e.moment, debut: enMinutes(e.debut), fin: enMinutes(e.fin) };
    }).filter(function (e) {
      return e.debut != null && e.fin != null && e.fin > e.debut && e.moment !== ID_MAISON;
    }).sort(function (a, b) { return a.debut - b.debut; });
  }
  function momentEnCours(d) {
    var h = horaireDu(d);
    var min = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    for (var i = 0; i < h.length; i++) {
      if (min >= h[i].debut && min < h[i].fin) return { entree: h[i], index: i, horaire: h, min: min };
    }
    return { entree: null, index: -1, horaire: h, min: min };
  }
  /** Prochain moment (aujourd'hui ou dans les jours suivants). */
  function prochainMoment(d, encours) {
    var h = encours.horaire;
    for (var i = 0; i < h.length; i++) {
      if (h[i].debut >= encours.min && i !== encours.index) return { entree: h[i], jours: 0 };
    }
    for (var j = 1; j <= 14; j++) {
      var dj = new Date(d.getFullYear(), d.getMonth(), d.getDate() + j);
      var hj = horaireDu(dj);
      if (hj.length) return { entree: hj[0], jours: j, date: dj };
    }
    return null;
  }

  // ------------------------------------------------------------------
  // Dessin du cadran
  // ------------------------------------------------------------------
  function angle(min) { return ((min % 720) + 720) % 720 / 720 * 2 * Math.PI; }
  function point(min, r) { var a = angle(min); return [r * Math.sin(a), -r * Math.cos(a)]; }
  function f(n) { return Math.round(n * 100) / 100; }

  function cheminPart(debut, fin, r) {
    var duree = fin - debut;
    if (duree >= 720) return 'M' + -r + ',0 A' + r + ',' + r + ' 0 1 1 ' + r + ',0 A' + r + ',' + r + ' 0 1 1 ' + -r + ',0 Z';
    var p1 = point(debut, r), p2 = point(fin, r);
    return 'M0,0 L' + f(p1[0]) + ',' + f(p1[1]) + ' A' + r + ',' + r + ' 0 ' + (duree > 360 ? 1 : 0) + ' 1 ' + f(p2[0]) + ',' + f(p2[1]) + ' Z';
  }

  /** Plages du cadran (0-720 min) non couvertes par l'école → « À la maison ». */
  function plagesMaison(horaire) {
    var occ = [];
    horaire.forEach(function (e) {
      var d = e.debut % 720, l = Math.min(e.fin - e.debut, 720);
      if (d + l <= 720) occ.push([d, d + l]); else { occ.push([d, 720]); occ.push([0, d + l - 720]); }
    });
    occ.sort(function (a, b) { return a[0] - b[0]; });
    var libres = [], curseur = 0;
    occ.forEach(function (o) { if (o[0] > curseur) libres.push([curseur, o[0]]); curseur = Math.max(curseur, o[1]); });
    if (curseur < 720) libres.push([curseur, 720]);
    // Fusionne la plage qui passe par midi/minuit (fin + début du cadran)
    if (libres.length > 1 && libres[0][0] === 0 && libres[libres.length - 1][1] === 720) {
      var der = libres.pop(); libres[0] = [der[0], 720 + libres[0][1]];
    }
    return libres;
  }

  /** Cherche la plus grande photo (carré) qui tient dans une part, et sa distance au centre. */
  function placePhoto(duree, tailleMax) {
    var theta = Math.min(duree, 720) / 720 * 2 * Math.PI;
    var rMin = R_AIGUILLE + 18, rMax = R_CADRAN - 14, meilleur = { r: (rMin + rMax) / 2, taille: 0 };
    for (var rv = rMax; rv >= rMin; rv -= 4) {
      var largeur = theta >= Math.PI ? 1e9 : 2 * rv * Math.sin(theta / 2);
      var t = Math.min(tailleMax, largeur * 0.68, (rMax - rv) / 0.72, (rv - rMin) / 0.72);
      if (t > meilleur.taille + 0.5) meilleur = { r: rv, taille: t };
    }
    return meilleur;
  }

  function photo(idx, m, milieu, duree, actif, tailleMax) {
    var pl = placePhoto(duree, tailleMax);
    if (pl.taille < 30) return '';
    var t = pl.taille, p = point(milieu, pl.r), x = p[0] - t / 2, y = p[1] - t / 2;
    var arrondi = t * 0.12, id = 'clip-v' + idx;
    var bord = actif ? Math.max(8, t * 0.07) : Math.max(5, t * 0.045);
    return '<clipPath id="' + id + '"><rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(t) + '" height="' + f(t) + '" rx="' + f(arrondi) + '"/></clipPath>' +
      '<rect class="vignette-ombre" x="' + f(x - bord + 3) + '" y="' + f(y - bord + 6) + '" width="' + f(t + 2 * bord) + '" height="' + f(t + 2 * bord) + '" rx="' + f(arrondi + bord) + '"/>' +
      '<rect x="' + f(x - bord) + '" y="' + f(y - bord) + '" width="' + f(t + 2 * bord) + '" height="' + f(t + 2 * bord) + '" rx="' + f(arrondi + bord) + '" fill="#FFFFFF"/>' +
      '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(t) + '" height="' + f(t) + '" rx="' + f(arrondi) + '" fill="' + echapper(m.couleur) + '"/>' +
      '<image href="' + echapper(cheminImage(m.image)) + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(t) + '" height="' + f(t) +
      '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>';
  }

  function dessinerCadran(d, encours) {
    var svg = $('#horloge');
    var h = encours.horaire;
    var maison = moment(ID_MAISON);
    var s = '';
    var idx = 0;

    // Fond « À la maison » (et sa part ressort si c'est le moment en cours)
    s += '<circle cx="0" cy="0" r="' + (encours.entree ? R_CADRAN : R_CADRAN + R_SAILLIE) + '" fill="' + echapper(maison.couleur) + '" class="part"/>';
    // Parts des moments d'école ; la part en cours ressort légèrement
    h.forEach(function (e, k) {
      var r = k === encours.index ? R_CADRAN + R_SAILLIE : R_CADRAN;
      s += '<path class="part' + (k === encours.index ? ' part-active' : '') + '" d="' + cheminPart(e.debut, e.fin, r) + '" fill="' + echapper(moment(e.moment).couleur) + '"/>';
    });

    // Photos dans les parts
    plagesMaison(h).forEach(function (p) {
      if (p[1] - p[0] >= 40 || !h.length) {
        s += photo(idx++, maison, h.length ? (p[0] + p[1]) / 2 : 360, p[1] - p[0], !encours.entree, h.length ? 230 : 280);
      }
    });
    h.forEach(function (e, k) {
      s += photo(idx++, moment(e.moment), (e.debut + e.fin) / 2, e.fin - e.debut, k === encours.index, 190);
    });

    // Petit cadran blanc au centre, avec les chiffres
    s += '<circle class="centre-fond" cx="0" cy="0" r="' + R_CENTRE + '"/>';
    for (var i = 0; i < 60; i++) {
      var heure = i % 5 === 0;
      var a = i / 60 * 2 * Math.PI, r1 = R_CENTRE - (heure ? 22 : 11), r2 = R_CENTRE - 5;
      s += '<line class="graduation" x1="' + f(r1 * Math.sin(a)) + '" y1="' + f(-r1 * Math.cos(a)) + '" x2="' + f(r2 * Math.sin(a)) +
        '" y2="' + f(-r2 * Math.cos(a)) + '" stroke-width="' + (heure ? 5 : 2.5) + '"/>';
    }
    for (var n = 1; n <= 12; n++) {
      var an = n / 12 * 2 * Math.PI;
      s += '<text class="chiffre" x="' + f(R_CHIFFRES * Math.sin(an)) + '" y="' + f(-R_CHIFFRES * Math.cos(an) + 2) + '">' + n + '</text>';
    }

    // Aiguilles : celle des heures dépasse juste du cadran central, sans toucher les photos
    var aig = '<g class="rot-heures"><line class="aiguille-halo" x1="0" y1="30" x2="0" y2="' + -R_AIGUILLE + '"/>' +
      '<line class="aiguille-heures" x1="0" y1="30" x2="0" y2="' + -R_AIGUILLE + '"/></g>' +
      '<g id="aiguille-minutes"' + (cfg.options.aiguilleMinutes ? '' : ' style="display:none"') + '>' +
      '<line class="aiguille-minutes" x1="0" y1="20" x2="0" y2="' + -(R_CENTRE - 28) + '"/></g>' +
      '<circle class="moyeu" r="24"/><circle class="moyeu-centre" r="8"/>';

    svg.innerHTML = s + aig;
  }

  function placerAiguilles(d) {
    var min = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    var gm = document.getElementById('aiguille-minutes');
    var rot = 'rotate(' + f((min % 720) / 2) + ')';
    Array.prototype.forEach.call(document.querySelectorAll('#horloge .rot-heures'), function (g) { g.setAttribute('transform', rot); });
    if (gm) gm.setAttribute('transform', 'rotate(' + f((min % 60) * 6) + ')');
  }

  // ------------------------------------------------------------------
  // Panneau « moment en cours »
  // ------------------------------------------------------------------
  function afficherMoment(d, encours, anime) {
    var m = encours.entree ? moment(encours.entree.moment) : moment(ID_MAISON);
    document.documentElement.style.setProperty('--couleur-moment', m.couleur);
    var img = $('#moment-image');
    img.onerror = function () { img.removeAttribute('src'); img.style.visibility = 'hidden'; };
    img.style.visibility = '';
    img.src = cheminImage(m.image);
    img.alt = m.nom;
    $('#moment-nom').textContent = m.nom;
    ajusterNom();

    var ex = exceptionDu(d);
    var texteDate = d.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#date-jour').textContent = cfg.options.afficherDate
      ? texteDate.charAt(0).toUpperCase() + texteDate.slice(1) + (ex && ex.titre ? ' · ' + ex.titre : '')
      : '';

    var suite = $('#moment-suite');
    suite.innerHTML = '';
    if (cfg.options.afficherSuite) {
      var p = prochainMoment(d, encours);
      if (p) {
        var mp = moment(p.entree.moment);
        var quand = p.jours === 0 ? 'à ' + heureLisible(enHeure(p.entree.debut))
          : p.jours === 1 ? 'demain' : JOURS[p.date.getDay()];
        // Si on est à l'école et que la suite est un autre jour, la suite est « À la maison »
        if (encours.entree && p.jours > 0) { mp = moment(ID_MAISON); quand = 'à ' + heureLisible(enHeure(encours.entree.fin)); }
        else if (encours.entree && encours.entree.fin < p.entree.debut) { mp = moment(ID_MAISON); quand = 'à ' + heureLisible(enHeure(encours.entree.fin)); }
        suite.innerHTML = '<span>Ensuite :</span><img src="' + echapper(cheminImage(mp.image)) + '" alt="" onerror="this.remove()"><strong>' +
          echapper(mp.nom) + '</strong><span>' + echapper(quand) + '</span>';
      }
    }
    if (anime) {
      var carte = $('#carte-moment');
      carte.classList.remove('arrivee'); void carte.offsetWidth; carte.classList.add('arrivee');
    }
  }

  /** Réduit la taille du nom pour qu'il tienne sur une ligne. */
  function ajusterNom() {
    var n = $('#moment-nom');
    var taille = 11; // en vh
    n.style.fontSize = taille + 'vh';
    var largeur = n.parentNode.clientWidth * 0.86;
    while (n.scrollWidth > largeur && taille > 4) { taille -= 0.5; n.style.fontSize = taille + 'vh'; }
  }
  window.addEventListener('resize', function () { ajusterNom(); });

  function majProgression(encours) {
    var barre = $('#moment-progression');
    if (!cfg.options.afficherProgression || !encours.entree) { barre.style.visibility = 'hidden'; return; }
    barre.style.visibility = '';
    var e = encours.entree;
    var pct = Math.max(0, Math.min(100, (encours.min - e.debut) / (e.fin - e.debut) * 100));
    $('#moment-progression-barre').style.width = pct.toFixed(1) + '%';
  }

  // ------------------------------------------------------------------
  // Boucle principale (une fois par seconde, tourne indéfiniment)
  // ------------------------------------------------------------------
  function rafraichir() {
    var d = maintenant();
    var jour = cleDate(d);
    var encours = momentEnCours(d);
    var cleMoment = jour + '|' + encours.index + '|' + (encours.entree ? encours.entree.moment : ID_MAISON);
    var changement = cleMoment !== etat.cleMoment;

    if (changement || jour !== etat.jour || etat.cleCadran === null) {
      dessinerCadran(d, encours);
      etat.cleCadran = cleMoment;
    }
    if (changement) {
      var premier = etat.cleMoment === null;
      var memeMoment = etat.cleMoment && etat.cleMoment.split('|')[2] === cleMoment.split('|')[2];
      afficherMoment(d, encours, !premier && !memeMoment);
      etat.cleMoment = cleMoment;
    }
    etat.jour = jour; // le changement de jour à minuit est inclus dans cleMoment
    placerAiguilles(d);
    majProgression(encours);
  }

  function demarrer() {
    rafraichir();
    // Se cale sur le début de chaque seconde
    setTimeout(function () { rafraichir(); setInterval(rafraichir, 1000); }, 1000 - (Date.now() % 1000));
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { etat.cleCadran = null; rafraichir(); garderEcranAllume(); } });
    garderEcranAllume();
  }

  // Empêche la mise en veille de l'écran quand le navigateur le permet
  var verrouEcran = null;
  function garderEcranAllume() {
    try {
      if ('wakeLock' in navigator && !verrouEcran) {
        navigator.wakeLock.request('screen').then(function (v) {
          verrouEcran = v; v.addEventListener('release', function () { verrouEcran = null; });
        }).catch(function () {});
      }
    } catch (e) {}
  }

  // ------------------------------------------------------------------
  // Accès discret aux paramètres : appui long (2 s) dans le coin haut-droit
  // ------------------------------------------------------------------
  function installerCoinSecret() {
    var coin = $('#coin-secret'), minuteur = null;
    function annuler() { clearTimeout(minuteur); minuteur = null; coin.classList.remove('appui'); }
    coin.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      annuler();
      void coin.offsetWidth;
      coin.classList.add('appui');
      minuteur = setTimeout(function () { annuler(); ouvrirParametres(); }, 2000);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { coin.addEventListener(t, annuler); });
    document.addEventListener('contextmenu', function (ev) { if ($('#parametres').hidden) ev.preventDefault(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.ctrlKey && ev.altKey && (ev.key === 'p' || ev.key === 'P')) ouvrirParametres();
      if (ev.key === 'Escape' && !$('#parametres').hidden) fermerParametres();
    });
  }

  // ------------------------------------------------------------------
  // Paramètres
  // ------------------------------------------------------------------
  var ongletActif = 'moments';
  var jourEdite = 1;

  function ouvrirParametres() {
    $('#parametres').hidden = false;
    afficherOnglet(ongletActif);
  }
  function fermerParametres() {
    $('#parametres').hidden = true;
    decalageApercu = 0;
    etat.cleCadran = null; etat.cleMoment = null;
    rafraichir();
  }
  function afficherOnglet(nom) {
    ongletActif = nom;
    Array.prototype.forEach.call(document.querySelectorAll('.p-onglets button'), function (b) {
      b.classList.toggle('actif', b.getAttribute('data-onglet') === nom);
    });
    var c = $('#p-contenu'); c.innerHTML = ''; c.scrollTop = 0;
    ({ moments: ongletMoments, semaine: ongletSemaine, exceptions: ongletExceptions, affichage: ongletAffichage, sauvegarde: ongletSauvegarde })[nom](c);
  }

  function champ(label, input) { var l = el('label', { 'class': 'p-champ' }); l.appendChild(document.createTextNode(label)); l.appendChild(input); return l; }
  function bouton(texte, classe, action) { var b = el('button', { 'class': 'btn ' + (classe || ''), type: 'button' }); b.textContent = texte; b.addEventListener('click', action); return b; }

  // ---- Onglet Moments ----
  function ongletMoments(c) {
    var s = el('div', { 'class': 'p-section' }, '<h2>Bibliothèque de moments</h2><p class="p-aide">Chaque moment a un nom, une couleur et une image. ' +
      'Les images sont rangées dans le dossier <b>images</b> à côté de l\'application : indiquez simplement le nom du fichier ' +
      '(par exemple <i>recreation.jpg</i>) ou touchez « Choisir » et sélectionnez la photo dans ce dossier. ' +
      'Le moment « À la maison » couvre automatiquement tout ce qui se passe en dehors de l\'école.</p>');
    cfg.moments.forEach(function (m) { s.appendChild(carteMoment(m)); });
    var r = el('div', { 'class': 'btn-rangee' });
    r.appendChild(bouton('＋ Nouveau moment', 'btn-principal', function () {
      var nouveau = { id: 'm' + Date.now().toString(36), nom: 'Nouveau moment', couleur: PALETTE[cfg.moments.length % PALETTE.length], image: '' };
      cfg.moments.push(nouveau); enregistrer(); afficherOnglet('moments');
      var champs = document.querySelectorAll('.p-nom'); var dernier = champs[champs.length - 1];
      if (dernier) { dernier.focus(); dernier.select(); dernier.scrollIntoView({ block: 'center' }); }
    }));
    s.appendChild(r);
    c.appendChild(s);
  }
  function carteMoment(m) {
    var carte = el('div', { 'class': 'p-carte' });
    var vign = el('img', { 'class': 'p-vignette', alt: '' });
    function majVignette() {
      vign.style.borderColor = m.couleur;
      vign.style.background = m.couleur;
      vign.style.visibility = '';
      vign.onerror = function () { vign.removeAttribute('src'); };
      if (m.image) vign.src = cheminImage(m.image); else vign.removeAttribute('src');
    }
    majVignette();
    carte.appendChild(vign);

    var nom = el('input', { type: 'text', 'class': 'p-nom', value: m.nom });
    nom.addEventListener('input', function () { m.nom = nom.value; enregistrer(); });
    carte.appendChild(champ('Nom', nom));

    var coul = el('input', { type: 'color', value: m.couleur });
    coul.addEventListener('input', function () { m.couleur = coul.value; majVignette(); enregistrer(); });
    carte.appendChild(champ('Couleur', coul));
    var pastilles = el('div', { 'class': 'p-pastilles' });
    PALETTE.forEach(function (p) {
      var b = el('button', { type: 'button', 'class': 'p-pastille', title: p }); b.style.background = p;
      b.addEventListener('click', function () { m.couleur = p; coul.value = p; majVignette(); enregistrer(); });
      pastilles.appendChild(b);
    });
    carte.appendChild(pastilles);

    var img = el('input', { type: 'text', 'class': 'p-image-nom', value: m.image || '', placeholder: 'photo.jpg' });
    img.addEventListener('change', function () { m.image = img.value.trim(); majVignette(); enregistrer(); });
    carte.appendChild(champ('Image (dossier images)', img));
    var fichier = el('input', { type: 'file', accept: 'image/*', hidden: '' });
    fichier.addEventListener('change', function () {
      if (fichier.files && fichier.files[0]) {
        m.image = fichier.files[0].name; img.value = m.image; majVignette(); enregistrer();
        toast('Image « ' + m.image + ' » : elle doit se trouver dans le dossier images.');
      }
    });
    carte.appendChild(fichier);
    carte.appendChild(bouton('🖼 Choisir', '', function () { fichier.click(); }));

    carte.appendChild(el('div', { 'class': 'p-espace' }));
    if (m.id !== ID_MAISON) {
      carte.appendChild(bouton('🗑', 'btn-danger', function () {
        if (!confirm('Supprimer le moment « ' + m.nom + ' » ? Il sera aussi retiré des horaires.')) return;
        cfg.moments = cfg.moments.filter(function (x) { return x.id !== m.id; });
        JOURS_SEMAINE.forEach(function (j) { cfg.semaine[j] = cfg.semaine[j].filter(function (e) { return e.moment !== m.id; }); });
        cfg.exceptions.forEach(function (ex) { ex.horaire = ex.horaire.filter(function (e) { return e.moment !== m.id; }); });
        enregistrer(); afficherOnglet('moments');
      }));
    }
    return carte;
  }

  // ---- Éditeur d'une liste horaire (partagé : semaine et exceptions) ----
  function trierHoraire(liste) { liste.sort(function (a, b) { return (enMinutes(a.debut) || 0) - (enMinutes(b.debut) || 0); }); }
  function verifierHoraire(liste) {
    var pb = [];
    var tri = liste.slice(); trierHoraire(tri);
    tri.forEach(function (e, i) {
      var d = enMinutes(e.debut), fn = enMinutes(e.fin);
      if (d == null || fn == null) pb.push('« ' + moment(e.moment).nom + ' » : heure manquante.');
      else if (fn <= d) pb.push('« ' + moment(e.moment).nom + ' » : la fin (' + e.fin + ') doit être après le début (' + e.debut + ').');
      if (i > 0 && enMinutes(tri[i - 1].fin) > d) pb.push('« ' + moment(tri[i - 1].moment).nom + ' » et « ' + moment(e.moment).nom + ' » se chevauchent.');
    });
    return pb;
  }
  function editeurHoraire(liste) {
    trierHoraire(liste);
    var bloc = el('div');
    var alerte = el('div', { 'class': 'p-alerte', hidden: '' });
    function majAlerte() {
      var pb = verifierHoraire(liste);
      alerte.hidden = !pb.length; alerte.innerHTML = '⚠ ' + pb.map(echapper).join('<br>⚠ ');
    }
    function redessiner() { bloc.innerHTML = ''; construire(); }
    function construire() {
      if (!liste.length) bloc.appendChild(el('p', { 'class': 'p-aide' }, 'Aucun moment : toute la journée sera « À la maison ».'));
      liste.forEach(function (e, i) {
        var ligne = el('div', { 'class': 'p-ligne' });
        var pastille = el('div', { 'class': 'p-pastille-moment' }); pastille.style.background = moment(e.moment).couleur;
        ligne.appendChild(pastille);
        var sel = el('select', { 'class': 'p-entree' });
        cfg.moments.forEach(function (m) {
          if (m.id === ID_MAISON) return;
          var o = el('option', { value: m.id }); o.textContent = m.nom; if (m.id === e.moment) o.selected = true; sel.appendChild(o);
        });
        sel.addEventListener('change', function () { e.moment = sel.value; pastille.style.background = moment(e.moment).couleur; enregistrer(); majAlerte(); });
        ligne.appendChild(champ('Moment', sel));
        var deb = el('input', { type: 'time', value: e.debut, step: 300 });
        deb.addEventListener('change', function () { e.debut = deb.value; enregistrer(); majAlerte(); });
        ligne.appendChild(champ('Début', deb));
        var fin = el('input', { type: 'time', value: e.fin, step: 300 });
        fin.addEventListener('change', function () { e.fin = fin.value; enregistrer(); majAlerte(); });
        ligne.appendChild(champ('Fin', fin));
        ligne.appendChild(el('div', { 'class': 'p-espace' }));
        ligne.appendChild(bouton('🗑', 'btn-danger', function () { liste.splice(i, 1); enregistrer(); redessiner(); }));
        bloc.appendChild(ligne);
      });
      bloc.appendChild(alerte); majAlerte();
      var r = el('div', { 'class': 'btn-rangee' });
      r.appendChild(bouton('＋ Ajouter un moment', 'btn-principal', function () {
        var dernier = liste[liste.length - 1];
        var debut = dernier ? enMinutes(dernier.fin) || 510 : 510;
        var premier = cfg.moments.filter(function (m) { return m.id !== ID_MAISON; })[0];
        if (!premier) { toast('Créez d\'abord un moment dans l\'onglet « Moments ».'); return; }
        liste.push({ moment: premier.id, debut: enHeure(debut), fin: enHeure(Math.min(debut + 30, 1439)) });
        enregistrer(); redessiner();
      }));
      r.appendChild(bouton('↕ Remettre dans l\'ordre', '', function () { trierHoraire(liste); enregistrer(); redessiner(); }));
      bloc.appendChild(r);
    }
    construire();
    return bloc;
  }

  // ---- Onglet Semaine ----
  function ongletSemaine(c) {
    var s = el('div', { 'class': 'p-section' }, '<h2>Horaire type de la semaine</h2><p class="p-aide">Choisissez un jour puis ajoutez ses moments. ' +
      'Tout ce qui n\'est pas dans la liste est « À la maison » (avant l\'école, après l\'école, le mercredi après-midi…). Le samedi et le dimanche sont toujours « À la maison ».</p>');
    var jours = el('div', { 'class': 'p-jours' });
    JOURS_SEMAINE.forEach(function (j) {
      var b = bouton(JOURS[j].charAt(0).toUpperCase() + JOURS[j].slice(1), j === jourEdite ? 'actif' : '', function () { jourEdite = j; afficherOnglet('semaine'); });
      jours.appendChild(b);
    });
    s.appendChild(jours);
    s.appendChild(editeurHoraire(cfg.semaine[jourEdite]));
    var copier = el('div', { 'class': 'btn-rangee' });
    var choix = el('select', { 'class': 'p-entree' });
    JOURS_SEMAINE.forEach(function (j) { if (j !== jourEdite) { var o = el('option', { value: j }); o.textContent = JOURS[j]; choix.appendChild(o); } });
    copier.appendChild(bouton('📋 Copier l\'horaire de', '', function () {
      var src = parseInt(choix.value, 10);
      if (!confirm('Remplacer l\'horaire du ' + JOURS[jourEdite] + ' par celui du ' + JOURS[src] + ' ?')) return;
      cfg.semaine[jourEdite] = copie(cfg.semaine[src]); enregistrer(); afficherOnglet('semaine');
    }));
    copier.appendChild(choix);
    s.appendChild(copier);
    c.appendChild(s);
  }

  // ---- Onglet Exceptions ----
  function ongletExceptions(c) {
    var s = el('div', { 'class': 'p-section' }, '<h2>Journées particulières</h2><p class="p-aide">Une exception remplace l\'horaire type à une date précise ' +
      '(sortie, fête, journée pédagogique…). Laissez la liste vide pour une journée entière « À la maison ».</p>');
    var aujourdhui = cleDate(new Date());
    var r = el('div', { 'class': 'btn-rangee' });
    r.appendChild(bouton('＋ Nouvelle exception', 'btn-principal', function () {
      var d = new Date(); var k = cleDate(d);
      while (cfg.exceptions.some(function (e) { return e.date === k; })) { d.setDate(d.getDate() + 1); k = cleDate(d); }
      var base = (d.getDay() >= 1 && d.getDay() <= 5) ? copie(cfg.semaine[d.getDay()]) : [];
      cfg.exceptions.push({ date: k, titre: 'Journée spéciale', horaire: base });
      enregistrer(); afficherOnglet('exceptions');
    }));
    if (cfg.exceptions.some(function (e) { return e.date < aujourdhui; })) {
      r.appendChild(bouton('🧹 Supprimer les dates passées', '', function () {
        cfg.exceptions = cfg.exceptions.filter(function (e) { return e.date >= aujourdhui; }); enregistrer(); afficherOnglet('exceptions');
      }));
    }
    s.appendChild(r);
    if (!cfg.exceptions.length) s.appendChild(el('p', { 'class': 'p-aide' }, 'Aucune exception pour le moment.'));
    cfg.exceptions.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    cfg.exceptions.forEach(function (ex) {
      var bloc = el('div', { 'class': 'p-exception' + (ex.date < aujourdhui ? ' p-passee' : '') });
      var tete = el('div', { 'class': 'p-exception-tete' });
      var date = el('input', { type: 'date', value: ex.date });
      date.addEventListener('change', function () {
        if (!date.value) return;
        if (cfg.exceptions.some(function (e) { return e !== ex && e.date === date.value; })) { toast('Il existe déjà une exception à cette date.'); date.value = ex.date; return; }
        ex.date = date.value; enregistrer();
      });
      tete.appendChild(champ('Date', date));
      var titre = el('input', { type: 'text', value: ex.titre || '', 'class': 'p-nom' });
      titre.addEventListener('input', function () { ex.titre = titre.value; enregistrer(); });
      tete.appendChild(champ('Titre', titre));
      tete.appendChild(bouton('📋 Partir de l\'horaire type', '', function () {
        var p = ex.date.split('-'); var j = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
        if (j < 1 || j > 5) { toast('Ce jour est un week-end : pas d\'horaire type.'); return; }
        if (ex.horaire.length && !confirm('Remplacer la liste par l\'horaire type du ' + JOURS[j] + ' ?')) return;
        ex.horaire = copie(cfg.semaine[j]); enregistrer(); afficherOnglet('exceptions');
      }));
      tete.appendChild(el('div', { 'class': 'p-espace' }));
      tete.appendChild(bouton('🗑 Supprimer', 'btn-danger', function () {
        if (!confirm('Supprimer l\'exception du ' + ex.date + ' ?')) return;
        cfg.exceptions = cfg.exceptions.filter(function (e) { return e !== ex; }); enregistrer(); afficherOnglet('exceptions');
      }));
      bloc.appendChild(tete);
      bloc.appendChild(editeurHoraire(ex.horaire));
      s.appendChild(bloc);
    });
    c.appendChild(s);
  }

  // ---- Onglet Affichage ----
  function ongletAffichage(c) {
    var s = el('div', { 'class': 'p-section' }, '<h2>Affichage</h2>');
    [['aiguilleMinutes', 'Afficher l\'aiguille des minutes'],
     ['afficherProgression', 'Afficher la barre de temps écoulé du moment'],
     ['afficherSuite', 'Afficher le moment suivant (« Ensuite : … »)'],
     ['afficherDate', 'Afficher la date du jour']].forEach(function (o) {
      var l = el('label', { 'class': 'p-case' });
      var cb = el('input', { type: 'checkbox' }); cb.checked = !!cfg.options[o[0]];
      cb.addEventListener('change', function () { cfg.options[o[0]] = cb.checked; enregistrer(); });
      l.appendChild(cb); l.appendChild(document.createTextNode(o[1])); s.appendChild(l);
    });

    s.appendChild(el('h2', { style: 'margin-top:28px' }, 'Plein écran'));
    s.appendChild(el('p', { 'class': 'p-aide' }, 'Passe le navigateur en plein écran (touche F11 sur un clavier). Pour sortir : touche Échap ou F11.'));
    var r = el('div', { 'class': 'btn-rangee' });
    r.appendChild(bouton('⛶ Plein écran', 'btn-principal', function () {
      var de = document.documentElement;
      var req = de.requestFullscreen || de.webkitRequestFullscreen;
      if (req) { try { req.call(de); } catch (e) {} }
      fermerParametres();
    }));
    s.appendChild(r);

    s.appendChild(el('h2', { style: 'margin-top:28px' }, 'Aperçu à une autre date/heure'));
    s.appendChild(el('p', { 'class': 'p-aide' }, 'Pour vérifier un horaire : choisissez une date et une heure, puis « Voir ». L\'horloge revient à l\'heure réelle dès que les paramètres sont fermés.'));
    var r2 = el('div', { 'class': 'btn-rangee' });
    var d = new Date(); d.setHours(10, 0, 0, 0);
    var quand = el('input', { type: 'datetime-local', 'class': 'p-entree', value: cleDate(d) + 'T10:00' });
    r2.appendChild(quand);
    r2.appendChild(bouton('👁 Voir', 'btn-principal', function () {
      var cible = new Date(quand.value);
      if (isNaN(cible)) return;
      $('#parametres').hidden = true;
      decalageApercu = cible.getTime() - Date.now();
      etat.cleCadran = null; etat.cleMoment = null; rafraichir();
      toast('Aperçu : appui long dans le coin pour revenir aux paramètres.');
    }));
    s.appendChild(r2);
    c.appendChild(s);
  }

  // ---- Onglet Sauvegarde ----
  function ongletSauvegarde(c) {
    var s = el('div', { 'class': 'p-section' }, '<h2>Sauvegarde</h2><p class="p-aide">Les réglages sont enregistrés automatiquement dans ce navigateur. ' +
      'Exportez-les dans un fichier pour les garder en sécurité ou les copier sur un autre ordinateur.</p>');
    var r = el('div', { 'class': 'btn-rangee' });
    r.appendChild(bouton('⬇ Exporter la configuration', 'btn-principal', function () {
      var blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
      var a = el('a', { href: URL.createObjectURL(blob), download: 'horloge-classe-' + cleDate(new Date()) + '.json' });
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }));
    var fichier = el('input', { type: 'file', accept: '.json,application/json', hidden: '' });
    fichier.addEventListener('change', function () {
      var fch = fichier.files && fichier.files[0]; if (!fch) return;
      var lecteur = new FileReader();
      lecteur.onload = function () {
        try {
          var nouvelle = normaliser(JSON.parse(lecteur.result));
          if (!confirm('Remplacer la configuration actuelle par celle du fichier « ' + fch.name + ' » ?')) return;
          cfg = nouvelle; enregistrer(); toast('Configuration importée ✔'); afficherOnglet('sauvegarde');
        } catch (e) { alert('Ce fichier ne peut pas être importé.\n' + e.message); }
      };
      lecteur.readAsText(fch);
      fichier.value = '';
    });
    r.appendChild(fichier);
    r.appendChild(bouton('⬆ Importer un fichier', '', function () { fichier.click(); }));
    s.appendChild(r);

    s.appendChild(el('h2', { style: 'margin-top:28px' }, 'Recommencer'));
    s.appendChild(el('p', { 'class': 'p-aide' }, 'Remet la configuration d\'exemple (journée type de maternelle). Pensez à exporter avant !'));
    var r2 = el('div', { 'class': 'btn-rangee' });
    r2.appendChild(bouton('↺ Revenir à l\'exemple', 'btn-danger', function () {
      if (!confirm('Effacer tous vos réglages et revenir à l\'exemple ?')) return;
      cfg = normaliser(copie(window.CONFIG_EXEMPLE)); enregistrer(); toast('Configuration d\'exemple rétablie.');
    }));
    s.appendChild(r2);
    c.appendChild(s);
  }

  // ------------------------------------------------------------------
  // Initialisation
  // ------------------------------------------------------------------
  Array.prototype.forEach.call(document.querySelectorAll('.p-onglets button'), function (b) {
    b.addEventListener('click', function () { afficherOnglet(b.getAttribute('data-onglet')); });
  });
  $('#p-fermer').addEventListener('click', fermerParametres);
  installerCoinSecret();
  demarrer();
})();
