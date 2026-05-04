const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const files = [
  "shared/theme.js",
  "shared/store.js",
  "shared/Router.jsx",
  "shared/AuthContext.jsx",
  "shared/UI.jsx",
  "shared/mockData.js",
  "shared/Layout.jsx",
  "user/UserLoginPage.jsx",
  "user/RegisterPage.jsx",
  "user/AdminLoginPage.jsx",
  "user/UserDashboard.jsx",
  "user/AgencyAdAccountsPage.jsx",
  "user/PreVerifiedPage.jsx",
  "user/MediaBuyersPage.jsx",
  "user/ProjectsAndSupport.jsx",
  "user/BalancePage.jsx",
  "admin/AdminDashboard.jsx",
  "admin/AdminMediaBuyersPage.jsx",
  "admin/AdminOtherPages.jsx",
  "App.jsx",
];

let src = `const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;\n`;
src += `function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }\n`;

for (const f of files) {
  const p = path.join(__dirname, f);
  if (!fs.existsSync(p)) {
    console.error("MISSING FILE:", f);
    process.exit(1);
  }
  let code = fs.readFileSync(p, "utf8");
  code = code.replace(/^import\s+.*?from\s+["'].*?["'];?\s*$/gm, "");
  code = code.replace(/^import\s+\{[^}]+\}\s+from\s+["'].*?["'];?\s*$/gm, "");
  code = code.replace(/^export\s+default\s+/gm, "");
  code = code.replace(/^export\s+/gm, "");
  src += `\n/* ===== ${f} ===== */\n${code}\n`;
}

try {
  const result = babel.transformSync(src, {
    presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "classic" }]],
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AdverSolutions</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <style>*,*::before,*::after{box-sizing:border-box}body{margin:0;padding:0}</style>
</head>
<body>
  <div id="root"></div>
  <script>
${result.code}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, "index.html"), html);
  console.log("BUILD OK");
} catch (e) {
  console.error("BUILD ERROR:", e.message);
  process.exit(1);
}
