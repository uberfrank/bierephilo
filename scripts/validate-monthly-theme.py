#!/usr/bin/env python3
"""Validate monthly theme configuration and questions integrity.

Run this after updating the monthly theme to ensure all files are consistent.
Usage: python3 scripts/validate-monthly-theme.py
"""

import json
import sys
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

errors = []


def check(condition, message):
    if not condition:
        errors.append(message)
        return False
    return True


print("=" * 60)
print("VALIDATION DES CHANGEMENTS - Sujet du mois")
print("=" * 60)

# 1. Load and validate game-flow-engine.js
print("\n[1/6] Validation de game-flow-engine.js...")
with open("game-flow-engine.js", "r", encoding="utf-8") as f:
    engine_content = f.read()

# Extract current theme tag
import re
match = re.search(r"tag:\s*'(theme:\w+)'", engine_content)
if not match:
    errors.append("Could not find MONTHLY_THEME tag in game-flow-engine.js")
    print("  ✗ MONTHLY_THEME.tag introuvable")
    sys.exit(1)

current_tag = match.group(1)
theme_key = current_tag.split(":")[1]
print(f"  ✓ MONTHLY_THEME.tag = '{current_tag}'")

# 2. Validate questions-fr.json
print("\n[2/6] Validation de questions-fr.json...")
with open("questions-fr.json", "r", encoding="utf-8") as f:
    data_fr = json.load(f)

if check(data_fr["metadata"]["total_questions"] == len(data_fr["questions"]),
         f"Metadata mismatch FR: {data_fr['metadata']['total_questions']} != {len(data_fr['questions'])}"):
    print(f"  ✓ Metadata total_questions = {data_fr['metadata']['total_questions']}")

ids_fr = [q["id"] for q in data_fr["questions"]]
if check(ids_fr == list(range(1, len(ids_fr) + 1)), "FR: Question IDs are not sequential"):
    print(f"  ✓ IDs séquentiels 1-{ids_fr[-1]}")

new_qs_fr = [q for q in data_fr["questions"] if current_tag in q["tags"]]
print(f"  ✓ {len(new_qs_fr)} questions avec tag {current_tag}")
check(len(new_qs_fr) > 0, f"FR: No questions found with tag {current_tag}")

for q in new_qs_fr:
    tag_prefixes = [t.split(":")[0] for t in q["tags"]]
    for prefix in ["branche", "mouvement", "difficulte", "theme"]:
        check(prefix in tag_prefixes, f"FR: Question {q['id']} missing tag prefix '{prefix}'")
print(f"  ✓ Toutes les questions du thème ont les 4 types de tags")

# 3. Validate questions-en.json
print("\n[3/6] Validation de questions-en.json...")
with open("questions-en.json", "r", encoding="utf-8") as f:
    data_en = json.load(f)

if check(data_en["metadata"]["total_questions"] == len(data_en["questions"]),
         f"Metadata mismatch EN: {data_en['metadata']['total_questions']} != {len(data_en['questions'])}"):
    print(f"  ✓ Metadata total_questions = {data_en['metadata']['total_questions']}")

new_qs_en = [q for q in data_en["questions"] if current_tag in q["tags"]]
print(f"  ✓ {len(new_qs_en)} questions avec tag {current_tag}")

if check(len(data_fr["questions"]) == len(data_en["questions"]),
         f"FR/EN count mismatch: {len(data_fr['questions'])} vs {len(data_en['questions'])}"):
    print(f"  ✓ Parité FR/EN : {len(data_fr['questions'])} questions chacun")

for qf, qe in zip(new_qs_fr, new_qs_en):
    check(qf["tags"] == qe["tags"], f"Tags mismatch for question {qf['id']}")
    check(qf["id"] == qe["id"], f"ID mismatch: FR={qf['id']} EN={qe['id']}")
print(f"  ✓ Tags identiques entre FR et EN pour les questions du thème")

# 4. Validate translations-fr.json
print("\n[4/6] Validation de translations-fr.json...")
with open("translations-fr.json", "r", encoding="utf-8") as f:
    trans_fr = json.load(f)

if check(trans_fr["game"]["monthlyThemeDesc"] != "",
         "FR: monthlyThemeDesc is empty"):
    print(f"  ✓ monthlyThemeDesc = \"{trans_fr['game']['monthlyThemeDesc']}\"")

if check(theme_key in trans_fr["themes"],
         f"FR: themes missing '{theme_key}'"):
    print(f"  ✓ Thème {theme_key} présent : \"{trans_fr['themes'][theme_key]}\"")

# 5. Validate translations-en.json
print("\n[5/6] Validation de translations-en.json...")
with open("translations-en.json", "r", encoding="utf-8") as f:
    trans_en = json.load(f)

if check(trans_en["game"]["monthlyThemeDesc"] != "",
         "EN: monthlyThemeDesc is empty"):
    print(f"  ✓ monthlyThemeDesc = \"{trans_en['game']['monthlyThemeDesc']}\"")

if check(theme_key in trans_en["themes"],
         f"EN: themes missing '{theme_key}'"):
    print(f"  ✓ Thème {theme_key} présent : \"{trans_en['themes'][theme_key]}\"")

# 6. JSON syntax (already validated by json.load)
print("\n[6/6] Validation de la syntaxe JSON...")
print(f"  ✓ Tous les fichiers JSON sont valides")

# Summary
print("\n" + "=" * 60)
if errors:
    print(f"ÉCHEC : {len(errors)} erreur(s) trouvée(s)")
    for e in errors:
        print(f"  ✗ {e}")
    sys.exit(1)
else:
    print("SUCCÈS : Tous les tests passent ✓")
    print(f"  - {len(data_fr['questions'])} questions totales")
    print(f"  - {len(new_qs_fr)} questions pour le thème mensuel ({current_tag})")
    print(f"  - Parité FR/EN respectée")
print("=" * 60)
