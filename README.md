# FacturaQR — PWA

Prototip de la PWA "FacturaQR". Instal·lable a mòbil (Android i iOS) directament
des del navegador, sense passar per Google Play ni App Store.

## Desplegar-la (recomanat: Vercel, gratuït)

1. Crea un compte a https://vercel.com (pots entrar amb GitHub).
2. Puja aquesta carpeta a un repositori de GitHub (o arrossega la carpeta
   directament a Vercel amb "Add New Project" → "Deploy").
3. Vercel detecta Vite automàticament. No cal configurar res més.
4. En ~1 minut tens una URL pública (ex: facturaqr.vercel.app).

Alternativa igual de vàlida: Netlify (https://netlify.com), mateix procés.

## Provar-ho en local abans de desplegar

```
npm install
npm run dev
```
Obre la URL que et doni (normalment http://localhost:5173) des del mòbil
(mateixa xarxa WiFi) per provar-ho en un dispositiu real.

## Com s'instal·la un cop desplegada

- **Android (Chrome):** obre la URL → apareix un avís "Afegir a la pantalla
  d'inici" o bé Menú (⋮) → "Instal·lar app".
- **iOS (Safari):** obre la URL → botó de Compartir (□↑) → "Afegir a
  pantalla d'inici". Safari no mostra l'avís automàtic com Android; cal
  fer-ho manualment des del menú de compartir.

Un cop instal·lada, s'obre sense barra de navegador, amb icona pròpia, i
funciona offline gràcies al service worker (`vite-plugin-pwa`).

## Què falta abans que sigui una app real de producció

- Connectar la crida real a l'API de facturació (B2Brouter / verifactuapi.es)
  en lloc de la simulació actual (`generateInvoice` a `src/App.jsx`).
- Connectar Stripe de veritat per a la subscripció (Stripe Checkout).
- Backend propi: base de dades d'usuaris/factures i autenticació.
- Lector de QR real (llibreria `html5-qrcode` o similar) en lloc del
  QR simulat.
- Substituir les icones placeholder de `public/icons/` per un disseny
  de marca definitiu.
