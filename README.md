# 🎓 Kozminski Escape: Polowanie na ECTS

> Dynamiczna, retro-arcade gra przeglądarkowa 2D osadzona w realiach **Akademii Leona Koźmińskiego (ALK)** w Warszawie przy ul. Jagiellońskiej 57/59.

---

## 📖 1. Zasady i fabuła gry

Trwa gorąca sesja egzaminacyjna na Koźmińskim! Wcielasz się w rolę studenta ALK, który musi zamknąć semestr w systemie USOS. Twoim celem jest zebranie **30 punktów ECTS** rozsianych po korytarzach i salach uczelni, unikając nieubłaganego **Profesora Egzaminatora**.

### 🏛️ Lokacje kampusu ALK:
- **Aula A (Parter)** – przestronna aula wykładowa z wąskimi przejściami.
- **Biblioteka** – strefa skupienia, gdzie ukryte są cenne punkty ECTS.
- **Lab Komputerowy** – laboratoria technologiczne pełne wiedzy i power-upów AI.
- **Dziekanat** – strategiczne skrzydło z terminami i dokumentacją.
- **Patio ALK 🌿 (Strefa relaksu)** – centralny punkt uczelni; **regeneracja energii (staminy) studenta zachodzi tu 2x szybciej!**

### 🎒 Przedmioty i power-upy:
| Ikona | Przedmiot | Działanie w grze |
|:---:|:---|:---|
| 💎 | **Kryształ ECTS** | Standardowy (+1 ECTS) lub złoty (+3 ECTS). Cel: zgromadzenie **30 ECTS**, aby zaliczyć semestr z oceną 5.0. |
| ☕ | **Kawa z Patio ALK** | Natychmiast odnawia staminę do 100% i zapewnia **5 sekund turbo-prędkości (+45%)**. |
| 🤖 | **Gemini AI** | Zadaje profesorowi podchwytliwe pytanie akademickie, **paraliżując go na 3.5 sekundy (cyber-freeze ❄️)**. |
| 🪪 | **Legitymacja ALK** | Osobista tarcza ochronna – **absorbuje 1 bezpośrednie uderzenie egzaminatora** i daje 1.8s nietykalności na ucieczkę. |

### 🧐 Przeciwnik – Profesor Egzaminator:
- Inteligentnie śledzi studenta korytarzami kampusu.
- **Przyspiesza z każdym zdobytym przez Ciebie punktem ECTS** (sesja staje się coraz trudniejsza!).
- Wyrzuca komiksowe dymki z autentycznymi tekstami akademickimi (*„A gdzie przypis harwardzki?!”*, *„Ten bilans się nie zamyka!”*, *„USOS właśnie zamknął protokół!”*).
- Złapanie studenta bez aktywnej legitymacji kończy się **Kampanią Wrześniową (warunkiem)**.

---

## 🎮 2. Tabela sterowania

Gra jest w pełni responsywna – dostosowana zarówno do klawiatury fizycznej na komputerach, jak i ekranów dotykowych na smartfonach oraz tabletach.

| Akcja | Sterowanie na komputerze (PC / Mac) | Sterowanie na telefonie (Mobile / Tablet) |
|:---|:---|:---|
| **Ruch w górę** | <kbd>W</kbd> lub <kbd>↑</kbd> | Przycisk wirtualnego D-pada: **▲** |
| **Ruch w dół** | <kbd>S</kbd> lub <kbd>↓</kbd> | Przycisk wirtualnego D-pada: **▼** |
| **Ruch w lewo** | <kbd>A</kbd> lub <kbd>←</kbd> | Przycisk wirtualnego D-pada: **◀** |
| **Ruch w prawo** | <kbd>D</kbd> lub <kbd>→</kbd> | Przycisk wirtualnego D-pada: **▶** |
| **Ruch po skosie** | Kombinacje np. <kbd>W</kbd>+<kbd>D</kbd>, <kbd>S</kbd>+<kbd>A</kbd> | Wciśnięcie dwóch sąsiednich przycisków |
| **Sprint (zużywa staminę)** | <kbd>Shift</kbd> lub <kbd>Spacja</kbd> | Przytrzymanie przycisku **⚡ SPRINT** |
| **Wyciszenie / Włączenie dźwięku** | Kliknięcie ikony głośnika 🔊 / 🔇 w prawym górnym rogu HUD | Dotknięcie ikony głośnika w HUD |
| **Restart po porażce / Nowy semestr** | Kliknięcie przycisku na modalu lub klawisza <kbd>Enter</kbd> | Dotknięcie przycisku na ekranie |

---

## 📂 3. Schemat drzewa plików projektu

Projekt został zbudowany modułowo w czystym standardzie HTML5, CSS3 i Vanilla JavaScript (ES6+):

```text
kozminski-escape/
├── index.html              # Główny szkielet aplikacji: HUD, Canvas (800x540), dymek, modale i D-pad
├── css/
│   └── style.css           # Oficjalne barwy ALK (#002244, #f2a900), szklany HUD, animacje i mobile-first
├── js/
│   ├── audio.js            # Obiekt SoundSystem: proceduralna synteza audio 8-bit przez Web Audio API (0 plików mp3/wav)
│   └── game.js             # Serce gry: mapa kampusu ALK, kolizje wektorowe, AI Egzaminatora, power-upy
├── metadata.json           # Metadane aplikacji Google AI Studio
├── package.json            # Zależności i konfiguracja deweloperska
└── README.md               # Dokumentacja, zasady gry i tabela sterowania
```

---

## 🔊 4. Architektura dźwięku (Web Audio API)

Projekt **nie wymaga żadnych zewnętrznych plików `.mp3` ani `.wav`**. Wszystkie efekty generowane są w locie przez przeglądarkowy obiekt `SoundSystem`:
- `ects` – melodyjny, zręcznościowy dwuton monety (fala trójkątna).
- `coffee` – rosnący sweep częstotliwości (fala piłokształtna).
- `shield` – harmonijny akord dur C-E-G (fala sinusoidalna).
- `freeze` – cyber-glitch staccato (fala prostokątna).
- `hit` – dramatyczny zjazd częstotliwości basu (240 Hz &rarr; 35 Hz).
- `win` – 4-tonowa fanfara triumfu w tonacji C-dur.

---

## 🏫 Autorstwo i klimat
Gra dedykowana społeczności **Akademii Leona Koźmińskiego w Warszawie**.  
*„Zwycięstwo to determinacja, zwinność i zdana sesja w pierwszym terminie!”* 🎓
