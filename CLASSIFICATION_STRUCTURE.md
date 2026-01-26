# Structure de Classification des Questions Philosophiques

## Vue d'ensemble

Cette documentation décrit le système de classification multidimensionnelle utilisé pour organiser les 168 questions philosophiques du jeu. La structure est conçue pour être extensible et faciliter l'ajout de nouveaux axes de classification.

## Architecture des fichiers

```
questions-fr.json   # Questions et classifications en français
questions-en.json   # Questions et classifications en anglais
```

Les deux fichiers maintiennent des structures parallèles avec les mêmes clés de classification (identifiants) mais des libellés traduits.

## Structure JSON

### Métadonnées

```json
{
  "metadata": {
    "titre": "Questions philosophiques",
    "version": "2.0",
    "total_questions": 168,
    "langues_disponibles": ["fr"],
    "axes_classification": {
      // Définition des axes...
    }
  }
}
```

### Définition des axes

Chaque axe de classification est défini dans `axes_classification` avec :
- `description` : Description de l'axe
- `valeurs` : Dictionnaire clé → libellé traduit

## Les 4 axes de classification

### 1. Disciplines (branches de la philosophie)

| Clé | FR | EN |
|-----|----|----|
| `metaphysique` | Métaphysique | Metaphysics |
| `epistemologie` | Épistémologie | Epistemology |
| `ethique` | Éthique | Ethics |
| `esthetique` | Esthétique | Aesthetics |
| `logique` | Logique | Logic |
| `philosophie_politique` | Philosophie politique | Political Philosophy |
| `philosophie_langage` | Philosophie du langage | Philosophy of Language |
| `ontologie` | Ontologie | Ontology |
| `philosophie_esprit` | Philosophie de l'esprit | Philosophy of Mind |
| `philosophie_science` | Philosophie des sciences | Philosophy of Science |
| `philosophie_religion` | Philosophie de la religion | Philosophy of Religion |
| `philosophie_temps` | Philosophie du temps | Philosophy of Time |

**Multi-tagging** : Oui (une question peut appartenir à plusieurs disciplines)

### 2. Courants (écoles de pensée)

| Clé | FR | EN |
|-----|----|----|
| `presocratiques` | Présocratiques | Pre-Socratics |
| `stoicisme` | Stoïcisme | Stoicism |
| `existentialisme` | Existentialisme | Existentialism |
| `phenomenologie` | Phénoménologie | Phenomenology |
| `pragmatisme` | Pragmatisme | Pragmatism |
| `rationalisme` | Rationalisme | Rationalism |
| `empirisme` | Empirisme | Empiricism |
| `utilitarisme` | Utilitarisme | Utilitarianism |

**Multi-tagging** : Oui (une question peut être associée à plusieurs courants)

### 3. Complexités (niveaux de difficulté)

| Clé | FR | EN |
|-----|----|----|
| `debutant` | Débutant | Beginner |
| `intermediaire` | Intermédiaire | Intermediate |
| `avance` | Avancé | Advanced |

**Multi-tagging** : Non (une seule valeur par question)

### 4. Thématiques (concepts transversaux)

| Clé | FR | EN |
|-----|----|----|
| `liberte` | Liberté | Freedom |
| `justice` | Justice | Justice |
| `verite` | Vérité | Truth |
| `beaute` | Beauté | Beauty |
| `conscience` | Conscience | Consciousness |
| `existence` | Existence | Existence |
| `langage` | Langage | Language |
| `pouvoir` | Pouvoir | Power |
| `bonheur` | Bonheur | Happiness |
| `temps` | Temps | Time |
| `mort` | Mort | Death |
| `identite` | Identité | Identity |
| `connaissance` | Connaissance | Knowledge |
| `morale` | Morale | Morality |
| `art` | Art | Art |
| `raison` | Raison | Reason |
| `foi` | Foi | Faith |
| `nature` | Nature | Nature |
| `realite` | Réalité | Reality |
| `sens` | Sens de la vie | Meaning of life |

**Multi-tagging** : Oui (une question peut avoir plusieurs thématiques)

## Structure d'une question

```json
{
  "id": 1,
  "question": "Pourquoi y a-t-il quelque chose plutôt que rien ?",
  "classification": {
    "disciplines": ["metaphysique", "ontologie"],
    "courants": ["presocratiques", "rationalisme"],
    "complexite": "avance",
    "thematiques": ["existence", "realite"]
  }
}
```

## Guide pour ajouter un nouvel axe de classification

### Étape 1 : Définir l'axe dans les métadonnées

Ajouter la définition dans `metadata.axes_classification` des deux fichiers :

```json
// Dans questions-fr.json
"nouveau_axe": {
  "description": "Description de l'axe en français",
  "valeurs": {
    "valeur1": "Libellé français 1",
    "valeur2": "Libellé français 2"
  }
}

// Dans questions-en.json
"nouveau_axe": {
  "description": "Description in English",
  "valeurs": {
    "valeur1": "English label 1",
    "valeur2": "English label 2"
  }
}
```

### Étape 2 : Ajouter le champ aux questions

Pour chaque question, ajouter le nouveau champ dans `classification` :

```json
"classification": {
  "disciplines": [...],
  "courants": [...],
  "complexite": "...",
  "thematiques": [...],
  "nouveau_axe": ["valeur1"]  // ou "valeur1" si mono-valeur
}
```

### Étape 3 : Mettre à jour l'interface utilisateur

Adapter le code JavaScript qui gère le filtrage par étiquette pour prendre en compte le nouvel axe.

## Conventions de nommage

- **Clés** : snake_case, sans accents (ex: `philosophie_politique`)
- **Libellés FR** : Avec accents et majuscules appropriées
- **Libellés EN** : En anglais standard
- **Toutes les clés sont identiques** entre les fichiers FR et EN

## Statistiques de classification

### Répartition par complexité
- Débutant : ~10%
- Intermédiaire : ~60%
- Avancé : ~30%

### Disciplines les plus fréquentes
1. Métaphysique
2. Éthique
3. Épistémologie
4. Philosophie de l'esprit

### Courants les plus représentés
1. Rationalisme
2. Phénoménologie
3. Existentialisme
4. Empirisme

## Migration depuis l'ancienne structure

L'ancienne structure utilisait un format de tags `type:valeur`. La nouvelle structure offre :
- Une meilleure extensibilité
- Le support du multi-tagging natif
- Une séparation claire des axes de classification
- Des métadonnées autodocumentées

## Version

- **Version actuelle** : 2.0
- **Date de migration** : 2026-01-25
