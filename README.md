# El Pollo Loco 🐔🌶️

A browser-based 2D jump-and-run game built with vanilla JavaScript, HTML5 Canvas and CSS. Fight your way through a chicken farm, collect coins and bottles, and defeat the Endboss to win!

*(Deutsche Version weiter unten / German version below)*

---

## 🎮 Play

Open [index.html](index.html) in a browser, or serve the folder with a local web server, then click **Start Game**.

## 📖 Story

Pepe has to cross the desert and fight off an army of angry chickens to reach and defeat the giant Endboss chicken.

## 🕹️ Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Move left | ◀ Arrow key | Left button |
| Move right | ▶ Arrow key | Right button |
| Jump | Space | Up button |
| Throw bottle | D | Bottle button |

- Jump on chickens to defeat them.
- Throw bottles at enemies (collect bottles first).
- Collect coins to increase your score.
- The Endboss spawns after all chickens are defeated. Beat him to win!

## ✨ Features

- Character animations (idle, walk, jump, hurt, dead)
- Two enemy types: normal and small chickens, plus a boss chicken with alert/attack states
- Collectable coins and salsa bottles
- Health, coin and bottle status bars
- Parallax scrolling background with clouds
- Pause, fullscreen and mobile touch controls
- Tutorial overlay and win/lose screens
- Responsive design with portrait-mode video hint

## 🗂️ Project Structure

```
index.html          Main HTML entry point
styles.css           Styling
js/game.js           Game bootstrap & UI logic (pause, fullscreen, overlays)
levels/level1.js      Level 1 configuration
models/               Game classes (Character, Chicken, Endboss, World, Level, etc.)
img/                  Sprites and background assets
audio/                Sound effects and music
video/                Portrait-mode hint video
```

## 🏗️ Architecture

- **`DrawableObject`** – base class for anything rendered on the canvas
- **`MovableObject`** – adds movement, gravity, and collision logic
- **`Character`**, **`Chicken`**, **`SmallChicken`**, **`Endboss`** – game entities
- **`World`** – manages the game loop, rendering and collision checks
- **`Level`** – holds the layout of enemies, clouds, background objects and items
- **`Keyboard`** – tracks keyboard and mobile touch input state

## 🛠️ Tech Stack

- HTML5 / CSS3
- Vanilla JavaScript (ES6 classes, no frameworks or build step)
- HTML5 Canvas API

## 🚀 Getting Started

No build tools or dependencies required.

1. Clone or download this repository.
2. Open `index.html` directly in a browser, **or** run a local server (recommended, avoids some browser file-access restrictions):
   ```bash
   npx serve .
   # or
   python -m http.server
   ```
3. Navigate to the served address and click **Start Game**.

## 📄 License / Imprint

See the in-game **Impressum** section for legal notice details.

---

---

# El Pollo Loco 🐔🌶️ (Deutsch)

Ein browserbasiertes 2D-Jump-and-Run-Spiel, entwickelt mit reinem JavaScript, HTML5 Canvas und CSS. Kämpfe dich durch eine Hühnerfarm, sammle Münzen und Flaschen und besiege den Endboss, um zu gewinnen!

## 🎮 Spielen

Öffne [index.html](index.html) im Browser oder stelle den Ordner über einen lokalen Webserver bereit und klicke dann auf **Start Game**.

## 📖 Story

Pepe muss die Wüste durchqueren und eine Armee wütender Hühner bekämpfen, um den riesigen Endboss-Hahn zu erreichen und zu besiegen.

## 🕹️ Steuerung

| Aktion | Tastatur | Mobil |
|---|---|---|
| Nach links bewegen | ◀ Pfeiltaste | Linker Button |
| Nach rechts bewegen | ▶ Pfeiltaste | Rechter Button |
| Springen | Leertaste | Oberer Button |
| Flasche werfen | D | Flaschen-Button |

- Springe auf Hühner, um sie zu besiegen.
- Wirf Flaschen auf Gegner (vorher Flaschen einsammeln).
- Sammle Münzen, um deinen Punktestand zu erhöhen.
- Der Endboss erscheint, nachdem alle Hühner besiegt wurden. Besiege ihn, um zu gewinnen!

## ✨ Funktionen

- Charakter-Animationen (Ruhe, Laufen, Springen, Verletzt, Tod)
- Zwei Gegnertypen: normale und kleine Hühner sowie ein Boss-Huhn mit Alarm-/Angriffsstatus
- Sammelbare Münzen und Salsa-Flaschen
- Lebens-, Münz- und Flaschen-Statusleisten
- Parallax-Scrolling-Hintergrund mit Wolken
- Pause-, Vollbild- und mobile Touch-Steuerung
- Tutorial-Overlay sowie Gewinn-/Verlierbildschirme
- Responsives Design mit Video-Hinweis im Hochformat

## 🗂️ Projektstruktur

```
index.html          Haupt-HTML-Einstiegspunkt
styles.css           Styling
js/game.js           Spiel-Initialisierung & UI-Logik (Pause, Vollbild, Overlays)
levels/level1.js      Konfiguration von Level 1
models/               Spielklassen (Character, Chicken, Endboss, World, Level, etc.)
img/                  Sprites und Hintergrundgrafiken
audio/                Soundeffekte und Musik
video/                Hinweisvideo für Hochformat
```

## 🏗️ Architektur

- **`DrawableObject`** – Basisklasse für alles, was auf dem Canvas gezeichnet wird
- **`MovableObject`** – ergänzt Bewegung, Schwerkraft und Kollisionslogik
- **`Character`**, **`Chicken`**, **`SmallChicken`**, **`Endboss`** – Spielfiguren
- **`World`** – verwaltet die Spielschleife, das Rendering und Kollisionsprüfungen
- **`Level`** – enthält das Layout von Gegnern, Wolken, Hintergrundobjekten und Items
- **`Keyboard`** – erfasst Tastatur- und mobile Touch-Eingaben

## 🛠️ Technologien

- HTML5 / CSS3
- Reines JavaScript (ES6-Klassen, keine Frameworks oder Build-Prozess)
- HTML5 Canvas API

## 🚀 Erste Schritte

Es sind keine Build-Tools oder Abhängigkeiten erforderlich.

1. Repository klonen oder herunterladen.
2. `index.html` direkt im Browser öffnen **oder** einen lokalen Server starten (empfohlen, um bestimmte Browser-Einschränkungen beim Dateizugriff zu vermeiden):
   ```bash
   npx serve .
   # oder
   python -m http.server
   ```
3. Zur bereitgestellten Adresse navigieren und auf **Start Game** klicken.

## 📄 Lizenz / Impressum

Siehe den **Impressum**-Bereich im Spiel für rechtliche Hinweise.
