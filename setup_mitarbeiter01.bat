@echo off
setlocal enabledelayedexpansion

:: Erstelle das Projektverzeichnis
mkdir mitarbeiter01
cd mitarbeiter01

:: Initialisiere ein neues Next.js-Projekt
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm

:: Kopiere die vorhandenen Konfigurationsdateien
copy ..\README.md .
copy ..\next-env.d.ts .
copy ..\tsconfig.json .
copy ..\tailwind.config.js .
copy ..\tailwind.config.ts .
copy ..\webpack.config.js .
copy ..\postcss.config.mjs .
copy ..\postcss.config.js .

:: Erstelle das public-Verzeichnis und kopiere die HTML-Datei
mkdir public
copy ..\public\mitarbeiterbewertung-kse.html public\

:: Installiere zusätzliche Abhängigkeiten
npm install jspdf

:: Erstelle die Testkomponente
echo import React from 'react';> src\app\test-config.tsx
echo.>> src\app\test-config.tsx
echo const TestConfig: React.FC = () =^> {>> src\app\test-config.tsx
echo   return (>> src\app\test-config.tsx
echo     ^<div className="p-4 bg-blue-500 text-white"^>>> src\app\test-config.tsx
echo       ^<h1 className="text-2xl font-bold"^>Konfigurationstest^</h1^>>> src\app\test-config.tsx
echo       ^<p className="mt-2"^>Wenn Sie diesen Text sehen, funktioniert die grundlegende Konfiguration.^</p^>>> src\app\test-config.tsx
echo     ^</div^>>> src\app\test-config.tsx
echo   );>> src\app\test-config.tsx
echo };>> src\app\test-config.tsx
echo.>> src\app\test-config.tsx
echo export default TestConfig;>> src\app\test-config.tsx

:: Aktualisiere die Hauptseite
echo import TestConfig from './test-config';> src\app\page.tsx
echo.>> src\app\page.tsx
echo export default function Home() {>> src\app\page.tsx
echo   return (>> src\app\page.tsx
echo     ^<main^>>> src\app\page.tsx
echo       ^<TestConfig /^>>> src\app\page.tsx
echo     ^</main^>>> src\app\page.tsx
echo   );>> src\app\page.tsx
echo }>> src\app\page.tsx

echo Setup abgeschlossen. Sie können das Projekt jetzt mit 'npm run dev' starten.
