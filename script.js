let joueurs = [];

document.addEventListener("DOMContentLoaded", () => {
    const sauvegarde = localStorage.getItem('gravityRip_joueurs');

    if (sauvegarde) {
        try {
            joueurs = JSON.parse(sauvegarde);
            joueurs.forEach(j => rafraichirCellule(j));
            document.getElementById('nbJoueurs').textContent = joueurs.length;
            mettreAJourListeJoueurs();
        } catch(e) {
            console.error("Erreur de lecture du localStorage", e);
        }
    }
});

function telechargerJoueurs(){
    // ÉCO-ASTUCE & BUG FIX : On génère le JSON à la volée pour être sûr qu'il soit à jour
    const donneesExport = JSON.stringify(joueurs);
    const monBlob = new Blob([donneesExport], {type: 'application/json'});
    const a = document.createElement('a');
    const url = URL.createObjectURL(monBlob);
    let d = new Date().toLocaleString('fr-CA');
    a.href = url;
    a.download = `Course ${d} .json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sauvegarderPartie()
}
document.addEventListener("DOMContentLoaded", () => {
// BUG FIX : Ajout de async/await pour lire le fichier correctement
document.getElementById("importer").addEventListener('change', async function(event){
    const file = event.target.files[0];
    if (!file) return;
    try {
        const text = await file.text(); // On attend la lecture du texte
        joueurs = JSON.parse(text);
        
        // On nettoie d'abord la grille de 1 à 20
        for (let i = 1; i <= 20; i++) viderCellule(i);
        
        joueurs.forEach(j => rafraichirCellule(j));
        document.getElementById('nbJoueurs').textContent = joueurs.length;
        mettreAJourListeJoueurs();
    }
    catch (error){
        alert("Erreur dans la lecture du fichier.");sauvegarderPartie();
        return;
    }
    sauvegarderPartie();
});
}; 
// Sauvegarde
function sauvegarderPartie() {
    localStorage.setItem('gravityRip_joueurs', JSON.stringify(joueurs));
}

// Nouvelle partie
function nouvellePartie() {
    if (confirm("🚨 Voulez-vous vraiment effacer TOUTE la partie en cours pour recommencer ?")) { 
        localStorage.removeItem('gravityRip_joueurs');

        for (let i = 1; i <= 20; i++) viderCellule(i);

        joueurs = [];
        document.getElementById('nbJoueurs').textContent = '0';
        mettreAJourListeJoueurs();
    }
}

// Affichage des dés
function afficherDés(idCellule, joueur) {
    if (!joueur) return;
    const c = joueur.classement;
    const resultat = Math.floor(Math.random() * 6) + 1;

    const cell = document.getElementById(idCellule);
    if (!cell) return;

    const contenuNormal = renderCellule(joueur);

    cell.innerHTML = contenuNormal + `
        <div class="mt-1 text-purple-600 text-sm font-bold">
            🎲 Résultat du dé : ${resultat}
        </div>
    `;
}

// Rendu d'une cellule
function renderCellule(joueur) {
    const c = joueur.classement;

    return `
        <span class="block font-semibold text-gray-800 leading-tight mb-1">
            ${joueur.nom} (<span style="color: purple">${joueur.type}</span>)
        </span>

        <div class="flex flex-wrap gap-1 items-center mt-1">
            <button class="border border-red-500 text-red-500 text-xs px-2 py-0.5 rounded hover:bg-red-50"
                onclick="eliminerJoueur(${c})">Eliminer</button>

            <input type="number" id="chgt-${c}"
                class="w-14 border border-gray-300 rounded h-6 px-1 text-xs outline-none"
                placeholder="+-pos">

            <button class="border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded hover:bg-blue-50"
                onclick="changerPosition(${c})">OK</button>

            <button class="border border-purple-500 text-xs px-2 py-0.5 rounded hover:bg-purple-50"
                onclick="afficherDés('${c}e', joueurs.find(j => j.classement === ${c}))">
                🎲 Rouler
            </button>
        </div>
    `;
}

// Vide une cellule
function viderCellule(classement) {
    const cell = document.getElementById(classement + 'e');
    if (!cell) return;
    cell.innerHTML = 'En attente...';
    cell.classList.add('italic', 'text-gray-300');
    cell.style.backgroundColor = '';
}

// Rafraîchit une cellule
function rafraichirCellule(joueur) {
    try {
        const cell = document.getElementById(joueur.classement + 'e');
        if (!cell) return;
        cell.innerHTML = renderCellule(joueur);
        cell.classList.remove('italic', 'text-gray-300');
        cell.style.backgroundColor = joueur.couleur;
    }
    catch(err){console.error(err);}
}

// Ajout joueur
function ajouterJoueur() {
    if (!Array.isArray(joueurs)) { joueurs = []; }
    
    const nomJoueur = document.getElementById('nomJoueur').value.trim();
    const classementDepart = parseInt(document.getElementById('classementDepart').value);
    const couleur = document.getElementById('couleurCellule').value;
    const type = document.getElementById('typeJoueur').value;

    if (!nomJoueur || isNaN(classementDepart)) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    if (joueurs.length >= 20) {
        alert('Vous ne pouvez pas ajouter plus de 20 joueurs');
        return;
    }
    if (joueurs.some(j => j.nom === nomJoueur)) {
        alert('Ce joueur est déjà dans la liste');
        return;
    }
    if (joueurs.some(j => j.classement === classementDepart)) {
        alert('Ce classement est déjà pris');
        return;
    }
    if (classementDepart < 1 || classementDepart > 20) {
        alert('Le classement doit être entre 1 et 20');
        return;
    }

    const joueur = { nom: nomJoueur, classement: classementDepart, couleur, type };
    joueurs.push(joueur);

    document.getElementById('nbJoueurs').textContent = joueurs.length;
    rafraichirCellule(joueur);

    document.getElementById('nomJoueur').value = '';
    document.getElementById('classementDepart').value = '';
    document.getElementById('couleurCellule').value = '#ffffff';
    document.getElementById('typeJoueur').value = "Joueur";

    mettreAJourListeJoueurs();
    sauvegarderPartie();
}

function eliminerJoueurSpecifique(joueur) {
    const idx = joueurs.indexOf(joueur);
    if (idx !== -1) {
        viderCellule(joueur.classement);
        joueurs.splice(idx, 1);
    }
    document.getElementById('nbJoueurs').textContent = joueurs.length;
    mettreAJourListeJoueurs();
    sauvegarderPartie();
}

function eliminerJoueur(classement) {
    const idx = joueurs.findIndex(j => j.classement === classement);
    if (idx === -1) return;

    viderCellule(classement);
    joueurs.splice(idx, 1);

    document.getElementById('nbJoueurs').textContent = joueurs.length;
    mettreAJourListeJoueurs();
    sauvegarderPartie();
}

// Changement de position
function changerPosition(classement) {
    const input = document.getElementById('chgt-' + classement);
    if (!input) return;

    const val = parseInt(input.value);
    if (isNaN(val) || val === 0) {
        alert('Entrez un nombre (+ pour avancer, - pour reculer)');
        return;
    }

    let j = joueurs.find(j => j.classement === classement);
    if (!j) return;

    let nouvellePosition = classement - val;

    if (nouvellePosition < 1) nouvellePosition = 1;

    if (nouvellePosition > 20) {
        eliminerJoueur(classement);
        alert(`💥 ${j.nom} a 1 lap de retard et est disqualifié!`);
        return;
    }

    modifierPositionJoueur(j.classement, nouvellePosition);
}

// Liste joueurs
function mettreAJourListeJoueurs() {
    const listContainer = document.getElementById('listeJoueurs');
    listContainer.innerHTML = '';

    const sorted = [...joueurs].sort((a, b) => a.classement - b.classement);

    sorted.forEach(j => {
        const item = document.createElement('div');
        item.className = 'bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm shrink-0';
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-700">${j.nom}</span>
                <span class="text-xs text-indigo-500 font-bold">#${j.classement}</span>
            </div>
            <div class="mt-1">
                <span class="inline-block w-3 h-3 rounded-full border border-gray-300" style="background-color:${j.couleur}"></span>
            </div>`;
        listContainer.appendChild(item);
    });
}

// Déplacement + réactions en chaîne
function modifierPositionJoueur(classJoueur, posArriv) {
    const joueur = joueurs.find(j => j.classement === classJoueur);
    if (!joueur) return;

    const anciennePos = joueur.classement;
    if (anciennePos === posArriv) return;

    const avance = posArriv < anciennePos;
    joueur.classement = -1;

    function pousser(position, direction) {
        const occupant = joueurs.find(j => j.classement === position);
        if (!occupant) return;

        const nouvellePos = position + direction;

        if (nouvellePos > 20) {
            eliminerJoueurSpecifique(occupant);
            return;
        }

        if (nouvellePos < 1) {
            occupant.classement = 1;
            return;
        }

        pousser(nouvellePos, direction);
        occupant.classement = nouvellePos;
    }

    avance ? pousser(posArriv, +1) : pousser(posArriv, -1);
    joueur.classement = posArriv;

    // Réinitialise l'affichage complet pour éviter les doublons visuels
    for (let i = 1; i <= 20; i++) viderCellule(i);
    
    joueurs.forEach(j => rafraichirCellule(j));
    document.getElementById('nbJoueurs').textContent = joueurs.length;
    mettreAJourListeJoueurs();
    sauvegarderPartie();
}
